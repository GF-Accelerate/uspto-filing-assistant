import { useState } from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PORTFOLIO_INIT, daysUntil } from '@/lib/uspto'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/patent-lifecycle'
import type { PatentStatus } from '@/types/patent'

export function PatentOverview() {
  const [statusFilter, setStatusFilter] = useState<PatentStatus | 'all'>('all')

  const filtered = statusFilter === 'all'
    ? PORTFOLIO_INIT
    : PORTFOLIO_INIT.filter(p => p.status === statusFilter)

  const statusCounts = PORTFOLIO_INIT.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Patent Overview</h1>
        <p className="text-sm text-slate-500">All patents across the portfolio</p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            statusFilter === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'
          }`}
        >
          All ({PORTFOLIO_INIT.length})
        </button>
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status as PatentStatus)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === status ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            {STATUS_LABELS[status as PatentStatus] || status} ({count})
          </button>
        ))}
      </div>

      <Card>
        <CardHeader title={`${filtered.length} patent${filtered.length !== 1 ? 's' : ''}`} />
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-xs text-slate-500 font-medium">ID</th>
                  <th className="text-left py-2 text-xs text-slate-500 font-medium">Title</th>
                  <th className="text-left py-2 text-xs text-slate-500 font-medium">Status</th>
                  <th className="text-left py-2 text-xs text-slate-500 font-medium">App #</th>
                  <th className="text-left py-2 text-xs text-slate-500 font-medium">Deadline</th>
                  <th className="text-left py-2 text-xs text-slate-500 font-medium">Days</th>
                  <th className="text-left py-2 text-xs text-slate-500 font-medium">Priority</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const days = daysUntil(p.deadline)
                  return (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2.5 font-medium text-slate-800">{p.id}</td>
                      <td className="py-2.5 text-slate-600 max-w-xs truncate">{p.title}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[p.status]}`}>
                          {STATUS_LABELS[p.status]}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-600 font-mono text-xs">{p.appNumber || '—'}</td>
                      <td className="py-2.5 text-slate-600 text-xs">{p.deadline || '—'}</td>
                      <td className="py-2.5">
                        {days !== null ? (
                          <span className={`font-semibold ${
                            days <= 7 ? 'text-red-600' : days <= 30 ? 'text-amber-600' : 'text-slate-600'
                          }`}>
                            {days}d
                          </span>
                        ) : '—'}
                      </td>
                      <td className="py-2.5">
                        <Badge variant={p.priority === 1 ? 'danger' : p.priority === 2 ? 'warning' : 'neutral'}>
                          P{p.priority}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
