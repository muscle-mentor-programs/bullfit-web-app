'use client'

import { cn } from '@/lib/utils/cn'
import { format, parseISO } from 'date-fns'
import { AlertCircle, ArrowLeft, Calendar, CheckCircle2, Clock, Mail, Shield, Star, Unlock, User, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface UserRow {
  id: string
  name: string | null
  email: string
  avatar_url: string | null
  role: string
  created_at: string
}

interface Subscription {
  status: string
  current_period_end: string | null
  cancel_at_period_end: boolean | null
  created_at: string | null
}

interface Stats {
  completedSessions: number
  totalSessions: number
  lastSessionDate: string | null
  firstEnrollDate: string | null
}

interface Props {
  user: UserRow
  subscription: Subscription | null
  stats: Stats
}

const HEADER_G = 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))'

function isActiveSubscriber(sub: Subscription | null): boolean {
  if (!sub) return false
  if (sub.status !== 'active' && sub.status !== 'trialing') return false
  if (sub.current_period_end && new Date(sub.current_period_end) <= new Date()) return false
  return true
}

export function UserDetailClient({ user, subscription, stats }: Props) {
  const router = useRouter()
  const [granting, setGranting] = useState(false)
  const [granted, setGranted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentSub, setCurrentSub] = useState(subscription)

  const initials = (user.name ?? user.email)[0]?.toUpperCase() ?? '?'

  async function handleGrantAccess() {
    setGranting(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/users/${user.id}/grant-access`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to grant access')
      }
      setCurrentSub({
        status: 'active',
        current_period_end: null,
        cancel_at_period_end: false,
        created_at: new Date().toISOString(),
      })
      setGranted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setGranting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header card */}
      <div
        className="rounded-2xl overflow-hidden border border-primary/20 shadow-md relative"
        style={{ background: HEADER_G }}
      >
        <div
          className="absolute -right-6 -top-6 w-28 h-28 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)' }}
        />
        <div className="px-6 py-5 flex items-center gap-4 relative">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white flex-shrink-0"
          >
            <ArrowLeft size={16} />
          </button>

          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-xl border-2 border-white/30 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-md"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name ?? user.email} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-black text-white">{initials}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-black text-white truncate">
              {user.name || 'No name'}
            </h1>
            <p className="text-sm text-white/60 truncate">{user.email}</p>
          </div>

          {/* Role / subscriber badge */}
          {user.role === 'admin' ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 border border-white/30 flex-shrink-0">
              <Shield size={12} className="text-white" />
              <span className="text-[11px] font-black text-white">ADMIN</span>
            </div>
          ) : isActiveSubscriber(currentSub) ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-400/20 border border-green-400/40 flex-shrink-0">
              <Star size={12} className="text-green-300" />
              <span className="text-[11px] font-black text-green-300">SUBSCRIBER</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 flex-shrink-0">
              <User size={12} className="text-white/60" />
              <span className="text-[11px] font-black text-white/60">FREE</span>
            </div>
          )}
        </div>
      </div>

      {/* Profile info */}
      <div
        className="rounded-2xl border border-border overflow-hidden shadow-sm"
        style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
      >
        <div className="px-4 py-3 border-b border-border">
          <p className="text-[10px] font-black tracking-widest text-text-muted">PROFILE</p>
        </div>

        <div className="divide-y divide-border/50">
          <InfoRow icon={Mail} label="Email" value={user.email} />
          <InfoRow icon={Calendar} label="Joined" value={format(parseISO(user.created_at), 'MMMM d, yyyy')} />
          {stats.firstEnrollDate && (
            <InfoRow
              icon={Zap}
              label="First Program"
              value={format(parseISO(stats.firstEnrollDate), 'MMMM d, yyyy')}
            />
          )}
        </div>
      </div>

      {/* Activity stats */}
      <div
        className="rounded-2xl border border-border overflow-hidden shadow-sm"
        style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
      >
        <div className="px-4 py-3 border-b border-border">
          <p className="text-[10px] font-black tracking-widest text-text-muted">ACTIVITY</p>
        </div>

        <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
          <StatBlock
            icon={CheckCircle2}
            value={String(stats.completedSessions)}
            label="Sessions Done"
            accent
          />
          <StatBlock
            icon={Zap}
            value={String(stats.totalSessions)}
            label="Total Scheduled"
          />
        </div>

        {stats.lastSessionDate && (
          <div className="px-4 py-3 flex items-center gap-2">
            <Clock size={13} className="text-text-muted flex-shrink-0" />
            <p className="text-xs text-text-muted">
              Last session:{' '}
              <span className="text-text-primary font-semibold">
                {format(parseISO(stats.lastSessionDate), 'MMM d, yyyy')}
              </span>
            </p>
          </div>
        )}

        {stats.totalSessions === 0 && (
          <div className="px-4 py-4">
            <p className="text-sm text-text-muted italic">No sessions scheduled yet.</p>
          </div>
        )}
      </div>

      {/* Subscription */}
      <div
        className="rounded-2xl border border-border overflow-hidden shadow-sm"
        style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
      >
        <div className="px-4 py-3 border-b border-border">
          <p className="text-[10px] font-black tracking-widest text-text-muted">SUBSCRIPTION</p>
        </div>

        <div className="p-4">
          {/* Current status */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                isActiveSubscriber(currentSub)
                  ? 'bg-success/15 border border-success/20'
                  : 'bg-surface-2 border border-border',
              )}
            >
              {isActiveSubscriber(currentSub) ? (
                <CheckCircle2 size={18} className="text-success" />
              ) : (
                <User size={18} className="text-text-muted" />
              )}
            </div>
            <div>
              <p className="text-sm font-black text-text-primary">
                {isActiveSubscriber(currentSub)
                  ? 'Active Subscriber'
                  : currentSub
                    ? `${currentSub.status.charAt(0).toUpperCase() + currentSub.status.slice(1)}`
                    : 'No Subscription'}
              </p>
              {currentSub?.current_period_end && (
                <p className="text-xs text-text-muted mt-0.5">
                  {currentSub.cancel_at_period_end ? 'Cancels' : 'Renews'}{' '}
                  {format(parseISO(currentSub.current_period_end), 'MMM d, yyyy')}
                </p>
              )}
              {isActiveSubscriber(currentSub) && !currentSub?.current_period_end && (
                <p className="text-xs text-success/70 mt-0.5">Lifetime / Comped access</p>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-red-500" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {/* Grant access button */}
          {!isActiveSubscriber(currentSub) && user.role !== 'admin' && (
            <button
              onClick={handleGrantAccess}
              disabled={granting || granted}
              className={cn(
                'w-full h-11 rounded-2xl flex items-center justify-center gap-2',
                'text-white text-sm font-black tracking-widest',
                'transition-all disabled:opacity-60',
              )}
              style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}
            >
              {granting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  GRANTING…
                </>
              ) : granted ? (
                <>
                  <CheckCircle2 size={16} />
                  ACCESS GRANTED
                </>
              ) : (
                <>
                  <Unlock size={15} />
                  UNLOCK FULL ACCESS
                </>
              )}
            </button>
          )}

          {isActiveSubscriber(currentSub) && (
            <p className="text-xs text-text-muted text-center">This user has full access.</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon size={15} className="text-text-muted flex-shrink-0" />
      <p className="text-xs text-text-muted w-24 flex-shrink-0">{label}</p>
      <p className="text-sm font-semibold text-text-primary flex-1 min-w-0 truncate">{value}</p>
    </div>
  )
}

function StatBlock({
  icon: Icon,
  value,
  label,
  accent = false,
}: {
  icon: React.ElementType
  value: string
  label: string
  accent?: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center py-5 gap-1">
      <Icon size={18} className={accent ? 'text-success' : 'text-text-muted'} />
      <p className={cn('text-2xl font-black', accent ? 'text-success' : 'text-text-primary')}>{value}</p>
      <p className="text-[10px] font-black tracking-widest text-text-muted">{label.toUpperCase()}</p>
    </div>
  )
}
