import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsClient } from './SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('name, email, role')
    .eq('id', authUser.id)
    .single()

  return (
    <SettingsClient
      user={{
        name: userData?.name ?? '',
        email: userData?.email ?? authUser.email ?? '',
      }}
      isAdmin={userData?.role === 'admin'}
    />
  )
}
