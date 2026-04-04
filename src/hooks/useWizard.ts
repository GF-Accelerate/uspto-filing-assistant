import { useState, useCallback, useEffect } from 'react'
import type { WizardState, WizardStep, ChecklistState } from '@/types/patent'

const WIZARD_KEY = 'vais:wizard-session'

const INITIAL: WizardState = {
  activePatentId:null, step:1, docInput:'', aiData:null, coverData:null,
  checks:{}, validResult:null, appNum:'', loading:false, loadMsg:'', error:''
}

function loadSavedWizard(): WizardState | null {
  try {
    const raw = localStorage.getItem(WIZARD_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw) as WizardState
    // Reset transient state that shouldn't persist
    return { ...saved, loading: false, loadMsg: '', error: '' }
  } catch {
    return null
  }
}

function persistWizard(state: WizardState): void {
  try {
    if (!state.activePatentId) {
      localStorage.removeItem(WIZARD_KEY)
      return
    }
    // Only save if there's meaningful progress (past step 1 or has input)
    if (state.step > 1 || state.docInput.length > 0) {
      localStorage.setItem(WIZARD_KEY, JSON.stringify(state))
    }
  } catch { /* storage full */ }
}

export function useWizard() {
  const [wizard, setWizard] = useState<WizardState>(INITIAL)
  const [hasSavedSession, setHasSavedSession] = useState(false)

  // Check for saved session on mount
  useEffect(() => {
    const saved = loadSavedWizard()
    if (saved?.activePatentId) {
      setHasSavedSession(true)
    }
  }, [])

  // Persist wizard state on changes (debounced by React batching)
  useEffect(() => {
    persistWizard(wizard)
  }, [wizard])

  const open = useCallback((patentId: string) =>
    setWizard({ ...INITIAL, activePatentId:patentId }), [])

  const close = useCallback(() => {
    setWizard(INITIAL)
    setHasSavedSession(false)
    localStorage.removeItem(WIZARD_KEY)
  }, [])

  const resumeSaved = useCallback(() => {
    const saved = loadSavedWizard()
    if (saved) {
      setWizard(saved)
      setHasSavedSession(false)
    }
  }, [])

  const discardSaved = useCallback(() => {
    localStorage.removeItem(WIZARD_KEY)
    setHasSavedSession(false)
  }, [])

  const setStep = useCallback((step: WizardStep) =>
    setWizard(w => ({ ...w, step })), [])

  const update = useCallback((partial: Partial<WizardState>) =>
    setWizard(w => ({ ...w, ...partial })), [])

  const toggleCheck = useCallback((id: string, val: boolean) =>
    setWizard(w => ({ ...w, checks:{ ...w.checks, [id]:val } as ChecklistState })), [])

  return { wizard, open, close, setStep, update, toggleCheck, hasSavedSession, resumeSaved, discardSaved }
}
