import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LibraryClient } from './LibraryClient'

export default async function LibraryPage() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  // Fetch all published programs
  const { data: programs } = await supabase
    .from('programs')
    .select('id, title, description, duration_weeks, cover_image_url')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  // Fetch user's enrolled program IDs
  const { data: userPrograms } = await supabase
    .from('user_programs')
    .select('program_id')
    .eq('user_id', authUser.id)

  const enrolledIds = new Set((userPrograms ?? []).map((up) => up.program_id))

  // Check subscription status
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, trial_end, current_period_end')
    .eq('user_id', authUser.id)
    .maybeSingle()

  const isSubscribed =
    !!subscription &&
    (subscription.status === 'active' || subscription.status === 'trialing') &&
    (!subscription.current_period_end ||
      new Date(subscription.current_period_end) > new Date())

  const programsWithStatus = (programs ?? []).map((p) => ({
    ...p,
    enrolled: enrolledIds.has(p.id),
  }))

  return <LibraryClient programs={programsWithStatus} isSubscribed={isSubscribed} />
}
