// PDB — Physical-Digital Bridge (PA-5 Component 700)
// Converts camera captures and vision analysis into patent documentation artifacts.
// Bridges the physical world (prototypes, hardware, inventions) to digital
// patent filings (specifications, drawings, claims, abstracts).
//
// This primitive is the connective tissue between VCE (visual capture)
// and the existing filing workflow (wizard, DOCX generation, drawings).
//
// Novel claim: No existing patent platform provides an automated pipeline
// from physical object photography through AI analysis to patent-ready
// documentation with HAL-gated approval at each generation step.

import type {
  PhysicalDigitalMapping, InventionAnalysis, DrawingLabel
} from '@/types/patent'

// ── Storage ───────────────────────────────────────────────────────────────

const MAPPINGS_KEY = 'vais:pdb-mappings'

function loadMappings(): PhysicalDigitalMapping[] {
  try {
    const raw = localStorage.getItem(MAPPINGS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveMappings(mappings: PhysicalDigitalMapping[]): void {
  try {
    localStorage.setItem(MAPPINGS_KEY, JSON.stringify(mappings))
  } catch { /* storage full */ }
}

// ── Mapping Creation ──────────────────────────────────────────────────────
// Each mapping connects a physical capture to a specific patent document element

export function createMapping(
  capturedImageId: string,
  analysisId: string,
  patentId: string,
  targetDocument: PhysicalDigitalMapping['targetDocument'],
  mappingType: PhysicalDigitalMapping['mappingType'],
  generatedContent: string
): PhysicalDigitalMapping {
  const mapping: PhysicalDigitalMapping = {
    id: `pdb-${Date.now()}`,
    capturedImageId,
    analysisId,
    patentId,
    targetDocument,
    mappingType,
    generatedContent,
    status: 'draft', // Always starts as draft — requires HAL approval
    createdAt: new Date().toISOString(),
  }

  const mappings = loadMappings()
  mappings.push(mapping)
  saveMappings(mappings)
  return mapping
}

export function getMappingsForPatent(patentId: string): PhysicalDigitalMapping[] {
  return loadMappings().filter(m => m.patentId === patentId)
}

export function getMappingsForImage(imageId: string): PhysicalDigitalMapping[] {
  return loadMappings().filter(m => m.capturedImageId === imageId)
}

export function updateMappingStatus(
  mappingId: string,
  status: PhysicalDigitalMapping['status']
): PhysicalDigitalMapping | null {
  const mappings = loadMappings()
  const idx = mappings.findIndex(m => m.id === mappingId)
  if (idx === -1) return null

  mappings[idx] = { ...mappings[idx], status }
  saveMappings(mappings)
  return mappings[idx]
}

// ── Content Generation from Analysis ──────────────────────────────────────
// Transforms VCE analysis into patent-ready documentation fragments

export function generateFigureDescription(
  analysis: InventionAnalysis,
  figureNumber: number
): string {
  const labels = analysis.suggestedDrawingLabels
    .map((l: DrawingLabel) => `Reference numeral ${l.referenceNumber} designates ${l.description.toLowerCase()}.`)
    .join(' ')

  return `FIG. ${figureNumber} — ${analysis.patentRelevance.suggestedFigureCaption}

[${String(figureNumber).padStart(4, '0')}] Referring now to FIG. ${figureNumber}, there is shown ${analysis.functionalDescription.toLowerCase()}. ${labels}

The embodiment depicted in FIG. ${figureNumber} comprises ${analysis.components.length} principal components: ${analysis.components.map(c => c.name.toLowerCase()).join(', ')}. ${analysis.materials.length > 0 ? `The device may be constructed from ${analysis.materials.join(', ')}.` : ''} ${analysis.dimensions ? `Approximate dimensions of the embodiment shown are ${analysis.dimensions}.` : ''}`
}

export function generateClaimElements(analysis: InventionAnalysis): string[] {
  return analysis.suggestedClaimElements.map((element, i) => {
    // Ensure proper claim language formatting
    const cleaned = element.trim()
    if (i === 0 && !cleaned.toLowerCase().startsWith('a ') && !cleaned.toLowerCase().startsWith('an ')) {
      return `a ${cleaned}`
    }
    return cleaned
  })
}

export function generateSpecificationParagraph(
  analysis: InventionAnalysis,
  paragraphNumber: number
): string {
  const componentDescriptions = analysis.components
    .map(c => {
      const novelty = c.noveltyIndicator === 'novel'
        ? 'In a novel aspect of the present invention, '
        : ''
      return `${novelty}${c.name} is configured to ${c.description.toLowerCase()}.`
    })
    .join(' ')

  return `[${String(paragraphNumber).padStart(4, '0')}] In one embodiment of the present invention, ${analysis.functionalDescription.toLowerCase()} The embodiment comprises the following components: ${componentDescriptions}`
}

export function generateAbstractContribution(analysis: InventionAnalysis): string {
  const novelComponents = analysis.components.filter(c => c.noveltyIndicator === 'novel')
  if (novelComponents.length === 0) return ''

  return `The system further comprises ${novelComponents.map(c => c.name.toLowerCase()).join(' and ')}, configured to ${analysis.functionalDescription.toLowerCase()}`
}

// ── Batch Generation ──────────────────────────────────────────────────────
// Generate all mappings from a single analysis in one pass

export function generateAllMappingsFromAnalysis(
  analysis: InventionAnalysis,
  capturedImageId: string,
  patentId: string,
  startingFigureNumber: number,
  startingParagraphNumber: number
): PhysicalDigitalMapping[] {
  const mappings: PhysicalDigitalMapping[] = []

  // 1. Figure description
  const figDesc = generateFigureDescription(analysis, startingFigureNumber)
  mappings.push(createMapping(
    capturedImageId, analysis.id, patentId,
    'drawing', 'figure_reference', figDesc
  ))

  // 2. Specification paragraph
  const specPara = generateSpecificationParagraph(analysis, startingParagraphNumber)
  mappings.push(createMapping(
    capturedImageId, analysis.id, patentId,
    'specification', 'component_description', specPara
  ))

  // 3. Claim elements
  const claimElements = generateClaimElements(analysis)
  if (claimElements.length > 0) {
    mappings.push(createMapping(
      capturedImageId, analysis.id, patentId,
      'claims', 'component_description',
      claimElements.join(';\n')
    ))
  }

  // 4. Abstract contribution
  const abstractPart = generateAbstractContribution(analysis)
  if (abstractPart) {
    mappings.push(createMapping(
      capturedImageId, analysis.id, patentId,
      'abstract', 'component_description', abstractPart
    ))
  }

  return mappings
}

// ── Measurement Integration ───────────────────────────────────────────────
// For future: AR-based measurement from camera (ARKit/ARCore)

export interface PhysicalMeasurement {
  component: string
  dimension: 'length' | 'width' | 'height' | 'diameter' | 'weight'
  value: number
  unit: 'mm' | 'cm' | 'm' | 'in' | 'ft' | 'g' | 'kg' | 'oz' | 'lb'
  method: 'estimated' | 'measured' | 'ar-captured'
}

export function formatMeasurementForSpec(measurements: PhysicalMeasurement[]): string {
  if (measurements.length === 0) return ''

  const lines = measurements.map(m =>
    `The ${m.component.toLowerCase()} has a ${m.dimension} of approximately ${m.value} ${m.unit} (${m.method}).`
  )

  return `In one exemplary embodiment, the physical dimensions are as follows: ${lines.join(' ')} It should be understood that these dimensions are illustrative and not limiting; the present invention may be practiced at various scales.`
}

// ── Clear all PDB data (admin/reset) ──────────────────────────────────────

export function clearAllMappings(): void {
  localStorage.removeItem(MAPPINGS_KEY)
}
