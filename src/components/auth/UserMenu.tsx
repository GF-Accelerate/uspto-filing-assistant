import { useState } from 'react'
import type { useAuth } from '@/hooks/useAuth'

interface Props {
  auth: ReturnType<typeof useAuth>
  onShowLogin: () => void
}

export function UserMenu({ auth, onShowLogin }: Props) {
  const [open, setOpen] = useState(false)

  if (!auth.isConfigured) return null

  if (!auth.isAuthenticated) {
    return (
      <button
        onClick={onShowLogin}
        className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium"
      >
        Sign in
      </button>
    )
  }

  const initials = auth.user?.user_metadata?.full_name
    ?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    ?? auth.user?.email?.slice(0, 2).toUpperCase()
    ?? 'U'

  const email = auth.user?.email ?? ''
  const name  = auth.user?.user_metadata?.full_name ?? email

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg hover:bg-slate-50 px-2 py-1 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700 flex-shrink-0">
          {initials}
        </div>
        <span className="text-xs text-slate-600 hidden sm:block">{name.split(' ')[0]}</span>
        <span className="text-slate-400 text-xs">▾</span>
      </button>

      {open && (
        <>
          <div style={{ position:'fixed', inset:0, zIndex:40 }} onClick={() => setOpen(false)} />
          <div style={{ position:'absolute', right:0, top:'100%', marginTop:4, zIndex:50, minWidth:200 }}
            className="bg-white border border-slate-200 rounded-xl shadow-sm py-1">
            <div className="px-4 py-2 border-b border-slate-100">
              <p className="text-xs font-medium text-slate-900">{name}</p>
              <p className="text-xs text-slate-400">{email}</p>
            </div>
            <div className="px-3 py-1.5">
              <div className="flex items-center gap-2 px-1 py-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-slate-600">Portfolio synced to cloud</span>
              </div>
              <div className="flex items-center gap-2 px-1 py-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-slate-600">Wizard sessions saved</span>
              </div>
            </div>
            <div className="border-t border-slate-100 mt-1 pt-1 px-2">
              <button
                onClick={() => { auth.logout(); setOpen(false) }}
                className="w-full text-left px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
