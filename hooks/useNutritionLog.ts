'use client'

import { createClient } from '@/lib/supabase/client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { FoodLogEntry, MealType } from '@/types'

interface AddEntryInput {
  meal_type: MealType
  food_name: string
  usda_food_id: string | null
  serving_amount: number
  serving_unit: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

interface UpdateEntryFields {
  food_name: string
  serving_amount: number
  serving_unit: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

interface UseNutritionLogReturn {
  entries: FoodLogEntry[]
  loading: boolean
  addEntry: (input: AddEntryInput) => Promise<void>
  updateEntry: (id: string, fields: UpdateEntryFields) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
  refreshEntries: () => Promise<void>
}

export function useNutritionLog(date: string): UseNutritionLogReturn {
  const [entries, setEntries] = useState<FoodLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef(createClient())

  const loadEntries = useCallback(async () => {
    const supabase = supabaseRef.current
    // Clear immediately so the calorie ring doesn't show the previous day's
    // totals while the new date's data is loading.
    setEntries([])
    setLoading(true)

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      setEntries([])
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('food_log_entries')
      .select('*')
      .eq('user_id', authUser.id)
      .eq('log_date', date)
      .order('logged_at', { ascending: true })

    if (error) {
      console.error('[useNutritionLog] Failed to load entries:', error.message)
    } else {
      setEntries((data as FoodLogEntry[]) ?? [])
    }

    setLoading(false)
  }, [date])

  // Load on mount and whenever the date changes
  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  const addEntry = useCallback(
    async (input: AddEntryInput) => {
      const supabase = supabaseRef.current

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        console.error('[useNutritionLog] No authenticated user.')
        return
      }

      // Optimistic insert
      const tempId = `temp_${Date.now()}`
      const optimistic: FoodLogEntry = {
        id: tempId,
        user_id: authUser.id,
        log_date: date,
        logged_at: new Date().toISOString(),
        ...input,
      }
      setEntries((prev) => [...prev, optimistic])

      const { data, error } = await supabase
        .from('food_log_entries')
        .insert({
          user_id: authUser.id,
          log_date: date,
          ...input,
        })
        .select()
        .single()

      if (error) {
        console.error('[useNutritionLog] Failed to add entry:', error.message)
        // Roll back optimistic update
        setEntries((prev) => prev.filter((e) => e.id !== tempId))
      } else {
        // Replace temp with real record
        setEntries((prev) =>
          prev.map((e) => (e.id === tempId ? (data as FoodLogEntry) : e))
        )
      }
    },
    [date]
  )

  const updateEntry = useCallback(async (id: string, fields: UpdateEntryFields) => {
    const supabase = supabaseRef.current

    // Optimistic update
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...fields } : e))
    )

    const { error } = await supabase
      .from('food_log_entries')
      .update(fields)
      .eq('id', id)

    if (error) {
      console.error('[useNutritionLog] Failed to update entry:', error.message)
      // Re-fetch to restore accurate state
      await loadEntries()
    }
  }, [loadEntries])

  const deleteEntry = useCallback(async (id: string) => {
    const supabase = supabaseRef.current

    // Optimistic removal
    setEntries((prev) => prev.filter((e) => e.id !== id))

    const { error } = await supabase.from('food_log_entries').delete().eq('id', id)

    if (error) {
      console.error('[useNutritionLog] Failed to delete entry:', error.message)
      // Re-fetch to restore accurate state
      await loadEntries()
    }
  }, [loadEntries])

  return {
    entries,
    loading,
    addEntry,
    updateEntry,
    deleteEntry,
    refreshEntries: loadEntries,
  }
}
