const VERCEL_TOKEN = process.env.VERCEL_TOKEN!
const TEAM_ID      = process.env.VERCEL_TEAM_ID || ''

const headers = () => ({
  Authorization: `Bearer ${VERCEL_TOKEN}`,
  'Content-Type': 'application/json',
})

const teamQ = TEAM_ID ? `?teamId=${TEAM_ID}` : ''

export async function createVercelProject(name: string, domain: string): Promise<string> {
  const res = await fetch(`https://api.vercel.com/v9/projects${teamQ}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ name, framework: null }),
  })
  if (!res.ok) throw new Error(await res.text())
  const { id } = await res.json()

  // Add domain alias
  await fetch(`https://api.vercel.com/v9/projects/${id}/domains${teamQ}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ name: domain }),
  })

  return id
}

export async function deployToVercel(
  projectId: string,
  files: Record<string, string>   // filename → content
): Promise<{ url: string; deployId: string }> {
  const payload = {
    name: projectId,
    files: Object.entries(files).map(([file, data]) => ({
      file,
      data,
      encoding: 'utf8',
    })),
    projectId,
    target: 'production',
  }

  const res = await fetch(`https://api.vercel.com/v13/deployments${teamQ}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(payload),
  })

  if (!res.ok) throw new Error(await res.text())
  const data = await res.json()
  return { url: `https://${data.alias?.[0] ?? data.url}`, deployId: data.id }
}

export async function deleteVercelProject(projectId: string): Promise<void> {
  await fetch(`https://api.vercel.com/v9/projects/${projectId}${teamQ}`, {
    method: 'DELETE',
    headers: headers(),
  })
}
