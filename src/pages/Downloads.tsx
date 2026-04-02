import { useState, useCallback } from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { PA1_SPEC_SUMMARY, PA2_SPEC_SUMMARY, PA3_SPEC_SUMMARY } from '@/lib/uspto'

// ── Helpers ───────────────────────────────────────────────────────────────
function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// ── Document definitions ──────────────────────────────────────────────────
const ASSIGNMENT_TEXT = `PATENT AND INVENTION ASSIGNMENT AGREEMENT
35 U.S.C. § 261

This Agreement is entered into as of _____________, 2026.

ASSIGNORS: Milton Overton and Lisa Overton (collectively "Inventors")
ASSIGNEE: Visionary AI Systems Inc, a Delaware Corporation ("Company")

The Inventors hereby assign to the Company all right, title, and interest in:

1. PA-1: Voice-Controlled Database Query + Autonomous Agent Execution
2. PA-2: Athletic Department Management Platform
3. PA-3: Multi-Modal Campaign Orchestration via Voice
4. PA-4: Predictive Sports Revenue Intelligence Engine
5. PA-5: Voice-First Agentic Database Infrastructure

Including all provisional and nonprovisional applications, continuations,
divisionals, and foreign equivalents, together with all trademarks including
Voice First Athletics, CSOS, VoiceDB, AgentMail, and Visionary AI.

REPRESENTATIONS: Inventors warrant they are the sole inventors, have not
previously assigned these rights, and no third party (including KSU /
Kennesaw State University) has any ownership interest.

CONSIDERATION: [Equity % to be agreed] in Visionary AI Systems Inc.

Inventor 1: _________________________ Date: _____________
Milton Overton

Inventor 2: _________________________ Date: _____________
Lisa Overton

Company:    _________________________ Date: _____________
Visionary AI Systems Inc

NOTE: Have a licensed patent attorney review before signing.
Record with USPTO at: assignmentcenter.uspto.gov`

const DOCUMENTS = [
  {
    category: 'Patent Specifications',
    items: [
      {
        id: 'pa1-spec',
        title: 'PA-1 Provisional Patent Application',
        subtitle: 'Voice-Controlled Database Query + Autonomous Agent Execution',
        badge: 'Ready to file',
        badgeVariant: 'success' as const,
        deadline: 'Filed March 28, 2026 · Nonprovisional due March 28, 2027',
        formats: ['TXT', 'Copy'],
        spec: PA1_SPEC_SUMMARY,
        filename: 'PA1-Voice-Database-Provisional-Patent.txt',
        externalUrl: undefined,
      },
      {
        id: 'pa2-spec',
        title: 'PA-2 Provisional Patent Application',
        subtitle: 'Athletic Department Management Platform (Corrected)',
        badge: 'URGENT — April 27',
        badgeVariant: 'danger' as const,
        deadline: 'File by April 27, 2026 — 26 days remaining',
        formats: ['TXT', 'Copy'],
        spec: PA2_SPEC_SUMMARY,
        filename: 'PA2-Athletic-Platform-Provisional-Patent.txt',
        externalUrl: undefined,
      },
      {
        id: 'pa3-spec',
        title: 'PA-3 Provisional Patent Application',
        subtitle: 'Multi-Modal Campaign Orchestration via Voice',
        badge: 'URGENT — April 27',
        badgeVariant: 'danger' as const,
        deadline: 'File by April 27, 2026 — 26 days remaining',
        formats: ['TXT', 'Copy'],
        spec: PA3_SPEC_SUMMARY,
        filename: 'PA3-Campaign-Orchestration-Provisional-Patent.txt',
        externalUrl: undefined,
      },
    ],
  },
  {
    category: 'Legal Documents',
    items: [
      {
        id: 'assignment',
        title: 'Inventor Assignment Agreement',
        subtitle: 'Transfers all 5 patents from inventors to Visionary AI Systems Inc',
        badge: 'Sign this week',
        badgeVariant: 'warning' as const,
        deadline: 'Must be executed before filing any patent',
        formats: ['TXT', 'Copy'],
        spec: ASSIGNMENT_TEXT,
        filename: 'Inventor-Assignment-Agreement.txt',
        externalUrl: undefined,
      },
    ],
  },
  {
    category: 'USPTO Forms',
    items: [
      {
        id: 'ptosb16',
        title: 'PTO/SB/16 Cover Sheet (blank)',
        subtitle: 'Required separate document for every provisional filing',
        badge: 'Download from USPTO',
        badgeVariant: 'info' as const,
        deadline: 'One required per patent application',
        formats: ['USPTO Link'],
        spec: null,
        filename: '',
        externalUrl: 'https://www.uspto.gov/sites/default/files/documents/sb0016.pdf',
      },
      {
        id: 'feeschedule',
        title: 'USPTO Fee Schedule 2026',
        subtitle: 'Current filing fees — Small Entity: $320 per provisional',
        badge: 'Verify before filing',
        badgeVariant: 'neutral' as const,
        deadline: 'Fees change January 1 each year',
        formats: ['USPTO Link'],
        spec: null,
        filename: '',
        externalUrl: 'https://www.uspto.gov/learning-and-resources/fees-and-payment/uspto-fee-schedule',
      },
    ],
  },
]


export function Downloads() {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = useCallback((text: string, id: string) => {
    navigator.clipboard?.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }, [])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="font-medium text-slate-900 mb-1">Document Downloads</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          All patent specifications, legal documents, and USPTO forms in one place.
          Download as text files or copy directly into the Filing Wizard.
        </p>
        <div className="mt-3 flex gap-3 flex-wrap text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            USPTO accepts .txt specs — paste into DOCX for formal filing
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
            Use "Copy" to paste directly into the Filing Wizard input
          </span>
        </div>
      </div>

      <Alert variant="danger">
        <strong>April 27 deadline:</strong> PA-2 and PA-3 must be filed in 26 days.
        Download the specs below, go to Filing Wizard, click "Load [patent] text ↓", and follow the wizard to Patent Center.
      </Alert>

      {DOCUMENTS.map(section => (
        <div key={section.category}>
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-3 px-1">
            {section.category}
          </h3>
          <div className="space-y-3">
            {section.items.map(doc => (
              <Card key={doc.id}>
                <CardHeader
                  title={
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{doc.title}</span>
                        <Badge variant={doc.badgeVariant}>{doc.badge}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-normal">{doc.subtitle}</p>
                    </div>
                  }
                />
                <CardBody>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        doc.badgeVariant === 'danger'  ? 'bg-red-500' :
                        doc.badgeVariant === 'warning' ? 'bg-amber-500' :
                        doc.badgeVariant === 'success' ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                      {doc.deadline}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {doc.externalUrl ? (
                        <a href={doc.externalUrl} target="_blank" rel="noreferrer">
                          <Button size="sm">Open at USPTO ↗</Button>
                        </a>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            onClick={() => downloadText(doc.spec!, doc.filename)}
                          >
                            ⬇ Download .txt
                          </Button>
                          <Button
                            size="sm"
                            variant={copied === doc.id ? 'primary' : 'secondary'}
                            onClick={() => copyToClipboard(doc.spec!, doc.id)}
                          >
                            {copied === doc.id ? '✓ Copied!' : 'Copy text'}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Preview */}
                  {doc.spec && (
                    <div className="mt-3 bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <p className="text-xs font-mono text-slate-600 leading-relaxed whitespace-pre-wrap line-clamp-4">
                        {doc.spec.substring(0, 400)}…
                      </p>
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Filing instructions */}
      <Card>
        <CardHeader title="How to use these documents to file" />
        <CardBody>
          <div className="space-y-3">
            {[
              { n:'1', t:'Copy any patent spec text using the "Copy text" button above' },
              { n:'2', t:'Go to Filing Wizard → select the patent → click "Load [patent] text ↓"' },
              { n:'3', t:'Click "Analyze with AI" — Claude extracts all filing data in ~10 seconds' },
              { n:'4', t:'Complete steps 2-5 (AI analysis → cover sheet → 14-item checklist → filing guide)' },
              { n:'5', t:'Step 5 opens patentcenter.uspto.gov — log in with ID.me + MFA → upload spec + drawings → pay $320 → Submit' },
              { n:'6', t:'Save Application Number in Step 6 — starts your 12-month nonprovisional clock' },
            ].map(({ n, t }) => (
              <div key={n} className="flex gap-3 text-sm text-slate-700">
                <span className="font-medium text-blue-600 flex-shrink-0 w-4">{n}.</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
