'use client'

import { useRealtimeChat } from '@/hooks/useRealtimeChat'
import { cn } from '@/lib/utils/cn'
import type { ChatRoom } from '@/types'
import { ArrowLeft, Send, Users, MessageSquare, Shield } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'

const ROOM_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  group: Users,
  direct: MessageSquare,
  admin_direct: Shield,
}

interface ChatClientProps {
  rooms: ChatRoom[]
  userId: string
}

function RoomIcon({ type }: { type: string }) {
  const Icon = ROOM_ICONS[type] ?? MessageSquare
  return <Icon size={18} />
}

function ChatRoom({ roomId, roomName, userId, onBack }: { roomId: string; roomName: string; userId: string; onBack: () => void }) {
  const { messages, sendMessage, loading } = useRealtimeChat(roomId)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!input.trim()) return
    const text = input.trim()
    setInput('')
    await sendMessage(text)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-surface">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-8 h-8 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="font-semibold text-text-primary text-base truncate">{roomName}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center pt-8">
            <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-text-muted">No messages yet. Start the conversation.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === userId
            return (
              <div key={msg.id} className={cn('flex flex-col gap-1', isOwn ? 'items-end' : 'items-start')}>
                {!isOwn && (
                  <p className="text-[11px] font-medium text-text-muted px-1">
                    {msg.sender?.name ?? 'Unknown'}
                  </p>
                )}
                <div
                  className={cn(
                    'max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                    isOwn
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-surface border border-border text-text-primary rounded-bl-md',
                  )}
                >
                  {msg.content}
                </div>
                <p className="text-[10px] text-text-muted px-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-surface pb-safe">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            rows={1}
            className={cn(
              'flex-1 px-4 py-2.5 rounded-2xl border border-border bg-background',
              'text-sm text-text-primary placeholder:text-text-muted resize-none',
              'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
              'max-h-32 overflow-y-auto',
            )}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-xl transition-all',
              input.trim()
                ? 'bg-primary text-white hover:bg-primary-dark'
                : 'bg-surface-2 text-text-muted cursor-not-allowed',
            )}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function ChatClient({ rooms, userId }: ChatClientProps) {
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null)

  if (activeRoom) {
    return (
      <ChatRoom
        roomId={activeRoom.id}
        roomName={activeRoom.name}
        userId={userId}
        onBack={() => setActiveRoom(null)}
      />
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-10 pb-6">
        <h1 className="text-2xl font-semibold text-text-primary">Chat</h1>
      </div>

      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 px-8 text-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
            <MessageSquare size={24} className="text-text-muted" />
          </div>
          <p className="text-base font-semibold text-text-primary mb-1">No chats yet</p>
          <p className="text-sm text-text-muted">
            Purchase a program to join its group chat and connect with your coach.
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border border-t border-border">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room)}
              className="flex items-center gap-4 px-4 py-4 bg-background hover:bg-surface transition-colors text-left"
            >
              <div className="w-11 h-11 rounded-2xl bg-surface border border-border flex items-center justify-center flex-shrink-0 text-text-secondary">
                <RoomIcon type={room.type} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{room.name}</p>
                <p className="text-xs text-text-muted capitalize mt-0.5">
                  {room.type === 'admin_direct' ? 'Coach' : room.type === 'group' ? 'Group' : 'Direct'}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
