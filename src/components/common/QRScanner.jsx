import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

export function QRScanner({ onScan, onError }) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState(null)
  const scannerRef = useRef(null)
  const html5QrcodeScannerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear().catch(console.error)
      }
    }
  }, [])

  const startScanning = () => {
    setIsScanning(true)
    setScanError(null)

    // Wait for DOM to be ready
    setTimeout(() => {
      if (!scannerRef.current) return

      try {
        html5QrcodeScannerRef.current = new Html5QrcodeScanner(
          'qr-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            disableFlip: false,
            verbose: false,
          },
          false
        )

        html5QrcodeScannerRef.current.render(
          (decodedText) => {
            // QR code successfully scanned
            console.log('QR Code scanned:', decodedText)
            if (onScan) {
              onScan(decodedText)
            }
            // Stop scanning after successful scan
            html5QrcodeScannerRef.current.pause()
            html5QrcodeScannerRef.current.clear()
            setIsScanning(false)
          },
          (errorMessage) => {
            // Scan error - ignore as this happens frequently during scanning
            console.debug('QR scan error:', errorMessage)
          }
        ).catch((error) => {
          console.error('Scanner initialization error:', error)
          setScanError('Failed to start camera. Please ensure camera access is allowed.')
          if (onError) {
            onError(error)
          }
          setIsScanning(false)
        })
      } catch (error) {
        console.error('Error creating scanner:', error)
        setScanError('Failed to initialize QR scanner. Please try again.')
        if (onError) {
          onError(error)
        }
        setIsScanning(false)
      }
    }, 100)
  }

  const stopScanning = () => {
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear().catch(console.error)
      html5QrcodeScannerRef.current = null
    }
    setIsScanning(false)
  }

  if (!isScanning) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6">
        <div className="w-full max-w-sm aspect-square rounded-2xl bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center p-6">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <p className="mt-4 text-gray-600">Ready to scan QR codes</p>
          </div>
        </div>
        <button
          onClick={startScanning}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Start Scanning
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="w-full max-w-sm">
        <div id="qr-reader" ref={scannerRef} className="rounded-xl overflow-hidden"></div>
      </div>

      {scanError && (
        <div className="w-full max-w-sm p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm">{scanError}</p>
        </div>
      )}

      <button
        onClick={stopScanning}
        className="btn-secondary flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        Stop Scanning
      </button>
    </div>
  )
}
