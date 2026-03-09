import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  const logoData = readFileSync(join(process.cwd(), 'public/bull-logo.png'))
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          background: '#FFFFFF',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <img
          src={logoSrc}
          style={{
            width: '165%',
            height: '165%',
            objectFit: 'contain',
            objectPosition: 'center top',
            marginTop: '-8%',
          }}
        />
      </div>
    ),
    { ...size },
  )
}
