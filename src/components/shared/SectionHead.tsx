import type { ReactNode } from 'react'
export function SectionHead({ children }: { children: ReactNode }) {
  return <div className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-5 mb-2 pb-1.5 border-b border-slate-100">{children}</div>
}
