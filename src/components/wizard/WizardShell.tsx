import type { ReactNode } from 'react'
import type { WizardStep } from '@/types/patent'
import { Card, CardHeader } from '@/components/ui/Card'

const STEPS = [
  { id:1, label:'Input' },
  { id:2, label:'AI Analysis' },
  { id:3, label:'Cover Sheet' },
  { id:4, label:'Validate' },
  { id:5, label:'File Guide' },
  { id:6, label:'Receipt' },
]

interface Props {
  title: string; step: WizardStep; patentId: string
  onStep: (s: WizardStep) => void; children: ReactNode
}

export function WizardShell({ title, step, patentId, onStep, children }: Props) {
  return (
    <Card className="mb-4">
      <CardHeader
        title={<><span className="text-xs text-slate-400 mr-2">{patentId}</span>{title}</>}
        right={
          <div className="flex gap-1.5">
            {STEPS.map(s => (
              <button key={s.id} onClick={() => s.id <= step && onStep(s.id as WizardStep)}
                className={[
                  'flex flex-col items-center gap-1 px-2',
                  s.id <= step ? 'cursor-pointer' : 'cursor-default',
                ].join(' ')}>
                <div className={[
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                  s.id < step  ? 'bg-green-100 text-green-700' :
                  s.id === step ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400',
                ].join(' ')}>
                  {s.id < step ? '✓' : s.id}
                </div>
                <span className={['text-[9px] leading-none', s.id === step ? 'text-slate-700' : 'text-slate-400'].join(' ')}>
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        }
      />
      <div className="p-5">{children}</div>
    </Card>
  )
}
