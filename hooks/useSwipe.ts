'use client'

import { useEffect, useRef } from 'react'

const MIN_SWIPE_DISTANCE = 60
const MAX_VERTICAL_DEVIATION = 100

interface UseSwipeOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

export function useSwipe(
  elementRef: React.RefObject<HTMLElement | null>,
  { onSwipeLeft, onSwipeRight }: UseSwipeOptions
): void {
  // Store touch start coords in refs so the handlers never go stale
  const startX = useRef<number | null>(null)
  const startY = useRef<number | null>(null)

  useEffect(() => {
    const el = elementRef.current
    if (!el) return

    function onTouchStart(e: TouchEvent) {
      const touch = e.touches[0]
      startX.current = touch.clientX
      startY.current = touch.clientY
    }

    function onTouchEnd(e: TouchEvent) {
      if (startX.current === null || startY.current === null) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - startX.current
      const deltaY = touch.clientY - startY.current

      startX.current = null
      startY.current = null

      // Ignore swipes with too much vertical deviation (likely a scroll)
      if (Math.abs(deltaY) > MAX_VERTICAL_DEVIATION) return

      if (deltaX < -MIN_SWIPE_DISTANCE) {
        onSwipeLeft?.()
      } else if (deltaX > MIN_SWIPE_DISTANCE) {
        onSwipeRight?.()
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
    }
  // Re-attach listeners if the callbacks change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementRef, onSwipeLeft, onSwipeRight])
}
