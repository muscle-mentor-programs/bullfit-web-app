'use client'

import { cn } from '@/lib/utils/cn'
import { X } from 'lucide-react'
import { useState } from 'react'

const MON_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getUpcomingMondays(count = 12): Date[] {
  const dates: Date[] = []
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  while (d.getDay() !== 1) d.setDate(d.getDate() + 1)
  for (let i = 0; i < count; i++) {
    dates.push(new Date(d))
    d.setDate(d.getDate() + 7)
  }
  return dates
}

function toIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

interface Props {
  firstDayOfWeek?: number
  onConfirm: (startDate: string) => void
  onClose: () => void
}

export function StartDateModal({ onConfirm, onClose }: Props) {
  const dates = getUpcomingMondays(12)
  const [selected, setSelected] = useState(toIso(dates[0]))

  const selectedDate = dates.find((d) => toIso(d) === selected) ?? dates[0]

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="rounded-t-3xl overflow-hidden shadow-2xl"
        style={{ background: 'linear-gradient(to bottom, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-border">
          <p className="text-[10px] font-black tracking-widest text-primary">PICK A START DATE</p>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-border text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Horizontal sliding Monday picker */}
        <div
          className="flex gap-2.5 px-4 py-4 overflow-x-auto snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none' }}
        >
          {dates.map((date) => {
            const iso = toIso(date)
            const active = iso === selected
            return (
              <button
                key={iso}
                onClick={() => setSelected(iso)}
                className={cn(
                  'flex-shrink-0 snap-center flex flex-col items-center justify-center w-16 h-18 rounded-2xl border transition-all active:scale-[0.95] py-3',
                  active
                    ? 'text-white border-transparent shadow-md'
                    : 'border-border text-text-secondary hover:border-primary/40',
                )}
                style={
                  active
                    ? { background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }
                    : { background: 'var(--color-surface-2)' }
                }
              >
                <span className={cn('text-[10px] font-black tracking-wide', active ? 'text-white/80' : 'text-text-muted')}>
                  {MON_SHORT[date.getMonth()]}
                </span>
                <span className="text-2xl font-black leading-none mt-0.5">{date.getDate()}</span>
              </button>
            )
          })}
        </div>

        {/* Confirm */}
        <div className="px-4" style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}>
          <button
            onClick={() => onConfirm(selected)}
            className="h-12 w-full rounded-2xl text-white text-sm font-black tracking-widest shadow-lg active:scale-[0.98] transition-all"
            style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}
          >
            START {MON_SHORT[selectedDate.getMonth()].toUpperCase()} {selectedDate.getDate()}
          </button>
        </div>
      </div>
    </div>
  )
}
