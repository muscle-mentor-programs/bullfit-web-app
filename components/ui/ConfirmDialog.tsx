'use client'

import { cn } from '@/lib/utils/cn'
import { AlertTriangle, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-sm rounded-2xl border border-border shadow-xl overflow-hidden"
        style={{ background: 'var(--color-surface)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                danger ? 'bg-error/10' : 'bg-primary/10',
              )}
            >
              <AlertTriangle size={18} className={danger ? 'text-error' : 'text-primary'} />
            </div>
            <h2 className="text-base font-black text-text-primary">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors flex-shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        <p className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">{message}</p>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:bg-surface-2 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => { onConfirm(); onClose() }}
            className={cn(
              'flex-1 h-11 rounded-xl text-sm font-black text-white transition-all active:scale-[0.98]',
              danger
                ? 'bg-error hover:bg-error/90'
                : 'shadow-primary',
            )}
            style={!danger ? { background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' } : {}}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
