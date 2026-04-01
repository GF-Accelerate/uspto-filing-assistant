import { clsx } from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
}

export function Button({ variant='secondary', size='md', className, children, ...props }: Props) {
  return (
    <button
      className={clsx(
        'inline-flex items-center gap-2 rounded font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
        size==='sm'  ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
        variant==='primary'   && 'bg-blue-600 text-white hover:bg-blue-700',
        variant==='secondary' && 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
        variant==='danger'    && 'bg-red-600 text-white hover:bg-red-700',
        variant==='ghost'     && 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
