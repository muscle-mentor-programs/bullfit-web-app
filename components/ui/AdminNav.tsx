'use client'

import { cn } from '@/lib/utils/cn'
import {
  BarChart2,
  Dumbbell,
  Layers,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLink {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const NAV_LINKS: NavLink[] = [
  { href: '/admin/dashboard',        label: 'Home',      icon: BarChart2   },
  { href: '/admin/programs',         label: 'Programs',  icon: Layers      },
  { href: '/admin/users',            label: 'Users',     icon: Users       },
  { href: '/admin/exercises',        label: 'Exercises', icon: Dumbbell    },
  { href: '/admin/food-corrections', label: 'Food QA',   icon: ShieldCheck },
  { href: '/admin/settings',         label: 'Settings',  icon: Settings    },
]

// ── Desktop sidebar nav item ──────────────────────────────────────────────────
function SidebarNavItem({ link, isActive }: { link: NavLink; isActive: boolean }) {
  const { href, label, icon: Icon } = link
  return (
    <Link
      href={href}
      className={cn(
        'relative flex items-center gap-3 px-3 py-2.5 rounded-xl overflow-hidden',
        'text-sm font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        isActive
          ? 'text-white shadow-primary'
          : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary hover:shadow-sm',
      )}
      style={isActive ? { background: BULL_G } : {}}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon
        size={18}
        className={cn('transition-transform duration-200 flex-shrink-0', isActive ? 'scale-110' : 'scale-100')}
      />
      <span>{label}</span>
    </Link>
  )
}

const BULL_G = '#00BEFF'

// ── Brand ─────────────────────────────────────────────────────────────────────
function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 mb-6">
      <div
        className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
        style={{ background: BULL_G }}
      >
        <span className="text-black font-black text-base leading-none">B</span>
      </div>
      <span
        className="text-base font-black"
        style={{
          background: BULL_G,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >BULLFIT</span>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
function AdminNav() {
  const pathname = usePathname()
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside
        className={cn(
          'hidden md:flex flex-col',
          'fixed left-0 top-0 bottom-0 w-60 z-40',
          'border-r border-border',
          'px-3 py-6 shadow-md',
        )}
        style={{ background: 'linear-gradient(to bottom, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
        aria-label="Admin navigation"
      >
        <Brand />
        <nav className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <SidebarNavItem key={link.href} link={link} isActive={isActive(link.href)} />
          ))}
        </nav>
      </aside>

      {/* ── Mobile bottom tab bar ────────────────────────────────────────── */}
      <nav
        className={cn(
          'md:hidden fixed bottom-0 left-0 right-0 z-50',
          'border-t border-border shadow-lg',
        )}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          background: 'linear-gradient(to top, var(--color-surface), var(--color-surface-3, var(--color-surface)))',
        }}
        aria-label="Admin navigation"
      >
        <div
          className="flex items-stretch"
          style={{
            paddingLeft: 'env(safe-area-inset-left)',
            paddingRight: 'env(safe-area-inset-right)',
          }}
        >
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative flex flex-1 flex-col items-center justify-center gap-0.5',
                  'py-2 min-h-[52px]',
                  'transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50',
                  active ? 'text-primary' : 'text-text-muted',
                )}
                aria-current={active ? 'page' : undefined}
                aria-label={label}
              >
                {/* Gradient top indicator */}
                <span
                  className={cn(
                    'absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-b-full',
                    'transition-all duration-300 ease-[0.4,0,0.2,1]',
                    active ? 'w-6 opacity-100' : 'w-0 opacity-0',
                  )}
                  style={{ background: BULL_G }}
                />

                {/* Icon */}
                <span
                  className={cn(
                    'transition-transform duration-200 ease-[0.4,0,0.2,1]',
                    active ? 'scale-110' : 'scale-100',
                  )}
                >
                  <Icon size={18} />
                </span>

                {/* Label */}
                <span className={cn('text-[9px] leading-none', active ? 'font-bold' : 'font-medium')}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

export { AdminNav }
