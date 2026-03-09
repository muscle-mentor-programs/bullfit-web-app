import { createClient } from '@/lib/supabase/server'
import { Users, User } from 'lucide-react'
import { UsersClient, type UserRow } from './UsersClient'

function isSubscriber(user: UserRow): boolean {
  const status = user.subscriptions?.[0]?.status
  return status === 'active' || status === 'trialing'
}

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from('users')
    .select(`
      id,
      name,
      email,
      avatar_url,
      role,
      created_at,
      subscriptions(status)
    `)
    .order('created_at', { ascending: false })

  const users = (rows ?? []) as unknown as UserRow[]
  const subscriberCount = users.filter(isSubscriber).length

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div
        className="rounded-2xl overflow-hidden border border-primary/20 shadow-md relative"
        style={{ background: '#00BEFF' }}
      >
        <div
          className="absolute -right-6 -top-6 w-28 h-28 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)' }}
        />
        <div className="flex items-center justify-between px-6 py-5 relative">
          <div>
            <h1 className="text-xl font-bold text-white">Users</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {users.length} account{users.length !== 1 ? 's' : ''} · {subscriberCount} subscriber{subscriberCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div
            className="flex items-center gap-1.5 rounded-xl px-4 py-2"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <Users size={16} className="text-white" />
            <span className="text-2xl font-black text-white">{users.length}</span>
          </div>
        </div>
      </div>

      {/* List */}
      {users.length > 0 ? (
        <UsersClient users={users} />
      ) : (
        <div
          className="flex flex-col items-center justify-center py-24 rounded-2xl border border-border text-center shadow-md"
          style={{ background: 'linear-gradient(135deg, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-md"
            style={{ background: 'linear-gradient(135deg, var(--color-surface-2), var(--color-background))' }}
          >
            <User size={28} className="text-text-muted" />
          </div>
          <h2 className="text-base font-black text-text-primary mb-1">No users yet</h2>
          <p className="text-sm text-text-muted max-w-xs">
            Users will appear here once they create an account.
          </p>
        </div>
      )}
    </div>
  )
}
