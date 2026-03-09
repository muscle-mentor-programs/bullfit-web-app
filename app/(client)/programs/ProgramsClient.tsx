'use client'

import { cn } from '@/lib/utils/cn'
import { Lock, Play, CheckCircle2, Users, Star, ChevronRight, Zap, Trophy, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const BULL_G = '#00BEFF'
const GOLD_G = 'linear-gradient(135deg, #FFC00E 0%, #FFD600 100%)'

// ─── Program Data ─────────────────────────────────────────────────────────────

const INFLUENCER_PROGRAMS = [
  {
    id: 'influencer-1',
    influencer: 'Influencer 1',
    handle: '@influencer1',
    followers: '2.1M',
    title: 'BEAST MODE BUILDER',
    subtitle: '12-Week Hypertrophy Program',
    description: 'Build serious size and strength with this battle-tested 12-week hypertrophy protocol. Designed for intermediate to advanced lifters ready to push limits.',
    price: 49.95,
    duration: '12 weeks',
    daysPerWeek: 5,
    level: 'ADVANCED',
    levelColor: '#FF0087',
    category: 'Hypertrophy',
    rating: 4.9,
    reviews: 1247,
    gradient: '#00BEFF',
    badge: 'MOST POPULAR',
    badgeColor: '#FF0087',
    highlights: ['Progressive overload protocol', 'Advanced intensity techniques', 'Deload weeks included', 'Meal plan guidelines'],
  },
  {
    id: 'influencer-2',
    influencer: 'Influencer 2',
    handle: '@influencer2',
    followers: '980K',
    title: 'POWER & SHRED',
    subtitle: '8-Week Fat Loss + Strength',
    description: 'Combines powerlifting principles with metabolic conditioning to maximize fat loss while preserving — and building — lean muscle mass.',
    price: 39.95,
    duration: '8 weeks',
    daysPerWeek: 4,
    level: 'INTERMEDIATE',
    levelColor: '#CF00FF',
    category: 'Strength + Fat Loss',
    rating: 4.8,
    reviews: 876,
    gradient: '#00BEFF',
    badge: null,
    badgeColor: '#CF00FF',
    highlights: ['Powerlifting foundation', 'HIIT finishers', 'Macro tracking templates', 'Progress benchmarks'],
  },
  {
    id: 'influencer-3',
    influencer: 'Influencer 3',
    handle: '@influencer3',
    followers: '540K',
    title: 'ATHLETIC EDGE',
    subtitle: '10-Week Athletic Performance',
    description: 'Designed for athletes who want to perform at the highest level. Speed, power, agility and functional strength — all in one complete program.',
    price: 34.95,
    duration: '10 weeks',
    daysPerWeek: 4,
    level: 'INTERMEDIATE',
    levelColor: '#CF00FF',
    category: 'Athletic Performance',
    rating: 4.7,
    reviews: 502,
    gradient: '#00BEFF',
    badge: null,
    badgeColor: '#FF0087',
    highlights: ['Sport-specific movements', 'Explosive power training', 'Mobility & flexibility work', 'Recovery protocols'],
  },
]

const BULLFIT_PROGRAMS = [
  {
    id: 'bf-beginner',
    title: 'BULLFIT FOUNDATION',
    subtitle: '6-Week Beginner Program',
    description: 'The perfect starting point. Master the fundamentals and build the habits that last a lifetime.',
    price: 29.95,
    duration: '6 weeks',
    daysPerWeek: 3,
    level: 'BEGINNER',
    levelColor: '#22C55E',
    category: 'Foundation',
    rating: 4.8,
    reviews: 2104,
    gradient: '#00BEFF',
    badge: 'START HERE',
    badgeColor: '#22C55E',
    highlights: ['Form & technique focus', 'Full-body workouts', 'Nutrition basics guide', 'App integration'],
  },
  {
    id: 'bf-burn',
    title: 'BULLFIT BURN',
    subtitle: '8-Week Fat Incinerator',
    description: 'High-intensity circuit training meets strategic cardio. Torch fat and reveal the physique underneath.',
    price: 34.95,
    duration: '8 weeks',
    daysPerWeek: 5,
    level: 'INTERMEDIATE',
    levelColor: '#CF00FF',
    category: 'Fat Loss',
    rating: 4.6,
    reviews: 689,
    gradient: '#00BEFF',
    badge: null,
    badgeColor: '#FF0087',
    highlights: ['HIIT + LISS cardio plan', 'Circuit training protocols', 'Supplement stack guide', 'Weekly check-ins'],
  },
]

// ─── Program Card ─────────────────────────────────────────────────────────────

function ProgramCard({
  program,
  isSubscribed,
  isInfluencer = false,
}: {
  program: typeof INFLUENCER_PROGRAMS[0] | typeof BULLFIT_PROGRAMS[0]
  isSubscribed: boolean
  isInfluencer?: boolean
}) {
  return (
    <div
      className="rounded-2xl border border-border overflow-hidden"
      style={{ background: 'var(--color-surface)' }}
    >
      {/* Gradient accent bar */}
      <div className="h-1.5 w-full" style={{ background: program.gradient }} />

      <div className="p-5">
        {/* Influencer tag + badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isInfluencer && (
              <span className="flex items-center gap-1 text-[9px] font-black tracking-widest text-[#FFD600]">
                <Star size={9} fill="#FFD600" />
                PARTNER PROGRAM
              </span>
            )}
          </div>
          {program.badge && (
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest text-black"
              style={{ backgroundColor: program.badgeColor }}
            >
              {program.badge}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-black text-text-primary leading-tight mb-0.5">{program.title}</h3>
        <p className="text-xs font-black tracking-wider mb-2" style={{ color: program.levelColor }}>
          {program.subtitle}
        </p>
        <p className="text-xs text-text-muted normal-case leading-relaxed mb-4">{program.description}</p>

        {/* Stats row */}
        <div className="flex gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
            <Calendar size={11} className="text-text-muted" />
            {program.duration}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
            <Zap size={11} className="text-text-muted" />
            {program.daysPerWeek}x/week
          </div>
          <div
            className="px-2 py-0.5 rounded-full text-[9px] font-black"
            style={{ backgroundColor: `${program.levelColor}22`, color: program.levelColor }}
          >
            {program.level}
          </div>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-2 gap-1.5 mb-4">
          {program.highlights.map(h => (
            <div key={h} className="flex items-center gap-1.5 text-[10px] text-text-muted normal-case">
              <CheckCircle2 size={10} className="text-[#22C55E] flex-shrink-0" />
              {h}
            </div>
          ))}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={11} fill={i < Math.floor(program.rating) ? '#FFD600' : 'none'}
                className={i < Math.floor(program.rating) ? 'text-[#FFD600]' : 'text-text-muted'} />
            ))}
          </div>
          <span className="text-xs font-black text-text-primary">{program.rating}</span>
          <span className="text-[10px] text-text-muted">({program.reviews.toLocaleString()} reviews)</span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-black text-text-primary">${program.price}</span>
            <span className="text-xs text-text-muted ml-1">/mo</span>
          </div>
          {isSubscribed ? (
            <Link
              href="/sessions"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-black"
              style={{ background: program.gradient }}
            >
              <Play size={13} fill="black" />
              START
            </Link>
          ) : (
            <Link
              href="/subscribe"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-white border border-white/20"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <Lock size={12} />
              UNLOCK
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main ProgramsClient ──────────────────────────────────────────────────────

type PTab = 'influencer' | 'bullfit'

export function ProgramsClient({
  isSubscribed,
  activeProgramId,
}: {
  isSubscribed: boolean
  activeProgramId: string | null
}) {
  const [tab, setTab] = useState<PTab>('influencer')

  return (
    <div className="flex flex-col min-h-screen bg-background pb-6 animate-fade-in">

      {/* ── Dark BULLFIT Page Hero ─────────────────── */}
      <div className="page-hero" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="hero-accent-bar" />
        <div className="hero-glow" style={{
          width: 200, height: 200, top: -60, right: -40,
          background: 'radial-gradient(circle, rgba(0,190,255,0.18) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }} />
        <div className="hero-glow" style={{
          width: 160, height: 160, bottom: -20, left: -30,
          background: 'radial-gradient(circle, rgba(207,0,255,0.12) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }} />
        <div className="px-5 pt-4 pb-7 relative">
          <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.18em',
            color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
            COACH-BUILT
          </p>
          <h1 style={{ fontFamily: 'var(--font-condensed)', fontSize: 40, fontWeight: 900,
            letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 1.05,
            color: '#FFFFFF', marginTop: 4 }}>
            PROGRAMS
          </h1>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 28,
          background: 'linear-gradient(to bottom, transparent, #F5F5F3)', pointerEvents: 'none' }} />
      </div>

      {/* ── Subscription unlock banner ────────────────────────────────── */}
      {!isSubscribed && (
        <div className="mx-4 mb-4">
          <div
            className="rounded-2xl overflow-hidden border"
            style={{
              background: 'linear-gradient(135deg, rgba(0,190,255,0.08), rgba(207,0,255,0.06))',
              borderColor: 'rgba(0,190,255,0.20)',
            }}
          >
            <div className="h-0.5 w-full" style={{ background: BULL_G }} />
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock size={14} className="text-[#00BEFF]" />
                <span className="text-[11px] font-black tracking-widest text-[#00BEFF]">UNLOCK ALL PROGRAMS</span>
              </div>
              <p className="text-xs text-text-muted normal-case mb-3">
                Subscribe to access every program — influencer-led and BULLFIT originals.
              </p>
              <Link
                href="/subscribe"
                className="flex items-center justify-center gap-2 h-11 w-full rounded-xl text-black text-sm font-black tracking-widest"
                style={{ background: BULL_G }}
              >
                SUBSCRIBE FROM $29.95/MO
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Active program quick link ─────────────────────────────────── */}
      {isSubscribed && activeProgramId && (
        <div className="mx-4 mb-4">
          <Link
            href="/sessions"
            className="flex items-center justify-between p-4 rounded-2xl border"
            style={{
              background: 'linear-gradient(135deg, rgba(0,190,255,0.10), rgba(207,0,255,0.08))',
              borderColor: 'rgba(0,190,255,0.25)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: BULL_G }}>
                <Play size={14} fill="white" className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-widest text-[#00BEFF]">ACTIVE PROGRAM</p>
                <p className="text-sm font-black text-text-primary">Continue Training</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-text-muted" />
          </Link>
        </div>
      )}

      {/* ── Tab switcher ─────────────────────────────────────────────── */}
      <div className="px-4 mb-4">
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'var(--color-surface)' }}>
          <button
            onClick={() => setTab('influencer')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl',
              'text-[10px] font-black tracking-widest transition-all duration-200',
              tab === 'influencer' ? 'text-black' : 'text-text-muted',
            )}
            style={tab === 'influencer' ? { background: BULL_G } : {}}
          >
            <Star size={12} />
            INFLUENCER
          </button>
          <button
            onClick={() => setTab('bullfit')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl',
              'text-[10px] font-black tracking-widest transition-all duration-200',
              tab === 'bullfit' ? 'text-black' : 'text-text-muted',
            )}
            style={tab === 'bullfit' ? { background: BULL_G } : {}}
          >
            <Trophy size={12} />
            BULLFIT OG
          </button>
        </div>
      </div>

      {/* ── Program cards ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 px-4">
        {tab === 'influencer' ? (
          <>
            <p className="text-[10px] font-black tracking-widest text-text-muted text-center">
              PARTNER PROGRAMS — EXCLUSIVE TO BULLFIT
            </p>
            {INFLUENCER_PROGRAMS.map(p => (
              <ProgramCard key={p.id} program={p} isSubscribed={isSubscribed} isInfluencer />
            ))}
          </>
        ) : (
          <>
            <p className="text-[10px] font-black tracking-widest text-text-muted text-center">
              BULLFIT ORIGINALS — BUILT IN-HOUSE
            </p>
            {BULLFIT_PROGRAMS.map(p => (
              <ProgramCard key={p.id} program={p} isSubscribed={isSubscribed} />
            ))}
          </>
        )}

        {/* Link to existing workout sessions */}
        {isSubscribed && (
          <Link
            href="/sessions"
            className="flex items-center justify-between p-4 rounded-2xl border border-border"
            style={{ background: 'var(--color-surface)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-border flex items-center justify-center">
                <Calendar size={16} className="text-text-secondary" />
              </div>
              <div>
                <p className="text-xs font-black text-text-primary">MY WORKOUT SESSIONS</p>
                <p className="text-[10px] text-text-muted normal-case">View your full training calendar</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-text-muted" />
          </Link>
        )}
      </div>
    </div>
  )
}
