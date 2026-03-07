'use client'

import { type AccentColor, useTheme } from '@/lib/context/ThemeContext'
import { cn } from '@/lib/utils/cn'
import { Moon, Sun } from 'lucide-react'

// Each swatch uses a fixed gradient so it always shows the actual color
// regardless of the currently active theme/accent.
const ACCENTS: { id: AccentColor; label: string; gradient: string }[] = [
  { id: 'blue',   label: 'Blue',    gradient: 'linear-gradient(135deg, #4A7ED4, #0F3A7A)' },
  { id: 'red',    label: 'Red',     gradient: 'linear-gradient(135deg, #D84040, #7A0808)' },
  { id: 'green',  label: 'Green',   gradient: 'linear-gradient(135deg, #28AA55, #0A5020)' },
  { id: 'purple', label: 'Purple',  gradient: 'linear-gradient(135deg, #9048D8, #420878)' },
  { id: 'pink',   label: 'Pink',    gradient: 'linear-gradient(135deg, #D84090, #780040)' },
  { id: 'black',  label: 'Black',   gradient: 'linear-gradient(135deg, #555555, #111111)' },
]

export function ThemeToggle() {
  const { theme, setTheme, accent, setAccent } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="flex flex-col gap-5 w-full">

      {/* ── Mode ─────────────────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-black text-text-muted tracking-widest uppercase mb-2.5">
          MODE
        </p>
        <div className="flex gap-2.5">

          {/* Light */}
          <button
            onClick={() => setTheme('light')}
            aria-pressed={!isDark}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 h-11 rounded-xl',
              'text-sm font-black tracking-wide transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              !isDark
                ? 'text-white shadow-md'
                : 'border-2 border-border text-text-muted bg-surface-2 hover:border-border-strong hover:text-text-primary',
            )}
            style={
              !isDark
                ? { background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }
                : undefined
            }
          >
            <Sun size={15} />
            LIGHT
          </button>

          {/* Dark */}
          <button
            onClick={() => setTheme('dark')}
            aria-pressed={isDark}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 h-11 rounded-xl',
              'text-sm font-black tracking-wide transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              isDark
                ? 'text-white shadow-md'
                : 'border-2 border-border text-text-muted bg-surface-2 hover:border-border-strong hover:text-text-primary',
            )}
            style={
              isDark
                ? { background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }
                : undefined
            }
          >
            <Moon size={15} />
            DARK
          </button>

        </div>
      </div>

      {/* ── Color ────────────────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-black text-text-muted tracking-widest uppercase mb-2.5">
          COLOR
        </p>
        <div className="flex gap-2.5">
          {ACCENTS.map(({ id, label, gradient }) => {
            const isSelected = accent === id
            return (
              <button
                key={id}
                onClick={() => setAccent(id)}
                title={label}
                aria-label={`${label} accent color`}
                aria-pressed={isSelected}
                className={cn(
                  'flex-1 h-10 rounded-xl transition-all duration-200',
                  'focus-visible:outline-none',
                  isSelected
                    ? 'scale-[1.14]'
                    : 'opacity-50 hover:opacity-85 hover:scale-[1.06]',
                )}
                style={{
                  background: gradient,
                  // Double ring: background-color gap then primary ring
                  boxShadow: isSelected
                    ? `0 0 0 2px var(--color-background), 0 0 0 4px var(--color-primary), 0 4px 10px rgba(0,0,0,0.3)`
                    : '0 2px 6px rgba(0,0,0,0.15)',
                }}
              />
            )
          })}
        </div>
      </div>

    </div>
  )
}
