'use client'

import { cn } from '@/lib/utils/cn'
import { StartDateModal } from '@/components/ui/StartDateModal'
import { CalendarPlus, CheckCircle2, Clock, Eye, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

interface ProgramItem {
  id: string
  title: string
  description: string
  duration_weeks: number
  enrolled: boolean
  first_day_of_week: number
}

interface MarketplaceClientProps {
  programs: ProgramItem[]
  isSubscribed: boolean
}

// ─── Program Card ─────────────────────────────────────────────────────────────

function ProgramCard({
  program,
  isSubscribed,
}: {
  program: ProgramItem
  isSubscribed: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [enrolled, setEnrolled] = useState(program.enrolled)
  const [error, setError] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [changeDateModalOpen, setChangeDateModalOpen] = useState(false)

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
    <div
      className="rounded-2xl border border-border overflow-hidden shadow-md"
      style={{
        background:
          'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))',
      }}
    >
      {/* Accent top stripe */}
      <div
        className="h-1 w-full"
        style={{
          background:
            'linear-gradient(to right, var(--color-primary-light), var(--color-primary-dark))',
        }}
      />

      <div className="p-4">
        {/* Name + description */}
        <div className="mb-3">
          <h3 className="text-base font-black text-text-primary leading-snug">
            {program.title.toUpperCase()}
          </h3>
          <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed">
            {program.description}
          </p>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-widest text-text-muted mt-2">
            <Clock size={11} />
            {program.duration_weeks} WEEKS
          </span>
        </div>

        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Link
            href={`/marketplace/${program.id}`}
            className={cn(
              'flex-1 h-10 flex items-center justify-center gap-1.5 rounded-xl',
              'border-2 border-border text-xs font-black tracking-wide text-text-muted',
              'hover:border-border-strong hover:text-text-primary transition-all duration-150',
            )}
          >
            <Eye size={13} />
            PREVIEW
          </Link>

          {enrolled ? (
            <div className="flex-1 flex gap-1.5">
              {/* Tap "IN CALENDAR" to change the start date */}
              <button
                onClick={() => setChangeDateModalOpen(true)}
                disabled={loading}
                className={cn(
                  'flex-1 h-10 flex items-center justify-center gap-1.5 rounded-xl',
                  'text-xs font-black tracking-wide transition-all disabled:opacity-50',
                )}
                style={{
                  background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                  color: 'var(--color-primary)',
                }}
              >
                {loading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={13} />
                )}
                IN CALENDAR
              </button>
              {/* Remove from calendar */}
              <button
                onClick={handleRemove}
                disabled={loading}
                className={cn(
                  'w-10 h-10 flex items-center justify-center rounded-xl',
                  'border border-border text-text-muted',
                  'hover:border-error/40 hover:text-error transition-colors disabled:opacity-50',
                )}
                aria-label="Remove from calendar"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={openDatePicker}
              disabled={loading}
              className={cn(
                'flex-1 h-10 flex items-center justify-center gap-1.5 rounded-xl',
                'text-xs font-black tracking-wide text-white',
                'transition-all duration-150 active:scale-[0.97] disabled:opacity-50',
              )}
              style={{
                background:
                  'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))',
              }}
            >
              {loading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <CalendarPlus size={13} />
              )}
              {loading ? 'ADDING...' : 'ADD TO CALENDAR'}
            </button>
          )}
        </div>
      </div>

      {addModalOpen && (
        <StartDateModal
          firstDayOfWeek={program.first_day_of_week}
          onConfirm={handleAddToCalendar}
          onClose={() => setAddModalOpen(false)}
        />
      )}
      {changeDateModalOpen && (
        <StartDateModal
          firstDayOfWeek={program.first_day_of_week}
          onConfirm={handleChangeStartDate}
          onClose={() => setChangeDateModalOpen(false)}
        />
      )}
    </div>
  )
}

// ─── Success Banner ───────────────────────────────────────────────────────────

function SuccessBanner({ programId }: { programId: string | null }) {
  const [visible, setVisible] = useState(true)
  if (!programId || !visible) return null
  return (
    <div className="mx-4 mb-4 rounded-2xl border border-border overflow-hidden shadow-sm">
      <div
        className="h-1 w-full"
        style={{ background: 'linear-gradient(to right, #34d399, #059669)' }}
      />
      <div className="px-4 py-3 flex items-center justify-between gap-3 bg-surface">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
          <p className="text-sm font-medium text-text-primary">
            Program added to your calendar!
          </p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-text-muted hover:text-text-primary text-xs font-black"
        >
          DISMISS
        </button>
      </div>
    </div>
  )
}

// ─── Marketplace Content ──────────────────────────────────────────────────────

function MarketplaceContent({
  programs,
  isSubscribed,
}: {
  programs: ProgramItem[]
  isSubscribed: boolean
}) {
  const searchParams = useSearchParams()
  const successProgram =
    searchParams.get('success') === '1' ? searchParams.get('program') : null

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-10 pb-4">
        <div
          className="rounded-2xl overflow-hidden border border-primary/20 shadow-lg relative"
          style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}
        >
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)' }} />
          <div className="absolute right-10 bottom-0 w-16 h-16 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)' }} />
          <div className="px-5 py-4 relative">
            <p className="text-xs font-bold tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.60)' }}>BROWSE</p>
            <h1 className="text-3xl font-black tracking-tight text-white">PROGRAMS</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.70)' }}>Training programs built by your coach.</p>
          </div>
        </div>
      </div>

      <SuccessBanner programId={successProgram} />

      {programs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center py-20">
          <p className="text-base font-black text-text-primary mb-2">
            NO PROGRAMS AVAILABLE YET
          </p>
          <p className="text-sm text-text-muted">
            Check back soon — your coach is building programs for you.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-4 pb-6">
          {programs.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              isSubscribed={isSubscribed}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function MarketplaceClient({ programs, isSubscribed }: MarketplaceClientProps) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen bg-background">
          <div className="px-4 pt-10 pb-4">
            <h1 className="text-3xl font-black text-text-primary">PROGRAMS</h1>
          </div>
        </div>
      }
    >
      <MarketplaceContent programs={programs} isSubscribed={isSubscribed} />
    </Suspense>
  )
}
