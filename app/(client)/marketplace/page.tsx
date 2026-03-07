import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MarketplaceClient } from './MarketplaceClient'

export default async function MarketplacePage() {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  // Fetch all published programs with week/session data to compute first day of week
  const { data: programs } = await supabase
    .from('programs')
    .select('id, title, description, duration_weeks, program_weeks(week_number, program_sessions(day_of_week))')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  // Fetch user's enrolled/purchased program IDs
  const { data: userPrograms } = await supabase
    .from('user_programs')
    .select('program_id')
    .eq('user_id', authUser.id)

  const enrolledIds = new Set((userPrograms ?? []).map((up) => up.program_id))

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

  const programsWithStatus = (programs ?? []).map((p) => {
    // Find the first day of week from week 1 sessions
    const week1 = (p.program_weeks ?? []).find((w: { week_number: number }) => w.week_number === 1)
    const sessions = (week1 as { program_sessions?: { day_of_week: number }[] } | undefined)?.program_sessions ?? []
    const days = sessions.map((s) => s.day_of_week).filter((d): d is number => d != null)
    const first_day_of_week = days.length > 0 ? Math.min(...days) : 1

    return {
      id: p.id,
      title: p.title,
      description: p.description,
      duration_weeks: p.duration_weeks,
      enrolled: enrolledIds.has(p.id),
      first_day_of_week,
    }
  })

  return <MarketplaceClient programs={programsWithStatus} isSubscribed={isSubscribed} />
}
