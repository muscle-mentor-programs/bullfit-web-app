'use client'

import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import { MacroRing } from '@/components/ui/MacroRing'
import { CheckCircle2, ChevronRight, Loader2, Lock, Save, ShoppingBag, Trophy, Zap } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { UserNutritionGoals } from '@/types'

interface DashboardClientProps {
  userName: string
  sessionData: { id: string; title: string; exerciseCount: number } | null
  completedToday: { id: string; title: string; exerciseCount: number } | null
  nutritionGoals: Pick<UserNutritionGoals, 'calories' | 'protein_g' | 'carbs_g' | 'fat_g'>
  todayMacros: { calories: number; protein_g: number; carbs_g: number; fat_g: number }
  isSubscribed: boolean
  latestWeight: number | null
}

const BULL_G = '#00BEFF'
const GOLD_G = 'linear-gradient(135deg, #FFC00E 0%, #FFD600 100%)'

function getGreeting(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// ─── Inline Weight Logger ──────────────────────────────────────────────────────

function WeightWidget({ initialWeight }: { initialWeight: number | null }) {
  const supabase = createClient()
  const router = useRouter()
  const [weightLbs, setWeightLbs] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [currentWeight, setCurrentWeight] = useState<number | null>(initialWeight)

  async function logWeight() {
    const val = parseFloat(weightLbs)
    if (!val || isNaN(val)) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const today = new Date().toISOString().slice(0, 10)
    await supabase.from('user_metrics').insert({
      user_id: user.id,
      recorded_date: today,
      weight_lbs: val,
      notes: null,
    })
    setCurrentWeight(val)
    setWeightLbs('')
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  return (
    <div
      className="rounded-2xl border border-border shadow-md p-5"
      style={{ background: 'var(--color-surface)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="h-0.5 w-3 rounded-full" style={{ background: GOLD_G }} />
        <span className="text-[11px] font-black tracking-widest text-text-secondary">BODY WEIGHT</span>
      </div>

      {currentWeight && (
        <p className="text-3xl font-black text-text-primary mb-3">
          {currentWeight}
          <span className="text-base font-normal text-text-muted ml-1">lbs</span>
        </p>
      )}

      <div className="flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          value={weightLbs}
          onChange={(e) => setWeightLbs(e.target.value)}
          placeholder={currentWeight ? `${currentWeight} lbs` : 'Enter weight (lbs)'}
          className={cn(
            'flex-1 h-10 px-3 rounded-xl border border-border bg-background',
            'text-sm text-text-primary placeholder:text-text-muted',
            'focus:outline-none focus:border-[#00BEFF] focus:ring-2 focus:ring-[#00BEFF]/20',
          )}
          onKeyDown={(e) => { if (e.key === 'Enter') logWeight() }}
        />
        <button
          onClick={logWeight}
          disabled={saving || !weightLbs}
          className={cn(
            'h-10 px-4 rounded-xl text-xs font-black tracking-wider text-black',
            'transition-all active:scale-[0.97] disabled:opacity-40',
          )}
          style={{ background: BULL_G }}
        >
          {saving ? <Loader2 size={13} className="animate-spin text-white" /> : saved ? '✓' : <Save size={13} />}
        </button>
      </div>

      <Link
        href="/settings"
        className="mt-3 flex items-center gap-1.5 text-xs font-black text-[#00BEFF] hover:text-[#44AADF] transition-colors"
      >
        View history <ChevronRight size={13} />
      </Link>
    </div>
  )
}

// ─── Featured Product Banner ──────────────────────────────────────────────────

function FeaturedProductBanner() {
  return (
    <Link
      href="/shop"
      className="block rounded-2xl overflow-hidden border border-white/10"
      style={{ background: 'var(--color-surface)' }}
    >
      <div className="h-0.5 w-full" style={{ background: BULL_G }} />
      <div className="p-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <div className="h-1.5 w-1.5 rounded-full" style={{ background: '#FF0087' }} />
            <span className="text-[9px] font-black tracking-widest text-[#FF0087]">LIMITED OFFER</span>
          </div>
          <p className="text-sm font-black text-text-primary">30% OFF EVERYTHING</p>
          <p className="text-[10px] text-text-muted normal-case">Use code: <span className="text-[#FFD600] font-black">MIKEOHEARN</span></p>
        </div>
        <div
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-black"
          style={{ background: GOLD_G }}
        >
          <ShoppingBag size={13} />
          SHOP
        </div>
      </div>
    </Link>
  )
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export function DashboardClient({
  userName,
  sessionData,
  completedToday,
  nutritionGoals,
  todayMacros,
  isSubscribed,
  latestWeight,
}: DashboardClientProps) {
  const router = useRouter()
  const greeting = getGreeting(new Date().getHours())
  const firstName = userName.split(' ')[0]?.trim() || 'Athlete'

  const lastRefreshRef = useRef<number>(Date.now())
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        const now = Date.now()
        if (now - lastRefreshRef.current > 30_000) {
          lastRefreshRef.current = now
          router.refresh()
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [router])

  return (
    <div className="flex flex-col min-h-screen bg-background pb-6 animate-fade-in">

      {/* ── Dark Hero Header ────────────────────────────────── */}
      <div className="page-hero" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="hero-accent-bar" />

        {/* Cyan glow — top right */}
        <div className="hero-glow" style={{
          width: 240, height: 240, top: -80, right: -60,
          background: 'radial-gradient(circle, rgba(0,190,255,0.20) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }} />
        {/* Pink glow — bottom left */}
        <div className="hero-glow" style={{
          width: 180, height: 180, bottom: 0, left: -50,
          background: 'radial-gradient(circle, rgba(255,0,135,0.12) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }} />

        <div className="px-5 pt-5 pb-9 relative">
          {/* Eyebrow with gradient dash */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{
              width: 16, height: 2, borderRadius: 1,
              background: 'linear-gradient(90deg, #00BEFF, #CF00FF)',
            }} />
            <p style={{
              fontSize: 11, fontWeight: 900, letterSpacing: '0.16em',
              color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
            }}>
              {greeting}
            </p>
          </div>

          {/* Name — gradient text */}
          <h1 style={{
            fontFamily: 'var(--font-condensed)', fontSize: 52, fontWeight: 900,
            letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 1.0,
            background: 'linear-gradient(135deg, #FFFFFF 0%, #33CBFF 55%, #CF00FF 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            {firstName}
          </h1>

          {/* Date */}
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.3)', marginTop: 6, textTransform: 'uppercase',
          }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}
          </p>
        </div>

        {/* Fade to light body */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: 32,
          background: 'linear-gradient(to bottom, transparent, #F5F5F3)', pointerEvents: 'none',
        }} />
      </div>

      <div className="flex flex-col gap-4 px-4">

        {/* ── Featured Product Banner ──────────────────────────────────── */}
        <FeaturedProductBanner />

        {/* ── Subscription unlock ─────────────────────────────────────── */}
        {!isSubscribed && (
          <section
            aria-label="Subscribe to unlock programs"
            className="rounded-2xl overflow-hidden border border-white/10"
            style={{ background: 'linear-gradient(135deg, rgba(0,190,255,0.08), rgba(207,0,255,0.05))' }}
          >
            <div className="h-0.5 w-full" style={{ background: BULL_G }} />
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Lock size={14} className="text-[#00BEFF]" />
                <span className="text-[11px] font-black tracking-widest text-[#00BEFF]">ELITE PROGRAMS</span>
              </div>
              <h2 className="text-lg font-black text-text-primary mb-1">Unlock Full Access</h2>
              <p className="text-xs text-text-muted mb-4 normal-case">
                Get all influencer programs + nutrition tracking tools. Starting from $29.95/mo.
              </p>
              <Link
                href="/subscribe"
                className="flex items-center justify-center gap-2 h-11 w-full rounded-xl text-black text-sm font-black tracking-widest"
                style={{ background: BULL_G }}
              >
                START FREE TRIAL
              </Link>
            </div>
          </section>
        )}

        {/* ── Today's Workout ─────────────────────────────────────────── */}
        {isSubscribed && completedToday ? (
          <section
            aria-label="Workout completed"
            className="rounded-2xl overflow-hidden border border-white/10"
            style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(0,190,255,0.05))' }}
          >
            <div className="h-1 w-full" style={{ background: 'var(--color-surface)' }} />
            <div className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={14} className="text-[#22C55E]" />
                <span className="text-[11px] font-black tracking-widest text-[#22C55E]">TODAY'S WORKOUT</span>
              </div>
              <h2 className="text-xl font-black text-text-primary leading-tight mb-1">
                {completedToday.title.toUpperCase()}
              </h2>
              <p className="text-xs text-text-muted mb-4 normal-case">
                {completedToday.exerciseCount} exercise{completedToday.exerciseCount !== 1 ? 's' : ''} · Completed today
              </p>
              <div className="flex gap-2">
                <div
                  className="flex flex-1 items-center justify-center gap-2 h-12 rounded-xl"
                  style={{ background: 'rgba(34,197,94,0.12)', border: '1.5px solid rgba(34,197,94,0.30)' }}
                >
                  <CheckCircle2 size={16} className="text-[#22C55E]" />
                  <span className="text-sm font-black tracking-widest text-[#22C55E]">DONE</span>
                </div>
                <Link
                  href={`/sessions/${completedToday.id}/log`}
                  className="flex flex-1 items-center justify-center gap-2 h-12 rounded-xl text-black text-sm font-black tracking-widest"
                  style={{ background: BULL_G }}
                >
                  VIEW LOG
                </Link>
              </div>
            </div>
          </section>
        ) : isSubscribed && sessionData ? (
          <section
            aria-label="Today's training"
            className="rounded-2xl overflow-hidden border border-white/10"
            style={{ background: 'var(--color-surface)' }}
          >
            <div className="h-1.5 w-full" style={{ background: BULL_G }} />
            <div className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: BULL_G }}>
                  <Zap size={12} className="text-black" />
                </div>
                <span className="text-[11px] font-black tracking-widest text-[#00BEFF]">TODAY'S WORKOUT</span>
              </div>
              <h2 className="text-xl font-black text-text-primary leading-tight mb-1">
                {sessionData.title.toUpperCase()}
              </h2>
              <p className="text-xs text-text-muted mb-4 normal-case">
                {sessionData.exerciseCount} exercise{sessionData.exerciseCount !== 1 ? 's' : ''}
              </p>
              <Link
                href={`/sessions/${sessionData.id}/active`}
                className="flex items-center justify-center gap-2 h-12 w-full rounded-xl text-black text-sm font-black tracking-widest"
                style={{ background: BULL_G }}
              >
                START WORKOUT
              </Link>
            </div>
          </section>
        ) : isSubscribed ? (
          <section
            aria-label="Rest day"
            className="rounded-2xl border border-border p-5"
            style={{ background: 'var(--color-surface)' }}
          >
            <div className="h-0.5 w-full mb-4 rounded-full" style={{ background: 'linear-gradient(to right, #282828, transparent)' }} />
            <span className="text-[11px] font-black tracking-widest text-text-muted">TODAY'S WORKOUT</span>
            <h2 className="text-xl font-black text-text-primary mt-1 mb-1">REST DAY</h2>
            <p className="text-xs text-text-muted normal-case">Recovery is part of the process.</p>
            <Link
              href="/sessions"
              className="mt-4 flex items-center gap-1.5 text-xs font-black text-[#00BEFF] hover:text-[#44AADF] transition-colors"
            >
              View schedule <ChevronRight size={14} />
            </Link>
          </section>
        ) : (
          /* Programs teaser for non-subscribed */
          <Link
            href="/programs"
            className="block rounded-2xl overflow-hidden border border-border"
            style={{ background: 'var(--color-surface)' }}
          >
            <div className="h-0.5 w-full" style={{ background: GOLD_G }} />
            <div className="p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Trophy size={14} className="text-[#FFD600]" />
                  <span className="text-[11px] font-black tracking-widest text-[#FFD600]">ELITE PROGRAMS</span>
                </div>
                <p className="text-sm font-black text-text-primary">Browse Programs</p>
                <p className="text-[10px] text-text-muted normal-case">Influencer-led + BULLFIT originals</p>
              </div>
              <ChevronRight size={20} className="text-text-muted" />
            </div>
          </Link>
        )}

        {/* ── Today's Nutrition ring ───────────────────────────────────── */}
        <section aria-label="Today's nutrition">
          <div
            className="rounded-2xl border border-border shadow-md p-5"
            style={{ background: 'var(--color-surface)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="h-0.5 w-3 rounded-full" style={{ background: '#00BEFF' }} />
              <span className="text-[11px] font-black tracking-widest text-text-secondary">TODAY'S NUTRITION</span>
            </div>
            <MacroRing
              calories={todayMacros.calories}
              calorieGoal={nutritionGoals.calories}
              protein={todayMacros.protein_g}
              proteinGoal={nutritionGoals.protein_g}
              carbs={todayMacros.carbs_g}
              carbsGoal={nutritionGoals.carbs_g}
              fat={todayMacros.fat_g}
              fatGoal={nutritionGoals.fat_g}
            />
            <Link
              href="/nutrition"
              className="mt-4 flex items-center justify-center gap-1.5 text-xs font-black text-[#00BEFF] hover:text-[#44AADF] transition-colors"
            >
              LOG FOOD <ChevronRight size={13} />
            </Link>
          </div>
        </section>

        {/* ── Weight Logger ────────────────────────────────────────────── */}
        <section aria-label="Body weight">
          <WeightWidget initialWeight={latestWeight} />
        </section>

        {/* ── BULLFIT footer ───────────────────────────────────────────── */}
        <div className="pt-2 pb-4 text-center">
          <p
            className="text-xs font-black tracking-widest"
            style={{
              background: BULL_G,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            BULLFIT
          </p>
          <p className="text-[9px] text-text-muted normal-case mt-0.5">Pharmacist formulated · Third-party tested</p>
        </div>

      </div>
    </div>
  )
}
