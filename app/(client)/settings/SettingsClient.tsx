'use client'

import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import { ChevronRight, Lightbulb, LogOut, Moon, ShieldCheck, Sun } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface SettingsClientProps {
  user: { name: string; email: string }
  isAdmin?: boolean
}

export function SettingsClient({ user, isAdmin }: SettingsClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [showFeature, setShowFeature] = useState(false)
  const [featureText, setFeatureText] = useState('')
  const [featureSent, setFeatureSent] = useState(false)

  // Restore theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bf-theme') as 'light' | 'dark' | null
    if (saved) {
      setTheme(saved)
      document.documentElement.classList.toggle('dark', saved === 'dark')
    }
  }, [])

  function applyTheme(t: 'light' | 'dark') {
    setTheme(t)
    localStorage.setItem('bf-theme', t)
    document.documentElement.classList.toggle('dark', t === 'dark')
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function submitFeature() {
    if (!featureText.trim()) return
    const subject = encodeURIComponent('Feature Request — BULLFIT App')
    const body = encodeURIComponent(`From: ${user.name} (${user.email})\n\n${featureText}`)
    window.open(`mailto:branden@bullfit.com?subject=${subject}&body=${body}`, '_blank')
    setFeatureSent(true)
    setFeatureText('')
    setTimeout(() => { setShowFeature(false); setFeatureSent(false) }, 2000)
  }

  // ── Feature request panel ──────────────────────────────────────────
  if (showFeature) return (
    <div className="flex flex-col min-h-screen bg-background animate-slide-in-right">
      <div className="flex items-center gap-3 px-4 pt-12 pb-6">
        <button onClick={() => { setShowFeature(false); setFeatureSent(false) }} className="text-text-muted hover:text-text-primary">
          <ChevronRight size={20} className="rotate-180" />
        </button>
        <h1 className="text-xl font-black text-text-primary">Request a Feature</h1>
      </div>

      {featureSent ? (
        <div className="mx-4 rounded-2xl border border-[#22C55E]/30 bg-[#22C55E]/10 p-6 text-center">
          <p className="text-sm font-black text-[#22C55E]">REQUEST SENT!</p>
          <p className="text-xs text-text-muted normal-case mt-1">Thanks — we read every one.</p>
        </div>
      ) : (
        <div className="px-4 space-y-4">
          <p className="text-xs text-text-muted normal-case leading-relaxed">
            Tell us what you'd like to see in the app. Your feedback goes directly to the BULLFIT team.
          </p>
          <div>
            <label className="block text-[11px] font-black tracking-widest text-text-muted mb-2">YOUR IDEA</label>
            <textarea
              value={featureText}
              onChange={e => setFeatureText(e.target.value)}
              placeholder="Describe your feature request..."
              rows={5}
              className={cn(
                'w-full px-4 py-3 rounded-xl border border-border bg-background',
                'text-sm text-text-primary normal-case leading-relaxed resize-none',
                'focus:outline-none focus:border-[#00BEFF] focus:ring-2 focus:ring-[#00BEFF]/20',
              )}
            />
          </div>
          <button
            onClick={submitFeature}
            disabled={!featureText.trim()}
            className="flex items-center gap-2 h-11 w-full justify-center rounded-xl text-black text-sm font-black tracking-widest disabled:opacity-40"
            style={{ background: '#00BEFF' }}
          >
            <Lightbulb size={15} />
            SEND TO BULLFIT TEAM
          </button>
        </div>
      )}
    </div>
  )

  // ── Main Settings ──────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-background animate-fade-in pb-24">

      {/* Hero */}
      <div className="page-hero" style={{ paddingTop: 'max(env(safe-area-inset-top), 44px)' }}>
        <div className="hero-accent-bar" />
        <div className="px-5 pt-6 pb-5 relative">
          <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', color: '#9A9A9A', textTransform: 'uppercase' }}>
            APP PREFERENCES
          </p>
          <h1 style={{ fontFamily: 'var(--font-condensed)', fontSize: 40, fontWeight: 900, letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 1.05, color: '#0F0F0F', marginTop: 4 }}>
            SETTINGS
          </h1>
        </div>
      </div>

      {/* ── Appearance ───────────────────────────────────────── */}
      <p className="px-4 pt-5 pb-2 text-[10px] font-black tracking-widest text-text-muted">APPEARANCE</p>
      <div className="mx-4 border-t border-b border-border">
        <div className="px-4 py-4 bg-background">
          <p className="text-sm font-black text-text-primary mb-3">Theme</p>
          <div className="flex gap-2 p-1 rounded-2xl" style={{ background: 'var(--color-surface-2)' }}>
            <button
              onClick={() => applyTheme('light')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl',
                'text-[11px] font-black tracking-widest transition-all duration-200',
                theme === 'light' ? 'text-black shadow-sm' : 'text-text-muted',
              )}
              style={theme === 'light' ? { background: '#FFFFFF' } : {}}
            >
              <Sun size={13} />
              LIGHT
            </button>
            <button
              onClick={() => applyTheme('dark')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl',
                'text-[11px] font-black tracking-widest transition-all duration-200',
                theme === 'dark' ? 'text-white shadow-sm' : 'text-text-muted',
              )}
              style={theme === 'dark' ? { background: '#111111' } : {}}
            >
              <Moon size={13} />
              DARK
            </button>
          </div>
        </div>
      </div>

      {/* ── Support ──────────────────────────────────────────── */}
      <p className="px-4 pt-5 pb-2 text-[10px] font-black tracking-widest text-text-muted">SUPPORT</p>
      <div className="border-t border-border">
        <button
          onClick={() => setShowFeature(true)}
          className="flex w-full items-center gap-4 px-4 py-4 bg-background hover:bg-surface transition-colors text-left border-b border-border"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--color-surface-2), var(--color-background))' }}>
            <Lightbulb size={17} className="text-text-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-text-primary">Request a Feature</p>
            <p className="text-xs text-text-muted mt-0.5 normal-case font-normal">Send your ideas directly to the team</p>
          </div>
          <ChevronRight size={16} className="text-text-muted flex-shrink-0" />
        </button>
      </div>

      {/* ── Account ───────────────────────────────────────────── */}
      <p className="px-4 pt-5 pb-2 text-[10px] font-black tracking-widest text-text-muted">ACCOUNT</p>
      <div className="border-t border-border">
        {isAdmin && (
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="flex w-full items-center gap-4 px-4 py-4 bg-background hover:bg-surface transition-colors text-left border-b border-border"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#00BEFF' }}>
              <ShieldCheck size={17} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-text-primary">Admin Panel</p>
              <p className="text-xs text-text-muted mt-0.5 normal-case font-normal">Manage programs, clients & subscribers</p>
            </div>
            <ChevronRight size={16} className="text-text-muted flex-shrink-0" />
          </button>
        )}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-4 px-4 py-4 bg-background hover:bg-surface transition-colors text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 flex items-center justify-center flex-shrink-0">
            <LogOut size={17} className="text-[#DC2626]" />
          </div>
          <span className="text-sm font-black text-[#DC2626]">Sign Out</span>
        </button>
      </div>

    </div>
  )
}
