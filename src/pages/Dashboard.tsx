import type { Patent } from '@/types/patent'
import { Card, CardHeader } from '@/components/ui/Card'
import { PatentCard } from '@/components/portfolio/PatentCard'
import { daysUntil, USPTO_URLS } from '@/lib/uspto'

interface Props { portfolio: Patent[]; onOpen: (id: string) => void }

export function Dashboard({ portfolio, onOpen }: Props) {
  const metrics = [
    { label:'Total patents', value:portfolio.length },
    { label:'Filed', value:portfolio.filter(p=>p.status==='filed').length },
    { label:'Ready to file', value:portfolio.filter(p=>p.status==='ready').length },
    { label:'Days to PA-1 deadline', value: daysUntil('2027-03-28'), warn:true },
  ]

  const actions = [
    { label:'File PA-2 (corrected inventors)', deadline:'April 27, 2026', urgent:true },
    { label:'File PA-3 (campaign orchestration)', deadline:'April 27, 2026', urgent:true },
    { label:'Execute assignment agreement', deadline:'This week', urgent:true },
    { label:'Engage registered patent attorney', deadline:'Within 14 days', urgent:false },
    { label:'File PA-4 (revenue intelligence)', deadline:'May 27, 2026', urgent:false },
    { label:'File PA-1 nonprovisional', deadline:'March 28, 2027 — MANDATORY', urgent:false },
  ]

  const resources = [
    { label:'Patent Center (file here)', url:USPTO_URLS.patentCenter },
    { label:'PTO/SB/16 Cover Sheet PDF', url:USPTO_URLS.coverSheet },
    { label:'Fee Schedule 2026', url:USPTO_URLS.feeSchedule },
    { label:'ID.me Verification', url:USPTO_URLS.idMe },
    { label:'Assignment Center', url:USPTO_URLS.assignmentCenter },
    { label:'Find Patent Attorney', url:USPTO_URLS.attorneySearch },
    { label:'TEAS Trademark Filing', url:USPTO_URLS.teasTrademark },
    { label:'Patent Public Search', url:USPTO_URLS.priorArtSearch },
  ]

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 mb-5">
        {metrics.map(m => (
          <div key={m.label} className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="text-xs text-slate-500 mb-1">{m.label}</div>
            <div className={['text-2xl font-medium', m.warn && (m.value as number) < 90 ? 'text-amber-600' : 'text-slate-900'].join(' ')}>{m.value}</div>
          </div>
        ))}
      </div>

      <Card className="mb-5">
        <CardHeader title="Patent Portfolio — Visionary AI Systems Inc" right={<span className="text-xs text-slate-400">Inventors: Milton & Lisa Overton</span>} />
        {portfolio.map(p => <PatentCard key={p.id} patent={p} onOpen={onOpen} />)}
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Immediate actions" />
          <div className="p-5 pt-2">
            {actions.map((a,i) => (
              <div key={i} className={['flex gap-2.5 py-2', i < actions.length-1 ? 'border-b border-slate-100' : ''].join(' ')}>
                <span className="text-xs mt-0.5">{a.urgent ? '🔴' : '🟡'}</span>
                <div><div className="text-xs font-medium text-slate-800">{a.label}</div><div className="text-xs text-slate-400">{a.deadline}</div></div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="USPTO resources" />
          <div className="p-5 pt-2">
            {resources.map(r => (
              <a key={r.label} href={r.url} target="_blank" rel="noreferrer" className="block text-sm text-blue-600 hover:underline py-1.5 border-b border-slate-100 last:border-0">{r.label} ↗</a>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
