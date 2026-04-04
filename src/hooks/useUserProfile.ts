import { useState, useEffect, useCallback } from 'react'
import { supabase, getUserProfile } from '@/lib/supabase'

export interface UserProfile {
  id: string
  org_id: string | null
  full_name: string
  email: string
  role: string
  avatar_url: string | null
  preferences: Record<string, unknown> | null
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!supabase) { setLoading(false); return }
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setProfile(null); setLoading(false); return }
      const data = await getUserProfile(user.id)
      setProfile(data as UserProfile | null)
    } catch {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    if (!supabase) return
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { load() })
    return () => subscription.unsubscribe()
  }, [load])

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'org_admin'
  const isManager = isAdmin || profile?.role === 'patent_manager'

  return { profile, loading, isAdmin, isManager, reload: load }
}
