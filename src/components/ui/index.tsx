// src/components/ui/index.tsx
// Reusable UI primitives — all styled with Tailwind

import React, { useState } from 'react';
import { clsx } from 'clsx';

// ── Button ────────────────────────────────────────────────────────
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}
export function Btn({ children, variant = 'secondary', size = 'md', className, ...rest }: BtnProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center gap-2 rounded-lg border font-medium transition-colors',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
        variant === 'primary'   && 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700',
        variant === 'secondary' && 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50',
        variant === 'ghost'     && 'bg-transparent text-slate-600 border-transparent hover:bg-slate-100',
        variant === 'danger'    && 'bg-red-600 text-white border-red-600 hover:bg-red-700',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

// ── Card ──────────────────────────────────────────────────────────
interface CardProps { title?: string; titleRight?: React.ReactNode; children: React.ReactNode; className?: string }
export function Card({ title, titleRight, children, className }: CardProps) {
  return (
    <div className={clsx('bg-white border border-slate-200 rounded-xl overflow-hidden', className)}>
      {title && (
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200">
          <span className="font-medium text-sm text-slate-800">{title}</span>
          {titleRight && <span>{titleRight}</span>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────
type BadgeVariant = 'success' | 'info' | 'warning' | 'danger' | 'neutral' | 'mandatory';
interface BadgeProps { children: React.ReactNode; variant?: BadgeVariant; className?: string }
export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
      variant === 'success'   && 'bg-green-50  text-green-700',
      variant === 'info'      && 'bg-blue-50   text-blue-700',
      variant === 'warning'   && 'bg-amber-50  text-amber-700',
      variant === 'danger'    && 'bg-red-50    text-red-700',
      variant === 'mandatory' && 'bg-red-100   text-red-800 font-semibold',
      variant === 'neutral'   && 'bg-slate-100 text-slate-600',
      className
    )}>
      {children}
    </span>
  );
}

// ── Alert ─────────────────────────────────────────────────────────
interface AlertProps { children: React.ReactNode; variant?: 'info' | 'warning' | 'danger' | 'success' }
export function Alert({ children, variant = 'info' }: AlertProps) {
  return (
    <div className={clsx(
      'rounded-lg px-4 py-3 text-sm border',
      variant === 'info'    && 'bg-blue-50  text-blue-800  border-blue-200',
      variant === 'warning' && 'bg-amber-50 text-amber-800 border-amber-200',
      variant === 'danger'  && 'bg-red-50   text-red-800   border-red-200',
      variant === 'success' && 'bg-green-50 text-green-800 border-green-200',
    )}>
      {children}
    </div>
  );
}

// ── Loading Spinner ───────────────────────────────────────────────
interface SpinnerProps { message?: string }
export function Spinner({ message }: SpinnerProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
      <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin flex-shrink-0" />
      <span className="text-sm text-blue-800 font-medium">{message ?? 'Loading…'}</span>
    </div>
  );
}

// ── CopyField ─────────────────────────────────────────────────────
interface CopyFieldProps { label: string; value: string }
export function CopyField({ label, value }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="mb-2.5">
      <div className="text-xs text-slate-500 mb-1 font-medium">{label}</div>
      <div className="flex gap-2 items-center">
        <div className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 truncate text-slate-800">
          {value || '—'}
        </div>
        <button onClick={copy} className="text-xs px-2.5 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-600 whitespace-nowrap">
          {copied ? '✓' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

// ── Section Heading ───────────────────────────────────────────────
export function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-5 mb-2.5 pb-1.5 border-b border-slate-100">
      {children}
    </div>
  );
}

// ── Deadline Badge ────────────────────────────────────────────────
export function DeadlineBadge({ days }: { days: number | null }) {
  if (days === null) return null;
  const variant = days < 0 ? 'mandatory' : days < 30 ? 'danger' : days < 90 ? 'warning' : 'success';
  return (
    <Badge variant={variant}>
      {days < 0 ? 'OVERDUE' : `${days}d left`}
    </Badge>
  );
}
