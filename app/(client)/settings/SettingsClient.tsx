'use client'

import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import type { SubscriptionStatus } from '@/types'
import { ChevronRight, CreditCard, Dumbbell, ExternalLink, LogOut, Save, ShieldCheck, Target, TrendingDown, User, Weight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface SubscriptionInfo {
  status: SubscriptionStatus
  trial_end: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
}

interface WeightEntry {
  weight_lbs: number
  recorded_date: string
}

interface SettingsClientProps {
  user: { name: string; email: string; avatar_url: string | null }
  goals: { calories: number; protein_g: number; carbs_g: number; fat_g: number }
  weightHistory: WeightEntry[]
  subscription: SubscriptionInfo | null
  isAdmin?: boolean
}

function SectionHeader({ title }: { title: string }) {
  return (
    <p className="px-4 pt-6 pb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
      {title}
    </p>
  )
}

function SettingRow({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value?: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 px-4 py-4 bg-background hover:bg-surface transition-colors text-left border-b border-border last:border-0"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
        style={{ background: 'linear-gradient(135deg, var(--color-surface-2), var(--color-background))' }}
      >
        <Icon size={17} className="text-text-secondary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {value && <p className="text-xs text-text-muted mt-0.5 truncate">{value}</p>}
      </div>
      {onClick && <ChevronRight size={16} className="text-text-muted flex-shrink-0" />}
    </button>
  )
}

function NumberInput({ label, value, onChange, unit }: { label: string; value: string; onChange: (v: string) => void; unit: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-muted mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'flex-1 h-10 px-3 rounded-xl border border-border bg-background',
            'text-sm text-text-primary',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
          )}
        />
        <span className="text-xs text-text-muted w-6">{unit}</span>
      </div>
    </div>
  )
}

function fmtDate(dateStr: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const parts = dateStr.split('-')
  const m = parseInt(parts[1], 10)
  const d = parseInt(parts[2], 10)
  const y = parseInt(parts[0], 10)
  const thisYear = new Date().getFullYear()
  return y !== thisYear
    ? `${months[m - 1]} ${d}, ${y}`
    : `${months[m - 1]} ${d}`
}

type Panel = 'profile' | 'goals' | 'weight' | null

export function SettingsClient({ user, goals, weightHistory, subscription, isAdmin }: SettingsClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [panel, setPanel] = useState<Panel>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [portalLoading, setPortalLoading] = useState(false)

  const isSubscribed =
    !!subscription &&
    (subscription.status === 'active' || subscription.status === 'trialing') &&
    (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date())

  async function openPortal() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      /* noop */
    } finally {
      setPortalLoading(false)
    }
  }

  function subStatusLabel() {
    if (!subscription) return null
    if (subscription.status === 'trialing') {
      if (subscription.trial_end) {
        const daysLeft = Math.ceil(
          (new Date(subscription.trial_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        )
        return `Trial · ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`
      }
      return 'Trial'
    }
    if (subscription.status === 'active') {
      if (subscription.cancel_at_period_end && subscription.current_period_end) {
        const end = new Date(subscription.current_period_end).toLocaleDateString()
        return `Cancels ${end}`
      }
      if (subscription.current_period_end) {
        const end = new Date(subscription.current_period_end).toLocaleDateString()
        return `Active · Renews ${end}`
      }
      return 'Active'
    }
    if (subscription.status === 'past_due') return 'Past due — update payment'
    return 'Canceled'
  }

  // Profile
  const [name, setName] = useState(user.name)

  // Goals — calories auto-calculated from macros
  const [protein, setProtein] = useState(String(goals.protein_g))
  const [carbs, setCarbs] = useState(String(goals.carbs_g))
  const [fat, setFat] = useState(String(goals.fat_g))
  const [calories, setCalories] = useState(
    String(Math.round(goals.protein_g * 4 + goals.carbs_g * 4 + goals.fat_g * 9)),
  )

  // Auto-calculate calories whenever macros change
  useEffect(() => {
    const cal = Math.round(
      (parseInt(protein) || 0) * 4 +
      (parseInt(carbs) || 0) * 4 +
      (parseInt(fat) || 0) * 9,
    )
    setCalories(String(cal))
  }, [protein, carbs, fat])

  // Weight
  const [weightLbs, setWeightLbs] = useState('')
  const latestWeight = weightHistory[0]?.weight_lbs ?? null
  const movingAvg = (() => {
    const recent = weightHistory.slice(0, 7)
    if (recent.length === 0) return null
    const sum = recent.reduce((s, w) => s + w.weight_lbs, 0)
    return Math.round((sum / recent.length) * 10) / 10
  })()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function saveName() {
    setSaving(true)
    setError('')
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return
    const { error: err } = await supabase.from('users').update({ name: name.trim() }).eq('id', authUser.id)
    setSaving(false)
    if (err) { setError(err.message); return }
    setPanel(null)
    router.refresh()
  }

  async function saveGoals() {
    setSaving(true)
    setError('')
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return
    const today = new Date().toISOString().slice(0, 10)
    const payload = {
      calories: parseInt(calories) || 0,
      protein_g: parseInt(protein) || 0,
      carbs_g: parseInt(carbs) || 0,
      fat_g: parseInt(fat) || 0,
      set_by: 'self' as const,
    }
    // Check whether a row already exists for this user + date
    const { data: existing } = await supabase
      .from('user_nutrition_goals')
      .select('id')
      .eq('user_id', authUser.id)
      .eq('effective_date', today)
      .maybeSingle()
    const { error: err } = existing
      ? await supabase
          .from('user_nutrition_goals')
          .update(payload)
          .eq('user_id', authUser.id)
          .eq('effective_date', today)
      : await supabase
          .from('user_nutrition_goals')
          .insert({ user_id: authUser.id, effective_date: today, ...payload })
    setSaving(false)
    if (err) { setError(err.message); return }
    setPanel(null)
  }

  async function saveWeight() {
    setSaving(true)
    setError('')
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return
    const today = new Date().toISOString().slice(0, 10)
    const { error: err } = await supabase.from('user_metrics').insert({
      user_id: authUser.id,
      recorded_date: today,
      weight_lbs: parseFloat(weightLbs) || null,
      notes: null,
    })
    setSaving(false)
    if (err) { setError(err.message); return }
    setWeightLbs('')
    setPanel(null)
    router.refresh()
  }

  // ─── Panel: Profile ───────────────────────────────────────────────
  if (panel === 'profile') {
    return (
      <div className="flex flex-col min-h-screen bg-background animate-slide-in-right">
        <div className="flex items-center gap-3 px-4 pt-10 pb-6">
          <button onClick={() => setPanel(null)} className="text-text-muted hover:text-text-primary">
            <ChevronRight size={20} className="rotate-180" />
          </button>
          <h1 className="text-xl font-semibold text-text-primary">Edit Profile</h1>
        </div>
        <div className="px-4 space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Display Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(
                'w-full h-11 px-3 rounded-xl border border-border bg-background',
                'text-sm text-text-primary',
                'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
              )}
            />
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <button
            onClick={saveName}
            disabled={saving}
            className="flex items-center gap-2 h-11 w-full justify-center rounded-xl text-white text-sm font-black tracking-widest shadow-primary hover:shadow-md active:scale-[0.98] disabled:opacity-50 transition-all"
            style={{ background: '#00BEFF' }}
          >
            <Save size={15} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    )
  }

  // ─── Panel: Goals ─────────────────────────────────────────────────
  if (panel === 'goals') {
    return (
      <div className="flex flex-col min-h-screen bg-background animate-slide-in-right">
        <div className="flex items-center gap-3 px-4 pt-10 pb-6">
          <button onClick={() => setPanel(null)} className="text-text-muted hover:text-text-primary">
            <ChevronRight size={20} className="rotate-180" />
          </button>
          <h1 className="text-xl font-semibold text-text-primary">Nutrition Goals</h1>
        </div>
        <div className="px-4 space-y-4">
          <NumberInput label="Protein" value={protein} onChange={setProtein} unit="g" />
          <NumberInput label="Carbohydrates" value={carbs} onChange={setCarbs} unit="g" />
          <NumberInput label="Fat" value={fat} onChange={setFat} unit="g" />

          {/* Auto-calculated calories display */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Daily Calories</label>
            <div className="flex items-center gap-2">
              <div className={cn(
                'flex-1 h-10 px-3 rounded-xl border border-border bg-surface-2',
                'flex items-center',
              )}>
                <span className="text-sm font-semibold text-text-primary">{calories}</span>
              </div>
              <span className="text-xs text-text-muted w-10">kcal</span>
            </div>
            <p className="text-[11px] text-text-muted mt-1.5 px-0.5">
              Auto-calculated · protein×4 + carbs×4 + fat×9
            </p>
          </div>

          {error && <p className="text-sm text-error">{error}</p>}
          <button
            onClick={saveGoals}
            disabled={saving}
            className="flex items-center gap-2 h-11 w-full justify-center rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors mt-4"
          >
            <Save size={15} />
            {saving ? 'Saving...' : 'Save Goals'}
          </button>
        </div>
      </div>
    )
  }

  // ─── Panel: Weight ────────────────────────────────────────────────
  if (panel === 'weight') {
    return (
      <div className="flex flex-col min-h-screen bg-background animate-slide-in-right">
        <div className="flex items-center gap-3 px-4 pt-10 pb-6">
          <button onClick={() => setPanel(null)} className="text-text-muted hover:text-text-primary">
            <ChevronRight size={20} className="rotate-180" />
          </button>
          <h1 className="text-xl font-semibold text-text-primary">Log Weight</h1>
        </div>

        {/* Stats row: moving average + last logged */}
        {weightHistory.length > 0 && (
          <div className="mx-4 mb-5 rounded-2xl border border-border bg-surface p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown size={12} className="text-text-muted" />
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                  7-Day Average
                </p>
              </div>
              <p className="text-2xl font-bold text-text-primary">
                {movingAvg ?? '—'}
                {movingAvg !== null && (
                  <span className="text-sm font-normal text-text-muted ml-1">lbs</span>
                )}
              </p>
              <p className="text-[11px] text-text-muted mt-0.5">
                {Math.min(weightHistory.length, 7)} log{Math.min(weightHistory.length, 7) !== 1 ? 's' : ''} averaged
              </p>
            </div>
            <div className="w-px h-14 bg-border flex-shrink-0" />
            <div className="flex-1 min-w-0 text-right">
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
                Last Logged
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {latestWeight}
                <span className="text-sm font-normal text-text-muted ml-1">lbs</span>
              </p>
              {weightHistory[0] && (
                <p className="text-[11px] text-text-muted mt-0.5">{fmtDate(weightHistory[0].recorded_date)}</p>
              )}
            </div>
          </div>
        )}

        {/* Log today */}
        <div className="px-4 space-y-4 mb-6">
          <NumberInput label="Today's Weight (lbs)" value={weightLbs} onChange={setWeightLbs} unit="lbs" />
          {error && <p className="text-sm text-error">{error}</p>}
          <button
            onClick={saveWeight}
            disabled={saving || !weightLbs}
            className="flex items-center gap-2 h-11 w-full justify-center rounded-xl text-white text-sm font-black tracking-widest shadow-primary hover:shadow-md active:scale-[0.98] disabled:opacity-50 transition-all"
            style={{ background: '#00BEFF' }}
          >
            <Save size={15} />
            {saving ? 'Saving...' : 'Log Weight'}
          </button>
        </div>

        {/* Full history */}
        {weightHistory.length > 0 && (
          <div className="px-4 pb-10">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              History ({weightHistory.length} log{weightHistory.length !== 1 ? 's' : ''})
            </p>
            <div className="rounded-2xl border border-border bg-surface overflow-hidden">
              {weightHistory.map((entry, i) => (
                <div
                  key={`${entry.recorded_date}-${i}`}
                  className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0"
                >
                  <p className="text-sm text-text-secondary">{fmtDate(entry.recorded_date)}</p>
                  <p className="text-sm font-semibold text-text-primary">{entry.weight_lbs} lbs</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const HEADER_G = '#00BEFF'

  // ─── Main Settings View ───────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-background animate-fade-in">
      {/* ── BULLFIT Header ─────────────────────────────────────────── */}
      <div className="px-4 pt-12 pb-4">
        <div className="rounded-2xl overflow-hidden shadow-xl border border-white/10" style={{ background: 'var(--color-background)' }}>
          <div className="h-1.5 w-full" style={{ background: HEADER_G }} />
          <div className="px-5 py-5">
            <p className="text-[10px] font-black tracking-widest text-text-muted">BULLFIT</p>
            <h1 className="text-3xl font-black tracking-tight text-text-primary">PROFILE</h1>
          </div>
        </div>
      </div>

      {/* Profile summary */}
      <div className="mx-4 mb-4 rounded-2xl border border-border p-4 flex items-center gap-4 shadow-md" style={{ background: 'var(--color-surface)' }}>
        <div
          className="w-14 h-14 rounded-2xl border border-border flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ background: 'var(--color-surface)' }}
        >
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span
              className="text-2xl font-black leading-none"
              style={{
                background: HEADER_G,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {(user.name || 'B').charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-text-primary truncate">{user.name || 'No name set'}</p>
          <p className="text-xs text-text-muted mt-0.5 truncate normal-case">{user.email}</p>
          {isSubscribed && (
            <span className="inline-block mt-1 text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full text-black"
              style={{ background: HEADER_G }}>
              BULLFIT MEMBER
            </span>
          )}
        </div>
      </div>

      {/* Sections */}
      <div className="border-t border-border">
        <SectionHeader title="Profile" />
        <div className="border-t border-border">
          <SettingRow icon={User} label="Edit Name" value={user.name || 'Not set'} onClick={() => setPanel('profile')} />
        </div>

        <SectionHeader title="Fitness" />
        <div className="border-t border-border">
          <SettingRow
            icon={Target}
            label="Nutrition Goals"
            value={`${goals.protein_g}p · ${goals.carbs_g}c · ${goals.fat_g}f`}
            onClick={() => setPanel('goals')}
          />
          <SettingRow
            icon={Weight}
            label="Log Weight"
            value={latestWeight ? `${latestWeight} lbs · ${movingAvg ? `${movingAvg} lbs avg` : 'no avg yet'}` : 'Not logged'}
            onClick={() => setPanel('weight')}
          />
          <SettingRow
            icon={Dumbbell}
            label="Exercise History"
            value="View your performance & PRs"
            onClick={() => router.push('/settings/exercise-history')}
          />
        </div>

        <SectionHeader title="Subscription" />
        <div className="border-t border-border">
          {isSubscribed ? (
            <div className="flex w-full items-center gap-4 px-4 py-4 bg-background border-b border-border">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                style={{ background: '#00BEFF' }}
              >
                <CreditCard size={17} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">BULLFIT SuppScription</p>
                <p className="text-xs text-text-muted mt-0.5 normal-case">{subStatusLabel()}</p>
              </div>
              <button
                onClick={openPortal}
                disabled={portalLoading}
                className={cn(
                  'flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-light transition-colors',
                  'disabled:opacity-50',
                )}
              >
                {portalLoading ? 'Loading...' : 'Manage'}
                <ExternalLink size={11} />
              </button>
            </div>
          ) : (
            <div className="flex w-full items-center gap-4 px-4 py-4 bg-background border-b border-border">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                style={{ background: 'linear-gradient(135deg, var(--color-surface-2), var(--color-background))' }}
              >
                <CreditCard size={17} className="text-text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">No active plan</p>
                <p className="text-xs text-text-muted mt-0.5">$29.95/mo · 7-day free trial</p>
              </div>
              <button
                onClick={() => router.push('/subscribe')}
                className="text-xs font-semibold text-primary hover:text-primary-light transition-colors"
              >
                Start trial <ChevronRight size={11} className="inline" />
              </button>
            </div>
          )}
        </div>

        <SectionHeader title="Account" />
        <div className="border-t border-border">
          {isAdmin && (
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="flex w-full items-center gap-4 px-4 py-4 bg-background hover:bg-surface transition-colors text-left border-b border-border"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                style={{ background: '#00BEFF' }}
              >
                <ShieldCheck size={17} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">Switch to Admin View</p>
                <p className="text-xs text-text-muted mt-0.5">Manage programs, clients, and subscribers</p>
              </div>
              <ChevronRight size={16} className="text-text-muted flex-shrink-0" />
            </button>
          )}
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-4 px-4 py-4 bg-background hover:bg-surface transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-error/10 border border-error/20 flex items-center justify-center flex-shrink-0">
              <LogOut size={17} className="text-error" />
            </div>
            <span className="text-sm font-medium text-error">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  )
}
