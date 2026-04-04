import { useState, useCallback } from 'react'
import { loadFeatureFlags, saveFeatureFlags, type FeatureFlags, type FlagKey } from '@/lib/feature-flags'

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>(loadFeatureFlags)

  const isEnabled = useCallback((key: FlagKey): boolean => {
    return flags[key] ?? false
  }, [flags])

  const toggle = useCallback((key: FlagKey) => {
    setFlags(prev => {
      const next = { ...prev, [key]: !prev[key] }
      saveFeatureFlags(next)
      return next
    })
  }, [])

  const setFlag = useCallback((key: FlagKey, value: boolean) => {
    setFlags(prev => {
      const next = { ...prev, [key]: value }
      saveFeatureFlags(next)
      return next
    })
  }, [])

  return { flags, isEnabled, toggle, setFlag }
}
