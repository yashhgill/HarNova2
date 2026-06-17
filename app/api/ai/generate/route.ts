import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { deductTokens } from '@/lib/tokens'
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

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { prompt, siteType, siteName, regenerate, existingSiteId } = await req.json()

    if (!prompt || prompt.trim().length < 10) {
      return NextResponse.json({ error: 'Please describe your business in more detail.' }, { status: 400 })
    }

    const cost = regenerate ? TOKEN_COSTS.regenerate : TOKEN_COSTS.generate

    const deduction = await deductTokens(
      user.id, cost,
      regenerate ? `Regenerated: ${siteName || 'Untitled'}` : `Generated: ${siteName || prompt.slice(0, 40)}`
    )
    if (!deduction.ok) return NextResponse.json({ error: deduction.error }, { status: 402 })

    const userPrompt = `Business name: ${siteName || 'My Business'}
Website type: ${siteType || 'SME Business'}
Description: ${prompt}

Build the complete website now.`

    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    let html = msg.content
      .map(b => (b.type === 'text' ? b.text : ''))
      .join('')
      .trim()

    html = html.replace(/^```html\n?/i, '').replace(/\n?```$/i, '').trim()
    if (!html.toLowerCase().startsWith('<!doctype')) html = '<!DOCTYPE html>\n' + html

    let site
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

    return NextResponse.json({
      html,
      siteId: site?.id,
      subdomain: site?.subdomain,
      newBalance: deduction.balance,
      tokensUsed: cost,
    })
  } catch (err: any) {
    console.error('AI generate error:', err)
    return NextResponse.json({ error: err.message || 'Generation failed' }, { status: 500 })
  }
}
