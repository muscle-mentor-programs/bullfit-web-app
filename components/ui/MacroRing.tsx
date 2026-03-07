'use client'

import { cn } from '@/lib/utils/cn'

interface MacroRingProps {
  calories: number
  calorieGoal: number
  protein: number
  proteinGoal: number
  carbs: number
  carbsGoal: number
  fat: number
  fatGoal: number
  size?: number
}

interface ArcSegment {
  color: string
  value: number
  goal: number
  label: string
  unit: string
}

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max)
}

/**
 * Compute stroke-dasharray and stroke-dashoffset for a partial arc.
 * @param ratio   0–1 fill ratio
 * @param circumference  full circle circumference
 * @param startRatio  where this arc begins (0–1)
 */
function arcProps(
  ratio: number,
  circumference: number,
  startRatio: number,
  gap: number,
) {
  const filled = clamp(ratio, 0, 1) * (circumference - gap)
  const dashArray = `${filled} ${circumference - filled}`
  // SVG stroke starts at 3 o'clock; rotate so it starts at 12 o'clock minus startRatio offset
  const offset = circumference * (1 - startRatio) + gap / 2
  return { strokeDasharray: dashArray, strokeDashoffset: offset }
}

function MacroBar({
  label,
  value,
  goal,
  color,
  unit,
}: {
  label: string
  value: number
  goal: number
  color: string
  unit: string
}) {
  const pct = goal > 0 ? clamp(value / goal, 0, 1) : 0

  return (
    <div className="flex flex-col gap-1 flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary">{label}</span>
        <span className="text-xs text-text-muted">
          {value}
          <span className="text-[10px]">{unit}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct * 100}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function MacroRing({
  calories,
  calorieGoal,
  protein,
  proteinGoal,
  carbs,
  carbsGoal,
  fat,
  fatGoal,
  size = 180,
}: MacroRingProps) {
  const strokeWidth = size * 0.09
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const cx = size / 2
  const cy = size / 2

  // Gap between segments (in px of circumference)
  const gap = size * 0.022

  // Ratios capped at 1
  const proteinRatio = proteinGoal > 0 ? clamp(protein / proteinGoal, 0, 1) : 0
  const carbsRatio = carbsGoal > 0 ? clamp(carbs / carbsGoal, 0, 1) : 0
  const fatRatio = fatGoal > 0 ? clamp(fat / fatGoal, 0, 1) : 0

  // Each macro gets an equal third of the ring
  const third = 1 / 3

  const proteinArc = arcProps(proteinRatio, circumference, 0, gap)
  const carbsArc = arcProps(carbsRatio, circumference, third, gap)
  const fatArc = arcProps(fatRatio, circumference, 2 * third, gap)

  const caloriesLeft = Math.max(calorieGoal - calories, 0)
  const caloriesOver = calories > calorieGoal

  const macros: ArcSegment[] = [
    {
      label: 'Protein',
      value: protein,
      goal: proteinGoal,
      color: '#4D82C4',
      unit: 'g',
    },
    {
      label: 'Carbs',
      value: carbs,
      goal: carbsGoal,
      color: '#3D96B0',
      unit: 'g',
    },
    {
      label: 'Fat',
      value: fat,
      goal: fatGoal,
      color: '#8878C0',
      unit: 'g',
    },
  ]

  const commonArcProps = {
    cx,
    cy,
    r: radius,
    fill: 'none',
    strokeWidth,
    strokeLinecap: 'round' as const,
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* SVG Ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            {...commonArcProps}
            style={{ stroke: 'var(--color-border)' }}
            strokeDasharray={`${circumference - gap * 3} ${gap * 3}`}
            strokeDashoffset={gap * 1.5}
          />

          {/* Protein arc (first third, starts at top) */}
          <circle
            {...commonArcProps}
            stroke="#4D82C4"
            {...proteinArc}
          />

          {/* Carbs arc (second third) */}
          <circle
            {...commonArcProps}
            stroke="#3D96B0"
            {...carbsArc}
          />

          {/* Fat arc (third third) */}
          <circle
            {...commonArcProps}
            stroke="#8878C0"
            {...fatArc}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <span
            className={cn(
              'font-bold leading-none',
              caloriesOver ? 'text-accent' : 'text-text-primary',
            )}
            style={{ fontSize: size * 0.2 }}
          >
            {caloriesOver ? `+${calories - calorieGoal}` : caloriesLeft}
          </span>
          <span
            className="text-text-muted font-medium mt-1"
            style={{ fontSize: size * 0.075 }}
          >
            {caloriesOver ? 'kcal over' : 'kcal left'}
          </span>
          {calorieGoal > 0 && (
            <span
              className="text-text-muted"
              style={{ fontSize: size * 0.065 }}
            >
              of {calorieGoal}
            </span>
          )}
        </div>
      </div>

      {/* Macro bars */}
      <div className="flex gap-3 w-full max-w-[260px]">
        {macros.map((m) => (
          <MacroBar
            key={m.label}
            label={m.label}
            value={m.value}
            goal={m.goal}
            color={m.color}
            unit={m.unit}
          />
        ))}
      </div>
    </div>
  )
}

export { MacroRing }
export type { MacroRingProps }
