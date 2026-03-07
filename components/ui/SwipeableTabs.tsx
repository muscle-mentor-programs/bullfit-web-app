'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

// Visual order: Train | Library | Home (center) | Nutrition | Profile
const TAB_ORDER = ['/sessions', '/library', '/dashboard', '/nutrition', '/settings']

function getTabIndex(pathname: string): number {
  const idx = TAB_ORDER.findIndex(
    (tab) => pathname === tab || pathname.startsWith(`${tab}/`),
  )
  return idx === -1 ? 0 : idx
}

function pathDepth(p: string): number {
  return p.split('/').filter(Boolean).length
}

/**
 * Determine the slide direction between two paths.
 *
 * - Cross-tab navigation: use the difference in tab position
 *   (positive = moving right in the nav bar → new page enters from right)
 * - Same-tab navigation: use path depth
 *   (deeper path = drill-down → +1 enters from right,
 *    shallower = back → -1 enters from left)
 */
function getDirection(prevPath: string, currPath: string): number {
  const prevIdx = getTabIndex(prevPath)
  const currIdx = getTabIndex(currPath)
  if (prevIdx !== currIdx) return currIdx - prevIdx
  // Within the same tab hierarchy — depth determines direction
  const delta = pathDepth(currPath) - pathDepth(prevPath)
  return delta >= 0 ? 1 : -1
}

const variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
}

const transition = {
  duration: 0.28,
  ease: [0.4, 0, 0.2, 1] as const,
}

interface SwipeableTabsProps {
  children: React.ReactNode
}

function SwipeableTabs({ children }: SwipeableTabsProps) {
  const pathname = usePathname()
  const prevPathRef = useRef(pathname)

  const direction = getDirection(prevPathRef.current, pathname)

  useEffect(() => {
    prevPathRef.current = pathname
  }, [pathname])

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
          className="w-full h-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ── useSwipeNav hook ──────────────────────────────────────────────────────────
//
// Only active on root-level tab pages to avoid conflicting with sub-page
// scroll containers and the active session's own swipe handler.

const SWIPE_THRESHOLD = 50 // px horizontal movement to trigger navigation
const SWIPE_MAX_VERTICAL = 80 // px — abort if too much vertical movement

interface PointerState {
  startX: number
  startY: number
  startTime: number
  active: boolean
}

function useSwipeNav() {
  const router = useRouter()
  const pathname = usePathname()
  const pointerRef = useRef<PointerState | null>(null)

  useEffect(() => {
    // Only enable tab-swipe on root tab pages — prevents conflicts with
    // sub-page scroll containers and the active session's own swipe handler.
    const isRootTab = TAB_ORDER.includes(pathname)
    if (!isRootTab) return

    function onPointerDown(e: PointerEvent) {
      // Only track single-finger touch or primary mouse button
      if (e.pointerType === 'mouse' && e.button !== 0) return
      pointerRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startTime: Date.now(),
        active: true,
      }
    }

    function onPointerUp(e: PointerEvent) {
      const state = pointerRef.current
      if (!state || !state.active) return
      pointerRef.current = null

      const dx = e.clientX - state.startX
      const dy = e.clientY - state.startY
      const elapsed = Date.now() - state.startTime

      // Ignore slow swipes and vertical scrolls
      if (Math.abs(dy) > SWIPE_MAX_VERTICAL) return
      if (elapsed > 600) return
      if (Math.abs(dx) < SWIPE_THRESHOLD) return

      const currentIdx = getTabIndex(pathname)

      if (dx < 0) {
        // Swiped left → go to next tab (rightward in nav)
        const nextIdx = Math.min(currentIdx + 1, TAB_ORDER.length - 1)
        if (nextIdx !== currentIdx) router.push(TAB_ORDER[nextIdx])
      } else {
        // Swiped right → go to previous tab (leftward in nav)
        const prevIdx = Math.max(currentIdx - 1, 0)
        if (prevIdx !== currentIdx) router.push(TAB_ORDER[prevIdx])
      }
    }

    function onPointerCancel() {
      pointerRef.current = null
    }

    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('pointerup', onPointerUp, { passive: true })
    window.addEventListener('pointercancel', onPointerCancel, { passive: true })

    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerCancel)
    }
  }, [pathname, router])
}

export { SwipeableTabs, useSwipeNav, TAB_ORDER, getTabIndex }
