'use client'

import { cn } from '@/lib/utils/cn'
import {
  Calendar, CheckCircle2, ChevronRight, Play,
  Star, Trophy, Users, Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProgramData {
  id: string
  // Influencer-specific (undefined = BULLFIT OG)
  influencer?: string
  tag?: string
  handle?: string
  followers?: string
  monogram: string
  // Program details
  title: string
  subtitle: string
  description: string
  price: number
  duration: string
  daysPerWeek: number
  level: string
  levelColor: string
  rating: number
  reviews: number
  badge: string | null
  badgeColors: string
  // Visuals
  heroFrom: string
  heroMid: string
  heroTo: string
  glow1: string
  glow2: string
  accentFrom: string
  accentTo: string
  highlights: string[]
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const INFLUENCER_PROGRAMS: ProgramData[] = [
  {
    id: 'mike-ohearn',
    influencer: "Mike O'Hearn",
    tag: 'THE TITAN',
    handle: '@mikeohearn',
    followers: '4.2M',
    monogram: 'MO',
    title: 'TITAN MASS BUILDER',
    subtitle: '12-Week Elite Hypertrophy Protocol',
    description:
      "Four decades of building an elite physique. The Titan's exact blueprint for developing serious size and strength — no shortcuts, just pure results.",
    price: 49.95,
    duration: '12 weeks',
    daysPerWeek: 5,
    level: 'ELITE',
    levelColor: '#D4A017',
    rating: 4.9,
    reviews: 1847,
    badge: 'MOST POPULAR',
    badgeColors: 'linear-gradient(135deg,#FF6B00,#FF0087)',
    heroFrom: '#0F0800',
    heroMid: '#2A1600',
    heroTo: '#0A0500',
    glow1: 'rgba(212,160,23,0.45)',
    glow2: 'rgba(255,140,0,0.22)',
    accentFrom: '#C8900A',
    accentTo: '#FFD700',
    highlights: [
      'Progressive overload system',
      'Advanced hypertrophy techniques',
      'Strategic deload weeks',
      'Personalized meal templates',
    ],
  },
  {
    id: 'delaney-lee',
    influencer: 'Delaney Lee',
    tag: 'FITNESS COACH',
    handle: '@delaneylee',
    followers: '1.8M',
    monogram: 'DL',
    title: 'SCULPT & SHRED',
    subtitle: '10-Week Body Transformation',
    description:
      "Delaney's signature program blends resistance training with targeted metabolic conditioning — sculpt lean muscle and torch fat simultaneously.",
    price: 44.95,
    duration: '10 weeks',
    daysPerWeek: 4,
    level: 'INTERMEDIATE',
    levelColor: '#FF6B9D',
    rating: 4.8,
    reviews: 2341,
    badge: 'TOP RATED',
    badgeColors: 'linear-gradient(135deg,#CF00FF,#FF0087)',
    heroFrom: '#0F0010',
    heroMid: '#200028',
    heroTo: '#0A0014',
    glow1: 'rgba(255,0,135,0.42)',
    glow2: 'rgba(207,0,255,0.28)',
    accentFrom: '#CF00FF',
    accentTo: '#FF6B9D',
    highlights: [
      'Resistance + cardio fusion',
      'Glute & core specialization',
      'Macro cycling system',
      'Weekly progress benchmarks',
    ],
  },
  {
    id: 'thor-bjornsson',
    influencer: 'Hafþór Björnsson',
    tag: "WORLD'S STRONGEST MAN",
    handle: '@thorbjornsson',
    followers: '6.1M',
    monogram: 'HB',
    title: 'STRONGMAN PROTOCOL',
    subtitle: '16-Week Strength Foundation',
    description:
      "The World's Strongest Man reveals the exact training methodology behind his record-breaking lifts. Raw, unfiltered strength development at its absolute peak.",
    price: 54.95,
    duration: '16 weeks',
    daysPerWeek: 5,
    level: 'EXTREME',
    levelColor: '#00BEFF',
    rating: 4.9,
    reviews: 987,
    badge: null,
    badgeColors: '',
    heroFrom: '#000A14',
    heroMid: '#001830',
    heroTo: '#00060F',
    glow1: 'rgba(0,190,255,0.42)',
    glow2: 'rgba(0,100,220,0.24)',
    accentFrom: '#0080FF',
    accentTo: '#00BEFF',
    highlights: [
      'World-class strength methodology',
      'Powerlifting foundations',
      'Event-based training blocks',
      'Recovery & mobility protocols',
    ],
  },
]

const BULLFIT_PROGRAMS: ProgramData[] = [
  {
    id: 'bf-beginner',
    monogram: 'BF',
    title: 'BULLFIT FOUNDATION',
    subtitle: '6-Week Beginner Program',
    description:
      'The perfect starting point. Master the fundamentals and build the habits that last a lifetime. Every elite athlete started somewhere.',
    price: 29.95,
    duration: '6 weeks',
    daysPerWeek: 3,
    level: 'BEGINNER',
    levelColor: '#22C55E',
    rating: 4.8,
    reviews: 2104,
    badge: 'START HERE',
    badgeColors: 'linear-gradient(135deg,#16A34A,#22C55E)',
    heroFrom: '#001008',
    heroMid: '#001C10',
    heroTo: '#000C08',
    glow1: 'rgba(34,197,94,0.40)',
    glow2: 'rgba(0,180,80,0.22)',
    accentFrom: '#16A34A',
    accentTo: '#22C55E',
    highlights: [
      'Form & technique focus',
      'Full-body workouts',
      'Nutrition basics guide',
      'App integration',
    ],
  },
  {
    id: 'bf-burn',
    monogram: 'BB',
    title: 'BULLFIT BURN',
    subtitle: '8-Week Fat Incinerator',
    description:
      'High-intensity circuit training meets strategic cardio. Torch fat and reveal the physique underneath with BULLFIT\'s elite fat-loss protocol.',
    price: 34.95,
    duration: '8 weeks',
    daysPerWeek: 5,
    level: 'INTERMEDIATE',
    levelColor: '#FF0087',
    rating: 4.6,
    reviews: 689,
    badge: null,
    badgeColors: '',
    heroFrom: '#0F0010',
    heroMid: '#1A0020',
    heroTo: '#0A0014',
    glow1: 'rgba(255,0,135,0.40)',
    glow2: 'rgba(207,0,255,0.22)',
    accentFrom: '#CF00FF',
    accentTo: '#FF0087',
    highlights: [
      'HIIT + LISS cardio plan',
      'Circuit training protocols',
      'Supplement stack guide',
      'Weekly check-ins',
    ],
  },
]

// ─── Program Card ─────────────────────────────────────────────────────────────

function ProgramCard({ p, isInfluencer }: { p: ProgramData; isInfluencer?: boolean }) {
  const accentGrad = `linear-gradient(135deg, ${p.accentFrom}, ${p.accentTo})`

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        boxShadow: [
          '0 16px 48px rgba(0,0,0,0.22)',
          '0 6px 16px rgba(0,0,0,0.14)',
          '0 2px 4px rgba(0,0,0,0.10)',
          'inset 0 1px 0 rgba(255,255,255,0.06)',
        ].join(','),
      }}
    >
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          height: 200,
          background: `linear-gradient(155deg, ${p.heroFrom} 0%, ${p.heroMid} 55%, ${p.heroTo} 100%)`,
        }}
      >
        {/* Atmospheric glows */}
        <div
          style={{
            position: 'absolute', width: 260, height: 260,
            top: -90, right: -60, borderRadius: '50%',
            background: `radial-gradient(circle, ${p.glow1} 0%, transparent 60%)`,
            filter: 'blur(50px)', pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute', width: 220, height: 220,
            bottom: -70, left: -50, borderRadius: '50%',
            background: `radial-gradient(circle, ${p.glow2} 0%, transparent 60%)`,
            filter: 'blur(40px)', pointerEvents: 'none',
          }}
        />

        {/* Subtle texture: thin scan lines */}
        <div
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 3px)',
          }}
        />

        {/* Large watermark monogram */}
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: 140, fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1,
              background: accentGrad,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              opacity: 0.10, userSelect: 'none',
            }}
          >
            {p.monogram}
          </span>
        </div>

        {/* Top badges row */}
        <div className="absolute top-0 left-0 right-0 px-4 pt-4 flex items-start justify-between gap-3">
          {isInfluencer ? (
            <div
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                backdropFilter: 'blur(10px)',
                borderRadius: 8, padding: '4px 10px',
                fontSize: 9, fontWeight: 900, letterSpacing: '0.14em',
                color: 'rgba(255,255,255,0.75)',
              }}
            >
              <Star size={8} fill="rgba(255,255,255,0.75)" />
              PARTNER PROGRAM
            </div>
          ) : (
            <div
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                backdropFilter: 'blur(10px)',
                borderRadius: 8, padding: '4px 10px',
                fontSize: 9, fontWeight: 900, letterSpacing: '0.14em',
                color: 'rgba(255,255,255,0.75)',
              }}
            >
              <Trophy size={8} />
              BULLFIT ORIGINAL
            </div>
          )}
          {p.badge && (
            <div
              style={{
                display: 'inline-flex', alignItems: 'center',
                background: p.badgeColors,
                borderRadius: 20, padding: '4px 11px',
                fontSize: 9, fontWeight: 900, letterSpacing: '0.14em',
                color: 'white', boxShadow: '0 3px 10px rgba(0,0,0,0.45)',
              }}
            >
              {p.badge}
            </div>
          )}
        </div>

        {/* Bottom overlay: athlete name + stats */}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 pb-4"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.30) 60%, transparent 100%)',
            paddingTop: 40,
          }}
        >
          {/* Stats chips */}
          <div className="flex items-center gap-1.5 mb-3">
            {[
              { icon: Calendar, label: p.duration.toUpperCase() },
              { icon: Zap, label: `${p.daysPerWeek}X / WK` },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(6px)',
                  borderRadius: 7, padding: '3px 9px',
                  fontSize: 9, fontWeight: 900, letterSpacing: '0.12em',
                  color: 'rgba(255,255,255,0.90)',
                }}
              >
                <Icon size={9} />
                {label}
              </div>
            ))}
            <div
              style={{
                display: 'inline-flex', alignItems: 'center',
                background: `${p.accentFrom}28`,
                border: `1px solid ${p.accentFrom}55`,
                borderRadius: 7, padding: '3px 9px',
                fontSize: 9, fontWeight: 900, letterSpacing: '0.12em',
                color: p.levelColor,
              }}
            >
              {p.level}
            </div>
          </div>

          {/* Name */}
          <p
            style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: isInfluencer ? 23 : 20,
              fontWeight: 900, letterSpacing: '0.02em', lineHeight: 1.1,
              color: '#FFFFFF',
              textShadow: '0 2px 20px rgba(0,0,0,0.8)',
            }}
          >
            {isInfluencer ? (p.influencer ?? p.title).toUpperCase() : p.title}
          </p>

          {/* Handle + followers (influencer only) */}
          {isInfluencer && p.handle && (
            <div className="flex items-center gap-2 mt-1">
              <span
                style={{
                  fontSize: 10, fontWeight: 500, letterSpacing: '0.05em',
                  color: 'rgba(255,255,255,0.48)',
                }}
              >
                {p.handle}
              </span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)' }}>·</span>
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 3,
                  fontSize: 9, fontWeight: 900, letterSpacing: '0.10em',
                  color: 'rgba(255,255,255,0.48)',
                }}
              >
                <Users size={8} />
                {p.followers}
              </div>
            </div>
          )}
          {!isInfluencer && (
            <p
              style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                color: p.levelColor, marginTop: 2, textTransform: 'uppercase',
                textShadow: `0 1px 8px ${p.glow1}`,
              }}
            >
              {p.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* ── Content body ──────────────────────────────────────────────────── */}
      <div style={{ background: 'var(--color-surface)' }}>
        {/* Gradient accent line */}
        <div style={{ height: 2.5, background: accentGrad }} />

        <div className="p-5">
          {/* Program title + subtitle (influencer) */}
          {isInfluencer && (
            <>
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3
                  style={{
                    fontFamily: 'var(--font-condensed)',
                    fontSize: 26, fontWeight: 900, letterSpacing: '0.01em', lineHeight: 1.05,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {p.title}
                </h3>
                {/* Accent dot accent */}
                <div
                  style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                    background: accentGrad,
                    boxShadow: `0 0 8px ${p.glow1}`,
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: 10, fontWeight: 900, letterSpacing: '0.10em',
                  color: p.levelColor, marginBottom: 14, textTransform: 'uppercase',
                }}
              >
                {p.subtitle}
              </p>
            </>
          )}

          {/* Description */}
          <p className="text-xs text-text-muted normal-case leading-relaxed mb-5">
            {p.description}
          </p>

          {/* Highlights grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-5">
            {p.highlights.map(h => (
              <div key={h} className="flex items-start gap-2">
                <div
                  style={{
                    width: 18, height: 18, borderRadius: 6, flexShrink: 0, marginTop: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${p.accentFrom}18`,
                    border: `1px solid ${p.accentFrom}30`,
                  }}
                >
                  <CheckCircle2 size={10} style={{ color: p.accentFrom }} />
                </div>
                <span className="text-[10px] text-text-secondary normal-case leading-snug mt-0.5">
                  {h}
                </span>
              </div>
            ))}
          </div>

          {/* Rating */}
          <div
            className="flex items-center gap-2 pb-5 mb-5"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <Star
                  key={i} size={13}
                  fill={i <= Math.floor(p.rating) ? '#FFD600' : 'none'}
                  style={{ color: i <= Math.floor(p.rating) ? '#FFD600' : 'var(--color-border)' }}
                />
              ))}
            </div>
            <span
              className="text-sm font-black"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {p.rating}
            </span>
            <span className="text-[10px] text-text-muted">
              ({p.reviews.toLocaleString()} ratings)
            </span>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col leading-none">
              <span
                style={{
                  fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1,
                  color: 'var(--color-text-primary)',
                }}
              >
                ${p.price}
              </span>
              <span className="text-[10px] text-text-muted font-normal normal-case mt-1">
                one-time purchase
              </span>
            </div>
            <button
              className="flex items-center gap-2 h-13 px-5 rounded-2xl text-black text-xs font-black tracking-widest"
              style={{
                background: accentGrad,
                boxShadow: `0 4px 20px ${p.glow1}, 0 2px 6px rgba(0,0,0,0.2)`,
                height: 48,
              }}
            >
              GET PROGRAM
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tab system ───────────────────────────────────────────────────────────────

type PTab = 'influencer' | 'bullfit'
const PTAB_ORDER: PTab[] = ['influencer', 'bullfit']

// ─── Main ─────────────────────────────────────────────────────────────────────

export function ProgramsClient({
  isSubscribed,
  activeProgramId,
}: {
  isSubscribed: boolean
  activeProgramId: string | null
}) {
  const [tab, setTab] = useState<PTab>('influencer')
  const [slideClass, setSlideClass] = useState('')

  function switchTab(newTab: PTab) {
    if (newTab === tab) return
    const dir = PTAB_ORDER.indexOf(newTab) > PTAB_ORDER.indexOf(tab) ? 'right' : 'left'
    setSlideClass(dir === 'right' ? 'tab-slide-from-right' : 'tab-slide-from-left')
    setTab(newTab)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-8 animate-fade-in">

      {/* ── Page Hero ─────────────────────────────────────────────────── */}
      <div className="page-hero" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="hero-accent-bar" />
        <div className="px-5 pt-4 pb-5 relative">
          <p
            style={{
              fontSize: 11, fontWeight: 900, letterSpacing: '0.18em',
              color: '#9A9A9A', textTransform: 'uppercase',
            }}
          >
            COACH-BUILT
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-condensed)', fontSize: 40, fontWeight: 900,
              letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 1.05,
              color: '#0F0F0F', marginTop: 4,
            }}
          >
            PROGRAMS
          </h1>
        </div>
      </div>

      {/* ── Active program banner ─────────────────────────────────────── */}
      {activeProgramId && (
        <div className="px-4 pt-4">
          <Link
            href="/sessions"
            className="flex items-center gap-3 p-4 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(0,190,255,0.10), rgba(207,0,255,0.07))',
              border: '1px solid rgba(0,190,255,0.22)',
              boxShadow: '0 4px 16px rgba(0,190,255,0.10)',
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg,#00BEFF,#CF00FF)',
                boxShadow: '0 3px 12px rgba(0,190,255,0.35)',
              }}
            >
              <Play size={15} fill="white" className="text-white ml-0.5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black tracking-widest text-[#00BEFF]">ACTIVE PROGRAM</p>
              <p className="text-sm font-black text-text-primary">Continue Training</p>
            </div>
            <ChevronRight size={16} className="text-text-muted" />
          </Link>
        </div>
      )}

      {/* ── Tab switcher ─────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3">
        <div
          className="flex p-1 rounded-2xl"
          style={{
            background: 'var(--color-surface)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.6)',
            border: '1px solid var(--color-border)',
          }}
        >
          {([
            { id: 'influencer', label: 'INFLUENCER', icon: Star },
            { id: 'bullfit',    label: 'BULLFIT OG',  icon: Trophy },
          ] as { id: PTab; label: string; icon: typeof Star }[]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => switchTab(id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl',
                'text-[10px] font-black tracking-widest transition-all duration-200',
                tab === id ? 'text-black' : 'text-text-muted',
              )}
              style={tab === id ? {
                background: 'linear-gradient(135deg,#00BEFF,#CF00FF)',
                boxShadow: '0 3px 12px rgba(0,190,255,0.25)',
              } : {}}
            >
              <Icon size={12} fill={tab === id ? 'black' : 'none'} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Program cards ────────────────────────────────────────────── */}
      <div key={tab} className={cn('flex flex-col gap-5 px-4', slideClass)}>
        {tab === 'influencer' ? (
          <>
            <p className="text-[9px] font-black tracking-widest text-text-muted text-center">
              EXCLUSIVE PARTNER PROGRAMS
            </p>
            {INFLUENCER_PROGRAMS.map(p => (
              <ProgramCard key={p.id} p={p} isInfluencer />
            ))}
          </>
        ) : (
          <>
            <p className="text-[9px] font-black tracking-widest text-text-muted text-center">
              BUILT IN-HOUSE BY BULLFIT
            </p>
            {BULLFIT_PROGRAMS.map(p => (
              <ProgramCard key={p.id} p={p} />
            ))}
          </>
        )}

        {/* Workout sessions link */}
        {activeProgramId && (
          <Link
            href="/sessions"
            className="flex items-center justify-between p-4 rounded-2xl border border-border"
            style={{ background: 'var(--color-surface)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--color-surface-2)' }}
              >
                <Calendar size={15} className="text-text-secondary" />
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
