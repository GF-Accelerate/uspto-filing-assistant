import type { Patent } from '@/types/patent'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DeadlineBadge } from '@/components/shared/DeadlineBadge'

const STATUS_META: Record<string, { label: string; variant: 'success'|'info'|'warning'|'neutral'|'danger' }> = {
  filed:       { label:'Filed',          variant:'success' },
  filing:      { label:'Filing',         variant:'warning' },
  ready:       { label:'Ready to file',  variant:'info' },
  draft:       { label:'In progress',    variant:'neutral' },
  planned:     { label:'Planned',        variant:'neutral' },
  prosecution: { label:'Prosecution',    variant:'warning' },
  granted:     { label:'Granted',        variant:'success' },
  abandoned:   { label:'Abandoned',      variant:'danger' },
}

interface Props { patent: Patent; onOpen: (id: string) => void }

export function PatentCard({ patent, onOpen }: Props) {
  const meta = STATUS_META[patent.status] ?? { label: patent.status, variant: 'neutral' as const }
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-0">
      <div className="w-9 h-9 rounded bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-500 flex-shrink-0">
        {patent.id}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-900 truncate">{patent.title}</div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Badge variant={meta.variant}>{meta.label}</Badge>
          {patent.appNumber && <span className="text-xs text-slate-400">App #{patent.appNumber}</span>}
          {patent.filedDate && <span className="text-xs text-slate-400">Filed {patent.filedDate}</span>}
          <DeadlineBadge deadline={patent.deadline} />
        </div>
      </div>
      <div className="flex-shrink-0">
        {patent.appNumber
          ? <span className="text-xs text-green-600 font-medium">✓ Receipt saved</span>
          : <Button size="sm" onClick={() => onOpen(patent.id)}>
              {patent.status === 'filed' ? 'View' : 'Start filing ↗'}
            </Button>
        }
      </div>
    </div>
  )
}
