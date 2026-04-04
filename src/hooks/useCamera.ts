// useCamera — React hook for camera access and image capture
// Used by VCE (Visual Capture Engine) components.
// Handles permissions, stream lifecycle, and frame capture.

import { useState, useRef, useCallback, useEffect, type RefObject } from 'react'
import type { CameraConfig } from '@/lib/vadi/vce'
import { requestCameraAccess, captureFrame, isCameraAvailable } from '@/lib/vadi/vce'
import type { ImageMetadata } from '@/types/patent'

export interface UseCameraResult {
  isAvailable: boolean
  isStreaming: boolean
  error: string | null
  videoRef: RefObject<HTMLVideoElement | null>
  startCamera: (config?: CameraConfig) => Promise<void>
  stopCamera: () => void
  capture: () => { dataUrl: string; metadata: ImageMetadata } | null
}

export function useCamera(): UseCameraResult {
  const [isAvailable, setIsAvailable] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Check camera availability on mount
  useEffect(() => {
    isCameraAvailable().then(setIsAvailable)
  }, [])

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  const startCamera = useCallback(async (config?: CameraConfig) => {
    setError(null)
    try {
      const stream = await requestCameraAccess(config)
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setIsStreaming(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Camera access denied'
      setError(message)
      setIsStreaming(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsStreaming(false)
  }, [])

  const capture = useCallback(() => {
    if (!videoRef.current || !isStreaming) return null
    try {
      return captureFrame(videoRef.current)
    } catch {
      setError('Failed to capture frame')
      return null
    }
  }, [isStreaming])

  return { isAvailable, isStreaming, error, videoRef, startCamera, stopCamera, capture }
}
