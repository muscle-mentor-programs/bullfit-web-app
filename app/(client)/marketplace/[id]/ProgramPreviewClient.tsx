'use client'

import { cn } from '@/lib/utils/cn'
import { StartDateModal } from '@/components/ui/StartDateModal'
import { CalendarPlus, CheckCircle2, ChevronLeft, Clock, Dumbbell, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface Week {
  week_number: number
  sessions: {
    id: string
    title: string
    day_of_week: number
    exercise_count: number
  }[]
}

interface Props {
  program: {
    id: string
    title: string
    description: string
    duration_weeks: number
  }
  weeks: Week[]
  isSubscribed: boolean
  alreadyEnrolled: boolean
}

// ─── Header Gradient ──────────────────────────────────────────────────────────

const HEADER_G = 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))'

export function ProgramPreviewClient({
  program,
  weeks,
  isSubscribed,
  alreadyEnrolled,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [enrolled, setEnrolled] = useState(alreadyEnrolled)
  const [error, setError] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [changeDateModalOpen, setChangeDateModalOpen] = useState(false)

  // Compute the first day of week from week 1 sessions
  const firstDayOfWeek = useMemo(() => {
    const week1 = weeks.find((w) => w.week_number === 1)
    if (!week1 || week1.sessions.length === 0) return 1
    return Math.min(...week1.sessions.map((s) => s.day_of_week))
  }, [weeks])

  function openDatePicker() {
    if (!isSubscribed) {
      router.push('/subscribe')
      return
    }
    setAddModalOpen(true)
  }

  async function handleAddToCalendar(startDate: string) {
    setAddModalOpen(false)
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/programs/${program.id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_date: startDate }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to add program')
      setEnrolled(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleChangeStartDate(startDate: string) {
    setChangeDateModalOpen(false)
    setLoading(true)
    setError('')
    try {
      await fetch(`/api/programs/${program.id}/enroll`, { method: 'DELETE' })
      const res = await fetch(`/api/programs/${program.id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_date: startDate }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to update start date')
      setEnrolled(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleRemove() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/programs/${program.id}/enroll`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove program')
      setEnrolled(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-8">

      {/* ── Gradient Header ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: HEADER_G }}>
        {/* Back button */}
        <div className="flex items-center gap-2 px-4 pt-12 pb-2">
          <Link
            href="/marketplace"
            className="flex items-center gap-1 text-white/80 hover:text-white transition-colors text-sm font-black tracking-wide"
          >
            <ChevronLeft size={16} />
            PROGRAMS
          </Link>
        </div>

        {/* Program info */}
        <div className="px-4 pt-2 pb-6">
          <h1 className="text-2xl font-black text-white leading-tight">
            {program.title.toUpperCase()}
          </h1>
          <p className="text-sm text-white/70 mt-2 leading-relaxed">
            {program.description}
          </p>
          <span className="inline-flex items-center gap-1.5 mt-3 text-[10px] font-black tracking-widest text-white/60">
            <Clock size={11} />
            {program.duration_weeks} WEEKS
          </span>
        </div>
      </div>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <div className="px-4 pt-5 pb-1">
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        {enrolled ? (
          <div className="flex flex-col gap-2">
            <div
              className="h-12 w-full flex items-center justify-center gap-2 rounded-2xl text-sm font-black tracking-wide"
              style={{
                background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                color: 'var(--color-primary)',
              }}
            >
              <CheckCircle2 size={16} />
              ADDED TO CALENDAR
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setChangeDateModalOpen(true)}
                disabled={loading}
                className={cn(
                  'flex-1 h-10 flex items-center justify-center gap-1.5 rounded-xl',
                  'border border-border text-xs font-black tracking-wide text-text-secondary',
                  'hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-50',
                )}
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : <CalendarPlus size={13} />}
                CHANGE DATE
              </button>
              <button
                onClick={handleRemove}
                disabled={loading}
                className={cn(
                  'flex-1 h-10 flex items-center justify-center gap-1.5 rounded-xl',
                  'border border-border text-xs font-black tracking-wide text-text-muted',
                  'hover:border-error/40 hover:text-error transition-colors disabled:opacity-50',
                )}
              >
                <Trash2 size={13} />
                REMOVE
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={openDatePicker}
            disabled={loading}
            className={cn(
              'h-12 w-full flex items-center justify-center gap-2 rounded-2xl',
              'text-sm font-black tracking-wide text-white shadow-md',
              'transition-all duration-150 active:scale-[0.98] disabled:opacity-50',
            )}
            style={{ background: HEADER_G }}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CalendarPlus size={16} />
            )}
            {loading ? 'ADDING...' : 'ADD TO CALENDAR'}
          </button>
        )}
      </div>

      {/* ── Program Content ──────────────────────────────────────────── */}
      {weeks.length > 0 && (
        <div className="px-4 pt-5 flex flex-col gap-3">
          <p className="text-[10px] font-black tracking-widest text-text-muted">
            PROGRAM OVERVIEW
          </p>

          {weeks.map((week) => (
            <div
              key={week.week_number}
              className="rounded-2xl border border-border overflow-hidden shadow-sm"
              style={{
                background:
                  'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))',
              }}
            >
              {/* Week header */}
              <div
                className="h-0.5 w-full"
                style={{
                  background:
                    'linear-gradient(to right, var(--color-primary-light), var(--color-primary-dark))',
                }}
              />
              <div className="px-4 py-3 border-b border-border">
                <p className="text-[10px] font-black tracking-widest text-primary">
                  WEEK {week.week_number}
                </p>
              </div>

              {/* Sessions */}
              <div className="divide-y divide-border">
                {week.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background:
                          'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))',
                      }}
                    >
                      <Dumbbell size={13} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-text-primary leading-snug truncate">
                        {session.title.toUpperCase()}
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {DAY_NAMES[session.day_of_week] ?? `Day ${session.day_of_week}`}
                        {session.exercise_count > 0
                          ? ` · ${session.exercise_count} exercise${session.exercise_count !== 1 ? 's' : ''}`
                          : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {addModalOpen && (
        <StartDateModal
          firstDayOfWeek={firstDayOfWeek}
          onConfirm={handleAddToCalendar}
          onClose={() => setAddModalOpen(false)}
        />
      )}
      {changeDateModalOpen && (
        <StartDateModal
          firstDayOfWeek={firstDayOfWeek}
          onConfirm={handleChangeStartDate}
          onClose={() => setChangeDateModalOpen(false)}
        />
      )}
    </div>
  )
}
