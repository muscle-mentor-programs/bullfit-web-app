import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserDetailClient } from './UserDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminUserDetailPage({ params }: Props) {
  const { id: userId } = await params
  const supabase = await createClient()

  // Verify admin
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')
  const { data: callerData } = await supabase.from('users').select('role').eq('id', authUser.id).single()
  if (callerData?.role !== 'admin') redirect('/dashboard')

  // Fetch target user
  const { data: targetUser } = await supabase
    .from('users')
    .select('id, name, email, avatar_url, role, created_at')
    .eq('id', userId)
    .maybeSingle()

  if (!targetUser) redirect('/admin/users')

  // Fetch subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, current_period_end, cancel_at_period_end, created_at')
    .eq('user_id', userId)
    .maybeSingle()

  // Fetch session stats
  const { data: allSessions } = await supabase
    .from('user_sessions')
    .select('id, scheduled_date, completed_at')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })

  const completedSessions = (allSessions ?? []).filter((s) => s.completed_at !== null)
  const lastSession = completedSessions[0] ?? null
  const firstEnrollDate = (allSessions ?? []).length > 0
    ? (allSessions ?? []).reduce((earliest, s) => {
        return s.scheduled_date < earliest ? s.scheduled_date : earliest
      }, (allSessions ?? [])[0].scheduled_date)
    : null

  return (
    <UserDetailClient
      user={targetUser as any}
      subscription={subscription as any}
      stats={{
        completedSessions: completedSessions.length,
        totalSessions: (allSessions ?? []).length,
        lastSessionDate: lastSession?.completed_at ?? null,
        firstEnrollDate,
      }}
    />
  )
}
