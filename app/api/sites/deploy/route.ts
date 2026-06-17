import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deductTokens } from '@/lib/tokens'
import { TOKEN_COSTS } from '@/types'
import { createVercelProject, deployToVercel } from '@/lib/vercel'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { siteId, permanent } = await req.json()
    if (!siteId) return NextResponse.json({ error: 'siteId required' }, { status: 400 })

    const { data: site } = await supabase.from('sites').select('*').eq('id', siteId).eq('user_id', user.id).single()
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 })

    const cost = permanent ? TOKEN_COSTS.deploy_permanent : TOKEN_COSTS.deploy_trial
    const deduction = await deductTokens(user.id, cost, `Deployed "${site.name}" (${permanent ? 'permanent' : '2-day trial'})`)
    if (!deduction.ok) return NextResponse.json({ error: deduction.error }, { status: 402 })

    await supabase.from('sites').update({ status: 'building' }).eq('id', siteId)

    const domain = `${site.subdomain}.${process.env.NEXT_PUBLIC_DEPLOY_DOMAIN || 'harnova.my'}`

    let projectId = site.vercel_project_id
    if (!projectId) {
      projectId = await createVercelProject(site.subdomain, domain)
    }

    const { url } = await deployToVercel(projectId, { 'index.html': site.html })

    const expiresAt = permanent ? null : new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString()

    const { data: updated } = await supabase
      .from('sites')
      .update({
        status: 'deployed',
        deployed_url: url,
        vercel_project_id: projectId,
        deploy_expires_at: expiresAt,
      })
      .eq('id', siteId)
      .select()
      .single()

    return NextResponse.json({
      deployedUrl: url,
      expiresAt,
      newBalance: deduction.balance,
      site: updated,
    })
  } catch (err: any) {
    console.error('Deploy error:', err)
    return NextResponse.json({ error: err.message || 'Deploy failed. Check Vercel API token is configured.' }, { status: 500 })
  }
}
