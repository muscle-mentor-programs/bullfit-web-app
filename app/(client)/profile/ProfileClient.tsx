'use client'

import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import type { SubscriptionStatus } from '@/types'
import {
  Camera, ChevronRight, CreditCard, Dumbbell,
  ExternalLink, Save, Target, TrendingDown,
  UtensilsCrossed, User, Weight,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileClientProps {
  user: { id: string; name: string; email: string; avatar_url: string | null }
  goals: { calories: number; protein_g: number; carbs_g: number; fat_g: number }
  weightHistory: { weight_lbs: number; recorded_date: string }[]
  subscription: {
    status: SubscriptionStatus
    trial_end: string | null
    current_period_end: string | null
    cancel_at_period_end: boolean
  } | null
}

type Panel = 'username' | 'goals' | 'weight' | null

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(dateStr: string) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date().getFullYear() !== y
    ? `${months[m-1]} ${d}, ${y}`
    : `${months[m-1]} ${d}`
}

function NumberInput({ label, value, onChange, unit }: {
  label: string; value: string; onChange: (v: string) => void; unit: string
}) {
  return (
    <div>
      <label className="block text-[11px] font-black tracking-widest text-text-muted mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          className={cn(
            'flex-1 h-11 px-3 rounded-xl border border-border bg-background',
            'text-sm text-text-primary normal-case',
            'focus:outline-none focus:border-[#00BEFF] focus:ring-2 focus:ring-[#00BEFF]/20',
          )}
        />
        <span className="text-xs text-text-muted w-8">{unit}</span>
      </div>
    </div>
  )
}

function ProfileRow({
  icon: Icon, label, value, onClick, accent,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value?: string
  onClick?: () => void
  accent?: string
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 px-4 py-4 bg-background hover:bg-surface transition-colors text-left border-b border-border last:border-0"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: accent ?? 'linear-gradient(135deg, var(--color-surface-2), var(--color-background))' }}
      >
        <Icon size={17} className={accent ? 'text-white' : 'text-text-secondary'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-text-primary">{label}</p>
        {value && <p className="text-xs text-text-muted mt-0.5 truncate normal-case font-normal">{value}</p>}
      </div>
      {onClick && <ChevronRight size={16} className="text-text-muted flex-shrink-0" />}
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProfileClient({ user, goals, weightHistory, subscription }: ProfileClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [panel, setPanel] = useState<Panel>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [portalLoading, setPortalLoading] = useState(false)

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url)
  const [avatarUploading, setAvatarUploading] = useState(false)

  // Username
  const [name, setName] = useState(user.name)

  // Goals
  const [protein, setProtein] = useState(String(goals.protein_g))
  const [carbs, setCarbs]     = useState(String(goals.carbs_g))
  const [fat, setFat]         = useState(String(goals.fat_g))
  const [calories, setCalories] = useState(
    String(Math.round(goals.protein_g * 4 + goals.carbs_g * 4 + goals.fat_g * 9))
  )
  useEffect(() => {
    setCalories(String(Math.round(
      (parseInt(protein)||0)*4 + (parseInt(carbs)||0)*4 + (parseInt(fat)||0)*9
    )))
  }, [protein, carbs, fat])

  // Weight
  const [weightLbs, setWeightLbs] = useState('')
  const latestWeight = weightHistory[0]?.weight_lbs ?? null
  const movingAvg = (() => {
    const r = weightHistory.slice(0,7)
    if (!r.length) return null
    return Math.round(r.reduce((s,w) => s+w.weight_lbs, 0) / r.length * 10) / 10
  })()

  // Subscription helpers
  const isSubscribed = !!subscription &&
    (subscription.status === 'active' || subscription.status === 'trialing') &&
    (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date())

  function subLabel() {
    if (!subscription) return null
    if (subscription.status === 'trialing') {
      if (subscription.trial_end) {
        const d = Math.ceil((new Date(subscription.trial_end).getTime() - Date.now()) / 86400000)
        return `Trial · ${d} day${d!==1?'s':''} left`
      }
      return 'Trial active'
    }
    if (subscription.status === 'active') {
      if (subscription.cancel_at_period_end && subscription.current_period_end)
        return `Cancels ${new Date(subscription.current_period_end).toLocaleDateString()}`
      if (subscription.current_period_end)
        return `Active · Renews ${new Date(subscription.current_period_end).toLocaleDateString()}`
      return 'Active'
    }
    if (subscription.status === 'past_due') return 'Past due — update payment'
    return 'Canceled'
  }

  // Avatar upload
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (!upErr) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`
      await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', user.id)
      setAvatarUrl(publicUrl)
    }
    setAvatarUploading(false)
  }

  // Save handlers
  async function saveName() {
    setSaving(true); setError('')
    const { error: err } = await supabase.from('users').update({ name: name.trim() }).eq('id', user.id)
    setSaving(false)
    if (err) { setError(err.message); return }
    setPanel(null); router.refresh()
  }

  async function saveGoals() {
    setSaving(true); setError('')
    const today = new Date().toISOString().slice(0,10)
    const payload = { calories: parseInt(calories)||0, protein_g: parseInt(protein)||0, carbs_g: parseInt(carbs)||0, fat_g: parseInt(fat)||0, set_by: 'self' as const }
    const { data: existing } = await supabase.from('user_nutrition_goals').select('id').eq('user_id', user.id).eq('effective_date', today).maybeSingle()
    const { error: err } = existing
      ? await supabase.from('user_nutrition_goals').update(payload).eq('user_id', user.id).eq('effective_date', today)
      : await supabase.from('user_nutrition_goals').insert({ user_id: user.id, effective_date: today, ...payload })
    setSaving(false)
    if (err) { setError(err.message); return }
    setPanel(null)
  }

  async function saveWeight() {
    setSaving(true); setError('')
    const today = new Date().toISOString().slice(0,10)
    const { error: err } = await supabase.from('user_metrics').insert({
      user_id: user.id, recorded_date: today, weight_lbs: parseFloat(weightLbs)||null, notes: null,
    })
    setSaving(false)
    if (err) { setError(err.message); return }
    setWeightLbs(''); setPanel(null); router.refresh()
  }

  async function openPortal() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const { url } = await res.json()
      if (url) window.location.href = url
    } finally { setPortalLoading(false) }
  }

  // ── Panel: Username ───────────────────────────────────────────────
  if (panel === 'username') return (
    <div className="flex flex-col min-h-screen bg-background animate-slide-in-right">
      <div className="flex items-center gap-3 px-4 pt-12 pb-6">
        <button onClick={() => setPanel(null)} className="text-text-muted hover:text-text-primary">
          <ChevronRight size={20} className="rotate-180" />
        </button>
        <h1 className="text-xl font-black text-text-primary">Edit Username</h1>
      </div>
      <div className="px-4 space-y-5">
        <div>
          <label className="block text-[11px] font-black tracking-widest text-text-muted mb-2">DISPLAY NAME</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className={cn('w-full h-11 px-3 rounded-xl border border-border bg-background text-sm text-text-primary normal-case focus:outline-none focus:border-[#00BEFF] focus:ring-2 focus:ring-[#00BEFF]/20')}
          />
        </div>
        {error && <p className="text-sm text-[#DC2626] normal-case">{error}</p>}
        <button onClick={saveName} disabled={saving}
          className="flex items-center gap-2 h-11 w-full justify-center rounded-xl text-black text-sm font-black tracking-widest disabled:opacity-50"
          style={{ background: '#00BEFF' }}>
          <Save size={15} />{saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )

  // ── Panel: Nutrition Goals ─────────────────────────────────────────
  if (panel === 'goals') return (
    <div className="flex flex-col min-h-screen bg-background animate-slide-in-right">
      <div className="flex items-center gap-3 px-4 pt-12 pb-6">
        <button onClick={() => setPanel(null)} className="text-text-muted hover:text-text-primary">
          <ChevronRight size={20} className="rotate-180" />
        </button>
        <h1 className="text-xl font-black text-text-primary">Nutrition Goals</h1>
      </div>
      <div className="px-4 space-y-4">
        <NumberInput label="PROTEIN" value={protein} onChange={setProtein} unit="g" />
        <NumberInput label="CARBOHYDRATES" value={carbs} onChange={setCarbs} unit="g" />
        <NumberInput label="FAT" value={fat} onChange={setFat} unit="g" />
        <div>
          <label className="block text-[11px] font-black tracking-widest text-text-muted mb-1.5">DAILY CALORIES</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-11 px-3 rounded-xl border border-border bg-surface-2 flex items-center">
              <span className="text-sm font-black text-text-primary">{calories}</span>
            </div>
            <span className="text-xs text-text-muted w-10">kcal</span>
          </div>
          <p className="text-[10px] text-text-muted mt-1.5 normal-case">Auto-calculated · protein×4 + carbs×4 + fat×9</p>
        </div>
        {error && <p className="text-sm text-[#DC2626] normal-case">{error}</p>}
        <button onClick={saveGoals} disabled={saving}
          className="flex items-center gap-2 h-11 w-full justify-center rounded-xl text-black text-sm font-black tracking-widest disabled:opacity-50 mt-4"
          style={{ background: '#00BEFF' }}>
          <Save size={15} />{saving ? 'Saving...' : 'Save Goals'}
        </button>
      </div>
    </div>
  )

  // ── Panel: Log Weight ─────────────────────────────────────────────
  if (panel === 'weight') return (
    <div className="flex flex-col min-h-screen bg-background animate-slide-in-right">
      <div className="flex items-center gap-3 px-4 pt-12 pb-6">
        <button onClick={() => setPanel(null)} className="text-text-muted hover:text-text-primary">
          <ChevronRight size={20} className="rotate-180" />
        </button>
        <h1 className="text-xl font-black text-text-primary">Log Weight</h1>
      </div>
      {weightHistory.length > 0 && (
        <div className="mx-4 mb-5 rounded-2xl border border-border bg-surface p-4 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown size={12} className="text-text-muted" />
              <p className="text-[10px] font-black tracking-widest text-text-muted">7-DAY AVERAGE</p>
            </div>
            <p className="text-2xl font-black text-text-primary">
              {movingAvg ?? '—'}{movingAvg !== null && <span className="text-sm font-normal text-text-muted ml-1">lbs</span>}
            </p>
          </div>
          <div className="w-px h-14 bg-border flex-shrink-0" />
          <div className="flex-1 min-w-0 text-right">
            <p className="text-[10px] font-black tracking-widest text-text-muted mb-1">LAST LOGGED</p>
            <p className="text-2xl font-black text-text-primary">
              {latestWeight}<span className="text-sm font-normal text-text-muted ml-1">lbs</span>
            </p>
            {weightHistory[0] && <p className="text-[10px] text-text-muted mt-0.5 normal-case">{fmtDate(weightHistory[0].recorded_date)}</p>}
          </div>
        </div>
      )}
      <div className="px-4 space-y-4 mb-6">
        <NumberInput label="TODAY'S WEIGHT" value={weightLbs} onChange={setWeightLbs} unit="lbs" />
        {error && <p className="text-sm text-[#DC2626] normal-case">{error}</p>}
        <button onClick={saveWeight} disabled={saving || !weightLbs}
          className="flex items-center gap-2 h-11 w-full justify-center rounded-xl text-black text-sm font-black tracking-widest disabled:opacity-50"
          style={{ background: '#00BEFF' }}>
          <Save size={15} />{saving ? 'Saving...' : 'Log Weight'}
        </button>
      </div>
      {weightHistory.length > 0 && (
        <div className="px-4 pb-10">
          <p className="text-[10px] font-black tracking-widest text-text-muted mb-3">
            HISTORY ({weightHistory.length} LOG{weightHistory.length!==1?'S':''})
          </p>
          <div className="rounded-2xl border border-border bg-surface overflow-hidden">
            {weightHistory.map((e, i) => (
              <div key={`${e.recorded_date}-${i}`} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
                <p className="text-sm text-text-secondary normal-case">{fmtDate(e.recorded_date)}</p>
                <p className="text-sm font-black text-text-primary">{e.weight_lbs} lbs</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  // ── Main Profile View ─────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-background animate-fade-in pb-24">

      {/* Hero */}
      <div className="page-hero" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="hero-accent-bar" />
        <div className="px-5 pt-4 pb-5 relative">
          <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', color: '#9A9A9A', textTransform: 'uppercase' }}>
            YOUR ACCOUNT
          </p>
          <h1 style={{ fontFamily: 'var(--font-condensed)', fontSize: 40, fontWeight: 900, letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 1.05, color: '#0F0F0F', marginTop: 4 }}>
            PROFILE
          </h1>
        </div>
      </div>

      {/* Avatar card */}
      <div className="mx-4 mt-4 mb-2">
        <div className="rounded-2xl border border-border bg-surface p-4 flex items-center gap-4 shadow-sm">
          {/* Tappable avatar */}
          <button
            onClick={() => fileRef.current?.click()}
            className="relative flex-shrink-0"
            aria-label="Change profile photo"
          >
            <div className="w-[60px] h-[60px] rounded-2xl border border-border overflow-hidden flex items-center justify-center bg-surface-2">
              {avatarUrl
                ? <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                : <span className="text-2xl font-black" style={{ background: 'linear-gradient(135deg,#00BEFF,#CF00FF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                    {(user.name||'B').charAt(0).toUpperCase()}
                  </span>
              }
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-surface"
              style={{ background: '#00BEFF' }}
            >
              {avatarUploading
                ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Camera size={11} className="text-white" />
              }
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

          <div className="flex-1 min-w-0">
            <p className="font-black text-text-primary truncate">{user.name || 'No name set'}</p>
            <p className="text-xs text-text-muted mt-0.5 truncate normal-case">{user.email}</p>
            {isSubscribed && (
              <span className="inline-block mt-1.5 text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full text-black" style={{ background: '#00BEFF' }}>
                BULLFIT MEMBER
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Profile section ─────────────────────────────────── */}
      <p className="px-4 pt-5 pb-2 text-[10px] font-black tracking-widest text-text-muted">PROFILE</p>
      <div className="border-t border-border">
        <ProfileRow icon={User} label="Username" value={user.name || 'Not set'} onClick={() => setPanel('username')} />
      </div>

      {/* ── Fitness section ──────────────────────────────────── */}
      <p className="px-4 pt-5 pb-2 text-[10px] font-black tracking-widest text-text-muted">FITNESS</p>
      <div className="border-t border-border">
        <ProfileRow
          icon={Weight} label="Log Weight"
          value={latestWeight ? `${latestWeight} lbs · ${movingAvg ? `${movingAvg} avg` : 'no avg'}` : 'Not logged yet'}
          onClick={() => setPanel('weight')}
        />
        <ProfileRow
          icon={Target} label="Nutrition Goals"
          value={`${goals.protein_g}g protein · ${goals.carbs_g}g carbs · ${goals.fat_g}g fat`}
          onClick={() => setPanel('goals')}
        />
        <ProfileRow
          icon={UtensilsCrossed} label="Nutrition Tracking"
          value="Daily macros & food log"
          onClick={() => router.push('/nutrition')}
        />
        <ProfileRow
          icon={Dumbbell} label="Exercise History"
          value="View performance & PRs"
          onClick={() => router.push('/settings/exercise-history')}
        />
      </div>

      {/* ── Subscription section ─────────────────────────────── */}
      <p className="px-4 pt-5 pb-2 text-[10px] font-black tracking-widest text-text-muted">SUBSCRIBE & SAVE</p>
      <div className="border-t border-border">
        {isSubscribed ? (
          <button
            onClick={openPortal}
            disabled={portalLoading}
            className="flex w-full items-center gap-4 px-4 py-4 bg-background hover:bg-surface transition-colors text-left border-b border-border"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#00BEFF' }}>
              <CreditCard size={17} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-text-primary">BULLFIT SuppScription</p>
              <p className="text-xs text-text-muted mt-0.5 normal-case font-normal">{subLabel()}</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-[#00BEFF]">
              {portalLoading ? 'Loading...' : 'MANAGE'}
              <ExternalLink size={10} />
            </div>
          </button>
        ) : (
          <button
            onClick={() => router.push('/subscribe')}
            className="flex w-full items-center gap-4 px-4 py-4 bg-background hover:bg-surface transition-colors text-left border-b border-border"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--color-surface-2), var(--color-background))' }}>
              <CreditCard size={17} className="text-text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-text-primary">No active plan</p>
              <p className="text-xs text-text-muted mt-0.5 normal-case font-normal">Subscribe &amp; save on supplements + unlock scanner</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-[#00BEFF]">
              START <ChevronRight size={10} />
            </div>
          </button>
        )}
      </div>
    </div>
  )
}
