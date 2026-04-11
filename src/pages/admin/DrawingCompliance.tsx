// DrawingCompliance — admin page for analyzing patent drawings against
// 37 C.F.R. §1.84. Hosts the DrawingAnalyzer component, plus a patent
// picker, per-patent history, and a summary dashboard.

import { useMemo, useState } from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { DrawingAnalyzer } from '@/components/DrawingAnalyzer'
import { PORTFOLIO_INIT } from '@/lib/uspto'
import {
  loadReportHistory,
  clearReportHistory,
  type StoredReport,
  type OverallStatus,
} from '@/lib/drawing-compliance'

export function DrawingCompliance() {
  const [selectedPatent, setSelectedPatent] = useState<string>('PA-5')
  const [historyVersion, setHistoryVersion] = useState(0)  // bump to refresh

  // historyVersion is an intentional cache-buster — bumped when a new report is saved
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allHistory = useMemo<StoredReport[]>(() => loadReportHistory(), [historyVersion])
  const patentHistory = useMemo(
    () => allHistory.filter(r => r.patentId === selectedPatent),
    [allHistory, selectedPatent],
  )

  const stats = useMemo(() => summarize(allHistory), [allHistory])

  const patents = PORTFOLIO_INIT

  const handleClearHistory = () => {
    if (!confirm('Clear all compliance history? This cannot be undone.')) return
    clearReportHistory()
    setHistoryVersion(v => v + 1)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Drawing Compliance</h1>
        <p className="text-sm text-slate-500">
          Analyze patent drawings against 37 CFR 1.84 rules. Upload PNG, JPG, SVG, or PDF files.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total analyzed" value={stats.total} />
        <StatCard label="Compliant" value={stats.compliant} tone="success" />
        <StatCard label="Warnings only" value={stats.warningsOnly} tone="warning" />
        <StatCard label="Non-compliant" value={stats.nonCompliant} tone="danger" />
      </div>

      {/* Patent picker */}
      <Card>
        <CardHeader
          title="Select patent"
          right={<span className="text-xs text-slate-400">Reports are saved per patent</span>}
        />
        <CardBody>
          <div className="flex gap-2 flex-wrap">
            {patents.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPatent(p.id)}
                className={
                  'px-3 py-2 rounded-lg text-xs font-medium border transition-colors ' +
                  (selectedPatent === p.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300')
                }
              >
                {p.id}: {p.title.substring(0, 36)}{p.title.length > 36 ? '...' : ''}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Analyzer */}
      <DrawingAnalyzer
        patentId={selectedPatent}
        onReport={() => setHistoryVersion(v => v + 1)}
      />

      {/* History */}
      <Card>
        <CardHeader
          title={`History for ${selectedPatent}`}
          right={
            allHistory.length > 0 ? (
              <Button size="sm" onClick={handleClearHistory}>Clear all</Button>
            ) : null
          }
        />
        <CardBody>
          {patentHistory.length === 0 ? (
            <Alert variant="info">
              No reports yet for {selectedPatent}. Upload a drawing above to create the first one.
            </Alert>
          ) : (
            <div className="space-y-2">
              {patentHistory.map(r => (
                <HistoryRow key={r.id} report={r} />
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Reference */}
      <Card>
        <CardHeader title="37 CFR 1.84 quick reference" />
        <CardBody>
          <div className="text-xs text-slate-600 space-y-1.5">
            <div><strong>(f) Size of sheets:</strong> A4 (21.0x29.7 cm) or US Letter (21.6x27.9 cm)</div>
            <div><strong>(g) Margins:</strong> top &ge;2.5 cm, left &ge;2.5 cm, right &ge;1.5 cm, bottom &ge;1.0 cm</div>
            <div><strong>(l) Character of lines:</strong> solid black, uniform thickness, durable</div>
            <div><strong>(p)(3) Numerals and letters:</strong> at least 0.32 cm (1/8") high</div>
            <div><strong>(u) Numbering of sheets:</strong> sequential, near top middle</div>
            <div className="pt-2 text-slate-400">
              Full rule:{' '}
              <a
                href="https://www.ecfr.gov/current/title-37/chapter-I/subchapter-A/part-1/subpart-B/section-1.84"
                target="_blank" rel="noreferrer"
                className="underline"
              >ecfr.gov/title-37/section-1.84</a>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

// ── Subcomponents ────────────────────────────────────────────────────────

function StatCard({ label, value, tone }: { label: string; value: number; tone?: 'success' | 'warning' | 'danger' }) {
  const color =
    tone === 'success' ? 'text-green-700' :
    tone === 'warning' ? 'text-amber-700' :
    tone === 'danger'  ? 'text-red-700'   :
    'text-slate-900'
  return (
    <Card>
      <CardBody>
        <div className="text-xs text-slate-400 uppercase tracking-wide">{label}</div>
        <div className={`text-2xl font-semibold ${color}`}>{value}</div>
      </CardBody>
    </Card>
  )
}

function HistoryRow({ report }: { report: StoredReport }) {
  const when = new Date(report.analyzedAt).toLocaleString('en-US')
  const errorCount   = report.issues.filter(i => i.severity === 'error').length
  const warningCount = report.issues.filter(i => i.severity === 'warning').length

  return (
    <div className="flex items-start justify-between gap-3 p-3 border border-slate-200 rounded bg-slate-50">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-800 truncate">{report.fileName}</span>
          <Badge variant={statusVariant(report.overallStatus)}>
            {statusLabel(report.overallStatus)}
          </Badge>
          <Badge variant="neutral">{report.fileKind.toUpperCase()}</Badge>
          {report.visionAnalysisUsed && <Badge variant="info">AI vision</Badge>}
        </div>
        <div className="text-xs text-slate-500 mt-1">{when}</div>
        <div className="text-xs text-slate-600 mt-1">
          {errorCount} error{errorCount === 1 ? '' : 's'} · {warningCount} warning{warningCount === 1 ? '' : 's'}
        </div>
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────

function summarize(history: StoredReport[]) {
  return {
    total:         history.length,
    compliant:     history.filter(r => r.overallStatus === 'compliant').length,
    warningsOnly:  history.filter(r => r.overallStatus === 'warnings_only').length,
    nonCompliant:  history.filter(r => r.overallStatus === 'non_compliant').length,
  }
}

function statusVariant(s: OverallStatus): 'success' | 'warning' | 'danger' | 'neutral' {
  if (s === 'compliant')     return 'success'
  if (s === 'warnings_only') return 'warning'
  if (s === 'non_compliant') return 'danger'
  return 'neutral'
}

function statusLabel(s: OverallStatus): string {
  if (s === 'compliant')     return 'Compliant'
  if (s === 'warnings_only') return 'Warnings only'
  if (s === 'non_compliant') return 'Non-compliant'
  return 'Inconclusive'
}
