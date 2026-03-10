'use client'

import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import {
  CheckCircle2, ChevronRight, Flame, Loader2,
  Save, ShoppingBag, Tag, Trophy, Zap,
} from 'lucide-react'
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

const BULL_G   = '#00BEFF'
const GRAD_3   = 'linear-gradient(135deg, #00BEFF 0%, #CF00FF 50%, #FF0087 100%)'
const GOLD_G   = 'linear-gradient(135deg, #FFC00E 0%, #FFD600 100%)'

// ─── Card shell — shared wrapper with big lift shadow ──────────────────────────
function Card({ children, className, style }: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={cn('rounded-3xl overflow-hidden', className)}
      style={{
        boxShadow: [
          '0 8px 32px rgba(0,0,0,0.10)',
          '0 3px 10px rgba(0,0,0,0.07)',
          '0 1px 3px rgba(0,0,0,0.05)',
          'inset 0 1px 0 rgba(255,255,255,0.7)',
        ].join(','),
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function getGreeting(hour: number): string {
  if (hour < 12) return 'GOOD MORNING'
  if (hour < 17) return 'GOOD AFTERNOON'
  return 'GOOD EVENING'
}

// ─── Promo Banner ─────────────────────────────────────────────────────────────

function FeaturedProductBanner() {
  return (
    <Link href="/shop" className="block">
      <Card>
        {/* Dark mini-hero */}
        <div
          className="relative overflow-hidden"
          style={{
            height: 76,
            background: 'linear-gradient(135deg, #0A0A0A 0%, #141414 100%)',
          }}
        >
          {/* Glow blobs */}
          <div style={{
            position: 'absolute', width: 160, height: 160, top: -60, right: -30, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,0,135,0.45) 0%, transparent 65%)',
            filter: 'blur(35px)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', width: 120, height: 120, bottom: -40, left: -20, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(207,0,255,0.30) 0%, transparent 65%)',
            filter: 'blur(30px)', pointerEvents: 'none',
          }} />

          <div className="absolute inset-0 flex items-center px-4 justify-between">
            <div className="flex items-center gap-3">
              {/* Pulsing dot */}
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: '#FF0087',
                boxShadow: '0 0 8px rgba(255,0,135,0.8)',
              }} />
              <div>
                <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.45)' }}>
                  LIMITED OFFER
                </p>
                <p style={{ fontSize: 16, fontWeight: 900, letterSpacing: '0.04em', color: '#FFFFFF' }}>
                  30% OFF EVERYTHING
                </p>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.40)', textAlign: 'right' }}>
                USE CODE
              </div>
              <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.08em', color: '#FFD600',
                textShadow: '0 0 12px rgba(255,214,0,0.6)' }}>
                MIKEOHEARN
              </div>
            </div>
          </div>
        </div>

        {/* Light CTA strip */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ background: 'var(--color-surface)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Tag size={11} style={{ color: '#FF0087' }} />
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', color: 'var(--color-text-secondary)' }}>
              PHARMACIST-FORMULATED SUPPS
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-black text-[10px] font-black tracking-widest"
            style={{ background: GOLD_G, boxShadow: '0 3px 10px rgba(255,214,0,0.35)' }}>
            <ShoppingBag size={11} />
            SHOP
          </div>
        </div>
      </Card>
    </Link>
  )
}

// ─── Nutrition Card ───────────────────────────────────────────────────────────

function NutritionCard({
  todayMacros,
  nutritionGoals,
}: {
  todayMacros: DashboardClientProps['todayMacros']
  nutritionGoals: DashboardClientProps['nutritionGoals']
}) {
  const calPct = Math.min((todayMacros.calories / Math.max(nutritionGoals.calories, 1)) * 100, 100)
  const over   = todayMacros.calories > nutritionGoals.calories

  const macros = [
    { label: 'PROTEIN', value: todayMacros.protein_g,  goal: nutritionGoals.protein_g,  color: '#4A9EFF' },
    { label: 'CARBS',   value: todayMacros.carbs_g,    goal: nutritionGoals.carbs_g,    color: '#00BEFF' },
    { label: 'FAT',     value: todayMacros.fat_g,       goal: nutritionGoals.fat_g,      color: '#CF00FF' },
  ]

  return (
    <Link href="/nutrition" className="block">
      <Card>
        {/* 3-color gradient accent */}
        <div style={{ height: 3, background: GRAD_3 }} />

        <div className="p-4" style={{ background: 'var(--color-surface)' }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame size={13} style={{ color: '#FF0087' }} />
              <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.14em', color: 'var(--color-text-secondary)' }}>
                TODAY'S NUTRITION
              </span>
            </div>
            <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.12em', color: BULL_G }}>
              LOG FOOD →
            </span>
          </div>

          {/* Calorie row */}
          <div className="flex items-baseline gap-2 mb-3">
            <span style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--color-text-primary)' }}>
              {Math.round(todayMacros.calories).toLocaleString()}
            </span>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              / {nutritionGoals.calories.toLocaleString()} kcal
            </span>
            {over && (
              <span style={{ fontSize: 9, fontWeight: 900, color: '#DC2626', letterSpacing: '0.10em' }}>OVER</span>
            )}
          </div>

          {/* Progress bar */}
          <div
            className="w-full rounded-full overflow-hidden mb-4"
            style={{ height: 6, background: 'var(--color-surface-2)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${calPct}%`,
                background: over
                  ? 'linear-gradient(to right, #00BEFF, #DC2626)'
                  : GRAD_3,
              }}
            />
          </div>

          {/* Macro bars */}
          <div className="flex gap-2">
            {macros.map(({ label, value, goal, color }) => {
              const pct = Math.min((value / Math.max(goal, 1)) * 100, 100)
              return (
                <div key={label} className="flex-1">
                  <div className="flex items-baseline justify-between mb-1">
                    <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.10em', color: 'var(--color-text-muted)' }}>
                      {label}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--color-text-primary)' }}>
                      {Math.round(value)}g
                    </span>
                  </div>
                  <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: 'var(--color-surface-2)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>
    </Link>
  )
}

// ─── Weight Widget ────────────────────────────────────────────────────────────

function WeightWidget({ initialWeight }: { initialWeight: number | null }) {
  const supabase = createClient()
  const router   = useRouter()
  const [weightLbs, setWeightLbs]       = useState('')
  const [saving, setSaving]             = useState(false)
  const [saved, setSaved]               = useState(false)
  const [currentWeight, setCurrentWeight] = useState<number | null>(initialWeight)

  async function logWeight() {
    const val = parseFloat(weightLbs)
    if (!val || isNaN(val)) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const today = new Date().toISOString().slice(0, 10)
    await supabase.from('user_metrics').insert({
      user_id: user.id, recorded_date: today, weight_lbs: val, notes: null,
    })
    setCurrentWeight(val)
    setWeightLbs('')
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  return (
    <Card>
      {/* Gold gradient accent */}
      <div style={{ height: 3, background: GOLD_G }} />

      <div className="p-4" style={{ background: 'var(--color-surface)' }}>
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.14em', color: 'var(--color-text-secondary)' }}>
            BODY WEIGHT
          </span>
          {currentWeight && (
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
              {currentWeight}
              <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 3 }}>lbs</span>
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={weightLbs}
            onChange={e => setWeightLbs(e.target.value)}
            placeholder={currentWeight ? `${currentWeight} lbs` : 'Enter weight (lbs)'}
            className={cn(
              'flex-1 h-11 px-3 rounded-2xl border border-border bg-background',
              'text-sm text-text-primary placeholder:text-text-muted',
              'focus:outline-none focus:border-[#00BEFF] focus:ring-2 focus:ring-[#00BEFF]/20',
            )}
            onKeyDown={e => { if (e.key === 'Enter') logWeight() }}
          />
          <button
            onClick={logWeight}
            disabled={saving || !weightLbs}
            className="h-11 px-5 rounded-2xl text-xs font-black tracking-wider text-black disabled:opacity-40"
            style={{
              background: GOLD_G,
              boxShadow: saving || !weightLbs ? 'none' : '0 3px 12px rgba(255,214,0,0.35)',
            }}
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : saved ? '✓' : <Save size={14} />}
          </button>
        </div>

        <Link
          href="/profile"
          className="mt-3 flex items-center gap-1 text-[10px] font-black tracking-widest"
          style={{ color: BULL_G }}
        >
          VIEW HISTORY <ChevronRight size={11} />
        </Link>
      </div>
    </Card>
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
  const router   = useRouter()
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
    <div className="flex flex-col min-h-screen bg-background pb-8 animate-fade-in">

      {/* ── Dark Hero Header ─────────────────────────────────────── */}
      <div className="page-hero" style={{ paddingTop: 'max(env(safe-area-inset-top), 44px)' }}>
        <div className="hero-accent-bar" />

        {/* Cyan glow top-right */}
        <div className="hero-glow" style={{
          width: 260, height: 260, top: -90, right: -70,
          background: 'radial-gradient(circle, rgba(0,190,255,0.22) 0%, transparent 70%)',
          filter: 'blur(35px)',
        }} />
        {/* Pink glow bottom-left */}
        <div className="hero-glow" style={{
          width: 200, height: 200, bottom: -20, left: -60,
          background: 'radial-gradient(circle, rgba(255,0,135,0.14) 0%, transparent 70%)',
          filter: 'blur(35px)',
        }} />
        {/* Purple mid */}
        <div className="hero-glow" style={{
          width: 180, height: 180, top: 20, left: '40%',
          background: 'radial-gradient(circle, rgba(207,0,255,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />

        <div className="px-5 pt-7 pb-8 relative">
          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{
              width: 20, height: 2, borderRadius: 1,
              background: GRAD_3,
            }} />
            <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>
              {greeting}
            </p>
          </div>

          {/* Name — white-to-cyan gradient with lift shadow */}
          <h1 style={{
            fontFamily: 'var(--font-condensed)', fontSize: 56, fontWeight: 900,
            letterSpacing: '0.01em', textTransform: 'uppercase', lineHeight: 0.95,
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 30%, #33CBFF 70%, #CF00FF 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            filter: [
              'drop-shadow(0 2px 12px rgba(0,190,255,0.75))',
              'drop-shadow(0 4px 28px rgba(0,190,255,0.40))',
              'drop-shadow(0 1px 0px rgba(255,255,255,0.60))',
            ].join(' '),
          }}>
            {firstName}
          </h1>

          {/* Date pill */}
          <div
            className="inline-flex items-center mt-4 px-3 py-1 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pt-4">

        {/* ── Promo Banner ────────────────────────────────────────── */}
        <FeaturedProductBanner />

        {/* ── Today's Workout ─────────────────────────────────────── */}
        {isSubscribed && completedToday ? (

          <Card>
            <div style={{ height: 3, background: 'linear-gradient(135deg, #22C55E, #00BEFF)' }} />
            <div className="p-5" style={{ background: 'var(--color-surface)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.30)' }}>
                  <CheckCircle2 size={14} style={{ color: '#22C55E' }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.14em', color: '#22C55E' }}>TODAY'S WORKOUT</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-condensed)', fontSize: 26, fontWeight: 900, letterSpacing: '0.02em', lineHeight: 1.05, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                {completedToday.title.toUpperCase()}
              </h2>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 16 }} className="normal-case">
                {completedToday.exerciseCount} exercise{completedToday.exerciseCount !== 1 ? 's' : ''} · Completed today
              </p>
              <div className="flex gap-2">
                <div className="flex flex-1 items-center justify-center gap-2 h-12 rounded-2xl"
                  style={{ background: 'rgba(34,197,94,0.10)', border: '1.5px solid rgba(34,197,94,0.25)' }}>
                  <CheckCircle2 size={15} style={{ color: '#22C55E' }} />
                  <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.12em', color: '#22C55E' }}>DONE</span>
                </div>
                <Link
                  href={`/sessions/${completedToday.id}/log`}
                  className="flex flex-1 items-center justify-center gap-2 h-12 rounded-2xl text-black"
                  style={{ background: BULL_G, boxShadow: '0 4px 16px rgba(0,190,255,0.30)', fontSize: 11, fontWeight: 900, letterSpacing: '0.12em' }}
                >
                  VIEW LOG
                </Link>
              </div>
            </div>
          </Card>

        ) : isSubscribed && sessionData ? (

          <Card>
            <div style={{ height: 3, background: GRAD_3 }} />
            <div className="p-5" style={{ background: 'var(--color-surface)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center text-black"
                  style={{ background: BULL_G, boxShadow: '0 3px 10px rgba(0,190,255,0.35)' }}>
                  <Zap size={14} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.14em', color: BULL_G }}>TODAY'S WORKOUT</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-condensed)', fontSize: 26, fontWeight: 900, letterSpacing: '0.02em', lineHeight: 1.05, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                {sessionData.title.toUpperCase()}
              </h2>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 16 }} className="normal-case">
                {sessionData.exerciseCount} exercise{sessionData.exerciseCount !== 1 ? 's' : ''}
              </p>
              <Link
                href={`/sessions/${sessionData.id}/active`}
                className="flex items-center justify-center gap-2 h-13 w-full rounded-2xl text-black"
                style={{ background: GRAD_3, boxShadow: '0 6px 22px rgba(0,190,255,0.28)', fontSize: 13, fontWeight: 900, letterSpacing: '0.12em', height: 52 }}
              >
                START WORKOUT
              </Link>
            </div>
          </Card>

        ) : isSubscribed ? (

          <Card>
            <div style={{ height: 3, background: 'linear-gradient(135deg, #444444, #666666)' }} />
            <div className="p-5" style={{ background: 'var(--color-surface)' }}>
              <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.14em', color: 'var(--color-text-muted)' }}>TODAY'S WORKOUT</span>
              <h2 style={{ fontFamily: 'var(--font-condensed)', fontSize: 26, fontWeight: 900, letterSpacing: '0.02em', color: 'var(--color-text-primary)', marginTop: 6, marginBottom: 4 }}>REST DAY</h2>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }} className="normal-case">Recovery is part of the process.</p>
              <Link
                href="/sessions"
                className="mt-4 flex items-center gap-1 text-[10px] font-black tracking-widest"
                style={{ color: BULL_G }}
              >
                VIEW SCHEDULE <ChevronRight size={11} />
              </Link>
            </div>
          </Card>

        ) : (

          /* Programs teaser for non-subscribed */
          <Link href="/programs" className="block">
            <Card>
              <div style={{ height: 3, background: GOLD_G }} />
              <div className="p-5 flex items-center justify-between" style={{ background: 'var(--color-surface)' }}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy size={13} style={{ color: '#FFD600' }} />
                    <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.14em', color: '#FFD600' }}>ELITE PROGRAMS</span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-condensed)', fontSize: 22, fontWeight: 900, letterSpacing: '0.02em', color: 'var(--color-text-primary)' }}>
                    BROWSE PROGRAMS
                  </p>
                  <p style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }} className="normal-case">
                    Influencer-led + BULLFIT originals
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: GOLD_G, boxShadow: '0 4px 14px rgba(255,214,0,0.35)' }}>
                  <ChevronRight size={18} className="text-black" />
                </div>
              </div>
            </Card>
          </Link>
        )}

        {/* ── Today's Nutrition ───────────────────────────────────── */}
        <NutritionCard todayMacros={todayMacros} nutritionGoals={nutritionGoals} />

        {/* ── Weight Logger ────────────────────────────────────────── */}
        <WeightWidget initialWeight={latestWeight} />

        {/* ── Footer ──────────────────────────────────────────────── */}
        <div className="pt-2 pb-4 text-center">
          <p
            className="text-xs font-black tracking-widest"
            style={{
              background: GRAD_3,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
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
