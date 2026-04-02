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
    A["110\\nVoice Input Layer\\nWeb Speech API + Noise Cancellation"] --> B["120\\nNLP Engine\\nGPT-4o-mini · 94% Accuracy\\n200+ Intent Patterns"]
    B --> C["130\\nSQL Query Generator\\nSemantic Mapping + Optimization\\nSub-200ms Latency"]
    C --> D["140\\nDatabase Layer\\nSupabase PostgreSQL\\n170,529 Constituent Records"]
    D --> E["150\\nAgent Framework\\n9 Specialized AI Agents\\nHITL Approval Gate"]
    E --> F["160\\nMulti-Modal Response\\nVoice Synthesis + Dashboard\\nWebSocket Streaming"]
    B -.->|"confidence < 0.75"| G["125\\nDisambiguation\\nModule"]
    G --> C`,
  },
  {
    id: 'fig2', figNum: 'FIG. 2', title: 'Voice Processing & SQL Generation Flow',
    desc: 'Flowchart from speech input through NLP, intent classification, disambiguation, SQL generation, execution, and result return',
    mermaid: `flowchart TD
    A(["START\\nVoice Command Received"]) --> B["210\\nAudio Preprocessing\\nNoise Cancellation + Domain Vocab"]
    B --> C["220\\nIntent Classification\\nGPT-4o-mini LLM"]
    C --> D{"230\\nConfidence\\nCheck"}
    D -->|"≥ 0.75"| E["240\\nParameter Extraction\\nNamed Entity Recognition"]
    D -->|"< 0.75"| F["235\\nDisambiguation Query\\nUser Prompt"]
    F --> C
    E --> G["250\\nSchema Mapping\\nSemantic Entity → Table"]
    G --> H["260\\nJoin Path Optimization\\nCost-Based Query Planner"]
    H --> I["270\\nSQL Generation\\n& Validation"]
    I --> J["280\\nDatabase Execution\\nRow-Level Security Applied"]
    J --> K{"290\\nResult Size Check"}
    K -->|"> 1000 rows"| L["295\\nBatch Pagination"]
    K -->|"≤ 1000 rows"| M(["END\\nReturn Results"])
    L --> M`,
  },
  {
    id: 'fig3', figNum: 'FIG. 3', title: 'Nine-Agent Autonomous Framework',
    desc: 'All 9 specialized agents with HITL approval gate (300) and Multi-Agent Chain Orchestrator (305)',
    mermaid: `graph TD
    HITL["300\\nHuman-in-the-Loop\\nApproval Gate\\n⚠ MANDATORY — Cannot be bypassed"] --> ORCH
    ORCH["305\\nMulti-Agent Chain\\nOrchestrator"]
    ORCH --> A1["310\\nDonor Cultivation\\nAgent"]
    ORCH --> A2["320\\nProposal Generation\\nAgent"]
    ORCH --> A3["330\\nCampaign Manager\\nAgent"]
    ORCH --> A4["340\\nCompliance Monitor\\nAgent"]
    ORCH --> A5["350\\nRevenue Analytics\\nAgent"]
    ORCH --> A6["360\\nFan Engagement\\nAgent"]
    ORCH --> A7["370\\nRecruiting Intelligence\\nAgent"]
    ORCH --> A8["380\\nFacility Operations\\nAgent"]
    ORCH --> A9["390\\nExecutive Briefing\\nAgent"]`,
  },
  {
    id: 'fig4', figNum: 'FIG. 4', title: 'Multi-Provider Communication Failover',
    desc: 'Primary SendGrid (410) → Resend (420) → AgentMail (430) with HITL gate, webhook monitoring, and audit trail',
    mermaid: `flowchart LR
    HITL["400\\nHuman Approval Gate\\nRequired Before Dispatch"] --> SP
    SP["410\\nSendGrid\\nPrimary Provider"] -->|"Delivery Success"| SUCCESS(["✓ Delivered"])
    SP -->|"Failure / Timeout"| R["420\\nResend\\nSecondary Provider"]
    R -->|"Delivery Success"| SUCCESS
    R -->|"Failure / Timeout"| AM["430\\nAgentMail\\nTertiary Provider"]
    AM -->|"Delivery Success"| SUCCESS
    AM -->|"All Providers Failed"| FAIL(["⚠ Alert Staff"])
    SUCCESS --> WH["440\\nWebhook Monitoring\\nOpen / Click / Bounce Tracking"]
    SUCCESS --> AT["450\\nCryptographic\\nAudit Trail"]`,
  },
  {
    id: 'fig5', figNum: 'FIG. 5', title: 'Database Layer & RFE Lead Scoring',
    desc: 'Core tables with record counts, RFE scoring engine (550), and external data cross-reference (560)',
    mermaid: `graph TD
    RFE["550\\nRFE Scoring Engine\\ncalculate_lead_scores()\\nRecency + Frequency + Engagement"] --> LS
    EXT["560\\nExternal Data\\nSEC EDGAR · FEC · OpenCorporates\\nLinkedIn Evaboot API"] --> RFE
    CM["510\\nconstituent_master\\n170,529 Records\\nName · Address · Contact · History"] --> RFE
    PT["520\\npac_transactions\\n334,518 Records\\nGift Amount · Date · Campaign"] --> RFE
    OPP["530\\nopportunities\\n8,113 Records\\nStage · Amount · Probability"] --> RFE
    LS["540\\nlead_scores\\n167,740 Scored Records\\nRenewal Risk · Gift Readiness\\nUpgrade Potential · Churn Risk"]
    RLS["570\\nRow-Level Security\\n10 Enterprise Roles\\nData Isolation Per User"] -.-> CM & PT & OPP & LS`,
  },
]

type DrawingStatus = 'pending' | 'generating' | 'done' | 'error'
interface Drawing { id: string; figNum: string; title: string; desc: string; mermaid: string; svg: string; status: DrawingStatus }

async function renderMermaidToSVG(mermaidCode: string): Promise<string> {
  const mermaid = (await import('mermaid')).default
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
      primaryColor: '#ffffff',
      primaryBorderColor: '#000000',
      primaryTextColor: '#000000',
      lineColor: '#000000',
      secondaryColor: '#f8fafc',
      tertiaryColor: '#f1f5f9',
      background: '#ffffff',
      mainBkg: '#ffffff',
      nodeBorder: '#000000',
      clusterBkg: '#f8fafc',
      titleColor: '#000000',
      edgeLabelBackground: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
    },
  })
  const id = `diagram-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const { svg } = await mermaid.render(id, mermaidCode)
  // Ensure white background + black strokes
  return svg
    .replace(/fill="none"/g, 'fill="white"')
    .replace(/background[^"]*"/g, 'background:white"')
}

async function downloadPDF(svg: string, figNum: string, title: string) {
  const { default: jsPDF } = await import('jspdf')

  // Create 8.5x11" PDF
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' })

  // USPTO margins: 1" top, 1" left, 5/8" right, 3/8" bottom
  // Usable: 6.875" wide x 9.625" tall
  const marginLeft = 1, marginTop = 1
  const usableW = 6.875, usableH = 9.0

  // Figure number centered at top (USPTO requirement)
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'bold')
  pdf.text(figNum, 8.5 / 2, marginTop - 0.3, { align: 'center' })

  // Render SVG into canvas via img element
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)

  await new Promise<void>((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(usableW * 300)   // 300 DPI
      canvas.height = Math.round(usableH * 300)
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      // Scale to fit
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height)
      const drawW = img.width * scale
      const drawH = img.height * scale
      const dx = (canvas.width - drawW) / 2
      const dy = (canvas.height - drawH) / 2
      ctx.drawImage(img, dx, dy, drawW, drawH)
      const imgData = canvas.toDataURL('image/png', 1.0)
      pdf.addImage(imgData, 'PNG', marginLeft, marginTop, usableW, usableH)
      // Caption at bottom
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`${figNum} — ${title}`, 8.5 / 2, marginTop + usableH + 0.2, { align: 'center' })
      resolve()
    }
    img.onerror = reject
    img.src = url
  })

  URL.revokeObjectURL(url)
  pdf.save(`PA1-${figNum.replace('. ', '-')}-${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`)
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
                    <Button size="sm" variant="primary" onClick={() => downloadPDF(drawing.svg, drawing.figNum, drawing.title)}>PDF ↓</Button>
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
                    <Button size="sm" variant="primary" onClick={() => downloadPDF(drawing.svg, drawing.figNum, drawing.title)}>⬇ PDF (300 DPI)</Button>
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
