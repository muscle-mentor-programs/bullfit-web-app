import { scheduleProgram } from '@/lib/scheduling/scheduleProgram'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/programs/[id]/enroll
// Subscriber adds a program to their training calendar.
// Accepts optional { start_date: 'YYYY-MM-DD' } in request body.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: programId } = await params

  const supabase = await createClient()

  // 1. Verify authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Check active subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id, status, current_period_end')
    .eq('user_id', user.id)
    .maybeSingle()

  const isSubscribed =
    subscription &&
    (subscription.status === 'active' || subscription.status === 'trialing') &&
    (!subscription.current_period_end ||
      new Date(subscription.current_period_end) > new Date())

  if (!isSubscribed) {
    return NextResponse.json({ error: 'Active subscription required' }, { status: 403 })
  }

  // 3. Verify program exists and is published
  const { data: program } = await supabase
    .from('programs')
    .select('id, title, duration_weeks')
    .eq('id', programId)
    .eq('is_published', true)
    .single()

  if (!program) {
    return NextResponse.json({ error: 'Program not found' }, { status: 404 })
  }

  // 4. Parse optional start_date from request body
  let startDate = new Date().toISOString().slice(0, 10)
  try {
    const body = await req.json()
    if (body?.start_date && /^\d{4}-\d{2}-\d{2}$/.test(body.start_date)) {
      startDate = body.start_date
    }
  } catch { /* no body or invalid JSON — use today */ }

  // 5. Use admin client for inserts (bypasses RLS uniqueness issues)
  const adminSupabase = await createAdminClient()

  // 6. Create user_programs record (allow re-enrollment)
  const { error: upError } = await adminSupabase.from('user_programs').insert({
    user_id: user.id,
    program_id: programId,
    stripe_payment_intent_id: null,
    start_date: startDate,
  })

  if (upError) {
    console.error('[enroll] Failed to create user_program:', upError.message)
    return NextResponse.json({ error: 'Failed to enroll in program' }, { status: 500 })
  }

  // 7. Schedule all sessions onto user's calendar
  await scheduleProgram(adminSupabase, user.id, programId, startDate)

  return NextResponse.json({ success: true })
}

// DELETE /api/programs/[id]/enroll
// Remove a program from the user's calendar.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: programId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminSupabase = await createAdminClient()

  // Find the user_program record
  const { data: userProgram } = await adminSupabase
    .from('user_programs')
    .select('id')
    .eq('user_id', user.id)
    .eq('program_id', programId)
    .maybeSingle()

  if (!userProgram) {
    return NextResponse.json({ error: 'Program not found in your calendar' }, { status: 404 })
  }

  // Delete future uncompleted user_sessions for this program
  const { data: programSessions } = await adminSupabase
    .from('program_sessions')
    .select('id')
    .in(
      'program_week_id',
      (await adminSupabase
        .from('program_weeks')
        .select('id')
        .eq('program_id', programId)
        .then((r) => (r.data ?? []).map((w) => w.id))
      )
    )

  const sessionIds = (programSessions ?? []).map((s) => s.id)
  if (sessionIds.length > 0) {
    await adminSupabase
      .from('user_sessions')
      .delete()
      .eq('user_id', user.id)
      .in('program_session_id', sessionIds)
      .is('completed_at', null)
  }

  // Delete the user_program record
  await adminSupabase.from('user_programs').delete().eq('id', userProgram.id)

  return NextResponse.json({ success: true })
}
