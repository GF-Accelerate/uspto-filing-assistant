// HermesAudit — admin page showing the append-only Hermes filing agent
// audit log. Read-only table view with filtering by patent and action.

import { useMemo, useState } from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { PORTFOLIO_INIT } from '@/lib/uspto'
import {
  loadEntries,
  summarizeLog,
  adminClear,
  type AuditEntry,
  type AuditAction,
} from '@/lib/hermes/audit-log'
import {
  CHECKPOINT_SEQUENCE,
  checkpointLabel,
  checkpointDescription,
} from '@/lib/hermes/checkpoints'

const ACTIONS: AuditAction[] = [
  'session_started',
  'checkpoint_requested',
  'checkpoint_approved',
  'checkpoint_denied',
  'field_filled',
  'document_uploaded',
  'navigation',
  'session_terminated',
  'session_completed',
]

export function HermesAudit() {
  const [version, setVersion] = useState(0)
  const [patentFilter, setPatentFilter] = useState<string>('all')
  const [actionFilter, setActionFilter] = useState<AuditAction | 'all'>('all')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const entries = useMemo<AuditEntry[]>(() => loadEntries(), [version])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stats = useMemo(() => summarizeLog(), [version])

  const filtered = useMemo(
    () => entries.filter(e =>
      (patentFilter === 'all' || e.patentId === patentFilter) &&
      (actionFilter === 'all' || e.action === actionFilter),
    ),
    [entries, patentFilter, actionFilter],
  )

  const handleClear = () => {
    const confirmation = prompt(
      'To clear the Hermes audit log, type the confirmation phrase exactly:\n\n' +
      'I-ACKNOWLEDGE-THIS-DESTROYS-THE-AUDIT-LOG',
    )
    if (!confirmation) return
    try {
      adminClear(confirmation)
      setVersion(v => v + 1)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to clear log')
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Hermes Audit Log</h1>
        <p className="text-sm text-slate-500">
          Append-only record of every Hermes USPTO filing agent action, including
          checkpoint decisions. Read-only view.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Sessions started"  value={stats.session_started} />
        <StatCard label="Checkpoints approved" value={stats.checkpoint_approved} tone="success" />
        <StatCard label="Checkpoints denied"   value={stats.checkpoint_denied}   tone="danger" />
        <StatCard label="Total entries" value={entries.length} />
      </div>

      {/* Checkpoint reference */}
      <Card>
        <CardHeader title="Four human-in-the-loop checkpoints" />
        <CardBody>
          <div className="space-y-2">
            {CHECKPOINT_SEQUENCE.map((name, i) => (
              <div key={name} className="flex gap-3 items-start">
                <span className="font-mono text-xs text-slate-400 w-6 flex-shrink-0">{i + 1}.</span>
                <div>
                  <div className="text-sm font-medium text-slate-800">{checkpointLabel(name)}</div>
                  <div className="text-xs text-slate-500">{checkpointDescription(name)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader
          title="Filters"
          right={
            entries.length > 0 ? (
              <Button size="sm" onClick={handleClear}>Clear log</Button>
            ) : null
          }
        />
        <CardBody>
          <div className="flex gap-4 flex-wrap">
            <label className="text-xs">
              <span className="text-slate-400 block mb-1">Patent</span>
              <select
                value={patentFilter}
                onChange={e => setPatentFilter(e.target.value)}
                className="border border-slate-200 rounded px-2 py-1 text-sm"
              >
                <option value="all">All patents</option>
                {PORTFOLIO_INIT.map(p => (
                  <option key={p.id} value={p.id}>{p.id}</option>
                ))}
              </select>
            </label>
            <label className="text-xs">
              <span className="text-slate-400 block mb-1">Action</span>
              <select
                value={actionFilter}
                onChange={e => setActionFilter(e.target.value as AuditAction | 'all')}
                className="border border-slate-200 rounded px-2 py-1 text-sm"
              >
                <option value="all">All actions</option>
                {ACTIONS.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </label>
          </div>
        </CardBody>
      </Card>

      {/* Entries */}
      <Card>
        <CardHeader title={`Entries (${filtered.length})`} />
        <CardBody>
          {entries.length === 0 ? (
            <Alert variant="info">
              No audit entries yet. The Hermes agent has not been invoked, or the
              `hermes_agent_enabled` feature flag is off.
            </Alert>
          ) : filtered.length === 0 ? (
            <Alert variant="info">No entries match the current filters.</Alert>
          ) : (
            <div className="space-y-1.5 text-xs">
              {filtered.map(e => (
                <EntryRow key={e.id} entry={e} />
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

// ── Subcomponents ────────────────────────────────────────────────────────

function StatCard({ label, value, tone }: { label: string; value: number; tone?: 'success' | 'danger' }) {
  const color =
    tone === 'success' ? 'text-green-700' :
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

function EntryRow({ entry }: { entry: AuditEntry }) {
  const when = new Date(entry.timestamp).toLocaleString('en-US')
  return (
    <div className="flex items-start gap-3 p-2 border border-slate-200 rounded bg-slate-50 font-mono">
      <span className="text-slate-400 w-36 flex-shrink-0">{when}</span>
      <Badge variant={badgeForAction(entry.action)}>{entry.action}</Badge>
      <span className="text-slate-500 w-16 flex-shrink-0">{entry.patentId}</span>
      <span className="flex-1 text-slate-700 break-all">{entry.summary}</span>
    </div>
  )
}

function badgeForAction(a: AuditAction): 'success' | 'danger' | 'info' | 'warning' | 'neutral' {
  if (a === 'checkpoint_approved' || a === 'session_completed') return 'success'
  if (a === 'checkpoint_denied' || a === 'session_terminated')  return 'danger'
  if (a === 'checkpoint_requested') return 'warning'
  if (a === 'session_started') return 'info'
  return 'neutral'
}
