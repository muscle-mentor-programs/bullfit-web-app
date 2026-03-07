import { createAdminClient, createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/admin/users/[id]/grant-access
 *
 * Grants a user full access by upserting an active subscription
 * with no expiry date (current_period_end = null).
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: targetUserId } = await params

  // Verify caller is admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: callerData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (callerData?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Verify target user exists
  const { data: targetUser } = await supabase
    .from('users')
    .select('id, email, name')
    .eq('id', targetUserId)
    .maybeSingle()
  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Use service-role client to bypass RLS for subscription writes
  const adminClient = await createAdminClient()

  // Check for existing subscription
  const { data: existingSub } = await adminClient
    .from('subscriptions')
    .select('id')
    .eq('user_id', targetUserId)
    .maybeSingle()

  let error: unknown
  if (existingSub) {
    // Update existing subscription
    const { error: updateError } = await adminClient
      .from('subscriptions')
      .update({
        status: 'active',
        current_period_end: null,
        cancel_at_period_end: false,
      })
      .eq('user_id', targetUserId)
    error = updateError
  } else {
    // Insert new subscription (admin-granted, no Stripe subscription)
    const { error: insertError } = await adminClient
      .from('subscriptions')
      .insert({
        user_id: targetUserId,
        stripe_subscription_id: `admin_granted_${targetUserId}`,
        stripe_customer_id: null,
        status: 'active',
        current_period_end: null,
        cancel_at_period_end: false,
      })
    error = insertError
  }

  if (error) {
    console.error('[grant-access] Error:', error)
    return NextResponse.json(
      { error: (error as Error).message ?? 'Failed to grant access' },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true, userId: targetUserId })
}
