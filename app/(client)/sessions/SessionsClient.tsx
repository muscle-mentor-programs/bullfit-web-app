'use client'

import { cn } from '@/lib/utils/cn'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Clock, Zap } from 'lucide-react'
import Link from 'next/link'
import { useState, useMemo } from 'react'

interface SessionItem {
  id: string
  scheduled_date: string
  started_at: string | null
  completed_at: string | null
  program_session: {
    id: string
    title: string
    description: string | null
    day_of_week: number
    program_week: {
      week_number: number
      program: {
        title: string
      }
    }
  }
}

interface SessionsClientProps {
  sessions: SessionItem[]
  isSubscribed: boolean
}

const HEADER_G = 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))'

export function SessionsClient({ sessions, isSubscribed: _isSubscribed }: SessionsClientProps) {
  const [viewMonth, setViewMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('left')

  // Build a map from date string → sessions
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, SessionItem[]>()
    for (const s of sessions) {
      const list = map.get(s.scheduled_date) ?? []
      list.push(s)
      map.set(s.scheduled_date, list)
    }
    return map
  }, [sessions])

  function goPrevMonth() {
    setSlideDir('right')
    setViewMonth((m) => subMonths(m, 1))
  }

  function goNextMonth() {
    setSlideDir('left')
    setViewMonth((m) => addMonths(m, 1))
  }

  // Calendar grid
  const monthStart = startOfMonth(viewMonth)
  const monthEnd = endOfMonth(viewMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Leading blanks (Sun-based: 0=Sun, 1=Mon, …, 6=Sat)
  const startDayOfWeek = getDay(monthStart) // 0=Sun naturally
  const leadingBlanks = startDayOfWeek

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
  const selectedSessions = sessionsByDate.get(selectedDateStr) ?? []

  return (
    <div className="flex flex-col min-h-screen bg-background animate-fade-in">
      {/* ── Gradient Header Card ─────────────────────────────────── */}
      <div className="px-4 pt-12 pb-4">
        <div className="rounded-2xl overflow-hidden shadow-xl border border-white/10" style={{ background: HEADER_G }}>
          <div className="px-5 py-5 flex items-end justify-between">
            <div>
              <p className="text-xs font-black text-white/60 tracking-widest">SCHEDULE</p>
              <h1 className="text-3xl font-black tracking-tight text-white mt-0.5">SESSIONS</h1>
            </div>
            <Link
              href="/sessions/history"
              className="text-[10px] font-black tracking-widest text-white/60 hover:text-white/90 transition-colors pb-0.5"
            >
              HISTORY →
            </Link>
          </div>
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between px-4 pb-3">
        <button
          onClick={goPrevMonth}
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-border shadow-sm text-text-muted hover:text-text-primary hover:bg-surface-2 transition-all"
          style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
        >
          <ChevronLeft size={18} />
        </button>
        <h2
          key={format(viewMonth, 'yyyy-MM')}
          className="text-base font-black text-text-primary animate-fade-in"
        >
          {format(viewMonth, 'MMMM yyyy').toUpperCase()}
        </h2>
        <button
          onClick={goNextMonth}
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-border shadow-sm text-text-muted hover:text-text-primary hover:bg-surface-2 transition-all"
          style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 px-3 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-center text-[11px] font-black text-text-muted py-1 tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        key={format(viewMonth, 'yyyy-MM')}
        className={cn(
          'grid grid-cols-7 gap-y-1 px-3 mb-4 overflow-hidden',
          slideDir === 'left' ? 'animate-slide-in-right' : 'animate-slide-in-left',
        )}
        style={{ animationDuration: '0.22s' }}
      >
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const hasSessions = sessionsByDate.has(dateStr)
          const daySessions = sessionsByDate.get(dateStr) ?? []
          const allComplete = hasSessions && daySessions.every((s) => s.completed_at !== null)
          const isSelected = isSameDay(day, selectedDate)
          const todayDay = isToday(day)
          const inMonth = isSameMonth(day, viewMonth)

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(day)}
              className={cn(
                'flex flex-col items-center justify-center mx-auto w-9 h-9 rounded-xl text-sm font-black transition-all',
                isSelected
                  ? 'text-white shadow-primary'
                  : todayDay
                  ? 'border-2 border-primary text-primary font-black'
                  : inMonth
                  ? 'text-text-primary hover:bg-surface-2'
                  : 'text-text-muted opacity-40',
              )}
              style={isSelected ? { background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' } : {}}
            >
              <span>{format(day, 'd')}</span>
              {hasSessions && !isSelected && (
                <span
                  className={cn(
                    'w-1 h-1 rounded-full mt-0.5',
                    allComplete ? 'bg-success' : 'bg-accent',
                  )}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day sessions */}
      <div className="flex-1 px-4 pb-6">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-0.5 w-3 rounded-full" style={{ background: 'linear-gradient(to right, var(--color-primary-light), var(--color-primary-dark))' }} />
          <p className="text-[11px] font-black tracking-widest text-text-secondary">
            {isToday(selectedDate) ? 'TODAY' : format(selectedDate, 'EEEE, MMMM d').toUpperCase()}
          </p>
        </div>

        {selectedSessions.length === 0 ? (
          <div
            className="rounded-2xl border border-border p-6 text-center shadow-md animate-fade-in"
            style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
          >
            <p className="text-sm font-black text-text-primary">REST DAY</p>
            <p className="text-xs text-text-muted mt-1">No sessions scheduled.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {selectedSessions.map((session) => {
              const ps = session.program_session
              const program = ps.program_week?.program
              const isComplete = session.completed_at !== null
              const isStarted = session.started_at !== null && !isComplete

              return (
                <div
                  key={session.id}
                  className="rounded-2xl border border-border overflow-hidden animate-fade-in-up shadow-md"
                  style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
                >
                  {/* Gradient top stripe */}
                  {isComplete ? (
                    <div className="h-1 w-full" style={{ background: 'linear-gradient(to right, #34d399, var(--color-success))' }} />
                  ) : (
                    <div className="h-1 w-full" style={{ background: 'linear-gradient(to right, var(--color-primary-light), var(--color-primary-dark))' }} />
                  )}

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}
                          >
                            <Zap size={10} className="text-white" />
                          </div>
                          <p className="text-[10px] font-black tracking-widest text-primary truncate">
                            {program?.title?.toUpperCase()} · WEEK {ps.program_week?.week_number}
                          </p>
                        </div>
                        <p className="text-base font-black text-text-primary mt-0.5">
                          {ps.title.toUpperCase()}
                        </p>
                        {ps.description && (
                          <p className="text-xs text-text-muted mt-1 line-clamp-2">
                            {ps.description}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {isComplete ? (
                          <CheckCircle2 size={22} className="text-success" />
                        ) : isStarted ? (
                          <Clock size={22} className="text-warning" />
                        ) : (
                          <Circle size={22} className="text-border" />
                        )}
                      </div>
                    </div>

                    {isComplete ? (
                      <Link
                        href={`/sessions/${session.id}/log`}
                        className={cn(
                          'mt-4 flex h-10 w-full items-center justify-center rounded-xl gap-2',
                          'text-sm font-black tracking-widest border border-border',
                          'text-text-secondary transition-colors hover:text-primary hover:border-primary/40',
                        )}
                        style={{ background: 'var(--color-surface-2)' }}
                      >
                        VIEW LOG
                      </Link>
                    ) : (
                      <Link
                        href={`/sessions/${session.id}/active`}
                        className={cn(
                          'mt-4 flex h-11 w-full items-center justify-center rounded-xl gap-2',
                          'text-white text-sm font-black tracking-widest',
                          'transition-all duration-150 hover:shadow-md active:scale-[0.98]',
                        )}
                        style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}
                      >
                        {isStarted ? 'RESUME SESSION' : 'START SESSION'}
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
