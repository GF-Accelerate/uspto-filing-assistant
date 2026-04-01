import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { USPTO_FEES } from '@/lib/uspto'

const ITEMS = [
  { date:'April 27, 2026', label:'File PA-2 (corrected inventors)', type:'critical' },
  { date:'April 27, 2026', label:'File PA-3 (campaign orchestration)', type:'critical' },
  { date:'April 27, 2026', label:'Execute assignment agreement', type:'critical' },
  { date:'May 1, 2026', label:'Engage registered patent attorney', type:'important' },
  { date:'May 27, 2026', label:'File PA-4 (revenue intelligence)', type:'important' },
  { date:'May 27, 2026', label:'File PA-5 (agentic DB infrastructure)', type:'important' },
  { date:'June 30, 2026', label:'File 5 trademark applications (TEAS Plus)', type:'normal' },
  { date:'September 30, 2026', label:'Nonprovisional drafts complete with attorney', type:'normal' },
  { date:'March 28, 2027', label:'PA-1 NONPROVISIONAL — MANDATORY DEADLINE', type:'mandatory' },
  { date:'March 28, 2027', label:'PA-2/3/4/5 nonprovisionals', type:'important' },
] as const

const TYPE_STYLE: Record<string,string> = {
  mandatory:'bg-red-50 text-red-700', critical:'bg-amber-50 text-amber-700',
  important:'bg-blue-50 text-blue-700', normal:'bg-slate-100 text-slate-500'
}

export function Deadlines() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Filing deadlines & milestones" />
        {ITEMS.map((item,i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3 border-b border-slate-100 last:border-0">
            <span className="text-xs text-slate-400 w-28 flex-shrink-0">{item.date}</span>
            <span className={['text-sm flex-1', item.type==='mandatory' ? 'font-medium' : ''].join(' ')}>{item.label}</span>
            <span className={['text-xs px-2 py-0.5 rounded font-medium', TYPE_STYLE[item.type]].join(' ')}>{item.type.toUpperCase()}</span>
          </div>
        ))}
      </Card>
      <Card>
        <CardHeader title="Fee calculator (2026)" />
        <CardBody>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(USPTO_FEES).map(([key, val]) => (
              <div key={key} className="bg-slate-50 rounded p-3">
                <div className="text-xs text-slate-500 mb-1 capitalize">{key.replace(/([A-Z])/g,' $1').trim()}</div>
                <div className="text-sm font-medium text-slate-900">{val}</div>
              </div>
            ))}
          </div>
          <a href="https://www.uspto.gov/learning-and-resources/fees-and-payment/uspto-fee-schedule" target="_blank" rel="noreferrer" className="text-xs text-blue-600 mt-3 block">Verify current fees at USPTO fee schedule ↗</a>
        </CardBody>
      </Card>
    </div>
  )
}
