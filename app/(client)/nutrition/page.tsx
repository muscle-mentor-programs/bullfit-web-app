import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NutritionClient } from './NutritionClient'

export default async function NutritionPage() {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const today = new Date().toISOString().slice(0, 10)

  const { data: goalsData } = await supabase
    .from('user_nutrition_goals')
    .select('calories, protein_g, carbs_g, fat_g')
    .eq('user_id', authUser.id)
    .lte('effective_date', today)
    .order('effective_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  const goals = goalsData ?? { calories: 2000, protein_g: 150, carbs_g: 200, fat_g: 65 }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', authUser.id)
    .single()

  // Check SuppScription status — barcode scanner is gated
  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('status')
    .eq('user_id', authUser.id)
    .single()

  const hasSuppScription = sub?.status === 'active' || sub?.status === 'trialing'

  return (
    <NutritionClient
      goals={goals}
      isAdmin={userData?.role === 'admin'}
      hasSuppScription={hasSuppScription}
    />
  )
}
