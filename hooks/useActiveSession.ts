'use client'

import { useCallback, useState } from 'react'
import type { ActiveExerciseState, ActiveSetState, Exercise, SessionExercise } from '@/types'

interface UseActiveSessionReturn {
  exercises: ActiveExerciseState[]
  setExercises: React.Dispatch<React.SetStateAction<ActiveExerciseState[]>>
  initSession: (sessionExercises: SessionExercise[]) => void
  addSet: (exerciseIndex: number) => void
  removeSet: (exerciseIndex: number, setIndex: number) => void
  updateSet: (exerciseIndex: number, setIndex: number, field: keyof ActiveSetState, value: string | boolean) => void
  toggleSetComplete: (exerciseIndex: number, setIndex: number) => void
  reorderExercises: (newOrder: ActiveExerciseState[]) => void
  swapExercise: (exerciseIndex: number, newExercise: Exercise) => void
  updateNotes: (exerciseIndex: number, notes: string) => void
  completionPercent: number
}

function buildDefaultSets(count: number): ActiveSetState[] {
  return Array.from({ length: count }, (_, i) => ({
    setNumber: i + 1,
    weightLbs: '',
    reps: '',
    completed: false,
  }))
}

export function useActiveSession(): UseActiveSessionReturn {
  const [exercises, setExercises] = useState<ActiveExerciseState[]>([])

  // Initialize the session from program data — call this once on mount
  const initSession = useCallback((sessionExercises: SessionExercise[]) => {
    const sorted = [...sessionExercises].sort((a, b) => a.exercise_order - b.exercise_order)

    const initial: ActiveExerciseState[] = sorted.map((se) => ({
      sessionExerciseId: se.id,
      exerciseId: se.exercise_id,
      exerciseOrder: se.exercise_order,
      sets: buildDefaultSets(se.prescribed_sets),
      exercise: se.exercise!,
      prescribedSets: se.prescribed_sets,
      repRangeMin: se.rep_range_min,
      repRangeMax: se.rep_range_max,
      notes: se.notes,
      restSeconds: se.rest_seconds,
      clientNotes: '',
    }))

    setExercises(initial)
  }, [])

  // Add an empty set to an exercise
  const addSet = useCallback((exerciseIndex: number) => {
    setExercises((prev) => {
      const next = [...prev]
      const ex = { ...next[exerciseIndex] }
      const nextSetNumber = ex.sets.length + 1
      ex.sets = [
        ...ex.sets,
        {
          setNumber: nextSetNumber,
          weightLbs: '',
          reps: '',
          completed: false,
        },
      ]
      next[exerciseIndex] = ex
      return next
    })
  }, [])

  // Remove a set from an exercise (minimum 1 set remains)
  const removeSet = useCallback((exerciseIndex: number, setIndex: number) => {
    setExercises((prev) => {
      const next = [...prev]
      const ex = { ...next[exerciseIndex] }
      if (ex.sets.length <= 1) return prev

      const newSets = ex.sets
        .filter((_, i) => i !== setIndex)
        .map((s, i) => ({ ...s, setNumber: i + 1 }))

      ex.sets = newSets
      next[exerciseIndex] = ex
      return next
    })
  }, [])

  // Update a specific field on a set
  const updateSet = useCallback(
    (
      exerciseIndex: number,
      setIndex: number,
      field: keyof ActiveSetState,
      value: string | boolean
    ) => {
      setExercises((prev) => {
        const next = [...prev]
        const ex = { ...next[exerciseIndex] }
        const sets = [...ex.sets]
        sets[setIndex] = { ...sets[setIndex], [field]: value }
        ex.sets = sets
        next[exerciseIndex] = ex
        return next
      })
    },
    []
  )

  // Toggle the completed state of a set
  const toggleSetComplete = useCallback((exerciseIndex: number, setIndex: number) => {
    setExercises((prev) => {
      const next = [...prev]
      const ex = { ...next[exerciseIndex] }
      const sets = [...ex.sets]
      sets[setIndex] = { ...sets[setIndex], completed: !sets[setIndex].completed }
      ex.sets = sets
      next[exerciseIndex] = ex
      return next
    })
  }, [])

  // Accept a new ordering of exercises (e.g., after drag-to-reorder)
  const reorderExercises = useCallback((newOrder: ActiveExerciseState[]) => {
    setExercises(
      newOrder.map((ex, i) => ({ ...ex, exerciseOrder: i + 1 }))
    )
  }, [])

  // Swap the exercise at a given index with a different exercise (keeps set data)
  const swapExercise = useCallback((exerciseIndex: number, newExercise: Exercise) => {
    setExercises((prev) => {
      const next = [...prev]
      const ex = { ...next[exerciseIndex] }
      ex.exercise = newExercise
      ex.exerciseId = newExercise.id
      next[exerciseIndex] = ex
      return next
    })
  }, [])

  // Update client's personal notes for an exercise
  const updateNotes = useCallback((exerciseIndex: number, notes: string) => {
    setExercises((prev) => {
      const next = [...prev]
      next[exerciseIndex] = { ...next[exerciseIndex], clientNotes: notes }
      return next
    })
  }, [])

  // Flat completion percent across all sets
  const completionPercent =
    exercises.length === 0
      ? 0
      : (() => {
          const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0)
          const completedSets = exercises.reduce(
            (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
            0
          )
          return totalSets === 0 ? 0 : Math.round((completedSets / totalSets) * 100)
        })()

  return {
    exercises,
    setExercises,
    initSession,
    addSet,
    removeSet,
    updateSet,
    toggleSetComplete,
    reorderExercises,
    swapExercise,
    updateNotes,
    completionPercent,
  }
}
