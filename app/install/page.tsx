'use client'

import { cn } from '@/lib/utils/cn'
import { Download, ScanBarcode, Salad, Share, Plus, Trophy } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Platform = 'ios' | 'android' | 'desktop' | 'unknown'

const BULL_G = '#00BEFF'

const FEATURES = [
  {
    icon: <Salad size={20} className="text-white" />,
    label: 'Smart Nutrition Tracking',
    desc: 'Log meals by barcode, name, or search — track macros instantly',
  },
  {
    icon: <ScanBarcode size={20} className="text-white" />,
    label: 'Barcode Scanner',
    desc: 'Scan any packaged food and auto-fill nutrition data in seconds',
  },
  {
    icon: <Trophy size={20} className="text-white" />,
    label: 'Elite Training Programs',
    desc: 'Influencer-led and BULLFIT original programs from $29.95/mo',
  },
]

function IOSInstructions() {
  return (
    <div
      className="rounded-2xl border border-border overflow-hidden shadow-md"
      style={{ background: 'var(--color-surface)' }}
    >
      <div className="h-0.5 w-full" style={{ background: BULL_G }} />
      <div className="p-5">
        <p className="text-[11px] font-black tracking-widest mb-1" style={{ color: '#00BEFF' }}>ADD TO HOME SCREEN</p>
        <p className="text-sm font-black text-text-primary mb-4">3 Quick Steps</p>

        <div className="flex flex-col gap-3">
          {[
            <>Tap the <Share size={13} className="inline text-[#00BEFF] mx-0.5" /> <strong>Share</strong> button at the bottom of Safari</>,
            <>Scroll down and tap <Plus size={13} className="inline text-[#00BEFF] mx-0.5" /> <strong>Add to Home Screen</strong></>,
            <>Tap <strong>Add</strong> in the top-right corner</>,
          ].map((content, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-black"
                style={{ background: BULL_G }}
              >
                {i + 1}
              </div>
              <p className="flex-1 pt-0.5 text-sm text-text-primary font-medium">{content}</p>
            </div>
          ))}
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
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const ua = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window)
    const isAndroid = /Android/.test(ua)

    if (isIOS) setPlatform('ios')
    else if (isAndroid) setPlatform('android')
    else setPlatform('desktop')

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
      if (outcome === 'accepted') setInstalled(true)
    } finally {
      setInstalling(false)
      setDeferredPrompt(null)
    }
  }

  if (isInstalled || installed) {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center bg-background px-6 text-center gap-5">
        <div
          className="w-20 h-20 rounded-3xl overflow-hidden shadow-xl border-2"
          style={{ borderColor: '#00BEFF' }}
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
          className="flex items-center justify-center gap-2 h-12 px-8 rounded-2xl text-black text-sm font-black tracking-widest shadow-lg active:scale-[0.98] transition-all"
          style={{ background: BULL_G }}
        >
          OPEN APP
        </Link>
      </main>
    )
  }

  return (
    <main className="flex flex-col min-h-screen bg-background">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: 'var(--color-background)' }}>
        <div className="h-1.5 w-full" style={{ background: BULL_G }} />
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,190,255,0.15), transparent 70%)' }} />
        <div className="absolute -left-6 bottom-0 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(207,0,255,0.10), transparent 70%)' }} />

        <div className="relative px-6 pt-14 pb-10 flex flex-col items-center text-center">
          <div
            className="w-24 h-24 rounded-3xl overflow-hidden mb-5 shadow-xl border"
            style={{ borderColor: 'rgba(0,190,255,0.30)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/api/icon?size=192" alt="BULLFIT" className="w-full h-full object-cover" />
          </div>
          <h1
            className="text-5xl font-black tracking-tight leading-none mb-2"
            style={{
              background: BULL_G,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            BULLFIT
          </h1>
          <p className="text-sm font-medium text-text-muted">
            Supplements · Nutrition · Programs
          </p>
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-4 flex flex-col gap-3">
        {FEATURES.map((f) => (
          <div
            key={f.label}
            className="flex items-center gap-4 rounded-2xl border border-border p-4"
            style={{ background: 'var(--color-surface)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: BULL_G }}
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

      {/* ── Install CTA ───────────────────────────────────────────────────── */}
      <div className="px-5 pb-12 mt-2 flex flex-col gap-3">
        {platform === 'ios' ? (
          <IOSInstructions />
        ) : deferredPrompt ? (
          <button
            onClick={handleInstall}
            disabled={installing}
            className={cn(
              'flex items-center justify-center gap-2 h-14 w-full rounded-2xl',
              'text-black text-sm font-black tracking-widest shadow-lg',
              'active:scale-[0.98] transition-all disabled:opacity-60',
            )}
            style={{ background: BULL_G }}
          >
            {installing ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <Download size={18} />
                INSTALL BULLFIT
              </>
            )}
          </button>
        ) : platform !== 'unknown' ? (
          <div
            className="rounded-2xl border border-border p-5 text-center"
            style={{ background: 'var(--color-surface)' }}
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
          style={{ background: 'var(--color-surface)' }}
        >
          OPEN IN BROWSER INSTEAD
        </Link>
      </div>

    </main>
  )
}
