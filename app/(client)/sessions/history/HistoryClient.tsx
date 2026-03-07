'use client'

import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import { format, parseISO, formatDuration, intervalToDuration } from 'date-fns'
import { ArrowLeft, CheckCircle2, ChevronRight, Clock, Trash2, Zap } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface SessionItem {
  id: string
  scheduled_date: string
  started_at: string | null
  completed_at: string | null
  program_session: {
    id: string
    title: string
    program_week: {
      week_number: number
      program: { title: string }
    }
  }
}

interface Props {
  sessions: SessionItem[]
}

function getDuration(started: string | null, completed: string | null): string {
  if (!started || !completed) return ''
  const dur = intervalToDuration({ start: new Date(started), end: new Date(completed) })
  if (dur.hours && dur.hours > 0) return `${dur.hours}h ${dur.minutes ?? 0}m`
  if (dur.minutes && dur.minutes > 0) return `${dur.minutes}m`
  return '<1m'
}

function groupByMonth(sessions: SessionItem[]): { label: string; items: SessionItem[] }[] {
  const groups: Record<string, SessionItem[]> = {}
  for (const s of sessions) {
    const key = format(parseISO(s.completed_at ?? s.scheduled_date), 'yyyy-MM')
    if (!groups[key]) groups[key] = []
    groups[key].push(s)
  }
  return Object.entries(groups).map(([key, items]) => ({
    label: format(parseISO(`${key}-01`), 'MMMM yyyy').toUpperCase(),
    items,
  }))
}

const HEADER_G = 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))'

export function HistoryClient({ sessions: initialSessions }: Props) {
  const router = useRouter()
  const [sessions, setSessions] = useState(initialSessions)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  async function handleDelete(sessionId: string) {
    setDeletingId(sessionId)
    try {
      const supabase = createClient()

      // 1. Get all exercise log IDs for this session
      const { data: exLogs } = await supabase
        .from('user_exercise_logs')
        .select('id')
        .eq('user_session_id', sessionId)

      const exLogIds = (exLogs ?? []).map((r: any) => r.id)

      // 2. Delete set logs
      if (exLogIds.length > 0) {
        await supabase
          .from('user_set_logs')
          .delete()
          .in('user_exercise_log_id', exLogIds)
      }

      // 3. Delete exercise logs
      await supabase
        .from('user_exercise_logs')
        .delete()
        .eq('user_session_id', sessionId)

      // 4. Reset session timestamps
      await supabase
        .from('user_sessions')
        .update({ completed_at: null, started_at: null })
        .eq('id', sessionId)

      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      setConfirmId(null)
    } catch (err) {
      console.error('Delete session error:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const groups = groupByMonth(sessions)

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <div className="rounded-2xl overflow-hidden shadow-xl border border-white/10" style={{ background: HEADER_G }}>
          <div className="px-5 py-5 flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white flex-shrink-0"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <p className="text-xs font-black text-white/60 tracking-widest">SESSIONS</p>
              <h1 className="text-3xl font-black tracking-tight text-white mt-0.5">HISTORY</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-10">
        {sessions.length === 0 ? (
          <div
            className="rounded-2xl border border-border p-8 text-center shadow-md"
            style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
          >
            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: HEADER_G }}>
              <CheckCircle2 size={24} className="text-white" />
            </div>
            <p className="text-sm font-black text-text-primary">No completed workouts yet</p>
            <p className="text-xs text-text-muted mt-1.5">Start a session to see your history here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {groups.map((group) => (
              <div key={group.label}>
                {/* Month header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-0.5 w-3 rounded-full" style={{ background: HEADER_G }} />
                  <p className="text-[11px] font-black tracking-widest text-text-secondary">{group.label}</p>
                </div>

                <div className="flex flex-col gap-3">
                  {group.items.map((session) => {
                    const ps = session.program_session
                    const program = ps?.program_week?.program
                    const dateStr = session.completed_at
                      ? format(parseISO(session.completed_at), 'EEE, MMM d')
                      : format(parseISO(session.scheduled_date), 'EEE, MMM d')
                    const duration = getDuration(session.started_at, session.completed_at)
                    const isDeleting = deletingId === session.id
                    const isConfirming = confirmId === session.id

                    return (
                      <div
                        key={session.id}
                        className="rounded-2xl border border-border overflow-hidden shadow-md"
                        style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
                      >
                        {/* Top stripe */}
                        <div className="h-1 w-full" style={{ background: 'linear-gradient(to right, #34d399, var(--color-success, #22c55e))' }} />

                        <div className="p-4">
                          {/* Top row: program badge */}
                          <div className="flex items-center gap-2 mb-1.5">
                            <div
                              className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                              style={{ background: HEADER_G }}
                            >
                              <Zap size={10} className="text-white" />
                            </div>
                            <p className="text-[10px] font-black tracking-widest text-primary truncate">
                              {program?.title?.toUpperCase()} · WEEK {ps?.program_week?.week_number}
                            </p>
                          </div>

                          {/* Session title */}
                          <p className="text-base font-black text-text-primary">
                            {ps?.title?.toUpperCase() ?? 'WORKOUT'}
                          </p>

                          {/* Date + duration */}
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-xs text-text-muted">{dateStr}</span>
                            {duration && (
                              <>
                                <span className="text-text-muted/40 text-xs">·</span>
                                <div className="flex items-center gap-1 text-xs text-text-muted">
                                  <Clock size={11} />
                                  {duration}
                                </div>
                              </>
                            )}
                          </div>

                          {/* Actions */}
                          {isConfirming ? (
                            <div className="mt-3 flex items-center gap-2">
                              <p className="text-xs text-text-muted flex-1">Delete this workout log?</p>
                              <button
                                onClick={() => setConfirmId(null)}
                                className="h-8 px-3 rounded-lg border border-border text-xs font-black text-text-secondary"
                              >
                                CANCEL
                              </button>
                              <button
                                onClick={() => handleDelete(session.id)}
                                disabled={isDeleting}
                                className="h-8 px-3 rounded-lg text-xs font-black text-white bg-red-500 disabled:opacity-50"
                              >
                                {isDeleting ? 'DELETING…' : 'DELETE'}
                              </button>
                            </div>
                          ) : (
                            <div className="mt-3 flex items-center gap-2">
                              <Link
                                href={`/sessions/${session.id}/log`}
                                className={cn(
                                  'flex-1 h-9 rounded-xl border border-border flex items-center justify-center gap-1.5',
                                  'text-xs font-black text-text-secondary',
                                  'hover:text-primary hover:border-primary/40 transition-colors',
                                )}
                                style={{ background: 'var(--color-surface-2)' }}
                              >
                                VIEW / EDIT
                                <ChevronRight size={13} />
                              </Link>
                              <button
                                onClick={() => setConfirmId(session.id)}
                                className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-text-muted hover:text-red-500 hover:border-red-300 transition-colors"
                                style={{ background: 'var(--color-surface-2)' }}
                                aria-label="Delete workout"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
