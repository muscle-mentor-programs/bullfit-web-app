'use client'

import { ExercisesClient } from '@/app/(client)/exercises/ExercisesClient'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { cn } from '@/lib/utils/cn'
import {
  CalendarPlus,
  CheckCircle2,
  Dumbbell,
  Loader2,
  Lock,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProgramItem {
  id: string
  title: string
  description: string
  duration_weeks: number
  cover_image_url: string | null
  enrolled: boolean
}

// ─── Start Date Modal ─────────────────────────────────────────────────────────

const MON_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Returns 6 past Mondays + 12 upcoming Mondays (18 total).
 *  Index 6 is always the most recent Monday (this week's). */
function getMondays(pastCount = 6, futureCount = 12): Date[] {
  const dates: Date[] = []
  // Find this week's Monday (today if today is Mon, else the most recent Mon)
  const thisMonday = new Date()
  thisMonday.setHours(0, 0, 0, 0)
  const day = thisMonday.getDay()
  thisMonday.setDate(thisMonday.getDate() - (day === 0 ? 6 : day - 1))
  // Start 6 weeks back
  const start = new Date(thisMonday)
  start.setDate(start.getDate() - pastCount * 7)
  for (let i = 0; i < pastCount + futureCount; i++) {
    dates.push(new Date(start))
    start.setDate(start.getDate() + 7)
  }
  return dates
}

function toIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function StartDateModal({
  program,
  onConfirm,
  onClose,
}: {
  program: ProgramItem
  onConfirm: (startDate: string) => void
  onClose: () => void
}) {
  const dates = getMondays(6, 12)
  // Default to this week's Monday (index 6)
  const [selected, setSelected] = useState(toIso(dates[6]))
  const selectedDate = dates.find((d) => toIso(d) === selected) ?? dates[0]

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-border shadow-xl overflow-hidden"
        style={{ background: 'var(--color-surface)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div>
            <h2 className="text-base font-black text-text-primary">Choose Start Date</h2>
            <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{program.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Monday picker */}
        <div
          className="flex gap-2 px-4 pb-4 overflow-x-auto snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none' }}
        >
          {dates.map((date) => {
            const iso = toIso(date)
            const active = iso === selected
            return (
              <button
                key={iso}
                onClick={() => setSelected(iso)}
                className={cn(
                  'flex-shrink-0 snap-center flex flex-col items-center justify-center w-12 rounded-xl border transition-all active:scale-[0.95] py-2',
                  active ? 'text-white border-transparent shadow-md' : 'border-border text-text-secondary hover:border-primary/40',
                )}
                style={active
                  ? { background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }
                  : { background: 'var(--color-surface-2)' }
                }
              >
                <span className={cn('text-[9px] font-black tracking-wide', active ? 'text-white/80' : 'text-text-muted')}>
                  {MON_SHORT[date.getMonth()]}
                </span>
                <span className="text-lg font-black leading-none mt-0.5">{date.getDate()}</span>
              </button>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-4 pb-5">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:bg-surface-2 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selected)}
            className="flex-1 h-10 rounded-xl text-sm font-black text-white shadow-primary transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}
          >
            ADD TO CALENDAR
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Program Card ──────────────────────────────────────────────────────────────

function ProgramCard({
  program,
  isSubscribed,
  onEnroll,
  onUnenroll,
}: {
  program: ProgramItem
  isSubscribed: boolean
  onEnroll: (id: string, startDate: string) => Promise<void>
  onUnenroll: (id: string) => Promise<void>
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [enrolled, setEnrolled] = useState(program.enrolled)
  const [error, setError] = useState('')
  const [showStartDate, setShowStartDate] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)

  async function handleEnrollConfirm(startDate: string) {
    setShowStartDate(false)
    setLoading(true)
    setError('')
    try {
      await onEnroll(program.id, startDate)
      setEnrolled(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add program')
    } finally {
      setLoading(false)
    }
  }

  async function handleUnenroll() {
    setLoading(true)
    setError('')
    try {
      await onUnenroll(program.id)
      setEnrolled(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove program')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div
        className="rounded-2xl border border-border overflow-hidden flex flex-col shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
        style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
      >
        {/* Cover */}
        <div className="relative aspect-video bg-surface-2 flex-shrink-0">
          {program.cover_image_url ? (
            <img src={program.cover_image_url} alt={program.title} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--color-surface-2), var(--color-background))' }}
            >
              <Dumbbell size={32} className="text-text-muted/40" />
            </div>
          )}
          {enrolled && (
            <div className="absolute top-3 right-3">
              <span
                className="flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-full text-white"
                style={{ background: 'linear-gradient(135deg, #34d399, var(--color-success))' }}
              >
                <CheckCircle2 size={12} />
                In Calendar
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4 gap-3">
          <div className="flex-1">
            <h3 className="text-base font-black text-text-primary leading-snug">{program.title}</h3>
            <p className="text-xs text-text-muted mt-1 line-clamp-3 leading-relaxed">{program.description}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted">
              {program.duration_weeks} weeks
            </span>
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <div className="pt-1 flex flex-col gap-2">
            {enrolled ? (
              <>
                <button
                  onClick={() => router.push('/sessions')}
                  className="w-full flex items-center justify-center gap-2 h-9 rounded-xl text-sm font-semibold text-success bg-success/10 hover:bg-success/20 transition-colors"
                >
                  <CheckCircle2 size={14} />
                  View in Calendar
                </button>
                <button
                  onClick={() => setConfirmRemove(true)}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 h-9 rounded-xl text-xs font-semibold text-error hover:bg-error/10 transition-colors border border-error/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  Remove from Calendar
                </button>
              </>
            ) : isSubscribed ? (
              <button
                onClick={() => setShowStartDate(true)}
                disabled={loading}
                className={cn(
                  'w-full flex items-center justify-center gap-2 h-9 rounded-xl text-sm font-black tracking-widest transition-all',
                  'text-white shadow-primary hover:shadow-md active:scale-[0.98]',
                  'disabled:opacity-50 disabled:pointer-events-none',
                )}
                style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <CalendarPlus size={14} />}
                {loading ? 'Adding...' : 'Add to Calendar'}
              </button>
            ) : (
              <button
                onClick={() => router.push('/subscribe')}
                className="w-full flex items-center justify-center gap-2 h-9 rounded-xl text-sm font-semibold bg-surface-2 text-text-secondary hover:bg-border transition-colors"
              >
                <Lock size={14} />
                Subscribe to Access
              </button>
            )}
          </div>
        </div>
      </div>

      {showStartDate && (
        <StartDateModal program={program} onConfirm={handleEnrollConfirm} onClose={() => setShowStartDate(false)} />
      )}

      <ConfirmDialog
        isOpen={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        onConfirm={handleUnenroll}
        title="Remove Program"
        message={`Remove "${program.title}" from your calendar? Future uncompleted sessions will be deleted. Completed sessions are kept.`}
        confirmLabel="Remove"
        danger
      />
    </>
  )
}

// ─── Programs Tab ─────────────────────────────────────────────────────────────

function ProgramsTab({ programs, isSubscribed }: { programs: ProgramItem[]; isSubscribed: boolean }) {
  const router = useRouter()

  async function handleEnroll(programId: string, startDate: string) {
    const res = await fetch(`/api/programs/${programId}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start_date: startDate }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Enrollment failed')
  }

  async function handleUnenroll(programId: string) {
    const res = await fetch(`/api/programs/${programId}/enroll`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Failed to remove')
  }

  return (
    <div>
      <div className="mx-4 mb-4">
        <button
          onClick={() => router.push('/workouts/new')}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-primary/25 shadow-md',
            'transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]',
          )}
          style={{ background: 'linear-gradient(135deg, var(--color-primary)/8, var(--color-primary-dark)/5)' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}
          >
            <Plus size={18} className="text-white" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className="text-sm font-black text-text-primary">Create My Own Workout</p>
            <p className="text-xs text-text-muted mt-0.5">Build a custom workout using the exercise library</p>
          </div>
          <Dumbbell size={16} className="text-primary/50 flex-shrink-0" />
        </button>
      </div>

      {!isSubscribed && (
        <div
          className="mx-4 mb-4 rounded-2xl border border-primary/30 overflow-hidden shadow-md"
          style={{ background: 'linear-gradient(135deg, var(--color-primary)/8, var(--color-primary-dark)/5)' }}
        >
          <div className="h-0.5 w-full" style={{ background: 'linear-gradient(to right, var(--color-primary-light), var(--color-primary-dark))' }} />
          <div className="px-4 py-4">
            <p className="text-sm font-black text-text-primary mb-1">Unlock all programs</p>
            <p className="text-xs text-text-muted mb-3">Purchase programs individually or join a SuppScription plan.</p>
            <button
              onClick={() => router.push('/subscribe')}
              className="h-9 px-4 rounded-xl text-white text-xs font-black tracking-widest shadow-primary hover:shadow-md active:scale-[0.98] transition-all"
              style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}
            >
              START FREE TRIAL
            </button>
          </div>
        </div>
      )}

      {programs.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-8 text-center py-20">
          <p className="text-base font-semibold text-text-primary mb-2">No programs available yet</p>
          <p className="text-sm text-text-muted">Check back soon — new programs are added regularly.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 px-4 pb-6">
          {programs.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              isSubscribed={isSubscribed}
              onEnroll={handleEnroll}
              onUnenroll={handleUnenroll}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Library Client ───────────────────────────────────────────────────────

type Tab = 'programs' | 'exercises'

function LibraryClientInner({ programs, isSubscribed }: { programs: ProgramItem[]; isSubscribed: boolean }) {
  const searchParams = useSearchParams()
  const defaultTab = (searchParams.get('tab') as Tab) ?? 'programs'
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab)

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'programs', label: 'Programs', icon: <ShoppingBag size={14} /> },
    { id: 'exercises', label: 'Exercises', icon: <Dumbbell size={14} /> },
  ]

  const HEADER_G = 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))'

  return (
    <div className="flex flex-col min-h-screen bg-background animate-fade-in">
      {/* ── Gradient Header Card ─────────────────────────────────── */}
      <div className="px-4 pt-12 pb-4">
        <div className="rounded-2xl overflow-hidden shadow-xl border border-white/10" style={{ background: HEADER_G }}>
          <div className="px-5 py-5">
            <p className="text-xs font-black text-white/60 tracking-widest">BROWSE</p>
            <h1 className="text-3xl font-black tracking-tight text-white mt-0.5">LIBRARY</h1>
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 pb-0">
        <div
          className="flex gap-1 rounded-xl p-1 border border-border shadow-sm"
          style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-black tracking-wide transition-all',
                activeTab === tab.id ? 'text-white shadow-primary' : 'text-text-muted hover:text-text-primary',
              )}
              style={activeTab === tab.id ? { background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' } : {}}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 pt-4">
        {activeTab === 'programs' ? (
          <ProgramsTab programs={programs} isSubscribed={isSubscribed} />
        ) : (
          <ExercisesClient />
        )}
      </div>
    </div>
  )
}

export function LibraryClient({ programs, isSubscribed }: { programs: ProgramItem[]; isSubscribed: boolean }) {
  return (
    <Suspense fallback={null}>
      <LibraryClientInner programs={programs} isSubscribed={isSubscribed} />
    </Suspense>
  )
}
