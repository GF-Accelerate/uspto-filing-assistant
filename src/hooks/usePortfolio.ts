import { useState, useCallback, useEffect } from 'react'
import type { Patent } from '@/types/patent'
import { PORTFOLIO_INIT, addOneYear } from '@/lib/uspto'
import { loadPortfolio, savePortfolio } from '@/lib/storage'
import { supabase, loadPortfolioFromCloud, savePortfolioToCloud } from '@/lib/supabase'

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<Patent[]>(() => loadPortfolio() ?? PORTFOLIO_INIT)
  const [cloudSynced, setCloudSynced] = useState(false)

  // On mount + auth change, try loading from cloud
  useEffect(() => {
    if (!supabase) return

    const loadCloud = async () => {
      const { data: { session } } = await supabase!.auth.getSession()
      if (!session) return

      const cloudData = await loadPortfolioFromCloud()
      if (cloudData && cloudData.length > 0) {
        setPortfolio(cloudData)
        savePortfolio(cloudData) // sync to localStorage as offline fallback
        setCloudSynced(true)
      }
    }

    loadCloud()

    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      if (session) loadCloud()
    })

    return () => subscription.unsubscribe()
  }, [])

  const updatePatent = useCallback((id: string, updates: Partial<Patent>) => {
    setPortfolio(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...updates } : p)
      savePortfolio(next)
      // Async cloud sync — fire and forget
      savePortfolioToCloud(next).catch(console.error)
      return next
    })
  }, [])

  const markFiled = useCallback((id: string, appNumber: string) => {
    const today = new Date().toISOString().split('T')[0]
    updatePatent(id, { status:'filed', appNumber, filedDate:today, deadline:addOneYear(today) })
  }, [updatePatent])

  return { portfolio, updatePatent, markFiled, cloudSynced }
}
