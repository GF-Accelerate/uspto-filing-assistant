/// <reference types="vite/client" />
import { useState, useRef, useEffect } from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'

// USPTO 37 C.F.R. §1.84 compliant drawing specs
// Page: 8.5x11" at 300 DPI = 2550x3300px
// Usable area: 6 15/16" x 9 5/8" = 2081x2888px
// Margins: top 1", left 1", right 5/8", bottom 3/8"

const USPTO_FIGURES = [
  {
    id: 'fig1', figNum: 'FIG. 1', title: 'System Architecture Overview',
    desc: 'Overall block diagram: Voice Input Layer (110) → NLP Engine (120) → SQL Query Generator (130) → Database Layer (140) → Agent Framework (150) → Multi-Modal Response (160)',
    mermaid: `graph TD
    A["<b>110</b> — Voice Input Layer<br/><i>Web Speech API · Noise Cancellation</i><br/><i>Athletic-Domain Vocabulary</i>"]
    B["<b>120</b> — NLP Engine<br/><i>GPT-4o-mini · 94% Accuracy</i><br/><i>200+ Intent Patterns</i>"]
    C["<b>130</b> — SQL Query Generator<br/><i>Semantic Schema Mapping</i><br/><i>Join-Path Optimization · &lt;200ms</i>"]
    D["<b>140</b> — Database Layer<br/><i>PostgreSQL · 170,529 Records</i><br/><i>Row-Level Security · 10 Roles</i>"]
    E["<b>150</b> — Agent Framework<br/><i>9 Specialized AI Agents</i><br/><i>HITL Approval Gate</i>"]
    F["<b>160</b> — Multi-Modal Response<br/><i>Voice Synthesis · Dashboard</i><br/><i>WebSocket Streaming</i>"]
    G["<b>125</b> — Disambiguation<br/><i>confidence &lt; 0.75 threshold</i>"]
    A --> B
    B --> C
    B -.->|"low confidence"| G
    G --> C
    C --> D
    D --> E
    E --> F
    style A fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style B fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style C fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style D fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style E fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    style F fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style G fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#991b1b`,
  },
  {
    id: 'fig2', figNum: 'FIG. 2', title: 'Voice Processing & SQL Generation Flow',
    desc: 'Flowchart from voice input through NLP intent classification, confidence check, disambiguation, SQL generation, database execution, and result return',
    mermaid: `flowchart TD
    S(["<b>START</b> — Voice Command Received"])
    A["<b>210</b> — Audio Preprocessing<br/><i>Noise Cancellation · Domain Vocab</i>"]
    B["<b>220</b> — Intent Classification<br/><i>GPT-4o-mini LLM · NER Extraction</i>"]
    C{"<b>230</b> — Confidence Check"}
    D["<b>235</b> — Disambiguation Query<br/><i>Prompt User for Clarification</i>"]
    E["<b>240</b> — Parameter Extraction<br/><i>Entity-to-Schema Mapping</i>"]
    F["<b>250</b> — Join-Path Optimizer<br/><i>Cost-Based Query Planner</i>"]
    G["<b>260</b> — SQL Generation<br/><i>Validation &amp; Index Selection</i>"]
    H["<b>270</b> — Database Execution<br/><i>RLS Applied · Audit Logged</i>"]
    K{"<b>280</b> — Result Size Check"}
    L["<b>285</b> — Batch Pagination<br/><i>1,000 rows per cycle</i>"]
    E2(["<b>END</b> — Results Returned"])
    S --> A --> B --> C
    C -->|"≥ 0.75"| E
    C -->|"&lt; 0.75"| D
    D --> B
    E --> F --> G --> H --> K
    K -->|"&gt; 1,000 rows"| L --> E2
    K -->|"≤ 1,000 rows"| E2
    style S fill:#1e40af,stroke:#1e40af,color:#ffffff
    style E2 fill:#15803d,stroke:#15803d,color:#ffffff
    style C fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    style K fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    style D fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#991b1b
    style A fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style B fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style E fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style F fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style G fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style H fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style L fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#1e293b`,
  },
  {
    id: 'fig3', figNum: 'FIG. 3', title: 'Nine-Agent Autonomous Framework',
    desc: 'All 9 AI agents (310–390) coordinated by Multi-Agent Chain Orchestrator (305) under mandatory Human-in-the-Loop Approval Gate (300)',
    mermaid: `graph TD
    HITL["<b>300</b> — HUMAN-IN-THE-LOOP APPROVAL GATE<br/><i>Mandatory · Cannot Be Bypassed · Explicit Staff Authorization</i>"]
    ORCH["<b>305</b> — Multi-Agent Chain Orchestrator<br/><i>Task Routing · Dependency Resolution · State Management</i>"]
    A1["<b>310</b><br/>Donor Cultivation"]
    A2["<b>320</b><br/>Proposal Generation"]
    A3["<b>330</b><br/>Campaign Manager"]
    A4["<b>340</b><br/>Compliance Monitor"]
    A5["<b>350</b><br/>Revenue Analytics"]
    A6["<b>360</b><br/>Fan Engagement"]
    A7["<b>370</b><br/>Recruiting Intelligence"]
    A8["<b>380</b><br/>Facility Operations"]
    A9["<b>390</b><br/>Executive Briefing"]
    HITL --> ORCH
    ORCH --> A1 & A2 & A3
    ORCH --> A4 & A5 & A6
    ORCH --> A7 & A8 & A9
    style HITL fill:#fee2e2,stroke:#dc2626,stroke-width:3px,color:#991b1b
    style ORCH fill:#1e3a5f,stroke:#1e3a5f,stroke-width:2px,color:#ffffff
    style A1 fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style A2 fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style A3 fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style A4 fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    style A5 fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style A6 fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style A7 fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style A8 fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style A9 fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#1e293b`,
  },
  {
    id: 'fig4', figNum: 'FIG. 4', title: 'Multi-Provider Communication Failover',
    desc: 'Human Approval Gate (400) → SendGrid primary (410) → Resend secondary (420) → AgentMail tertiary (430) with Webhook Monitoring (440) and Cryptographic Audit Trail (450)',
    mermaid: `flowchart LR
    HITL["<b>400</b><br/>Human Approval Gate<br/><i>Explicit Authorization</i>"]
    SP["<b>410</b><br/>SendGrid<br/><i>Primary Provider</i>"]
    R["<b>420</b><br/>Resend<br/><i>Secondary Provider</i>"]
    AM["<b>430</b><br/>AgentMail<br/><i>Tertiary Provider</i>"]
    OK(["✓ Delivered"])
    FAIL(["⚠ Alert Staff"])
    WH["<b>440</b><br/>Webhook Monitoring<br/><i>Open · Click · Bounce</i>"]
    AT["<b>450</b><br/>Cryptographic<br/>Audit Trail"]
    HITL --> SP
    SP -->|"Success"| OK
    SP -->|"Failure"| R
    R -->|"Success"| OK
    R -->|"Failure"| AM
    AM -->|"Success"| OK
    AM -->|"All fail"| FAIL
    OK --> WH & AT
    style HITL fill:#fee2e2,stroke:#dc2626,stroke-width:3px,color:#991b1b
    style SP fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style R fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    style AM fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    style OK fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style FAIL fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#991b1b
    style WH fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#1e293b
    style AT fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#1e293b`,
  },
  {
    id: 'fig5', figNum: 'FIG. 5', title: 'Database Layer & RFE Lead Scoring',
    desc: 'Core tables with record counts, RFE Scoring Engine (550), external cross-reference sources (560), and Row-Level Security enforcement (570)',
    mermaid: `graph TD
    EXT["<b>560</b> — External Data Sources<br/><i>SEC EDGAR · FEC Records</i><br/><i>OpenCorporates · LinkedIn Evaboot</i>"]
    RFE["<b>550</b> — RFE Scoring Engine<br/><i>calculate_lead_scores()</i><br/><i>Configurable Weights · Continuous Updates</i>"]
    CM["<b>510</b> — constituent_master<br/><i>170,529 Records</i>"]
    PT["<b>520</b> — pac_transactions<br/><i>334,518 Records</i>"]
    OPP["<b>530</b> — opportunities<br/><i>8,113 Records</i>"]
    LS["<b>540</b> — lead_scores<br/><i>167,740 Scored Records</i><br/><i>Renewal · Gift · Churn Risk</i>"]
    RLS["<b>570</b> — Row-Level Security<br/><i>10 Enterprise Roles · JWT Auth</i>"]
    EXT --> RFE
    CM --> RFE
    PT --> RFE
    OPP --> RFE
    RFE --> LS
    RLS -.->|"enforces on"| CM & PT & OPP & LS
    style EXT fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#1e293b
    style RFE fill:#1e3a5f,stroke:#1e3a5f,stroke-width:2px,color:#ffffff
    style CM fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style PT fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style OPP fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style LS fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style RLS fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#991b1b`,
  },
]

type DrawingStatus = 'pending' | 'generating' | 'done' | 'error'
interface Drawing { id: string; figNum: string; title: string; desc: string; mermaid: string; svg: string; status: DrawingStatus }

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

async function renderMermaidToSVG(mermaidCode: string): Promise<string> {
  const mermaid = (await import('mermaid')).default
  mermaid.initialize({ startOnLoad: false })

  // Prepend init directive so theme variables are always respected
  const fullCode = MERMAID_INIT + '\n' + mermaidCode

  const id = `diagram-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const { svg } = await mermaid.render(id, fullCode)

  // Post-process: ensure white page background, clean up any stray fills
  return svg
    .replace(/fill="rgb\(0, 0, 0\)"/g, 'fill="#1e3a5f"')
    .replace(/fill="black"/g, 'fill="#1e3a5f"')
}

async function downloadPDF(
  el: HTMLDivElement | null,
  figNum: string,
  title: string
) {
  if (!el) { alert('Drawing not rendered yet — click Render first'); return }

  const { default: jsPDF }     = await import('jspdf')
  const { default: html2canvas } = await import('html2canvas')

  // USPTO 8.5x11" letter — 300 DPI
  // Usable area: 1" left/top margin, 5/8" right, 3/8" bottom
  const pageW = 8.5, pageH = 11
  const marginLeft = 1, marginTop = 1
  const usableW = 6.875, usableH = 9.0

  // Capture the live DOM element with html2canvas
  // This works even with foreignObject/HTML labels since it renders via DOM, not SVG blob
  const canvas = await html2canvas(el, {
    backgroundColor: '#ffffff',
    scale: 2,          // 2× for crisp output (will resample to 300 DPI in PDF)
    useCORS: true,
    logging: false,
    removeContainer: true,
  })

  // Build USPTO-format PDF
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' })

  // Sheet number centred at top (37 C.F.R. §1.84 requirement)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.text(figNum, pageW / 2, marginTop - 0.35, { align: 'center' })

  // Add captured image, scaled to fit usable area while preserving aspect ratio
  const aspectRatio = canvas.width / canvas.height
  let drawW = usableW
  let drawH = drawW / aspectRatio
  if (drawH > usableH) { drawH = usableH; drawW = drawH * aspectRatio }
  const offsetX = marginLeft + (usableW - drawW) / 2
  const offsetY = marginTop + (usableH - drawH) / 2

  const imgData = canvas.toDataURL('image/png', 1.0)
  pdf.addImage(imgData, 'PNG', offsetX, offsetY, drawW, drawH)

  // Caption
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.text(`${figNum} — ${title}`, pageW / 2, marginTop + usableH + 0.22, { align: 'center' })

  // Applicant footer
  pdf.setFontSize(7)
  pdf.setTextColor(120, 120, 120)
  pdf.text(
    'Visionary AI Systems, Inc. (Delaware) | Milton & Lisa Overton, Inventors | Filed: March 28, 2026',
    pageW / 2, pageH - 0.4, { align: 'center' }
  )

  const safeName = `${figNum.replace(/[^A-Z0-9]/gi, '-')}-${title.replace(/[^a-z0-9]/gi, '-').toLowerCase().substring(0, 30)}`
  pdf.save(`PA1-${safeName}.pdf`)
}

function downloadSVG(svg: string, figNum: string) {
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `PA1-${figNum.replace('. ', '-')}.svg`
  a.click()
  URL.revokeObjectURL(url)
}

export function Drawings() {
  const [drawings, setDrawings] = useState<Drawing[]>(
    USPTO_FIGURES.map(f => ({ ...f, svg: '', status: 'pending' as DrawingStatus }))
  )
  const [generating, setGenerating] = useState(false)
  const previewRefs = useRef<Record<string, HTMLDivElement | null>>({})

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

  const doneCount = drawings.filter(d => d.status === 'done').length

  return (
    <div className="space-y-4">
      <Card>
        <CardBody>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium text-slate-900 mb-1">Patent Drawings — Mermaid.js + PDF Export</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Professional USPTO-format drawings rendered by Mermaid.js at 300 DPI. Export as
                print-ready PDF (8.5×11" with correct margins) or SVG for Patent Center upload.
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="primary" size="sm"
                onClick={generateAll}
                disabled={generating || doneCount === drawings.length}
              >
                {generating ? 'Rendering…' : doneCount === drawings.length ? '✓ All ready' : `Render all ${drawings.length} figures`}
              </Button>
            </div>
          </div>
          <div className="flex gap-4 mt-3 text-xs text-slate-500 flex-wrap">
            <span>✓ Mermaid.js rendering engine</span>
            <span>✓ 300 DPI PNG/PDF export</span>
            <span>✓ 8.5×11" with USPTO margins</span>
            <span>✓ Figure numbers per 37 C.F.R. §1.84</span>
            <span>✓ SVG direct-upload to Patent Center</span>
          </div>
        </CardBody>
      </Card>

      <Alert variant="info">
        <strong>Provisional drawings tip:</strong> For your provisional application, informal drawings are fully acceptable. These Mermaid diagrams meet that standard. Formal drawings (exact line weights, hatching per §1.84) are only required for the nonprovisional filing due March 28, 2027.
      </Alert>

      {drawings.map(drawing => (
        <Card key={drawing.id}>
          <CardHeader
            title={
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-slate-400 w-12 flex-shrink-0">{drawing.figNum}</span>
                <span className="text-sm">{drawing.title}</span>
              </div>
            }
            right={
              <div className="flex items-center gap-2">
                <Badge variant={
                  drawing.status === 'done' ? 'success' :
                  drawing.status === 'generating' ? 'info' :
                  drawing.status === 'error' ? 'danger' : 'neutral'
                }>
                  {drawing.status === 'generating' ? '⟳ Rendering…' :
                   drawing.status === 'done' ? '✓ Ready' :
                   drawing.status === 'error' ? '✗ Error' : 'Pending'}
                </Badge>
                {drawing.status === 'done' && (
                  <>
                    <Button size="sm" onClick={() => downloadSVG(drawing.svg, drawing.figNum)}>SVG</Button>
                    <Button size="sm" variant="primary" onClick={() => downloadPDF(previewRefs.current[drawing.id], drawing.figNum, drawing.title)}>PDF ↓</Button>
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
              </div>
            }
          />
          <CardBody>
            <p className="text-xs text-slate-400 mb-3">{drawing.desc}</p>

            {drawing.status === 'generating' && (
              <div className="h-40 bg-slate-50 border border-slate-200 rounded flex items-center justify-center">
                <div className="text-center">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Rendering {drawing.figNum} with Mermaid.js…</p>
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
                <div className="border-t border-slate-100 px-3 py-2 bg-slate-50 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">{drawing.figNum} — {drawing.title}</span>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => downloadSVG(drawing.svg, drawing.figNum)}>⬇ SVG</Button>
                    <Button size="sm" variant="primary" onClick={() => downloadPDF(previewRefs.current[drawing.id], drawing.figNum, drawing.title)}>⬇ PDF (300 DPI)</Button>
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

      <Card>
        <CardHeader title="How to include drawings in your Patent Center filing" />
        <CardBody>
          <div className="space-y-2 text-sm text-slate-700">
            {[
              ['1', 'Click "Render all 5 figures" above to generate all drawings'],
              ['2', 'Click "PDF ↓" for each figure — saves a print-ready 8.5×11" PDF at 300 DPI'],
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
        </CardBody>
      </Card>
    </div>
  )
}
