import { scheduleProgram } from '@/lib/scheduling/scheduleProgram'
import { stripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[webhook] Invalid signature:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Use service-role client to write subscriptions table (bypasses RLS)
  const supabase = await createAdminClient()

  switch (event.type) {
    // ── Subscription lifecycle ──────────────────────────────────────────────

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break

      const userId = session.metadata?.supabase_user_id
      if (!userId) break

      const subscriptionId =
        typeof session.subscription === 'string'
          ? session.subscription
          : (session.subscription as Stripe.Subscription | null)?.id
      if (!subscriptionId) break

      const sub = await stripe.subscriptions.retrieve(subscriptionId)
      await upsertSubscription(supabase, userId, sub)
      break
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      let userId = sub.metadata?.supabase_user_id

      if (!userId) {
        // Fallback: look up user by stripe_customer_id
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()
        userId = userData?.id
      }

      if (userId) await upsertSubscription(supabase, userId, sub)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled', updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', sub.id)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      // SDK v17+: subscription moved to invoice.parent.subscription_details.subscription
      const parentSub = invoice.parent?.subscription_details?.subscription
      const subscriptionId =
        typeof parentSub === 'string'
          ? parentSub
          : (parentSub as Stripe.Subscription | undefined)?.id
      if (!subscriptionId) break
      await supabase
        .from('subscriptions')
        .update({ status: 'past_due', updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', subscriptionId)
      break
    }

    default:
      // Unhandled event — acknowledge with 200
      break
  }

  return NextResponse.json({ ok: true })
}

// ── Helper: upsert a subscriptions row from a Stripe Subscription object ────
async function upsertSubscription(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sub: any, // typed as any — Stripe SDK v20 removed current_period_end from types
) {
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
  const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null
  const periodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000).toISOString()
    : null

  await supabase.from('subscriptions').upsert(
    {
      user_id: userId,
      stripe_subscription_id: sub.id,
      stripe_customer_id: customerId,
      status: sub.status,
      trial_end: trialEnd,
      current_period_end: periodEnd,
      cancel_at_period_end: sub.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )
}
