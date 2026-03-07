import { createAdminClient, createClient } from '@/lib/supabase/server'
import { addDays } from 'date-fns'
import { NextRequest, NextResponse } from 'next/server'

// ── Auth helper ────────────────────────────────────────────────────────────────
async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') return { supabase, user: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  return { supabase, user, error: null }
}

// ── GET /api/admin/programs/[id] — load full program with weeks/sessions/exercises ──
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { supabase, error } = await requireAdmin()
  if (error) return error

  // Load the program
  const { data: program, error: pErr } = await supabase
    .from('programs')
    .select('*')
    .eq('id', id)
    .single()

  if (pErr || !program) return NextResponse.json({ error: 'Program not found' }, { status: 404 })

  // Load weeks
  const { data: weeks } = await supabase
    .from('program_weeks')
    .select('*')
    .eq('program_id', id)
    .order('week_number')

  // Load all sessions for this program's weeks
  const weekIds = (weeks ?? []).map((w) => w.id)
  const { data: sessions } = weekIds.length
    ? await supabase
        .from('program_sessions')
        .select('*')
        .in('program_week_id', weekIds)
        .order('day_of_week')
    : { data: [] }

  // Load all session exercises for these sessions
  const sessionIds = (sessions ?? []).map((s) => s.id)
  const { data: sessionExercises } = sessionIds.length
    ? await supabase
        .from('session_exercises')
        .select('*, exercise:exercises(id, name, muscle_groups, equipment)')
        .in('session_id', sessionIds)
        .order('exercise_order')
    : { data: [] }

  // Build nested structure
  const weeksWithSessions = (weeks ?? []).map((w) => ({
    ...w,
    sessions: (sessions ?? [])
      .filter((s) => s.program_week_id === w.id)
      .map((s) => ({
        ...s,
        exercises: (sessionExercises ?? []).filter((se) => se.session_id === s.id),
      })),
  }))

  return NextResponse.json({ program, weeks: weeksWithSessions })
}

// ── PUT /api/admin/programs/[id] — smart update preserving session IDs ─────────
// Preserves existing week/session IDs so enrolled users' calendars stay valid.
// - Completed user_sessions are never deleted.
// - New sessions are automatically added to enrolled users' calendars.
// - Removed sessions' uncompleted user_sessions are cleaned up.
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { supabase, error } = await requireAdmin()
  if (error) return error

  const adminSupabase = await createAdminClient()

  const body = await req.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { title, description, price_cents, duration_weeks, cover_image_url, is_published, weeks } = body as any

  if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

  // 1. Update program meta
  const { error: pErr } = await supabase
    .from('programs')
    .update({ title: title.trim(), description: description ?? '', price_cents, duration_weeks, cover_image_url, is_published })
    .eq('id', id)

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })

  // 2. Load enrolled users (user_id + start_date) before touching weeks
  const { data: enrollments } = await adminSupabase
    .from('user_programs')
    .select('user_id, start_date')
    .eq('program_id', id)

  const today = new Date().toISOString().slice(0, 10)

  // 3. Load existing weeks so we can diff them
  const { data: existingWeeks } = await supabase
    .from('program_weeks')
    .select('id, week_number, title')
    .eq('program_id', id)

  const existingWeekMap = new Map(
    (existingWeeks ?? []).map((w) => [w.week_number as number, w.id as string])
  )
  const newWeekNumbers = new Set((weeks ?? []).map((w: { week_number: number }) => w.week_number))

  // 4. Remove weeks no longer in the new structure
  const weeksToDelete = (existingWeeks ?? []).filter((w) => !newWeekNumbers.has(w.week_number))
  for (const oldWeek of weeksToDelete) {
    const { data: oldSessions } = await supabase
      .from('program_sessions')
      .select('id')
      .eq('program_week_id', oldWeek.id)

    const oldSessionIds = (oldSessions ?? []).map((s) => s.id)
    if (oldSessionIds.length > 0) {
      // Delete uncompleted user_sessions referencing these sessions
      await adminSupabase
        .from('user_sessions')
        .delete()
        .in('program_session_id', oldSessionIds)
        .is('completed_at', null)
    }
  }
  if (weeksToDelete.length > 0) {
    await supabase.from('program_weeks').delete().in('id', weeksToDelete.map((w) => w.id))
  }

  // 5. Process each week in the new structure
  for (const week of (weeks ?? [])) {
    let weekId: string

    if (existingWeekMap.has(week.week_number)) {
      // Update existing week title
      weekId = existingWeekMap.get(week.week_number)!
      await supabase
        .from('program_weeks')
        .update({ title: week.title })
        .eq('id', weekId)
    } else {
      // Insert new week
      const { data: newWeek, error: weekErr } = await supabase
        .from('program_weeks')
        .insert({ program_id: id, week_number: week.week_number, title: week.title, description: null })
        .select('id')
        .single()

      if (weekErr || !newWeek) continue
      weekId = newWeek.id
    }

    // Load existing sessions for this week
    const { data: existingSessions } = await supabase
      .from('program_sessions')
      .select('id, day_of_week')
      .eq('program_week_id', weekId)

    const existingSessionMap = new Map(
      (existingSessions ?? []).map((s) => [s.day_of_week as number, s.id as string])
    )
    const newDays = new Set((week.sessions ?? []).map((s: { day_of_week: number }) => s.day_of_week))

    // Remove sessions no longer in this week
    const sessionsToRemove = (existingSessions ?? []).filter((s) => !newDays.has(s.day_of_week))
    for (const oldSession of sessionsToRemove) {
      await adminSupabase
        .from('user_sessions')
        .delete()
        .eq('program_session_id', oldSession.id)
        .is('completed_at', null)
      await supabase.from('program_sessions').delete().eq('id', oldSession.id)
    }

    // Process each session
    for (const session of (week.sessions ?? [])) {
      let sessionId: string

      if (existingSessionMap.has(session.day_of_week)) {
        // Update existing session metadata
        sessionId = existingSessionMap.get(session.day_of_week)!
        await supabase
          .from('program_sessions')
          .update({
            title: session.title,
            description: session.description ?? null,
          })
          .eq('id', sessionId)
      } else {
        // Insert new session
        const { data: newSession, error: sessionErr } = await supabase
          .from('program_sessions')
          .insert({
            program_week_id: weekId,
            day_of_week: session.day_of_week,
            title: session.title,
            description: session.description ?? null,
            session_order: session.day_of_week,
          })
          .select('id')
          .single()

        if (sessionErr || !newSession) continue
        sessionId = newSession.id

        // Schedule this new session for all currently enrolled users
        for (const enrollment of (enrollments ?? [])) {
          const startDate = new Date(enrollment.start_date + 'T12:00:00')
          const dow = startDate.getDay()
          const daysToMonday = dow === 0 ? -6 : 1 - dow
          const monday = addDays(startDate, daysToMonday)
          const weekOffset = (week.week_number - 1) * 7
          const dayOffset = session.day_of_week - 1
          const scheduledDate = addDays(monday, weekOffset + dayOffset).toISOString().slice(0, 10)

          // Only add future sessions
          if (scheduledDate >= today) {
            await adminSupabase.from('user_sessions').insert({
              user_id: enrollment.user_id,
              program_session_id: sessionId,
              scheduled_date: scheduledDate,
            })
          }
        }
      }

      // Always replace session_exercises (no user data depends on these IDs)
      await supabase.from('session_exercises').delete().eq('session_id', sessionId)

      const exerciseRows = (session.exercises ?? []).map((ex: {
        exercise_id: string
        order: number
        prescribed_sets: number
        rep_range_min: number
        rep_range_max: number
        notes: string | null
        rest_seconds: number
      }) => ({
        session_id: sessionId,
        exercise_id: ex.exercise_id,
        exercise_order: ex.order,
        prescribed_sets: ex.prescribed_sets,
        rep_range_min: ex.rep_range_min,
        rep_range_max: ex.rep_range_max,
        notes: ex.notes ?? null,
        rest_seconds: ex.rest_seconds ?? null,
      }))

      if (exerciseRows.length > 0) {
        await supabase.from('session_exercises').insert(exerciseRows)
      }
    }
  }

  return NextResponse.json({ success: true })
}

// ── DELETE /api/admin/programs/[id] — permanently remove a program ────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { supabase, error } = await requireAdmin()
  if (error) return error

  // Delete program (cascade deletes weeks → sessions → session_exercises via FK)
  const { error: delErr } = await supabase.from('programs').delete().eq('id', id)
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
