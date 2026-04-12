// InlineComplianceCheck — compact compliance checker for Mermaid-generated
// SVG drawings. Designed to be dropped into the existing Drawings.tsx page
// alongside each rendered figure without modifying any rendering logic.
//
// Phase 1B: Self-check integration. Uses the same drawing-compliance engine
// as the admin page, but runs only the deterministic SVG-path checks
// (sheet size, numeral height) — not vision AI, since we trust our own
// Mermaid output and want the check to stay fast and offline-capable.

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  analyzeDrawing,
  type ComplianceReport,
  type ComplianceIssue,
  type Severity,
} from '@/lib/drawing-compliance'

interface Props {
  /** Raw SVG string from the Mermaid render pipeline */
  svg: string
  /** Patent ID for the generated File name (e.g. "PA-5") */
  patentId: string
  /** Figure number for the generated File name (e.g. "FIG. 1") */
  figNum: string
}

export function InlineComplianceCheck({ svg, patentId, figNum }: Props) {
  const [checking, setChecking] = useState(false)
  const [report, setReport] = useState<ComplianceReport | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runCheck = async () => {
    setChecking(true)
    setError(null)
    try {
      const safe = `${patentId}-${figNum.replace(/[^A-Z0-9]/gi, '-')}.svg`
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const file = new File([blob], safe, { type: 'image/svg+xml' })
      const result = await analyzeDrawing(file, { useVisionAI: false })
      setReport(result)
      setExpanded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check failed')
    } finally {
      setChecking(false)
    }
  }

  if (!report && !checking && !error) {
    return (
      <Button size="sm" onClick={runCheck}>
        Check 37 CFR 1.84
      </Button>
    )
  }

  if (checking) {
    return <Button size="sm" disabled>Checking...</Button>
  }

  if (error) {
    return (
      <span className="text-xs text-red-600">{error}</span>
    )
  }

  if (!report) return null

  const errorCount   = report.issues.filter(i => i.severity === 'error').length
  const warningCount = report.issues.filter(i => i.severity === 'warning').length
  const infoCount    = report.issues.filter(i => i.severity === 'info').length

  const summaryVariant: 'success' | 'warning' | 'danger' =
    errorCount   > 0 ? 'danger'  :
    warningCount > 0 ? 'warning' :
    'success'

  const summaryLabel =
    errorCount > 0   ? `${errorCount} error${errorCount === 1 ? '' : 's'}` :
    warningCount > 0 ? `${warningCount} warning${warningCount === 1 ? '' : 's'}` :
    `${infoCount} pass${infoCount === 1 ? '' : 'es'}`

  return (
    <div className="inline-flex items-start gap-2">
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="inline-flex items-center gap-1.5 text-xs"
        title="Toggle compliance details"
      >
        <Badge variant={summaryVariant}>37 CFR 1.84: {summaryLabel}</Badge>
        <span className="text-slate-400">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div className="absolute z-20 mt-6 ml-0 max-w-md bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-slate-700">{patentId} {figNum}</span>
            <button
              onClick={() => { setReport(null); setExpanded(false) }}
              className="text-slate-400 hover:text-slate-600"
            >
              Re-run
            </button>
          </div>
          {report.issues.length === 0 ? (
            <p className="text-slate-500">No issues detected.</p>
          ) : (
            <ul className="space-y-1.5">
              {report.issues.map((issue, i) => (
                <IssueLine key={i} issue={issue} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function IssueLine({ issue }: { issue: ComplianceIssue }) {
  const tone = colorForSeverity(issue.severity)
  return (
    <li className={`p-1.5 rounded ${tone.bg}`}>
      <div className="flex items-start gap-1.5">
        <span className={`font-semibold uppercase ${tone.text}`}>{issue.severity}</span>
        <div className="flex-1">
          <div className={tone.text}>{issue.message}</div>
          {issue.severity !== 'info' && (
            <div className="text-slate-500 mt-0.5">{issue.guidance}</div>
          )}
        </div>
      </div>
    </li>
  )
}

function colorForSeverity(s: Severity): { bg: string; text: string } {
  if (s === 'error')   return { bg: 'bg-red-50',   text: 'text-red-700'   }
  if (s === 'warning') return { bg: 'bg-amber-50', text: 'text-amber-700' }
  return                      { bg: 'bg-slate-50', text: 'text-slate-600' }
}
