'use client'

import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import { Eye, EyeOff, Loader2, Mail, Share } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

const BULL_G = '#00BEFF'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908C16.658 14.25 17.64 11.942 17.64 9.205Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )
}

function LoginContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const next = searchParams.get('next') ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        setError(
          signInError.message === 'Invalid login credentials'
            ? 'Incorrect email or password.'
            : signInError.message
        )
        return
      }

      if (!user) {
        setError('Something went wrong. Please try again.')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      // Always land on the BULLFIT client app — admin panel accessible via /admin/dashboard
      router.push(next)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
  }

  const canSubmit = email.trim().length > 0 && password.length > 0

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-16">

      {/* BULLFIT Brand */}
      <div className="mb-10 flex flex-col items-center gap-4">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10"
          style={{ background: 'var(--color-surface)' }}
        >
          <span
            className="font-black text-4xl leading-none"
            style={{
              background: BULL_G,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >B</span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-widest text-text-primary">BULLFIT</h1>
          <p className="text-xs text-text-muted normal-case mt-1">Pharmacist formulated · Third-party tested</p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 w-full max-w-sm rounded-xl border border-[#FF3060]/30 bg-[#FF3060]/10 px-4 py-3">
          <p className="text-xs font-medium text-[#FF3060] normal-case">{error}</p>
        </div>
      )}

      {/* Login card */}
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="h-0.5 w-full mb-5 rounded-full" style={{ background: BULL_G }} />

        <h2 className="mb-5 text-sm font-black tracking-widest text-text-primary">SIGN IN</h2>

        {/* Email/password form */}
        <form onSubmit={handleEmailLogin} className="space-y-4 mb-5">
          <div>
            <label className="block text-[11px] font-black tracking-widest text-text-muted mb-2">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className={cn(
                'w-full h-12 px-4 rounded-xl border border-border',
                'bg-background text-sm text-text-primary placeholder:text-text-muted',
                'focus:outline-none focus:border-[#00BEFF] focus:ring-2 focus:ring-[#00BEFF]/20',
                'transition-all duration-150 normal-case',
              )}
            />
          </div>

          <div>
            <label className="block text-[11px] font-black tracking-widest text-text-muted mb-2">PASSWORD</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className={cn(
                  'w-full h-12 px-4 pr-11 rounded-xl border border-border',
                  'bg-background text-sm text-text-primary placeholder:text-text-muted',
                  'focus:outline-none focus:border-[#00BEFF] focus:ring-2 focus:ring-[#00BEFF]/20',
                  'transition-all duration-150',
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className={cn(
              'w-full h-12 rounded-xl text-sm font-black tracking-widest',
              'text-white active:scale-[0.98]',
              'disabled:opacity-40 disabled:pointer-events-none',
              'flex items-center justify-center gap-2.5 transition-all duration-150',
            )}
            style={{ background: BULL_G }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Mail size={16} />SIGN IN</>}
          </button>
        </form>

        {/* Divider */}
        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-surface px-3 text-[11px] font-black tracking-widest text-text-muted">OR</span>
          </div>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className={cn(
            'flex w-full items-center justify-center gap-3 h-12 rounded-xl',
            'border border-border bg-background',
            'text-sm font-medium text-text-primary normal-case',
            'hover:bg-surface-2 active:scale-[0.98] transition-all duration-150',
            'disabled:opacity-40 disabled:pointer-events-none',
          )}
        >
          {googleLoading ? <Loader2 size={16} className="animate-spin" /> : <><GoogleIcon />Continue with Google</>}
        </button>
      </div>

      <p className="mt-6 text-center text-[11px] tracking-wider text-text-muted leading-relaxed">
        OPEN IN MOBILE BROWSER →{' '}
        <span className="inline-flex items-center gap-0.5 text-text-secondary">
          <Share size={10} strokeWidth={2.5} />{' '}SHARE
        </span>
        {' '}→ ADD TO HOME SCREEN
      </p>

      <p className="mt-3 text-center text-[11px] tracking-wider text-text-muted leading-relaxed">
        BY CONTINUING YOU AGREE TO OUR{' '}
        <Link href="/terms" className="text-text-secondary hover:text-[#00BEFF] transition-colors">TERMS</Link>{' '}AND{' '}
        <Link href="/privacy" className="text-text-secondary hover:text-[#00BEFF] transition-colors">PRIVACY POLICY</Link>.
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}
