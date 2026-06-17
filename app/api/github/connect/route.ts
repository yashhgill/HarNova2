import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deductTokens } from '@/lib/tokens'
import { TOKEN_COSTS } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { siteId, githubToken, repoName } = await req.json()
    if (!siteId || !githubToken || !repoName) {
      return NextResponse.json({ error: 'siteId, githubToken and repoName are required' }, { status: 400 })
    }

    const { data: site } = await supabase.from('sites').select('*').eq('id', siteId).eq('user_id', user.id).single()
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 })

    const deduction = await deductTokens(user.id, TOKEN_COSTS.github_push, `Pushed "${site.name}" to GitHub`)
    if (!deduction.ok) return NextResponse.json({ error: deduction.error }, { status: 402 })

    const ghHeaders = {
      Authorization: `Bearer ${githubToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    }

    // 1. Get authenticated user
    const meRes = await fetch('https://api.github.com/user', { headers: ghHeaders })
    if (!meRes.ok) return NextResponse.json({ error: 'Invalid GitHub token' }, { status: 401 })
    const me = await meRes.json()

    // 2. Create repo (ignore if already exists)
    const createRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: ghHeaders,
      body: JSON.stringify({ name: repoName, description: `Built with HarNova — ${site.name}`, auto_init: true }),
    })

    if (!createRes.ok && createRes.status !== 422) {
      const err = await createRes.json()
      return NextResponse.json({ error: err.message || 'Failed to create repo' }, { status: 500 })
    }

    // 3. Get default branch ref + latest commit SHA
    const repoFullName = `${me.login}/${repoName}`
    const repoRes = await fetch(`https://api.github.com/repos/${repoFullName}`, { headers: ghHeaders })
    const repo = await repoRes.json()
    const branch = repo.default_branch || 'main'

    const refRes = await fetch(`https://api.github.com/repos/${repoFullName}/git/ref/heads/${branch}`, { headers: ghHeaders })
    const ref = await refRes.json()
    const latestCommitSha = ref.object?.sha

    // 4. Create blob for index.html
    const blobRes = await fetch(`https://api.github.com/repos/${repoFullName}/git/blobs`, {
      method: 'POST', headers: ghHeaders,
      body: JSON.stringify({ content: Buffer.from(site.html).toString('base64'), encoding: 'base64' }),
    })
    const blob = await blobRes.json()

    // 5. Create tree
    const treeRes = await fetch(`https://api.github.com/repos/${repoFullName}/git/trees`, {
      method: 'POST', headers: ghHeaders,
      body: JSON.stringify({
        base_tree: latestCommitSha,
        tree: [{ path: 'index.html', mode: '100644', type: 'blob', sha: blob.sha }],
      }),
    })
    const tree = await treeRes.json()

    // 6. Create commit
    const commitRes = await fetch(`https://api.github.com/repos/${repoFullName}/git/commits`, {
      method: 'POST', headers: ghHeaders,
      body: JSON.stringify({ message: `Deploy ${site.name} via HarNova`, tree: tree.sha, parents: latestCommitSha ? [latestCommitSha] : [] }),
    })
    const commit = await commitRes.json()

    // 7. Update ref
    await fetch(`https://api.github.com/repos/${repoFullName}/git/refs/heads/${branch}`, {
      method: 'PATCH', headers: ghHeaders,
      body: JSON.stringify({ sha: commit.sha }),
    })

    await supabase.from('sites').update({ github_repo: repoFullName }).eq('id', siteId)

    return NextResponse.json({
      repoUrl: `https://github.com/${repoFullName}`,
      newBalance: deduction.balance,
    })
  } catch (err: any) {
    console.error('GitHub push error:', err)
    return NextResponse.json({ error: err.message || 'GitHub push failed' }, { status: 500 })
  }
}
