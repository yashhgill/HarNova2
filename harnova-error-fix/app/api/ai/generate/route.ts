import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { deductTokens, getBalance } from '@/lib/tokens'
import { TOKEN_COSTS } from '@/types'
import { genSubdomain } from '@/lib/utils'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const SYSTEM_PROMPT = `You are an expert full-stack developer building websites for Malaysian SMEs.

Generate a COMPLETE, production-ready, single-file HTML website.

RULES:
- Return ONLY raw HTML. No markdown fences, no explanation, no preamble.
- Self-contained: all CSS in <style>, all JS in <script>. No external build step.
- Mobile-first and fully responsive.
- Load fonts via Google Fonts <link> tags.
- Professional, modern design — not a generic template. Make distinct visual choices.
- Always include: navigation, hero, about/services section, gallery or features, contact/CTA, footer.
- Include a WhatsApp button linking to https://wa.me/60123456789 (placeholder number) unless told otherwise.
- Use https://placehold.co for any images (e.g. https://placehold.co/800x500/png).
- Add tasteful CSS animations/transitions (fade-ins, hover effects).
- Output must start with <!DOCTYPE html> and end with </html>. Nothing else.`

// Maps Anthropic API errors to friendly, customer-facing messages.
// We deliberately don't leak raw API error bodies to the frontend.
function friendlyError(err: any): { message: string; status: number } {
  const status = err?.status ?? err?.response?.status

  if (status === 401) {
    return { message: 'Our AI service is temporarily misconfigured. Our team has been notified — please try again shortly.', status: 503 }
  }
  if (status === 400 && err?.error?.error?.type === 'invalid_request_error' && /credit balance/i.test(err?.error?.error?.message ?? '')) {
    return { message: "We're experiencing high demand right now and our AI provider is temporarily unavailable. Please try again in a few minutes — your tokens have not been charged.", status: 503 }
  }
  if (status === 429) {
    return { message: "We're handling a lot of requests right now. Please try again in about a minute.", status: 429 }
  }
  if (status === 529 || status === 503) {
    return { message: 'Our AI provider is temporarily overloaded. Please try again in a moment.', status: 503 }
  }
  if (status >= 500) {
    return { message: 'Something went wrong on our end while generating your website. Please try again — you have not been charged.', status: 502 }
  }
  return { message: 'We couldn\'t generate your website right now. Please try again — you have not been charged.', status: 500 }
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { prompt, siteType, siteName, regenerate, existingSiteId } = await req.json()

  if (!prompt || prompt.trim().length < 10) {
    return NextResponse.json({ error: 'Please describe your business in more detail.' }, { status: 400 })
  }

  const cost = regenerate ? TOKEN_COSTS.regenerate : TOKEN_COSTS.generate

  // Check balance up front WITHOUT deducting yet — avoids charging for a failed generation.
  const currentBalance = await getBalance(user.id)
  if (currentBalance < cost) {
    return NextResponse.json({ error: `Not enough tokens. You need ${cost}, you have ${currentBalance}.` }, { status: 402 })
  }

  const userPrompt = `Business name: ${siteName || 'My Business'}
Website type: ${siteType || 'SME Business'}
Description: ${prompt}

Build the complete website now.`

  // Call Claude FIRST. Only deduct tokens if this succeeds.
  let html: string
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    html = msg.content.map(b => (b.type === 'text' ? b.text : '')).join('').trim()
    html = html.replace(/^```html\n?/i, '').replace(/\n?```$/i, '').trim()
    if (!html.toLowerCase().startsWith('<!doctype')) html = '<!DOCTYPE html>\n' + html
  } catch (err: any) {
    console.error('Claude API error:', err?.status, err?.message || err)
    const { message, status } = friendlyError(err)
    return NextResponse.json({ error: message }, { status })
  }

  // Generation succeeded — now deduct tokens.
  const deduction = await deductTokens(
    user.id, cost,
    regenerate ? `Regenerated: ${siteName || 'Untitled'}` : `Generated: ${siteName || prompt.slice(0, 40)}`
  )
  if (!deduction.ok) {
    // Extremely rare race condition (balance changed between check and deduct)
    return NextResponse.json({ error: deduction.error }, { status: 402 })
  }

  // Save to DB
  let site
  try {
    if (existingSiteId) {
      const { data } = await supabase
        .from('sites')
        .update({ html, name: siteName })
        .eq('id', existingSiteId)
        .eq('user_id', user.id)
        .select()
        .single()
      site = data
    } else {
      const subdomain = genSubdomain(siteName || 'my-site')
      const { data } = await supabase
        .from('sites')
        .insert({ user_id: user.id, name: siteName || prompt.slice(0, 60), subdomain, html, site_type: siteType || 'landing', status: 'draft' })
        .select()
        .single()
      site = data
    }
  } catch (err: any) {
    console.error('DB save error after successful generation:', err)
    // Website was generated and tokens charged — return the HTML anyway so the customer isn't double-hit.
    return NextResponse.json({
      html,
      siteId: null,
      subdomain: null,
      newBalance: deduction.balance,
      tokensUsed: cost,
      warning: 'Your website was generated but could not be saved. Please copy it now or try saving again.',
    })
  }

  return NextResponse.json({
    html,
    siteId: site?.id,
    subdomain: site?.subdomain,
    newBalance: deduction.balance,
    tokensUsed: cost,
  })
}
