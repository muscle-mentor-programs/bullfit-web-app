'use client'

import { SwipeableTabs, useSwipeNav } from '@/components/ui/SwipeableTabs'

export function ClientShell({ children }: { children: React.ReactNode }) {
  useSwipeNav()
  return <SwipeableTabs>{children}</SwipeableTabs>
}
