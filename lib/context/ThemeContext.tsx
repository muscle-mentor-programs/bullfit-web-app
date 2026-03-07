'use client'

import { createContext, useContext } from 'react'

// BULLFIT is always dark — no theme toggle.
// ThemeContext is kept as a thin stub so existing imports don't break.

export type Theme = 'dark'
export type AccentColor = 'bullfit'

interface ThemeContextType {
  theme: Theme
  setTheme: (t: Theme) => void
  toggleTheme: () => void
  accent: AccentColor
  setAccent: (a: AccentColor) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
  accent: 'bullfit',
  setAccent: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={{
      theme: 'dark',
      setTheme: () => {},
      toggleTheme: () => {},
      accent: 'bullfit',
      setAccent: () => {},
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
