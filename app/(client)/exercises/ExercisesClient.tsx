'use client'

import { cn } from '@/lib/utils/cn'
import {
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Filter,
  Loader2,
  Search,
  X,
  Youtube,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Exercise {
  id: string
  name: string
  muscle_groups: string[]
  equipment: string[]
  description: string | null
  youtube_url: string | null
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms',
  'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core', 'Adductors',
]

const EQUIPMENT_TYPES = [
  'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Kettlebell',
  'Bodyweight', 'Resistance Band', 'Smith Machine',
]

// ─── Muscle colour dots ────────────────────────────────────────────────────────

const MUSCLE_COLORS: Record<string, string> = {
  Chest:      'bg-red-400',
  Back:       'bg-blue-500',
  Shoulders:  'bg-orange-400',
  Biceps:     'bg-purple-400',
  Triceps:    'bg-pink-400',
  Forearms:   'bg-amber-500',
  Quads:      'bg-green-500',
  Hamstrings: 'bg-teal-500',
  Glutes:     'bg-rose-500',
  Calves:     'bg-cyan-500',
  Core:       'bg-yellow-500',
  Adductors:  'bg-indigo-400',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterChip({
  label,
  selected,
  onToggle,
}: {
  label: string
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
        selected
          ? 'bg-primary text-white border-primary'
          : 'bg-surface border-border text-text-secondary hover:border-primary/50 hover:text-text-primary',
      )}
    >
      {label}
    </button>
  )
}

function MuscleTag({ muscle }: { muscle: string }) {
  const dot = MUSCLE_COLORS[muscle] ?? 'bg-text-muted'
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-text-secondary bg-surface-2 border border-border px-1.5 py-0.5 rounded-full">
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dot)} />
      {muscle}
    </span>
  )
}

function ExerciseCard({ ex }: { ex: Exercise }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-xl overflow-hidden transition-all',
        expanded && 'border-primary/30',
      )}
    >
      {/* Header row — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        {/* Icon */}
        <div
          className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
            expanded ? 'bg-primary/10 text-primary' : 'bg-surface-2 text-text-muted',
          )}
        >
          <Dumbbell size={16} />
        </div>

        {/* Name + muscles */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-text-primary leading-tight">{ex.name}</p>
          {ex.equipment.length > 0 && (
            <p className="text-[11px] text-text-muted mt-0.5 leading-tight">
              {ex.equipment.join(' · ')}
            </p>
          )}
          {ex.muscle_groups.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {ex.muscle_groups.map((m) => (
                <MuscleTag key={m} muscle={m} />
              ))}
            </div>
          )}
        </div>

        {/* Chevron */}
        <div className="text-text-muted flex-shrink-0 mt-0.5">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded description */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-border">
          {ex.description ? (
            <p className="text-sm text-text-secondary leading-relaxed mt-3">
              {ex.description}
            </p>
          ) : (
            <p className="text-sm text-text-muted italic mt-3">No description available.</p>
          )}
          {ex.youtube_url && (
            <a
              href={ex.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-primary hover:underline"
            >
              <Youtube size={13} />
              Watch Tutorial
            </a>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function ExercisesClient() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [activeMuscle, setActiveMuscle] = useState('')
  const [activeEquipment, setActiveEquipment] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Debounce search query — cleanup on unmount to prevent memory leak
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])
  const handleQueryChange = (val: string) => {
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQuery(val), 300)
  }

  const fetchExercises = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (debouncedQuery) params.set('q', debouncedQuery)
      if (activeMuscle) params.set('muscle', activeMuscle)
      if (activeEquipment) params.set('equipment', activeEquipment)
      const res = await fetch(`/api/exercises?${params.toString()}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load exercises')
      setExercises(data.exercises ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading exercises')
    } finally {
      setLoading(false)
    }
  }, [debouncedQuery, activeMuscle, activeEquipment])

  useEffect(() => { fetchExercises() }, [fetchExercises])

  const hasFilters = activeMuscle || activeEquipment
  const clearFilters = () => {
    setActiveMuscle('')
    setActiveEquipment('')
    setQuery('')
    setDebouncedQuery('')
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Search bar ─────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-background pt-2 pb-3 px-4 border-b border-border">
        <div className="flex items-center gap-2">
          {/* Search input */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search exercises..."
              className={cn(
                'w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-surface',
                'text-sm text-text-primary placeholder:text-text-muted',
                'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                'text-transform-none',
              )}
              style={{ textTransform: 'none', letterSpacing: 'normal' }}
            />
          </div>

          {/* Filter toggle */}
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              'h-10 w-10 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all',
              showFilters || hasFilters
                ? 'bg-primary border-primary text-white'
                : 'bg-surface border-border text-text-muted hover:text-text-primary',
            )}
          >
            <Filter size={15} />
          </button>
        </div>

        {/* Active filter summary */}
        {hasFilters && !showFilters && (
          <div className="flex items-center gap-2 mt-2">
            {activeMuscle && (
              <span className="flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">
                {activeMuscle}
                <button onClick={() => setActiveMuscle('')}><X size={10} /></button>
              </span>
            )}
            {activeEquipment && (
              <span className="flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">
                {activeEquipment}
                <button onClick={() => setActiveEquipment('')}><X size={10} /></button>
              </span>
            )}
            <button onClick={clearFilters} className="text-[11px] text-text-muted hover:text-text-primary ml-auto">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Filter drawer ──────────────────────────────── */}
      {showFilters && (
        <div className="px-4 py-4 border-b border-border bg-surface space-y-4">
          {/* Muscle group */}
          <div>
            <p className="text-xs font-bold text-text-muted mb-2 tracking-widest">MUSCLE GROUP</p>
            <div className="flex flex-wrap gap-1.5">
              {MUSCLE_GROUPS.map((m) => (
                <FilterChip
                  key={m}
                  label={m}
                  selected={activeMuscle === m}
                  onToggle={() => setActiveMuscle(activeMuscle === m ? '' : m)}
                />
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div>
            <p className="text-xs font-bold text-text-muted mb-2 tracking-widest">EQUIPMENT</p>
            <div className="flex flex-wrap gap-1.5">
              {EQUIPMENT_TYPES.map((e) => (
                <FilterChip
                  key={e}
                  label={e}
                  selected={activeEquipment === e}
                  onToggle={() => setActiveEquipment(activeEquipment === e ? '' : e)}
                />
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              clearFilters()
              setShowFilters(false)
            }}
            className="text-xs font-semibold text-text-muted hover:text-error transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* ── Results ────────────────────────────────────── */}
      <div className="flex-1 px-4 py-3">
        {/* Result count */}
        {!loading && !error && (
          <p className="text-xs text-text-muted mb-3 font-medium">
            {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
            {(activeMuscle || activeEquipment || debouncedQuery) ? ' found' : ''}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={22} className="animate-spin text-text-muted" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-semibold text-text-primary mb-1">Something went wrong</p>
            <p className="text-xs text-text-muted mb-4">{error}</p>
            <button
              onClick={fetchExercises}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center mb-3">
              <Dumbbell size={20} className="text-text-muted" />
            </div>
            <p className="text-sm font-semibold text-text-primary mb-1">No exercises found</p>
            <p className="text-xs text-text-muted">Try adjusting your search or filters.</p>
            {(hasFilters || debouncedQuery) && (
              <button
                onClick={clearFilters}
                className="mt-3 text-xs font-semibold text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2 pb-4">
            {exercises.map((ex) => (
              <ExerciseCard key={ex.id} ex={ex} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
