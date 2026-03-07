import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const VALID_CODES: Record<string, { label: string }> = {
  FREETESTER100: { label: 'Free tester access' },
}

// POST /api/promo/redeem
// Body: { code: string }
// Validates promo code and activates a free subscription for the current user.
export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const code = (body?.code ?? '').trim().toUpperCase()

  if (!code || !VALID_CODES[code]) {
    return NextResponse.json({ error: 'Invalid promo code' }, { status: 400 })
  }

  // Check if already subscribed
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id, status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing && (existing.status === 'active' || existing.status === 'trialing')) {
    return NextResponse.json({ error: 'Already subscribed' }, { status: 409 })
  }

  // Create a synthetic free subscription (no Stripe involvement)
  // stripe_subscription_id uses a deterministic key so re-running is idempotent
  const syntheticSubId = `promo_${code}_${user.id}`

  // current_period_end = 10 years from now
  const periodEnd = new Date()
  periodEnd.setFullYear(periodEnd.getFullYear() + 10)

  const { error: upsertError } = await supabase.from('subscriptions').upsert(
    {
      user_id: user.id,
      stripe_subscription_id: syntheticSubId,
      stripe_customer_id: null,
      status: 'active',
      trial_end: null,
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
    },
    { onConflict: 'user_id' },
  )

  if (upsertError) {
    console.error('[promo/redeem] upsert error:', upsertError)
    return NextResponse.json({ error: 'Failed to activate subscription' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
