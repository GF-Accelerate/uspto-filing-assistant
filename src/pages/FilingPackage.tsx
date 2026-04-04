import { useState } from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { PATENT_SPECS, PORTFOLIO_INIT } from '@/lib/uspto'
import { generateSpecDOCX, generateCoverSheetDOCX, downloadSpecDOCX, downloadCoverSheetDOCX, getDefaultInventors, getDefaultAssignee } from '@/lib/docx-generator'
import type { ExtractedFilingData } from '@/types/patent'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

// ── Document type mapping for Patent Center uploads ──────────────

interface FilingDocument {
  id: string
  label: string
  usptoType: string          // Exact label to select in Patent Center dropdown
  format: string
  status: 'ready' | 'generating' | 'not_available'
  description: string
}

function getDocumentsForPatent(patentId: string): FilingDocument[] {
  const hasSpec = !!PATENT_SPECS[patentId]
  return [
    {
      id: `${patentId}-spec`,
      label: 'Specification',
      usptoType: 'Specification',
      format: 'DOCX',
      status: hasSpec ? 'ready' : 'not_available',
      description: 'Complete patent specification including claims, abstract, and detailed description',
    },
    {
      id: `${patentId}-cover`,
      label: 'Provisional Cover Sheet',
      usptoType: 'Provisional Cover Sheet (SB16)',
      format: 'DOCX',
      status: hasSpec ? 'ready' : 'not_available',
      description: 'PTO/SB/16 cover sheet with inventor info, assignee, and entity status',
    },
    {
      id: `${patentId}-fig1`,
      label: 'FIG. 1 — System Architecture',
      usptoType: 'Drawings',
      format: 'PDF',
      status: patentId === 'PA-1' ? 'ready' : 'not_available',
      description: 'System architecture block diagram',
    },
    {
      id: `${patentId}-fig2`,
      label: 'FIG. 2 — Processing Pipeline',
      usptoType: 'Drawings',
      format: 'PDF',
      status: patentId === 'PA-1' ? 'ready' : 'not_available',
      description: 'Voice processing and SQL generation flowchart',
    },
    {
      id: `${patentId}-fig3`,
      label: 'FIG. 3 — Agent Framework',
      usptoType: 'Drawings',
      format: 'PDF',
      status: patentId === 'PA-1' ? 'ready' : 'not_available',
      description: 'Nine-agent autonomous framework with HITL gate',
    },
    {
      id: `${patentId}-fig4`,
      label: 'FIG. 4 — Communication Failover',
      usptoType: 'Drawings',
      format: 'PDF',
      status: patentId === 'PA-1' ? 'ready' : 'not_available',
      description: 'Multi-provider communication failover system',
    },
    {
      id: `${patentId}-fig5`,
      label: 'FIG. 5 — Lead Scoring Engine',
      usptoType: 'Drawings',
      format: 'PDF',
      status: patentId === 'PA-1' ? 'ready' : 'not_available',
      description: 'Database layer and RFE lead scoring engine',
    },
  ]
}

function buildExtractedData(patentId: string): ExtractedFilingData {
  const patent = PORTFOLIO_INIT.find(p => p.id === patentId)
  const specText = PATENT_SPECS[patentId] ?? ''
  const titleMatch = specText.match(/TITLE:\s*(.+)/)
  const inventors = getDefaultInventors()
  const assignee = getDefaultAssignee()

  return {
    title: titleMatch?.[1] ?? patent?.title ?? 'Untitled Patent',
    technicalField: 'Voice-controlled database interaction systems',
    inventors,
    assignee,
    entityStatus: 'Small Entity',
    filingDate: new Date().toISOString().split('T')[0],
    independentClaims: 3,
    totalClaims: 14,
    hasDrawings: true,
    abstract: '',
    keyInnovations: [],
    warnings: [],
  }
}

export function FilingPackage() {
  const [selectedPatent, setSelectedPatent] = useState<string>('PA-5')
  const [generating, setGenerating] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const patents = PORTFOLIO_INIT.filter(p => p.status !== 'filed')
  const filedPatents = PORTFOLIO_INIT.filter(p => p.status === 'filed')
  const documents = getDocumentsForPatent(selectedPatent)
  const readyDocs = documents.filter(d => d.status === 'ready')

  const copyUsptoType = (usptoType: string, docId: string) => {
    navigator.clipboard?.writeText(usptoType)
    setCopied(docId)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleGenerateSpec = async () => {
    const specText = PATENT_SPECS[selectedPatent]
    if (!specText) return
    setGenerating('spec')
    try {
      const title = specText.match(/TITLE:\s*(.+)/)?.[1] ?? 'Patent Specification'
      await downloadSpecDOCX(specText, title, selectedPatent)
    } finally {
      setGenerating(null)
    }
  }

  const handleGenerateCover = async () => {
    setGenerating('cover')
    try {
      const data = buildExtractedData(selectedPatent)
      await downloadCoverSheetDOCX(data, null, selectedPatent)
    } finally {
      setGenerating(null)
    }
  }

  const handleDownloadZIP = async () => {
    const specText = PATENT_SPECS[selectedPatent]
    if (!specText) return
    setGenerating('zip')
    try {
      const title = specText.match(/TITLE:\s*(.+)/)?.[1] ?? 'Patent Specification'
      const data = buildExtractedData(selectedPatent)
      const safeName = selectedPatent.replace(/[^a-zA-Z0-9-]/g, '')

      const [specBlob, coverBlob] = await Promise.all([
        generateSpecDOCX(specText, title, selectedPatent),
        generateCoverSheetDOCX(data, null, selectedPatent),
      ])

      const zip = new JSZip()
      zip.file(`${safeName}-Specification.docx`, specBlob)
      zip.file(`${safeName}-Cover-Sheet-PTO-SB-16.docx`, coverBlob)
      zip.file('MANIFEST.txt', [
        `Filing Package for ${selectedPatent}: ${title}`,
        `Generated: ${new Date().toLocaleDateString('en-US')}`,
        `Entity Status: Small Entity ($320 filing fee)`,
        '',
        'DOCUMENT TYPE MAPPING FOR PATENT CENTER:',
        '─────────────────────────────────────────',
        `${safeName}-Specification.docx          → Document Type: "Specification"`,
        `${safeName}-Cover-Sheet-PTO-SB-16.docx  → Document Type: "Provisional Cover Sheet (SB16)"`,
        `Drawing PDFs (from Drawings tab)        → Document Type: "Drawings"`,
        '',
        'INSTRUCTIONS:',
        '1. Go to patentcenter.uspto.gov',
        '2. Start new Provisional Application',
        '3. Complete Web ADS (inventors, assignee, entity status)',
        '4. Upload each document with the Document Type shown above',
        '5. Calculate fees → $320 → Pay → Submit',
        '6. SAVE the Application Number',
        '',
        'Assignee: Visionary AI Systems, Inc. (Delaware Corporation)',
        'Inventors: Milton Overton & Lisa Overton',
      ].join('\n'))

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, `${safeName}-Filing-Package.zip`)
    } finally {
      setGenerating(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card>
        <CardBody>
          <h2 className="text-sm font-medium text-slate-900 mb-1">Filing Package Builder</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Generate all documents needed for a USPTO provisional filing. Each document shows the
            exact <strong>Document Type</strong> to select when uploading in Patent Center.
          </p>
        </CardBody>
      </Card>

      {/* Patent Selector */}
      <Card>
        <CardHeader title="Select Patent to File" />
        <CardBody>
          <div className="flex gap-2 flex-wrap">
            {patents.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPatent(p.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  selectedPatent === p.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                }`}
              >
                {p.id}: {p.title.substring(0, 40)}{p.title.length > 40 ? '...' : ''}
              </button>
            ))}
          </div>
          {filedPatents.length > 0 && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {filedPatents.map(p => (
                <span key={p.id} className="px-3 py-2 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                  {p.id}: FILED ({p.appNumber})
                </span>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Quick Actions */}
      {PATENT_SPECS[selectedPatent] && (
        <Card>
          <CardBody>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-slate-900">One-Click Filing Package</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generate Specification DOCX + Cover Sheet DOCX in a single ZIP with document type manifest
                </p>
              </div>
              <Button
                variant="primary"
                onClick={handleDownloadZIP}
                disabled={generating === 'zip'}
              >
                {generating === 'zip' ? 'Generating...' : '⬇ Download ZIP Package'}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Filing Fee */}
      <Alert variant="info">
        <strong>Filing fee:</strong> $320 (Small Entity, 2026) — verify at{' '}
        <a href="https://www.uspto.gov/learning-and-resources/fees-and-payment/uspto-fee-schedule"
           target="_blank" rel="noreferrer" className="underline">USPTO Fee Schedule</a>
      </Alert>

      {/* Document List */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-widest px-1">
          Documents for {selectedPatent}
        </h3>

        {documents.map(doc => (
          <Card key={doc.id}>
            <CardBody>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-medium text-slate-900">{doc.label}</span>
                    <Badge variant={doc.status === 'ready' ? 'success' : 'neutral'}>
                      {doc.format}
                    </Badge>
                    <Badge variant={doc.status === 'ready' ? 'info' : 'neutral'}>
                      {doc.status === 'ready' ? 'Ready' : 'Not yet available'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{doc.description}</p>

                  {/* USPTO Document Type — critical for correct filing */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-slate-400">Patent Center type:</span>
                    <code className="text-xs bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-mono border border-amber-200">
                      {doc.usptoType}
                    </code>
                    <button
                      onClick={() => copyUsptoType(doc.usptoType, doc.id)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      {copied === doc.id ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {doc.status === 'ready' && doc.id.endsWith('-spec') && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleGenerateSpec}
                      disabled={generating === 'spec'}
                    >
                      {generating === 'spec' ? 'Generating...' : '⬇ Generate DOCX'}
                    </Button>
                  )}
                  {doc.status === 'ready' && doc.id.endsWith('-cover') && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleGenerateCover}
                      disabled={generating === 'cover'}
                    >
                      {generating === 'cover' ? 'Generating...' : '⬇ Generate DOCX'}
                    </Button>
                  )}
                  {doc.status === 'ready' && doc.usptoType === 'Drawings' && (
                    <span className="text-xs text-slate-400">Generate in Drawings tab</span>
                  )}
                  {doc.status === 'not_available' && (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader title="Filing Checklist for Patent Center" />
        <CardBody>
          <div className="space-y-2 text-sm text-slate-700">
            {[
              ['1', 'Generate Specification DOCX — upload as "Specification"'],
              ['2', 'Generate Cover Sheet DOCX — upload as "Provisional Cover Sheet (SB16)"'],
              ['3', 'Generate drawing PDFs in the Drawings tab — upload each as "Drawings"'],
              ['4', 'Go to patentcenter.uspto.gov → New submission → Provisional'],
              ['5', 'Complete Web ADS (inventors, assignee, entity status)'],
              ['6', 'Upload all documents with the correct document types shown above'],
              ['7', 'Calculate fees → $320 → Pay → Submit'],
              ['8', 'SAVE the Application Number (format: 63/XXX,XXX or 64/XXX,XXX)'],
            ].map(([n, t]) => (
              <div key={n} className="flex gap-3">
                <span className="font-medium text-blue-700 w-4 flex-shrink-0">{n}.</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">
              <strong>Ready documents:</strong> {readyDocs.length} of {documents.length} •{' '}
              <strong>Fee:</strong> $320 (Small Entity)
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
