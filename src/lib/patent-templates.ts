// Patent template system — clone filing structure across patents
// All 7 patents share the same inventors, assignee, and entity status.
// Only spec text and drawings differ between filings.

import type { ExtractedFilingData, CoverSheetData } from '@/types/patent'
import { getDefaultInventors, getDefaultAssignee } from '@/lib/docx-generator'

export interface PatentTemplate {
  id: string
  name: string
  description: string
  filingData: ExtractedFilingData
  coverData: CoverSheetData
  createdAt: string
}

const TEMPLATES_KEY = 'vais:patent-templates'

function loadTemplates(): PatentTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveTemplates(templates: PatentTemplate[]): void {
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates))
  } catch { /* storage full */ }
}

export function getAllTemplates(): PatentTemplate[] {
  return loadTemplates()
}

export function getTemplate(id: string): PatentTemplate | null {
  return loadTemplates().find(t => t.id === id) ?? null
}

export function saveTemplate(template: Omit<PatentTemplate, 'id' | 'createdAt'>): PatentTemplate {
  const full: PatentTemplate = {
    ...template,
    id: `tmpl-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  const all = loadTemplates()
  all.push(full)
  saveTemplates(all)
  return full
}

export function deleteTemplate(id: string): void {
  const all = loadTemplates().filter(t => t.id !== id)
  saveTemplates(all)
}

// Build the default Visionary AI template from PA-1 filing data
export function getDefaultTemplate(): Omit<PatentTemplate, 'id' | 'createdAt'> {
  const inventors = getDefaultInventors()
  const assignee = getDefaultAssignee()

  return {
    name: 'Visionary AI Standard',
    description: 'Standard template for all Visionary AI Systems provisional patents. Milton & Lisa Overton as inventors, Visionary AI Systems Inc (Delaware) as assignee, Small Entity.',
    filingData: {
      title: '',  // filled per-patent
      technicalField: 'Voice-controlled database interaction systems',
      inventors,
      assignee,
      entityStatus: 'Small Entity',
      filingDate: new Date().toISOString().split('T')[0],
      independentClaims: 4,
      totalClaims: 14,
      hasDrawings: true,
      abstract: '',  // filled per-patent
      keyInnovations: [],
      warnings: [],
    },
    coverData: {
      applicationTitle: '',  // filled per-patent
      inventors: inventors.map(i => i.name),
      correspondence: '1102 Cool Springs Drive, Kennesaw, GA 30144',
      entityStatus: 'Small Entity',
      govInterest: 'None',
      feeEst: '$320.00 (Small Entity provisional)',
      deadline: '',
      patentPending: '',
      reminders: [
        'File nonprovisional within 12 months',
        'Record assignment at assignmentcenter.uspto.gov',
        'Maintain small entity status documentation',
      ],
    },
  }
}

// Apply template to create filing data for a specific patent
export function applyTemplate(
  template: PatentTemplate,
  title: string,
  abstract: string,
  deadline?: string,
): { filingData: ExtractedFilingData; coverData: CoverSheetData } {
  return {
    filingData: {
      ...template.filingData,
      title,
      abstract,
      filingDate: new Date().toISOString().split('T')[0],
    },
    coverData: {
      ...template.coverData,
      applicationTitle: title,
      deadline: deadline ?? '',
    },
  }
}
