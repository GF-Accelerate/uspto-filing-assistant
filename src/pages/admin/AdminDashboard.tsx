import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { PORTFOLIO_INIT, daysUntil } from '@/lib/uspto'
import { getAllReceipts } from '@/lib/filing-receipts'
import { getAllLifecycles } from '@/lib/patent-lifecycle'
import { getAuditLog } from '@/lib/vadi/hal'

export function AdminDashboard() {
  const receipts = getAllReceipts()
  const lifecycles = getAllLifecycles()
  const auditLog = getAuditLog()

  const filed = PORTFOLIO_INIT.filter(p => p.status === 'filed').length
  const ready = PORTFOLIO_INIT.filter(p => p.status === 'ready').length
  const draft = PORTFOLIO_INIT.filter(p => p.status === 'draft' || p.status === 'planned').length

  const totalTransitions = Object.values(lifecycles).reduce((sum, lc) => sum + lc.transitions.length, 0)
  const approvedActions = auditLog.filter(a => a.status === 'approved').length
  const deniedActions = auditLog.filter(a => a.status === 'denied').length

  const upcomingDeadlines = PORTFOLIO_INIT
    .filter(p => p.deadline)
    .map(p => ({ id: p.id, title: p.title, deadline: p.deadline!, days: daysUntil(p.deadline) }))
    .filter(d => d.days !== null && d.days > 0)
    .sort((a, b) => (a.days ?? 999) - (b.days ?? 999))

  const stats = [
    { label: 'Total Patents', value: PORTFOLIO_INIT.length, color: 'text-slate-900' },
    { label: 'Filed', value: filed, color: 'text-green-700' },
    { label: 'Ready to File', value: ready, color: 'text-blue-700' },
    { label: 'Draft / Planned', value: draft, color: 'text-amber-700' },
    { label: 'Filing Receipts', value: receipts.length, color: 'text-indigo-700' },
    { label: 'Status Transitions', value: totalTransitions, color: 'text-purple-700' },
    { label: 'HAL Approved', value: approvedActions, color: 'text-emerald-700' },
    { label: 'HAL Denied', value: deniedActions, color: 'text-red-700' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500">System overview — Visionary AI Systems, Inc.</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="text-xs text-slate-500 mb-1">{s.label}</div>
            <div className={`text-2xl font-semibold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Upcoming Deadlines" />
          <CardBody>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-slate-400">No upcoming deadlines</p>
            ) : (
              <div className="space-y-2">
                {upcomingDeadlines.map(d => (
                  <div key={d.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <span className="text-sm font-medium text-slate-800">{d.id}</span>
                      <span className="text-xs text-slate-400 ml-2">{d.title.substring(0, 35)}...</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-semibold ${
                        (d.days ?? 999) <= 7 ? 'text-red-600' :
                        (d.days ?? 999) <= 30 ? 'text-amber-600' : 'text-slate-600'
                      }`}>
                        {d.days}d
                      </span>
                      <div className="text-xs text-slate-400">{d.deadline}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recent HAL Audit Log" />
          <CardBody>
            {auditLog.length === 0 ? (
              <p className="text-sm text-slate-400">No audit entries yet. Use voice commands to trigger actions.</p>
            ) : (
              <div className="space-y-2">
                {auditLog.slice(-8).reverse().map(entry => (
                  <div key={entry.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <div className="text-xs">
                      <span className={entry.status === 'approved' ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                        {entry.status === 'approved' ? '✓' : '✕'} {entry.description}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Filing Receipts" />
        <CardBody>
          {receipts.length === 0 ? (
            <p className="text-sm text-slate-400">No filing receipts recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 text-xs text-slate-500 font-medium">Patent</th>
                    <th className="text-left py-2 text-xs text-slate-500 font-medium">App #</th>
                    <th className="text-left py-2 text-xs text-slate-500 font-medium">Filed</th>
                    <th className="text-left py-2 text-xs text-slate-500 font-medium">Nonprovisional Due</th>
                    <th className="text-left py-2 text-xs text-slate-500 font-medium">Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map(r => (
                    <tr key={r.id} className="border-b border-slate-100">
                      <td className="py-2 font-medium text-slate-800">{r.patentId}</td>
                      <td className="py-2 text-slate-600">{r.appNumber}</td>
                      <td className="py-2 text-slate-600">{r.filingDate}</td>
                      <td className="py-2 text-amber-700 font-medium">{r.nonprovisionalDeadline}</td>
                      <td className="py-2 text-slate-600">${r.feesPaid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
