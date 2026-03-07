'use client'

import { createClient } from '@/lib/supabase/client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatMessage } from '@/types'

interface UseRealtimeChatReturn {
  messages: ChatMessage[]
  sendMessage: (content: string) => Promise<void>
  loading: boolean
}

export function useRealtimeChat(roomId: string): UseRealtimeChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  // Keep a stable ref to the supabase client so we don't recreate subscriptions
  const supabaseRef = useRef(createClient())

  // Load the last 50 messages on mount / when roomId changes
  useEffect(() => {
    if (!roomId) return

    const supabase = supabaseRef.current
    setLoading(true)

    async function loadMessages() {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*, sender:users(*)')
        .eq('chat_room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(50)

      if (error) {
        console.error('[useRealtimeChat] Failed to load messages:', error.message)
      } else {
        setMessages((data as ChatMessage[]) ?? [])
      }

      setLoading(false)
    }

    loadMessages()

    // Subscribe to new INSERT events for this room
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${roomId}`,
        },
        async (payload) => {
          // The realtime payload won't include the joined sender, so we fetch it
          const newMessage = payload.new as ChatMessage

          const { data: withSender } = await supabase
            .from('chat_messages')
            .select('*, sender:users(*)')
            .eq('id', newMessage.id)
            .single()

          if (withSender) {
            setMessages((prev) => {
              // Avoid duplicates if optimistic update was already added
              const exists = prev.some((m) => m.id === withSender.id)
              if (exists) {
                return prev.map((m) => (m.id === withSender.id ? (withSender as ChatMessage) : m))
              }
              return [...prev, withSender as ChatMessage]
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId])

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed) return

      const supabase = supabaseRef.current

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        console.error('[useRealtimeChat] No authenticated user found.')
        return
      }

      const { error } = await supabase.from('chat_messages').insert({
        chat_room_id: roomId,
        sender_id: authUser.id,
        content: trimmed,
      })

      if (error) {
        console.error('[useRealtimeChat] Failed to send message:', error.message)
      }
    },
    [roomId]
  )

  return { messages, sendMessage, loading }
}
