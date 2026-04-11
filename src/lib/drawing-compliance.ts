// Drawing Compliance Engine — 37 C.F.R. §1.84
//
// Pure analysis logic. No React, no DOM APIs beyond what's needed for
// measuring images/SVGs client-side. Returns a structured report.
//
// Phase 1A: Accept external uploads (PNG / JPG / SVG / PDF) and evaluate
// against USPTO drawing rules. Deterministic rules run locally; qualitative
// rules (line quality, view adequacy) call Claude Vision via /api/claude.
//
// Protocol 9 note: this module is new and does not import from or modify
// any existing drawing pipeline. Self-check integration with the Mermaid
// generator happens in a later sub-phase.

// ── Rule constants (37 C.F.R. §1.84) ─────────────────────────────────────

// Sheet sizes, in centimetres
const SHEET_A4       = { widthCm: 21.0, heightCm: 29.7 } as const
const SHEET_LETTER   = { widthCm: 21.6, heightCm: 27.9 } as const
const SHEET_TOL_CM   = 0.2 // tolerance

// Minimum margins (exposed for UI reference / documentation)
export const USPTO_RULES = {
  minTopCm:     2.5,
  minLeftCm:    2.5,
  minRightCm:   1.5,
  minBottomCm:  1.0,
  /** Reference numerals minimum height (0.32 cm = 1/8 inch) */
  minNumeralHeightCm: 0.32,
  /** Minimum effective resolution for raster patent drawings */
  minDPI: 300,
  sheetA4:     SHEET_A4,
  sheetLetter: SHEET_LETTER,
} as const

const MIN_NUMERAL_HEIGHT_CM = USPTO_RULES.minNumeralHeightCm
const MIN_DPI = USPTO_RULES.minDPI

// ── Public types ──────────────────────────────────────────────────────────

export type DrawingMimeType = 'image/png' | 'image/jpeg' | 'image/svg+xml' | 'application/pdf'
export type Severity = 'error' | 'warning' | 'info'
export type FileKind = 'png' | 'jpg' | 'svg' | 'pdf'
export type OverallStatus = 'compliant' | 'non_compliant' | 'warnings_only' | 'not_analyzed'

export interface ComplianceIssue {
  rule: string         // e.g. "37 CFR 1.84(f) sheet size"
  severity: Severity
  message: string      // one-line human summary
  guidance: string     // actionable fix
  measured?: string    // observed value, if available
}

export interface SheetMeta {
  widthCm: number
  heightCm: number
  format: 'A4' | 'US_Letter' | 'other'
}

export interface DrawingMetadata {
  sheetSize?: SheetMeta
  margins?: { topCm: number; leftCm: number; rightCm: number; bottomCm: number }
  figureCount?: number
  estimatedDPI?: number
  pixelWidth?: number
  pixelHeight?: number
  minNumeralHeightCm?: number
  rawText?: string  // for SVG: concatenated text content
}

export interface ComplianceReport {
  fileName: string
  fileKind: FileKind
  overallStatus: OverallStatus
  issues: ComplianceIssue[]
  metadata: DrawingMetadata
  analyzedAt: string
  visionAnalysisUsed: boolean
}

// ── Entry point ──────────────────────────────────────────────────────────

export async function analyzeDrawing(
  file: File,
  opts: { useVisionAI?: boolean } = {},
): Promise<ComplianceReport> {
  const fileKind = detectKind(file)
  const report: ComplianceReport = {
    fileName: file.name,
    fileKind,
    overallStatus: 'not_analyzed',
    issues: [],
    metadata: {},
    analyzedAt: new Date().toISOString(),
    visionAnalysisUsed: false,
  }

  try {
    if (fileKind === 'png' || fileKind === 'jpg') {
      report.metadata = await extractRasterMetadata(file)
    } else if (fileKind === 'svg') {
      report.metadata = await extractSVGMetadata(file)
    } else if (fileKind === 'pdf') {
      // Structured PDF parsing requires pdfjs-dist which we're not adding in
      // Phase 1A. PDFs can still be sent to Claude Vision for qualitative
      // review below.
      report.metadata = { figureCount: undefined }
    }
  } catch (err) {
    report.issues.push({
      rule: 'parser',
      severity: 'error',
      message: `Could not parse ${fileKind.toUpperCase()} file`,
      guidance: 'Re-export the drawing in a supported format and try again.',
      measured: err instanceof Error ? err.message : String(err),
    })
  }

  // Run deterministic rule checks on whatever metadata we extracted
  report.issues.push(...checkSheetSize(report.metadata))
  report.issues.push(...checkResolution(report.metadata))
  report.issues.push(...checkReferenceNumerals(report.metadata))
  // Note: margins + line quality + view adequacy come from vision AI when
  // available (pixel-perfect margin detection is out of scope for Phase 1A).

  // Optional qualitative checks via Claude Vision
  if (opts.useVisionAI && (fileKind === 'png' || fileKind === 'jpg' || fileKind === 'pdf')) {
    try {
      const visionIssues = await runVisionChecks(file)
      report.issues.push(...visionIssues)
      report.visionAnalysisUsed = true
    } catch (err) {
      report.issues.push({
        rule: 'vision',
        severity: 'info',
        message: 'Vision analysis unavailable',
        guidance: 'Deterministic checks completed. Run again to retry AI review.',
        measured: err instanceof Error ? err.message : String(err),
      })
    }
  }

  report.overallStatus = deriveStatus(report.issues)
  return report
}

// ── File type detection ──────────────────────────────────────────────────

function detectKind(file: File): FileKind {
  const name = file.name.toLowerCase()
  if (file.type === 'image/png' || name.endsWith('.png')) return 'png'
  if (file.type === 'image/jpeg' || name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'jpg'
  if (file.type === 'image/svg+xml' || name.endsWith('.svg')) return 'svg'
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf'
  // Unknown: treat as pdf so vision path can attempt it
  return 'pdf'
}

// ── Raster (PNG/JPG) metadata extraction ─────────────────────────────────

async function extractRasterMetadata(file: File): Promise<DrawingMetadata> {
  const bitmap = await loadImageBitmap(file)
  const pixelWidth = bitmap.width
  const pixelHeight = bitmap.height

  // DPI estimation: assume the drawing was authored for US Letter or A4 at
  // a standard DPI. Pick the best-fit DPI by comparing pixel aspect ratio
  // against US Letter (8.5x11) and A4 (210x297 mm).
  const aspectPx = pixelWidth / pixelHeight
  const aspectLetter = SHEET_LETTER.widthCm / SHEET_LETTER.heightCm
  const aspectA4     = SHEET_A4.widthCm / SHEET_A4.heightCm

  const distLetter = Math.abs(aspectPx - aspectLetter)
  const distA4     = Math.abs(aspectPx - aspectA4)
  const assumedSheet = distLetter <= distA4 ? SHEET_LETTER : SHEET_A4
  const assumedFormat: 'US_Letter' | 'A4' = distLetter <= distA4 ? 'US_Letter' : 'A4'

  // DPI = pixels / inches.  width in inches = widthCm / 2.54
  const estimatedDPI = Math.round(pixelWidth / (assumedSheet.widthCm / 2.54))

  // Back-compute physical size from pixel dimensions + DPI
  const widthCm  = (pixelWidth  / estimatedDPI) * 2.54
  const heightCm = (pixelHeight / estimatedDPI) * 2.54

  const isLetter = approxEqual(widthCm, SHEET_LETTER.widthCm, SHEET_TOL_CM) &&
                   approxEqual(heightCm, SHEET_LETTER.heightCm, SHEET_TOL_CM)
  const isA4     = approxEqual(widthCm, SHEET_A4.widthCm, SHEET_TOL_CM) &&
                   approxEqual(heightCm, SHEET_A4.heightCm, SHEET_TOL_CM)
  const format: SheetMeta['format'] = isLetter ? 'US_Letter' : isA4 ? 'A4' : assumedFormat

  return {
    pixelWidth,
    pixelHeight,
    estimatedDPI,
    sheetSize: { widthCm, heightCm, format },
  }
}

function loadImageBitmap(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const result = { width: img.naturalWidth, height: img.naturalHeight }
      URL.revokeObjectURL(url)
      resolve(result)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Image decode failed'))
    }
    img.src = url
  })
}

// ── SVG metadata extraction ──────────────────────────────────────────────

async function extractSVGMetadata(file: File): Promise<DrawingMetadata> {
  const text = await file.text()
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, 'image/svg+xml')
  const svg = doc.documentElement

  // Pull width / height / viewBox
  const widthAttr  = svg.getAttribute('width')
  const heightAttr = svg.getAttribute('height')
  const viewBox    = svg.getAttribute('viewBox')

  let widthCm: number | undefined
  let heightCm: number | undefined

  if (widthAttr && heightAttr) {
    widthCm  = parseLengthToCm(widthAttr)
    heightCm = parseLengthToCm(heightAttr)
  } else if (viewBox) {
    // viewBox is unitless — treat as user units. Assume 96 DPI for rough sizing.
    const [, , vbW, vbH] = viewBox.split(/\s+/).map(parseFloat)
    if (!Number.isNaN(vbW) && !Number.isNaN(vbH)) {
      widthCm  = (vbW / 96) * 2.54
      heightCm = (vbH / 96) * 2.54
    }
  }

  // Find the smallest font-size among <text> elements (for numeral-height rule)
  const texts = Array.from(doc.querySelectorAll('text, tspan'))
  let minFontPx: number | undefined
  let rawText = ''
  for (const t of texts) {
    rawText += (t.textContent || '') + ' '
    const fs = (t.getAttribute('font-size') ?? t.getAttribute('fontSize') ?? '').trim()
    if (!fs) continue
    const px = parsePxLength(fs)
    if (px !== undefined && (minFontPx === undefined || px < minFontPx)) {
      minFontPx = px
    }
  }
  const minNumeralHeightCm = minFontPx !== undefined ? (minFontPx / 96) * 2.54 : undefined

  const sheetSize: SheetMeta | undefined =
    widthCm !== undefined && heightCm !== undefined
      ? {
          widthCm,
          heightCm,
          format:
            approxEqual(widthCm, SHEET_LETTER.widthCm, SHEET_TOL_CM) &&
            approxEqual(heightCm, SHEET_LETTER.heightCm, SHEET_TOL_CM)
              ? 'US_Letter'
              : approxEqual(widthCm, SHEET_A4.widthCm, SHEET_TOL_CM) &&
                approxEqual(heightCm, SHEET_A4.heightCm, SHEET_TOL_CM)
              ? 'A4'
              : 'other',
        }
      : undefined

  return { sheetSize, minNumeralHeightCm, rawText: rawText.trim() }
}

function parseLengthToCm(val: string): number | undefined {
  const m = val.match(/^([\d.]+)\s*(cm|mm|in|px|pt)?$/i)
  if (!m) return undefined
  const n = parseFloat(m[1])
  const unit = (m[2] || 'px').toLowerCase()
  switch (unit) {
    case 'cm': return n
    case 'mm': return n / 10
    case 'in': return n * 2.54
    case 'pt': return (n / 72) * 2.54
    case 'px':
    default:   return (n / 96) * 2.54
  }
}

function parsePxLength(val: string): number | undefined {
  const m = val.match(/^([\d.]+)\s*(px|pt|em|rem)?$/i)
  if (!m) return undefined
  const n = parseFloat(m[1])
  const unit = (m[2] || 'px').toLowerCase()
  switch (unit) {
    case 'px':  return n
    case 'pt':  return n * (96 / 72)
    case 'em':
    case 'rem': return n * 16
    default:    return n
  }
}

// ── Rule checks ──────────────────────────────────────────────────────────

function checkSheetSize(meta: DrawingMetadata): ComplianceIssue[] {
  if (!meta.sheetSize) return []
  const { widthCm, heightCm, format } = meta.sheetSize

  if (format === 'other') {
    return [{
      rule: '37 CFR 1.84(f) sheet size',
      severity: 'error',
      message: 'Drawing is not on A4 or US Letter sheet size',
      guidance: 'Export the drawing on an A4 (21.0 x 29.7 cm) or US Letter (21.6 x 27.9 cm) sheet.',
      measured: `${widthCm.toFixed(1)}cm x ${heightCm.toFixed(1)}cm`,
    }]
  }
  return [{
    rule: '37 CFR 1.84(f) sheet size',
    severity: 'info',
    message: `Sheet size ok (${format === 'US_Letter' ? 'US Letter' : 'A4'})`,
    guidance: 'No action needed.',
    measured: `${widthCm.toFixed(1)}cm x ${heightCm.toFixed(1)}cm`,
  }]
}

function checkResolution(meta: DrawingMetadata): ComplianceIssue[] {
  if (meta.estimatedDPI === undefined) return []
  if (meta.estimatedDPI >= MIN_DPI) {
    return [{
      rule: '37 CFR 1.84(l) print quality',
      severity: 'info',
      message: `Resolution ok (~${meta.estimatedDPI} DPI)`,
      guidance: 'No action needed.',
    }]
  }
  return [{
    rule: '37 CFR 1.84(l) print quality',
    severity: 'error',
    message: `Resolution too low (${meta.estimatedDPI} DPI, need ${MIN_DPI}+)`,
    guidance: 'Re-render the drawing at 300 DPI or higher before upload to Patent Center.',
    measured: `${meta.estimatedDPI} DPI`,
  }]
}

function checkReferenceNumerals(meta: DrawingMetadata): ComplianceIssue[] {
  if (meta.minNumeralHeightCm === undefined) return []
  if (meta.minNumeralHeightCm >= MIN_NUMERAL_HEIGHT_CM) {
    return [{
      rule: '37 CFR 1.84(p)(3) numeral height',
      severity: 'info',
      message: `Reference numerals meet minimum height (>=${MIN_NUMERAL_HEIGHT_CM}cm)`,
      guidance: 'No action needed.',
      measured: `min ${meta.minNumeralHeightCm.toFixed(2)}cm`,
    }]
  }
  return [{
    rule: '37 CFR 1.84(p)(3) numeral height',
    severity: 'error',
    message: 'At least one reference numeral is smaller than 0.32 cm (1/8")',
    guidance: 'Increase the font size of all reference numerals to at least 0.32 cm (1/8 inch).',
    measured: `min ${meta.minNumeralHeightCm.toFixed(2)}cm`,
  }]
}

// ── Vision-AI qualitative checks ─────────────────────────────────────────

async function runVisionChecks(file: File): Promise<ComplianceIssue[]> {
  const base64 = await fileToBase64(file)
  const mediaType = file.type || 'image/png'

  const system = `You are a USPTO patent drawing compliance reviewer. Review the attached drawing against 37 CFR 1.84.
Check ONLY these qualitative rules:
1. Line quality — lines must be solid black, uniform, and durable. No shading/grayscale unless necessary.
2. Margins — adequate white space around the figure (top >= 2.5cm, left >= 2.5cm, right >= 1.5cm, bottom >= 1.0cm).
3. Views — enough views to fully disclose the invention.
4. Figure numbering — each figure labeled "FIG. 1", "FIG. 2", etc. sequentially and legibly.

Respond with a strict JSON object, no markdown, no prose outside JSON. Schema:
{"issues":[{"rule":"<rule>","severity":"error|warning|info","message":"<short>","guidance":"<fix>"}]}
If a rule passes, emit an "info" issue confirming it. If a rule fails, emit an "error" or "warning".`

  const payload = {
    raw: true,
    max_tokens: 800,
    system,
    messages: [{
      role: 'user',
      content: [
        {
          type: file.type === 'application/pdf' ? 'document' : 'image',
          source: { type: 'base64', media_type: mediaType, data: base64 },
        },
        { type: 'text', text: 'Analyze this patent drawing for 37 CFR 1.84 compliance and return the JSON report.' },
      ],
    }],
  }

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Vision API error: HTTP ${res.status}`)

  const data = await res.json() as { content?: Array<{ text?: string }> }
  const text = data.content?.[0]?.text ?? ''
  const parsed = safeParseVisionJSON(text)
  return parsed?.issues ?? []
}

function safeParseVisionJSON(text: string): { issues: ComplianceIssue[] } | null {
  // Strip markdown fences if present
  const cleaned = text.replace(/```json|```/g, '').trim()
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  if (firstBrace === -1 || lastBrace === -1) return null
  try {
    const obj = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as { issues?: ComplianceIssue[] }
    if (!Array.isArray(obj.issues)) return null
    return { issues: obj.issues }
  } catch {
    return null
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // result is "data:<mime>;base64,<data>" — strip the prefix
      const idx = result.indexOf(',')
      resolve(idx >= 0 ? result.slice(idx + 1) : result)
    }
    reader.onerror = () => reject(new Error('File read failed'))
    reader.readAsDataURL(file)
  })
}

// ── Helpers ──────────────────────────────────────────────────────────────

function approxEqual(a: number, b: number, tol: number): boolean {
  return Math.abs(a - b) <= tol
}

function deriveStatus(issues: ComplianceIssue[]): OverallStatus {
  if (issues.length === 0) return 'not_analyzed'
  const hasError = issues.some(i => i.severity === 'error')
  const hasWarning = issues.some(i => i.severity === 'warning')
  if (hasError) return 'non_compliant'
  if (hasWarning) return 'warnings_only'
  return 'compliant'
}

// ── Persistence of past reports (localStorage) ───────────────────────────

const HISTORY_KEY = 'uspto-drawing-compliance-history-v1'
const HISTORY_LIMIT = 50

export interface StoredReport extends ComplianceReport {
  id: string
  patentId?: string
}

export function loadReportHistory(): StoredReport[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredReport[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveReportToHistory(report: ComplianceReport, patentId?: string): StoredReport {
  const stored: StoredReport = {
    ...report,
    id: `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    patentId,
  }
  const history = loadReportHistory()
  const next = [stored, ...history].slice(0, HISTORY_LIMIT)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
  return stored
}

export function clearReportHistory(): void {
  localStorage.removeItem(HISTORY_KEY)
}
