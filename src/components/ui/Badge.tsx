import { clsx } from 'clsx'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  variant?: 'success'|'info'|'warning'|'danger'|'neutral'
  className?: string
}

export function Badge({ children, variant='neutral', className }: Props) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
      variant==='success' && 'bg-green-50 text-green-700',
      variant==='info'    && 'bg-blue-50 text-blue-700',
      variant==='warning' && 'bg-amber-50 text-amber-700',
      variant==='danger'  && 'bg-red-50 text-red-700',
      variant==='neutral' && 'bg-slate-100 text-slate-600',
      className
    )}>{children}</span>
  )
}
