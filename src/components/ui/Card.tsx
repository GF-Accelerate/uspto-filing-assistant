import { clsx } from 'clsx'
import type { ReactNode } from 'react'

interface CardProps { children: ReactNode; className?: string }
interface CardHeaderProps { title: ReactNode; right?: ReactNode; className?: string }

export function Card({ children, className }: CardProps) {
  return <div className={clsx('bg-white border border-slate-200 rounded-lg overflow-hidden', className)}>{children}</div>
}

export function CardHeader({ title, right, className }: CardHeaderProps) {
  return (
    <div className={clsx('px-5 py-3.5 border-b border-slate-100 flex items-center gap-3', className)}>
      <div className="font-medium text-sm text-slate-900 flex-1">{title}</div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  )
}

export function CardBody({ children, className }: CardProps) {
  return <div className={clsx('p-5', className)}>{children}</div>
}
