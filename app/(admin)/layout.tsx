import { AdminNav } from '@/components/ui/AdminNav'
import { AdminShell } from './AdminShell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNav />
      {/* Mobile: px-4 top/side padding, pb-24 for bottom nav; Desktop: standard p-6 with sidebar offset */}
      <main className="flex-1 md:ml-60 px-4 pt-6 pb-24 md:p-6 md:pb-6 overflow-hidden">
        <AdminShell>{children}</AdminShell>
      </main>
    </div>
  )
}
