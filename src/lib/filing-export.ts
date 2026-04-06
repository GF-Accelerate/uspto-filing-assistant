// Filing Export — Structured JSON data for AI-assisted Patent Center form filling
// Generates a PatentCenterFilingData object that Playwright MCP can use to fill forms

import type { ExtractedFilingData } from '@/types/patent'
import { PATENT_SPECS, PORTFOLIO_INIT } from '@/lib/uspto'
import { getDefaultInventors, getDefaultAssignee } from '@/lib/docx-generator'
import { PATENT_DRAWINGS } from '@/lib/patent-drawings'
import { PATENT_CENTER_URL, PATENT_CENTER_MAPPING } from '@/lib/patent-center-mapping'

// ── Shared: buildExtractedData (moved from FilingPackage.tsx) ────

export function buildExtractedData(patentId: string): ExtractedFilingData {
  const patent = PORTFOLIO_INIT.find(p => p.id === patentId)
  const specText = PATENT_SPECS[patentId] ?? ''
  const titleMatch = specText.match(/TITLE:\s*(.+)/)
  const inventors = getDefaultInventors()
  const assignee = getDefaultAssignee()

  return {
    title: titleMatch?.[1] ?? patent?.title ?? 'Untitled Patent',
    technicalField: 'Voice-controlled database interaction systems',
    inventors,
    assignee,
    entityStatus: 'Small Entity',
    filingDate: new Date().toISOString().split('T')[0],
    independentClaims: specText.includes('Independent') ? (specText.match(/\(Independent/g) ?? []).length || 3 : 3,
    totalClaims: 14,
    hasDrawings: true,
    abstract: (specText.match(/ABSTRACT\s*\n\s*\n([\s\S]*?)(?:\n\s*\n[A-Z]|\n\s*$)/)?.[1] ?? '').trim().substring(0, 500),
    keyInnovations: [],
    warnings: [],
  }
}

// ── Address parser ───────────────────────────────────────────────

interface StructuredAddress {
  street: string
  city: string
  state: string
  zip: string
  country: string
}

function parseAddress(address: string): StructuredAddress {
  // Expected format: "1102 Cool Springs Drive, Kennesaw, GA 30144"
  const parts = address.split(',').map(s => s.trim())
  if (parts.length >= 3) {
    const stateZip = parts[parts.length - 1].split(/\s+/)
    return {
      street: parts.slice(0, parts.length - 2).join(', '),
      city: parts[parts.length - 2],
      state: stateZip[0] ?? '',
      zip: stateZip.slice(1).join(' '),
      country: 'US',
    }
  }
  // Fallback: put everything in street
  return { street: address, city: '', state: '', zip: '', country: 'US' }
}

// ── Name parser ──────────────────────────────────────────────────

function parseName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length >= 2) {
    return {
      firstName: parts.slice(0, -1).join(' '),
      lastName: parts[parts.length - 1],
    }
  }
  return { firstName: fullName, lastName: '' }
}

// ── PatentCenterFilingData interface ─────────────────────────────

export interface PatentCenterFilingData {
  exportVersion: '1.0'
  exportedAt: string
  patentId: string

  patentCenterUrl: string
  applicationType: 'provisional'

  applicationDataSheet: {
    title: string
    entityStatus: string
    inventors: Array<{
      firstName: string
      lastName: string
      street: string
      city: string
      state: string
      zip: string
      country: string
      citizenship: string
    }>
    assignee: {
      name: string
      street: string
      city: string
      state: string
      zip: string
      country: string
      organizationType: string
      stateOfIncorporation: string
    }
    correspondence: {
      name: string
      street: string
      city: string
      state: string
      zip: string
      country: string
    }
    governmentInterest: string
  }

  documents: Array<{
    type: string
    filename: string
    format: 'docx' | 'pdf'
    description: string
  }>

  drawingCount: number

  fee: {
    amount: string
    entityType: string
    year: number
    verifyUrl: string
  }

  safetyGates: {
    submitButtonProhibited: true
    humanReviewRequired: true
    checklistItemCount: number
  }

  fieldMapping: typeof PATENT_CENTER_MAPPING
}

// ── Main export function ─────────────────────────────────────────

export function buildFilingExportData(patentId: string): PatentCenterFilingData {
  const data = buildExtractedData(patentId)
  const safeName = patentId.replace(/[^a-zA-Z0-9-]/g, '')
  const drawingFigures = PATENT_DRAWINGS[patentId] ?? []
  const assigneeAddr = parseAddress(data.assignee.address)

  return {
    exportVersion: '1.0',
    exportedAt: new Date().toISOString(),
    patentId,

    patentCenterUrl: PATENT_CENTER_URL,
    applicationType: 'provisional',

    applicationDataSheet: {
      title: data.title,
      entityStatus: data.entityStatus,
      inventors: data.inventors.map(inv => {
        const name = parseName(inv.name)
        const addr = parseAddress(inv.address)
        return {
          firstName: name.firstName,
          lastName: name.lastName,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          zip: addr.zip,
          country: addr.country,
          citizenship: inv.citizenship,
        }
      }),
      assignee: {
        name: data.assignee.name,
        street: assigneeAddr.street,
        city: assigneeAddr.city,
        state: assigneeAddr.state,
        zip: assigneeAddr.zip,
        country: assigneeAddr.country,
        organizationType: data.assignee.type,
        stateOfIncorporation: data.assignee.state,
      },
      correspondence: {
        name: data.assignee.name,
        street: assigneeAddr.street,
        city: assigneeAddr.city,
        state: assigneeAddr.state,
        zip: assigneeAddr.zip,
        country: assigneeAddr.country,
      },
      governmentInterest: 'None',
    },

    documents: [
      {
        type: 'Specification',
        filename: `${safeName}-Specification.docx`,
        format: 'docx',
        description: 'Complete patent specification including claims, abstract, and detailed description',
      },
      {
        type: 'Provisional Cover Sheet (SB16)',
        filename: `${safeName}-Cover-Sheet-PTO-SB-16.docx`,
        format: 'docx',
        description: 'PTO/SB/16 cover sheet with inventor info, assignee, and entity status',
      },
      ...drawingFigures.map((fig, i) => ({
        type: 'Drawings' as const,
        filename: `${safeName}-FIG-${i + 1}.pdf`,
        format: 'pdf' as const,
        description: `FIG. ${i + 1} — ${fig.title}`,
      })),
    ],

    drawingCount: drawingFigures.length,

    fee: {
      amount: '$320.00',
      entityType: 'Small Entity',
      year: 2026,
      verifyUrl: PATENT_CENTER_MAPPING.fees.verifyUrl,
    },

    safetyGates: {
      submitButtonProhibited: true,
      humanReviewRequired: true,
      checklistItemCount: 14,
    },

    fieldMapping: PATENT_CENTER_MAPPING,
  }
}
