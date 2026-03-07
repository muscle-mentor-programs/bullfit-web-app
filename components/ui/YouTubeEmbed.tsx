'use client'

import { cn } from '@/lib/utils/cn'
import { Play } from 'lucide-react'
import { useState } from 'react'

interface YouTubeEmbedProps {
  url: string | null
  className?: string
}

function extractVideoId(url: string | null): string | null {
  if (!url) return null

  // youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (shortMatch) return shortMatch[1]

  // youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (watchMatch) return watchMatch[1]

  // youtube.com/embed/VIDEO_ID
  const embedMatch = url.match(/\/embed\/([a-zA-Z0-9_-]{11})/)
  if (embedMatch) return embedMatch[1]

  // youtube.com/shorts/VIDEO_ID
  const shortsMatch = url.match(/\/shorts\/([a-zA-Z0-9_-]{11})/)
  if (shortsMatch) return shortsMatch[1]

  return null
}

function YouTubeEmbed({ url, className }: YouTubeEmbedProps) {
  const [playing, setPlaying] = useState(false)
  const videoId = extractVideoId(url)

  if (!videoId) {
    return null
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-xl bg-black',
        'aspect-video',
        className,
      )}
    >
      {playing ? (
        <iframe
          src={embedUrl}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      ) : (
        <button
          onClick={() => setPlaying(true)}
          className={cn(
            'absolute inset-0 w-full h-full group',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
          )}
          aria-label="Play video"
        >
          {/* Thumbnail */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt="Video thumbnail"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Dark overlay on hover */}
          <div
            className={cn(
              'absolute inset-0 bg-black/20',
              'transition-colors duration-200',
              'group-hover:bg-black/30',
            )}
          />

          {/* Play button */}
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center',
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center',
                'w-14 h-14 rounded-full',
                'bg-white/90 group-hover:bg-white',
                'shadow-lg',
                'transition-all duration-200',
                'group-hover:scale-110',
              )}
            >
              <Play
                size={22}
                className="text-text-primary ml-1"
                fill="currentColor"
              />
            </div>
          </div>
        </button>
      )}
    </div>
  )
}

export { YouTubeEmbed }
export type { YouTubeEmbedProps }
