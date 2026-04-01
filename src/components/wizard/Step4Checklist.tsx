import type { ValidationResult, ChecklistState } from '@/types/patent'
import { CHECKLIST_ITEMS } from '@/lib/uspto'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { SectionHead } from '@/components/shared/SectionHead'

interface Props {
  checks: ChecklistState
  validResult: ValidationResult | null
  onToggle: (id: string, v: boolean) => void
  onValidate: () => void; onNext: () => void; loading: boolean
}

const SECTIONS = ['Inventors','Application','Documents','Authentication','Filing'] as const

export function Step4Checklist({ checks, validResult, onToggle, onValidate, onNext, loading }: Props) {
  const total = CHECKLIST_ITEMS.length
  const checked = CHECKLIST_ITEMS.filter(c => checks[c.id]).length
  const allOk = checked === total

  return (
    <div>
      <Alert variant="warning" className="mb-4">Check every item before filing. <strong>Do not file until all 14 items are confirmed.</strong></Alert>
      {SECTIONS.map(sec => (
        <div key={sec}>
          <SectionHead>{sec}</SectionHead>
          {CHECKLIST_ITEMS.filter(c => c.section === sec).map(item => (
            <label key={item.id} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0 cursor-pointer">
              <input type="checkbox" checked={!!checks[item.id]} onChange={e => onToggle(item.id, e.target.checked)} className="mt-0.5 w-4 h-4 accent-green-600" />
              <span className={['text-sm', checks[item.id] ? 'text-green-700 font-medium' : 'text-slate-700'].join(' ')}>{item.label}</span>
            </label>
          ))}
        </div>
      ))}
      <div className={['mt-4 p-3 rounded text-center text-sm font-medium', allOk ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'].join(' ')}>
        {allOk ? '✓ All 14 items verified — ready to file' : `${total - checked} items remaining`}
      </div>
      <div className="flex gap-2 mt-4 flex-wrap">
        <Button variant="primary" onClick={onValidate} disabled={!allOk || loading}>Run AI compliance check ↗</Button>
        {allOk && <Button variant="primary" onClick={onNext}>Continue to filing guide →</Button>}
      </div>
      {validResult && (
        <div className="mt-4 bg-slate-50 border border-slate-200 rounded p-4">
          <div className={['text-sm font-medium mb-2', validResult.status.includes('READY') ? 'text-green-700' : 'text-red-700'].join(' ')}>
            {validResult.status.includes('READY') ? '✓' : '✗'} {validResult.status} — Score: {validResult.score}/100
          </div>
          {validResult.critical?.length > 0 && <Alert variant="danger" className="mb-2">{validResult.critical.map((b,i) => <div key={i}>• {b}</div>)}</Alert>}
          {validResult.recs?.length > 0 && <div>{validResult.recs.map((r,i) => <div key={i} className="text-sm text-slate-600 py-0.5">• {r}</div>)}</div>}
        </div>
      )}
    </div>
  )
}
