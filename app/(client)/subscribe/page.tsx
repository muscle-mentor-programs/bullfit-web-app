'use client'

import { cn } from '@/lib/utils/cn'
import { CheckCircle2, Loader2, Tag, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const FEATURES = [
  'Full access to all training programs',
  'Unlimited program enrollments',
  'Build & customize your own workouts',
  'Progress & weight tracking',
  'New programs added regularly',
  'Cancel anytime',
]

type Interval = 'monthly' | 'yearly'

const PLANS: Record<Interval, { price: string; sub: string; badge: string; fine: string }> = {
  monthly: {
    price: '$29.95',
    sub: '/mo',
    badge: '7-DAY FREE TRIAL',
    fine: 'Try free for 7 days — no charge until your trial ends. After trial, billed $29.95/mo.',
  },
  yearly: {
    price: '$305.95',
    sub: '/yr',
    badge: 'SAVE 15%',
    fine: 'Billed $305.95 once per year — that\'s just $25.50/mo. 7-day free trial included.',
  },
}

const VALID_PROMO_CODE = 'FREETESTER100'

export default function SubscribePage() {
  const router = useRouter()
  const [interval, setInterval] = useState<Interval>('monthly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Promo code state
  const [showPromo, setShowPromo] = useState(false)
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState('')
  const [promoError, setPromoError] = useState('')

  const plan = PLANS[interval]
  const isPromoApplied = appliedPromo === VALID_PROMO_CODE

  function handleApplyPromo() {
    const code = promoInput.trim().toUpperCase()
    if (code === VALID_PROMO_CODE) {
      setAppliedPromo(code)
      setPromoError('')
    } else {
      setPromoError('Invalid promo code')
    }
  }

  function handleRemovePromo() {
    setAppliedPromo('')
    setPromoInput('')
    setPromoError('')
  }

  async function handleSubscribe() {
    setLoading(true)
    setError('')
    try {
      if (isPromoApplied) {
        // Bypass Stripe — activate free subscription via promo
        const res = await fetch('/api/promo/redeem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: appliedPromo }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error ?? 'Something went wrong')
          return
        }
        router.push('/dashboard?subscribed=1')
      } else {
        // Normal Stripe checkout
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interval }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error ?? 'Something went wrong')
          return
        }
        if (data.url) window.location.href = data.url
      }
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-safe">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 text-center">
        <h1 className="text-3xl font-black text-text-primary mb-2">Unlock Everything</h1>
        <p className="text-sm text-text-secondary">
          One subscription. All programs. No limits.
        </p>
      </div>

      {/* Billing toggle — hidden when promo applied */}
      {!isPromoApplied && (
        <div className="flex justify-center mb-6 px-4">
          <div className="flex items-center bg-surface-2 border border-border rounded-xl p-1 gap-1">
            <button
              onClick={() => setInterval('monthly')}
              className={cn(
                'px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150',
                interval === 'monthly'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-muted hover:text-text-secondary',
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setInterval('yearly')}
              className={cn(
                'px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center gap-2',
                interval === 'yearly'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-muted hover:text-text-secondary',
              )}
            >
              Yearly
              <span
                className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors',
                  interval === 'yearly'
                    ? 'bg-white/20 text-white'
                    : 'bg-success/15 text-success',
                )}
              >
                -15%
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Price card */}
      <div className={cn(
        'mx-4 mb-6 rounded-2xl border-2 p-6',
        isPromoApplied
          ? 'border-success bg-success/5'
          : 'border-primary bg-primary/5',
      )}>
        {/* Price / promo display */}
        {isPromoApplied ? (
          <div className="text-center mb-5">
            <p className="text-5xl font-black text-success mb-1">FREE</p>
            <p className="text-sm text-text-secondary">Promo code applied — full access activated</p>
          </div>
        ) : (
          <>
            <div className="flex items-end gap-1 justify-center mb-1">
              {interval === 'monthly' ? (
                <>
                  <span className="text-5xl font-black text-text-primary">$29</span>
                  <span className="text-2xl font-bold text-text-primary mb-1">.95</span>
                  <span className="text-sm text-text-muted mb-2">/mo</span>
                </>
              ) : (
                <>
                  <span className="text-5xl font-black text-text-primary">$305</span>
                  <span className="text-2xl font-bold text-text-primary mb-1">.95</span>
                  <span className="text-sm text-text-muted mb-2">/yr</span>
                </>
              )}
            </div>

            {interval === 'yearly' && (
              <p className="text-center text-xs text-text-muted mb-2">
                Just <span className="font-bold text-text-secondary">$25.50/mo</span> — 2 months free
              </p>
            )}

            <div className="flex items-center justify-center gap-1.5 mb-5">
              <span
                className={cn(
                  'text-xs font-bold px-2.5 py-0.5 rounded-full',
                  interval === 'yearly'
                    ? 'bg-success/15 text-success'
                    : 'text-primary bg-primary/10',
                )}
              >
                {plan.badge}
              </span>
              {interval === 'monthly' ? null : (
                <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  7-DAY FREE TRIAL
                </span>
              )}
            </div>
          </>
        )}

        {/* Feature list */}
        <div className="space-y-2.5 mb-6">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-3">
              <CheckCircle2 size={16} className={cn('flex-shrink-0', isPromoApplied ? 'text-success' : 'text-success')} />
              <span className="text-sm text-text-secondary">{f}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        {error && (
          <p className="text-xs text-center text-error mb-3">{error}</p>
        )}
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className={cn(
            'w-full h-13 rounded-xl text-sm font-bold',
            'flex items-center justify-center gap-2',
            'active:scale-[0.98] transition-all duration-150',
            'disabled:opacity-50 disabled:pointer-events-none',
            isPromoApplied
              ? 'bg-success text-white hover:bg-success/90'
              : 'bg-primary text-white hover:bg-primary-dark',
          )}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {isPromoApplied ? 'Activating...' : 'Redirecting...'}
            </>
          ) : (
            isPromoApplied ? 'Activate Free Access' : 'Start 7-Day Free Trial'
          )}
        </button>

        {!isPromoApplied && (
          <p className="text-[10px] text-center text-text-muted mt-3">
            {plan.fine}
          </p>
        )}
      </div>

      {/* Promo code section */}
      <div className="mx-4 mb-6">
        {isPromoApplied ? (
          <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-success/10 border border-success/30">
            <div className="flex items-center gap-2">
              <Tag size={14} className="text-success flex-shrink-0" />
              <span className="text-xs font-semibold text-success">{appliedPromo} applied</span>
            </div>
            <button
              onClick={handleRemovePromo}
              className="text-text-muted hover:text-text-primary transition-colors"
              aria-label="Remove promo code"
            >
              <X size={14} />
            </button>
          </div>
        ) : showPromo ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError('') }}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                placeholder="Enter promo code"
                className={cn(
                  'flex-1 h-10 px-3 rounded-xl border bg-surface text-sm font-mono text-text-primary placeholder:text-text-muted',
                  'focus:outline-none focus:border-primary',
                  promoError ? 'border-error' : 'border-border',
                )}
                autoFocus
              />
              <button
                onClick={handleApplyPromo}
                className="h-10 px-4 rounded-xl bg-surface border border-border text-xs font-bold text-text-secondary hover:border-primary hover:text-primary transition-colors"
              >
                Apply
              </button>
            </div>
            {promoError && <p className="text-xs text-error px-1">{promoError}</p>}
            <button
              onClick={() => { setShowPromo(false); setPromoError('') }}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowPromo(true)}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            <Tag size={12} />
            Have a promo code?
          </button>
        )}
      </div>

      {/* Back link */}
      <div className="text-center px-4 pb-8">
        <a
          href="/library"
          className="text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          ← Back to program library
        </a>
      </div>
    </div>
  )
}
