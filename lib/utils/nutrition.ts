import type { FoodLogEntry, MacroTotals, MealType } from '@/types'

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
}

export const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

export function sumMacros(entries: FoodLogEntry[]): MacroTotals {
  return entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein_g: acc.protein_g + entry.protein_g,
      carbs_g: acc.carbs_g + entry.carbs_g,
      fat_g: acc.fat_g + entry.fat_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  )
}

export function groupByMeal(entries: FoodLogEntry[]): Record<MealType, FoodLogEntry[]> {
  const grouped: Record<MealType, FoodLogEntry[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  }
  for (const entry of entries) {
    grouped[entry.meal_type].push(entry)
  }
  return grouped
}

export function macroPercent(value: number, goal: number): number {
  if (goal === 0) return 0
  return Math.min(100, Math.round((value / goal) * 100))
}

export function caloriesFromMacros(protein: number, carbs: number, fat: number): number {
  return Math.round(protein * 4 + carbs * 4 + fat * 9)
}

export function formatCalories(cal: number): string {
  return Math.round(cal).toLocaleString()
}

export function formatMacro(g: number): string {
  return `${Math.round(g)}g`
}
