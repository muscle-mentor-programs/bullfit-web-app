import { BottomNav } from '@/components/ui/BottomNav'
import { ClientShell } from './ClientShell'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main
        className="flex-1 w-full max-w-2xl mx-auto overflow-hidden"
        style={{ paddingBottom: 'calc(3.5rem + env(safe-area-inset-bottom))' }}
      >
        <ClientShell>{children}</ClientShell>
      </main>
      <BottomNav />
    </div>
  )
}
