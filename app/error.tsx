'use client'

import { useEffect } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
        style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}
      >
        <AlertCircle size={28} className="text-white" />
      </div>
      <div>
        <h1 className="text-xl font-black text-text-primary">Something went wrong</h1>
        <p className="mt-1.5 text-sm text-text-muted max-w-xs">
          An unexpected error occurred. Your data is safe — tap below to try again.
        </p>
      </div>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-black text-white shadow-md transition-all active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}
      >
        <RotateCcw size={15} />
        Try Again
      </button>
    </div>
  )
}
