'use client'

import { cn } from '@/lib/utils/cn'
import { ArrowDownUp, ChevronRight, Star, User } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export interface UserRow {
  id: string
  name: string | null
  email: string
  avatar_url: string | null
  role: string
  created_at: string
  subscriptions: { status: string }[]
}

type SortMode = 'newest' | 'subscribers_first'

function isSubscriber(user: UserRow): boolean {
  const status = user.subscriptions?.[0]?.status
  return status === 'active' || status === 'trialing'
}

export function UsersClient({ users }: { users: UserRow[] }) {
  const [sort, setSort] = useState<SortMode>('subscribers_first')

  const sorted = [...users].sort((a, b) => {
    if (sort === 'subscribers_first') {
      const aS = isSubscriber(a) ? 1 : 0
      const bS = isSubscriber(b) ? 1 : 0
      if (bS !== aS) return bS - aS // subscribers first
    }
    // fallback: newest first
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="space-y-3">
      {/* Sort control */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => setSort(sort === 'newest' ? 'subscribers_first' : 'newest')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black tracking-wider transition-all',
            sort === 'subscribers_first'
              ? 'border-primary/30 text-primary bg-primary/8'
              : 'border-border text-text-muted hover:text-text-primary hover:border-border',
          )}
          style={sort === 'subscribers_first' ? { background: 'var(--color-primary, #6366f1)10' } : {}}
        >
          <ArrowDownUp size={12} />
          {sort === 'subscribers_first' ? 'SUBSCRIBERS FIRST' : 'NEWEST FIRST'}
        </button>
      </div>

      {/* List */}
      <div
        className="rounded-2xl border border-border overflow-hidden divide-y divide-border shadow-md"
        style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
      >
        {sorted.map((u) => {
          const subscribed = isSubscriber(u)
          const initials = (u.name ?? u.email)[0]?.toUpperCase() ?? '?'
          return (
            <Link
              key={u.id}
              href={`/admin/users/${u.id}`}
              className="block p-4 hover:bg-surface-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-xl border border-border flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #00BEFF 0%, #CF00FF 50%, #FF0087 100%)' }}
                >
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt={u.name ?? u.email} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-black text-white">{initials}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-text-primary truncate">
                      {u.name || 'No name'}
                    </p>
                    {subscribed && (
                      <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border bg-success/10 text-success border-success/20 flex-shrink-0">
                        <Star size={9} />
                        SUB
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted truncate">{u.email}</p>
                  <p className="text-[10px] text-text-muted/60 mt-0.5">
                    Joined{' '}
                    {new Date(u.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <ChevronRight size={15} className="text-text-muted flex-shrink-0" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
