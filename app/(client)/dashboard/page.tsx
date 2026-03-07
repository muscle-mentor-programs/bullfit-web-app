import { createClient } from '@/lib/supabase/server'
import { todayStr } from '@/lib/utils/dates'
import { redirect } from 'next/navigation'
import { DashboardClient } from './DashboardClient'
import type { UserNutritionGoals } from '@/types'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  // Fetch full user record for name
  const { data: userData } = await supabase
    .from('users')
    .select('name')
    .eq('id', authUser.id)
    .single()

  const today = todayStr()

  // Fetch today's user_session — both pending and completed
  const [{ data: sessionData }, { data: completedData }] = await Promise.all([
    supabase
      .from('user_sessions')
      .select(
        `
        id,
        program_session:program_sessions(
          title,
          session_exercises(count)
        )
      `
      )
      .eq('user_id', authUser.id)
      .eq('scheduled_date', today)
      .is('completed_at', null)
      .maybeSingle(),
    supabase
      .from('user_sessions')
      .select(
        `
        id,
        completed_at,
        program_session:program_sessions(
          title,
          session_exercises(count)
        )
      `
      )
      .eq('user_id', authUser.id)
      .eq('scheduled_date', today)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  // Fetch today's food log entries for macro totals
  const { data: foodEntries } = await supabase
    .from('food_log_entries')
    .select('calories, protein_g, carbs_g, fat_g')
    .eq('user_id', authUser.id)
    .eq('log_date', today)

  const todayMacros = (foodEntries ?? []).reduce(
    (acc, entry) => ({
      calories: acc.calories + (entry.calories ?? 0),
      protein_g: acc.protein_g + (entry.protein_g ?? 0),
      carbs_g: acc.carbs_g + (entry.carbs_g ?? 0),
      fat_g: acc.fat_g + (entry.fat_g ?? 0),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  )

  // Fetch nutrition goals (most recent effective_date <= today)
  const { data: goalsData } = await supabase
    .from('user_nutrition_goals')
    .select('calories, protein_g, carbs_g, fat_g')
    .eq('user_id', authUser.id)
    .lte('effective_date', today)
    .order('effective_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nutritionGoals = goalsData ?? {
    calories: 2000,
    protein_g: 150,
    carbs_g: 200,
    fat_g: 65,
  }

  // Fetch latest weight entry
  const { data: weightData } = await supabase
    .from('user_metrics')
    .select('weight_lbs, recorded_date')
    .eq('user_id', authUser.id)
    .order('recorded_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  const latestWeight = weightData?.weight_lbs ?? null

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

  // Build session summary
  let todaySession: { id: string; title: string; exerciseCount: number } | null = null
  if (sessionData) {
    const ps = sessionData.program_session as unknown as { title: string; session_exercises: { count: number }[] } | null
    const exerciseCount = ps?.session_exercises?.[0]?.count ?? 0
    todaySession = {
      id: sessionData.id,
      title: ps?.title ?? 'Training Session',
      exerciseCount,
    }
  }

  let completedToday: { id: string; title: string; exerciseCount: number } | null = null
  if (completedData) {
    const ps = completedData.program_session as unknown as { title: string; session_exercises: { count: number }[] } | null
    const exerciseCount = ps?.session_exercises?.[0]?.count ?? 0
    completedToday = {
      id: completedData.id,
      title: ps?.title ?? 'Training Session',
      exerciseCount,
    }
  }

  return (
    <DashboardClient
      userName={userData?.name ?? authUser.email ?? 'there'}
      sessionData={todaySession}
      completedToday={completedToday}
      nutritionGoals={nutritionGoals as UserNutritionGoals}
      todayMacros={todayMacros}
      isSubscribed={isSubscribed}
      latestWeight={latestWeight}
    />
  )
}
