import type { Patent } from '@/types/patent'
import { Card, CardHeader } from '@/components/ui/Card'
import { PatentCard } from '@/components/portfolio/PatentCard'
import { Badge } from '@/components/ui/Badge'
import { daysUntil, USPTO_URLS } from '@/lib/uspto'
import { getAllReceipts } from '@/lib/filing-receipts'
import { useNavigate } from 'react-router-dom'

interface Props { portfolio: Patent[]; onOpen: (id: string) => void }

export function Dashboard({ portfolio, onOpen }: Props) {
  const navigate = useNavigate()
  const pa1Deadline = daysUntil('2027-04-03')
  const pa2pa3Deadline = daysUntil('2026-04-27')
  const rs1Deadline = daysUntil('2026-08-13')
  const receipts = getAllReceipts()

  const vaisPatents = portfolio.filter(p => !p.id.startsWith('RS-') && !p.id.startsWith('PA-8') && !p.id.startsWith('PA-9') && !p.id.startsWith('PA-10'))
  const crossEntityPatents = portfolio.filter(p => p.id.startsWith('RS-'))
  const newCandidates = portfolio.filter(p => ['PA-8', 'PA-9', 'PA-10'].includes(p.id))

  const metrics = [
    { label:'Total patents', value:portfolio.length },
    { label:'Filed', value:portfolio.filter(p=>p.status==='filed').length },
    { label:'Ready to file', value:portfolio.filter(p=>p.status==='ready').length },
    { label:'PA-1 nonprovisional', value: pa1Deadline !== null ? `${pa1Deadline}d` : '—', warn:true },
  ]

  const actions = [
    { label:'Sign Assignment Agreement (50/50 Milton/Lisa)', deadline:'This week', urgent:true },
    { label:'File PA-5 VADI — platform licensing moat', deadline:'This week', urgent:true },
    { label:'File PA-2 (athletic dept management)', deadline:'April 27, 2026', urgent:true },
    { label:'File PA-3 (campaign orchestration)', deadline:'April 27, 2026', urgent:true },
    { label:'Enter PGI-1 filing receipt (check filing notice PDF)', deadline:'This week', urgent:true },
    { label:'RS-1 nonprovisional (App #63/862,821)', deadline:'August 13, 2026 — MANDATORY', urgent: rs1Deadline !== null && rs1Deadline <= 180 },
    { label:'File PA-6 (IP development platform)', deadline:'This week', urgent:true },
    { label:'Draft PA-8 spec (multi-model orchestration + confidence routing)', deadline:'May 2026', urgent:false },
    { label:'File PA-4 (revenue intelligence)', deadline:'May 27, 2026', urgent:false },
    { label:'File PA-7 (federated learning)', deadline:'Within 30 days', urgent:false },
    { label:'File PA-9 (worship technology)', deadline:'June 2026', urgent:false },
    { label:'File PA-10 (financial planning)', deadline:'June 2026', urgent:false },
    { label:'PA-1 nonprovisional (App #64/029,100)', deadline:'April 3, 2027 — MANDATORY', urgent:false },
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
            <div className={['text-2xl font-medium', m.warn ? 'text-amber-600' : 'text-slate-900'].join(' ')}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Urgent filing banner */}
      {pa2pa3Deadline !== null && pa2pa3Deadline <= 30 && (
        <div className="mb-5 rounded-xl border-2 border-red-300 bg-gradient-to-r from-red-50 to-amber-50 p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-semibold text-red-800">Filing Deadline Alert</span>
                <Badge variant="danger">{pa2pa3Deadline}d remaining</Badge>
              </div>
              <p className="text-sm text-red-700">
                PA-2 and PA-3 must be filed by <strong>April 27, 2026</strong> — {pa2pa3Deadline} days left.
                Total filing fee: <strong>$640</strong> ($320 x 2).
              </p>
            </div>
            <button
              onClick={() => navigate('/filing-package')}
              className="flex-shrink-0 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow transition-colors"
            >
              Generate PA-2 + PA-3 Package
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => navigate('/wizard')} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-red-200 hover:border-red-400 transition-colors text-left">
              <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-sm font-bold text-red-700">5</span>
              <div>
                <div className="text-xs font-semibold text-red-800">File PA-5 VADI</div>
                <div className="text-xs text-red-600">$320 — platform moat</div>
              </div>
            </button>
            <button onClick={() => navigate('/wizard')} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-red-200 hover:border-red-400 transition-colors text-left">
              <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700">2</span>
              <div>
                <div className="text-xs font-semibold text-slate-800">File PA-2</div>
                <div className="text-xs text-amber-600">Due April 27 — $320</div>
              </div>
            </button>
            <button onClick={() => navigate('/wizard')} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-red-200 hover:border-red-400 transition-colors text-left">
              <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700">3</span>
              <div>
                <div className="text-xs font-semibold text-slate-800">File PA-3</div>
                <div className="text-xs text-amber-600">Due April 27 — $320</div>
              </div>
            </button>
          </div>
        </div>
      )}

      <Card className="mb-5">
        <CardHeader title="Patent Portfolio — Visionary AI Systems Inc" right={<span className="text-xs text-slate-400">Inventors: Milton & Lisa Overton</span>} />
        {vaisPatents.map(p => <PatentCard key={p.id} patent={p} onOpen={onOpen} />)}
      </Card>

      {newCandidates.length > 0 && (
        <Card className="mb-5">
          <CardHeader title="New Patent Candidates" right={<span className="text-xs text-slate-400">From IP Protection Report — April 2026</span>} />
          {newCandidates.map(p => <PatentCard key={p.id} patent={p} onOpen={onOpen} />)}
        </Card>
      )}

      {crossEntityPatents.length > 0 && (
        <Card className="mb-5">
          <CardHeader title="Cross-Entity Patents" right={<span className="text-xs text-slate-400">Revenue Shield AI, LLC</span>} />
          {crossEntityPatents.map(p => <PatentCard key={p.id} patent={p} onOpen={onOpen} />)}
        </Card>
      )}

      {receipts.length > 0 && (
        <Card className="mb-5">
          <CardHeader title="Filing Receipts" right={<span className="text-xs text-slate-400">{receipts.length} filed</span>} />
          <div className="p-5 pt-2">
            {receipts.map(r => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <div className="text-sm font-medium text-slate-800">{r.patentId} — App #{r.appNumber}</div>
                  <div className="text-xs text-slate-500">Filed {r.filingDate} | {r.entityStatus} | ${r.feesPaid}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-amber-700 font-medium">
                    Nonprovisional: {r.nonprovisionalDeadline}
                  </div>
                  {daysUntil(r.nonprovisionalDeadline) !== null && (
                    <div className="text-xs text-slate-400">{daysUntil(r.nonprovisionalDeadline)}d remaining</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

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
