import { useState, useCallback } from 'react'
import type { WizardState, WizardStep, ChecklistState } from '@/types/patent'

const INITIAL: WizardState = {
  activePatentId:null, step:1, docInput:'', aiData:null, coverData:null,
  checks:{}, validResult:null, appNum:'', loading:false, loadMsg:'', error:''
}

export function useWizard() {
  const [wizard, setWizard] = useState<WizardState>(INITIAL)

  const open = useCallback((patentId: string) =>
    setWizard({ ...INITIAL, activePatentId:patentId }), [])

  const close = useCallback(() => setWizard(INITIAL), [])

  const setStep = useCallback((step: WizardStep) =>
    setWizard(w => ({ ...w, step })), [])

  const update = useCallback((partial: Partial<WizardState>) =>
    setWizard(w => ({ ...w, ...partial })), [])

  const toggleCheck = useCallback((id: string, val: boolean) =>
    setWizard(w => ({ ...w, checks:{ ...w.checks, [id]:val } as ChecklistState })), [])

  return { wizard, open, close, setStep, update, toggleCheck }
}
