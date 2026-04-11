// DrawingAnalyzer — UI component for uploading and analyzing patent drawings
// against 37 C.F.R. §1.84. Produces a severity-coded report and offers an
// optional Claude Vision qualitative check.

import { useCallback, useRef, useState } from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import {
  analyzeDrawing,
  saveReportToHistory,
  USPTO_RULES,
  type ComplianceReport,
  type ComplianceIssue,
  type Severity,
} from '@/lib/drawing-compliance'

const ACCEPT = '.png,.jpg,.jpeg,.svg,.pdf,image/png,image/jpeg,image/svg+xml,application/pdf'

interface Props {
  /** Optional patent ID to associate the report with in history */
  patentId?: string
  /** Called after a report is generated */
  onReport?: (report: ComplianceReport) => void
}

export function DrawingAnalyzer({ patentId, onReport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [useVision, setUseVision] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [report, setReport] = useState<ComplianceReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pickFile = useCallback((f: File) => {
    setFile(f)
    setReport(null)
    setError(null)
  }, [])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) pickFile(f)
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) pickFile(f)
  }

  const runAnalysis = async () => {
    if (!file) return
    setAnalyzing(true)
    setError(null)
    try {
      const result = await analyzeDrawing(file, { useVisionAI: useVision })
      setReport(result)
      saveReportToHistory(result, patentId)
      onReport?.(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const reset = () => {
    setFile(null)
    setReport(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      <Card>
        <CardHeader
          title="Drawing Compliance Analyzer"
          right={
            <Badge variant="info">37 CFR 1.84</Badge>
          }
        />
        <CardBody>
          <p className="text-xs text-slate-500 mb-3">
            Upload a patent drawing (PNG, JPG, SVG, or PDF) to check it against USPTO rule 37 CFR 1.84.
            Deterministic checks (sheet size, resolution, numeral height) run locally; qualitative checks
            (line quality, margins, view adequacy) use Claude Vision.
          </p>

          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={
              'border-2 border-dashed rounded-lg p-6 text-center transition-colors ' +
              (dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50')
            }
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              onChange={onFileChange}
              className="hidden"
            />
            {!file && (
              <div>
                <p className="text-sm text-slate-600 mb-2">Drag a drawing here, or</p>
                <Button size="sm" variant="primary" onClick={() => inputRef.current?.click()}>
                  Choose file
                </Button>
                <p className="text-xs text-slate-400 mt-2">PNG, JPG, SVG, or PDF</p>
              </div>
            )}
            {file && (
              <div>
                <p className="text-sm font-medium text-slate-800">{file.name}</p>
                <p className="text-xs text-slate-500">
                  {(file.size / 1024).toFixed(1)} KB · {file.type || 'unknown type'}
                </p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Button size="sm" onClick={() => inputRef.current?.click()}>
                    Change
                  </Button>
                  <Button size="sm" variant="primary" onClick={runAnalysis} disabled={analyzing}>
                    {analyzing ? 'Analyzing...' : 'Run compliance check'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 mt-3 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={useVision}
              onChange={e => setUseVision(e.target.checked)}
              className="rounded"
            />
            Include AI vision analysis (line quality, margins, view adequacy)
          </label>
        </CardBody>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Report */}
      {report && <ReportView report={report} onReset={reset} />}

      {/* Rule reference */}
      {!report && !analyzing && (
        <Card>
          <CardHeader title="What gets checked" />
          <CardBody>
            <ul className="text-xs text-slate-600 space-y-1 list-disc pl-5">
              <li><strong>Sheet size</strong> — A4 ({USPTO_RULES.sheetA4.widthCm}x{USPTO_RULES.sheetA4.heightCm} cm) or US Letter ({USPTO_RULES.sheetLetter.widthCm}x{USPTO_RULES.sheetLetter.heightCm} cm)</li>
              <li><strong>Margins</strong> — top &ge; {USPTO_RULES.minTopCm} cm, left &ge; {USPTO_RULES.minLeftCm} cm, right &ge; {USPTO_RULES.minRightCm} cm, bottom &ge; {USPTO_RULES.minBottomCm} cm</li>
              <li><strong>Reference numerals</strong> — minimum {USPTO_RULES.minNumeralHeightCm} cm (1/8 inch) height</li>
              <li><strong>Line quality</strong> — solid black, uniform, no unnecessary shading</li>
              <li><strong>Resolution</strong> — at least {USPTO_RULES.minDPI} DPI for raster drawings</li>
              <li><strong>Figure numbering</strong> — sequential and legible (FIG. 1, FIG. 2, ...)</li>
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  )
}

// ── Report rendering ──────────────────────────────────────────────────────

function ReportView({ report, onReset }: { report: ComplianceReport; onReset: () => void }) {
  const errorCount   = report.issues.filter(i => i.severity === 'error').length
  const warningCount = report.issues.filter(i => i.severity === 'warning').length
  const infoCount    = report.issues.filter(i => i.severity === 'info').length

  const statusLabel = {
    compliant: 'Compliant',
    warnings_only: 'Warnings only',
    non_compliant: 'Non-compliant',
    not_analyzed: 'Inconclusive',
  }[report.overallStatus]

  const statusVariant: 'success' | 'warning' | 'danger' | 'neutral' = {
    compliant: 'success' as const,
    warnings_only: 'warning' as const,
    non_compliant: 'danger' as const,
    not_analyzed: 'neutral' as const,
  }[report.overallStatus]

  return (
    <>
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <span>Report</span>
              <Badge variant={statusVariant}>{statusLabel}</Badge>
              {report.visionAnalysisUsed && <Badge variant="info">AI vision</Badge>}
            </div>
          }
          right={
            <Button size="sm" onClick={onReset}>New analysis</Button>
          }
        />
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <Stat label="File" value={report.fileName} mono />
            <Stat label="Type" value={report.fileKind.toUpperCase()} />
            <Stat label="Errors" value={String(errorCount)} tone={errorCount ? 'danger' : 'neutral'} />
            <Stat label="Warnings" value={String(warningCount)} tone={warningCount ? 'warning' : 'neutral'} />
          </div>

          {/* Metadata summary */}
          {(report.metadata.sheetSize || report.metadata.estimatedDPI || report.metadata.pixelWidth) && (
            <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 space-y-1">
              {report.metadata.sheetSize && (
                <div>
                  <strong>Sheet:</strong> {report.metadata.sheetSize.format}
                  &nbsp;({report.metadata.sheetSize.widthCm.toFixed(1)}cm x {report.metadata.sheetSize.heightCm.toFixed(1)}cm)
                </div>
              )}
              {report.metadata.pixelWidth !== undefined && (
                <div>
                  <strong>Pixels:</strong> {report.metadata.pixelWidth} x {report.metadata.pixelHeight}
                </div>
              )}
              {report.metadata.estimatedDPI !== undefined && (
                <div><strong>DPI (est.):</strong> {report.metadata.estimatedDPI}</div>
              )}
              {report.metadata.minNumeralHeightCm !== undefined && (
                <div><strong>Min numeral height:</strong> {report.metadata.minNumeralHeightCm.toFixed(2)}cm</div>
              )}
            </div>
          )}

          {/* Issues list */}
          {report.issues.length === 0 ? (
            <Alert variant="info">
              No deterministic issues found. {report.visionAnalysisUsed ? '' : 'Enable AI vision for qualitative checks.'}
            </Alert>
          ) : (
            <div className="space-y-2">
              {report.issues.map((issue, i) => (
                <IssueCard key={i} issue={issue} />
              ))}
            </div>
          )}

          {infoCount > 0 && (
            <p className="text-xs text-slate-400 mt-3">
              {infoCount} passing check{infoCount === 1 ? '' : 's'} · {report.issues.length} total items
            </p>
          )}
        </CardBody>
      </Card>
    </>
  )
}

function IssueCard({ issue }: { issue: ComplianceIssue }) {
  const tone = toneForSeverity(issue.severity)
  return (
    <div className={`rounded border p-3 text-sm ${tone.bg} ${tone.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge variant={severityBadge(issue.severity)}>{issue.severity.toUpperCase()}</Badge>
            <span className="font-mono text-xs text-slate-500">{issue.rule}</span>
          </div>
          <p className={`mt-1 font-medium ${tone.text}`}>{issue.message}</p>
          <p className="text-xs text-slate-600 mt-1">{issue.guidance}</p>
          {issue.measured && (
            <p className="text-xs text-slate-400 mt-1 font-mono">observed: {issue.measured}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function toneForSeverity(s: Severity): { bg: string; border: string; text: string } {
  if (s === 'error')   return { bg: 'bg-red-50',   border: 'border-red-200',   text: 'text-red-800' }
  if (s === 'warning') return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800' }
  return                      { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800' }
}

function severityBadge(s: Severity): 'danger' | 'warning' | 'info' {
  if (s === 'error')   return 'danger'
  if (s === 'warning') return 'warning'
  return 'info'
}

function Stat({ label, value, mono, tone }: { label: string; value: string; mono?: boolean; tone?: 'danger' | 'warning' | 'neutral' }) {
  const color = tone === 'danger' ? 'text-red-700' : tone === 'warning' ? 'text-amber-700' : 'text-slate-900'
  return (
    <div className="bg-slate-50 border border-slate-200 rounded p-2">
      <div className="text-xs text-slate-400 uppercase tracking-wide">{label}</div>
      <div className={`text-sm font-medium ${color} ${mono ? 'font-mono truncate' : ''}`}>{value}</div>
    </div>
  )
}
