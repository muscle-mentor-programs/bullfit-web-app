import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
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
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={logoSrc}
          style={{
            width: '80%',
            height: '80%',
            objectFit: 'contain',
          }}
        />
      </div>
    ),
    { ...size },
  )
}
