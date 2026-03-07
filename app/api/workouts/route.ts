import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/workouts — save a custom client-created workout as a personal program
export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, sessions } = body

  if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  if (!sessions?.length) return NextResponse.json({ error: 'Add at least one session' }, { status: 400 })

  // 1. Create program (owned by admin, but personal / unpublished)
  const { data: program, error: pErr } = await supabase
    .from('programs')
    .insert({
      title: title.trim(),
      description: `Custom workout by user`,
      price_cents: 0,
      duration_weeks: 1,
      cover_image_url: null,
      is_published: false,
    })
    .select()
    .single()

  if (pErr || !program) return NextResponse.json({ error: pErr?.message ?? 'Failed to create' }, { status: 500 })

  // 2. Create single week
  const { data: week, error: wErr } = await supabase
    .from('program_weeks')
    .insert({ program_id: program.id, week_number: 1, title: 'Week 1', description: null })
    .select()
    .single()

  if (wErr || !week) return NextResponse.json({ error: wErr?.message ?? 'Failed to create week' }, { status: 500 })

  // 3. Create sessions + exercises
  for (const session of sessions) {
    const { data: programSession, error: sErr } = await supabase
      .from('program_sessions')
      .insert({
        program_week_id: week.id,
        day_of_week: session.day_of_week,
        title: session.title,
        description: session.notes ?? null,
        session_order: session.day_of_week,
      })
      .select()
      .single()

    if (sErr || !programSession) continue

    const exerciseRows = (session.exercises ?? []).map((ex: {
      exercise_id: string
      order: number
      sets: number
      rep_range_min: number
      rep_range_max: number
      notes: string | null
    }) => ({
      session_id: programSession.id,
      exercise_id: ex.exercise_id,
      exercise_order: ex.order,
      prescribed_sets: ex.sets,
      rep_range_min: ex.rep_range_min,
      rep_range_max: ex.rep_range_max,
      notes: ex.notes ?? null,
      rest_seconds: 90,
    }))

    if (exerciseRows.length > 0) {
      await supabase.from('session_exercises').insert(exerciseRows)
    }
  }

  // 4. Enroll the user into this custom program immediately
  const today = new Date().toISOString().slice(0, 10)
  await supabase.from('user_programs').insert({
    user_id: user.id,
    program_id: program.id,
    stripe_payment_intent_id: null,
    start_date: today,
  })

  return NextResponse.json({ program }, { status: 201 })
}
