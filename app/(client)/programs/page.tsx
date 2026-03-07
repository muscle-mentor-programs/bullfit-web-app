import { createClient } from '@/lib/supabase/server'
import { ProgramsClient } from './ProgramsClient'
import { redirect } from 'next/navigation'

export default async function ProgramsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get subscription status
  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('status, current_period_end')
    .eq('user_id', user.id)
    .single()

  const isSubscribed = sub?.status === 'active' || sub?.status === 'trialing'

  // Get user's active program
  const { data: activeProgram } = await supabase
    .from('user_sessions')
    .select('session_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  return (
    <ProgramsClient
      isSubscribed={isSubscribed}
      activeProgramId={activeProgram?.session_id ?? null}
    />
  )
}
