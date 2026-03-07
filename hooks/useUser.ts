'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@/types'

interface UseUserReturn {
  user: User | null
  loading: boolean
  isAdmin: boolean
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchFullUser(authUserId: string): Promise<User | null> {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUserId)
        .single()

      if (error) {
        console.error('[useUser] Failed to fetch user record:', error.message)
        return null
      }

      return data as User
    }

    // Initial load: check current session
    supabase.auth.getUser().then(async ({ data: { user: authUser } }) => {
      if (authUser) {
        const fullUser = await fetchFullUser(authUser.id)
        setUser(fullUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const fullUser = await fetchFullUser(session.user.id)
        setUser(fullUser)
      } else {
        setUser(null)
      }

      // Only flip loading off after the first event if it's still true
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    user,
    loading,
    isAdmin: user?.role === 'admin',
  }
}
