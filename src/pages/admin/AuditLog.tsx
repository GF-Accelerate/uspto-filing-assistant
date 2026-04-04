import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { getAuditLog } from '@/lib/vadi/hal'
import { getAllLifecycles } from '@/lib/patent-lifecycle'

export function AuditLog() {
  const halLog = getAuditLog()
  const lifecycles = getAllLifecycles()

  // Combine HAL audit entries + lifecycle transitions into one timeline
  const allEntries: Array<{
    id: string
    type: 'hal' | 'lifecycle'
    description: string
    status: string
    timestamp: string
  }> = []

  halLog.forEach(entry => {
    allEntries.push({
      id: entry.id,
      type: 'hal',
      description: entry.description,
      status: entry.status,
      timestamp: entry.timestamp,
    })
  })

  Object.values(lifecycles).forEach(lc => {
    lc.transitions.forEach((t, i) => {
      allEntries.push({
        id: `${lc.patentId}-t${i}`,
        type: 'lifecycle',
        description: `${t.patentId}: ${t.from} → ${t.to}${t.note ? ` (${t.note})` : ''}`,
        status: 'transition',
        timestamp: t.timestamp,
      })
    })
  })

  // Sort by timestamp descending
  allEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Audit Log</h1>
        <p className="text-sm text-slate-500">HAL authorization decisions and patent status transitions</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs text-slate-500 mb-1">Total Entries</div>
          <div className="text-2xl font-semibold text-slate-900">{allEntries.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs text-slate-500 mb-1">HAL Decisions</div>
          <div className="text-2xl font-semibold text-indigo-700">{halLog.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs text-slate-500 mb-1">Status Changes</div>
          <div className="text-2xl font-semibold text-purple-700">
            {allEntries.filter(e => e.type === 'lifecycle').length}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader title="Activity Timeline" />
        <CardBody>
          {allEntries.length === 0 ? (
            <p className="text-sm text-slate-400">No audit entries yet. File a patent or use voice commands to generate entries.</p>
          ) : (
            <div className="space-y-1">
              {allEntries.map(entry => (
                <div key={entry.id} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    entry.type === 'hal'
                      ? entry.status === 'approved' ? 'bg-green-500' : entry.status === 'denied' ? 'bg-red-500' : 'bg-amber-500'
                      : 'bg-purple-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-800">{entry.description}</div>
                    <div className="text-xs text-slate-400 flex gap-3 mt-0.5">
                      <span className={`font-medium ${
                        entry.type === 'hal' ? 'text-indigo-600' : 'text-purple-600'
                      }`}>
                        {entry.type === 'hal' ? 'HAL' : 'Lifecycle'}
                      </span>
                      <span>{new Date(entry.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
