'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

// Admin route order (matches AdminNav tab order)
const ADMIN_TABS = [
  '/admin/dashboard',
  '/admin/programs',
  '/admin/users',
  '/admin/exercises',
  '/admin/food-corrections',
  '/admin/settings',
]

function getAdminTabIndex(pathname: string): number {
  const idx = ADMIN_TABS.findIndex(
    (tab) => pathname === tab || pathname.startsWith(`${tab}/`),
  )
  return idx === -1 ? 0 : idx
}

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? '100%' : '-100%', opacity: 0 }),
}

const transition = { duration: 0.26, ease: [0.4, 0, 0.2, 1] as const }

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const currentIndex = getAdminTabIndex(pathname)
  const prevIndexRef = useRef(currentIndex)
  const direction = currentIndex - prevIndexRef.current

  useEffect(() => {
    prevIndexRef.current = currentIndex
  }, [currentIndex])

  return (
    <div className="relative overflow-hidden w-full h-full">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={pathname}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
