'use client'

import { cn } from '@/lib/utils/cn'
import { Check } from 'lucide-react'

interface SetRowProps {
  setNumber: number
  weight: string
  reps: string
  completed: boolean
  onWeightChange: (val: string) => void
  onRepsChange: (val: string) => void
  onToggleComplete: () => void
  prevWeight?: string
  prevReps?: string
}

const PRIMARY_G = 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))'

function SetRow({
  setNumber,
  weight,
  reps,
  completed,
  onWeightChange,
  onRepsChange,
  onToggleComplete,
  prevWeight,
  prevReps,
}: SetRowProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border transition-all duration-200',
        completed ? 'border-primary/30' : 'border-border',
      )}
      style={{
        background: completed
          ? 'linear-gradient(135deg, rgba(74,126,212,0.07), rgba(15,58,122,0.10))'
          : 'var(--color-surface)',
      }}
    >
      <div className="flex items-end gap-2 px-2.5 py-2">

        {/* Set number badge */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <span className="text-[9px] font-black text-text-muted tracking-widest uppercase">SET</span>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
            style={
              completed
                ? { background: PRIMARY_G, color: 'white', boxShadow: '0 2px 8px rgba(37,88,168,0.35)' }
                : { background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }
            }
          >
            {setNumber}
          </div>
        </div>

        {/* Weight input */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="text-[9px] font-black text-text-muted tracking-widest uppercase text-center">WEIGHT</span>
          <input
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => onWeightChange(e.target.value)}
            placeholder="lbs"
            disabled={completed}
            className={cn(
              'w-full h-10 px-2 rounded-xl border text-lg text-center font-bold',
              'bg-background border-border',
              'placeholder:text-text-muted/40 placeholder:text-xs placeholder:font-normal text-text-primary',
              'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
              'disabled:pointer-events-none',
              '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
            )}
            aria-label={`Set ${setNumber} weight in pounds`}
          />
          {prevWeight !== undefined && (
            <span className="text-[10px] text-text-muted text-center leading-none">prev: {prevWeight} lbs</span>
          )}
        </div>

        {/* Reps input */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="text-[9px] font-black text-text-muted tracking-widest uppercase text-center">REPS</span>
          <input
            type="number"
            inputMode="numeric"
            value={reps}
            onChange={(e) => onRepsChange(e.target.value)}
            placeholder="reps"
            disabled={completed}
            className={cn(
              'w-full h-10 px-2 rounded-xl border text-lg text-center font-bold',
              'bg-background border-border',
              'placeholder:text-text-muted/40 placeholder:text-xs placeholder:font-normal text-text-primary',
              'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
              'disabled:pointer-events-none',
              '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
            )}
            aria-label={`Set ${setNumber} reps`}
          />
          {prevReps !== undefined && (
            <span className="text-[10px] text-text-muted text-center leading-none">prev: {prevReps} reps</span>
          )}
        </div>

        {/* Complete toggle */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <span className="text-[9px] font-black text-transparent tracking-widest uppercase select-none">OK</span>
          <button
            onClick={onToggleComplete}
            aria-label={completed ? `Mark set ${setNumber} incomplete` : `Mark set ${setNumber} complete`}
            aria-pressed={completed}
            className={cn(
              'w-9 h-9 rounded-xl border-2 flex items-center justify-center',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              completed
                ? 'border-transparent text-white'
                : 'border-border text-transparent hover:border-primary/50',
            )}
            style={completed ? { background: PRIMARY_G, boxShadow: '0 2px 8px rgba(37,88,168,0.35)' } : {}}
          >
            <Check size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  )
}

export { SetRow }
export type { SetRowProps }
