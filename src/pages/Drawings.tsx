/// <reference types="vite/client" />
import { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { InlineComplianceCheck } from '@/components/InlineComplianceCheck'
import { isEnabled } from '@/lib/feature-flags'
import { analyzeDrawing, type ComplianceReport } from '@/lib/drawing-compliance'
import {
  PATENT_DRAWINGS, getPatentIds,
  loadCustomDrawings, saveCustomDrawings,
  type DrawingDef,
} from '@/lib/patent-drawings'

// USPTO 37 C.F.R. §1.84 compliant drawing specs
// Page: 8.5x11" at 300 DPI = 2550x3300px
// Usable area: 6 15/16" x 9 5/8" = 2081x2888px
// Margins: top 1", left 1", right 5/8", bottom 3/8"

type DrawingStatus = 'pending' | 'generating' | 'done' | 'error'
interface Drawing extends DrawingDef { svg: string; status: DrawingStatus; isCustom?: boolean }

// Mermaid init directive — embedded in each diagram so theme always applies
const MERMAID_INIT = `%%{init: {
  "theme": "base",
  "themeVariables": {
    "primaryColor": "#f0f4ff",
    "primaryBorderColor": "#1e3a5f",
    "primaryTextColor": "#1e293b",
    "lineColor": "#334155",
    "secondaryColor": "#e8f4fd",
    "tertiaryColor": "#f8fafc",
    "background": "#ffffff",
    "mainBkg": "#f0f4ff",
    "nodeBorder": "#1e3a5f",
    "clusterBkg": "#f0f4ff",
    "titleColor": "#1e293b",
    "edgeLabelBackground": "#ffffff",
    "fontFamily": "Arial, sans-serif",
    "fontSize": "13px"
  }
}}%%`

// CSS override to force Arial on all SVG text (prevents Times-BoldItalic font references)
const FONT_OVERRIDE_CSS = `
  text, tspan { font-family: Arial, Helvetica, sans-serif; }
  foreignObject div, foreignObject span, foreignObject p,
  foreignObject b, foreignObject i, foreignObject em, foreignObject strong {
    font-family: Arial, Helvetica, sans-serif !important;
    font-style: normal !important;
    font-weight: normal !important;
  }
`

async function renderMermaidToSVG(mermaidCode: string): Promise<string> {
  const mermaid = (await import('mermaid')).default
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    flowchart: { htmlLabels: true },
  })

  // Prepend init directive so theme variables are always respected
  const fullCode = MERMAID_INIT + '\n' + mermaidCode

  const id = `diagram-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const { svg } = await mermaid.render(id, fullCode)

  // Post-process: ensure white page background, clean up stray fills, force fonts
  let result = svg
    .replace(/fill="rgb\(0, 0, 0\)"/g, 'fill="#1e3a5f"')
    .replace(/fill="black"/g, 'fill="#1e3a5f"')

  // Inject font override CSS into SVG <style> block to prevent non-embedded font references
  if (result.includes('<style>')) {
    result = result.replace('<style>', `<style>${FONT_OVERRIDE_CSS}`)
  } else {
    result = result.replace(/(<svg[^>]*>)/, `$1<defs><style>${FONT_OVERRIDE_CSS}</style></defs>`)
  }

  return result
}

async function downloadPDF(
  el: HTMLDivElement | null,
  figNum: string,
  title: string,
  patentId: string
) {
  if (!el) { alert('Drawing not rendered yet — click Render first'); return }

  const { default: jsPDF }       = await import('jspdf')
  const { default: html2canvas } = await import('html2canvas')

  // USPTO 8.5×11" — 1" margins top/left, 5/8" right, 3/8" bottom
  const pageW = 8.5, pageH = 11
  const marginLeft = 1, marginTop = 1
  const usableW = 6.875, usableH = 9.0

  // ── Temporarily remove scroll constraints so FULL diagram is captured ──
  const origMaxH   = el.style.maxHeight
  const origOverflow = el.style.overflow
  const origHeight = el.style.height

  el.style.maxHeight  = 'none'
  el.style.overflow   = 'visible'
  el.style.height     = 'auto'

  // Also expand the SVG itself to its natural size
  const svgEl = el.querySelector('svg')
  const origSvgH = svgEl ? svgEl.style.height : ''
  if (svgEl) svgEl.style.height = 'auto'

  // Short delay to let the browser relayout
  await new Promise(r => setTimeout(r, 80))

  // Measure the full expanded size
  const fullH = el.scrollHeight || el.offsetHeight || 800
  const fullW = el.scrollWidth  || el.offsetWidth  || 1200

  const canvas = await html2canvas(el, {
    backgroundColor: '#ffffff',
    scale: 1.5,
    useCORS: true,
    logging: false,
    width:  fullW,
    height: fullH,
    windowWidth:  fullW,
    windowHeight: fullH,
  })

  // Restore original styles
  el.style.maxHeight = origMaxH
  el.style.overflow  = origOverflow
  el.style.height    = origHeight
  if (svgEl) svgEl.style.height = origSvgH

  // ── Build USPTO PDF ────────────────────────────────────────────────────
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter', compress: true })

  // Figure number centred at top — 37 C.F.R. §1.84
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.text(figNum, pageW / 2, marginTop - 0.3, { align: 'center' })

  // Scale image to fit usable area, preserving aspect ratio, centred
  const ar = canvas.width / canvas.height
  let drawW = usableW
  let drawH = drawW / ar
  if (drawH > usableH) { drawH = usableH; drawW = drawH * ar }
  const ox = marginLeft + (usableW - drawW) / 2
  const oy = marginTop  + (usableH - drawH) / 2

  pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', ox, oy, drawW, drawH)

  // Caption
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(40, 40, 40)
  pdf.text(`${figNum} — ${title}`, pageW / 2, marginTop + usableH + 0.22, { align: 'center' })

  // Footer — patent ID + generation date (no hardcoded filing date)
  const genDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  pdf.setFontSize(7)
  pdf.setTextColor(130, 130, 130)
  pdf.text(
    `Visionary AI Systems, Inc. (Delaware) | Milton & Lisa Overton, Inventors | ${patentId} | Generated: ${genDate}`,
    pageW / 2, pageH - 0.35, { align: 'center' }
  )

  // Validate page size is exactly 8.5x11" (US Letter) per 37 CFR 1.84
  const pdfPageW = pdf.internal.pageSize.getWidth()
  const pdfPageH = pdf.internal.pageSize.getHeight()
  if (Math.abs(pdfPageW - 8.5) > 0.01 || Math.abs(pdfPageH - 11) > 0.01) {
    alert(`Page size validation failed: ${pdfPageW}" x ${pdfPageH}" — USPTO requires exactly 8.5" x 11"`)
    return
  }

  const safeFig = figNum.replace(/[^A-Z0-9]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  const safeTitle = title.replace(/[^a-z0-9]/gi, '-').toLowerCase().replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 30)
  pdf.save(`${patentId}-${safeFig}-${safeTitle}.pdf`)
}

function downloadSVG(svg: string, figNum: string, patentId: string) {
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${patentId}-${figNum.replace(/[^A-Z0-9]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}.svg`
  a.click()
  URL.revokeObjectURL(url)
}

export function Drawings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const patentParam = searchParams.get('patent') || 'PA-1'
  const patentIds = getPatentIds()
  const [selectedPatent, setSelectedPatent] = useState(
    patentIds.includes(patentParam) ? patentParam : 'PA-1'
  )

  // Build drawings from built-in + custom
  const buildDrawings = useCallback((patentId: string): Drawing[] => {
    const builtIn = (PATENT_DRAWINGS[patentId] || []).map(f => ({
      ...f, svg: '', status: 'pending' as DrawingStatus, isCustom: false,
    }))
    const custom = loadCustomDrawings(patentId).map(f => ({
      ...f, svg: '', status: 'pending' as DrawingStatus, isCustom: true,
    }))
    return [...builtIn, ...custom]
  }, [])

  const [drawings, setDrawings] = useState<Drawing[]>(() => buildDrawings(selectedPatent))
  const [generating, setGenerating] = useState(false)
  const previewRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Bulk compliance check state
  const [bulkChecking, setBulkChecking] = useState(false)
  const [bulkReport, setBulkReport] = useState<null | {
    reports: ComplianceReport[]
    errors: number
    warnings: number
    info: number
  }>(null)

  // Custom drawing input state
  const [customDesc, setCustomDesc] = useState('')
  const [customTitle, setCustomTitle] = useState('')
  const [customMermaid, setCustomMermaid] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)
  const [generatingCustom, setGeneratingCustom] = useState(false)
  const [showCustomPanel, setShowCustomPanel] = useState(false)

  // Update drawings when patent changes
  const handlePatentChange = useCallback((patentId: string) => {
    setSelectedPatent(patentId)
    setSearchParams({ patent: patentId })
    setDrawings(buildDrawings(patentId))
  }, [buildDrawings, setSearchParams])

  // Sync with URL param changes (e.g. from voice navigation)
  useEffect(() => {
    const urlPatent = searchParams.get('patent')
    if (urlPatent && patentIds.includes(urlPatent) && urlPatent !== selectedPatent) {
      setSelectedPatent(urlPatent)
      setDrawings(buildDrawings(urlPatent))
    }
  }, [searchParams, patentIds, selectedPatent, buildDrawings])

  const update = (id: string, updates: Partial<Drawing>) =>
    setDrawings(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d))

  // Inject SVG into preview div when it changes
  useEffect(() => {
    drawings.forEach(d => {
      const el = previewRefs.current[d.id]
      if (el && d.svg) el.innerHTML = d.svg
    })
  }, [drawings])

  const generateOne = async (drawing: Drawing) => {
    update(drawing.id, { status: 'generating' })
    try {
      const svg = await renderMermaidToSVG(drawing.mermaid)
      update(drawing.id, { svg, status: 'done' })
    } catch (e) {
      console.error('Mermaid render error:', e)
      update(drawing.id, { status: 'error' })
    }
  }

  const generateAll = async () => {
    setGenerating(true)
    for (const d of drawings) {
      if (d.status !== 'done') await generateOne(d)
    }
    setGenerating(false)
  }

  // ── Bulk compliance check ─────────────────────────────────────────────
  const checkAllCompliance = async () => {
    const done = drawings.filter(d => d.status === 'done' && d.svg)
    if (done.length === 0) return
    setBulkChecking(true)
    setBulkReport(null)
    try {
      const reports: ComplianceReport[] = []
      for (const d of done) {
        const safeFig = d.figNum.replace(/[^A-Z0-9]/gi, '-')
        const file = new File(
          [new Blob([d.svg], { type: 'image/svg+xml' })],
          `${selectedPatent}-${safeFig}.svg`,
          { type: 'image/svg+xml' },
        )
        const report = await analyzeDrawing(file, { useVisionAI: false })
        reports.push(report)
      }
      const errors   = reports.reduce((n, r) => n + r.issues.filter(i => i.severity === 'error').length,   0)
      const warnings = reports.reduce((n, r) => n + r.issues.filter(i => i.severity === 'warning').length, 0)
      const info     = reports.reduce((n, r) => n + r.issues.filter(i => i.severity === 'info').length,    0)
      setBulkReport({ reports, errors, warnings, info })
    } finally {
      setBulkChecking(false)
    }
  }

  // ── Custom Drawing: AI generation ──────────────────────────────────────
  const generateCustomDiagram = async () => {
    if (!customDesc.trim()) return
    setGeneratingCustom(true)
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: `You are a patent drawing specialist for USPTO provisional applications.
Convert the user's description into valid Mermaid.js diagram code.
Use flowchart TD or graph TD syntax.
Style nodes with fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f for primary nodes.
Use fill:#fee2e2,stroke:#dc2626 for authorization/security nodes.
Use fill:#dcfce7,stroke:#15803d for data/output nodes.
Use fill:#fef3c7,stroke:#d97706 for decision/warning nodes.
Add component reference numbers (e.g., 100, 110, 200) in bold.
Keep labels concise.
Respond with ONLY the Mermaid code — no markdown fences, no explanation.`,
          user: customDesc,
          max_tokens: 1000,
        }),
      })
      const data = await res.json()
      const mermaidCode = (data.text || '').replace(/```mermaid|```/g, '').trim()
      setCustomMermaid(mermaidCode)
    } catch (e) {
      console.error('Claude diagram generation error:', e)
      setCustomMermaid('flowchart TD\n    A["Error generating diagram"] --> B["Try manual input"]')
    }
    setGeneratingCustom(false)
  }

  // ── Add custom drawing ─────────────────────────────────────────────────
  const addCustomDrawing = () => {
    if (!customMermaid.trim() || !customTitle.trim()) return
    const nextFigNum = drawings.length + 1
    const newDrawing: DrawingDef = {
      id: `custom-${Date.now()}`,
      figNum: `FIG. ${nextFigNum}`,
      title: customTitle.trim(),
      desc: customDesc.trim() || customTitle.trim(),
      mermaid: customMermaid.trim(),
    }
    // Save to localStorage
    const existing = loadCustomDrawings(selectedPatent)
    saveCustomDrawings(selectedPatent, [...existing, newDrawing])
    // Add to state
    setDrawings(prev => [...prev, { ...newDrawing, svg: '', status: 'pending', isCustom: true }])
    // Reset form
    setCustomDesc('')
    setCustomTitle('')
    setCustomMermaid('')
    setShowCustomPanel(false)
  }

  // ── Remove custom drawing ──────────────────────────────────────────────
  const removeCustomDrawing = (drawingId: string) => {
    const custom = loadCustomDrawings(selectedPatent).filter(d => d.id !== drawingId)
    saveCustomDrawings(selectedPatent, custom)
    setDrawings(prev => prev.filter(d => d.id !== drawingId))
  }

  // ── Voice event listeners ──────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (!detail?.type) return
      switch (detail.type) {
        case 'RENDER_DRAWINGS':
          generateAll()
          break
        case 'DOWNLOAD_DRAWING': {
          const figNum = detail.payload || ''
          const target = drawings.find(d =>
            d.figNum.replace(/\s/g, '') === figNum.replace(/\s/g, '') ||
            d.figNum === `FIG. ${figNum}` ||
            d.figNum === figNum
          )
          if (target && target.status === 'done') {
            downloadPDF(previewRefs.current[target.id], target.figNum, target.title, selectedPatent)
          }
          break
        }
        case 'ADD_CUSTOM_DRAWING':
          setShowCustomPanel(true)
          break
        case 'DOWNLOAD_ALL_DRAWINGS':
          drawings.filter(d => d.status === 'done').forEach(d => {
            downloadPDF(previewRefs.current[d.id], d.figNum, d.title, selectedPatent)
          })
          break
      }
    }
    window.addEventListener('voice-action', handler)
    return () => window.removeEventListener('voice-action', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawings, selectedPatent])

  const doneCount = drawings.filter(d => d.status === 'done').length
  const builtInCount = (PATENT_DRAWINGS[selectedPatent] || []).length

  return (
    <div className="space-y-4">
      <Card>
        <CardBody>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium text-slate-900 mb-1">Patent Drawings — Mermaid.js + PDF Export</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Professional USPTO-format drawings rendered by Mermaid.js at 300 DPI. Export as
                print-ready PDF (8.5x11" with correct margins) or SVG for Patent Center upload.
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0 items-center">
              {/* Patent selector */}
              <select
                value={selectedPatent}
                onChange={e => handlePatentChange(e.target.value)}
                className="text-sm border border-slate-200 rounded-md px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {patentIds.map(id => {
                  const count = (PATENT_DRAWINGS[id] || []).length
                  return (
                    <option key={id} value={id}>
                      {id} ({count} fig{count !== 1 ? 's' : ''})
                    </option>
                  )
                })}
              </select>
              <Button
                variant="primary" size="sm"
                onClick={generateAll}
                disabled={generating || doneCount === drawings.length || drawings.length === 0}
              >
                {generating ? 'Rendering...' : doneCount === drawings.length && drawings.length > 0 ? 'All ready' : `Render all ${drawings.length} figures`}
              </Button>
              {isEnabled('drawing_compliance_enabled') && doneCount > 0 && (
                <Button
                  size="sm"
                  onClick={checkAllCompliance}
                  disabled={bulkChecking}
                  title="Run 37 CFR 1.84 compliance check across all rendered figures"
                >
                  {bulkChecking ? 'Checking...' : `Check all (${doneCount})`}
                </Button>
              )}
            </div>
          </div>

          {bulkReport && (
            <Alert
              variant={
                bulkReport.errors   > 0 ? 'danger'  :
                bulkReport.warnings > 0 ? 'warning' :
                'success'
              }
              className="mt-3"
            >
              <strong>Compliance check:</strong>{' '}
              {bulkReport.errors > 0
                ? `${bulkReport.errors} error${bulkReport.errors === 1 ? '' : 's'}`
                : bulkReport.warnings > 0
                ? `${bulkReport.warnings} warning${bulkReport.warnings === 1 ? '' : 's'}`
                : `All ${bulkReport.reports.length} figures passed 37 CFR 1.84 deterministic checks`}
              {bulkReport.errors === 0 && bulkReport.warnings === 0 && (
                <span className="text-xs text-slate-500 block mt-1">
                  {bulkReport.info} passing check{bulkReport.info === 1 ? '' : 's'} recorded across all figures.
                  Safe to upload as informal provisional drawings.
                </span>
              )}
            </Alert>
          )}
          <div className="flex gap-4 mt-3 text-xs text-slate-500 flex-wrap">
            <span>Mermaid.js rendering engine</span>
            <span>300 DPI PNG/PDF export</span>
            <span>8.5x11" with USPTO margins</span>
            <span>Figure numbers per 37 C.F.R. 1.84</span>
            <span>SVG direct-upload to Patent Center</span>
          </div>
        </CardBody>
      </Card>

      <Alert variant="info">
        <strong>Provisional drawings tip:</strong> For your provisional application, informal drawings are fully acceptable. These Mermaid diagrams meet that standard. Formal drawings (exact line weights, hatching per 1.84) are only required for the nonprovisional filing due March 28, 2027.
      </Alert>

      {drawings.length === 0 && (
        <Card>
          <CardBody>
            <div className="text-center py-8">
              <p className="text-slate-500 mb-2">No drawings defined for {selectedPatent}</p>
              <p className="text-sm text-slate-400 mb-4">Add custom drawings below, or select a patent with existing figures.</p>
              <Button size="sm" variant="primary" onClick={() => setShowCustomPanel(true)}>
                Add Custom Drawing
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {drawings.map(drawing => (
        <Card key={drawing.id}>
          <CardHeader
            title={
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-slate-400 w-12 flex-shrink-0">{drawing.figNum}</span>
                <span className="text-sm">{drawing.title}</span>
                {drawing.isCustom && <Badge variant="info">Custom</Badge>}
              </div>
            }
            right={
              <div className="flex items-center gap-2">
                <Badge variant={
                  drawing.status === 'done' ? 'success' :
                  drawing.status === 'generating' ? 'info' :
                  drawing.status === 'error' ? 'danger' : 'neutral'
                }>
                  {drawing.status === 'generating' ? 'Rendering...' :
                   drawing.status === 'done' ? 'Ready' :
                   drawing.status === 'error' ? 'Error' : 'Pending'}
                </Badge>
                {drawing.status === 'done' && (
                  <>
                    <Button size="sm" onClick={() => downloadSVG(drawing.svg, drawing.figNum, selectedPatent)}>SVG</Button>
                    <Button size="sm" variant="primary" onClick={() => downloadPDF(previewRefs.current[drawing.id], drawing.figNum, drawing.title, selectedPatent)}>PDF</Button>
                  </>
                )}
                {drawing.status !== 'done' && drawing.status !== 'generating' && (
                  <Button size="sm" variant="primary" onClick={() => generateOne(drawing)} disabled={generating}>
                    Render
                  </Button>
                )}
                {drawing.status === 'error' && (
                  <Button size="sm" onClick={() => generateOne(drawing)}>Retry</Button>
                )}
                {drawing.isCustom && (
                  <Button size="sm" onClick={() => removeCustomDrawing(drawing.id)}>Remove</Button>
                )}
              </div>
            }
          />
          <CardBody>
            <p className="text-xs text-slate-400 mb-3">{drawing.desc}</p>

            {drawing.status === 'generating' && (
              <div className="h-40 bg-slate-50 border border-slate-200 rounded flex items-center justify-center">
                <div className="text-center">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Rendering {drawing.figNum} with Mermaid.js...</p>
                </div>
              </div>
            )}

            {drawing.status === 'done' && (
              <div className="border border-slate-200 rounded overflow-hidden bg-white">
                <div
                  ref={el => { previewRefs.current[drawing.id] = el }}
                  className="w-full overflow-auto p-2"
                  style={{ maxHeight: 420 }}
                />
                <div className="border-t border-slate-100 px-3 py-2 bg-slate-50 flex items-center justify-between relative">
                  <span className="text-xs text-slate-400 font-mono">{drawing.figNum} — {drawing.title}</span>
                  <div className="flex gap-2 items-center">
                    {isEnabled('drawing_compliance_enabled') && (
                      <InlineComplianceCheck
                        svg={drawing.svg}
                        patentId={selectedPatent}
                        figNum={drawing.figNum}
                      />
                    )}
                    <Button size="sm" onClick={() => downloadSVG(drawing.svg, drawing.figNum, selectedPatent)}>SVG</Button>
                    <Button size="sm" variant="primary" onClick={() => downloadPDF(previewRefs.current[drawing.id], drawing.figNum, drawing.title, selectedPatent)}>PDF (300 DPI)</Button>
                  </div>
                </div>
              </div>
            )}

            {drawing.status === 'error' && (
              <Alert variant="danger">Rendering failed. Check browser console for details. Click Retry.</Alert>
            )}

            {drawing.status === 'pending' && (
              <div className="h-20 bg-slate-50 border border-dashed border-slate-200 rounded flex items-center justify-center">
                <p className="text-xs text-slate-400">Click "Render" to generate this figure</p>
              </div>
            )}
          </CardBody>
        </Card>
      ))}

      {/* ── Custom Drawing Input ────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Add Custom Drawing"
          right={
            <Button size="sm" onClick={() => setShowCustomPanel(!showCustomPanel)}>
              {showCustomPanel ? 'Close' : 'Add Drawing'}
            </Button>
          }
        />
        {showCustomPanel && (
          <CardBody>
            <div className="space-y-4">
              {/* AI-powered generation */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Drawing Title *</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  placeholder="e.g., Authentication Flow Diagram"
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Describe the drawing (AI will generate Mermaid code)
                </label>
                <textarea
                  value={customDesc}
                  onChange={e => setCustomDesc(e.target.value)}
                  placeholder="Describe the system architecture, data flow, or process you want to illustrate. Include component names and reference numbers if applicable."
                  rows={3}
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm" variant="primary"
                    onClick={generateCustomDiagram}
                    disabled={!customDesc.trim() || generatingCustom}
                  >
                    {generatingCustom ? 'Generating...' : 'Generate Diagram with AI'}
                  </Button>
                  <button
                    onClick={() => setShowManualInput(!showManualInput)}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    {showManualInput ? 'Hide manual input' : 'Or enter Mermaid code directly'}
                  </button>
                </div>
              </div>

              {/* Manual Mermaid input */}
              {showManualInput && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Mermaid Code</label>
                  <textarea
                    value={customMermaid}
                    onChange={e => setCustomMermaid(e.target.value)}
                    placeholder={`flowchart TD\n    A["Component 100"] --> B["Component 200"]\n    B --> C["Component 300"]`}
                    rows={6}
                    className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  />
                </div>
              )}

              {/* Generated Mermaid preview */}
              {customMermaid && !showManualInput && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Generated Mermaid Code (edit if needed)
                  </label>
                  <textarea
                    value={customMermaid}
                    onChange={e => setCustomMermaid(e.target.value)}
                    rows={6}
                    className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  />
                </div>
              )}

              {/* Add button */}
              {customMermaid && (
                <div className="flex gap-2">
                  <Button
                    size="sm" variant="primary"
                    onClick={addCustomDrawing}
                    disabled={!customTitle.trim() || !customMermaid.trim()}
                  >
                    Add as FIG. {drawings.length + 1}
                  </Button>
                  <span className="text-xs text-slate-400 self-center">
                    Custom drawings are saved to your browser and persist across sessions.
                  </span>
                </div>
              )}
            </div>
          </CardBody>
        )}
      </Card>

      <Card>
        <CardHeader title="How to include drawings in your Patent Center filing" />
        <CardBody>
          <div className="space-y-2 text-sm text-slate-700">
            {[
              ['1', `Click "Render all ${drawings.length} figures" above to generate all drawings`],
              ['2', 'Click "PDF" for each figure — saves a print-ready 8.5x11" PDF at 300 DPI'],
              ['3', 'In Patent Center, during document upload: add each PDF with document type "Drawings"'],
              ['4', 'Alternatively, click "SVG" to download the vector file — also accepted by Patent Center'],
              ['5', 'Verify reference numerals in drawings (110, 120, etc.) match your specification text'],
            ].map(([n, t]) => (
              <div key={n} className="flex gap-3">
                <span className="font-medium text-blue-700 w-4 flex-shrink-0">{n}.</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
          {builtInCount > 0 && (
            <div className="mt-3 text-xs text-slate-400">
              {selectedPatent} has {builtInCount} built-in figure{builtInCount !== 1 ? 's' : ''}{drawings.length > builtInCount ? ` + ${drawings.length - builtInCount} custom` : ''}.
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
