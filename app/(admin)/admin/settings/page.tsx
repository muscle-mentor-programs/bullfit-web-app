'use client'

import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import { Dumbbell, ExternalLink, LogOut, Mail, Palette, Shield, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminSettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div
        className="rounded-2xl overflow-hidden border border-primary/20 shadow-md relative"
        style={{ background: '#00BEFF' }}
      >
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)' }} />
        <div className="px-6 py-5 relative">
          <h1 className="text-xl font-bold text-white">Settings</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>Admin account &amp; app settings</p>
        </div>
      </div>

      {/* Admin Account Card */}
      <div className="rounded-2xl border border-border overflow-hidden shadow-md" style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}>
        <div className="h-0.5 w-full" style={{ background: '#00BEFF' }} />
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#00BEFF' }}>
            <Shield size={12} className="text-white" />
          </div>
          <h2 className="text-sm font-black tracking-wider text-text-primary">ACCOUNT</h2>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl shadow-sm" style={{ background: '#00BEFF' }}>
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Administrator</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Mail size={12} className="text-text-muted" />
                <p className="text-xs text-text-muted">BULLFIT Admin</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="rounded-2xl border border-border overflow-hidden shadow-md" style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}>
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--color-accent-light), var(--color-accent))' }}>
            <Dumbbell size={12} className="text-white" />
          </div>
          <h2 className="text-sm font-black tracking-wider text-text-primary">APP</h2>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Name</span>
            <span className="text-sm font-medium text-text-primary">BULLFIT</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Version</span>
            <span className="text-sm font-medium text-text-primary">0.1.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Environment</span>
            <span className={cn(
              'text-xs font-bold px-2 py-0.5 rounded-full',
              process.env.NODE_ENV === 'production'
                ? 'bg-success/10 text-success'
                : 'bg-warning/10 text-warning',
            )}>
              {process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'DEVELOPMENT'}
            </span>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="rounded-2xl border border-border overflow-hidden shadow-md" style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}>
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8878C0, #6b5ba0)' }}>
            <Palette size={12} className="text-white" />
          </div>
          <h2 className="text-sm font-black tracking-wider text-text-primary">APPEARANCE</h2>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">Theme</p>
              <p className="text-xs text-text-muted mt-0.5">Switch between light and dark mode</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Switch to Client View */}
      <div className="rounded-2xl border border-border overflow-hidden shadow-md" style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}>
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #34d399, #059669)' }}>
            <User size={12} className="text-white" />
          </div>
          <h2 className="text-sm font-black tracking-wider text-text-primary">CLIENT VIEW</h2>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-text-primary">Switch to Client Side</p>
              <p className="text-xs text-text-muted mt-0.5">View the app as a regular client would see it</p>
            </div>
            <Link
              href="/dashboard"
              className={cn(
                'inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-black flex-shrink-0',
                'text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]',
              )}
              style={{ background: 'linear-gradient(135deg, #34d399, #059669)' }}
            >
              <ExternalLink size={14} />
              Go to Client
            </Link>
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        disabled={signingOut}
        className={cn(
          'w-full flex items-center justify-center gap-2.5 h-12 rounded-xl',
          'border border-error/30 bg-error/5 text-error text-sm font-bold tracking-wider',
          'hover:bg-error/10 active:scale-[0.98] transition-all duration-150',
          'disabled:opacity-50 disabled:pointer-events-none',
        )}
      >
        <LogOut size={16} />
        {signingOut ? 'SIGNING OUT...' : 'SIGN OUT'}
      </button>
    </div>
  )
}
