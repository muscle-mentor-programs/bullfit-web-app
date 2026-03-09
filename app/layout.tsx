import { ThemeProvider } from '@/lib/context/ThemeContext'
import type { Metadata, Viewport } from 'next'
import { Barlow, Barlow_Condensed } from 'next/font/google'
import './globals.css'

const barlow = Barlow({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  variable: '--font-condensed',
  weight: ['500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'BULLFIT',
  description: 'Pharmacist-formulated supplements, elite programs & nutrition tracking.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BULLFIT',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#F5F5F3',
  viewportFit: 'cover',
}

// BULLFIT is always dark — set data-theme="dark" before first paint
const themeScript = `
try {
  document.documentElement.setAttribute('data-theme', 'dark');
} catch(e) {}
`.trim()

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${barlow.variable} ${barlowCondensed.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
