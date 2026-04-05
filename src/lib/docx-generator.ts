// DOCX Generator — USPTO-compliant document generation
// Uses the `docx` npm library to produce DOCX files meeting 37 CFR 1.52:
// - Times New Roman 12pt, black text on white background
// - 1 inch margins all sides (1440 twips)
// - 1.5 line spacing (360 twips)
// - No comments, no shading, no tracked changes
// - Single column, portrait orientation, US Letter (8.5 x 11")

import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  Packer,
  SectionType,
  convertInchesToTwip,
  PageOrientation,
} from 'docx'
import { saveAs } from 'file-saver'
import type { ExtractedFilingData, CoverSheetData, Inventor } from '@/types/patent'

// ── Constants ────────────────────────────────────────────────────

const FONT_NAME = 'Times New Roman'
const FONT_SIZE = 24 // half-points → 12pt
const HEADING_SIZE = 28 // 14pt for headings
const TITLE_SIZE = 32 // 16pt for document title
const LINE_SPACING = 360 // 1.5 line spacing in twips
const MARGIN = convertInchesToTwip(1) // 1 inch margins

const DEFAULT_SECTION = {
  page: {
    size: {
      width: convertInchesToTwip(8.5),
      height: convertInchesToTwip(11),
      orientation: PageOrientation.PORTRAIT,
    },
    margin: {
      top: MARGIN,
      right: MARGIN,
      bottom: MARGIN,
      left: MARGIN,
    },
  },
}

// ── Helper: create a styled text run ─────────────────────────────

function text(content: string, opts: { bold?: boolean; italic?: boolean; size?: number } = {}): TextRun {
  return new TextRun({
    text: content,
    font: FONT_NAME,
    size: opts.size ?? FONT_SIZE,
    bold: opts.bold ?? false,
    italics: opts.italic ?? false,
    color: '000000',
  })
}

// ── Helper: create a standard paragraph ──────────────────────────

function para(
  content: string | TextRun[],
  opts: {
    heading?: typeof HeadingLevel[keyof typeof HeadingLevel]
    alignment?: typeof AlignmentType[keyof typeof AlignmentType]
    bold?: boolean
    spacing?: { before?: number; after?: number }
    indent?: { left?: number }
  } = {}
): Paragraph {
  const children = typeof content === 'string'
    ? [text(content, { bold: opts.bold, size: opts.heading ? HEADING_SIZE : undefined })]
    : content

  return new Paragraph({
    children,
    heading: opts.heading,
    alignment: opts.alignment ?? AlignmentType.LEFT,
    spacing: {
      line: LINE_SPACING,
      before: opts.spacing?.before ?? 0,
      after: opts.spacing?.after ?? 120,
    },
    indent: opts.indent,
  })
}

// ── Helper: section heading ──────────────────────────────────────

function sectionHeading(title: string): Paragraph {
  return new Paragraph({
    children: [text(title, { bold: true, size: HEADING_SIZE })],
    alignment: AlignmentType.LEFT,
    spacing: { line: LINE_SPACING, before: 240, after: 120 },
  })
}

// ── Helper: numbered paragraph (patent convention) ───────────────

function numberedPara(number: string, content: string): Paragraph {
  return new Paragraph({
    children: [
      text(`[${number}] `, { bold: true }),
      text(content),
    ],
    spacing: { line: LINE_SPACING, before: 0, after: 120 },
  })
}

// ── Generate Specification DOCX ──────────────────────────────────

export async function generateSpecDOCX(
  specText: string,
  title: string,
  _patentId: string
): Promise<Blob> {
  // Parse the specification text into sections
  // _patentId reserved for future use (file naming, metadata)
  const sections = parseSpecSections(specText)

  const children: Paragraph[] = []

  // Title
  children.push(new Paragraph({
    children: [text('UNITED STATES PROVISIONAL PATENT APPLICATION', { bold: true, size: TITLE_SIZE })],
    alignment: AlignmentType.CENTER,
    spacing: { line: LINE_SPACING, after: 120 },
  }))
  children.push(new Paragraph({
    children: [text('35 U.S.C. § 111(b)', { italic: true })],
    alignment: AlignmentType.CENTER,
    spacing: { line: LINE_SPACING, after: 240 },
  }))
  children.push(new Paragraph({
    children: [text(title, { bold: true, size: HEADING_SIZE })],
    alignment: AlignmentType.CENTER,
    spacing: { line: LINE_SPACING, after: 360 },
  }))

  // Parse and add each section
  for (const section of sections) {
    if (section.heading) {
      children.push(sectionHeading(section.heading))
    }
    for (const line of section.lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      // Detect numbered paragraphs [0001], [0002], etc.
      const numMatch = trimmed.match(/^\[(\d+)\]\s*(.*)/)
      if (numMatch) {
        children.push(numberedPara(numMatch[1], numMatch[2]))
      } else if (trimmed.startsWith('Claim ') || trimmed.startsWith('CLAIM ')) {
        children.push(para(trimmed, { bold: true, spacing: { before: 120 } }))
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        children.push(para(trimmed.substring(2), { indent: { left: convertInchesToTwip(0.5) } }))
      } else {
        children.push(para(trimmed))
      }
    }
  }

  const doc = new Document({
    sections: [{
      properties: {
        ...DEFAULT_SECTION,
        type: SectionType.CONTINUOUS,
      },
      children,
    }],
  })

  return await Packer.toBlob(doc)
}

// ── Generate Cover Sheet DOCX ────────────────────────────────────

export async function generateCoverSheetDOCX(
  data: ExtractedFilingData,
  coverData: CoverSheetData | null,
  _patentId: string
): Promise<Blob> {
  // _patentId reserved for future use (file naming, metadata)
  const children: (Paragraph | Table)[] = []

  // CRITICAL: This heading enables USPTO auto-detection as "Provisional Cover Sheet (SB16)"
  children.push(new Paragraph({
    children: [text('PROVISIONAL APPLICATION COVER SHEET', { bold: true, size: TITLE_SIZE })],
    alignment: AlignmentType.CENTER,
    spacing: { line: LINE_SPACING, after: 120 },
  }))
  children.push(new Paragraph({
    children: [text('(PTO/SB/16)', { italic: true })],
    alignment: AlignmentType.CENTER,
    spacing: { line: LINE_SPACING, after: 360 },
  }))

  // Application Title
  children.push(sectionHeading('TITLE OF INVENTION'))
  children.push(para(data.title, { bold: true }))

  // Inventors
  children.push(sectionHeading('INVENTOR(S)'))
  const inventorRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({ children: [para('Name', { bold: true })], width: { size: 33, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [para('Address', { bold: true })], width: { size: 34, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [para('Citizenship', { bold: true })], width: { size: 33, type: WidthType.PERCENTAGE } }),
      ],
    }),
  ]

  for (const inv of data.inventors) {
    inventorRows.push(new TableRow({
      children: [
        new TableCell({ children: [para(inv.name)] }),
        new TableCell({ children: [para(inv.address)] }),
        new TableCell({ children: [para(inv.citizenship)] }),
      ],
    }))
  }

  children.push(new Table({
    rows: inventorRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  }))

  // Correspondence Address
  children.push(sectionHeading('CORRESPONDENCE ADDRESS'))
  children.push(para(coverData?.correspondence ?? `${data.assignee.name}, ${data.assignee.address}`))

  // Entity Status
  children.push(sectionHeading('ENTITY STATUS'))
  children.push(para(data.entityStatus))

  // Assignee
  children.push(sectionHeading('APPLICANT / ASSIGNEE'))
  children.push(para([
    text('Company: ', { bold: true }),
    text(data.assignee.name),
  ]))
  children.push(para([
    text('Type: ', { bold: true }),
    text(`${data.assignee.type}, ${data.assignee.state}`),
  ]))
  children.push(para([
    text('Address: ', { bold: true }),
    text(data.assignee.address),
  ]))

  // Claims and Drawings
  children.push(sectionHeading('APPLICATION CONTENTS'))
  children.push(para([
    text('Independent Claims: ', { bold: true }),
    text(String(data.independentClaims)),
  ]))
  children.push(para([
    text('Total Claims: ', { bold: true }),
    text(String(data.totalClaims)),
  ]))
  children.push(para([
    text('Drawings Included: ', { bold: true }),
    text(data.hasDrawings ? 'Yes' : 'No'),
  ]))

  // Fee Information
  children.push(sectionHeading('FEE INFORMATION'))
  children.push(para(coverData?.feeEst ?? '$320.00 (Small Entity, 2026)'))

  // Government Interest
  children.push(sectionHeading('GOVERNMENT INTEREST'))
  children.push(para(coverData?.govInterest ?? 'None'))

  // Patent Pending Notice
  children.push(sectionHeading('PATENT PENDING NOTICE'))
  children.push(para(
    coverData?.patentPending ??
    `Patent Pending — U.S. Provisional Application`
  ))

  // Deadline Reminder
  children.push(sectionHeading('NONPROVISIONAL DEADLINE'))
  children.push(para([
    text('12 months from filing date — NO EXTENSIONS AVAILABLE', { bold: true }),
  ]))
  if (coverData?.deadline) {
    children.push(para(coverData.deadline, { bold: true }))
  }

  // Reminders
  if (coverData?.reminders && coverData.reminders.length > 0) {
    children.push(sectionHeading('REMINDERS'))
    for (const reminder of coverData.reminders) {
      children.push(para(`• ${reminder}`))
    }
  }

  // Signature
  children.push(sectionHeading('SIGNATURE'))
  children.push(new Paragraph({
    children: [text(' ')],
    spacing: { line: LINE_SPACING, after: 0 },
  }))
  children.push(para('______________________________ Date: _______________'))
  children.push(para('Authorized Representative'))

  const doc = new Document({
    sections: [{
      properties: {
        ...DEFAULT_SECTION,
        type: SectionType.CONTINUOUS,
      },
      children,
    }],
  })

  return await Packer.toBlob(doc)
}

// ── Download helper ──────────────────────────────────────────────

export function downloadDOCX(blob: Blob, filename: string): void {
  saveAs(blob, filename)
}

// ── Generate and download spec ───────────────────────────────────

export async function downloadSpecDOCX(
  specText: string,
  title: string,
  patentId: string
): Promise<void> {
  const blob = await generateSpecDOCX(specText, title, patentId)
  const safeName = patentId.replace(/[^a-zA-Z0-9-]/g, '')
  saveAs(blob, `${safeName}-Specification.docx`)
}

// ── Generate and download cover sheet ────────────────────────────

export async function downloadCoverSheetDOCX(
  data: ExtractedFilingData,
  coverData: CoverSheetData | null,
  patentId: string
): Promise<void> {
  const blob = await generateCoverSheetDOCX(data, coverData, patentId)
  const safeName = patentId.replace(/[^a-zA-Z0-9-]/g, '')
  saveAs(blob, `${safeName}-Cover-Sheet-PTO-SB-16.docx`)
}

// ── Generate Strategy Document DOCX ──────────────────────────────

export async function generateStrategyDOCX(
  content: string,
  title: string,
  _docType: string
): Promise<Blob> {
  const lines = content.split('\n')
  const children: Paragraph[] = []

  // Company letterhead
  children.push(new Paragraph({
    children: [text('VISIONARY AI SYSTEMS, INC.', { bold: true, size: TITLE_SIZE })],
    alignment: AlignmentType.CENTER,
    spacing: { line: LINE_SPACING, after: 60 },
  }))
  children.push(new Paragraph({
    children: [text('Delaware Corporation | 1102 Cool Springs Drive, Kennesaw, GA 30144', { italic: true, size: 20 })],
    alignment: AlignmentType.CENTER,
    spacing: { line: LINE_SPACING, after: 120 },
  }))
  children.push(new Paragraph({
    children: [text('CONFIDENTIAL', { bold: true, size: FONT_SIZE })],
    alignment: AlignmentType.CENTER,
    spacing: { line: LINE_SPACING, after: 60 },
  }))
  children.push(new Paragraph({
    children: [text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { size: FONT_SIZE })],
    alignment: AlignmentType.RIGHT,
    spacing: { line: LINE_SPACING, after: 240 },
  }))

  // Document title
  children.push(new Paragraph({
    children: [text(title, { bold: true, size: HEADING_SIZE })],
    alignment: AlignmentType.CENTER,
    spacing: { line: LINE_SPACING, after: 360 },
  }))

  // Parse content — handle markdown-style headings and bullets
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (trimmed.startsWith('# ')) {
      children.push(sectionHeading(trimmed.substring(2)))
    } else if (trimmed.startsWith('## ')) {
      children.push(sectionHeading(trimmed.substring(3)))
    } else if (trimmed.startsWith('### ')) {
      children.push(para(trimmed.substring(4), { bold: true, spacing: { before: 120 } }))
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      children.push(para(trimmed.substring(2), { indent: { left: convertInchesToTwip(0.5) } }))
    } else if (/^\d+\.\s/.test(trimmed)) {
      children.push(para(trimmed, { spacing: { before: 60 } }))
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      children.push(para(trimmed.replace(/\*\*/g, ''), { bold: true, spacing: { before: 120 } }))
    } else {
      children.push(para(trimmed))
    }
  }

  const doc = new Document({
    sections: [{
      properties: {
        ...DEFAULT_SECTION,
        type: SectionType.CONTINUOUS,
      },
      children,
    }],
  })

  return await Packer.toBlob(doc)
}

// ── Generate and download strategy doc ──────────────────────────

export async function downloadStrategyDOCX(
  content: string,
  title: string,
  docType: string
): Promise<void> {
  const blob = await generateStrategyDOCX(content, title, docType)
  const safeName = docType.replace(/[^a-zA-Z0-9-]/g, '')
  saveAs(blob, `VAIS-${safeName}-${new Date().toISOString().split('T')[0]}.docx`)
}

// ── Parse spec text into sections ────────────────────────────────

interface SpecSection {
  heading: string | null
  lines: string[]
}

function parseSpecSections(specText: string): SpecSection[] {
  const lines = specText.split('\n')
  const sections: SpecSection[] = []
  let current: SpecSection = { heading: null, lines: [] }

  // Heading patterns for patent spec sections
  const headingPatterns = [
    /^#{1,3}\s+(.+)/,                              // Markdown headings
    /^(I{1,3}V?|V|VI{0,3})\.\s+(.+)/,            // Roman numeral sections
    /^(\d+\.\d+)\s+(.+)/,                          // Numbered sections like 4.1
    /^(TITLE|TECHNICAL FIELD|BACKGROUND|SUMMARY|DETAILED DESCRIPTION|CLAIMS|ABSTRACT|INVENTORS?|ASSIGNEE|APPLICANT)/i,
    /^(FIELD OF THE INVENTION|BRIEF DESCRIPTION|DESCRIPTION OF .+)/i,
  ]

  for (const line of lines) {
    const trimmed = line.trim()

    // Skip dividers
    if (trimmed === '---' || trimmed === '===') continue

    // Check if this line is a heading
    let isHeading = false
    for (const pattern of headingPatterns) {
      if (pattern.test(trimmed)) {
        // Save current section
        if (current.heading || current.lines.length > 0) {
          sections.push(current)
        }
        // Clean up heading text
        const cleaned = trimmed
          .replace(/^#{1,3}\s+/, '')
          .replace(/^\*\*(.+)\*\*$/, '$1')
        current = { heading: cleaned, lines: [] }
        isHeading = true
        break
      }
    }

    if (!isHeading) {
      current.lines.push(trimmed)
    }
  }

  // Push last section
  if (current.heading || current.lines.length > 0) {
    sections.push(current)
  }

  return sections
}

// ── Convenience: generate default inventor data ──────────────────

export function getDefaultInventors(): Inventor[] {
  return [
    { name: 'Milton Overton', address: '1102 Cool Springs Drive, Kennesaw, GA 30144', citizenship: 'United States' },
    { name: 'Lisa Overton', address: '1102 Cool Springs Drive, Kennesaw, GA 30144', citizenship: 'United States' },
  ]
}

export function getDefaultAssignee() {
  return {
    name: 'Visionary AI Systems, Inc.',
    address: '1102 Cool Springs Drive, Kennesaw, GA 30144',
    type: 'Corporation',
    state: 'Delaware',
  }
}
