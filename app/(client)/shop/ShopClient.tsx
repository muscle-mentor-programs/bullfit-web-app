'use client'

import { cn } from '@/lib/utils/cn'
import { ExternalLink, ShoppingCart, Star, Zap, Tag, Package } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const BULL_G = '#00BEFF'
const GOLD_G = 'linear-gradient(135deg, #FFC00E 0%, #FFD600 100%)'

// ─── Product Data (bullfit.com placeholders) ────────────────────────────────

const SUPPLEMENTS = [
  {
    id: 'bodacious-pre',
    name: 'Bodacious Pre-Workout',
    tagline: 'HIGH-STIM FORMULA',
    description: '250mg caffeine + 5g creatine. Pharmacist formulated. Zero sucralose.',
    price: 49.99,
    salePrice: null,
    badge: 'BEST SELLER',
    badgeColor: '#FF0087',
    accentColor: '#00BEFF',
    category: 'Pre-Workout',
    flavors: ['Watermelon Rush', 'Blue Razz', 'Strawberry Mango'],
  },
  {
    id: 'cowabunga-pre',
    name: 'Cowabunga Pre-Workout',
    tagline: 'DAILY DRIVER',
    description: '150mg caffeine + 1g creatine. Perfect for everyday training.',
    price: 44.99,
    salePrice: null,
    badge: null,
    badgeColor: '#CF00FF',
    accentColor: '#CF00FF',
    category: 'Pre-Workout',
    flavors: ['Sour Gummy', 'Tropical Punch', 'Grape Crush'],
  },
  {
    id: 'decalf-nonstim',
    name: 'De-Calf Non-Stim',
    tagline: 'ZERO CAFFEINE',
    description: '10g L-Citrulline + 5g creatine. Maximum pump, zero stimulants.',
    price: 44.99,
    salePrice: null,
    badge: null,
    badgeColor: '#00BEFF',
    accentColor: '#22C55E',
    category: 'Pre-Workout',
    flavors: ['Peach Rings', 'Lemon Ice', 'Cherry Bomb'],
  },
  {
    id: 'bullfit-hydrate',
    name: 'BULLFIT Hydrate',
    tagline: 'ELECTROLYTE FORMULA',
    description: 'Himalayan salt, magnesium & potassium. Train harder, recover faster.',
    price: 34.99,
    salePrice: null,
    badge: 'NEW',
    badgeColor: '#FFD600',
    accentColor: '#44AADF',
    category: 'Hydration',
    flavors: ['Citrus Burst', 'Berry Wave', 'Pineapple Coconut'],
  },
  {
    id: 'creatine-mono',
    name: 'Creatine Monohydrate',
    tagline: 'PURE FORMULA',
    description: '5g micronized creatine per serving. Unflavored. Zero fillers.',
    price: 29.99,
    salePrice: 24.99,
    badge: 'BACK IN STOCK',
    badgeColor: '#22C55E',
    accentColor: '#CF00FF',
    category: 'Performance',
    flavors: ['Unflavored'],
  },
]

const SUPPSCRIPTIONS = [
  {
    id: 'supp-pre',
    name: 'Pre-Workout SuppScription',
    description: 'Never run out. Monthly delivery of your favorite pre-workout.',
    price: 39.99,
    savings: 'SAVE 20%',
    perks: ['Free shipping', 'Barcode scanner unlock', 'Priority access to new flavors'],
  },
  {
    id: 'supp-stack',
    name: 'Full Stack SuppScription',
    description: 'Pre-workout + creatine + hydration pack. The complete setup.',
    price: 89.99,
    savings: 'SAVE 25%',
    perks: ['Free shipping', 'Barcode scanner unlock', 'Exclusive member pricing', 'Free shaker bottle'],
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
      href="https://www.bullfit.com"
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl border border-border overflow-hidden"
      style={{ background: 'var(--color-surface)' }}
    >
      {/* Color accent top bar */}
      <div className="h-1 w-full" style={{ backgroundColor: product.accentColor }} />

      <div className="p-4">
        {/* Badge + Category */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black tracking-widest"
            style={{ color: product.accentColor }}>{product.category.toUpperCase()}</span>
          {product.badge && (
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest text-black"
              style={{ backgroundColor: product.badgeColor }}
            >
              {product.badge}
            </span>
          )}
        </div>

        {/* Product name + tagline */}
        <h3 className="text-base font-black text-text-primary leading-tight mb-0.5">{product.name.toUpperCase()}</h3>
        <p className="text-[10px] font-black tracking-widest mb-2" style={{ color: product.accentColor }}>{product.tagline}</p>
        <p className="text-xs text-text-muted mb-3 leading-relaxed normal-case">{product.description}</p>

        {/* Flavors */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.flavors.map(f => (
            <span key={f} className="text-[9px] px-2 py-0.5 rounded-full border border-border text-text-muted normal-case">
              {f}
            </span>
          ))}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            {product.salePrice ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-text-primary">${product.salePrice}</span>
                <span className="text-xs text-text-muted line-through">${product.price}</span>
              </div>
            ) : (
              <span className="text-lg font-black text-text-primary">${product.price}</span>
            )}
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black text-white"
            style={{ background: BULL_G }}
          >
            <ShoppingCart size={12} />
            <span>SHOP</span>
          </div>
        </div>
      </div>
    </a>
  )
}

function SuppScriptionCard({ sub }: { sub: typeof SUPPSCRIPTIONS[0] }) {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background: 'var(--color-surface)',
        borderColor: '#CF00FF44',
      }}
    >
      <div className="h-1 w-full" style={{ background: BULL_G }} />
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black tracking-widest text-[#CF00FF]">SUPPSCRIPTION™</span>
          <span
            className="px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest"
            style={{ background: GOLD_G, color: '#000' }}
          >
            {sub.savings}
          </span>
        </div>
        <h3 className="text-base font-black text-text-primary mb-1">{sub.name.toUpperCase()}</h3>
        <p className="text-xs text-text-muted mb-3 normal-case leading-relaxed">{sub.description}</p>
        <ul className="mb-4 space-y-1">
          {sub.perks.map(p => (
            <li key={p} className="flex items-center gap-2 text-xs text-text-secondary normal-case">
              <Star size={10} className="text-[#FFD600] flex-shrink-0" fill="#FFD600" />
              {p}
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-black text-text-primary">${sub.price}</span>
            <span className="text-xs text-text-muted ml-1">/mo</span>
          </div>
          <a
            href="https://www.bullfit.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl text-xs font-black text-black flex items-center gap-1.5"
            style={{ background: BULL_G }}
          >
            SUBSCRIBE
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Main ShopClient ──────────────────────────────────────────────────────────

type ShopTab = 'supplements' | 'suppscriptions' | 'apparel'

export function ShopClient({ hasSuppScription }: { hasSuppScription: boolean }) {
  const [activeTab, setActiveTab] = useState<ShopTab>('supplements')

  const TABS: { id: ShopTab; label: string; icon: React.ElementType }[] = [
    { id: 'supplements',   label: 'Supps',      icon: Zap },
    { id: 'suppscriptions',label: 'Subscribe',  icon: Star },
    { id: 'apparel',       label: 'Apparel',    icon: Package },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background pb-6 animate-fade-in">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="px-4 pt-12 pb-4">
        <div
          className="rounded-2xl overflow-hidden shadow-xl border border-white/10"
          style={{ background: 'var(--color-surface)' }}
        >
          <div className="h-1 w-full" style={{ background: BULL_G }} />
          <div className="px-5 py-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black tracking-widest text-text-muted">BULLFIT</p>
              <h1 className="text-3xl font-black tracking-tight text-text-primary">SHOP</h1>
              <p className="text-xs text-text-muted normal-case mt-0.5">Pharmacist-formulated. Third-party tested.</p>
            </div>
            <a
              href="https://www.bullfit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-black text-[#00BEFF]"
            >
              Full Site <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* ── Promo Banner ─────────────────────────────────────────────────── */}
      <div className="mx-4 mb-4 rounded-xl overflow-hidden">
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
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'var(--color-surface)' }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
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
      <div className="flex flex-col gap-4 px-4">

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
            <div className="text-center py-2">
              <h2 className="text-xl font-black bull-gradient-text">SUPPSCRIPTIONS™</h2>
              <p className="text-xs text-text-muted normal-case mt-1">Subscribe & Save — never run out of your favorites</p>
            </div>
            {SUPPSCRIPTIONS.map(sub => (
              <SuppScriptionCard key={sub.id} sub={sub} />
            ))}
            <div
              className="rounded-2xl p-4 border border-[#FFD60033] text-center"
              style={{ background: 'var(--color-surface)' }}
            >
              <p className="text-xs font-black tracking-widest text-[#FFD600] mb-1">SUPPSCRIPTION PERKS</p>
              <p className="text-[10px] text-text-muted normal-case mb-3">All SuppScription plans unlock the barcode scanner in the Nutrition tab</p>
              <Link
                href="/nutrition"
                className="inline-flex items-center gap-1.5 text-xs font-black text-[#00BEFF]"
              >
                Go to Nutrition tracker →
              </Link>
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
