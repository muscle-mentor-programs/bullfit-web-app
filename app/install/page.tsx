'use client'

import { cn } from '@/lib/utils/cn'
import { Download, Dumbbell, LineChart, Salad, Share, Plus } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Platform = 'ios' | 'android' | 'desktop' | 'unknown'

const FEATURES = [
  {
    icon: <Dumbbell size={20} className="text-white" />,
    label: 'Guided Training Programs',
    desc: 'Expert-built workout plans that progress with you',
  },
  {
    icon: <Salad size={20} className="text-white" />,
    label: 'Nutrition Tracking',
    desc: 'Log meals by barcode, name, or weight — track macros daily',
  },
  {
    icon: <LineChart size={20} className="text-white" />,
    label: 'Progress Analytics',
    desc: 'Track weight, body metrics, and training history over time',
  },
]

function IOSInstructions() {
  return (
    <div
      className="rounded-2xl border border-border overflow-hidden shadow-md"
      style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
    >
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(to right, var(--color-primary-light), var(--color-primary-dark))' }} />
      <div className="p-5">
        <p className="text-[11px] font-black tracking-widest text-primary mb-1">ADD TO HOME SCREEN</p>
        <p className="text-sm font-black text-text-primary mb-4">3 Quick Steps</p>

        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-black"
              style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}
            >
              1
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm text-text-primary font-medium">
                Tap the{' '}
                <span className="inline-flex items-center gap-0.5 align-middle">
                  <Share size={13} className="text-primary" />
                </span>{' '}
                <strong>Share</strong> button at the bottom of Safari
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-black"
              style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}
            >
              2
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm text-text-primary font-medium">
                Scroll down and tap{' '}
                <span className="inline-flex items-center gap-0.5 align-middle">
                  <Plus size={13} className="text-primary" />
                </span>{' '}
                <strong>Add to Home Screen</strong>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-black"
              style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}
            >
              3
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm text-text-primary font-medium">
                Tap <strong>Add</strong> in the top-right corner
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InstallPage() {
  const [platform, setPlatform] = useState<Platform>('unknown')
  const [isInstalled, setIsInstalled] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installing, setInstalling] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Detect if already running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Detect platform
    const ua = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window)
    const isAndroid = /Android/.test(ua)

    if (isIOS) {
      setPlatform('ios')
    } else if (isAndroid) {
      setPlatform('android')
    } else {
      setPlatform('desktop')
    }

    // Capture the Chrome/Android install prompt
    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    setInstalling(true)
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setInstalled(true)
      }
    } finally {
      setInstalling(false)
      setDeferredPrompt(null)
    }
  }

  // Already installed
  if (isInstalled || installed) {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center bg-background px-6 text-center gap-5">
        <div
          className="w-20 h-20 rounded-3xl overflow-hidden shadow-xl border-2"
          style={{ borderColor: 'var(--color-primary-light)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/api/icon?size=192" alt="BULLFIT" className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-2xl font-black text-text-primary">You&apos;re all set!</p>
          <p className="text-sm text-text-muted mt-1">BULLFIT is installed on your device.</p>
        </div>
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center justify-center gap-2 h-12 px-8 rounded-2xl',
            'text-white text-sm font-black tracking-widest shadow-lg active:scale-[0.98] transition-all',
          )}
          style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}
        >
          OPEN APP
        </Link>
      </main>
    )
  }

  return (
    <main className="flex flex-col min-h-screen bg-background">

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, var(--color-primary-dark) 0%, var(--color-primary) 65%, var(--color-primary-light) 100%)' }}
      >
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)' }} />
        <div className="absolute -left-6 bottom-0 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)' }} />

        <div className="relative px-6 pt-14 pb-10 flex flex-col items-center text-center">
          <div
            className="w-24 h-24 rounded-3xl overflow-hidden mb-5 shadow-xl border-2"
            style={{ borderColor: 'rgba(255,255,255,0.25)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/api/icon?size=192" alt="BULLFIT" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white leading-none mb-2">
            MUSCLE<br />MENTOR
          </h1>
          <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.70)' }}>
            Your guided strength journey
          </p>
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-4 flex flex-col gap-3">
        {FEATURES.map((f) => (
          <div
            key={f.label}
            className="flex items-center gap-4 rounded-2xl border border-border p-4 shadow-sm"
            style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}
            >
              {f.icon}
            </div>
            <div>
              <p className="text-sm font-black text-text-primary">{f.label}</p>
              <p className="text-xs text-text-muted mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Install CTA ───────────────────────────────────────────────────────── */}
      <div className="px-5 pb-12 mt-2 flex flex-col gap-3">
        {platform === 'ios' ? (
          <IOSInstructions />
        ) : deferredPrompt ? (
          <button
            onClick={handleInstall}
            disabled={installing}
            className={cn(
              'flex items-center justify-center gap-2 h-14 w-full rounded-2xl',
              'text-white text-sm font-black tracking-widest shadow-lg',
              'active:scale-[0.98] transition-all disabled:opacity-60',
            )}
            style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))' }}
          >
            {installing ? (
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Download size={18} />
                INSTALL APP
              </>
            )}
          </button>
        ) : platform !== 'unknown' ? (
          // Browser doesn't support beforeinstallprompt (e.g. Firefox, already installed)
          <div
            className="rounded-2xl border border-border p-5 text-center shadow-sm"
            style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
          >
            <p className="text-sm text-text-muted leading-relaxed">
              To install, open this page in <strong className="text-text-primary">Chrome</strong> on Android
              or <strong className="text-text-primary">Safari</strong> on iPhone, then use your browser&apos;s
              install option.
            </p>
          </div>
        ) : null}

        <Link
          href="/dashboard"
          className="flex items-center justify-center h-11 w-full rounded-2xl border border-border text-sm font-black text-text-muted hover:text-text-primary transition-colors"
          style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
        >
          OPEN IN BROWSER INSTEAD
        </Link>
      </div>

    </main>
  )
}
