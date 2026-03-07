import Link from 'next/link'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-3xl shadow-lg"
        style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}
      >
        <span
          style={{
            fontSize: '36px',
            fontWeight: 900,
            color: 'white',
            fontFamily: 'var(--font-condensed, sans-serif)',
            lineHeight: 1,
          }}
        >
          M
        </span>
      </div>
      <div>
        <p className="text-5xl font-black text-text-primary">404</p>
        <h1 className="mt-2 text-lg font-black text-text-primary">Page not found</h1>
        <p className="mt-1.5 text-sm text-text-muted max-w-xs">
          That page doesn&apos;t exist or may have moved.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-black text-white shadow-md transition-all active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}
      >
        <Home size={15} />
        Go Home
      </Link>
    </div>
  )
}
