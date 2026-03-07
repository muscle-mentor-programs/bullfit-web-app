import { createClient } from '@/lib/supabase/server'
import { ShopClient } from './ShopClient'
import { redirect } from 'next/navigation'

export default async function ShopPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check SuppScription status
  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .single()

  const hasSuppScription = sub?.status === 'active' || sub?.status === 'trialing'

  return <ShopClient hasSuppScription={hasSuppScription} />
}
