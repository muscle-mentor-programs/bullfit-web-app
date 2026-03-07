'use client'

import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface Props {
  onScan: (barcode: string) => void
  onClose: () => void
  onPermissionGranted?: () => void
}

type Status = 'starting' | 'scanning' | 'found' | 'error'

export function BarcodeScanner({ onScan, onClose, onPermissionGranted }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)
  const scannedRef = useRef(false)
  const onScanRef = useRef(onScan)
  onScanRef.current = onScan
  const [status, setStatus] = useState<Status>('starting')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    let stopped = false

    async function start() {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser')
        if (stopped) return

        const reader = new BrowserMultiFormatReader()

        if (!videoRef.current) return

        setStatus('scanning')
        onPermissionGranted?.()

        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' } } },
          videoRef.current,
          (result, err) => {
            if (stopped || scannedRef.current) return
            if (result) {
              scannedRef.current = true
              setStatus('found')
              setTimeout(() => {
                if (!stopped) onScanRef.current(result.getText())
              }, 300)
            }
            // Suppress NotFoundException noise
            if (err && err.name !== 'NotFoundException') {
              console.warn('ZXing:', err)
            }
          },
        )
        if (!stopped) controlsRef.current = controls
      } catch (err: unknown) {
        if (stopped) return
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('notallowed')) {
          setErrorMsg('Camera access denied. Please allow camera permission and try again.')
        } else {
          setErrorMsg('Could not start camera. Try searching by name instead.')
        }
        setStatus('error')
      }
    }

    start()

    return () => {
      stopped = true
      // Stop the ZXing decode loop (releases camera stream too)
      try { controlsRef.current?.stop() } catch {}
      controlsRef.current = null
      // Belt-and-suspenders: stop any tracks still on the video element
      if (videoRef.current?.srcObject instanceof MediaStream) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop())
        videoRef.current.srcObject = null
      }
    }
  }, []) // empty deps — onScan accessed via ref, no restarts on re-render

  const statusLabel =
    status === 'starting' ? 'STARTING CAMERA…'
    : status === 'found' ? 'FOUND!'
    : status === 'error' ? ''
    : 'POINT CAMERA AT BARCODE'

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      {/* Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
        autoPlay
      />

      {/* Dark vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.65) 100%)',
        }}
      />

      {/* Viewfinder */}
      {status !== 'error' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-64 h-40">
            {/* Corner brackets */}
            {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
              <span
                key={corner}
                className="absolute w-6 h-6"
                style={{
                  ...(corner === 'tl' ? { top: 0, left: 0, borderTop: '3px solid white', borderLeft: '3px solid white', borderRadius: '4px 0 0 0' } : {}),
                  ...(corner === 'tr' ? { top: 0, right: 0, borderTop: '3px solid white', borderRight: '3px solid white', borderRadius: '0 4px 0 0' } : {}),
                  ...(corner === 'bl' ? { bottom: 0, left: 0, borderBottom: '3px solid white', borderLeft: '3px solid white', borderRadius: '0 0 0 4px' } : {}),
                  ...(corner === 'br' ? { bottom: 0, right: 0, borderBottom: '3px solid white', borderRight: '3px solid white', borderRadius: '0 0 4px 0' } : {}),
                }}
              />
            ))}

            {/* Found flash */}
            {status === 'found' && (
              <div className="absolute inset-0 rounded border-2 border-green-400 bg-green-400/20 flex items-center justify-center">
                <span className="text-white font-black text-lg tracking-widest">FOUND!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status label */}
      {statusLabel && (
        <div className="absolute bottom-1/4 left-0 right-0 flex justify-center pointer-events-none">
          <p className="text-white text-xs font-black tracking-widest bg-black/40 px-4 py-1.5 rounded-full">
            {statusLabel}
          </p>
        </div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <p className="text-white text-sm font-semibold mb-4 leading-relaxed">{errorMsg}</p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-white/40 text-white text-sm font-black"
          >
            Go Back
          </button>
        </div>
      )}

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white"
        style={{ marginTop: 'env(safe-area-inset-top)' }}
        aria-label="Close scanner"
      >
        <X size={20} />
      </button>
    </div>
  )
}
