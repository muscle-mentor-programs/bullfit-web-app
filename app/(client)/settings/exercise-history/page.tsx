import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ExerciseHistoryClient } from './ExerciseHistoryClient'

export type SetLog = {
  set_number: number
  weight_lbs: number | null
  reps: number | null
  completed: boolean
}

export type ExerciseInSession = {
  exercise_id: string
  exercise_order: number
  name: string
  muscle_groups: string[]
  sets: SetLog[]
}

export type SessionWithExercises = {
  session_id: string
  completed_at: string
  session_title: string | null
  exercises: ExerciseInSession[]
}

export default async function ExerciseHistoryPage() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  // Fetch last 60 completed sessions with their exercise + set logs
  const { data: sessions } = await supabase
    .from('user_sessions')
    .select(
      `
      id,
      completed_at,
      program_session:program_sessions(title),
      exercise_logs:user_exercise_logs(
        id,
        exercise_id,
        exercise_order,
        exercise:exercises(name, muscle_groups),
        sets:user_set_logs(set_number, weight_lbs, reps, completed)
      )
    `,
    )
    .eq('user_id', authUser.id)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(60)

  // Build session-centric data structure
  const result: SessionWithExercises[] = []

  for (const session of sessions ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ps = (session as any).program_session
    const exercises: ExerciseInSession[] = []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const logs = ((session as any).exercise_logs as any[]) ?? []
    const sortedLogs = [...logs].sort((a, b) => (a.exercise_order ?? 0) - (b.exercise_order ?? 0))

    for (const log of sortedLogs) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ex: any = log.exercise
      if (!ex) continue

      exercises.push({
        exercise_id: log.exercise_id,
        exercise_order: log.exercise_order ?? 0,
        name: ex.name,
        muscle_groups: ex.muscle_groups ?? [],
        sets: ((log.sets as SetLog[]) ?? []).sort((a, b) => a.set_number - b.set_number),
      })
    }

    result.push({
      session_id: session.id,
      completed_at: session.completed_at!,
      session_title: ps?.title ?? null,
      exercises,
    })
  }

  return <ExerciseHistoryClient sessions={result} />
}
