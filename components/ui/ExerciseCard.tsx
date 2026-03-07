'use client'

import { cn } from '@/lib/utils/cn'
import type { ActiveSetState, Exercise, SessionExercise } from '@/types'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Minus,
  Plus,
  RefreshCw,
  Video,
  VideoOff,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { SetRow } from './SetRow'
import { YouTubeEmbed } from './YouTubeEmbed'

const HEADER_G = 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))'

export interface PrevSetData {
  set_number: number
  weight_lbs: number | string | null
  reps: number | null
}

interface ExerciseCardProps {
  exercise: Exercise
  sessionExercise: SessionExercise
  sets: ActiveSetState[]
  clientNotes?: string
  prevSets?: PrevSetData[]
  /** Controlled open state — when omitted defaults to true (always open) */
  isOpen?: boolean
  /** Called when the user taps the header to manually toggle open/closed */
  onToggle?: () => void
  /** Called once when all sets transition from incomplete → all complete */
  onAllComplete?: () => void
  onAddSet: () => void
  onRemoveSet: () => void
  onUpdateSet: (
    setIndex: number,
    field: 'weightLbs' | 'reps',
    value: string,
  ) => void
  onToggleSet: (setIndex: number) => void
  onSwap: () => void
  onNotesChange?: (notes: string) => void
  dragHandle?: React.ReactNode
}

function ExerciseCard({
  exercise,
  sessionExercise,
  sets,
  clientNotes = '',
  prevSets,
  isOpen = true,
  onToggle,
  onAllComplete,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onToggleSet,
  onSwap,
  onNotesChange,
  dragHandle,
}: ExerciseCardProps) {
  const [showVideo, setShowVideo] = useState(false)

  const completedCount = sets.filter((s) => s.completed).length
  const totalCount = sets.length
  const allComplete = totalCount > 0 && completedCount === totalCount

  // Track allComplete transitions — fire onAllComplete only when it goes false→true
  const prevAllComplete = useRef(allComplete)
  const onAllCompleteRef = useRef(onAllComplete)
  onAllCompleteRef.current = onAllComplete

  useEffect(() => {
    if (allComplete && !prevAllComplete.current) {
      onAllCompleteRef.current?.()
    }
    prevAllComplete.current = allComplete
  }, [allComplete])

  return (
    <div
      className={cn(
        'rounded-2xl border overflow-hidden',
        'transition-colors duration-150',
        allComplete ? 'border-primary/40' : 'border-border',
      )}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center gap-2 px-4 py-3.5"
        style={{ background: HEADER_G }}
      >
        {/* Drag handle */}
        {dragHandle ? (
          <span className="text-white/50 shrink-0">{dragHandle}</span>
        ) : (
          <GripVertical size={18} className="text-white/40 shrink-0" />
        )}

        {/* Title + meta */}
        <button
          onClick={onToggle}
          className="flex-1 min-w-0 text-left focus-visible:outline-none"
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Collapse exercise' : 'Expand exercise'}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base font-black text-white truncate leading-tight">
              {exercise.name}
            </span>
            {allComplete && (
              <span className="shrink-0 text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">
                Done
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-white/70">
              {completedCount}/{totalCount} sets
            </span>
            {sessionExercise.prescribed_sets && (
              <>
                <span className="text-white/40 text-xs">·</span>
                <span className="text-xs text-white/70">
                  {sessionExercise.prescribed_sets} sets prescribed
                </span>
              </>
            )}
          </div>
        </button>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Video toggle */}
          {exercise.youtube_url && (
            <button
              onClick={() => setShowVideo((v) => !v)}
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-lg',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                showVideo
                  ? 'text-white bg-white/25'
                  : 'text-white/60 hover:text-white hover:bg-white/15',
              )}
              aria-label={showVideo ? 'Hide video' : 'Show video'}
            >
              {showVideo ? <VideoOff size={16} /> : <Video size={16} />}
            </button>
          )}

          {/* Swap button */}
          <button
            onClick={onSwap}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-lg',
              'text-white/60 hover:text-white hover:bg-white/15',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
            )}
            aria-label="Swap exercise"
          >
            <RefreshCw size={16} />
          </button>

          {/* Collapse toggle */}
          <button
            onClick={onToggle}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-lg',
              'text-white/60 hover:text-white hover:bg-white/15',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
            )}
            aria-label={isOpen ? 'Collapse' : 'Expand'}
          >
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* ── Collapsible body ── */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="bg-surface px-4 pb-4 pt-3 flex flex-col gap-3">
              {/* Video embed */}
              <AnimatePresence>
                {showVideo && exercise.youtube_url && (
                  <motion.div
                    key="video"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <YouTubeEmbed url={exercise.youtube_url!} className="mt-1" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Coach notes (read-only) */}
              {sessionExercise.notes && (
                <p className="text-sm text-text-secondary bg-surface-2 rounded-xl px-3 py-2.5 border border-border leading-snug">
                  {sessionExercise.notes}
                </p>
              )}

              {/* Set rows */}
              <div className="flex flex-col gap-2.5">
                {sets.map((set, idx) => {
                  const prev = prevSets?.[idx] ?? prevSets?.find((p) => p.set_number === idx + 1)
                  const prevWeight =
                    prev?.weight_lbs != null
                      ? String(parseFloat(String(prev.weight_lbs)))
                      : undefined
                  const prevReps =
                    prev?.reps != null ? String(prev.reps) : undefined

                  return (
                    <SetRow
                      key={idx}
                      setNumber={idx + 1}
                      weight={set.weightLbs ?? ''}
                      reps={set.reps ?? ''}
                      completed={set.completed}
                      onWeightChange={(val) => onUpdateSet(idx, 'weightLbs', val)}
                      onRepsChange={(val) => onUpdateSet(idx, 'reps', val)}
                      onToggleComplete={() => onToggleSet(idx)}
                      prevWeight={prevWeight}
                      prevReps={prevReps}
                    />
                  )
                })}
              </div>

              {/* Add / Remove set buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onAddSet}
                  className={cn(
                    'flex items-center gap-1.5 px-4 h-10 rounded-xl',
                    'text-sm font-semibold text-primary',
                    'bg-primary/10 hover:bg-primary/20',
                    'transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                  )}
                  aria-label="Add set"
                >
                  <Plus size={15} />
                  Add Set
                </button>

                {sets.length > 1 && (
                  <button
                    onClick={onRemoveSet}
                    className={cn(
                      'flex items-center gap-1.5 px-4 h-10 rounded-xl',
                      'text-sm font-semibold text-text-muted',
                      'bg-surface-2 hover:bg-border',
                      'transition-colors duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                    )}
                    aria-label="Remove last set"
                  >
                    <Minus size={15} />
                    Remove Set
                  </button>
                )}
              </div>

              {/* Client notes */}
              {onNotesChange && (
                <textarea
                  value={clientNotes}
                  onChange={(e) => onNotesChange(e.target.value)}
                  placeholder="Add your notes for this exercise…"
                  rows={2}
                  className={cn(
                    'w-full px-3 py-2.5 rounded-xl border border-border bg-background resize-none',
                    'text-sm text-text-primary placeholder:text-text-muted/50',
                    'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                  )}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { ExerciseCard }
export type { ExerciseCardProps }
