import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProgramPreviewClient } from './ProgramPreviewClient'

export default async function ProgramPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  // Fetch program details
  const { data: program } = await supabase
    .from('programs')
    .select('id, title, description, duration_weeks')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (!program) redirect('/marketplace')

  // Fetch weeks + sessions (with exercise counts)
  const { data: weeksData } = await supabase
    .from('program_weeks')
    .select(`
      week_number,
      sessions:program_sessions(
        id,
        title,
        day_of_week,
        exercise_count:session_exercises(count)
      )
    `)
    .eq('program_id', id)
    .order('week_number', { ascending: true })

  // Check if user has already enrolled
  const { data: userProgram } = await supabase
    .from('user_programs')
    .select('id')
    .eq('user_id', authUser.id)
    .eq('program_id', id)
    .maybeSingle()

  // Check subscription status
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('user_id', authUser.id)
    .maybeSingle()

  const isSubscribed =
    !!subscription &&
    (subscription.status === 'active' || subscription.status === 'trialing') &&
    (!subscription.current_period_end ||
      new Date(subscription.current_period_end) > new Date())

  // Normalise weeks data
  const weeks = (weeksData ?? []).map((w) => ({
    week_number: w.week_number,
    sessions: ((w.sessions as any[]) ?? [])
      .map((s) => ({
        id: s.id,
        title: s.title as string,
        day_of_week: s.day_of_week as number,
        exercise_count:
          Array.isArray(s.exercise_count)
            ? (s.exercise_count[0]?.count ?? 0)
            : (s.exercise_count ?? 0),
      }))
      .sort((a, b) => a.day_of_week - b.day_of_week),
  }))

  return (
    <ProgramPreviewClient
      program={program}
      weeks={weeks}
      isSubscribed={isSubscribed}
      alreadyEnrolled={!!userProgram}
    />
  )
}
