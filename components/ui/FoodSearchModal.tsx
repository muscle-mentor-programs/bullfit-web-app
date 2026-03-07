'use client'

import { cn } from '@/lib/utils/cn'
import type { FoodLogEntry, MealType, UsdaFoodSearchResult } from '@/types'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, Clock, Loader2, Minus, Plus, ScanBarcode, Search, ShieldCheck, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

const BarcodeScanner = dynamic(
  () => import('./BarcodeScanner').then((m) => ({ default: m.BarcodeScanner })),
  { ssr: false },
)

interface UpdateEntryFields {
  food_name: string
  serving_amount: number
  serving_unit: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

interface FoodSearchModalProps {
  isOpen: boolean
  onClose: () => void
  mealType: MealType
  logDate: string
  onAdd: (entry: Omit<FoodLogEntry, 'id' | 'user_id' | 'logged_at'>) => void
  /** Called instead of onAdd when editing an existing log entry */
  onUpdate?: (entryId: string, fields: UpdateEntryFields) => void
  isAdmin?: boolean
  /** Whether barcode scanner is unlocked (requires SuppScription or admin) */
  scannerEnabled?: boolean
  /** Pre-select a food and skip to the serving (or correction) step */
  initialFood?: UsdaFoodSearchResult
  initialStep?: 'serving' | 'correction'
  /** ID of the existing food_log_entries row (set when editing a logged food) */
  initialEntryId?: string
  /** Serving quantity to pre-fill when editing a logged entry */
  initialServingAmount?: number
  /** Whether to open in gram mode when editing a gram-based logged entry */
  initialUseGrams?: boolean
}

const QUICK_SERVINGS = [0.5, 1, 1.5, 2, 3]
const QUICK_GRAMS = [50, 100, 150, 200, 300]

/** Normalize USDA unit strings to "g" or "ml" (returns null if not weight/volume) */
function normalizeUnit(unit: string | null | undefined): 'g' | 'ml' | null {
  if (!unit) return null
  const u = unit.toLowerCase().trim()
  if (u === 'g' || u === 'grm' || u === 'gram' || u === 'grams') return 'g'
  if (u === 'ml' || u === 'mll' || u === 'milliliter' || u === 'milliliters') return 'ml'
  return null
}

interface CorrectionFields {
  corrected_name: string
  corrected_brand: string
  corrected_serving_size: string
  corrected_serving_unit: string
  corrected_calories: string
  corrected_protein_g: string
  corrected_carbs_g: string
  corrected_fat_g: string
  notes: string
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MacroStat({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-base font-bold text-text-primary">
        {Math.round(value)}
        <span className="text-xs font-normal text-text-muted ml-0.5">{unit}</span>
      </span>
      <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{label}</span>
    </div>
  )
}

function ResultItem({ item, onSelect }: { item: UsdaFoodSearchResult; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left px-4 py-3.5',
        'border-b border-border last:border-0',
        'hover:bg-surface-2 active:bg-surface-2',
        'transition-colors duration-100',
        'focus-visible:outline-none focus-visible:bg-surface-2',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-text-primary leading-snug line-clamp-2">
              {item.description}
            </p>
            {item.verified && (
              <ShieldCheck size={13} className="text-primary flex-shrink-0 mt-0.5" />
            )}
          </div>
          {item.brandName && (
            <p className="text-xs text-text-muted mt-0.5 truncate">{item.brandName}</p>
          )}
          {item.servingSize && item.servingSizeUnit && (
            <p className="text-xs text-text-muted mt-0.5">
              Per {item.servingSize}{item.servingSizeUnit}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-bold text-text-primary">
            {Math.round(item.calories ?? 0)}
            <span className="text-xs font-normal text-text-muted ml-0.5">kcal</span>
          </p>
          <p className="text-[11px] text-text-muted mt-0.5">
            {Math.round(item.protein_g ?? 0)}p · {Math.round(item.carbs_g ?? 0)}c · {Math.round(item.fat_g ?? 0)}f
          </p>
        </div>
      </div>
    </button>
  )
}

function CorrectionField({
  label, value, onChange, type = 'text', unit,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  unit?: string
}) {
  return (
    <div>
      <label className="text-[10px] font-black tracking-widest text-text-muted uppercase mb-1 block">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode={type === 'number' ? 'decimal' : 'text'}
          className={cn(
            'w-full h-10 rounded-xl border border-border bg-surface px-3',
            'text-sm text-text-primary placeholder:text-text-muted',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
            unit ? 'pr-8' : '',
          )}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Recent foods (localStorage) ─────────────────────────────────────────────

const RECENT_KEY = 'recent-foods'
const MAX_RECENT = 20

interface RecentFood {
  fdcId: string
  description: string
  brandName?: string
  servingSize?: number
  servingSizeUnit?: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  verified?: boolean
  usedAt: number
  /** Last serving amount the user actually logged for this food */
  lastServingAmount?: number
  /** Whether the user was in gram mode when they last logged this food */
  lastUseGrams?: boolean
}

function loadRecentFoods(): RecentFood[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? (JSON.parse(raw) as RecentFood[]) : []
  } catch {
    return []
  }
}

function saveRecentFood(food: UsdaFoodSearchResult, lastServingAmount: number, lastUseGrams: boolean) {
  try {
    const existing = loadRecentFoods().filter((f) => f.fdcId !== food.fdcId)
    const entry: RecentFood = {
      fdcId: food.fdcId,
      description: food.description,
      brandName: food.brandName,
      servingSize: food.servingSize,
      servingSizeUnit: food.servingSizeUnit,
      calories: food.calories,
      protein_g: food.protein_g,
      carbs_g: food.carbs_g,
      fat_g: food.fat_g,
      verified: food.verified,
      usedAt: Date.now(),
      lastServingAmount,
      lastUseGrams,
    }
    localStorage.setItem(RECENT_KEY, JSON.stringify([entry, ...existing].slice(0, MAX_RECENT)))
  } catch {}
}

// ─── Main component ───────────────────────────────────────────────────────────

function FoodSearchModal({ isOpen, onClose, mealType, logDate, onAdd, onUpdate, isAdmin, scannerEnabled, initialFood, initialStep, initialEntryId, initialServingAmount, initialUseGrams }: FoodSearchModalProps) {
  const router = useRouter()
  const [step, setStep] = useState<'search' | 'serving' | 'correction'>('search')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UsdaFoodSearchResult[]>([])
  const [selected, setSelected] = useState<UsdaFoodSearchResult | null>(null)
  const [servingAmount, setServingAmount] = useState('1')
  const [useGrams, setUseGrams] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [camPermission, setCamPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown')

  // Correction step state
  const [correctionFields, setCorrectionFields] = useState<CorrectionFields>({
    corrected_name: '',
    corrected_brand: '',
    corrected_serving_size: '',
    corrected_serving_unit: '',
    corrected_calories: '',
    corrected_protein_g: '',
    corrected_carbs_g: '',
    corrected_fat_g: '',
    notes: '',
  })
  const [correctionSaving, setCorrectionSaving] = useState(false)
  const [correctionSaved, setCorrectionSaved] = useState(false)

  const [recentFoods, setRecentFoods] = useState<RecentFood[]>([])

  const searchInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Normalized unit ("g" | "ml" | null) — determines if gram mode is available
  const gramUnit = normalizeUnit(selected?.servingSizeUnit)
  const hasGramMode = !!(gramUnit && selected?.servingSize && selected.servingSize > 0)

  // Multiplier used for macro scaling
  const multiplier = useGrams && hasGramMode && selected?.servingSize
    ? (parseFloat(servingAmount) || 0) / selected.servingSize
    : (parseFloat(servingAmount) || 1)

  const scaledCalories = Math.round((selected?.calories ?? 0) * multiplier)
  const scaledProtein = Math.round(((selected?.protein_g ?? 0) * multiplier) * 10) / 10
  const scaledCarbs = Math.round(((selected?.carbs_g ?? 0) * multiplier) * 10) / 10
  const scaledFat = Math.round(((selected?.fat_g ?? 0) * multiplier) * 10) / 10
  const mealLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1)

  // Load recent foods whenever the modal opens to the search step
  useEffect(() => {
    if (isOpen) setRecentFoods(loadRecentFoods())
  }, [isOpen])

  // Resolve camera permission once on mount
  // localStorage 'mm-cam-ok' acts as a fallback for browsers without the Permissions API
  useEffect(() => {
    try {
      if (localStorage.getItem('mm-cam-ok') === '1') {
        setCamPermission('granted')
        return
      }
    } catch {}

    if (typeof navigator === 'undefined' || !navigator.permissions) return

    navigator.permissions
      .query({ name: 'camera' as PermissionName })
      .then((result) => {
        const map = (state: PermissionState) =>
          state === 'granted' ? 'granted' : state === 'denied' ? 'denied' : 'unknown'
        setCamPermission(map(result.state))
        result.onchange = () => setCamPermission(map(result.state))
      })
      .catch(() => {}) // Permissions API unsupported — stays 'unknown', button visible
  }, [])

  // Lock scroll while open
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  // Auto-focus search input when overlay opens
  useEffect(() => {
    if (!isOpen || step !== 'search') return
    const t = setTimeout(() => searchInputRef.current?.focus(), 120)
    return () => clearTimeout(t)
  }, [isOpen, step])

  // When modal opens with a pre-selected food, jump to the appropriate step
  useEffect(() => {
    if (!isOpen || !initialFood) return
    setSelected(initialFood)
    setServingAmount(initialServingAmount != null ? String(initialServingAmount) : '1')
    setUseGrams(initialUseGrams ?? false)
    setCorrectionSaved(false)
    if (initialStep === 'correction') {
      setCorrectionFields({
        corrected_name: initialFood.description,
        corrected_brand: initialFood.brandName ?? '',
        corrected_serving_size: String(initialFood.servingSize ?? ''),
        corrected_serving_unit: initialFood.servingSizeUnit ?? 'g',
        corrected_calories: String(Math.round(initialFood.calories)),
        corrected_protein_g: String(Math.round(initialFood.protein_g * 10) / 10),
        corrected_carbs_g: String(Math.round(initialFood.carbs_g * 10) / 10),
        corrected_fat_g: String(Math.round(initialFood.fat_g * 10) / 10),
        notes: '',
      })
      setStep('correction')
    } else {
      setStep('serving')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialFood])

  // Reset state after close animation finishes
  useEffect(() => {
    if (isOpen) return
    const t = setTimeout(() => {
      setStep('search')
      setQuery('')
      setResults([])
      setSelected(null)
      setServingAmount('1')
      setUseGrams(false)
      setError(null)
      setCorrectionSaved(false)
    }, 300)
    return () => clearTimeout(t)
  }, [isOpen])

  // Escape key: correction → serving, serving → search, search → close
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (step === 'correction') setStep('serving')
      else if (step === 'serving') { setStep('search'); setSelected(null) }
      else onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, step, onClose])

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/usda/search?q=${encodeURIComponent(q.trim())}`, {
        signal: abortRef.current.signal,
      })
      if (!res.ok) throw new Error('failed')
      setResults((await res.json()) as UsdaFoodSearchResult[])
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchResults(query), 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, fetchResults])

  async function handleBarcodeScan(barcode: string) {
    setScannerOpen(false)
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/barcode/${encodeURIComponent(barcode)}`)
      if (!res.ok) {
        setError('Product not found — try searching by name')
        return
      }
      const food: UsdaFoodSearchResult = await res.json()
      handleSelect(food)
    } catch {
      setError('Scan failed — try searching by name')
    } finally {
      setLoading(false)
    }
  }

  function handleSelect(item: UsdaFoodSearchResult) {
    setSelected(item)
    // Pre-fill with the last serving amount this user used for this food
    const recent = recentFoods.find((f) => f.fdcId === item.fdcId)
    if (recent?.lastServingAmount != null) {
      setServingAmount(String(recent.lastServingAmount))
      setUseGrams(recent.lastUseGrams ?? false)
    } else {
      setServingAmount('1')
      setUseGrams(false)
    }
    setStep('serving')
  }

  function handleBack() {
    setStep('search')
    setSelected(null)
  }

  function openCorrection() {
    if (!selected) return
    setCorrectionFields({
      corrected_name: selected.description,
      corrected_brand: selected.brandName ?? '',
      corrected_serving_size: String(selected.servingSize ?? ''),
      corrected_serving_unit: selected.servingSizeUnit ?? 'g',
      corrected_calories: String(Math.round(selected.calories)),
      corrected_protein_g: String(Math.round(selected.protein_g * 10) / 10),
      corrected_carbs_g: String(Math.round(selected.carbs_g * 10) / 10),
      corrected_fat_g: String(Math.round(selected.fat_g * 10) / 10),
      notes: '',
    })
    setCorrectionSaved(false)
    setStep('correction')
  }

  function setField(key: keyof CorrectionFields) {
    return (v: string) => setCorrectionFields((prev) => ({ ...prev, [key]: v }))
  }

  async function handleSubmitCorrection() {
    if (!selected) return
    setCorrectionSaving(true)

    if (isAdmin) {
      // Admin → write directly to food_overrides
      const res = await fetch('/api/food-override', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_id: selected.fdcId,
          food_name: correctionFields.corrected_name,
          brand_name: correctionFields.corrected_brand || null,
          serving_size: correctionFields.corrected_serving_size
            ? parseFloat(correctionFields.corrected_serving_size) : null,
          serving_size_unit: correctionFields.corrected_serving_unit || null,
          calories: parseFloat(correctionFields.corrected_calories) || 0,
          protein_g: parseFloat(correctionFields.corrected_protein_g) || 0,
          carbs_g: parseFloat(correctionFields.corrected_carbs_g) || 0,
          fat_g: parseFloat(correctionFields.corrected_fat_g) || 0,
        }),
      })
      if (res.ok) {
        setCorrectionSaved(true)

        // Build corrected food with verified flag
        const correctedFood: UsdaFoodSearchResult = {
          ...selected,
          description: correctionFields.corrected_name,
          brandName: correctionFields.corrected_brand || selected.brandName,
          servingSize: correctionFields.corrected_serving_size
            ? parseFloat(correctionFields.corrected_serving_size) : selected.servingSize,
          servingSizeUnit: correctionFields.corrected_serving_unit || selected.servingSizeUnit,
          calories: parseFloat(correctionFields.corrected_calories) || selected.calories,
          protein_g: parseFloat(correctionFields.corrected_protein_g) || selected.protein_g,
          carbs_g: parseFloat(correctionFields.corrected_carbs_g) || selected.carbs_g,
          fat_g: parseFloat(correctionFields.corrected_fat_g) || selected.fat_g,
          verified: true,
        }

        // Scale macros using corrected data + current serving amount
        const corrGramUnit = normalizeUnit(correctedFood.servingSizeUnit)
        const corrHasGramMode = !!(corrGramUnit && correctedFood.servingSize && correctedFood.servingSize > 0)
        const corrMultiplier = useGrams && corrHasGramMode && correctedFood.servingSize
          ? (parseFloat(servingAmount) || 0) / correctedFood.servingSize
          : (parseFloat(servingAmount) || 1)
        const logUnit = useGrams && corrGramUnit ? corrGramUnit : 'serving'

        // Log the food and redirect — food data is now live in food_overrides
        saveRecentFood(correctedFood, parseFloat(servingAmount) || 1, useGrams && !!corrGramUnit)

        const updateFields: UpdateEntryFields = {
          food_name: correctedFood.description,
          serving_amount: parseFloat(servingAmount) || 1,
          serving_unit: logUnit,
          calories: Math.round(correctedFood.calories * corrMultiplier),
          protein_g: Math.round(correctedFood.protein_g * corrMultiplier * 10) / 10,
          carbs_g: Math.round(correctedFood.carbs_g * corrMultiplier * 10) / 10,
          fat_g: Math.round(correctedFood.fat_g * corrMultiplier * 10) / 10,
        }

        if (initialEntryId && onUpdate) {
          // Update the existing log entry with corrected nutrition
          onUpdate(initialEntryId, updateFields)
        } else {
          // No existing entry — insert a new one
          onAdd({
            log_date: logDate,
            meal_type: mealType,
            usda_food_id: correctedFood.fdcId,
            ...updateFields,
          })
        }

        setTimeout(() => {
          onClose()
          router.push('/nutrition')
        }, 800)
      }
    } else {
      // User → submit to correction queue
      const res = await fetch('/api/food-corrections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_id: selected.fdcId,
          original_name: selected.description,
          corrected_name: correctionFields.corrected_name,
          corrected_brand: correctionFields.corrected_brand || null,
          corrected_serving_size: correctionFields.corrected_serving_size
            ? parseFloat(correctionFields.corrected_serving_size) : null,
          corrected_serving_unit: correctionFields.corrected_serving_unit || null,
          corrected_calories: parseFloat(correctionFields.corrected_calories) || 0,
          corrected_protein_g: parseFloat(correctionFields.corrected_protein_g) || 0,
          corrected_carbs_g: parseFloat(correctionFields.corrected_carbs_g) || 0,
          corrected_fat_g: parseFloat(correctionFields.corrected_fat_g) || 0,
          notes: correctionFields.notes || null,
        }),
      })
      if (res.ok) {
        setCorrectionSaved(true)

        // Log the food using the corrected values (correction pending review)
        const corrCals = parseFloat(correctionFields.corrected_calories) || selected.calories
        const corrProt = parseFloat(correctionFields.corrected_protein_g) || selected.protein_g
        const corrCarbs = parseFloat(correctionFields.corrected_carbs_g) || selected.carbs_g
        const corrFat = parseFloat(correctionFields.corrected_fat_g) || selected.fat_g
        const corrServSize = correctionFields.corrected_serving_size
          ? parseFloat(correctionFields.corrected_serving_size) : selected.servingSize
        const corrGramUnitU = normalizeUnit(correctionFields.corrected_serving_unit || selected.servingSizeUnit)
        const corrHasGramU = !!(corrGramUnitU && corrServSize && corrServSize > 0)
        const corrMultU = useGrams && corrHasGramU && corrServSize
          ? (parseFloat(servingAmount) || 0) / corrServSize
          : (parseFloat(servingAmount) || 1)
        const logUnitU = useGrams && corrGramUnitU ? corrGramUnitU : 'serving'

        saveRecentFood(
          {
            ...selected,
            description: correctionFields.corrected_name || selected.description,
            calories: corrCals,
            protein_g: corrProt,
            carbs_g: corrCarbs,
            fat_g: corrFat,
          },
          parseFloat(servingAmount) || 1,
          useGrams && !!corrGramUnitU,
        )
        onAdd({
          log_date: logDate,
          meal_type: mealType,
          food_name: correctionFields.corrected_name || selected.description,
          usda_food_id: selected.fdcId,
          serving_amount: parseFloat(servingAmount) || 1,
          serving_unit: logUnitU,
          calories: Math.round(corrCals * corrMultU),
          protein_g: Math.round(corrProt * corrMultU * 10) / 10,
          carbs_g: Math.round(corrCarbs * corrMultU * 10) / 10,
          fat_g: Math.round(corrFat * corrMultU * 10) / 10,
        })

        setTimeout(() => {
          onClose()
          router.push('/nutrition')
        }, 1000)
      }
    }

    setCorrectionSaving(false)
  }

  function switchMode(toGrams: boolean) {
    if (toGrams) {
      setServingAmount(String(selected?.servingSize ?? 100))
    } else {
      setServingAmount('1')
    }
    setUseGrams(toGrams)
  }

  function adjustServing(delta: number) {
    if (useGrams) {
      const current = parseFloat(servingAmount) || 0
      setServingAmount(String(Math.max(1, Math.round(current + delta))))
    } else {
      const current = parseFloat(servingAmount) || 1
      setServingAmount(String(Math.max(0.5, Math.round((current + delta) * 10) / 10)))
    }
  }

  function handleAdd() {
    if (!selected) return
    // Always store 'serving' for serving mode so editing can reliably detect it.
    // Only store 'g'/'ml' when the user was actually in gram mode.
    const logUnit = useGrams && gramUnit ? gramUnit : 'serving'
    const logAmount = parseFloat(servingAmount) || 1
    saveRecentFood(selected, logAmount, useGrams && !!gramUnit)
    const fields: UpdateEntryFields = {
      food_name: selected.description,
      serving_amount: logAmount,
      serving_unit: logUnit,
      calories: scaledCalories,
      protein_g: scaledProtein,
      carbs_g: scaledCarbs,
      fat_g: scaledFat,
    }
    if (initialEntryId && onUpdate) {
      onUpdate(initialEntryId, fields)
    } else {
      onAdd({
        log_date: logDate,
        meal_type: mealType,
        usda_food_id: selected.fdcId,
        ...fields,
      })
    }
    onClose()
  }

  const quickPicks = useGrams ? QUICK_GRAMS : QUICK_SERVINGS

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="food-search-overlay"
          className={cn(
            'fixed inset-0 z-50',
            'md:flex md:items-center md:justify-center md:bg-black/50 md:p-4',
          )}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Desktop: click backdrop to close */}
          <div
            className="hidden md:block absolute inset-0"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* ── Content panel ── */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Add food to ${mealLabel}`}
            className={cn(
              'fixed inset-0 flex flex-col bg-background',
              'md:relative md:inset-auto md:flex md:flex-col md:rounded-2xl md:border md:border-border md:shadow-2xl',
              'md:w-full md:max-w-lg md:max-h-[85vh]',
            )}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
          >
            <AnimatePresence mode="wait" initial={false}>

              {/* ══ SEARCH STEP ══ */}
              {step === 'search' && (
                <motion.div
                  key="search"
                  className="flex flex-col flex-1 min-h-0"
                  initial={{ x: '-6%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '-6%', opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  <div className="flex justify-center pt-2.5 pb-1 flex-shrink-0 md:hidden">
                    <div className="w-10 h-1 rounded-full bg-border" />
                  </div>

                  <div className="flex items-center justify-between px-4 pt-2 pb-3 flex-shrink-0">
                    <h2 className="text-base font-semibold text-text-primary">{initialEntryId ? 'Edit Food Entry' : `Add to ${mealLabel}`}</h2>
                    <button
                      onClick={onClose}
                      className="flex items-center justify-center w-8 h-8 rounded-xl bg-surface-2 text-text-muted hover:text-text-primary transition-colors"
                      aria-label="Close"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="px-4 pb-3 flex-shrink-0">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                          {loading
                            ? <Loader2 size={16} className="animate-spin" />
                            : <Search size={16} />
                          }
                        </span>
                        <input
                          ref={searchInputRef}
                          type="search"
                          inputMode="search"
                          autoComplete="off"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Search foods…"
                          className={cn(
                            'w-full h-11 pl-10 pr-10 rounded-xl',
                            'border border-border bg-surface',
                            'text-sm text-text-primary placeholder:text-text-muted',
                            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                          )}
                          aria-label="Search for a food"
                        />
                        {query.length > 0 && (
                          <button
                            onClick={() => { setQuery(''); setResults([]); searchInputRef.current?.focus() }}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                            aria-label="Clear search"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      {typeof navigator !== 'undefined' && !!navigator.mediaDevices && camPermission !== 'denied' && (
                        scannerEnabled ? (
                          <button
                            type="button"
                            onClick={() => setScannerOpen(true)}
                            className={cn(
                              'w-11 h-11 rounded-xl border border-border bg-surface flex-shrink-0',
                              'flex items-center justify-center text-text-muted',
                              'hover:text-[#00BEFF] hover:border-[#00BEFF]/40 transition-colors',
                            )}
                            aria-label="Scan barcode"
                          >
                            <ScanBarcode size={18} />
                          </button>
                        ) : (
                          <a
                            href="/shop"
                            className={cn(
                              'w-11 h-11 rounded-xl border border-border bg-surface flex-shrink-0',
                              'flex items-center justify-center text-text-muted relative',
                            )}
                            title="SuppScription required — tap to subscribe"
                            aria-label="Barcode scanner locked — SuppScription required"
                          >
                            <ScanBarcode size={18} className="opacity-30" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF0087] flex items-center justify-center text-[8px] font-black text-white">🔒</span>
                          </a>
                        )
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-surface border-t border-border">
                    {!query.trim() && !loading && recentFoods.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center mb-3">
                          <Search size={24} className="text-text-muted" />
                        </div>
                        <p className="text-sm font-semibold text-text-primary">Search for a food</p>
                        <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
                          Powered by the USDA food database — search by name, brand, or ingredient
                        </p>
                      </div>
                    )}

                    {!query.trim() && !loading && recentFoods.length > 0 && (
                      <div className="pb-24 md:pb-6">
                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-surface-2/50">
                          <Clock size={12} className="text-text-muted" />
                          <span className="text-[10px] font-black tracking-widest text-text-muted">RECENTLY USED</span>
                        </div>
                        {recentFoods.map((item) => (
                          <ResultItem
                            key={item.fdcId}
                            item={item}
                            onSelect={() => handleSelect(item)}
                          />
                        ))}
                      </div>
                    )}

                    {error && (
                      <div className="flex flex-col items-center py-16 px-6 text-center">
                        <p className="text-sm font-medium text-error">{error}</p>
                        <button
                          onClick={() => fetchResults(query)}
                          className="mt-3 text-xs font-semibold text-primary underline"
                        >
                          Try again
                        </button>
                      </div>
                    )}

                    {!error && query.trim() && !loading && results.length === 0 && (
                      <div className="flex flex-col items-center py-16 px-6 text-center">
                        <p className="text-sm font-semibold text-text-primary">No results found</p>
                        <p className="text-xs text-text-muted mt-1">Try a different search term</p>
                      </div>
                    )}

                    {results.length > 0 && (
                      <div className="pb-24 md:pb-6">
                        {results.map((item) => (
                          <ResultItem
                            key={item.fdcId}
                            item={item}
                            onSelect={() => handleSelect(item)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ══ SERVING STEP ══ */}
              {step === 'serving' && selected && (
                <motion.div
                  key="serving"
                  className="flex flex-col flex-1 min-h-0"
                  initial={{ x: '6%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '6%', opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  <div className="flex justify-center pt-2.5 pb-1 flex-shrink-0 md:hidden">
                    <div className="w-10 h-1 rounded-full bg-border" />
                  </div>

                  <div className="flex items-center gap-3 px-4 pt-2 pb-3 border-b border-border flex-shrink-0">
                    <button
                      onClick={handleBack}
                      className="flex items-center justify-center w-8 h-8 rounded-xl bg-surface-2 text-text-secondary hover:text-text-primary transition-colors flex-shrink-0"
                      aria-label="Back to search"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-text-primary leading-snug line-clamp-1">
                          {selected.description}
                        </p>
                        {selected.verified && (
                          <ShieldCheck size={13} className="text-primary flex-shrink-0" />
                        )}
                      </div>
                      {selected.brandName && (
                        <p className="text-xs text-text-muted truncate">{selected.brandName}</p>
                      )}
                    </div>
                    <button
                      onClick={onClose}
                      className="flex items-center justify-center w-8 h-8 rounded-xl bg-surface-2 text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
                      aria-label="Close"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
                    {/* Calorie + macro summary */}
                    <div className="mx-4 mt-5 mb-5 rounded-2xl bg-surface-2 px-5 py-5">
                      <div className="text-center mb-4">
                        <span className="text-5xl font-black text-text-primary">{scaledCalories}</span>
                        <span className="text-sm text-text-muted ml-2">kcal</span>
                      </div>
                      <div className="flex items-center justify-around">
                        <MacroStat label="Protein" value={scaledProtein} unit="g" />
                        <div className="w-px h-8 bg-border" />
                        <MacroStat label="Carbs" value={scaledCarbs} unit="g" />
                        <div className="w-px h-8 bg-border" />
                        <MacroStat label="Fat" value={scaledFat} unit="g" />
                      </div>
                    </div>

                    {/* Mode toggle — only show if food has g/ml serving size */}
                    {hasGramMode && (
                      <div className="px-4 mb-4">
                        <div
                          className="flex gap-1 rounded-xl p-1 border border-border"
                          style={{ background: 'var(--color-surface-2)' }}
                        >
                          <button
                            type="button"
                            onClick={() => switchMode(false)}
                            className={cn(
                              'flex-1 h-8 rounded-lg text-xs font-black tracking-wide transition-all',
                              !useGrams ? 'text-white shadow-sm' : 'text-text-muted hover:text-text-primary',
                            )}
                            style={!useGrams ? { background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' } : {}}
                          >
                            Servings
                          </button>
                          <button
                            type="button"
                            onClick={() => switchMode(true)}
                            className={cn(
                              'flex-1 h-8 rounded-lg text-xs font-black tracking-wide transition-all',
                              useGrams ? 'text-white shadow-sm' : 'text-text-muted hover:text-text-primary',
                            )}
                            style={useGrams ? { background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' } : {}}
                          >
                            {gramUnit === 'ml' ? 'mL' : 'Grams'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Serving label + size info */}
                    <div className="px-4 mb-2 flex items-baseline justify-between">
                      <p className="text-sm font-semibold text-text-primary">
                        {useGrams ? (gramUnit === 'ml' ? 'Milliliters' : 'Grams') : 'Servings'}
                      </p>
                      {selected.servingSize && selected.servingSizeUnit && (
                        <p className="text-xs text-text-muted">
                          1 serving = {selected.servingSize}{selected.servingSizeUnit}
                        </p>
                      )}
                    </div>

                    {/* +/- stepper */}
                    <div className="px-4 flex items-center gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => adjustServing(useGrams ? -10 : -0.5)}
                        disabled={useGrams ? (parseFloat(servingAmount) || 0) <= 1 : (parseFloat(servingAmount) || 1) <= 0.5}
                        className={cn(
                          'w-13 h-13 rounded-xl border border-border bg-surface',
                          'flex items-center justify-center',
                          'text-text-primary hover:bg-surface-2 transition-colors',
                          'disabled:opacity-30 disabled:pointer-events-none',
                        )}
                        aria-label={useGrams ? 'Decrease by 10' : 'Decrease servings'}
                      >
                        <Minus size={20} />
                      </button>
                      <div className="flex-1 relative">
                        <input
                          type="number"
                          inputMode="decimal"
                          value={servingAmount}
                          onChange={(e) => setServingAmount(e.target.value)}
                          min={useGrams ? '1' : '0.1'}
                          step={useGrams ? '10' : '0.5'}
                          className={cn(
                            'w-full h-13 rounded-xl border border-border bg-background px-3 text-center',
                            'text-xl font-bold text-text-primary',
                            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                            '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                            useGrams ? 'pr-8' : '',
                          )}
                          aria-label={useGrams ? `Amount in ${gramUnit}` : 'Number of servings'}
                        />
                        {useGrams && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-muted pointer-events-none">
                            {gramUnit === 'ml' ? 'mL' : 'g'}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => adjustServing(useGrams ? 10 : 0.5)}
                        className={cn(
                          'w-13 h-13 rounded-xl border border-border bg-surface',
                          'flex items-center justify-center',
                          'text-text-primary hover:bg-surface-2 transition-colors',
                        )}
                        aria-label={useGrams ? 'Increase by 10' : 'Increase servings'}
                      >
                        <Plus size={20} />
                      </button>
                    </div>

                    {/* Quick-pick chips */}
                    <div className="px-4 flex gap-2 mb-5">
                      {quickPicks.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setServingAmount(String(v))}
                          className={cn(
                            'flex-1 h-9 rounded-xl text-xs font-semibold border transition-colors',
                            parseFloat(servingAmount) === v
                              ? 'bg-primary text-white border-primary'
                              : 'bg-surface border-border text-text-secondary hover:border-primary hover:text-primary',
                          )}
                        >
                          {useGrams ? `${v}${gramUnit === 'ml' ? 'ml' : 'g'}` : String(v)}
                        </button>
                      ))}
                    </div>

                    {/* Report / Edit button */}
                    <div className="px-4 mb-4 flex justify-center">
                      <button
                        type="button"
                        onClick={openCorrection}
                        className="text-xs text-text-muted hover:text-primary transition-colors underline underline-offset-2"
                      >
                        {isAdmin ? 'Edit food data' : 'Report incorrect info'}
                      </button>
                    </div>

                    {/* Add button */}
                    <div
                      className="px-4"
                      style={{ paddingBottom: `max(env(safe-area-inset-bottom) + 0.75rem, 1.5rem)` }}
                    >
                      <button
                        onClick={handleAdd}
                        disabled={!servingAmount || parseFloat(servingAmount) <= 0}
                        className={cn(
                          'w-full h-13 rounded-xl',
                          'bg-primary text-white text-sm font-bold',
                          'flex items-center justify-center',
                          'hover:bg-primary-dark active:scale-[0.98] transition-all duration-150',
                          'disabled:opacity-50 disabled:pointer-events-none',
                        )}
                      >
                        {initialEntryId ? 'EDIT ENTRY' : `Add to ${mealLabel}`}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ══ CORRECTION STEP ══ */}
              {step === 'correction' && selected && (
                <motion.div
                  key="correction"
                  className="flex flex-col flex-1 min-h-0"
                  initial={{ x: '6%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '6%', opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  <div className="flex justify-center pt-2.5 pb-1 flex-shrink-0 md:hidden">
                    <div className="w-10 h-1 rounded-full bg-border" />
                  </div>

                  <div className="flex items-center gap-3 px-4 pt-2 pb-3 border-b border-border flex-shrink-0">
                    <button
                      onClick={() => setStep('serving')}
                      className="flex items-center justify-center w-8 h-8 rounded-xl bg-surface-2 text-text-secondary hover:text-text-primary transition-colors flex-shrink-0"
                      aria-label="Back"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-text-primary">
                        {isAdmin ? 'Edit Food Data' : 'Report Correction'}
                      </p>
                      <p className="text-xs text-text-muted truncate">{selected.description}</p>
                    </div>
                    <button
                      onClick={onClose}
                      className="flex items-center justify-center w-8 h-8 rounded-xl bg-surface-2 text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
                      aria-label="Close"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
                    <div className="px-4 pt-4 pb-2">
                      {!isAdmin && (
                        <p className="text-xs text-text-muted mb-4 leading-relaxed">
                          Edit any incorrect fields below and submit — our team will review and update the database.
                        </p>
                      )}

                      <div className="flex flex-col gap-3">
                        <CorrectionField
                          label="Food Name"
                          value={correctionFields.corrected_name}
                          onChange={setField('corrected_name')}
                        />
                        <CorrectionField
                          label="Brand (optional)"
                          value={correctionFields.corrected_brand}
                          onChange={setField('corrected_brand')}
                        />
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <CorrectionField
                              label="Serving Size"
                              value={correctionFields.corrected_serving_size}
                              onChange={setField('corrected_serving_size')}
                              type="number"
                            />
                          </div>
                          <div className="w-20">
                            <CorrectionField
                              label="Unit"
                              value={correctionFields.corrected_serving_unit}
                              onChange={setField('corrected_serving_unit')}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <CorrectionField
                            label="Calories (kcal)"
                            value={correctionFields.corrected_calories}
                            onChange={setField('corrected_calories')}
                            type="number"
                          />
                          <CorrectionField
                            label="Protein"
                            value={correctionFields.corrected_protein_g}
                            onChange={setField('corrected_protein_g')}
                            type="number"
                            unit="g"
                          />
                          <CorrectionField
                            label="Carbs"
                            value={correctionFields.corrected_carbs_g}
                            onChange={setField('corrected_carbs_g')}
                            type="number"
                            unit="g"
                          />
                          <CorrectionField
                            label="Fat"
                            value={correctionFields.corrected_fat_g}
                            onChange={setField('corrected_fat_g')}
                            type="number"
                            unit="g"
                          />
                        </div>

                        {!isAdmin && (
                          <div>
                            <label className="text-[10px] font-black tracking-widest text-text-muted uppercase mb-1 block">
                              Notes (optional)
                            </label>
                            <textarea
                              value={correctionFields.notes}
                              onChange={(e) => setCorrectionFields((p) => ({ ...p, notes: e.target.value }))}
                              placeholder="e.g. Calories per 100g not per serving"
                              rows={2}
                              className={cn(
                                'w-full rounded-xl border border-border bg-surface px-3 py-2.5',
                                'text-sm text-text-primary placeholder:text-text-muted resize-none',
                                'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className="px-4 pt-2"
                      style={{ paddingBottom: `max(env(safe-area-inset-bottom) + 0.75rem, 1.5rem)` }}
                    >
                      <button
                        onClick={handleSubmitCorrection}
                        disabled={correctionSaving || correctionSaved}
                        className={cn(
                          'w-full h-12 rounded-xl text-white text-sm font-black tracking-wide',
                          'flex items-center justify-center gap-2',
                          'active:scale-[0.98] transition-all disabled:opacity-60',
                        )}
                        style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}
                      >
                        {correctionSaving ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : correctionSaved ? (
                          <><Check size={16} /> {isAdmin ? 'Saved & Verified!' : 'Submitted!'}</>
                        ) : (
                          isAdmin ? 'Save & Verify' : 'Submit Correction'
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
      {/* Barcode scanner overlay — rendered outside the modal panel so it covers full screen */}
      {isOpen && scannerOpen && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setScannerOpen(false)}
          onPermissionGranted={() => {
            setCamPermission('granted')
            try { localStorage.setItem('mm-cam-ok', '1') } catch {}
          }}
        />
      )}
    </AnimatePresence>
  )
}

export { FoodSearchModal }
export type { FoodSearchModalProps }
