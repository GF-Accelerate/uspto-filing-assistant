// HAL — Human Authorization Layer (PA-5 Component 340)
// Non-bypassable platform-layer action interceptor.
// ALL voice-initiated filing and generation actions must pass through HAL.
// This is the core IP differentiator — the HITL gate that cannot be circumvented.

import type { VoiceAction } from './aef'

export type ApprovalStatus = 'pending' | 'approved' | 'denied'

export interface ApprovalRequest {
  id: string
  action: VoiceAction
  description: string
  timestamp: string
  status: ApprovalStatus
  resolvedAt?: string
}

// Actions that require human approval before execution
const APPROVAL_REQUIRED: Set<VoiceAction['type']> = new Set([
  'OPEN_WIZARD',         // Starting a filing workflow
  'GENERATE_DOC',        // Generating official documents
  'GENERATE_LEGAL_DOC',  // Generating legal documents (NDA, Assignment, etc.)
  'RUN_PRIOR_ART_SEARCH', // Running prior art search (uses API credits)
  'RUN_TRADEMARK_SEARCH', // Running trademark clearance search (uses API credits)
])

// Actions that are safe to execute without approval
const AUTO_APPROVED: Set<VoiceAction['type']> = new Set([
  'NAVIGATE',            // Page navigation is always safe
  'OPEN_FILING_PACKAGE', // Viewing filing package is read-only
  'OPEN_DRAWINGS',       // Opening drawings page is read-only
  'OPEN_PRIOR_ART',      // Opening prior art page is read-only
  'OPEN_LEGAL',          // Opening legal docs page is read-only
  'OPEN_TRADEMARK',      // Opening trademark page is read-only
  'OPEN_CALENDAR',       // Opening calendar is read-only
  'OPEN_SETTINGS',       // Opening settings is read-only
  'OPEN_ADMIN',          // Opening admin dashboard is read-only
  'TOGGLE_DARK_MODE',    // UI preference toggle
])

// ── Gate check ─────────────────────────────────────────────────────────────

export function requiresApproval(action: VoiceAction): boolean {
  if (AUTO_APPROVED.has(action.type)) return false
  return APPROVAL_REQUIRED.has(action.type)
}

export function createApprovalRequest(action: VoiceAction): ApprovalRequest {
  return {
    id: `hal-${Date.now()}`,
    action,
    description: describeAction(action),
    timestamp: new Date().toISOString(),
    status: 'pending',
  }
}

function describeAction(action: VoiceAction): string {
  switch (action.type) {
    case 'OPEN_WIZARD':
      return `Open filing wizard for ${action.payload}`
    case 'GENERATE_DOC':
      return `Generate DOCX document for ${action.payload}`
    case 'OPEN_FILING_PACKAGE':
      return `View filing package for ${action.payload}`
    case 'NAVIGATE':
      return `Navigate to ${action.payload}`
    case 'OPEN_DRAWINGS':
      return 'Open patent drawings generator'
    case 'OPEN_PRIOR_ART':
      return 'Open prior art search page'
    case 'OPEN_LEGAL':
      return 'Open legal document generator'
    case 'OPEN_TRADEMARK':
      return 'Open trademark portfolio manager'
    case 'OPEN_CALENDAR':
      return 'Open deadline calendar'
    case 'OPEN_SETTINGS':
      return 'Open inventor/assignee settings'
    case 'OPEN_ADMIN':
      return 'Open admin dashboard'
    case 'TOGGLE_DARK_MODE':
      return 'Toggle dark mode'
    case 'RUN_PRIOR_ART_SEARCH':
      return `Run prior art search for: ${action.payload}`
    case 'GENERATE_LEGAL_DOC':
      return `Generate legal document: ${action.payload}`
    case 'RUN_TRADEMARK_SEARCH':
      return `Run trademark clearance search for: ${action.payload}`
    default:
      return `Execute action: ${action.type}`
  }
}

// ── Approval resolution ────────────────────────────────────────────────────

export function approveRequest(request: ApprovalRequest): ApprovalRequest {
  return { ...request, status: 'approved', resolvedAt: new Date().toISOString() }
}

export function denyRequest(request: ApprovalRequest): ApprovalRequest {
  return { ...request, status: 'denied', resolvedAt: new Date().toISOString() }
}

// ── Audit log ──────────────────────────────────────────────────────────────

const AUDIT_KEY = 'vais:hal-audit-log'

export function logApproval(request: ApprovalRequest): void {
  try {
    const raw = localStorage.getItem(AUDIT_KEY)
    const log: ApprovalRequest[] = raw ? JSON.parse(raw) : []
    log.push(request)
    // Keep last 100 entries
    if (log.length > 100) log.splice(0, log.length - 100)
    localStorage.setItem(AUDIT_KEY, JSON.stringify(log))
  } catch { /* storage full */ }
}

export function getAuditLog(): ApprovalRequest[] {
  try {
    const raw = localStorage.getItem(AUDIT_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
