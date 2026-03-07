import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/admin/programs — list all programs (admin only)
export async function GET(_req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: programs, error } = await supabase
    .from('programs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ programs: programs ?? [] })
}

// POST /api/admin/programs — create a full program with weeks, sessions, exercises
export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { title, description, price_cents, duration_weeks, cover_image_url, is_published, weeks } = body

  if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  if (typeof price_cents !== 'number' || price_cents < 0)
    return NextResponse.json({ error: 'Invalid price' }, { status: 400 })

  // 1. Create program
  const { data: program, error: programError } = await supabase
    .from('programs')
    .insert({ title: title.trim(), description: description ?? '', price_cents, duration_weeks, cover_image_url, is_published })
    .select()
    .single()

  if (programError || !program) return NextResponse.json({ error: programError?.message ?? 'Failed to create program' }, { status: 500 })

  // 2. Create weeks, sessions, and session_exercises
  for (const week of (weeks ?? [])) {
    const { data: programWeek, error: weekError } = await supabase
      .from('program_weeks')
      .insert({ program_id: program.id, week_number: week.week_number, title: week.title, description: null })
      .select()
      .single()

    if (weekError || !programWeek) continue

    for (const session of (week.sessions ?? [])) {
      const { data: programSession, error: sessionError } = await supabase
        .from('program_sessions')
        .insert({
          program_week_id: programWeek.id,
          day_of_week: session.day_of_week,
          title: session.title,
          description: session.description ?? null,
          session_order: session.day_of_week,
        })
        .select()
        .single()

      if (sessionError || !programSession) continue

      const exerciseRows = (session.exercises ?? []).map((ex: {
        exercise_id: string
        order: number
        prescribed_sets: number
        rep_range_min: number
        rep_range_max: number
        notes: string | null
        rest_seconds: number
      }) => ({
        session_id: programSession.id,
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

  return NextResponse.json({ program }, { status: 201 })
}
