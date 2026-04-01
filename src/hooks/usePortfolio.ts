import { useState, useCallback } from 'react'
import type { Patent } from '@/types/patent'
import { PORTFOLIO_INIT, addOneYear } from '@/lib/uspto'
import { loadPortfolio, savePortfolio } from '@/lib/storage'

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<Patent[]>(() => loadPortfolio() ?? PORTFOLIO_INIT)

  const updatePatent = useCallback((id: string, updates: Partial<Patent>) => {
    setPortfolio(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...updates } : p)
      savePortfolio(next)
      return next
    })
  }, [])

  const markFiled = useCallback((id: string, appNumber: string) => {
    const today = new Date().toISOString().split('T')[0]
    updatePatent(id, { status:'filed', appNumber, filedDate:today, deadline:addOneYear(today) })
  }, [updatePatent])

  return { portfolio, updatePatent, markFiled }
}
