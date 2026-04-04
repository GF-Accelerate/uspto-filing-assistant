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

// ── Visual Capture Engine (VCE) types — PA-5 Extension ───────────────────
// Enables camera-based capture of physical inventions for patent documentation

export interface CapturedImage {
  id: string
  dataUrl: string                    // Base64 image data
  timestamp: string
  source: 'camera' | 'upload'
  patentId: string | null            // Associated patent
  label: string                      // User-provided or AI-generated label
  metadata: ImageMetadata
}

export interface ImageMetadata {
  width: number
  height: number
  mimeType: string
  deviceInfo: string                 // Camera/device identifier
  orientation: 'landscape' | 'portrait'
}

export interface InventionAnalysis {
  id: string
  imageId: string
  timestamp: string
  components: IdentifiedComponent[]  // Physical components detected
  materials: string[]                // Detected or inferred materials
  dimensions: string | null          // Estimated scale/dimensions
  functionalDescription: string      // AI description of apparent function
  patentRelevance: PatentRelevance
  suggestedClaimElements: string[]   // Potential claim language
  suggestedDrawingLabels: DrawingLabel[]
  confidence: number                 // 0-1 analysis confidence
}

export interface IdentifiedComponent {
  name: string
  description: string
  boundingArea: string               // Approximate location in image
  noveltyIndicator: 'novel' | 'known' | 'uncertain'
}

export interface PatentRelevance {
  relevantPatentIds: string[]        // Which portfolio patents this relates to
  suggestedFigureNumber: number
  suggestedFigureCaption: string
  priorArtConcerns: string[]
}

export interface DrawingLabel {
  referenceNumber: number            // e.g., 110, 120, 130
  description: string
  position: string                   // Description of where in the image
}

// ── Domain Intelligence Collector (DIC) types — PA-5 Extension ───────────
// Captures industry-specific operational data for vertical LLM training

export type DomainVertical = 'sports' | 'healthcare' | 'legal' | 'financial' | 'education' | 'retail' | 'government' | 'manufacturing' | 'custom'

export interface DomainSchema {
  id: string
  vertical: DomainVertical
  name: string                       // e.g., "College Sports Operating System"
  version: string
  dataCategories: DataCategory[]
  registeredAt: string
  updatedAt: string
}

export interface DataCategory {
  id: string
  name: string                       // e.g., "Ticket Sales", "Recruiting", "Player Analysis"
  description: string
  fields: DataField[]
  captureFrequency: 'realtime' | 'daily' | 'weekly' | 'event-driven'
  privacyLevel: 'public' | 'internal' | 'confidential' | 'pii'
}

export interface DataField {
  name: string
  type: 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'object' | 'array'
  description: string
  required: boolean
  sampleValues?: string[]
}

export interface LearningEvent {
  id: string
  domainSchemaId: string
  categoryId: string
  timestamp: string
  eventType: 'data_capture' | 'user_interaction' | 'model_feedback' | 'correction' | 'validation'
  data: Record<string, unknown>      // Actual captured data
  source: string                     // Which application/system generated this
  quality: 'high' | 'medium' | 'low' | 'unvalidated'
}

export interface TrainingDataSummary {
  domainSchemaId: string
  totalEvents: number
  categoryCounts: Record<string, number>
  qualityDistribution: Record<string, number>
  dateRange: { earliest: string; latest: string }
  estimatedModelReadiness: number    // 0-100 readiness score
}

// ── Physical-Digital Bridge (PDB) types — PA-5 Extension ─────────────────
// Connects physical world captures to digital patent documentation

export interface PhysicalDigitalMapping {
  id: string
  capturedImageId: string
  analysisId: string
  patentId: string
  targetDocument: 'specification' | 'drawing' | 'claims' | 'abstract'
  mappingType: 'figure_reference' | 'component_description' | 'measurement' | 'material_spec'
  generatedContent: string           // The spec text, drawing label, or claim element
  status: 'draft' | 'reviewed' | 'approved'  // HAL-gated approval
  createdAt: string
}

export type ChecklistState = Record<string, boolean>
export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6

export interface WizardState {
  activePatentId: string | null; step: WizardStep; docInput: string
  aiData: ExtractedFilingData | null; coverData: CoverSheetData | null
  checks: ChecklistState; validResult: ValidationResult | null
  appNum: string; loading: boolean; loadMsg: string; error: string
}
