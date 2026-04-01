import type { CoverSheetData } from '@/types/patent'
import { Alert } from '@/components/ui/Alert'
import { CopyField } from '@/components/ui/CopyField'
import { Button } from '@/components/ui/Button'
import { SectionHead } from '@/components/shared/SectionHead'
import { USPTO_URLS } from '@/lib/uspto'
interface Props { data: CoverSheetData | null; onGenerate: () => void; onBack: () => void; onNext: () => void; loading: boolean }
export function Step3CoverSheet({ data, onGenerate, onBack, onNext, loading }: Props) {
  return (
    <div>
      <Alert variant="warning" className="mb-4">PTO/SB/16 is a <strong>required separate document</strong>. Download the blank form, fill in the fields below, and upload it alongside your specification in Patent Center.</Alert>
      {data ? (
        <>
          <CopyField label="Application title" value={data.applicationTitle} />
          {data.inventors?.map((inv,i) => <CopyField key={i} label={`Inventor ${i+1}`} value={inv} />)}
          <CopyField label="Correspondence address" value={data.correspondence} />
          <CopyField label="Entity status" value={data.entityStatus} />
          <CopyField label="U.S. Government interest" value={data.govInterest} />
          <CopyField label="Filing fee estimate" value={data.feeEst} />
          <CopyField label="⏰ Nonprovisional deadline" value={data.deadline} />
          <CopyField label="Patent pending notice" value={data.patentPending} />
          {data.reminders?.length > 0 && <><SectionHead>Reminders</SectionHead>{data.reminders.map((r,i) => <div key={i} className="text-sm text-slate-700 py-1">→ {r}</div>)}</>}
          <div className="flex gap-2 mt-4 flex-wrap">
            <a href={USPTO_URLS.coverSheet} target="_blank" rel="noreferrer"><Button>Download PTO/SB/16 ↗</Button></a>
            <Button onClick={onBack}>← Back</Button>
            <Button variant="primary" onClick={onNext}>Continue to checklist →</Button>
          </div>
        </>
      ) : (
        <div className="flex gap-2">
          <Button onClick={onBack}>← Back</Button>
          <Button variant="primary" onClick={onGenerate} disabled={loading}>Generate cover sheet ↗</Button>
        </div>
      )}
    </div>
  )
}
