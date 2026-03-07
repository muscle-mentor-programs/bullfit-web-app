'use client'

import { cn } from '@/lib/utils/cn'
import type { ChatMessage as ChatMessageType } from '@/types'

interface ChatMessageProps {
  message: ChatMessageType
  isOwn: boolean
  showSender?: boolean
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatTime(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function Avatar({ name }: { name: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center shrink-0',
        'w-7 h-7 rounded-full',
        'bg-primary/15 text-primary',
        'text-[10px] font-bold select-none',
      )}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  )
}

function ChatMessage({ message, isOwn, showSender = false }: ChatMessageProps) {
  const senderName = message.sender?.name ?? 'Unknown'
  const timestamp = message.created_at

  return (
    <div
      className={cn(
        'flex items-end gap-2 w-full',
        isOwn ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      {/* Avatar (other side only) */}
      {!isOwn && showSender && <Avatar name={senderName} />}
      {!isOwn && !showSender && <div className="w-7 shrink-0" aria-hidden="true" />}

      {/* Bubble + meta */}
      <div
        className={cn(
          'flex flex-col gap-1 max-w-[75%]',
          isOwn ? 'items-end' : 'items-start',
        )}
      >
        {/* Sender name */}
        {!isOwn && showSender && (
          <span className="text-[11px] font-medium text-text-muted px-1">
            {senderName}
          </span>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'px-4 py-2.5 text-sm leading-relaxed',
            'transition-colors duration-150',
            isOwn
              ? [
                  'bg-primary text-white',
                  'rounded-2xl rounded-br-sm',
                ]
              : [
                  'bg-surface text-text-primary border border-border',
                  'rounded-2xl rounded-bl-sm',
                ],
          )}
        >
          {message.content}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <span className="text-[10px] text-text-muted px-1">
            {formatTime(timestamp)}
          </span>
        )}
      </div>

      {/* Own-side avatar placeholder for alignment */}
      {isOwn && <div className="w-7 shrink-0" aria-hidden="true" />}
    </div>
  )
}

export { ChatMessage }
export type { ChatMessageProps }
