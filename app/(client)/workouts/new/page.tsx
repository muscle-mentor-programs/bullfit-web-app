'use client'

import { cn } from '@/lib/utils/cn'
import type { Exercise } from '@/types'
import {
  Check,
  ChevronLeft,
  Dumbbell,
  GripVertical,
  Loader2,
  Minus,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  X,
  Zap,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SetDraft {
  id: string
  set_number: number
  weight_lbs: string
  reps: string
}

interface ExerciseDraft {
  id: string
  exercise_id: string
  exercise_name: string
  sets: SetDraft[]
  notes: string
}

interface SessionDraft {
  id: string
  day_of_week: number
  title: string
  notes: string
  exercises: ExerciseDraft[]
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const DAY_SHORT: Record<number, string> = {
  1: 'M', 2: 'T', 3: 'W', 4: 'Th', 5: 'F', 6: 'Sa', 7: 'Su',
}
const DAY_FULL: Record<number, string> = {
  1: 'Monday', 2: 'Tuesday', 3: 'Wednesday',
  4: 'Thursday', 5: 'Friday', 6: 'Saturday', 7: 'Sunday',
}
const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core', 'Full Body',
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2)}` }

function makeSet(n: number): SetDraft {
  return { id: uid(), set_number: n, weight_lbs: '', reps: '' }
}

function makeSession(day: number): SessionDraft {
  return {
    id: uid(),
    day_of_week: day,
    title: `${DAY_FULL[day]} Workout`,
    notes: '',
    exercises: [],
  }
}

// ─── Shared style tokens ────────────────────────────────────────────────────────

const CARD_BG   = 'linear-gradient(145deg, var(--color-surface), var(--color-surface-3, var(--color-surface-2)))'
const HEADER_BG = 'linear-gradient(to bottom, var(--color-surface), var(--color-surface-3, var(--color-surface)))'
const PRIMARY_G = 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))'
const INSET_BG  = 'linear-gradient(145deg, var(--color-surface-2), var(--color-background))'
// Bevel: top-left light edge, bottom-right dark edge — mimics physical depth
const BEVEL_SHADOW = '0 1px 0 0 rgba(255,255,255,0.55) inset, 0 -1px 0 0 rgba(0,0,0,0.08) inset, 0 2px 6px 0 rgba(7,17,31,0.08)'
const INPUT_SHADOW  = 'inset 0 2px 4px rgba(7,17,31,0.07), inset 0 1px 0 rgba(7,17,31,0.04), 0 1px 0 rgba(255,255,255,0.6)'
const CARD_SHADOW   = '0 2px 8px rgba(7,17,31,0.09), 0 1px 2px rgba(7,17,31,0.05), inset 0 1px 0 rgba(255,255,255,0.5)'

// ─── Exercise Picker — Full-screen panel (keyboard-safe) ───────────────────────

function ExercisePickerModal({
  isOpen, onClose, onSelect,
}: {
  isOpen: boolean
  onClose: () => void
  onSelect: (exercises: Exercise[]) => void
}) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [activeMuscle, setActiveMuscle] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const loadExercises = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (debouncedQuery) params.set('q', debouncedQuery)
      if (activeMuscle) params.set('muscle', activeMuscle)
      const res = await fetch(`/api/exercises?${params.toString()}`)
      const data = await res.json()
      setExercises(data.exercises ?? [])
    } finally {
      setLoading(false)
    }
  }, [debouncedQuery, activeMuscle])

  useEffect(() => {
    if (isOpen) {
      loadExercises()
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen, loadExercises])

  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    if (!isOpen) { setQuery(''); setDebouncedQuery(''); setActiveMuscle(''); setSelectedIds([]) }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  function handleQuery(val: string) {
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQuery(val), 300)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="exercise-picker"
          className="fixed inset-0 z-[100] flex flex-col"
          style={{ background: 'var(--color-background)' }}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* ── Header bar ── */}
          <div
            className="flex items-center gap-3 px-4 pt-3 pb-3 flex-shrink-0 border-b border-border"
            style={{ background: HEADER_BG, boxShadow: '0 2px 8px rgba(7,17,31,0.08)' }}
          >
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
              style={{ background: INSET_BG, boxShadow: BEVEL_SHADOW }}
              aria-label="Back"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                ref={inputRef}
                type="search"
                placeholder="Search exercises..."
                value={query}
                onChange={(e) => handleQuery(e.target.value)}
                className={cn(
                  'w-full h-10 pl-9 pr-8 rounded-xl border border-border',
                  'text-sm text-text-primary placeholder:text-text-muted',
                  'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                )}
                style={{ background: INSET_BG, boxShadow: INPUT_SHADOW }}
              />
              {query && (
                <button
                  onClick={() => handleQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* ── Muscle group chips ── */}
          <div
            className="flex-shrink-0 px-4 py-2.5 border-b border-border overflow-x-auto"
            style={{ scrollbarWidth: 'none', background: HEADER_BG }}
          >
            <div className="flex gap-1.5 w-max">
              {MUSCLE_GROUPS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setActiveMuscle((prev) => prev === m ? '' : m)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                  style={
                    activeMuscle === m
                      ? { background: PRIMARY_G, color: 'white', border: 'none', boxShadow: '0 2px 8px rgba(37,88,168,0.35)' }
                      : { background: INSET_BG, boxShadow: BEVEL_SHADOW, borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }
                  }
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* ── Results list ── */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 size={22} className="animate-spin text-text-muted" />
              </div>
            ) : exercises.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-8">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 border border-border"
                  style={{ background: INSET_BG, boxShadow: BEVEL_SHADOW }}
                >
                  <Dumbbell size={20} className="text-text-muted" />
                </div>
                <p className="text-sm font-semibold text-text-primary">No exercises found</p>
                <p className="text-xs text-text-muted mt-1">Try a different search or filter.</p>
              </div>
            ) : (
              <div className="px-4 py-3">
                <p className="text-[10px] font-black text-text-muted tracking-widest mb-2">
                  {exercises.length} EXERCISE{exercises.length !== 1 ? 'S' : ''}
                  {activeMuscle ? ` · ${activeMuscle.toUpperCase()}` : ''}
                  {selectedIds.length > 0 && ` · ${selectedIds.length} SELECTED`}
                </p>
                <div className="flex flex-col gap-2">
                  {exercises.map((ex) => {
                    const isSelected = selectedIds.includes(ex.id)
                    return (
                      <button
                        key={ex.id}
                        onClick={() =>
                          setSelectedIds((prev) =>
                            prev.includes(ex.id) ? prev.filter((x) => x !== ex.id) : [...prev, ex.id],
                          )
                        }
                        className="w-full text-left px-3 py-3 rounded-2xl border transition-all active:scale-[0.98]"
                        style={{
                          background: isSelected ? 'var(--color-primary)/8' : CARD_BG,
                          boxShadow: CARD_SHADOW,
                          borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border"
                            style={
                              isSelected
                                ? { background: PRIMARY_G, borderColor: 'transparent', boxShadow: '0 2px 6px rgba(37,88,168,0.3)' }
                                : { background: INSET_BG, boxShadow: BEVEL_SHADOW, borderColor: 'var(--color-border)' }
                            }
                          >
                            {isSelected
                              ? <Check size={15} className="text-white" />
                              : <Dumbbell size={15} className="text-text-muted" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-sm font-bold leading-tight', isSelected ? 'text-primary' : 'text-text-primary')}>{ex.name}</p>
                            {ex.muscle_groups.length > 0 && (
                              <p className="text-xs text-text-muted mt-0.5 truncate">{ex.muscle_groups.join(' · ')}</p>
                            )}
                          </div>
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                            style={
                              isSelected
                                ? { background: PRIMARY_G, boxShadow: '0 2px 6px rgba(37,88,168,0.3)' }
                                : { background: INSET_BG, boxShadow: BEVEL_SHADOW }
                            }
                          >
                            {isSelected
                              ? <Check size={14} className="text-white" />
                              : <Plus size={14} className="text-text-muted" />
                            }
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Add button (multi-select footer) ── */}
          {selectedIds.length > 0 && (
            <div
              className="flex-shrink-0 px-4 py-3 border-t border-border"
              style={{ background: HEADER_BG }}
            >
              <button
                onClick={() => {
                  const toAdd = exercises.filter((ex) => selectedIds.includes(ex.id))
                  onSelect(toAdd)
                  onClose()
                }}
                className="w-full h-12 rounded-2xl text-sm font-black text-white tracking-wider transition-all active:scale-[0.98]"
                style={{ background: PRIMARY_G, boxShadow: '0 4px 14px rgba(37,88,168,0.35)' }}
              >
                ADD {selectedIds.length} EXERCISE{selectedIds.length !== 1 ? 'S' : ''}
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Exercise Row ───────────────────────────────────────────────────────────────

function ExerciseRow({
  letter, ex, onUpdate, onRemove,
}: {
  letter: string
  ex: ExerciseDraft
  onUpdate: (updated: ExerciseDraft) => void
  onRemove: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  function updateReps(idx: number, val: string) {
    onUpdate({ ...ex, sets: ex.sets.map((s, i) => i === idx ? { ...s, reps: val } : s) })
  }
  function updateWeight(idx: number, val: string) {
    onUpdate({ ...ex, sets: ex.sets.map((s, i) => i === idx ? { ...s, weight_lbs: val } : s) })
  }
  function addSet() {
    onUpdate({ ...ex, sets: [...ex.sets, makeSet(ex.sets.length + 1)] })
  }
  function removeSet() {
    if (ex.sets.length <= 1) return
    onUpdate({ ...ex, sets: ex.sets.slice(0, -1) })
  }

  return (
    <div
      className="rounded-2xl border border-border overflow-hidden"
      style={{ background: CARD_BG, boxShadow: CARD_SHADOW }}
    >
      {/* Header stripe */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 border-b border-border/60"
        style={{ background: HEADER_BG, boxShadow: '0 1px 0 rgba(255,255,255,0.5) inset' }}
      >
        <GripVertical size={13} className="text-text-muted/40 flex-shrink-0" />
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
          style={{ background: PRIMARY_G, boxShadow: '0 2px 5px rgba(37,88,168,0.3)' }}
        >
          {letter}
        </div>
        <span className="flex-1 min-w-0 text-sm font-bold text-text-primary truncate">
          {ex.exercise_name}
        </span>
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary border border-transparent hover:border-border transition-all"
            style={{ background: 'transparent' }}
          >
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-9 z-30 w-36 rounded-xl border border-border overflow-hidden"
              style={{ background: 'var(--color-surface)', boxShadow: '0 8px 24px rgba(7,17,31,0.14), 0 2px 6px rgba(7,17,31,0.08)' }}
            >
              <button
                onClick={() => { onRemove(); setMenuOpen(false) }}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-error hover:bg-surface-2 transition-colors"
              >
                <Trash2 size={12} />
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sets */}
      <div className="px-3 pt-2.5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] font-black text-text-muted tracking-widest w-7">SET</span>
          <span className="text-[9px] font-black text-text-muted tracking-widest flex-1 text-center">WEIGHT</span>
          <span className="text-[9px] font-black text-text-muted tracking-widest w-16 text-center">REPS</span>
        </div>
        {ex.sets.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 mb-1.5">
            {/* Set badge */}
            <div
              className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-[11px] font-bold text-text-secondary flex-shrink-0"
              style={{ background: INSET_BG, boxShadow: INPUT_SHADOW }}
            >
              {s.set_number}
            </div>
            {/* Weight input */}
            <input
              type="text"
              inputMode="decimal"
              value={s.weight_lbs}
              onChange={(e) => updateWeight(i, e.target.value)}
              placeholder="lbs"
              className={cn(
                'flex-1 h-8 px-2 rounded-xl border border-border text-center',
                'text-sm font-semibold text-text-primary placeholder:text-text-muted/40',
                'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15',
              )}
              style={{ background: INSET_BG, boxShadow: INPUT_SHADOW }}
            />
            {/* Reps input */}
            <input
              type="text"
              inputMode="numeric"
              value={s.reps}
              onChange={(e) => updateReps(i, e.target.value)}
              placeholder="reps"
              className={cn(
                'w-16 h-8 px-2 rounded-xl border border-border text-center',
                'text-sm font-semibold text-text-primary placeholder:text-text-muted/40',
                'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15',
              )}
              style={{ background: INSET_BG, boxShadow: INPUT_SHADOW }}
            />
          </div>
        ))}

        {/* +/- set controls */}
        <div
          className="flex items-center gap-2 py-2 mt-1 border-t border-border/60"
        >
          <button
            onClick={removeSet}
            disabled={ex.sets.length <= 1}
            className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-text-muted hover:text-error hover:border-error/60 disabled:opacity-25 transition-colors"
            style={{ background: INSET_BG, boxShadow: BEVEL_SHADOW }}
          >
            <Minus size={11} />
          </button>
          <span className="text-[11px] text-text-muted flex-1 text-center font-medium">
            {ex.sets.length} set{ex.sets.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={addSet}
            className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/60 transition-colors"
            style={{ background: INSET_BG, boxShadow: BEVEL_SHADOW }}
          >
            <Plus size={11} />
          </button>
        </div>
      </div>

      {/* Notes input */}
      <div className="px-3 pb-3">
        <input
          type="text"
          value={ex.notes}
          onChange={(e) => onUpdate({ ...ex, notes: e.target.value })}
          placeholder="Notes (e.g. 8-12 reps, RPE 8)"
          className={cn(
            'w-full h-8 px-3 rounded-xl border border-border',
            'text-xs text-text-primary placeholder:text-text-muted/50',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15',
          )}
          style={{ background: INSET_BG, boxShadow: INPUT_SHADOW }}
        />
      </div>
    </div>
  )
}

// ─── Day Picker ─────────────────────────────────────────────────────────────────

function DayPicker({
  sessions,
  activeDay,
  onToggleDay,
  onSelectDay,
}: {
  sessions: SessionDraft[]
  activeDay: number | null
  onToggleDay: (day: number) => void
  onSelectDay: (day: number) => void
}) {
  return (
    <div
      className="border-b border-border px-4 py-3 flex-shrink-0"
      style={{ background: HEADER_BG, boxShadow: '0 2px 8px rgba(7,17,31,0.07)' }}
    >
      <p className="text-[9px] font-black text-text-muted tracking-widest mb-2.5">TAP DAY TO ADD SESSION</p>
      <div className="grid grid-cols-7 gap-1">
        {Object.entries(DAY_SHORT).map(([dayStr, label]) => {
          const day = Number(dayStr)
          const hasSession = sessions.some((s) => s.day_of_week === day)
          const isActive = activeDay === day

          return (
            <button
              key={day}
              onClick={() => hasSession ? onSelectDay(day) : onToggleDay(day)}
              className="flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all active:scale-95"
              style={
                isActive
                  ? { background: PRIMARY_G, boxShadow: '0 3px 10px rgba(37,88,168,0.4)', color: 'white' }
                  : hasSession
                    ? { background: 'rgba(74,126,212,0.1)', border: '1px solid rgba(74,126,212,0.25)', color: 'var(--color-primary)', boxShadow: BEVEL_SHADOW }
                    : { background: INSET_BG, border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', boxShadow: BEVEL_SHADOW }
              }
            >
              <span className="text-[10px] font-black leading-none">{label}</span>
              <div
                className="w-1.5 h-1.5 rounded-full transition-colors"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.8)' : hasSession ? 'var(--color-primary)' : 'transparent',
                }}
              />
            </button>
          )
        })}
      </div>

      {/* Session tabs if multiple */}
      {sessions.length > 1 && (
        <div className="flex gap-1.5 mt-2.5 overflow-x-auto pb-0.5 justify-center" style={{ scrollbarWidth: 'none' }}>
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectDay(s.day_of_week)}
              className="flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black transition-all"
              style={
                activeDay === s.day_of_week
                  ? { background: PRIMARY_G, color: 'white', boxShadow: '0 2px 6px rgba(37,88,168,0.3)' }
                  : { background: INSET_BG, color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', boxShadow: BEVEL_SHADOW }
              }
            >
              {DAY_SHORT[s.day_of_week]} · {s.exercises.length}ex
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Session Editor ─────────────────────────────────────────────────────────────

function SessionEditor({
  session,
  onUpdate,
  onDelete,
  onAddExercise,
}: {
  session: SessionDraft | null
  onUpdate: (s: SessionDraft) => void
  onDelete: () => void
  onAddExercise: () => void
}) {
  const dragFrom = useRef<number | null>(null)

  if (!session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border border-border"
          style={{ background: INSET_BG, boxShadow: BEVEL_SHADOW }}
        >
          <Dumbbell size={24} className="text-primary opacity-50" />
        </div>
        <p className="text-sm font-black text-text-secondary">No day selected</p>
        <p className="text-xs text-text-muted mt-1.5 max-w-[220px] leading-relaxed">
          Tap a day above to add a workout session.
        </p>
      </div>
    )
  }

  function updateEx(idx: number, updated: ExerciseDraft) {
    onUpdate({ ...session!, exercises: session!.exercises.map((e, i) => i === idx ? updated : e) })
  }
  function removeEx(idx: number) {
    onUpdate({ ...session!, exercises: session!.exercises.filter((_, i) => i !== idx) })
  }
  function handleDrop(toIdx: number) {
    if (dragFrom.current === null || dragFrom.current === toIdx) return
    const exercises = [...session!.exercises]
    const [moved] = exercises.splice(dragFrom.current, 1)
    exercises.splice(toIdx, 0, moved)
    onUpdate({ ...session!, exercises })
    dragFrom.current = null
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Session header card */}
      <div
        className="px-4 py-3 border-b border-border/60 flex-shrink-0"
        style={{ background: HEADER_BG, boxShadow: '0 2px 6px rgba(7,17,31,0.06), inset 0 1px 0 rgba(255,255,255,0.5)' }}
      >
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <p className="text-[9px] font-black text-text-muted tracking-widest mb-1">
              {DAY_FULL[session.day_of_week].toUpperCase()}
            </p>
            <input
              type="text"
              value={session.title}
              onChange={(e) => onUpdate({ ...session, title: e.target.value })}
              className={cn(
                'w-full h-8 px-0 border-0 bg-transparent',
                'text-base font-black text-text-primary',
                'focus:outline-none focus:border-b-2 focus:border-primary pb-0.5',
                'placeholder:text-text-muted',
              )}
              placeholder="Workout title..."
            />
          </div>
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-text-muted hover:text-error hover:border-error/50 transition-all flex-shrink-0"
            style={{ background: INSET_BG, boxShadow: BEVEL_SHADOW }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">

        {/* Notes textarea */}
        <div>
          <label className="block text-[10px] font-black text-text-muted tracking-widest mb-2">
            SESSION NOTES
          </label>
          <textarea
            value={session.notes}
            onChange={(e) => onUpdate({ ...session, notes: e.target.value })}
            placeholder="Warmup, goals, focus for today..."
            rows={2}
            className={cn(
              'w-full px-3 py-2.5 rounded-2xl border border-border resize-none',
              'text-sm text-text-primary placeholder:text-text-muted/60',
              'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15',
            )}
            style={{ background: INSET_BG, boxShadow: INPUT_SHADOW }}
          />
        </div>

        {/* Exercise list */}
        {session.exercises.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-black text-text-muted tracking-widest">EXERCISES</p>
            {session.exercises.map((ex, idx) => (
              <div
                key={ex.id}
                draggable
                onDragStart={() => { dragFrom.current = idx }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(idx)}
              >
                <ExerciseRow
                  letter={String.fromCharCode(65 + idx)}
                  ex={ex}
                  onUpdate={(u) => updateEx(idx, u)}
                  onRemove={() => removeEx(idx)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Add exercise button */}
        <button
          onClick={onAddExercise}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-sm font-black text-text-muted tracking-wider transition-all hover:border-primary hover:text-primary active:scale-[0.98]"
          style={{ background: INSET_BG, boxShadow: INPUT_SHADOW }}
        >
          <Plus size={16} />
          ADD EXERCISE
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function NewWorkoutPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [sessions, setSessions] = useState<SessionDraft[]>([])
  const [activeDay, setActiveDay] = useState<number | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  const activeSession = sessions.find((s) => s.day_of_week === activeDay) ?? null

  function toggleDay(day: number) {
    const exists = sessions.find((s) => s.day_of_week === day)
    if (exists) {
      setSessions((prev) => prev.filter((s) => s.day_of_week !== day))
      if (activeDay === day) setActiveDay(null)
    } else {
      const newSession = makeSession(day)
      setSessions((prev) => [...prev, newSession].sort((a, b) => a.day_of_week - b.day_of_week))
      setActiveDay(day)
    }
  }

  function updateSession(updated: SessionDraft) {
    setSessions((prev) => prev.map((s) => s.id === updated.id ? updated : s))
  }

  function deleteSession() {
    if (!activeSession) return
    setSessions((prev) => prev.filter((s) => s.id !== activeSession.id))
    setActiveDay(null)
  }

  function addExercises(exList: Exercise[]) {
    if (!activeSession) return
    const newExercises: ExerciseDraft[] = exList.map((ex) => ({
      id: uid(),
      exercise_id: ex.id,
      exercise_name: ex.name,
      sets: [makeSet(1), makeSet(2), makeSet(3)],
      notes: '',
    }))
    updateSession({ ...activeSession, exercises: [...activeSession.exercises, ...newExercises] })
  }

  function parseReps(reps: string) {
    const parts = reps.split('-').map((x) => parseInt(x.trim(), 10)).filter((n) => !isNaN(n))
    if (!parts.length) return { min: 0, max: 0 }
    return { min: Math.min(...parts), max: Math.max(...parts) }
  }

  async function handleSave() {
    if (!title.trim()) { setError('Give your workout a name'); return }
    if (sessions.length === 0) { setError('Add at least one day'); return }

    setSaving(true)
    setError('')
    try {
      const body = {
        title: title.trim(),
        sessions: sessions.map((s) => ({
          day_of_week: s.day_of_week,
          title: s.title,
          notes: s.notes || null,
          exercises: s.exercises.map((ex, i) => {
            const repsArr = ex.sets.map((st) => parseReps(st.reps))
            const minR = Math.min(...repsArr.map((r) => r.min))
            const maxR = Math.max(...repsArr.map((r) => r.max))
            return {
              exercise_id: ex.exercise_id,
              order: i,
              sets: ex.sets.length,
              rep_range_min: isFinite(minR) ? minR : 1,
              rep_range_max: isFinite(maxR) ? maxR : 10,
              notes: ex.notes || null,
            }
          }),
        })),
      }

      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to save')
      }
      router.push('/sessions')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-dvh overflow-hidden" style={{ background: 'var(--color-background)' }}>

      {/* ── Top bar ── */}
      <div
        className="border-b border-border flex-shrink-0"
        style={{ background: HEADER_BG, boxShadow: '0 2px 10px rgba(7,17,31,0.09)' }}
      >
        <div className="flex items-center gap-2 px-3 pt-3 pb-3">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
            style={{ background: INSET_BG, boxShadow: BEVEL_SHADOW }}
          >
            <ChevronLeft size={16} />
          </button>

          {/* Workout title input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Workout name..."
            className={cn(
              'flex-1 min-w-0 h-9 px-3 rounded-xl border border-border',
              'text-sm font-black text-text-primary placeholder:text-text-muted',
              'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
            )}
            style={{ background: INSET_BG, boxShadow: INPUT_SHADOW }}
          />

          {/* Error + Save */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {error && (
              <span className="text-xs text-error max-w-[100px] truncate">{error}</span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-9 px-3 rounded-xl text-xs font-black tracking-wider text-white flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40"
              style={{ background: PRIMARY_G, boxShadow: '0 4px 14px rgba(37,88,168,0.4)' }}
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
              {saving ? 'SAVING…' : 'ADD TO CALENDAR'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Day picker ── */}
      <DayPicker
        sessions={sessions}
        activeDay={activeDay}
        onToggleDay={toggleDay}
        onSelectDay={setActiveDay}
      />

      {/* ── Session editor ── */}
      <SessionEditor
        session={activeSession}
        onUpdate={updateSession}
        onDelete={deleteSession}
        onAddExercise={() => { if (activeSession) setPickerOpen(true) }}
      />

      {/* ── Exercise picker (full-screen) ── */}
      <ExercisePickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={addExercises}
      />
    </div>
  )
}
