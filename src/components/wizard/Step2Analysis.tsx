import type { ExtractedFilingData } from '@/types/patent'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { CopyField } from '@/components/ui/CopyField'
import { Button } from '@/components/ui/Button'
import { SectionHead } from '@/components/shared/SectionHead'
interface Props { data: ExtractedFilingData; onNext: () => void; onBack: () => void; loading: boolean }
export function Step2Analysis({ data, onNext, onBack, loading }: Props) {
  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Badge variant="success">{data.entityStatus}</Badge>
        <Badge variant="neutral">{data.independentClaims}i / {data.totalClaims} claims</Badge>
        <Badge variant={data.hasDrawings ? 'success' : 'warning'}>{data.hasDrawings ? 'Drawings ✓' : 'Drawings missing'}</Badge>
      </div>
      <CopyField label="Title" value={data.title} />
      <CopyField label="Technical field" value={data.technicalField} />
      {data.inventors?.map((inv, i) => <CopyField key={i} label={`Inventor ${i+1}`} value={`${inv.name} — ${inv.address} — ${inv.citizenship}`} />)}
      <CopyField label="Assignee" value={`${data.assignee?.name}, ${data.assignee?.address}`} />
      {data.abstract && <><SectionHead>Abstract</SectionHead><p className="text-sm text-slate-700 bg-slate-50 rounded p-3 mb-3 leading-relaxed">{data.abstract}</p></>}
      {data.keyInnovations?.length > 0 && <><SectionHead>Key innovations</SectionHead>{data.keyInnovations.map((inn,i) => <div key={i} className="text-sm text-slate-700 py-1 flex gap-2"><span className="text-green-600">✓</span>{inn}</div>)}</>}
      {data.warnings?.length > 0 && <Alert variant="warning" className="mt-3">{data.warnings.map((w,i) => <div key={i}>⚠ {w}</div>)}</Alert>}
      <div className="flex gap-2 mt-4">
        <Button variant="primary" onClick={onNext} disabled={loading}>Generate cover sheet ↗</Button>
        <Button onClick={onBack}>← Edit</Button>
      </div>
    </div>
  )
}
