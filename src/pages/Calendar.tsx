import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PORTFOLIO_INIT, daysUntil } from '@/lib/uspto'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/patent-lifecycle'

interface DeadlineEntry {
  id: string
  patentId: string
  title: string
  deadline: string
  days: number
  type: 'filing' | 'nonprovisional' | 'trademark'
  fee: string
}

function buildDeadlines(): DeadlineEntry[] {
  const entries: DeadlineEntry[] = []

  PORTFOLIO_INIT.forEach(p => {
    if (p.status === 'filed' && p.deadline) {
      entries.push({
        id: `${p.id}-np`,
        patentId: p.id,
        title: `${p.id} Nonprovisional — MANDATORY`,
        deadline: p.deadline,
        days: daysUntil(p.deadline) ?? 999,
        type: 'nonprovisional',
        fee: '~$1,660',
      })
    } else if (p.status === 'ready' || p.status === 'draft') {
      const dl = p.deadline ?? '2026-06-30'
      entries.push({
        id: `${p.id}-file`,
        patentId: p.id,
        title: `File ${p.id}: ${p.title.substring(0, 40)}`,
        deadline: dl,
        days: daysUntil(dl) ?? 999,
        type: 'filing',
        fee: '$320',
      })
    }
  })

  // Add trademark deadlines
  entries.push({
    id: 'tm-vfa', patentId: '', title: 'Voice First Athletics TM filing',
    deadline: '2026-06-30', days: daysUntil('2026-06-30') ?? 999, type: 'trademark', fee: '$250',
  })
  entries.push({
    id: 'tm-csos', patentId: '', title: 'CSOS TM filing',
    deadline: '2026-06-30', days: daysUntil('2026-06-30') ?? 999, type: 'trademark', fee: '$250',
  })

  return entries.sort((a, b) => a.days - b.days)
}

function generateICS(entry: DeadlineEntry): string {
  const date = entry.deadline.replace(/-/g, '')
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Visionary AI//Patent Filing Assistant//EN',
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${date}`,
    `DTEND;VALUE=DATE:${date}`,
    `DTSTAMP:${now}`,
    `UID:${entry.id}@visionary-ai-patents`,
    `SUMMARY:${entry.title}`,
    `DESCRIPTION:Fee: ${entry.fee}. Filed via USPTO Patent Filing Assistant.`,
    'BEGIN:VALARM',
    'TRIGGER:-P30D',
    'ACTION:DISPLAY',
    'DESCRIPTION:30 days until patent deadline',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-P7D',
    'ACTION:DISPLAY',
    'DESCRIPTION:7 days until patent deadline',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

function downloadICS(entry: DeadlineEntry) {
  const ics = generateICS(entry)
  const blob = new Blob([ics], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${entry.id}-deadline.ics`
  a.click()
  URL.revokeObjectURL(url)
}

function downloadAllICS(entries: DeadlineEntry[]) {
  const events = entries.map(e => {
    const date = e.deadline.replace(/-/g, '')
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    return [
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${date}`,
      `DTEND;VALUE=DATE:${date}`,
      `DTSTAMP:${now}`,
      `UID:${e.id}@visionary-ai-patents`,
      `SUMMARY:${e.title}`,
      `DESCRIPTION:Fee: ${e.fee}`,
      'BEGIN:VALARM',
      'TRIGGER:-P7D',
      'ACTION:DISPLAY',
      'DESCRIPTION:7 days until deadline',
      'END:VALARM',
      'END:VEVENT',
    ].join('\r\n')
  }).join('\r\n')

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Visionary AI//Patent Filing Assistant//EN',
    events,
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'visionary-ai-patent-deadlines.ics'
  a.click()
  URL.revokeObjectURL(url)
}

export function Calendar() {
  const deadlines = buildDeadlines()
  const filingDeadlines = deadlines.filter(d => d.type === 'filing')
  const npDeadlines = deadlines.filter(d => d.type === 'nonprovisional')
  const tmDeadlines = deadlines.filter(d => d.type === 'trademark')

  const totalFees = deadlines.reduce((sum, d) => {
    const fee = parseInt(d.fee.replace(/[^0-9]/g, '')) || 0
    return sum + fee
  }, 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Deadline Calendar</h1>
          <p className="text-sm text-slate-500">{deadlines.length} upcoming deadlines — ${totalFees.toLocaleString()} total fees</p>
        </div>
        <Button variant="primary" onClick={() => downloadAllICS(deadlines)}>
          Download All (.ics)
        </Button>
      </div>

      {/* Urgent banner */}
      {deadlines.some(d => d.days <= 7) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 font-medium">
            {deadlines.filter(d => d.days <= 7).length} deadline(s) within 7 days!
          </p>
        </div>
      )}

      {/* Filing deadlines */}
      {filingDeadlines.length > 0 && (
        <Card>
          <CardHeader title="Provisional Filing Deadlines" right={
            <span className="text-xs text-slate-400">{filingDeadlines.length} patents</span>
          } />
          <CardBody>
            {filingDeadlines.map(d => (
              <DeadlineRow key={d.id} entry={d} />
            ))}
          </CardBody>
        </Card>
      )}

      {/* Nonprovisional deadlines */}
      {npDeadlines.length > 0 && (
        <Card>
          <CardHeader title="Nonprovisional Deadlines (MANDATORY)" right={
            <span className="text-xs text-red-500 font-medium">Must file or lose priority</span>
          } />
          <CardBody>
            {npDeadlines.map(d => (
              <DeadlineRow key={d.id} entry={d} />
            ))}
          </CardBody>
        </Card>
      )}

      {/* Trademark deadlines */}
      {tmDeadlines.length > 0 && (
        <Card>
          <CardHeader title="Trademark Deadlines" />
          <CardBody>
            {tmDeadlines.map(d => (
              <DeadlineRow key={d.id} entry={d} />
            ))}
          </CardBody>
        </Card>
      )}

      {/* Portfolio status snapshot */}
      <Card>
        <CardHeader title="Portfolio Status" />
        <CardBody>
          <div className="flex gap-3 flex-wrap">
            {PORTFOLIO_INIT.map(p => (
              <div key={p.id} className="px-3 py-2 border border-slate-200 rounded-lg">
                <div className="text-xs font-medium text-slate-800">{p.id}</div>
                <span className={`text-xs px-1.5 py-0.5 rounded ${STATUS_COLORS[p.status]}`}>
                  {STATUS_LABELS[p.status]}
                </span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

function DeadlineRow({ entry }: { entry: DeadlineEntry }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
          entry.days <= 7 ? 'bg-red-500' :
          entry.days <= 30 ? 'bg-amber-500' :
          entry.days <= 90 ? 'bg-blue-500' : 'bg-slate-300'
        }`} />
        <div>
          <div className="text-sm font-medium text-slate-800">{entry.title}</div>
          <div className="text-xs text-slate-500">{entry.deadline} | Fee: {entry.fee}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-sm font-bold ${
          entry.days <= 7 ? 'text-red-600' :
          entry.days <= 30 ? 'text-amber-600' : 'text-slate-600'
        }`}>
          {entry.days}d
        </span>
        <button
          onClick={() => downloadICS(entry)}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          .ics
        </button>
      </div>
    </div>
  )
}
