'use client'

import { cn } from '@/lib/utils/cn'
import { ExternalLink, ShoppingCart, Star, Zap, Tag, Package, ScanBarcode, Truck, RefreshCcw, Gift } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

const BULL_G = '#00BEFF'
const GOLD_G = 'linear-gradient(135deg, #FFC00E 0%, #FFD600 100%)'

// ─── Product Data ────────────────────────────────────────────────────────────

const SUPPLEMENTS = [
  {
    id: 'bodacious-pre',
    name: 'Bodacious Pre-Workout',
    tagline: 'HIGH-STIM FORMULA',
    description: '250mg caffeine + 5g creatine. Pharmacist formulated. Zero sucralose.',
    price: 59.95,
    salePrice: null,
    badge: 'BEST SELLER',
    badgeColor: '#FF0087',
    accentColor: '#00BEFF',
    category: 'Pre-Workout',
    flavors: ['Blue Rizz-Berry', 'Pina Coolada', 'Sour Apple', 'Coconut Lime', 'Fruit Pump', 'Freedom Pop'],
    image: '/products/bodacious.png',
    url: 'https://www.bullfit.com/products/bodacious-pre-workout',
  },
  {
    id: 'cowabunga-pre',
    name: 'Cowabunga Pre-Workout',
    tagline: 'DAILY DRIVER',
    description: '150mg caffeine + 1g creatine. Perfect for everyday training.',
    price: 49.95,
    salePrice: null,
    badge: null,
    badgeColor: '#CF00FF',
    accentColor: '#CF00FF',
    category: 'Pre-Workout',
    flavors: ['Tropical Punch', 'Peach Mango', 'Kiwi Strawberry', 'Pina Colada', 'Cherry Limeade', 'Freedom Pop'],
    image: '/products/cowabunga.png',
    url: 'https://www.bullfit.com/products/cowabunga-daily-pick-me-up-pre-workout',
  },
  {
    id: 'decalf-nonstim',
    name: 'De-Calf Non-Stim',
    tagline: 'ZERO CAFFEINE',
    description: '10g L-Citrulline + 5g creatine. Maximum pump, zero stimulants.',
    price: 54.95,
    salePrice: null,
    badge: null,
    badgeColor: '#00BEFF',
    accentColor: '#22C55E',
    category: 'Pre-Workout',
    flavors: ['Cherry Limeade', 'Freedom Pop'],
    image: '/products/decalf.png',
    url: 'https://www.bullfit.com/products/de-calf-non-stim-pre-workout',
  },
  {
    id: 'bullfit-hydrate',
    name: 'BullFit Hydrate',
    tagline: 'ZERO SUGAR ELECTROLYTES',
    description: 'Zero sugar electrolyte drink mix. 16 slap packs. Train harder, recover faster.',
    price: 19.95,
    salePrice: null,
    badge: 'NEW',
    badgeColor: '#FFD600',
    accentColor: '#44AADF',
    category: 'Hydration',
    flavors: ['Tropical Variety Pouch', 'Tropical Variety Box'],
    image: '/products/hydrate.png',
    url: 'https://www.bullfit.com/products/hydrate',
  },
]

// Per-product subscriptions: each unlocks the barcode scanner
// Delivery frequency options: every 30, 45, or 60 days
const SUPPSCRIPTIONS = [
  {
    id: 'supp-bodacious',
    name: 'Bodacious SuppScription',
    tagline: 'HIGH-STIM • AUTO-SHIP',
    description: 'High-stim pre-workout on auto-ship. Choose your flavor, pick your frequency. Never run out before a training session.',
    retailPrice: 59.95,
    savings: 'SUBSCRIBE & SAVE',
    frequencies: ['Every 30 days', 'Every 45 days', 'Every 60 days'],
    image: '/products/bodacious.png',
    accentColor: '#00BEFF',
    url: 'https://www.bullfit.com/products/bodacious-pre-workout',
  },
  {
    id: 'supp-cowabunga',
    name: 'Cowabunga SuppScription',
    tagline: 'DAILY DRIVER • AUTO-SHIP',
    description: 'Your everyday pre-workout on auto-ship. Consistent training starts with consistent supply.',
    retailPrice: 49.95,
    savings: 'SUBSCRIBE & SAVE',
    frequencies: ['Every 30 days', 'Every 45 days', 'Every 60 days'],
    image: '/products/cowabunga.png',
    accentColor: '#CF00FF',
    url: 'https://www.bullfit.com/products/cowabunga-daily-pick-me-up-pre-workout',
  },
  {
    id: 'supp-hydrate',
    name: 'Hydrate SuppScription',
    tagline: 'ELECTROLYTES • AUTO-SHIP',
    description: 'Zero sugar slap packs delivered on your schedule. Stay hydrated every single day.',
    retailPrice: 19.95,
    savings: 'SUBSCRIBE & SAVE',
    frequencies: ['Every 30 days', 'Every 45 days', 'Every 60 days'],
    image: '/products/hydrate.png',
    accentColor: '#44AADF',
    url: 'https://www.bullfit.com/products/hydrate',
  },
]

const APPAREL = [
  { id: 'pump-cover', name: 'BULLFIT Pump Cover', price: 44.99, category: 'Top' },
  { id: 'perf-tee', name: 'Performance Tee', price: 34.99, category: 'Top' },
  { id: 'crew-bag', name: 'Everyday Crew Bag 25L', price: 79.99, category: 'Bag' },
  { id: 'bull-pack', name: 'Tactical BullPack 45L', price: 119.99, category: 'Bag' },
  { id: 'socks', name: 'BULLFIT Socks 3-Pack', price: 19.99, category: 'Accessories' },
  { id: 'hat', name: 'Snapback Hat', price: 29.99, category: 'Accessories' },
]

// ─── Product Card ─────────────────────────────────────────────────────────────

function SupplementCard({ product }: { product: typeof SUPPLEMENTS[0] }) {
  return (
    <a
      href={product.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-3xl overflow-hidden"
      style={{
        boxShadow: [
          '0 16px 48px rgba(0,0,0,0.18)',
          '0 6px 16px rgba(0,0,0,0.12)',
          '0 2px 4px rgba(0,0,0,0.08)',
          'inset 0 1px 0 rgba(255,255,255,0.06)',
        ].join(','),
      }}
    >
      {/* ── Dark hero zone ── */}
      <div
        className="relative overflow-hidden"
        style={{ height: 190, background: 'linear-gradient(155deg, #0A0A0A 0%, #141414 55%, #070707 100%)' }}
      >
        {/* Atmospheric glow */}
        <div style={{
          position: 'absolute', width: 250, height: 250, top: -80, right: -50, borderRadius: '50%',
          background: `radial-gradient(circle, ${product.accentColor}50 0%, transparent 65%)`,
          filter: 'blur(50px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 180, height: 180, bottom: -60, left: -40, borderRadius: '50%',
          background: `radial-gradient(circle, ${product.accentColor}28 0%, transparent 65%)`,
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />

        {/* Scanline texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.010) 0px, rgba(255,255,255,0.010) 1px, transparent 1px, transparent 3px)',
        }} />

        {/* Product image — floated on white card so PNG backgrounds are always clean */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{
            position: 'relative', width: '58%', height: '82%',
            background: '#FFFFFF',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)',
          }}>
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-contain p-3"
              style={{ mixBlendMode: 'multiply' }}
              priority={product.id === 'bodacious-pre'}
            />
          </div>
        </div>

        {/* Badge */}
        {product.badge && (
          <span
            className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest text-black z-10"
            style={{ backgroundColor: product.badgeColor }}
          >
            {product.badge}
          </span>
        )}

        {/* Bottom overlay with category chip */}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 pb-4"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.20) 60%, transparent 100%)',
            paddingTop: 40,
          }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            background: `${product.accentColor}28`,
            border: `1px solid ${product.accentColor}55`,
            borderRadius: 7, padding: '3px 9px',
            fontSize: 9, fontWeight: 900, letterSpacing: '0.12em',
            color: product.accentColor,
          }}>
            {product.category.toUpperCase()}
          </div>
        </div>
      </div>

      {/* ── Content body ── */}
      <div style={{ background: 'var(--color-surface)' }}>
        {/* Gradient accent line */}
        <div style={{ height: 2.5, background: `linear-gradient(135deg, ${product.accentColor}, #CF00FF)` }} />

        <div className="p-5">
          {/* Name + tagline */}
          <h3
            style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: 24, fontWeight: 900, letterSpacing: '0.01em', lineHeight: 1.05,
              color: 'var(--color-text-primary)',
            }}
          >
            {product.name.toUpperCase()}
          </h3>
          <p className="text-[10px] font-black tracking-widest mt-0.5 mb-3" style={{ color: product.accentColor }}>
            {product.tagline}
          </p>
          <p className="text-xs text-text-muted mb-4 leading-relaxed normal-case">{product.description}</p>

          {/* Flavors */}
          <div className="flex flex-wrap gap-1 mb-4">
            {product.flavors.map(f => (
              <span key={f} className="text-[9px] px-2 py-0.5 rounded-full border border-border text-text-muted normal-case">
                {f}
              </span>
            ))}
          </div>

          {/* Price + CTA */}
          <div
            className="flex items-center justify-between pt-4"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <div className="flex flex-col leading-none">
              {product.salePrice ? (
                <>
                  <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--color-text-primary)' }}>
                    ${product.salePrice}
                  </span>
                  <span className="text-xs text-text-muted line-through mt-0.5">${product.price}</span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--color-text-primary)' }}>
                    ${product.price}
                  </span>
                  <span className="text-[10px] text-text-muted font-normal normal-case mt-1">one-time</span>
                </>
              )}
            </div>
            <div
              className="flex items-center gap-1.5 px-5 py-3 rounded-2xl text-xs font-black text-black"
              style={{
                background: product.accentColor,
                boxShadow: `0 4px 18px ${product.accentColor}55`,
              }}
            >
              <ShoppingCart size={13} />
              SHOP
            </div>
          </div>
        </div>
      </div>
    </a>
  )
}

function SuppScriptionCard({ sub }: { sub: typeof SUPPSCRIPTIONS[0] }) {
  return (
    <a
      href={sub.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-3xl overflow-hidden"
      style={{
        boxShadow: [
          '0 16px 48px rgba(0,0,0,0.18)',
          '0 6px 16px rgba(0,0,0,0.12)',
          '0 2px 4px rgba(0,0,0,0.08)',
          'inset 0 1px 0 rgba(255,255,255,0.06)',
        ].join(','),
      }}
    >
      {/* ── Dark hero zone ── */}
      <div
        className="relative overflow-hidden"
        style={{ height: 170, background: 'linear-gradient(155deg, #0A0A0A 0%, #141414 55%, #070707 100%)' }}
      >
        {/* Atmospheric glow */}
        <div style={{
          position: 'absolute', width: 220, height: 220, top: -70, right: -40, borderRadius: '50%',
          background: `radial-gradient(circle, ${sub.accentColor}50 0%, transparent 65%)`,
          filter: 'blur(45px)', pointerEvents: 'none',
        }} />

        {/* Scanline texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.010) 0px, rgba(255,255,255,0.010) 1px, transparent 1px, transparent 3px)',
        }} />

        {/* Product image — floated on white card */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{
            position: 'relative', width: '55%', height: '80%',
            background: '#FFFFFF',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)',
          }}>
            <Image
              src={sub.image}
              alt={sub.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-contain p-3"
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>
        </div>

        {/* Bottom overlay with scanner badge */}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 pb-4"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.70) 0%, transparent 100%)',
            paddingTop: 40,
          }}
        >
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest text-black"
            style={{ background: GOLD_G }}
          >
            <ScanBarcode size={10} />
            SCANNER UNLOCKED
          </div>
        </div>
      </div>

      {/* ── Content body ── */}
      <div style={{ background: 'var(--color-surface)' }}>
        {/* Gradient accent line */}
        <div style={{ height: 2.5, background: `linear-gradient(135deg, ${sub.accentColor}, #FFD600)` }} />

        <div className="p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black tracking-widest" style={{ color: sub.accentColor }}>
              SUPPSCRIPTION™
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest"
              style={{ background: GOLD_G, color: '#000' }}
            >
              {sub.savings}
            </span>
          </div>

          <h3
            style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: 22, fontWeight: 900, letterSpacing: '0.01em', lineHeight: 1.05,
              color: 'var(--color-text-primary)', marginTop: 4, marginBottom: 2,
            }}
          >
            {sub.name.toUpperCase()}
          </h3>
          <p className="text-[10px] font-black tracking-widest mb-3" style={{ color: sub.accentColor }}>{sub.tagline}</p>
          <p className="text-xs text-text-muted mb-4 normal-case leading-relaxed">{sub.description}</p>

          {/* Frequency options */}
          <div className="mb-4">
            <p className="text-[10px] font-black tracking-widest text-text-muted mb-1.5">DELIVERY FREQUENCY</p>
            <div className="flex gap-1.5">
              {sub.frequencies.map(f => (
                <span key={f} className="text-[9px] px-2 py-1 rounded-lg border border-border text-text-secondary font-semibold normal-case">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Perks row */}
          <div className="flex items-center gap-3 mb-5 text-[10px] text-text-secondary normal-case">
            <span className="flex items-center gap-1"><Truck size={10} /> Free shipping</span>
            <span className="flex items-center gap-1"><RefreshCcw size={10} /> Pause anytime</span>
            <span className="flex items-center gap-1"><Gift size={10} /> New flavors</span>
          </div>

          {/* CTA */}
          <div
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black text-black"
            style={{
              background: `linear-gradient(135deg, ${sub.accentColor}, #FFD600)`,
              boxShadow: `0 4px 18px ${sub.accentColor}45`,
            }}
          >
            <ScanBarcode size={13} />
            SUBSCRIBE + UNLOCK SCANNER
          </div>
        </div>
      </div>
    </a>
  )
}

// ─── Main ShopClient ──────────────────────────────────────────────────────────

type ShopTab = 'supplements' | 'suppscriptions' | 'apparel'
const SHOP_TAB_ORDER: ShopTab[] = ['supplements', 'suppscriptions', 'apparel']

export function ShopClient({ hasSuppScription }: { hasSuppScription: boolean }) {
  const [activeTab, setActiveTab] = useState<ShopTab>('supplements')
  const [slideClass, setSlideClass] = useState('')

  function switchTab(newTab: ShopTab) {
    if (newTab === activeTab) return
    const dir = SHOP_TAB_ORDER.indexOf(newTab) > SHOP_TAB_ORDER.indexOf(activeTab) ? 'right' : 'left'
    setSlideClass(dir === 'right' ? 'tab-slide-from-right' : 'tab-slide-from-left')
    setActiveTab(newTab)
  }

  const TABS: { id: ShopTab; label: string; icon: React.ElementType }[] = [
    { id: 'supplements',   label: 'Supps',      icon: Zap },
    { id: 'suppscriptions',label: 'Subscribe',  icon: Star },
    { id: 'apparel',       label: 'Apparel',    icon: Package },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background pb-6 animate-fade-in">

      {/* ── Dark BULLFIT Page Hero ─────────────────── */}
      <div className="page-hero" style={{ paddingTop: 'max(env(safe-area-inset-top), 44px)' }}>
        <div className="hero-accent-bar" />
        <div className="hero-glow" style={{
          width: 200, height: 200, top: -60, right: -40,
          background: 'radial-gradient(circle, rgba(0,190,255,0.18) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }} />
        <div className="hero-glow" style={{
          width: 160, height: 160, bottom: -20, left: -30,
          background: 'radial-gradient(circle, rgba(207,0,255,0.12) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }} />
        <div className="px-5 pt-6 pb-5 relative">
          <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.18em',
            color: '#9A9A9A', textTransform: 'uppercase' }}>
            PHARMACIST-FORMULATED
          </p>
          <h1 style={{ fontFamily: 'var(--font-condensed)', fontSize: 40, fontWeight: 900,
            letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 1.05,
            color: '#0F0F0F', marginTop: 4 }}>
            SHOP
          </h1>
        </div>
      </div>

      {/* ── Promo Banner ─────────────────────────────────────────────────── */}
      <div className="mx-4 mt-4 mb-3 rounded-xl overflow-hidden">
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, rgba(255,0,135,0.15), rgba(207,0,255,0.10))' }}
        >
          <div className="flex items-center gap-2">
            <Tag size={14} className="text-[#FF0087]" />
            <span className="text-xs font-black tracking-widest text-text-primary">30% OFF EVERYTHING</span>
          </div>
          <span
            className="px-2 py-1 rounded-lg text-[9px] font-black tracking-widest text-black"
            style={{ background: GOLD_G }}
          >
            CODE: MIKEOHEARN
          </span>
        </div>
      </div>

      {/* ── Tab Switcher ─────────────────────────────────────────────────── */}
      <div className="px-4 mb-4">
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.6)' }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => switchTab(id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl',
                'text-[10px] font-black tracking-widest transition-all duration-200',
                activeTab === id ? 'text-black' : 'text-text-muted',
              )}
              style={activeTab === id ? { background: BULL_G } : {}}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div key={activeTab} className={cn('flex flex-col gap-4 px-4', slideClass)}>

        {activeTab === 'supplements' && (
          <>
            {!hasSuppScription && (
              <div
                className="rounded-xl px-4 py-3 flex items-center gap-3 border"
                style={{ background: 'rgba(0,190,255,0.08)', borderColor: 'rgba(0,190,255,0.20)' }}
              >
                <Star size={16} className="text-[#00BEFF] flex-shrink-0" />
                <div>
                  <p className="text-xs font-black text-[#00BEFF]">SUPPSCRIPTION MEMBERS SAVE 20%+</p>
                  <p className="text-[10px] text-text-muted normal-case">Subscribe for exclusive pricing + scanner access</p>
                </div>
              </div>
            )}
            {SUPPLEMENTS.map(product => (
              <SupplementCard key={product.id} product={product} />
            ))}
          </>
        )}

        {activeTab === 'suppscriptions' && (
          <>
            {/* Scanner unlock hero */}
            <div
              className="rounded-2xl overflow-hidden border border-[#FFD60033]"
              style={{ background: 'var(--color-surface)' }}
            >
              <div className="h-1 w-full" style={{ background: GOLD_G }} />
              <div className="px-4 py-4 flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center"
                  style={{ background: GOLD_G }}
                >
                  <ScanBarcode size={22} className="text-black" />
                </div>
                <div>
                  <p className="text-sm font-black text-text-primary">ANY SUPPSCRIPTION</p>
                  <p className="text-sm font-black text-text-primary">UNLOCKS THE BARCODE SCANNER</p>
                  <p className="text-[10px] text-text-muted normal-case mt-0.5">
                    Scan any packaged food in the Nutrition tab — log meals in seconds
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center pt-1">
              <h2 className="text-xl font-black bull-gradient-text">SUPPSCRIPTIONS™</h2>
              <p className="text-xs text-text-muted normal-case mt-1">
                Subscribe to Bodacious, Cowabunga, or Hydrate — save on every order
              </p>
            </div>

            {SUPPSCRIPTIONS.map(sub => (
              <SuppScriptionCard key={sub.id} sub={sub} />
            ))}

            <div
              className="rounded-xl px-4 py-3 flex items-center gap-3 border"
              style={{ background: 'rgba(0,190,255,0.06)', borderColor: 'rgba(0,190,255,0.15)' }}
            >
              <ScanBarcode size={14} className="text-[#00BEFF] flex-shrink-0" />
              <div>
                <p className="text-xs font-black text-[#00BEFF]">ALREADY SUBSCRIBED?</p>
                <Link
                  href="/nutrition"
                  className="text-[10px] text-text-muted normal-case underline-offset-2 underline"
                >
                  Open the Nutrition tab to scan barcodes →
                </Link>
              </div>
            </div>
          </>
        )}

        {activeTab === 'apparel' && (
          <>
            <p className="text-xs text-text-muted normal-case text-center">
              Performance apparel for athletes who demand more.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {APPAREL.map(item => (
                <a
                  key={item.id}
                  href="https://www.bullfit.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-border p-4"
                  style={{ background: 'var(--color-surface)' }}
                >
                  <span className="text-[9px] font-black tracking-widest text-text-muted">{item.category.toUpperCase()}</span>
                  <h4 className="text-sm font-black text-text-primary mt-1 mb-2 leading-tight">{item.name.toUpperCase()}</h4>
                  <span className="text-base font-black text-text-primary">${item.price}</span>
                </a>
              ))}
            </div>
            <a
              href="https://www.bullfit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 h-12 rounded-2xl text-sm font-black text-white"
              style={{ background: BULL_G }}
            >
              SHOP ALL APPAREL <ExternalLink size={14} />
            </a>
          </>
        )}

      </div>
    </div>
  )
}
