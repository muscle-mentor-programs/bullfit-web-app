import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsClient } from './SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const today = new Date().toISOString().slice(0, 10)

  const [{ data: userData }, { data: goalsData }, { data: weightHistory }, { data: subscription }] =
    await Promise.all([
      supabase.from('users').select('name, email, avatar_url, role').eq('id', authUser.id).single(),
      supabase
        .from('user_nutrition_goals')
        .select('calories, protein_g, carbs_g, fat_g')
        .eq('user_id', authUser.id)
        .lte('effective_date', today)
        .order('effective_date', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('user_metrics')
        .select('weight_lbs, recorded_date')
        .eq('user_id', authUser.id)
        .not('weight_lbs', 'is', null)
        .order('recorded_date', { ascending: false })
        .limit(90),
      supabase
        .from('subscriptions')
        .select('status, trial_end, current_period_end, cancel_at_period_end')
        .eq('user_id', authUser.id)
        .maybeSingle(),
    ])

  const goals = goalsData ?? { calories: 2000, protein_g: 150, carbs_g: 200, fat_g: 65 }

  return (
    <SettingsClient
      user={{
        name: userData?.name ?? '',
        email: userData?.email ?? authUser.email ?? '',
        avatar_url: userData?.avatar_url ?? null,
      }}
      goals={goals}
      weightHistory={(weightHistory ?? []) as { weight_lbs: number; recorded_date: string }[]}
      subscription={subscription ?? null}
      isAdmin={userData?.role === 'admin'}
    />
  )
}
