import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { TOKEN_PACKS } from '@/types'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { packId } = await req.json()
  const pack = TOKEN_PACKS.find(p => p.id === packId)
  if (!pack) return NextResponse.json({ error: 'Invalid pack' }, { status: 400 })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: `HarNova — ${pack.tokens} tokens (${pack.label})` },
        unit_amount: pack.price_usd * 100,
      },
      quantity: 1,
    }],
    metadata: { userId: user.id, tokens: String(pack.tokens), packId: pack.id },
    success_url: `${baseUrl}/dashboard/billing?success=true`,
    cancel_url: `${baseUrl}/dashboard/billing?canceled=true`,
    customer_email: user.email,
  })

  return NextResponse.json({ url: session.url })
}
