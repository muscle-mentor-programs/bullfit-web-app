// Page skeleton shown while server-component data is fetching.
// Matches the gradient-header + rounded-card layout used by all tab pages
// so there is no jarring jump when the real content replaces this skeleton.
export default function ClientLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-6">
      {/* Gradient header card skeleton */}
      <div className="px-4 pt-12 pb-4">
        <div
          className="rounded-2xl h-[82px] opacity-80 animate-pulse"
          style={{
            background: 'var(--color-surface)',
            borderTop: '2px solid transparent',
            backgroundClip: 'padding-box',
          }}
        />
      </div>

      {/* Content card skeletons */}
      <div className="flex flex-col gap-5 px-4 pt-3">
        <div
          className="rounded-2xl border border-border h-28 animate-pulse"
          style={{ background: 'var(--color-surface)' }}
        />
        <div
          className="rounded-2xl border border-border h-44 animate-pulse"
          style={{ background: 'var(--color-surface)' }}
        />
        <div
          className="rounded-2xl border border-border h-24 animate-pulse"
          style={{ background: 'var(--color-surface)' }}
        />
      </div>
    </div>
  )
}
