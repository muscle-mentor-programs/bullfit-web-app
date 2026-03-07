'use client'

import { useEffect } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'

export default function ClientError({
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
    <div className="flex flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-md"
        style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}
      >
        <AlertCircle size={24} className="text-white" />
      </div>
      <div>
        <h2 className="text-lg font-black text-text-primary">Something went wrong</h2>
        <p className="mt-1.5 text-sm text-text-muted max-w-xs">
          An unexpected error occurred. Your data is safe — tap below to try again.
        </p>
      </div>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-black text-white shadow-md transition-all active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}
      >
        <RotateCcw size={14} />
        Try Again
      </button>
    </div>
  )
}
