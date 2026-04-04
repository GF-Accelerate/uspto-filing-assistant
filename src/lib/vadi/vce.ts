// VCE — Visual Capture Engine (PA-5 Component 500)
// Camera-based capture and AI vision analysis of physical inventions.
// Enables users to photograph hardware prototypes, physical devices,
// and real-world objects, then analyze them for patent documentation.
//
// This is a novel VADI primitive — no existing patent platform integrates
// camera/vision into the IP filing pipeline.

import type {
  CapturedImage, ImageMetadata, InventionAnalysis,
  IdentifiedComponent, PatentRelevance, DrawingLabel
} from '@/types/patent'

// ── Storage ───────────────────────────────────────────────────────────────

const CAPTURES_KEY = 'vais:vce-captures'
const ANALYSES_KEY = 'vais:vce-analyses'

function loadCaptures(): CapturedImage[] {
  try {
    const raw = localStorage.getItem(CAPTURES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveCaptures(captures: CapturedImage[]): void {
  try {
    // Keep last 20 captures to manage storage
    const trimmed = captures.slice(-20)
    localStorage.setItem(CAPTURES_KEY, JSON.stringify(trimmed))
  } catch { /* storage full */ }
}

function loadAnalyses(): InventionAnalysis[] {
  try {
    const raw = localStorage.getItem(ANALYSES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveAnalyses(analyses: InventionAnalysis[]): void {
  try {
    const trimmed = analyses.slice(-20)
    localStorage.setItem(ANALYSES_KEY, JSON.stringify(trimmed))
  } catch { /* storage full */ }
}

// ── Camera access ─────────────────────────────────────────────────────────

export interface CameraConfig {
  facingMode: 'environment' | 'user'  // Back camera for inventions
  resolution: 'high' | 'medium'
  format: 'image/jpeg' | 'image/png'
}

const DEFAULT_CAMERA_CONFIG: CameraConfig = {
  facingMode: 'environment',
  resolution: 'high',
  format: 'image/jpeg',
}

export async function requestCameraAccess(
  config: CameraConfig = DEFAULT_CAMERA_CONFIG
): Promise<MediaStream> {
  const constraints: MediaStreamConstraints = {
    video: {
      facingMode: config.facingMode,
      width: config.resolution === 'high' ? { ideal: 1920 } : { ideal: 1280 },
      height: config.resolution === 'high' ? { ideal: 1080 } : { ideal: 720 },
    },
  }
  return navigator.mediaDevices.getUserMedia(constraints)
}

export function captureFrame(
  video: HTMLVideoElement,
  config: CameraConfig = DEFAULT_CAMERA_CONFIG
): { dataUrl: string; metadata: ImageMetadata } {
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Cannot get canvas context')

  ctx.drawImage(video, 0, 0)
  const dataUrl = canvas.toDataURL(config.format, 0.92)

  const metadata: ImageMetadata = {
    width: canvas.width,
    height: canvas.height,
    mimeType: config.format,
    deviceInfo: navigator.userAgent,
    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
  }

  return { dataUrl, metadata }
}

// ── Image storage and management ──────────────────────────────────────────

export function saveCapturedImage(
  dataUrl: string,
  metadata: ImageMetadata,
  patentId: string | null,
  label: string,
  source: 'camera' | 'upload' = 'camera'
): CapturedImage {
  const image: CapturedImage = {
    id: `vce-${Date.now()}`,
    dataUrl,
    timestamp: new Date().toISOString(),
    source,
    patentId,
    label,
    metadata,
  }

  const captures = loadCaptures()
  captures.push(image)
  saveCaptures(captures)
  return image
}

export function getCapturesForPatent(patentId: string): CapturedImage[] {
  return loadCaptures().filter(c => c.patentId === patentId)
}

export function getAllCaptures(): CapturedImage[] {
  return loadCaptures()
}

export function deleteCapture(imageId: string): void {
  const captures = loadCaptures().filter(c => c.id !== imageId)
  saveCaptures(captures)
  // Also remove associated analyses
  const analyses = loadAnalyses().filter(a => a.imageId !== imageId)
  saveAnalyses(analyses)
}

// ── AI Vision Analysis ────────────────────────────────────────────────────

const VCE_ANALYSIS_SYSTEM = `You are a patent documentation specialist with expertise in analyzing physical inventions, prototypes, and hardware devices. You examine photographs of physical objects and produce structured analysis suitable for inclusion in patent applications.

You identify:
1. Physical components and their apparent function
2. Materials (observed or inferred)
3. Approximate dimensions and scale
4. How the device relates to existing patent claims
5. Suggested patent figure labels with reference numbers
6. Potential claim elements derived from the physical embodiment

IMPORTANT: Never guess at trade secrets or internal mechanisms not visible in the image. Only describe what is observably apparent. Flag components with uncertain novelty.

Respond ONLY with valid JSON. No markdown, no preamble.`

export async function analyzeInventionImage(
  imageDataUrl: string,
  patentContext: { patentId: string; title: string; claimSummary: string }
): Promise<InventionAnalysis> {
  // Call Claude Vision API via the proxy
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system: VCE_ANALYSIS_SYSTEM,
      user: `Analyze this photograph of a physical invention or prototype.

Patent context:
- Patent ID: ${patentContext.patentId}
- Title: ${patentContext.title}
- Claims summary: ${patentContext.claimSummary}

Return JSON with EXACTLY these keys:
{
  "components": [{"name": "component name", "description": "what it does", "boundingArea": "location in image", "noveltyIndicator": "novel|known|uncertain"}],
  "materials": ["material 1", "material 2"],
  "dimensions": "estimated dimensions or null",
  "functionalDescription": "what the device appears to do",
  "patentRelevance": {
    "relevantPatentIds": ["PA-X"],
    "suggestedFigureNumber": 1,
    "suggestedFigureCaption": "FIG. X — Description",
    "priorArtConcerns": ["any concerns"]
  },
  "suggestedClaimElements": ["a first component configured to...", "a second component coupled to..."],
  "suggestedDrawingLabels": [{"referenceNumber": 110, "description": "component description", "position": "upper left"}],
  "confidence": 0.85
}`,
      max_tokens: 2000,
      image: imageDataUrl,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error || `Vision analysis failed: HTTP ${res.status}`)
  }

  const data = await res.json()
  const parsed = JSON.parse((data.text ?? '').replace(/```json|```/g, '').trim())

  const analysis: InventionAnalysis = {
    id: `vce-analysis-${Date.now()}`,
    imageId: '', // Set by caller
    timestamp: new Date().toISOString(),
    components: parsed.components as IdentifiedComponent[],
    materials: parsed.materials,
    dimensions: parsed.dimensions,
    functionalDescription: parsed.functionalDescription,
    patentRelevance: parsed.patentRelevance as PatentRelevance,
    suggestedClaimElements: parsed.suggestedClaimElements,
    suggestedDrawingLabels: parsed.suggestedDrawingLabels as DrawingLabel[],
    confidence: parsed.confidence,
  }

  // Persist
  const analyses = loadAnalyses()
  analyses.push(analysis)
  saveAnalyses(analyses)

  return analysis
}

export function getAnalysesForImage(imageId: string): InventionAnalysis[] {
  return loadAnalyses().filter(a => a.imageId === imageId)
}

export function getAllAnalyses(): InventionAnalysis[] {
  return loadAnalyses()
}

// ── File upload handler ───────────────────────────────────────────────────

export function processUploadedImage(file: File): Promise<{ dataUrl: string; metadata: ImageMetadata }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const img = new Image()
      img.onload = () => {
        resolve({
          dataUrl,
          metadata: {
            width: img.width,
            height: img.height,
            mimeType: file.type,
            deviceInfo: 'file-upload',
            orientation: img.width > img.height ? 'landscape' : 'portrait',
          },
        })
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = dataUrl
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// ── Camera availability check ─────────────────────────────────────────────

export async function isCameraAvailable(): Promise<boolean> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.some(d => d.kind === 'videoinput')
  } catch {
    return false
  }
}
