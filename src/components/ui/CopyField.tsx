import { useState } from 'react'

interface Props { label: string; value: string }

export function CopyField({ label, value }: Props) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <div className="mb-3">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="flex gap-2">
        <div className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm text-slate-800 truncate">{value || '—'}</div>
        <button onClick={copy} className="px-3 py-1.5 text-xs border border-slate-200 rounded hover:bg-slate-50 text-slate-500 whitespace-nowrap">
          {copied ? '✓' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
