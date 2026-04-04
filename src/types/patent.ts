// All domain types — import from here, never redefine elsewhere
export type PatentStatus = 'filed' | 'ready' | 'draft' | 'planned' | 'filing' | 'prosecution' | 'granted' | 'abandoned'
export type EntityStatus = 'Small Entity' | 'Large Entity' | 'Micro Entity'

export interface Inventor { name: string; address: string; citizenship: string }
export interface Assignee { name: string; address: string; type: string; state: string }

export interface Patent {
  id: string; title: string; status: PatentStatus
  filedDate: string | null; appNumber: string; deadline: string | null; priority: 1 | 2 | 3
}

export interface ExtractedFilingData {
  title: string; technicalField: string; inventors: Inventor[]; assignee: Assignee
  entityStatus: EntityStatus; filingDate: string; independentClaims: number
  totalClaims: number; hasDrawings: boolean; abstract: string
  keyInnovations: string[]; warnings: string[]
}

export interface CoverSheetData {
  applicationTitle: string; inventors: string[]; correspondence: string
  entityStatus: EntityStatus; govInterest: string; feeEst: string
  deadline: string; patentPending: string; reminders: string[]
}

export interface ValidationResult {
  status: 'READY TO FILE' | 'ISSUES FOUND'; score: number
  passed: string[]; issues: string[]; critical: string[]; recs: string[]
}

export type ChecklistState = Record<string, boolean>
export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6

export interface WizardState {
  activePatentId: string | null; step: WizardStep; docInput: string
  aiData: ExtractedFilingData | null; coverData: CoverSheetData | null
  checks: ChecklistState; validResult: ValidationResult | null
  appNum: string; loading: boolean; loadMsg: string; error: string
}
