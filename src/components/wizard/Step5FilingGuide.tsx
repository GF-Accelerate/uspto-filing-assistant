import type { ExtractedFilingData } from '@/types/patent'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { USPTO_URLS } from '@/lib/uspto'

interface Props { aiData: ExtractedFilingData | null; onNext: () => void }

const STEPS = [
  { n:1, title:'Authenticate with ID.me + MFA', url:USPTO_URLS.patentCenter, manual:true, warn:'ID.me requires government photo ID + live video selfie — cannot be automated by any tool.', items:['Go to patentcenter.uspto.gov','Log into your USPTO.gov account','Complete ID.me verification (10-15 min)','Set up MFA with Okta Verify on your phone','Complete Patent Center self-enrollment as Independent Inventor'] },
  { n:2, title:'Start new provisional application', url:USPTO_URLS.patentCenter, manual:true, items:['Click File → File a New Application','Choose Provisional Application (35 U.S.C. 111(b))','Select Small Entity status'] },
  { n:3, title:'Complete Application Data Sheet', url:null, manual:true, items:[] },
  { n:4, title:'Upload documents', url:null, manual:true, items:['Upload Specification (DOCX)','Upload PTO/SB/16 cover sheet (PDF)','Upload drawings (PDF, if available)','Click Validate DOCX → review preview'] },
  { n:5, title:'Pay filing fee (~$320 Small Entity)', url:null, manual:true, items:['Select credit/debit card or EFT','Verify current fee at USPTO fee schedule','Save payment confirmation email'] },
  { n:6, title:'Final review + Submit — HITL gate', url:null, manual:true, warn:'Review EVERYTHING before clicking Submit. This cannot be undone. Only you can click Submit.', items:['Review all documents in preview','Confirm inventor names have no typos','Confirm Small Entity status selected','Click SUBMIT','Save filing receipt with Application Number'] },
]

export function Step5FilingGuide({ aiData, onNext }: Props) {
  const inv = aiData?.inventors ?? []
  const steps = STEPS.map(s => s.n === 3 ? { ...s, items:[
    `Title: ${aiData?.title ?? '[your patent title]'}`,
    `Inventor 1: ${inv[0]?.name ?? 'Milton Overton'}, ${inv[0]?.address ?? 'Kennesaw, GA 30144'}`,
    `Inventor 2: ${inv[1]?.name ?? 'Lisa Overton'}, ${inv[1]?.address ?? 'Kennesaw, GA 30144'}`,
    `Assignee: ${aiData?.assignee?.name ?? 'Visionary AI Systems Inc'}, Kennesaw GA`,
    'Entity Status: Small Entity', 'U.S. Government Interest: None',
  ]} : s)
  return (
    <div>
      {steps.map(step => (
        <div key={step.n} className="mb-3 border border-slate-200 rounded-lg overflow-hidden">
          <div className={['flex items-center gap-3 px-4 py-2.5 text-sm font-medium', step.manual ? 'bg-amber-50' : 'bg-green-50'].join(' ')}>
            <div className={['w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white', step.manual ? 'bg-amber-500' : 'bg-green-600'].join(' ')}>{step.n}</div>
            <span className="flex-1">{step.title}</span>
            {step.manual && <span className="text-xs text-amber-700 font-medium">human action required</span>}
            {step.url && <a href={step.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-medium">Open ↗</a>}
          </div>
          <div className="px-4 py-3">
            {step.warn && <Alert variant="danger" className="mb-2 text-xs">{step.warn}</Alert>}
            {step.items.map((item,i) => <div key={i} className="text-xs text-slate-700 py-1 flex gap-2"><span className="text-slate-400 min-w-[16px]">{i+1}.</span>{item}</div>)}
          </div>
        </div>
      ))}
      <Button variant="primary" onClick={onNext}>Continue to receipt recording →</Button>
    </div>
  )
}
