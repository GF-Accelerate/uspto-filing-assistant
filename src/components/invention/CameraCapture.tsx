// CameraCapture — Camera viewfinder and capture UI for physical inventions
// Part of VCE (Visual Capture Engine). Feature-flagged: invention_capture_enabled
//
// Usage: Photograph hardware prototypes, physical devices, or real-world objects
// for analysis and inclusion in patent documentation.

import { useState, useCallback, type ChangeEvent } from 'react'
import { useCamera } from '@/hooks/useCamera'
import { saveCapturedImage, processUploadedImage } from '@/lib/vadi/vce'
import type { CapturedImage } from '@/types/patent'

interface CameraCaptureProps {
  patentId: string | null
  onCapture: (image: CapturedImage) => void
  className?: string
}

export function CameraCapture({ patentId, onCapture, className = '' }: CameraCaptureProps) {
  const { isAvailable, isStreaming, error, videoRef, startCamera, stopCamera, capture } = useCamera()
  const [label, setLabel] = useState('')
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null)

  const handleCapture = useCallback(() => {
    const result = capture()
    if (!result) return

    setCapturedPreview(result.dataUrl)

    const image = saveCapturedImage(
      result.dataUrl,
      result.metadata,
      patentId,
      label || `Capture ${new Date().toLocaleTimeString()}`,
      'camera'
    )
    onCapture(image)
    setLabel('')

    // Clear preview after 2 seconds
    setTimeout(() => setCapturedPreview(null), 2000)
  }, [capture, patentId, label, onCapture])

  const handleFileUpload = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const { dataUrl, metadata } = await processUploadedImage(file)
      const image = saveCapturedImage(
        dataUrl,
        metadata,
        patentId,
        label || file.name,
        'upload'
      )
      onCapture(image)
      setLabel('')
    } catch {
      // Silently fail — user can retry
    }
  }, [patentId, label, onCapture])

  return (
    <div className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-lg">📷</span>
          Invention Capture
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Photograph physical prototypes for patent documentation
        </p>
      </div>

      <div className="p-4 space-y-3">
        {/* Label input */}
        <input
          type="text"
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="Label this capture (e.g., 'Front view of prototype')"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md
            bg-white dark:bg-gray-700 text-gray-900 dark:text-white
            placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Camera viewfinder */}
        {isStreaming && (
          <div className="relative rounded-lg overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-video object-cover"
            />
            {capturedPreview && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                <span className="text-4xl">✓</span>
              </div>
            )}
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {!isStreaming ? (
            <>
              {isAvailable && (
                <button
                  onClick={() => startCamera()}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700
                    rounded-md transition-colors"
                >
                  Open Camera
                </button>
              )}
              <label className="flex-1 px-3 py-2 text-sm font-medium text-center text-gray-700 dark:text-gray-300
                bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                rounded-md transition-colors cursor-pointer">
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </>
          ) : (
            <>
              <button
                onClick={handleCapture}
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700
                  rounded-md transition-colors"
              >
                Capture
              </button>
              <button
                onClick={stopCamera}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                  bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                  rounded-md transition-colors"
              >
                Close
              </button>
            </>
          )}
        </div>

        {!isAvailable && !isStreaming && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            No camera detected. Use "Upload Photo" to add images from your device.
          </p>
        )}
      </div>
    </div>
  )
}
