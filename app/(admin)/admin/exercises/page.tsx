'use client'

import { cn } from '@/lib/utils/cn'
import type { Exercise } from '@/types'
import { Archive, Dumbbell, Loader2, Plus, X, Youtube } from 'lucide-react'
import { useEffect, useState } from 'react'

const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core', 'Full Body',
]
const EQUIPMENT = [
  'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Kettlebell',
  'Bodyweight', 'Resistance Band', 'Smith Machine', 'Other',
]

function Chip({
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
        'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
        selected
          ? 'text-white border-primary shadow-sm'
          : 'border-border text-text-secondary hover:border-primary hover:text-primary',
      )}
      style={selected ? { background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' } : {}}
    >
      {label}
    </button>
  )
}

export default function AdminExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [seeding, setSeeding] = useState(false)
  const [seedResult, setSeedResult] = useState<string | null>(null)

  async function handleSeedExercises() {
    setSeeding(true)
    setSeedResult(null)
    try {
      const res = await fetch('/api/admin/seed-exercises', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setSeedResult(`Error: ${data.error ?? 'Seed failed'}`)
      } else {
        setSeedResult(`✓ Added ${data.inserted} new exercise${data.inserted !== 1 ? 's' : ''}, skipped ${data.skipped} duplicate${data.skipped !== 1 ? 's' : ''}`)
        const r2 = await fetch('/api/admin/exercises')
        const d2 = await r2.json()
        setExercises(d2.exercises ?? [])
      }
    } catch {
      setSeedResult('Network error')
    } finally {
      setSeeding(false)
    }
  }

  // Form state
  const [name, setName] = useState('')
  const [muscleGroups, setMuscleGroups] = useState<string[]>([])
  const [equipment, setEquipment] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')

  useEffect(() => {
    fetch('/api/admin/exercises')
      .then((r) => r.json())
      .then((d) => setExercises(d.exercises ?? []))
      .finally(() => setLoading(false))
  }, [])

  function toggleMuscle(m: string) {
    setMuscleGroups((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m])
  }

  function toggleEquipment(e: string) {
    setEquipment((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e])
  }

  function resetForm() {
    setName(''); setMuscleGroups([]); setEquipment([]); setDescription(''); setYoutubeUrl(''); setError('')
  }

  async function handleCreate() {
    if (!name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, muscle_groups: muscleGroups, equipment, description: description || null, youtube_url: youtubeUrl || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create')
      setExercises((prev) => [data.exercise, ...prev])
      setShowForm(false)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  async function handleArchive(id: string) {
    // Optimistically remove from list
    setExercises((prev) => prev.filter((e) => e.id !== id))
    try {
      const res = await fetch('/api/admin/exercises', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_archived: true }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to archive exercise')
      }
    } catch (err) {
      // Restore the exercise on failure and show error
      setError(err instanceof Error ? err.message : 'Failed to archive exercise')
      // Re-fetch to restore accurate state
      fetch('/api/admin/exercises')
        .then((r) => r.json())
        .then((d) => setExercises(d.exercises ?? []))
        .catch(() => null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div
        className="rounded-2xl overflow-hidden border border-primary/20 shadow-md relative"
        style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}
      >
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)' }} />
        <div className="flex items-center justify-between px-6 py-5 relative">
          <div>
            <h1 className="text-xl font-semibold text-white">Exercise Library</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{loading ? '...' : `${exercises.length} exercise${exercises.length !== 1 ? 's' : ''}`}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSeedExercises}
              disabled={seeding}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-black transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}
              title="Import specialized exercise library"
            >
              {seeding ? <Loader2 size={14} className="animate-spin" /> : <Dumbbell size={14} />}
              {seeding ? 'Importing…' : 'Import'}
            </button>
            <button
              onClick={() => { setShowForm(true); resetForm() }}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-black transition-all hover:shadow-md active:scale-[0.98]"
              style={{ background: 'rgba(255,255,255,0.20)', color: 'white', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.30)' }}
            >
              <Plus size={15} />
              Exercise
            </button>
          </div>
        </div>
      </div>

      {/* Seed result banner */}
      {seedResult && (
        <div className={cn(
          'rounded-xl px-4 py-3 text-sm font-semibold',
          seedResult.startsWith('Error')
            ? 'bg-red-500/10 text-red-500 border border-red-500/20'
            : 'bg-green-500/10 text-green-600 border border-green-500/20',
        )}>
          {seedResult}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="rounded-2xl border border-border p-6 space-y-5 shadow-md" style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">New Exercise</h2>
            <button onClick={() => { setShowForm(false); resetForm() }} className="text-text-muted hover:text-text-primary">
              <X size={18} />
            </button>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Exercise Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Barbell Squat"
              className={cn(
                'w-full h-11 px-3 rounded-xl border border-border bg-background',
                'text-sm text-text-primary placeholder:text-text-muted',
                'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
              )}
            />
          </div>

          {/* Muscle Groups */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Muscle Groups</label>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map((m) => (
                <Chip key={m} label={m} selected={muscleGroups.includes(m)} onToggle={() => toggleMuscle(m)} />
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Equipment</label>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT.map((e) => (
                <Chip key={e} label={e} selected={equipment.includes(e)} onToggle={() => toggleEquipment(e)} />
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Instructions (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe how to perform this exercise..."
              rows={3}
              className={cn(
                'w-full px-3 py-2.5 rounded-xl border border-border bg-background',
                'text-sm text-text-primary placeholder:text-text-muted resize-none',
                'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
              )}
            />
          </div>

          {/* YouTube URL */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">YouTube Video URL (optional)</label>
            <input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className={cn(
                'w-full h-11 px-3 rounded-xl border border-border bg-background',
                'text-sm text-text-primary placeholder:text-text-muted',
                'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
              )}
            />
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={() => { setShowForm(false); resetForm() }}
              className="flex-1 h-10 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-surface-2 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex-1 h-10 rounded-xl text-white text-sm font-black tracking-wide shadow-primary hover:shadow-md active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Creating...' : 'Create Exercise'}
            </button>
          </div>
        </div>
      )}

      {/* Exercise List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={20} className="animate-spin text-text-muted" />
        </div>
      ) : exercises.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-border text-center shadow-md" style={{ background: 'linear-gradient(135deg, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-md" style={{ background: 'linear-gradient(135deg, var(--color-surface-2), var(--color-background))' }}>
            <Dumbbell size={28} className="text-text-muted" />
          </div>
          <h2 className="text-base font-black text-text-primary mb-1">No exercises yet</h2>
          <p className="text-sm text-text-muted max-w-xs">Add exercises to your library to use them in programs.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden divide-y divide-border shadow-md" style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}>
          {exercises.map((ex) => (
            <div key={ex.id} className="flex items-start gap-4 p-4 hover:bg-surface-2 transition-colors">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}>
                <Dumbbell size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary">{ex.name}</p>
                {ex.muscle_groups.length > 0 && (
                  <p className="text-xs text-text-muted mt-0.5">{ex.muscle_groups.join(', ')}</p>
                )}
                {ex.equipment.length > 0 && (
                  <p className="text-xs text-text-muted mt-0.5">{ex.equipment.join(', ')}</p>
                )}
                {ex.youtube_url && (
                  <a
                    href={ex.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                  >
                    <Youtube size={12} />
                    View video
                  </a>
                )}
              </div>
              <button
                onClick={() => handleArchive(ex.id)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium border border-border text-text-muted hover:text-error hover:border-error/30 transition-all"
              >
                <Archive size={13} />
                Archive
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
