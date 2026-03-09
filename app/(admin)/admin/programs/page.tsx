import { AdminProgramsClient } from './AdminProgramsClient'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils/cn'
import { Layers, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function AdminProgramsPage() {
  const supabase = await createClient()

  const { data: programs } = await supabase
    .from('programs')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl overflow-hidden border border-primary/20 shadow-md relative" style={{ background: '#00BEFF' }}>
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)' }} />
        <div className="flex items-center justify-between px-6 py-5 relative">
          <div>
            <h1 className="text-xl font-black text-white">Programs</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {programs?.length ?? 0} program{programs?.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <Link
            href="/admin/programs/new"
            className={cn(
              'inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-black',
              'transition-all hover:shadow-md active:scale-[0.98]',
            )}
            style={{ background: 'rgba(255,255,255,0.20)', color: 'white', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.30)' }}
          >
            <Plus size={15} />
            New Program
          </Link>
        </div>
      </div>

      {/* Programs Grid */}
      {programs && programs.length > 0 ? (
        <AdminProgramsClient programs={programs} />
      ) : (
        <div
          className="flex flex-col items-center justify-center py-24 rounded-2xl border border-border text-center shadow-md"
          style={{ background: 'linear-gradient(135deg, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-md"
            style={{ background: 'linear-gradient(135deg, var(--color-surface-2), var(--color-background))' }}
          >
            <Layers size={28} className="text-text-muted" />
          </div>
          <h2 className="text-base font-black text-text-primary mb-1">No programs yet</h2>
          <p className="text-sm text-text-muted mb-6 max-w-xs">
            Create your first training program and publish it to the marketplace.
          </p>
          <Link
            href="/admin/programs/new"
            className={cn(
              'inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-black',
              'text-white shadow-primary transition-all hover:shadow-md active:scale-[0.98]',
            )}
            style={{ background: '#00BEFF' }}
          >
            <Plus size={15} />
            Create Program
          </Link>
        </div>
      )}
    </div>
  )
}
