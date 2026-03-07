'use client'

import { cn } from '@/lib/utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

function Card({ children, className, onClick, padding = 'md' }: CardProps) {
  const isClickable = typeof onClick === 'function'

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={cn(
        'bg-surface rounded-2xl border border-border',
        'transition-all duration-150',
        isClickable && [
          'cursor-pointer',
          'hover:bg-surface-2',
          'active:scale-[0.99]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        ],
        paddingStyles[padding],
        className,
      )}
    >
      {children}
    </div>
  )
}

export { Card }
export type { CardProps }
