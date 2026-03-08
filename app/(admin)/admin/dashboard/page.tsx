import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils/cn'
import type { UserProgram, UserSession } from '@/types'
import {
  AlertCircle,
  ArrowRight,
  Layers,
  Plus,
  ShoppingBag,
  Users,
  DollarSign,
  Dumbbell,
} from 'lucide-react'
import Link from 'next/link'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ComponentType<{ size?: number; className?: string }>
  gradient: string
  shadowColor?: string
}

function StatCard({ label, value, icon: Icon, gradient, shadowColor }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border overflow-hidden shadow-md" style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}>
      <div className="p-4 flex flex-col gap-3">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
          style={{ background: gradient, boxShadow: shadowColor }}
        >
          <Icon size={18} className="text-white" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none mb-1.5">{label}</p>
          <p className="text-2xl font-black text-text-primary leading-none truncate">{value}</p>
        </div>
      </div>
      {/* Bottom accent bar */}
      <div className="h-0.5 w-full" style={{ background: gradient }} />
    </div>
  )
}

function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalClients },
    { count: publishedPrograms },
    { data: recentPurchases },
    { data: allUserSessions },
    { data: allClients },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'client'),
    supabase.from('programs').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase
      .from('user_programs')
      .select('id, purchased_at, user_id, program_id, users(name, email, avatar_url), programs(title, price_cents)')
      .order('purchased_at', { ascending: false })
      .limit(10),
    supabase
      .from('user_sessions')
      .select('user_id, completed_at')
      .not('completed_at', 'is', null)
      .gte('completed_at', new Date(Date.now() - 7 * 86400000).toISOString()),
    supabase.from('users').select('id, name, email, avatar_url, user_sessions(completed_at)').eq('role', 'client'),
  ])

  const { data: allPurchases } = await supabase.from('user_programs').select('programs(price_cents)')
  const revenue = (allPurchases ?? []).reduce((sum, up) => {
    const prog = up.programs as unknown as { price_cents: number } | null
    return sum + (prog?.price_cents ?? 0)
  }, 0)

  const sessionsThisWeek = allUserSessions?.length ?? 0
  const activeUserIds = new Set((allUserSessions ?? []).map((s) => s.user_id))
  const inactiveClients = (allClients ?? []).filter((c) => !activeUserIds.has(c.id))

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-md relative" style={{ background: '#0A0A0A' }}>
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(135deg, #00BEFF 0%, #CF00FF 50%, #FF0087 100%)' }} />
        <div className="px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black tracking-widest text-text-muted">BULLFIT ADMIN</p>
            <h1 className="text-2xl font-black text-white">Dashboard</h1>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00BEFF 0%, #CF00FF 50%, #FF0087 100%)' }}
          >
            <span className="text-black font-black text-lg leading-none">B</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Clients"
          value={totalClients ?? 0}
          icon={Users}
          gradient="linear-gradient(135deg, #00BEFF 0%, #CF00FF 50%, #FF0087 100%)"
          shadowColor="var(--shadow-primary)"
        />
        <StatCard
          label="Programs"
          value={publishedPrograms ?? 0}
          icon={Layers}
          gradient="linear-gradient(135deg, var(--color-accent-light), var(--color-accent))"
          shadowColor="0 4px 14px 0 rgb(26 143 168 / 0.35)"
        />
        <StatCard
          label="Revenue"
          value={formatCents(revenue)}
          icon={DollarSign}
          gradient="linear-gradient(135deg, #34d399, var(--color-success))"
          shadowColor="0 4px 14px 0 rgb(26 112 64 / 0.35)"
        />
        <StatCard
          label="Sessions / Week"
          value={sessionsThisWeek}
          icon={Dumbbell}
          gradient="linear-gradient(135deg, #fbbf24, var(--color-warning))"
          shadowColor="0 4px 14px 0 rgb(154 88 16 / 0.35)"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Purchases */}
        <div className="rounded-2xl border border-border overflow-hidden shadow-md" style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00BEFF 0%, #CF00FF 50%, #FF0087 100%)' }}>
                <ShoppingBag size={13} className="text-white" />
              </div>
              <h2 className="text-sm font-black text-text-primary">Recent Purchases</h2>
            </div>
            <Link
              href="/admin/users"
              className="text-xs text-primary hover:text-primary-dark font-bold flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {recentPurchases && recentPurchases.length > 0 ? (
            <div className="divide-y divide-border">
              {recentPurchases.map((purchase) => {
                const user = purchase.users as unknown as { name: string; email: string; avatar_url: string | null } | null
                const program = purchase.programs as unknown as { title: string; price_cents: number } | null
                return (
                  <div key={purchase.id} className="flex items-center justify-between px-5 py-3 hover:bg-surface-2 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      {user?.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0 shadow-sm" />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #00BEFF 0%, #CF00FF 50%, #FF0087 100%)' }}>
                          <span className="text-xs font-black text-white">{user?.name?.charAt(0) ?? '?'}</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-text-primary truncate">{user?.name ?? 'Unknown'}</p>
                        <p className="text-xs text-text-muted truncate">{program?.title ?? 'Unknown Program'}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0 ml-4">
                      <span className="text-sm font-black text-text-primary">{formatCents(program?.price_cents ?? 0)}</span>
                      <span className="text-xs text-text-muted">{timeAgo(purchase.purchased_at)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag size={32} className="text-border mb-3" />
              <p className="text-sm text-text-muted">No purchases yet</p>
            </div>
          )}
        </div>

        {/* Needs Attention */}
        <div className="rounded-2xl border border-border overflow-hidden shadow-md" style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fbbf24, var(--color-warning))' }}>
                <AlertCircle size={13} className="text-white" />
              </div>
              <h2 className="text-sm font-black text-text-primary">Needs Attention</h2>
              <span className="text-xs bg-warning/15 text-warning border border-warning/20 px-2 py-0.5 rounded-full font-bold">
                {inactiveClients.length} inactive
              </span>
            </div>
            <Link
              href="/admin/users"
              className="text-xs text-primary hover:text-primary-dark font-bold flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {inactiveClients.length > 0 ? (
            <div className="divide-y divide-border">
              {inactiveClients.slice(0, 8).map((client) => {
                const sessions = client.user_sessions as { completed_at: string | null }[] | null
                const lastSession = sessions
                  ?.filter((s) => s.completed_at)
                  .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())[0]

                return (
                  <Link
                    key={client.id}
                    href={`/admin/users`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-surface-2 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {client.avatar_url ? (
                        <img src={client.avatar_url} alt={client.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0 shadow-sm" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-black text-text-secondary">{client.name?.charAt(0) ?? '?'}</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-text-primary truncate">{client.name}</p>
                        <p className="text-xs text-text-muted truncate">{client.email}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4 text-right">
                      <span className="text-xs text-text-muted">
                        {lastSession?.completed_at ? `Last: ${timeAgo(lastSession.completed_at)}` : 'No sessions'}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users size={32} className="text-border mb-3" />
              <p className="text-sm text-text-muted">All clients are active this week</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Link
          href="/admin/programs/new"
          className={cn(
            'inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm font-black',
            'text-white shadow-primary transition-all hover:shadow-md active:scale-[0.98]',
          )}
          style={{ background: 'linear-gradient(135deg, #00BEFF 0%, #CF00FF 50%, #FF0087 100%)' }}
        >
          <Plus size={15} />
          Create Program
        </Link>
        <Link
          href="/admin/users"
          className={cn(
            'inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm font-bold',
            'border border-border text-text-primary hover:bg-surface-2 hover:shadow-sm transition-all',
          )}
          style={{ background: 'linear-gradient(to right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
        >
          <Users size={15} />
          View All Users
        </Link>
      </div>
    </div>
  )
}
