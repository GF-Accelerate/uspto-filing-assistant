import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import type { useAuth } from '@/hooks/useAuth'

interface Props {
  auth: ReturnType<typeof useAuth>
  onClose: () => void
}

export function AuthModal({ auth, onClose }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [done, setDone] = useState(false)

  const submit = async () => {
    if (mode === 'login') {
      await auth.login(email, password)
      if (!auth.error) onClose()
    } else {
      await auth.register(email, password, name)
      setDone(true)
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-xl border border-slate-200 p-6 w-full max-w-sm mx-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-medium text-base text-slate-900">
              {mode === 'login' ? 'Sign in to USPTO Filing Assistant' : 'Create your account'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Cloud sync your portfolio across devices</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg leading-none">×</button>
        </div>

        {done ? (
          <Alert variant="success">
            <p className="font-medium mb-1">Check your email</p>
            <p className="text-xs">We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.</p>
            <Button size="sm" className="mt-3" onClick={onClose}>Got it</Button>
          </Alert>
        ) : (
          <>
            <Button
              onClick={auth.loginWithGoogle}
              disabled={auth.loading}
              className="w-full mb-3 flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </Button>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">or</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {mode === 'register' && (
              <div className="mb-3">
                <label className="block text-xs text-slate-500 mb-1">Full name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Milton Overton"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}

            <div className="mb-3">
              <label className="block text-xs text-slate-500 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="moverton7474@gmail.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="mb-4">
              <label className="block text-xs text-slate-500 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && submit()}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {auth.error && <Alert variant="danger" className="mb-3 text-xs">{auth.error}</Alert>}

            <Button variant="primary" onClick={submit} disabled={auth.loading || !email || !password}
              className="w-full">
              {auth.loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </Button>

            <p className="text-xs text-center text-slate-500 mt-3">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-blue-600 hover:underline">
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
