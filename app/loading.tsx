export default function RootLoading() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}
    >
      <div className="flex flex-col items-center gap-6">
        <span
          style={{
            fontSize: '80px',
            fontWeight: 900,
            color: 'white',
            fontFamily: 'var(--font-condensed, sans-serif)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            textShadow: '0 4px 24px rgba(0,0,0,0.25)',
          }}
        >
          M
        </span>
        <div
          className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'rgba(255,255,255,0.35)', borderTopColor: 'transparent' }}
        />
      </div>
    </div>
  )
}
