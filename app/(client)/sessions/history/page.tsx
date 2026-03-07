import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HistoryClient } from './HistoryClient'

export default async function SessionHistoryPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

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
        program_week:program_weeks(
          week_number,
          program:programs(title)
        )
      )
    `)
    .eq('user_id', authUser.id)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })

  return <HistoryClient sessions={(sessions ?? []) as any} />
}
