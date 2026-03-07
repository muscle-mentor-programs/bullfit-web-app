import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogClient } from './LogClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SessionLogPage({ params }: Props) {
  const { id: sessionId } = await params
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  // Fetch session metadata
  const { data: session } = await supabase
    .from('user_sessions')
    .select(`
      id,
      user_id,
      scheduled_date,
      started_at,
      completed_at,
      program_session:program_sessions(
        id,
        title,
        program_week:program_weeks(
          week_number,
          program:programs(title)
        )
      )
    `)
    .eq('id', sessionId)
    .eq('user_id', authUser.id)
    .maybeSingle()

  if (!session) redirect('/sessions/history')

  // Fetch exercise logs with set logs
  // Note: 'notes' is intentionally omitted from the select to avoid PostgREST schema
  // cache errors on freshly-added columns. Notes are loaded/saved client-side via
  // a separate query in LogClient.
  const { data: exerciseLogs, error: exerciseLogsError } = await supabase
    .from('user_exercise_logs')
    .select(`
      id,
      exercise_id,
      exercise_order,
      exercise:exercises(
        id,
        name,
        muscle_groups
      ),
      set_logs:user_set_logs(
        id,
        set_number,
        weight_lbs,
        reps,
        completed,
        logged_at
      )
    `)
    .eq('user_session_id', sessionId)
    .order('exercise_order')

  if (exerciseLogsError) {
    console.error('Exercise logs fetch error:', exerciseLogsError)
  }

  return (
    <LogClient
      session={session as any}
      exerciseLogs={(exerciseLogs ?? []) as any}
    />
  )
}
