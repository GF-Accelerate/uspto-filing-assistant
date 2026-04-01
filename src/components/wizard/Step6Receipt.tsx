import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
interface Props { appNum: string; onChange: (v: string) => void; onBack: () => void; onSave: () => void; filedDate?: string }
export function Step6Receipt({ appNum, onChange, onBack, onSave, filedDate }: Props) {
  const deadline = filedDate ? new Date(new Date(filedDate).setFullYear(new Date(filedDate).getFullYear()+1)).toLocaleDateString() : ''
  return (
    <div>
      <p className="text-sm text-slate-500 mb-4 leading-relaxed">After submitting, USPTO generates an Application Number and Filing Receipt. Record it here to activate the 12-month countdown and enable Patent Pending status.</p>
      <div className="mb-4">
        <label className="block text-xs text-slate-500 mb-1">Application Number (from filing receipt)</label>
        <input value={appNum} onChange={e => onChange(e.target.value)} placeholder="e.g., 63/123,456" className="w-full max-w-xs px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="flex gap-2">
        <Button onClick={onBack}>← Back</Button>
        <Button variant="primary" onClick={onSave} disabled={!appNum.trim()}>Save receipt & mark as filed ✓</Button>
      </div>
      {appNum && (
        <Alert variant="success" className="mt-4">
          <div className="font-medium mb-1">✓ Patent Pending — Application {appNum}</div>
          <div className="text-xs space-y-0.5">
            <div>Filed: {filedDate ?? new Date().toLocaleDateString()}</div>
            {deadline && <div>Nonprovisional deadline: <strong>{deadline} — MANDATORY</strong></div>}
            <div className="italic mt-1">You may now use: "Patent Pending — U.S. Application No. {appNum}"</div>
          </div>
        </Alert>
      )}
    </div>
  )
}
