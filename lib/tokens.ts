import { createAdminClient } from './supabase/server'

export async function getBalance(userId: string): Promise<number> {
  const sb = createAdminClient()
  const { data } = await sb.from('profiles').select('token_balance').eq('id', userId).single()
  return data?.token_balance ?? 0
}

export async function deductTokens(
  userId: string,
  amount: number,
  description: string
): Promise<{ ok: boolean; balance?: number; error?: string }> {
  const sb = createAdminClient()
  const { data: profile } = await sb.from('profiles').select('token_balance').eq('id', userId).single()
  if (!profile) return { ok: false, error: 'User not found' }
  if (profile.token_balance < amount) return { ok: false, error: `Not enough tokens. Need ${amount}, have ${profile.token_balance}.` }

  const newBalance = profile.token_balance - amount
  const [u, t] = await Promise.all([
    sb.from('profiles').update({ token_balance: newBalance }).eq('id', userId),
    sb.from('token_transactions').insert({ user_id: userId, amount: -amount, type: 'spend', description }),
  ])
  if (u.error) return { ok: false, error: u.error.message }
  return { ok: true, balance: newBalance }
}

export async function addTokens(
  userId: string,
  amount: number,
  description: string,
  stripePaymentIntent?: string,
  type: 'purchase' | 'bonus' | 'refund' = 'purchase'
): Promise<{ ok: boolean; balance?: number; error?: string }> {
  const sb = createAdminClient()
  const { data: profile } = await sb.from('profiles').select('token_balance').eq('id', userId).single()
  if (!profile) return { ok: false, error: 'User not found' }

  const newBalance = profile.token_balance + amount
  await Promise.all([
    sb.from('profiles').update({ token_balance: newBalance }).eq('id', userId),
    sb.from('token_transactions').insert({ user_id: userId, amount, type, description, stripe_payment_intent: stripePaymentIntent }),
  ])
  return { ok: true, balance: newBalance }
}
