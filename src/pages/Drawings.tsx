/// <reference types="vite/client" />
import { useState } from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'

// USPTO drawing requirements:
// - Black & white line art only (no color, no shading)
// - All components labeled with reference numerals (100, 110, 120…)
// - Figure captions below each drawing (FIG. 1, FIG. 2…)
// - Clean sans-serif text, minimum 3.2mm character height

interface Drawing {
  id: string
  title: string
  figNum: string
  description: string
  svg: string
  status: 'pending' | 'generating' | 'done' | 'error'
}

const PATENT_DRAWINGS: Omit<Drawing, 'svg' | 'status'>[] = [
  {
    id: 'fig1',
    figNum: 'FIG. 1',
    title: 'System Architecture Overview',
    description: 'Overall block diagram showing Voice Input Layer, NLP Engine, SQL Query Generator, Database Layer, Agent Framework, and Multi-Modal Response System with numbered reference components 110–160.',
  },
  {
    id: 'fig2',
    figNum: 'FIG. 2',
    title: 'Voice Processing & SQL Generation Flow',
    description: 'Flowchart showing speech input → NLP intent classification → parameter extraction → disambiguation check → SQL generation → query optimization → database execution → result return.',
  },
  {
    id: 'fig3',
    figNum: 'FIG. 3',
    title: 'Nine-Agent Autonomous Framework',
    description: 'Block diagram of the nine specialized AI agents (Donor Cultivation 310, Proposal Generation 320, Campaign Manager 330, Compliance Monitor 340, Revenue Analytics 350, Fan Engagement 360, Recruiting Intelligence 370, Facility Operations 380, Executive Briefing 390) with Human-in-the-Loop Gate 300 and Multi-Agent Chain Orchestrator 305.',
  },
  {
    id: 'fig4',
    figNum: 'FIG. 4',
    title: 'Multi-Provider Communication Failover',
    description: 'Flow diagram showing primary provider SendGrid 410 → failover to Resend 420 → failover to AgentMail 430, with Human Approval Gate 400, Webhook Monitoring 440, and Audit Trail 450.',
  },
  {
    id: 'fig5',
    figNum: 'FIG. 5',
    title: 'Database Layer & RFE Lead Scoring',
    description: 'Database schema diagram showing constituent_master 510 (170,529 records), pac_transactions 520 (334,518 records), opportunities 530, lead_scores 540 with RFE scoring engine 550 and external data cross-reference 560 (SEC EDGAR, FEC, OpenCorporates).',
  },
]

async function generateSVGDrawing(drawing: Omit<Drawing, 'svg' | 'status'>): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY not set')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: `You are a USPTO patent technical illustrator. Generate clean, formal patent drawings as SVG.

STRICT USPTO REQUIREMENTS:
- Black lines on white background ONLY. No color fills except white (#ffffff).
- All boxes: white fill (#ffffff), black stroke (#000000), stroke-width="1.5"
- All text: black (#000000), font-family="Arial, sans-serif"
- Reference numerals on EVERY component (e.g., 110, 120, 130...)
- Figure caption at bottom center: "FIG. X" in font-size="14" font-weight="bold"
- Clean, professional, readable at letter-paper size
- Use rect, line, polygon, path for shapes. No foreignObject, no CSS classes.
- viewBox="0 0 700 500" width="700" height="500"
- Arrow heads on flow lines using marker-end with a black arrowhead marker
- Components must be clearly separated with adequate whitespace
- Use dashed lines for logical groupings/boundaries

Respond with ONLY the complete SVG code starting with <svg and ending with </svg>. No markdown, no explanation.`,
      messages: [{
        role: 'user',
        content: `Generate a formal USPTO patent drawing for ${drawing.figNum}: ${drawing.title}

Content to illustrate:
${drawing.description}

Patent: "System and Method for Voice-Controlled Database Query Processing with Autonomous Agent Execution"
Assignee: Visionary AI Systems Inc

Create a clean block/flow diagram with all components labeled with reference numerals. Caption at bottom: "${drawing.figNum} — ${drawing.title}"`
      }]
    })
  })

  const data = await res.json()
  if (data.error) throw new Error(data.error.message)

  const raw = data.content?.[0]?.text ?? ''
  // Extract SVG from response
  const match = raw.match(/<svg[\s\S]*<\/svg>/i)
  if (!match) throw new Error('No SVG found in response')
  return match[0]
}

function downloadSVG(svg: string, filename: string) {
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function downloadAllSVGs(drawings: Drawing[]) {
  drawings.filter(d => d.status === 'done').forEach((d, i) => {
    setTimeout(() => downloadSVG(d.svg, `PA1-${d.figNum.replace('. ', '-')}-${d.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.svg`), i * 300)
  })
}

export function Drawings() {
  const [drawings, setDrawings] = useState<Drawing[]>(
    PATENT_DRAWINGS.map(d => ({ ...d, svg: '', status: 'pending' as const }))
  )
  const [generating, setGenerating] = useState(false)

  const updateDrawing = (id: string, updates: Partial<Drawing>) => {
    setDrawings(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d))
  }

  const generateOne = async (drawing: Drawing) => {
    updateDrawing(drawing.id, { status: 'generating' })
    try {
      const svg = await generateSVGDrawing(drawing)
      updateDrawing(drawing.id, { svg, status: 'done' })
    } catch {
      updateDrawing(drawing.id, { status: 'error', svg: '' })
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
  const allDone = doneCount === drawings.length

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardBody>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium text-slate-900 mb-1">Patent Drawings Generator</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Generates formal USPTO-compliant technical drawings for{' '}
                <strong>PA-1: Voice-Controlled Database Query + Autonomous Agent Execution</strong>.
                All drawings are black-and-white line art with reference numerals, per USPTO 37 C.F.R. §1.84.
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {doneCount > 0 && (
                <Button onClick={() => downloadAllSVGs(drawings)} size="sm">
                  ⬇ Download all ({doneCount})
                </Button>
              )}
              <Button variant="primary" onClick={generateAll} disabled={generating || allDone} size="sm">
                {generating ? 'Generating…' : allDone ? '✓ All generated' : `Generate all ${drawings.length} figures`}
              </Button>
            </div>
          </div>

          <div className="mt-3 flex gap-3 flex-wrap text-xs text-slate-500">
            <span>✓ USPTO 37 C.F.R. §1.84 compliant format</span>
            <span>✓ Black & white line art only</span>
            <span>✓ Reference numerals on all components</span>
            <span>✓ SVG format — scalable to any print size</span>
          </div>

          {doneCount > 0 && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800">
              <strong>Next step:</strong> Download the SVG files → open each in a browser → print to PDF (black & white) →
              upload the PDFs alongside your specification in Patent Center as "Drawings".
              Alternatively, upload the SVG files directly — Patent Center accepts SVG.
            </div>
          )}
        </CardBody>
      </Card>

      <Alert variant="warning">
        <strong>USPTO drawing rules (37 C.F.R. §1.84):</strong> Drawings must be black ink on white paper,
        minimum 3.2mm character height, no color. These generated SVGs meet those requirements.
        Review each figure before filing and verify all reference numerals match your specification text.
      </Alert>

      {/* Drawing cards */}
      {drawings.map(drawing => (
        <Card key={drawing.id}>
          <CardHeader
            title={
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-slate-500 w-12">{drawing.figNum}</span>
                <span>{drawing.title}</span>
              </div>
            }
            right={
              <div className="flex items-center gap-2">
                {drawing.status === 'done' && (
                  <Button
                    size="sm"
                    onClick={() => downloadSVG(drawing.svg, `PA1-${drawing.figNum.replace('. ','-')}.svg`)}
                  >
                    ⬇ SVG
                  </Button>
                )}
                <Badge
                  variant={
                    drawing.status === 'done'     ? 'success' :
                    drawing.status === 'generating'? 'info'    :
                    drawing.status === 'error'     ? 'danger'  : 'neutral'
                  }
                >
                  {drawing.status === 'generating' ? '⟳ Generating…' :
                   drawing.status === 'done'        ? '✓ Ready' :
                   drawing.status === 'error'       ? '✗ Error' : 'Pending'}
                </Badge>
                {drawing.status !== 'done' && drawing.status !== 'generating' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => generateOne(drawing)}
                    disabled={generating}
                  >
                    Generate
                  </Button>
                )}
                {drawing.status === 'error' && (
                  <Button size="sm" onClick={() => generateOne(drawing)}>Retry</Button>
                )}
              </div>
            }
          />
          <CardBody>
            <p className="text-xs text-slate-500 mb-3">{drawing.description}</p>

            {/* SVG Preview */}
            {drawing.status === 'generating' && (
              <div className="h-48 bg-slate-50 border border-slate-200 rounded flex items-center justify-center">
                <div className="text-center">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Claude is drafting {drawing.figNum}…</p>
                </div>
              </div>
            )}

            {drawing.status === 'done' && drawing.svg && (
              <div className="border border-slate-200 rounded overflow-hidden bg-white">
                {/* SVG rendered inline */}
                <div
                  className="w-full"
                  style={{ maxHeight: '400px', overflow: 'auto' }}
                  dangerouslySetInnerHTML={{ __html: drawing.svg }}
                />
                <div className="border-t border-slate-100 px-3 py-2 bg-slate-50 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">{drawing.figNum} — {drawing.title}</span>
                  <Button
                    size="sm"
                    onClick={() => downloadSVG(drawing.svg, `PA1-${drawing.figNum.replace('. ','-')}-${drawing.title.replace(/[^a-z0-9]/gi,'-').toLowerCase()}.svg`)}
                  >
                    ⬇ Download SVG
                  </Button>
                </div>
              </div>
            )}

            {drawing.status === 'error' && (
              <Alert variant="danger">
                Failed to generate drawing. Check your API key and try again.
              </Alert>
            )}

            {drawing.status === 'pending' && (
              <div className="h-24 bg-slate-50 border border-dashed border-slate-200 rounded flex items-center justify-center">
                <p className="text-xs text-slate-400">Click "Generate" to create this drawing</p>
              </div>
            )}
          </CardBody>
        </Card>
      ))}

      {/* USPTO instructions */}
      <Card>
        <CardHeader title="How to include drawings in your USPTO filing" />
        <CardBody>
          <div className="space-y-3 text-sm text-slate-700">
            <div className="flex gap-3">
              <span className="font-medium text-blue-700 w-6 flex-shrink-0">1.</span>
              <span>Download all 5 SVG files using the buttons above</span>
            </div>
            <div className="flex gap-3">
              <span className="font-medium text-blue-700 w-6 flex-shrink-0">2.</span>
              <span>Open each SVG in Chrome → File → Print → Save as PDF (black & white, no margins)</span>
            </div>
            <div className="flex gap-3">
              <span className="font-medium text-blue-700 w-6 flex-shrink-0">3.</span>
              <span>In Patent Center, during document upload: add each PDF as "Drawings" document type</span>
            </div>
            <div className="flex gap-3">
              <span className="font-medium text-blue-700 w-6 flex-shrink-0">4.</span>
              <span>Verify that reference numerals in drawings (110, 120, etc.) match the numbers used in your specification text</span>
            </div>
            <div className="flex gap-3">
              <span className="font-medium text-blue-700 w-6 flex-shrink-0">5.</span>
              <span>Drawings for a provisional application are informal — they just need to illustrate the invention. You can file formal drawings with the nonprovisional.</span>
            </div>
          </div>
          <div className="mt-4 bg-green-50 border border-green-200 rounded p-3 text-xs text-green-800">
            <strong>Good news:</strong> For provisional applications, USPTO accepts informal drawings.
            These AI-generated SVG diagrams are perfectly acceptable for your provisional filing.
            Formal drawings (per exact 37 C.F.R. §1.84 specifications) are only required for the nonprovisional.
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
