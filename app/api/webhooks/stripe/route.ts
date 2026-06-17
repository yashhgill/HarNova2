import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { addTokens } from '@/lib/tokens'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    const tokens = parseInt(session.metadata?.tokens || '0', 10)

    if (userId && tokens > 0) {
      await addTokens(userId, tokens, `Purchased ${tokens} tokens`, session.payment_intent as string, 'purchase')
    }
  }

  return NextResponse.json({ received: true })
}
