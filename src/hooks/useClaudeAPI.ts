import type { WizardState, WizardStep } from '@/types/patent'
import {
  extractFilingData,
  generateCoverSheet as generateCoverSheetAPI,
  validateFiling,
} from '@/lib/claude'

interface Deps {
  wizard: WizardState
  update: (partial: Partial<WizardState>) => void
  setStep: (s: WizardStep) => void
}

export function useClaudeAPI({ wizard, update, setStep }: Deps) {
  const extract = async () => {
    if (!wizard.docInput.trim()) {
      update({ error: 'Paste your patent specification first.' })
      return
    }
    update({ loading: true, loadMsg: 'Claude is analyzing your specification…', error: '' })
    try {
      const aiData = await extractFilingData(wizard.docInput)
      update({ aiData, loading: false })
      setStep(2)
    } catch (e) {
      update({ loading: false, error: `Extraction failed: ${(e as Error).message}` })
    }
  }

  const generateCoverSheet = async () => {
    if (!wizard.aiData) return
    update({ loading: true, loadMsg: 'Generating PTO/SB/16 cover sheet…', error: '' })
    try {
      const coverData = await generateCoverSheetAPI(wizard.aiData)
      update({ coverData, loading: false })
      setStep(3)
    } catch (e) {
      update({ loading: false, error: `Cover sheet failed: ${(e as Error).message}` })
    }
  }

  const validate = async () => {
    update({ loading: true, loadMsg: 'Running USPTO compliance check…', error: '' })
    try {
      const checked = Object.values(wizard.checks).filter(Boolean).length
      const validResult = await validateFiling(wizard.aiData!, checked)
      update({ validResult, loading: false })
    } catch (e) {
      update({ loading: false, error: `Validation failed: ${(e as Error).message}` })
    }
  }

  return { extract, generateCoverSheet, validate }
}
