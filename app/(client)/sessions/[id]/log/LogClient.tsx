'use client'

import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import { format, parseISO, intervalToDuration } from 'date-fns'
import { AlertCircle, ArrowLeft, Check, CheckCircle2, ChevronDown, ChevronUp, Minus, Plus, Trash2, X, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface SetLog {
  id: string
  set_number: number
  weight_lbs: number | null
  reps: number | null
  completed: boolean
  logged_at: string | null
}

interface ExerciseLog {
  id: string
  exercise_id: string
  exercise_order: number
  notes?: string | null
  exercise: {
    id: string
    name: string
    muscle_groups: string[]
  }
  set_logs: SetLog[]
}

interface Session {
  id: string
  user_id: string
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
  session: Session
  exerciseLogs: ExerciseLog[]
}

function getDuration(started: string | null, completed: string | null): string {
  if (!started || !completed) return ''
  const dur = intervalToDuration({ start: new Date(started), end: new Date(completed) })
  if (dur.hours && dur.hours > 0) return `${dur.hours}h ${dur.minutes ?? 0}m`
  if (dur.minutes && dur.minutes > 0) return `${dur.minutes}m`
  return '<1m'
}

const HEADER_G = 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))'

// ─── Set Row ──────────────────────────────────────────────────────────────────

function SetRow({
  setLog,
  onUpdate,
  onRemove,
}: {
  setLog: SetLog
  onUpdate: (id: string, field: 'weight_lbs' | 'reps' | 'completed', value: number | boolean | null) => void
  onRemove: (id: string) => void
}) {
  const [weight, setWeight] = useState(setLog.weight_lbs != null ? String(setLog.weight_lbs) : '')
  const [reps, setReps] = useState(setLog.reps != null ? String(setLog.reps) : '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save(field: 'weight_lbs' | 'reps', raw: string) {
    const value = raw.trim() === '' ? null : parseFloat(raw)
    if (isNaN(value as number) && value !== null) return
    setSaving(true)
    await onUpdate(setLog.id, field, value)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1200)
  }

  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-200',
        setLog.completed ? 'border-primary/30' : 'border-border',
      )}
      style={{
        background: setLog.completed
          ? 'linear-gradient(135deg, rgba(74,126,212,0.07), rgba(15,58,122,0.10))'
          : 'var(--color-background)',
      }}
    >
      <div className="flex items-center gap-2 px-2.5 py-2">
        {/* Set badge */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
          style={
            setLog.completed
              ? { background: HEADER_G, color: 'white' }
              : { background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }
          }
        >
          {setLog.set_number}
        </div>

        {/* Weight */}
        <div className="flex-1 relative">
          <input
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={(e) => save('weight_lbs', e.target.value)}
            placeholder="—"
            className="w-full h-8 rounded-lg border border-border bg-background px-2 pr-7 text-sm text-text-primary text-center placeholder:text-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-text-muted pointer-events-none">lbs</span>
        </div>

        <span className="text-text-muted text-xs font-black flex-shrink-0">×</span>

        {/* Reps */}
        <div className="flex-1 relative">
          <input
            type="number"
            inputMode="numeric"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            onBlur={(e) => save('reps', e.target.value)}
            placeholder="—"
            className="w-full h-8 rounded-lg border border-border bg-background px-2 pr-8 text-sm text-text-primary text-center placeholder:text-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-text-muted pointer-events-none">reps</span>
        </div>

        {/* Completed toggle */}
        <button
          onClick={() => onUpdate(setLog.id, 'completed', !setLog.completed)}
          className={cn(
            'w-8 h-8 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all',
            setLog.completed ? 'border-transparent text-white' : 'border-border text-text-muted',
          )}
          style={setLog.completed ? { background: HEADER_G } : { background: 'var(--color-surface-2)' }}
          aria-label={setLog.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          <Check size={13} />
        </button>

        {/* Save indicator / remove button */}
        <div className="w-6 flex-shrink-0 flex items-center justify-center">
          {saving && <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />}
          {saved && !saving && <Check size={11} className="text-green-500" />}
          {!saving && !saved && (
            <button
              onClick={() => onRemove(setLog.id)}
              className="w-6 h-6 rounded-md flex items-center justify-center text-text-muted/40 hover:text-red-400 transition-colors"
              aria-label="Remove set"
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Exercise Card ────────────────────────────────────────────────────────────

function ExerciseCard({
  log,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onUpdateNotes,
}: {
  log: ExerciseLog
  onUpdateSet: (setId: string, field: 'weight_lbs' | 'reps' | 'completed', value: number | boolean | null) => void
  onAddSet: (logId: string) => void
  onRemoveSet: (logId: string, setId: string) => void
  onUpdateNotes: (logId: string, notes: string) => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [notes, setNotes] = useState(log.notes ?? '')
  const completedSets = log.set_logs.filter((s) => s.completed).length
  const totalSets = log.set_logs.length

  return (
    <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
      {/* Exercise header — gradient matching active session */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        style={{ background: HEADER_G }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-white truncate">
            {log.exercise?.name?.toUpperCase() ?? 'EXERCISE'}
          </p>
          {log.exercise?.muscle_groups?.length > 0 && (
            <p className="text-[10px] text-white/60 mt-0.5 capitalize">
              {log.exercise.muscle_groups.join(', ')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className="text-xs font-black text-white/70">
            {completedSets}/{totalSets} sets
          </span>
          {collapsed
            ? <ChevronDown size={15} className="text-white/70" />
            : <ChevronUp size={15} className="text-white/70" />
          }
        </div>
      </button>

      {!collapsed && (
        <div
          className="px-3 pt-2.5 pb-3 flex flex-col gap-2"
          style={{ background: 'var(--color-surface)' }}
        >
          {/* Column headers */}
          <div className="flex items-center gap-2 px-2.5">
            <span className="w-8 flex-shrink-0" />
            <span className="flex-1 text-center text-[9px] font-black text-text-muted tracking-widest">WEIGHT</span>
            <span className="w-4 flex-shrink-0" />
            <span className="flex-1 text-center text-[9px] font-black text-text-muted tracking-widest">REPS</span>
            <span className="w-8 flex-shrink-0 text-center text-[9px] font-black text-text-muted tracking-widest">DONE</span>
            <span className="w-6 flex-shrink-0" />
          </div>

          {/* Set rows */}
          {log.set_logs
            .slice()
            .sort((a, b) => a.set_number - b.set_number)
            .map((setLog) => (
              <SetRow
                key={setLog.id}
                setLog={setLog}
                onUpdate={onUpdateSet}
                onRemove={(setId) => onRemoveSet(log.id, setId)}
              />
            ))}

          {/* Add set button */}
          <button
            onClick={() => onAddSet(log.id)}
            className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors self-start"
          >
            <Plus size={13} />
            Add Set
          </button>

          {/* Notes textarea */}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={(e) => onUpdateNotes(log.id, e.target.value)}
            placeholder="Notes for this exercise…"
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background resize-none text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LogClient({ session, exerciseLogs: initialLogs }: Props) {
  const router = useRouter()
  const [exerciseLogs, setExerciseLogs] = useState(initialLogs)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const ps = session.program_session
  const program = ps?.program_week?.program
  const dateStr = session.completed_at
    ? format(parseISO(session.completed_at), 'EEE, MMM d, yyyy')
    : format(parseISO(session.scheduled_date), 'EEE, MMM d, yyyy')
  const duration = getDuration(session.started_at, session.completed_at)

  async function updateSet(
    setId: string,
    field: 'weight_lbs' | 'reps' | 'completed',
    value: number | boolean | null,
  ) {
    setSaveError(null)
    setExerciseLogs((prev) =>
      prev.map((log) => ({
        ...log,
        set_logs: log.set_logs.map((s) =>
          s.id === setId ? { ...s, [field]: value } : s,
        ),
      })),
    )

    const supabase = createClient()
    const { error } = await supabase
      .from('user_set_logs')
      .update({ [field]: value })
      .eq('id', setId)

    if (error) {
      setSaveError('Failed to save change — please try again.')
      console.error('Set update error:', error)
    }
  }

  async function addSet(exerciseLogId: string) {
    const log = exerciseLogs.find((l) => l.id === exerciseLogId)
    if (!log) return
    const nextSetNumber =
      log.set_logs.length > 0
        ? Math.max(...log.set_logs.map((s) => s.set_number)) + 1
        : 1

    const supabase = createClient()
    const { data: newSet, error } = await supabase
      .from('user_set_logs')
      .insert({
        user_exercise_log_id: exerciseLogId,
        set_number: nextSetNumber,
        weight_lbs: null,
        reps: null,
        completed: false,
        logged_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (!error && newSet) {
      setExerciseLogs((prev) =>
        prev.map((l) =>
          l.id === exerciseLogId
            ? { ...l, set_logs: [...l.set_logs, newSet as SetLog] }
            : l,
        ),
      )
    } else if (error) {
      setSaveError('Failed to add set — please try again.')
      console.error('Add set error:', error)
    }
  }

  async function removeSet(exerciseLogId: string, setId: string) {
    const supabase = createClient()
    const { error } = await supabase.from('user_set_logs').delete().eq('id', setId)
    if (!error) {
      setExerciseLogs((prev) =>
        prev.map((l) =>
          l.id === exerciseLogId
            ? { ...l, set_logs: l.set_logs.filter((s) => s.id !== setId) }
            : l,
        ),
      )
    } else {
      setSaveError('Failed to remove set — please try again.')
      console.error('Remove set error:', error)
    }
  }

  async function updateNotes(exerciseLogId: string, notesValue: string) {
    setExerciseLogs((prev) =>
      prev.map((l) => (l.id === exerciseLogId ? { ...l, notes: notesValue } : l)),
    )
    const supabase = createClient()
    const { error } = await supabase
      .from('user_exercise_logs')
      .update({ notes: notesValue || null })
      .eq('id', exerciseLogId)
    if (error) {
      setSaveError('Failed to save notes — please try again.')
      console.error('Notes update error:', error)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError(null)
    try {
      const supabase = createClient()

      const exLogIds = exerciseLogs.map((l) => l.id)

      if (exLogIds.length > 0) {
        const { error: e1 } = await supabase
          .from('user_set_logs')
          .delete()
          .in('user_exercise_log_id', exLogIds)
        if (e1) throw e1
      }

      const { error: e2 } = await supabase
        .from('user_exercise_logs')
        .delete()
        .eq('user_session_id', session.id)
      if (e2) throw e2

      const { error: e3 } = await supabase
        .from('user_sessions')
        .update({ completed_at: null, started_at: null })
        .eq('id', session.id)
      if (e3) throw e3

      router.replace('/sessions/history')
      router.refresh()
    } catch (err) {
      console.error('Delete error:', err)
      setDeleteError('Could not delete workout. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header — beveled card */}
      <div className="px-4 pt-12 pb-4">
        <div className="rounded-2xl overflow-hidden shadow-xl border border-white/10" style={{ background: HEADER_G }}>
          <div className="px-5 py-5 flex items-start gap-3">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 mt-1 rounded-xl bg-white/15 flex items-center justify-center text-white flex-shrink-0"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex-1 min-w-0">
              {program && (
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Zap size={10} className="text-white/60" />
                  <p className="text-[10px] font-black text-white/60 tracking-widest truncate">
                    {program.title.toUpperCase()} · WEEK {ps?.program_week?.week_number}
                  </p>
                </div>
              )}
              <h1 className="text-2xl font-black tracking-tight text-white">
                {ps?.title?.toUpperCase() ?? 'WORKOUT'}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-white/60">{dateStr}</p>
                {duration && (
                  <>
                    <span className="text-white/30 text-xs">·</span>
                    <p className="text-xs text-white/60">{duration}</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              <CheckCircle2 size={22} className="text-green-300 mt-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Save error */}
      {saveError && (
        <div className="mx-4 mb-2 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-red-500" />
          <p className="text-xs text-red-600 flex-1">{saveError}</p>
          <button onClick={() => setSaveError(null)} className="text-red-400 hover:text-red-600">
            <X size={13} />
          </button>
        </div>
      )}

      {/* Exercise logs */}
      <div className="flex-1 px-4 pb-6 flex flex-col gap-3">
        {exerciseLogs.length === 0 ? (
          <div
            className="rounded-2xl border border-border p-6 text-center"
            style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
          >
            <p className="text-sm font-black text-text-primary">No exercise data found</p>
            <p className="text-xs text-text-muted mt-1">This session may not have logged any exercises.</p>
          </div>
        ) : (
          exerciseLogs.map((log) => (
            <ExerciseCard
              key={log.id}
              log={log}
              onUpdateSet={updateSet}
              onAddSet={addSet}
              onRemoveSet={removeSet}
              onUpdateNotes={updateNotes}
            />
          ))
        )}

        {/* Delete section */}
        <div className="mt-4 pt-4 border-t border-border">
          {deleteError && (
            <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-red-500" />
              <p className="text-xs text-red-600">{deleteError}</p>
            </div>
          )}

          {confirmDelete ? (
            <div
              className="rounded-2xl border border-red-200 p-4"
              style={{ background: 'rgba(239,68,68,0.04)' }}
            >
              <p className="text-sm font-black text-text-primary mb-1">Delete this workout?</p>
              <p className="text-xs text-text-muted mb-4">
                This will permanently remove all logged sets and mark the session as not started. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 h-10 rounded-xl border border-border text-sm font-black text-text-secondary"
                  style={{ background: 'var(--color-surface-2)' }}
                >
                  CANCEL
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 h-10 rounded-xl text-sm font-black text-white bg-red-500 disabled:opacity-50 transition-opacity"
                >
                  {deleting ? 'DELETING…' : 'YES, DELETE'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className={cn(
                'w-full h-11 rounded-2xl border border-red-200 flex items-center justify-center gap-2',
                'text-sm font-black text-red-500 transition-colors',
                'hover:bg-red-50',
              )}
              style={{ background: 'rgba(239,68,68,0.04)' }}
            >
              <Trash2 size={15} />
              DELETE WORKOUT
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
