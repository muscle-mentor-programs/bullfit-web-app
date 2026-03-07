import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SessionsClient } from './SessionsClient'

export default async function SessionsPage() {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  // Fetch all user sessions (with program_session info) for the next 90 days + past 30
  const from = new Date()
  from.setDate(from.getDate() - 30)
  const to = new Date()
  to.setDate(to.getDate() + 90)

  const { data: sessions } = await supabase
    .from('user_sessions')
    .select(`
      id,
      scheduled_date,
      started_at,
      completed_at,
      program_session:program_sessions(
        id,
        title,
        description,
        day_of_week,
        program_week:program_weeks(
          week_number,
          program:programs(title)
        )
      )
    `)
    .eq('user_id', authUser.id)
    .gte('scheduled_date', from.toISOString().slice(0, 10))
    .lte('scheduled_date', to.toISOString().slice(0, 10))
    .order('scheduled_date')

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('user_id', authUser.id)
    .maybeSingle()

  const isSubscribed =
    !!subscription &&
    (subscription.status === 'active' || subscription.status === 'trialing') &&
    (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date())

  return <SessionsClient sessions={(sessions ?? []) as any} isSubscribed={isSubscribed} />
}
