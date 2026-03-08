'use client'

import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { cn } from '@/lib/utils/cn'
import type { Program } from '@/types'
import { Clock, Dumbbell, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

function ProgramCard({ program, onDelete }: { program: Program; onDelete: (id: string) => Promise<void> }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    setDeleting(true)
    setError('')
    try {
      await onDelete(program.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
      setDeleting(false)
    }
  }

  return (
    <>
      <div
        className="rounded-2xl border border-border overflow-hidden flex flex-col shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
        style={{ background: 'linear-gradient(to bottom, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
      >
        {/* Cover Image */}
        <div className="relative aspect-video bg-surface-2 flex-shrink-0">
          {program.cover_image_url ? (
            <img src={program.cover_image_url} alt={program.title} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--color-surface-2), var(--color-background))' }}
            >
              <Dumbbell size={32} className="text-text-muted/40" />
            </div>
          )}
          {/* Status badge */}
          <div className="absolute top-3 right-3">
            <span
              className={cn(
                'text-xs font-black px-2.5 py-1 rounded-full shadow-sm',
                program.is_published ? 'text-white' : 'bg-black/50 text-white',
              )}
              style={program.is_published ? { background: 'linear-gradient(135deg, #34d399, var(--color-success))' } : {}}
            >
              {program.is_published ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-3 flex-1">
          <div className="flex-1">
            <h3 className="text-sm font-black text-text-primary line-clamp-1">{program.title}</h3>
            <p className="text-xs text-text-muted mt-1 line-clamp-2">{program.description}</p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <Clock size={12} />
            {program.duration_weeks} weeks
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <div className="flex items-center gap-2">
            <Link
              href={`/admin/programs/${program.id}`}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-black',
                'text-white shadow-sm transition-all hover:shadow-md active:scale-[0.97]',
              )}
              style={{ background: 'linear-gradient(135deg, #00BEFF 0%, #CF00FF 50%, #FF0087 100%)' }}
            >
              <Edit size={12} />
              Edit
            </Link>
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={deleting}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-error/30 text-error hover:bg-error/10 transition-colors disabled:opacity-40 flex-shrink-0"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Program"
        message={`Permanently delete "${program.title}"? This will remove all weeks, sessions, and exercises. This cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </>
  )
}

export function AdminProgramsClient({ programs }: { programs: Program[] }) {
  const router = useRouter()
  const [list, setList] = useState(programs)

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/programs/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Delete failed')
    setList((prev) => prev.filter((p) => p.id !== id))
    router.refresh()
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {list.map((program) => (
        <ProgramCard key={program.id} program={program} onDelete={handleDelete} />
      ))}
    </div>
  )
}
