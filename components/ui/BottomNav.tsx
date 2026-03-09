'use client'

import { cn } from '@/lib/utils/cn'
import { Home, ShoppingBag, UtensilsCrossed, Trophy, UserCircle2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavTab {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

// Left: Shop | Nutrition    Center: Home    Right: Programs | Profile
const LEFT_TABS: NavTab[] = [
  { href: '/shop',      label: 'Shop',      icon: ShoppingBag },
  { href: '/nutrition', label: 'Nutrition', icon: UtensilsCrossed },
]
const RIGHT_TABS: NavTab[] = [
  { href: '/programs',  label: 'Programs',  icon: Trophy },
  { href: '/settings',  label: 'Profile',   icon: UserCircle2 },
]

const BULL_G = 'linear-gradient(135deg, #00BEFF 0%, #CF00FF 60%, #FF0087 100%)'

function SideTab({ href, label, icon: Icon, active }: NavTab & { active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'relative flex flex-1 flex-col items-center justify-center gap-1',
        'py-2 min-h-[56px]',
        'transition-colors duration-150',
        'focus-visible:outline-none',
        active ? 'text-[#00BEFF]' : 'text-white/40',
      )}
      aria-current={active ? 'page' : undefined}
      aria-label={label}
    >
      {/* Gradient top indicator */}
      <span
        className={cn(
          'absolute top-0 left-1/2 -translate-x-1/2 h-[3px] rounded-b-full',
          'transition-all duration-300 ease-[0.4,0,0.2,1]',
          active ? 'w-6 opacity-100' : 'w-0 opacity-0',
        )}
        style={{ background: 'linear-gradient(90deg, #00BEFF, #CF00FF, #FF0087)' }}
      />
      <span className={cn('transition-transform duration-200', active ? 'scale-110' : 'scale-100')}>
        <Icon size={20} />
      </span>
      <span className={cn('text-[10px] leading-none transition-all duration-200', active ? 'font-black' : 'font-medium')}>
        {label}
      </span>
    </Link>
  )
}

function BottomNav() {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
  const homeActive = isActive('/dashboard')

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'overflow-visible',
      )}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: '#111111',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
      aria-label="Main navigation"
    >
      <div
        className="flex items-stretch relative"
        style={{
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
      >
        {/* Left tabs: Shop + Nutrition */}
        {LEFT_TABS.map((tab) => (
          <SideTab key={tab.href} {...tab} active={isActive(tab.href)} />
        ))}

        {/* Center: Home — BULLFIT bull gradient button */}
        <Link
          href="/dashboard"
          aria-label="Home"
          aria-current={homeActive ? 'page' : undefined}
          className={cn(
            'relative flex flex-1 flex-col items-center justify-center',
            'min-h-[56px] focus-visible:outline-none',
          )}
        >
          <span
            className={cn(
              'absolute left-1/2 -translate-x-1/2 -top-9',
              'w-[74px] h-[74px] rounded-3xl',
              'flex flex-col items-center justify-center gap-1.5',
              'border border-white/10',
              'transition-transform duration-200 ease-[0.4,0,0.2,1]',
              homeActive ? 'scale-105' : 'scale-100',
            )}
            style={{
              background: BULL_G,
              boxShadow: homeActive
                ? '0 0 24px rgba(0,190,255,0.55), 0 0 16px rgba(207,0,255,0.35), 0 0 12px rgba(255,0,135,0.25)'
                : '0 4px 20px rgba(0,0,0,0.70)',
            }}
          >
            {/* Bull icon — stylized B */}
            <span className="text-[22px] font-black text-white leading-none tracking-tight"
              style={{ fontFamily: 'var(--font-condensed)' }}>B</span>
            <span className="text-[8px] font-black text-white/80 leading-none tracking-widest">HOME</span>
          </span>
        </Link>

        {/* Right tabs: Programs + Profile */}
        {RIGHT_TABS.map((tab) => (
          <SideTab key={tab.href} {...tab} active={isActive(tab.href)} />
        ))}
      </div>
    </nav>
  )
}

export { BottomNav }
