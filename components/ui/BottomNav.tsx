'use client'

import { cn } from '@/lib/utils/cn'
import { Home, ShoppingBag, Trophy, User, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface TabDef {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

// 5 flat tabs — left to right
const TABS: TabDef[] = [
  { href: '/dashboard',  label: 'Home',     icon: Home },
  { href: '/shop',       label: 'Shop',     icon: ShoppingBag },
  { href: '/programs',   label: 'Programs', icon: Trophy },
  { href: '/nutrition',  label: 'Profile',  icon: User },
  { href: '/settings',   label: 'Settings', icon: Settings },
]

function Tab({ href, label, icon: Icon, active }: TabDef & { active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'relative flex flex-1 flex-col items-center justify-center gap-[3px]',
        'py-2 min-h-[56px]',
        'focus-visible:outline-none',
        active ? 'text-[#00BEFF]' : 'text-[#AAAAAA]',
      )}
      aria-current={active ? 'page' : undefined}
      aria-label={label}
    >
      {/* Active indicator — top gradient bar */}
      <span
        className={cn(
          'absolute top-0 left-1/2 -translate-x-1/2 h-[3px] rounded-b-full',
          'transition-all duration-300',
          active ? 'w-8 opacity-100' : 'w-0 opacity-0',
        )}
        style={{ background: 'linear-gradient(90deg, #00BEFF, #CF00FF, #FF0087)' }}
      />
      <span className={cn('transition-transform duration-200', active ? 'scale-110' : 'scale-100')}>
        <Icon size={21} />
      </span>
      <span className={cn('text-[9px] leading-none tracking-wide', active ? 'font-black' : 'font-medium')}>
        {label}
      </span>
    </Link>
  )
}

function BottomNav() {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: '#FFFFFF',
        boxShadow: '0 -1px 0 rgba(0,0,0,0.08), 0 -4px 24px rgba(0,0,0,0.10)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      aria-label="Main navigation"
    >
      <div
        className="flex items-stretch"
        style={{
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.href} {...tab} active={isActive(tab.href)} />
        ))}
      </div>
    </nav>
  )
}

export { BottomNav }
