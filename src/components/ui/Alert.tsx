import { clsx } from 'clsx'
import type { ReactNode } from 'react'

interface Props { children: ReactNode; variant?: 'info'|'warning'|'danger'|'success'; className?: string }

export function Alert({ children, variant='info', className }: Props) {
  return (
    <div className={clsx(
      'rounded p-3 text-sm border',
      variant==='info'    && 'bg-blue-50 text-blue-800 border-blue-200',
      variant==='warning' && 'bg-amber-50 text-amber-800 border-amber-200',
      variant==='danger'  && 'bg-red-50 text-red-800 border-red-200',
      variant==='success' && 'bg-green-50 text-green-800 border-green-200',
      className
    )}>{children}</div>
  )
}
