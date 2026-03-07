'use client'

import { cn } from '@/lib/utils/cn'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const mobileSheetVariants = {
  hidden: { y: '100%', opacity: 1 },
  visible: { y: 0, opacity: 1 },
  exit: { y: '100%', opacity: 1 },
}

const desktopModalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 8 },
}

const transition = { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const }

function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={transition}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Mobile bottom sheet */}
          <motion.div
            key="mobile-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-50',
              'bg-background rounded-t-2xl',
              'max-h-[90vh] overflow-y-auto',
              'md:hidden',
              className,
            )}
            variants={mobileSheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transition}
          >
            <ModalInner title={title} onClose={onClose}>
              {children}
            </ModalInner>
          </motion.div>

          {/* Desktop centered dialog */}
          <div className="hidden md:flex fixed inset-0 z-50 items-center justify-center p-4">
            <motion.div
              key="desktop-modal"
              role="dialog"
              aria-modal="true"
              aria-label={title}
              className={cn(
                'bg-background rounded-2xl w-full max-w-md',
                'max-h-[90vh] overflow-y-auto',
                'border border-border',
                className,
              )}
              variants={desktopModalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={transition}
            >
              <ModalInner title={title} onClose={onClose}>
                {children}
              </ModalInner>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

interface ModalInnerProps {
  title?: string
  onClose: () => void
  children: React.ReactNode
}

function ModalInner({ title, onClose, children }: ModalInnerProps) {
  return (
    <>
      {/* Drag handle (mobile visual cue) */}
      <div className="flex justify-center pt-3 pb-1 md:hidden">
        <div className="w-10 h-1 rounded-full bg-border" />
      </div>

      {/* Header */}
      {title && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-lg',
              'text-text-muted hover:text-text-primary hover:bg-surface-2',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            )}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Close button when no title */}
      {!title && (
        <div className="flex justify-end px-4 pt-4">
          <button
            onClick={onClose}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-lg',
              'text-text-muted hover:text-text-primary hover:bg-surface-2',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            )}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="px-5 py-4">{children}</div>
    </>
  )
}

export { Modal }
export type { ModalProps }
