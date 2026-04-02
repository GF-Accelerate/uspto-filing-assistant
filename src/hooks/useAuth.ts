import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, signIn, signUp, signInWithGoogle, signOut, isSupabaseConfigured } from '@/lib/supabase'

export interface AuthState {
  user: User | null
  loading: boolean
  error: string
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, error: '' })

  useEffect(() => {
    if (!supabase) { setState({ user: null, loading: false, error: '' }); return }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ user: session?.user ?? null, loading: false, error: '' })
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(prev => ({ ...prev, user: session?.user ?? null, loading: false }))
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, loading: true, error: '' }))
    const { error } = await signIn(email, password)
    if (error) setState(s => ({ ...s, loading: false, error: error.message }))
  }, [])

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    setState(s => ({ ...s, loading: true, error: '' }))
    const { error } = await signUp(email, password, fullName)
    if (error) setState(s => ({ ...s, loading: false, error: error.message }))
    else setState(s => ({ ...s, loading: false, error: '' }))
  }, [])

  const loginWithGoogle = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: '' }))
    const { error } = await signInWithGoogle()
    if (error) setState(s => ({ ...s, loading: false, error: error.message }))
  }, [])

  const logout = useCallback(async () => {
    await signOut()
    setState({ user: null, loading: false, error: '' })
  }, [])

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,
    isConfigured: isSupabaseConfigured(),
    login,
    register,
    loginWithGoogle,
    logout,
  }
}
