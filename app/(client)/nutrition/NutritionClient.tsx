'use client'

import { FoodSearchModal } from '@/components/ui/FoodSearchModal'
import { useNutritionLog } from '@/hooks/useNutritionLog'
import { cn } from '@/lib/utils/cn'
import type { FoodLogEntry, MealType, UsdaFoodSearchResult } from '@/types'
import { format, addDays, subDays, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

const MEALS: { type: MealType; label: string }[] = [
  { type: 'breakfast', label: 'Breakfast' },
  { type: 'lunch', label: 'Lunch' },
  { type: 'dinner', label: 'Dinner' },
  { type: 'snack', label: 'Snack' },
]

interface GoalShape {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

// Individual macro tile — shows a large number, goal, and a small progress bar.
function MacroTile({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const pct = Math.min((value / Math.max(goal, 1)) * 100, 100)
  const over = value > goal
  return (
    <div
      className="flex-1 flex flex-col rounded-2xl p-3.5 border border-border"
      style={{ background: 'linear-gradient(160deg, var(--color-surface), var(--color-surface-2))' }}
    >
      {/* Coloured dot + label */}
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <span className="text-[9px] font-black tracking-widest text-text-secondary leading-none">{label}</span>
      </div>
      {/* Big number */}
      <div className="flex items-baseline leading-none mb-1">
        <span className="text-[1.75rem] font-black text-text-primary leading-none">{Math.round(value)}</span>
        <span className="text-xs font-medium text-text-muted ml-0.5">g</span>
      </div>
      {/* Goal */}
      <p className="text-[10px] text-text-muted mb-2.5">of {goal}g</p>
      {/* Progress bar pinned to bottom */}
      <div className="h-1.5 w-full rounded-full overflow-hidden mt-auto" style={{ background: 'var(--color-border)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: over ? 'var(--color-error)' : color }}
        />
      </div>
    </div>
  )
}


export function NutritionClient({ goals, isAdmin, hasSuppScription }: { goals: GoalShape; isAdmin?: boolean; hasSuppScription?: boolean }) {
  const [viewDate, setViewDate] = useState(new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [activeMeal, setActiveMeal] = useState<MealType>('breakfast')
  const [viewFood, setViewFood] = useState<UsdaFoodSearchResult | null>(null)
  const [viewFoodEntryId, setViewFoodEntryId] = useState<string | null>(null)
  const [viewFoodServingAmount, setViewFoodServingAmount] = useState(1)
  const [viewFoodUseGrams, setViewFoodUseGrams] = useState(false)

  const dateStr = format(viewDate, 'yyyy-MM-dd')
  const { entries, loading, addEntry, updateEntry, deleteEntry } = useNutritionLog(dateStr)

  const totals = useMemo(() => {
    return entries.reduce(
      (acc, e) => ({
        calories: acc.calories + e.calories,
        protein_g: acc.protein_g + e.protein_g,
        carbs_g: acc.carbs_g + e.carbs_g,
        fat_g: acc.fat_g + e.fat_g,
      }),
      { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
    )
  }, [entries])

  function handleAdd(entry: Omit<FoodLogEntry, 'id' | 'user_id' | 'logged_at'>) {
    addEntry({
      meal_type: entry.meal_type,
      food_name: entry.food_name,
      usda_food_id: entry.usda_food_id,
      serving_amount: entry.serving_amount,
      serving_unit: entry.serving_unit,
      calories: entry.calories,
      protein_g: entry.protein_g,
      carbs_g: entry.carbs_g,
      fat_g: entry.fat_g,
    })
  }

  function handleUpdate(
    entryId: string,
    fields: { food_name: string; serving_amount: number; serving_unit: string; calories: number; protein_g: number; carbs_g: number; fat_g: number }
  ) {
    updateEntry(entryId, fields)
  }

  function openModal(meal: MealType) {
    setViewFood(null)
    setViewFoodEntryId(null)
    setViewFoodServingAmount(1)
    setViewFoodUseGrams(false)
    setActiveMeal(meal)
    setModalOpen(true)
  }

  function openFoodEntry(entry: FoodLogEntry) {
    const qty = entry.serving_amount > 0 ? entry.serving_amount : 1

    // Determine gram mode. New entries (after logUnit fix) store 'serving' for serving
    // mode and 'g'/'ml' only for actual gram-mode logs. Old entries stored the food's
    // raw servingSizeUnit (often 'g') even in serving mode — we guard against those by
    // requiring qty > 10 (serving counts of >10 are essentially impossible; real gram
    // amounts are almost always ≥ 25g).
    const rawGram = entry.serving_unit === 'g' || entry.serving_unit === 'ml'
    const isGram = rawGram && qty > 10

    // Normalise to per-unit values so macro scaling is always correct:
    //   gram mode  → servingSize = qty (logged grams), multiplier = userInput / qty
    //   count mode → servingSize = 1, calories = per 1 serving, multiplier = userInput
    // Setting servingSizeUnit = 'serving' for count mode makes normalizeUnit() return null
    // inside FoodSearchModal, which hides the gram toggle entirely for serving-mode edits.
    const food: UsdaFoodSearchResult = {
      fdcId: entry.usda_food_id ?? entry.food_name,
      description: entry.food_name,
      servingSize:     isGram ? qty : 1,
      servingSizeUnit: isGram ? entry.serving_unit : 'serving',
      calories:   isGram ? entry.calories   : entry.calories   / qty,
      protein_g:  isGram ? entry.protein_g  : entry.protein_g  / qty,
      carbs_g:    isGram ? entry.carbs_g    : entry.carbs_g    / qty,
      fat_g:      isGram ? entry.fat_g      : entry.fat_g      / qty,
    }

    setViewFood(food)
    setViewFoodEntryId(entry.id)
    setViewFoodServingAmount(qty)
    setViewFoodUseGrams(isGram)
    setActiveMeal(entry.meal_type)
    setModalOpen(true)
  }

  const caloriesRemaining = goals.calories - totals.calories

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background pb-6 animate-fade-in">
        {/* ── Dark BULLFIT Page Hero ─────────────────── */}
        <div className="page-hero" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="hero-accent-bar" />
          <div className="hero-glow" style={{
            width: 200, height: 200, top: -60, right: -40,
            background: 'radial-gradient(circle, rgba(0,190,255,0.18) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }} />
          <div className="hero-glow" style={{
            width: 160, height: 160, bottom: -20, left: -30,
            background: 'radial-gradient(circle, rgba(207,0,255,0.12) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }} />
          <div className="px-5 pt-4 pb-7 relative flex items-end justify-between">
            <div>
              <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.18em',
                color: '#9A9A9A', textTransform: 'uppercase' }}>
                DAILY TRACKING
              </p>
              <h1 style={{ fontFamily: 'var(--font-condensed)', fontSize: 40, fontWeight: 900,
                letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 1.05,
                color: '#0F0F0F', marginTop: 4 }}>
                NUTRITION
              </h1>
            </div>
            {!hasSuppScription && (
              <a
                href="/shop"
                className="text-[9px] font-black tracking-widest px-2 py-1 rounded-lg mb-1"
                style={{ background: 'rgba(0,190,255,0.20)', color: '#00BEFF', border: '1px solid rgba(0,190,255,0.30)' }}
              >
                SCANNER LOCKED
              </a>
            )}
          </div>
        </div>

        {/* Date navigation */}
        <div className="flex items-center justify-between px-4 pt-4 pb-4">
          <button
            onClick={() => setViewDate((d) => subDays(d, 1))}
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-border shadow-sm text-text-muted hover:text-text-primary hover:bg-surface-2 transition-all"
            style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
          >
            <ChevronLeft size={18} />
          </button>
          <p className="text-sm font-black text-text-primary">
            {isToday(viewDate) ? 'TODAY' : format(viewDate, 'EEEE, MMM d').toUpperCase()}
          </p>
          <button
            onClick={() => setViewDate((d) => addDays(d, 1))}
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-border shadow-sm text-text-muted hover:text-text-primary hover:bg-surface-2 transition-all"
            style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
            disabled={isToday(viewDate)}
          >
            <ChevronRight size={18} className={isToday(viewDate) ? 'opacity-30' : ''} />
          </button>
        </div>

        {/* ── Summary card ─────────────────────────────────────────── */}
        <div
          className="mx-4 mb-5 rounded-2xl border border-border overflow-hidden shadow-md"
          style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
        >
          {/* Gradient top accent line */}
          <div className="h-1 w-full" style={{ background: '#00BEFF' }} />

          <div className="p-5">
            {/* ── Calories ── */}
            <div className="flex items-center gap-2 mb-3">
              <div className="h-0.5 w-3 rounded-full" style={{ background: '#00BEFF' }} />
              <span className="text-[11px] font-black tracking-widest text-text-secondary">CALORIES</span>
            </div>

            {/* Big number */}
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-5xl font-black text-text-primary leading-none">
                {Math.round(totals.calories).toLocaleString()}
              </span>
              <span className="text-sm text-text-muted">
                / {goals.calories.toLocaleString()} kcal
              </span>
            </div>

            {/* Remaining / over */}
            <p className={cn(
              'text-sm font-bold mb-3',
              caloriesRemaining >= 0 ? 'text-text-secondary' : 'text-error',
            )}>
              {caloriesRemaining >= 0
                ? `${Math.round(caloriesRemaining).toLocaleString()} kcal remaining`
                : `${Math.round(Math.abs(caloriesRemaining)).toLocaleString()} kcal over goal`}
            </p>

            {/* Calorie progress bar */}
            <div className="h-2.5 w-full rounded-full overflow-hidden mb-6" style={{ background: 'var(--color-surface-2)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((totals.calories / Math.max(goals.calories, 1)) * 100, 100)}%`,
                  background: caloriesRemaining < 0
                    ? 'linear-gradient(to right, var(--color-primary-light), var(--color-error))'
                    : '#00BEFF',
                }}
              />
            </div>

            {/* ── Macros ── */}
            <div className="flex items-center gap-2 mb-3">
              <div className="h-0.5 w-3 rounded-full" style={{ background: 'linear-gradient(to right, var(--color-accent-light), var(--color-accent))' }} />
              <span className="text-[11px] font-black tracking-widest text-text-secondary">MACROS</span>
            </div>

            <div className="flex gap-2.5">
              <MacroTile label="PROTEIN" value={totals.protein_g} goal={goals.protein_g} color="#4A7ED4" />
              <MacroTile label="CARBS"   value={totals.carbs_g}   goal={goals.carbs_g}   color="#3D9BAF" />
              <MacroTile label="FAT"     value={totals.fat_g}     goal={goals.fat_g}     color="#9060C8" />
            </div>
          </div>
        </div>

        {/* Meal sections */}
        <div className="flex flex-col gap-4 px-4">
          {MEALS.map(({ type, label }) => {
            const mealEntries = entries.filter((e) => e.meal_type === type)
            const mealCals = mealEntries.reduce((s, e) => s + e.calories, 0)

            return (
              <div key={type} className="rounded-2xl border border-border overflow-hidden shadow-sm" style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}>
                {/* Gradient top accent */}
                <div className="h-0.5 w-full" style={{ background: 'linear-gradient(to right, var(--color-primary-light), var(--color-primary-dark))' }} />
                {/* Meal header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div>
                    <p className="text-sm font-black text-text-primary">{label}</p>
                    {mealCals > 0 && (
                      <p className="text-xs text-text-muted">{Math.round(mealCals)} kcal</p>
                    )}
                  </div>
                  <button
                    onClick={() => openModal(type)}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-white text-xs font-black tracking-wide shadow-primary hover:shadow-md active:scale-[0.98] transition-all"
                    style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}
                  >
                    <Plus size={13} />
                    Add
                  </button>
                </div>

                {/* Food entries */}
                {loading ? (
                  <div className="py-4 flex justify-center">
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : mealEntries.length === 0 ? (
                  <div className="px-4 py-3">
                    <p className="text-xs text-text-muted italic">Nothing logged yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {mealEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-2 active:bg-surface-2 transition-colors"
                        onClick={() => openFoodEntry(entry)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-primary font-medium leading-snug line-clamp-1">
                            {entry.food_name}
                          </p>
                          <p className="text-xs text-text-muted mt-0.5">
                            {entry.serving_amount} {entry.serving_unit} · {Math.round(entry.protein_g)}p {Math.round(entry.carbs_g)}c {Math.round(entry.fat_g)}f
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-text-primary flex-shrink-0">
                          {Math.round(entry.calories)} kcal
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id) }}
                          className="flex-shrink-0 text-text-muted hover:text-error transition-colors"
                          aria-label="Remove entry"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <FoodSearchModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setViewFood(null); setViewFoodEntryId(null) }}
        mealType={activeMeal}
        logDate={dateStr}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        isAdmin={isAdmin}
        scannerEnabled={isAdmin || hasSuppScription}
        initialFood={viewFood ?? undefined}
        initialStep={viewFood ? 'serving' : undefined}
        initialEntryId={viewFoodEntryId ?? undefined}
        initialServingAmount={viewFoodServingAmount}
        initialUseGrams={viewFoodUseGrams}
      />
    </>
  )
}
