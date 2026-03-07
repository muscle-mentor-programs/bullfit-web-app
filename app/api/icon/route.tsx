import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const size = parseInt(req.nextUrl.searchParams.get('size') ?? '192', 10)
  const safeSize = [192, 512].includes(size) ? size : 192
  const fontSize = Math.round(safeSize * 0.52)
  const borderRadius = Math.round(safeSize * 0.22)

  return new ImageResponse(
    (
      <div
        style={{
          background: 'radial-gradient(circle at 30% 30%, #1A1A1A, #000000)',
          width: safeSize,
          height: safeSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius,
          border: '2px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* BULLFIT "B" with gradient */}
        <span
          style={{
            background: 'linear-gradient(135deg, #00BEFF 0%, #CF00FF 50%, #FF0087 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            fontSize,
            fontWeight: 900,
            fontFamily: 'sans-serif',
            lineHeight: 1,
          }}
        >
          B
        </span>
      </div>
    ),
    { width: safeSize, height: safeSize },
  )
}
