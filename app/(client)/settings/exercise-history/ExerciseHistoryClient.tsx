'use client'

import { cn } from '@/lib/utils/cn'
import { ChevronLeft, ChevronDown, ChevronUp, Dumbbell, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { SessionWithExercises, SetLog } from './page'

const HEADER_G = 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))'

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  const d = new Date(iso)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const thisYear = new Date().getFullYear()
  const datePart = `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`
  return d.getFullYear() !== thisYear ? `${datePart}, ${d.getFullYear()}` : datePart
}

function fmtSetsPreview(sets: SetLog[]): string {
  const done = sets.filter((s) => s.completed || s.weight_lbs || s.reps)
  if (done.length === 0) return ''
  return done
    .slice(0, 2)
    .map((s) => {
      const w = s.weight_lbs != null ? `${s.weight_lbs}` : '—'
      const r = s.reps != null ? `×${s.reps}` : ''
      return r ? `${w} ${r}` : w
    })
    .join(', ') + (done.length > 2 ? ` +${done.length - 2}` : '')
}

// ── Session Card ─────────────────────────────────────────────────────────────

function SessionCard({ session }: { session: SessionWithExercises }) {
  const [expanded, setExpanded] = useState(false)

  const totalSets = session.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed || s.weight_lbs || s.reps).length,
    0,
  )

  return (
    <div className="rounded-2xl border border-border overflow-hidden shadow-sm">
      {/* Session header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-3 px-4 py-4 text-left transition-colors"
        style={{ background: 'var(--color-surface)' }}
      >
        {/* Date badge */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: HEADER_G }}
        >
          <Calendar size={16} className="text-white" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-text-primary truncate">
            {fmtDate(session.completed_at)}
          </p>
          {session.session_title && (
            <p className="text-xs font-semibold text-text-secondary truncate mt-0.5">
              {session.session_title}
            </p>
          )}
          <p className="text-[11px] text-text-muted mt-0.5">
            {session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''}
            {totalSets > 0 ? ` · ${totalSets} set${totalSets !== 1 ? 's' : ''}` : ''}
          </p>
        </div>

        {/* Chevron */}
        <div className="flex-shrink-0">
          {expanded
            ? <ChevronUp size={15} className="text-text-muted" />
            : <ChevronDown size={15} className="text-text-muted" />}
        </div>
      </button>

      {/* Expanded: list of exercises */}
      {expanded && (
        <div className="border-t border-border divide-y divide-border bg-background">
          {session.exercises.length === 0 ? (
            <p className="px-4 py-4 text-xs text-text-muted italic">No exercise data for this session.</p>
          ) : (
            session.exercises.map((ex) => {
              const doneSets = ex.sets.filter((s) => s.completed || s.weight_lbs || s.reps)
              const preview = fmtSetsPreview(ex.sets)
              return (
                <ExerciseRow key={ex.exercise_id} ex={ex} doneSets={doneSets} preview={preview} />
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

// ── Exercise Row ─────────────────────────────────────────────────────────────

function ExerciseRow({
  ex,
  doneSets,
  preview,
}: {
  ex: SessionWithExercises['exercises'][number]
  doneSets: SetLog[]
  preview: string
}) {
  const [showSets, setShowSets] = useState(false)

  return (
    <div>
      <button
        onClick={() => setShowSets((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface transition-colors"
      >
        {/* Icon */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--color-surface-2), var(--color-surface))' }}
        >
          <Dumbbell size={13} className="text-text-muted" />
        </div>

        {/* Name + preview */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-text-primary truncate">{ex.name}</p>
          {ex.muscle_groups.length > 0 && (
            <p className="text-[10px] text-text-muted truncate">{ex.muscle_groups.join(', ')}</p>
          )}
          {preview && (
            <p className="text-[11px] text-text-secondary mt-0.5 truncate">
              {doneSets.length} set{doneSets.length !== 1 ? 's' : ''} · {preview}
            </p>
          )}
        </div>

        {/* Toggle */}
        {doneSets.length > 0 && (
          showSets
            ? <ChevronUp size={13} className="text-text-muted flex-shrink-0" />
            : <ChevronDown size={13} className="text-text-muted flex-shrink-0" />
        )}
      </button>

      {/* Set breakdown */}
      {showSets && doneSets.length > 0 && (
        <div className="px-4 pb-3 flex flex-col gap-1.5 bg-background">
          {doneSets.map((set) => (
            <div key={set.set_number} className="flex items-center gap-3">
              <span
                className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0',
                  set.completed
                    ? 'text-white'
                    : 'bg-surface-2 border border-border text-text-muted',
                )}
                style={set.completed ? { background: HEADER_G } : {}}
              >
                {set.set_number}
              </span>
              <span className="text-sm font-semibold text-text-primary">
                {set.weight_lbs != null ? `${set.weight_lbs} lbs` : '—'}
                {set.reps != null ? ` × ${set.reps}` : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function ExerciseHistoryClient({ sessions }: { sessions: SessionWithExercises[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? sessions.filter(
        (s) =>
          s.session_title?.toLowerCase().includes(search.toLowerCase()) ||
          fmtDate(s.completed_at).toLowerCase().includes(search.toLowerCase()) ||
          s.exercises.some(
            (ex) =>
              ex.name.toLowerCase().includes(search.toLowerCase()) ||
              ex.muscle_groups.some((m) => m.toLowerCase().includes(search.toLowerCase())),
          ),
      )
    : sessions

  const totalExercises = sessions.reduce((acc, s) => acc + s.exercises.length, 0)

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Gradient header */}
      <div className="px-4 pt-12 pb-4">
        <div
          className="rounded-2xl overflow-hidden shadow-xl border border-white/10"
          style={{ background: HEADER_G }}
        >
          <div className="flex items-center gap-3 px-5 py-5">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0"
              aria-label="Go back"
            >
              <ChevronLeft size={18} className="text-white" />
            </button>
            <div>
              <p className="text-[10px] font-black text-white/60 tracking-widest uppercase">Profile</p>
              <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
                WORKOUT HISTORY
              </h1>
            </div>
          </div>

          {/* Stats bar */}
          {sessions.length > 0 && (
            <div className="flex items-center gap-5 px-5 pb-5">
              <div>
                <p className="text-[10px] font-black text-white/50 tracking-widest uppercase">Sessions</p>
                <p className="text-xl font-black text-white">{sessions.length}</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <p className="text-[10px] font-black text-white/50 tracking-widest uppercase">Exercises</p>
                <p className="text-xl font-black text-white">{totalExercises}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      {sessions.length > 0 && (
        <div className="px-4 mb-3">
          <input
            type="text"
            placeholder="Search by date, session, or exercise…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              'w-full h-11 px-4 rounded-xl border border-border bg-surface',
              'text-sm text-text-primary placeholder:text-text-muted/50',
              'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
            )}
          />
        </div>
      )}

      {/* Session list */}
      <div
        className="flex-1 px-4 flex flex-col gap-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 6rem)' }}
      >
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--color-surface-2), var(--color-background))' }}
            >
              <Dumbbell size={28} className="text-text-muted" />
            </div>
            <p className="text-text-muted font-semibold text-sm">No workouts logged yet</p>
            <p className="text-text-muted/60 text-xs text-center max-w-[220px]">
              Complete a session to start tracking your workout history here.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-text-muted text-sm">No sessions match &ldquo;{search}&rdquo;</p>
          </div>
        ) : (
          filtered.map((session) => (
            <SessionCard key={session.session_id} session={session} />
          ))
        )}
      </div>
    </div>
  )
}
