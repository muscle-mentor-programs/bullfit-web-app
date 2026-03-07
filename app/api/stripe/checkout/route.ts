import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/stripe/checkout
// Body: { interval?: 'monthly' | 'yearly' }
// Creates a Stripe Subscription checkout session (7-day free trial).
export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Parse optional interval from body
  let interval: 'monthly' | 'yearly' = 'monthly'
  try {
    const body = await req.json()
    if (body?.interval === 'yearly') interval = 'yearly'
  } catch {
    // No body or invalid JSON — default to monthly
  }

  // Block if already has an active subscription
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('id, status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingSub && (existingSub.status === 'active' || existingSub.status === 'trialing')) {
    return NextResponse.json({ error: 'Already subscribed' }, { status: 409 })
  }

  // Fetch or create Stripe customer
  const { data: userData } = await supabase
    .from('users')
    .select('stripe_customer_id, email, name')
    .eq('id', user.id)
    .single()

  let customerId = userData?.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? userData?.email ?? undefined,
      name: userData?.name ?? undefined,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  const priceId =
    interval === 'yearly'
      ? process.env.STRIPE_SUBSCRIPTION_PRICE_ID_YEARLY
      : process.env.STRIPE_SUBSCRIPTION_PRICE_ID
  if (!priceId) {
    console.error(`[checkout] Stripe price ID not set for interval: ${interval}`)
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 7,
      metadata: { supabase_user_id: user.id },
    },
    metadata: { supabase_user_id: user.id },
    success_url: `${appUrl}/dashboard?subscribed=1`,
    cancel_url: `${appUrl}/subscribe`,
    allow_promotion_codes: true,
  })

  return NextResponse.json({ url: session.url })
}
