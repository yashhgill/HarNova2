import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { siteId, html, name } = await req.json()
  if (!siteId) return NextResponse.json({ error: 'siteId required' }, { status: 400 })

  const updates: Record<string, string> = {}
  if (html) updates.html = html
  if (name) updates.name = name

  const { data, error } = await supabase
    .from('sites').update(updates).eq('id', siteId).eq('user_id', user.id).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ site: data })
}
