'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Reorder, useDragControls } from 'framer-motion'
import { AlertCircle, ArrowLeft, ChevronLeft, ChevronRight, GripVertical, Timer, Trophy, X } from 'lucide-react'
import { useActiveSession } from '@/hooks/useActiveSession'
import { ExerciseCard, type PrevSetData } from '@/components/ui/ExerciseCard'
import { cn } from '@/lib/utils/cn'
import type { UserSession, SessionExercise, Exercise } from '@/types'

const HEADER_G = 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))'

interface AdjacentSession {
  id: string
  title: string
  scheduled_date: string
}

// ── Wrapper that gives each Reorder.Item its own drag controls ─────────────
function DraggableExerciseItem({
  ex,
  index,
  prevSets,
  isOpen,
  onToggle,
  onAllComplete,
  addSet,
  removeSet,
  updateSet,
  toggleSetComplete,
  swapExercise,
  updateNotes,
  setSwapTarget,
}: {
  ex: ReturnType<typeof useActiveSession>['exercises'][number]
  index: number
  prevSets: PrevSetData[]
  isOpen: boolean
  onToggle: () => void
  onAllComplete: () => void
  addSet: (i: number) => void
  removeSet: (i: number, n: number) => void
  updateSet: (i: number, si: number, field: 'weightLbs' | 'reps', v: string) => void
  toggleSetComplete: (i: number, si: number) => void
  swapExercise: (i: number, e: Exercise) => void
  updateNotes: (i: number, n: string) => void
  setSwapTarget: (id: string) => void
}) {
  const dragControls = useDragControls()
  const containerRef = useRef<HTMLDivElement>(null)

  // Scroll the newly-opened card into view (below fixed header)
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 200)
    }
  }, [isOpen])

  return (
    <Reorder.Item
      key={ex.sessionExerciseId}
      value={ex}
      dragListener={false}
      dragControls={dragControls}
    >
      <div ref={containerRef}>
        <ExerciseCard
          exercise={ex.exercise}
          sessionExercise={{
            id: ex.sessionExerciseId,
            session_id: '',
            exercise_id: ex.exerciseId,
            exercise_order: ex.exerciseOrder,
            prescribed_sets: ex.prescribedSets,
            rep_range_min: ex.repRangeMin,
            rep_range_max: ex.repRangeMax,
            notes: ex.notes,
            rest_seconds: ex.restSeconds,
          }}
          sets={ex.sets}
          clientNotes={ex.clientNotes}
          prevSets={prevSets}
          isOpen={isOpen}
          onToggle={onToggle}
          onAllComplete={onAllComplete}
          onAddSet={() => addSet(index)}
          onRemoveSet={() => removeSet(index, ex.sets.length - 1)}
          onUpdateSet={(setIndex, field, value) => updateSet(index, setIndex, field, value)}
          onToggleSet={(setIndex) => toggleSetComplete(index, setIndex)}
          onSwap={() => setSwapTarget(ex.sessionExerciseId)}
          onNotesChange={(notes) => updateNotes(index, notes)}
          dragHandle={
            <span
              onPointerDown={(e) => {
                e.preventDefault()
                dragControls.start(e)
              }}
              className="touch-none cursor-grab active:cursor-grabbing p-1 -m-1"
              aria-label="Drag to reorder"
            >
              <GripVertical size={16} />
            </span>
          }
        />
      </div>
    </Reorder.Item>
  )
}

export default function ActiveSessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  const supabase = createClient()

  const [session, setSession] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [resumed, setResumed] = useState(false)
  const loadedRef = useRef(false)
  const [startTime] = useState(() => Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [swapTarget, setSwapTarget] = useState<string | null>(null)
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([])
  const [prevSession, setPrevSession] = useState<AdjacentSession | null>(null)
  const [nextSession, setNextSession] = useState<AdjacentSession | null>(null)
  // Which exercise card is currently open (accordion — only one at a time)
  const [openExerciseIndex, setOpenExerciseIndex] = useState<number | null>(0)
  // Map from exercise_id → previous set data
  const [prevSetsMap, setPrevSetsMap] = useState<Map<string, PrevSetData[]>>(new Map())

  // Touch/swipe tracking
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  const { exercises, setExercises, addSet, removeSet, updateSet, toggleSetComplete, swapExercise, updateNotes, completionPercent } =
    useActiveSession()

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setElapsed(Date.now() - startTime), 1000)
    return () => clearInterval(interval)
  }, [startTime])

  const formatElapsed = (ms: number) => {
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    const h = Math.floor(m / 60)
    if (h > 0) return `${h}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
    return `${m}:${String(s % 60).padStart(2, '0')}`
  }

  useEffect(() => {
    async function loadSession() {
      const { data: sessionData } = await supabase
        .from('user_sessions')
        .select(`
          *,
          program_session:program_sessions(
            *,
            program_week:program_weeks(*, program:programs(*))
          )
        `)
        .eq('id', sessionId)
        .single()

      if (!sessionData) {
        router.push('/sessions')
        return
      }

      setSession(sessionData as UserSession)

      // Load session exercises with exercise details
      const { data: sessionExercises } = await supabase
        .from('session_exercises')
        .select('*, exercise:exercises(*)')
        .eq('session_id', sessionData.program_session_id)
        .order('exercise_order')

      if (sessionExercises) {
        // ── Restore in-progress data from localStorage if present ────────
        let savedProgress: Record<string, { clientNotes: string; sets: { setNumber: number; weightLbs: string; reps: string; completed: boolean }[] }> | null = null
        try {
          const raw = localStorage.getItem(`workout-progress-${sessionId}`)
          if (raw) savedProgress = JSON.parse(raw)
        } catch {}

        const initialExercises = sessionExercises.map((se: SessionExercise & { exercise: Exercise }) => {
          const saved = savedProgress?.[se.id]
          return {
            sessionExerciseId: se.id,
            exerciseId: se.exercise_id,
            exerciseOrder: se.exercise_order,
            exercise: se.exercise!,
            prescribedSets: se.prescribed_sets,
            repRangeMin: se.rep_range_min,
            repRangeMax: se.rep_range_max,
            notes: se.notes,
            restSeconds: se.rest_seconds,
            clientNotes: saved?.clientNotes ?? '',
            sets: saved?.sets
              // Restore weight/reps from localStorage but always start unchecked
              ? saved.sets.map((s: { setNumber: number; weightLbs: string; reps: string; completed: boolean }) => ({
                  ...s,
                  completed: false,
                }))
              : Array.from({ length: se.prescribed_sets }, (_, i) => ({
                  setNumber: i + 1,
                  weightLbs: '',
                  reps: '',
                  completed: false,
                })),
          }
        })
        setExercises(initialExercises)
        loadedRef.current = true
        if (savedProgress) setResumed(true)

        // ── Load previous session data for each exercise ──────────────────
        const exerciseIds = sessionExercises.map((se: SessionExercise) => se.exercise_id)

        if (sessionData.user_id && exerciseIds.length > 0) {
          // Get this user's most recently completed sessions (not the current one)
          const { data: completedSessions } = await supabase
            .from('user_sessions')
            .select('id')
            .eq('user_id', sessionData.user_id)
            .not('completed_at', 'is', null)
            .neq('id', sessionId)
            .order('completed_at', { ascending: false })
            .limit(20)

          const prevSessionIds = (completedSessions ?? []).map((s: { id: string }) => s.id)

          if (prevSessionIds.length > 0) {
            const { data: prevLogs } = await supabase
              .from('user_exercise_logs')
              .select('exercise_id, user_session_id, sets:user_set_logs(set_number, weight_lbs, reps)')
              .in('exercise_id', exerciseIds)
              .in('user_session_id', prevSessionIds)

            if (prevLogs) {
              const newMap = new Map<string, PrevSetData[]>()
              // For each exercise, find the most recent completed log
              for (const exId of exerciseIds) {
                for (const psId of prevSessionIds) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const log = (prevLogs as any[]).find(
                    (l) => l.exercise_id === exId && l.user_session_id === psId
                  )
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const sets: any[] = log?.sets ?? []
                  if (sets.length > 0) {
                    const sorted = [...sets].sort((a, b) => a.set_number - b.set_number)
                    newMap.set(exId, sorted as PrevSetData[])
                    break // found the most recent log for this exercise
                  }
                }
              }
              setPrevSetsMap(newMap)
            }
          }
        }
      }

      // Mark session as started
      await supabase
        .from('user_sessions')
        .update({ started_at: new Date().toISOString() })
        .eq('id', sessionId)

      // Load available exercises for swap
      const { data: allExercises } = await supabase
        .from('exercises')
        .select('*')
        .eq('is_archived', false)
        .order('name')
      setAvailableExercises(allExercises ?? [])

      // Load adjacent sessions for swipe navigation — scoped to this user only
      if (sessionData.scheduled_date && sessionData.user_id) {
        const [nextResult, prevResult] = await Promise.all([
          supabase
            .from('user_sessions')
            .select('id, scheduled_date, program_session:program_sessions(title)')
            .eq('user_id', sessionData.user_id)
            .gt('scheduled_date', sessionData.scheduled_date)
            .order('scheduled_date', { ascending: true })
            .limit(1),
          supabase
            .from('user_sessions')
            .select('id, scheduled_date, program_session:program_sessions(title)')
            .eq('user_id', sessionData.user_id)
            .lt('scheduled_date', sessionData.scheduled_date)
            .order('scheduled_date', { ascending: false })
            .limit(1),
        ])

        const nextData = nextResult.data?.[0] as any
        const prevData = prevResult.data?.[0] as any

        if (nextData) {
          setNextSession({
            id: nextData.id,
            title: nextData.program_session?.title ?? 'Next Session',
            scheduled_date: nextData.scheduled_date,
          })
        }
        if (prevData) {
          setPrevSession({
            id: prevData.id,
            title: prevData.program_session?.title ?? 'Prev Session',
            scheduled_date: prevData.scheduled_date,
          })
        }
      }

      setLoading(false)
    }

    loadSession()
  }, [sessionId])

  // ── Persist in-progress data to localStorage on every change ────────────
  useEffect(() => {
    if (!loadedRef.current || !sessionId) return
    const progress: Record<string, { clientNotes: string; sets: typeof exercises[0]['sets'] }> = {}
    for (const ex of exercises) {
      progress[ex.sessionExerciseId] = { clientNotes: ex.clientNotes, sets: ex.sets }
    }
    try {
      localStorage.setItem(`workout-progress-${sessionId}`, JSON.stringify(progress))
    } catch {}
  }, [exercises, sessionId])

  async function handleFinishSession() {
    setSaving(true)
    try {
      // Create exercise logs + set logs
      for (const ex of exercises) {
        const { data: exLog, error: exLogError } = await supabase
          .from('user_exercise_logs')
          .insert({
            user_session_id: sessionId,
            session_exercise_id: ex.sessionExerciseId,
            exercise_id: ex.exerciseId,
            exercise_order: ex.exerciseOrder,
          })
          .select()
          .single()

        // Save client notes in a follow-up update (avoids schema cache issues on fresh columns)
        if (exLog && ex.clientNotes) {
          await supabase
            .from('user_exercise_logs')
            .update({ notes: ex.clientNotes })
            .eq('id', exLog.id)
        }

        if (exLogError) throw new Error(`Exercise log save failed: ${exLogError.message}`)

        if (exLog) {
          const setLogs = ex.sets
            .filter((s) => s.completed || s.weightLbs || s.reps)
            .map((s) => ({
              user_exercise_log_id: exLog.id,
              set_number: s.setNumber,
              weight_lbs: s.weightLbs ? parseFloat(s.weightLbs) : null,
              reps: s.reps ? parseInt(s.reps) : null,
              completed: s.completed,
              logged_at: new Date().toISOString(),
            }))

          if (setLogs.length > 0) {
            const { error: setLogsError } = await supabase.from('user_set_logs').insert(setLogs)
            if (setLogsError) throw new Error(`Set log save failed: ${setLogsError.message}`)
          }
        }
      }

      // Mark session as completed
      await supabase
        .from('user_sessions')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', sessionId)

      try { localStorage.removeItem(`workout-progress-${sessionId}`) } catch {}
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (err) {
      console.error('Error finishing session:', err)
      setSaving(false)
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setSaveError(`Could not save your workout — ${msg}. Check your connection and try again.`)
    }
  }

  // Touch swipe handlers for session navigation
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || touchStartY.current === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const deltaY = e.changedTouches[0].clientY - touchStartY.current
    touchStartX.current = null
    touchStartY.current = null

    // Require horizontal dominant swipe with minimum distance
    if (Math.abs(deltaX) < 70 || Math.abs(deltaX) < Math.abs(deltaY) * 1.5) return

    if (deltaX < -70 && nextSession) {
      router.push(`/sessions/${nextSession.id}/active`)
    } else if (deltaX > 70 && prevSession) {
      router.push(`/sessions/${prevSession.id}/active`)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const sessionTitle = (session as any)?.program_session?.title ?? 'Workout'
  const programName = (session as any)?.program_session?.program_week?.program?.title ?? ''
  const completedSets = exercises.reduce((acc, ex) => acc + ex.sets.filter((s) => s.completed).length, 0)
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0)

  return (
    <div
      className="flex min-h-screen flex-col bg-background"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Fixed Header ───────────────────────────────────────────────── */}
      <div
        className="fixed left-0 right-0 top-0 z-40 bg-background"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        {/* Beveled card wrapping all header content */}
        <div
          className="mx-3 mt-2 mb-2 rounded-2xl overflow-hidden border border-white/10 shadow-lg"
          style={{ background: HEADER_G }}
        >
          {/* Day navigation arrows */}
          <div className="flex items-center justify-between px-2 pt-2 gap-2">
            <button
              onClick={() => prevSession && router.push(`/sessions/${prevSession.id}/active`)}
              disabled={!prevSession}
              className={cn(
                'flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors min-w-0',
                prevSession
                  ? 'text-white/70 hover:bg-white/15 active:bg-white/20'
                  : 'text-white/20 cursor-default',
              )}
              aria-label={prevSession ? `Go to ${prevSession.title}` : undefined}
            >
              <ChevronLeft size={14} className="flex-shrink-0" />
              <span className="text-[10px] font-semibold truncate max-w-[70px]">
                {prevSession?.title ?? ''}
              </span>
            </button>

            <div className="flex-1" />

            <button
              onClick={() => nextSession && router.push(`/sessions/${nextSession.id}/active`)}
              disabled={!nextSession}
              className={cn(
                'flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors min-w-0',
                nextSession
                  ? 'text-white/70 hover:bg-white/15 active:bg-white/20'
                  : 'text-white/20 cursor-default',
              )}
              aria-label={nextSession ? `Go to ${nextSession.title}` : undefined}
            >
              <span className="text-[10px] font-semibold truncate max-w-[70px]">
                {nextSession?.title ?? ''}
              </span>
              <ChevronRight size={14} className="flex-shrink-0" />
            </button>
          </div>

          {/* Program name + session title */}
          <div className="text-center px-16 pt-1 pb-2">
            {programName && (
              <p className="text-xs text-white/60 truncate leading-none mb-1">{programName}</p>
            )}
            <h1 className="text-lg font-black text-white truncate leading-tight">{sessionTitle.toUpperCase()}</h1>
          </div>

          {/* Timer + sets row */}
          <div className="flex items-center justify-between px-4 pb-2.5">
            <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1">
              <Timer className="h-3 w-3 text-white/70" />
              <span className="font-mono text-xs font-black text-white">{formatElapsed(elapsed)}</span>
            </div>
            <span className="text-xs font-black text-white/70 tracking-wide">
              {completedSets}/{totalSets} SETS
            </span>
          </div>

          {/* Progress bar — clipped by rounded card corners */}
          <div className="h-1 w-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${completionPercent}%`,
                background: 'rgba(255,255,255,0.75)',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Scrollable exercise list ────────────────────────────────────── */}
      <div
        className="flex-1 px-4"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 9.5rem)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)',
        }}
      >
        {/* Swipe hint */}
        {(prevSession || nextSession) && (
          <p className="text-center text-[10px] text-text-muted/60 mb-3">
            ← swipe to change day →
          </p>
        )}

        {/* Resumed chip */}
        {resumed && (
          <div className="flex justify-center mb-3">
            <span className="text-[10px] font-black tracking-widest text-primary bg-primary/10 border border-primary/25 px-3 py-1 rounded-full">
              RESUMED — PREVIOUS PROGRESS RESTORED
            </span>
          </div>
        )}

        <Reorder.Group
          axis="y"
          values={exercises}
          onReorder={setExercises}
          className="flex flex-col gap-4"
        >
          {exercises.map((ex, index) => (
            <DraggableExerciseItem
              key={ex.sessionExerciseId}
              ex={ex}
              index={index}
              prevSets={prevSetsMap.get(ex.exerciseId) ?? []}
              isOpen={openExerciseIndex === index}
              onToggle={() =>
                setOpenExerciseIndex((prev) => (prev === index ? null : index))
              }
              onAllComplete={() =>
                setOpenExerciseIndex(index + 1 < exercises.length ? index + 1 : null)
              }
              addSet={addSet}
              removeSet={removeSet}
              updateSet={updateSet}
              toggleSetComplete={toggleSetComplete}
              swapExercise={swapExercise}
              updateNotes={updateNotes}
              setSwapTarget={setSwapTarget}
            />
          ))}
        </Reorder.Group>

        {/* ── Save error banner ── */}
        {saveError && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-error/20 bg-error/10 px-4 py-3">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-error" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-error">Save Failed</p>
              <p className="text-xs text-error/80 mt-0.5">{saveError}</p>
            </div>
            <button onClick={() => setSaveError(null)} className="flex-shrink-0 text-error/50 hover:text-error transition-colors">
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── Complete Workout button — inline after last card ── */}
        <button
          onClick={() => { setSaveError(null); handleFinishSession() }}
          disabled={saving || done}
          className="mt-6 w-full h-14 rounded-2xl text-white text-sm font-black tracking-widest shadow-lg active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}
        >
          {saving ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <Trophy size={18} />
              COMPLETE WORKOUT
            </>
          )}
        </button>
      </div>

      {/* ── Completion overlay ───────────────────────────────────────────── */}
      {done && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6"
          style={{ background: HEADER_G }}
        >
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
            <Trophy size={48} className="text-white" />
          </div>
          <div className="text-center">
            <p className="text-white/70 text-xs font-black tracking-widest mb-1">SESSION COMPLETE</p>
            <h1 className="text-3xl font-black text-white">{sessionTitle.toUpperCase()}</h1>
            <p className="text-white/60 text-sm mt-2">
              {formatElapsed(elapsed)} · {completedSets} sets logged
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-1 w-1 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="h-1 w-1 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="h-1 w-1 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}

      {/* ── Swap exercise modal ──────────────────────────────────────────── */}
      {swapTarget && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <div
            className="flex items-center gap-3 border-b border-white/10 px-4 py-4"
            style={{ background: HEADER_G }}
          >
            <button
              onClick={() => setSwapTarget(null)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="font-black text-white">SWAP EXERCISE</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-2">
              {availableExercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => {
                    const targetIndex = exercises.findIndex((e) => e.sessionExerciseId === swapTarget)
                    if (targetIndex !== -1) swapExercise(targetIndex, ex)
                    setSwapTarget(null)
                  }}
                  className="flex items-center gap-3 rounded-xl border border-border p-3 text-left hover:bg-surface-2 active:bg-surface-2 transition-colors shadow-sm"
                  style={{ background: 'linear-gradient(to right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
                >
                  <div>
                    <p className="text-sm font-black text-text-primary">{ex.name}</p>
                    <p className="text-xs text-text-muted">{ex.muscle_groups.join(', ')}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
