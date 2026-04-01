import { Button } from '@/components/ui/Button'
interface Props { value: string; onChange: (v: string) => void; onAnalyze: () => void; loading: boolean }
export function Step1Input({ value, onChange, onAnalyze, loading }: Props) {
  return (
    <div>
      <p className="text-sm text-slate-500 mb-3 leading-relaxed">Paste the full text of your provisional patent application. Claude will extract all required USPTO filing data.</p>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={12} className="w-full px-3 py-2 border border-slate-200 rounded text-sm font-mono bg-slate-50 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={"TITLE: System and Method for...\n\nINVENTORS: Milton Overton, Kennesaw GA...\n\nASSIGNEE: Visionary AI Systems Inc..."} />
      <div className="flex items-center gap-3 mt-3">
        <Button variant="primary" onClick={onAnalyze} disabled={loading || !value.trim()}>Analyze with AI ↗</Button>
        <span className="text-xs text-slate-400">{value.length.toLocaleString()} chars</span>
      </div>
    </div>
  )
}
