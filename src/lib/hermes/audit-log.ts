// Hermes Audit Log — append-only record of every Hermes filing agent
// action. Backed by localStorage for Phase 2; migrate to Supabase in a
// future phase when multi-device sync is needed.
//
// Design:
//   - Entries are append-only. `appendEntry()` is the only mutation path
//     other than the explicit `adminClear()` which requires an admin ack.
//   - Entries are keyed by session ID so an entire Hermes session can be
//     reconstructed from the log alone.
//   - We never log credentials, cookies, session tokens, or file contents.
//     Only action descriptions and human decisions.

import type { CheckpointName, CheckpointStatus } from './checkpoints'

// ── Types ────────────────────────────────────────────────────────────────

export type AuditAction =
  | 'session_started'
  | 'checkpoint_requested'
  | 'checkpoint_approved'
  | 'checkpoint_denied'
  | 'field_filled'
  | 'document_uploaded'
  | 'navigation'
  | 'session_terminated'
  | 'session_completed'

export interface AuditEntry {
  /** Unique id for this entry */
  id: string
  /** Hermes session this entry belongs to */
  sessionId: string
  /** Patent being filed */
  patentId: string
  /** What happened */
  action: AuditAction
  /** Optional related checkpoint */
  checkpoint?: CheckpointName
  /** Optional checkpoint status after this action */
  checkpointStatus?: CheckpointStatus
  /** Short human-readable summary — NEVER include secrets */
  summary: string
  /** ISO 8601 timestamp */
  timestamp: string
  /** Optional field name for field_filled actions (e.g. "title") */
  field?: string
  /** Optional document type label for document_uploaded actions */
  documentType?: string
}

// ── Storage ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'uspto-hermes-audit-v1'
const MAX_ENTRIES = 2000

function readRaw(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as AuditEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeRaw(entries: AuditEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

// ── Public API ───────────────────────────────────────────────────────────

/**
 * Append an entry to the audit log. Returns the stored entry (with an
 * auto-generated id if one wasn't supplied). Cannot modify an existing
 * entry — this is append-only.
 */
export function appendEntry(
  partial: Omit<AuditEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: string },
): AuditEntry {
  const entry: AuditEntry = {
    id: partial.id ?? `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: partial.timestamp ?? new Date().toISOString(),
    sessionId: partial.sessionId,
    patentId: partial.patentId,
    action: partial.action,
    summary: partial.summary,
    checkpoint: partial.checkpoint,
    checkpointStatus: partial.checkpointStatus,
    field: partial.field,
    documentType: partial.documentType,
  }

  // Scrub for common footgun: summary must not contain obvious secret markers.
  // This is a best-effort guard; the caller is still responsible.
  assertNoSecrets(entry.summary)

  const all = readRaw()
  all.push(entry)

  // Enforce the maximum size — oldest entries drop off. This is NOT an
  // edit of existing entries; the kept entries are unchanged.
  const trimmed = all.length > MAX_ENTRIES ? all.slice(all.length - MAX_ENTRIES) : all

  writeRaw(trimmed)
  return entry
}

/**
 * Read all audit entries, most recent first.
 */
export function loadEntries(): AuditEntry[] {
  const all = readRaw()
  return all.slice().reverse()
}

/**
 * Read all entries for a specific session, in chronological order.
 */
export function loadSessionEntries(sessionId: string): AuditEntry[] {
  return readRaw().filter(e => e.sessionId === sessionId)
}

/**
 * Read all entries for a specific patent, in chronological order.
 */
export function loadPatentEntries(patentId: string): AuditEntry[] {
  return readRaw().filter(e => e.patentId === patentId)
}

/**
 * Clear the audit log. Requires passing the exact confirmation string to
 * prevent accidental or programmatic clearing.
 */
export function adminClear(confirmation: string): void {
  if (confirmation !== 'I-ACKNOWLEDGE-THIS-DESTROYS-THE-AUDIT-LOG') {
    throw new Error('adminClear refused: missing acknowledgement')
  }
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Count entries by action type. Useful for the admin dashboard.
 */
export function summarizeLog(): Record<AuditAction, number> {
  const counts: Partial<Record<AuditAction, number>> = {}
  for (const e of readRaw()) {
    counts[e.action] = (counts[e.action] ?? 0) + 1
  }
  return {
    session_started:      counts.session_started      ?? 0,
    checkpoint_requested: counts.checkpoint_requested ?? 0,
    checkpoint_approved:  counts.checkpoint_approved  ?? 0,
    checkpoint_denied:    counts.checkpoint_denied    ?? 0,
    field_filled:         counts.field_filled         ?? 0,
    document_uploaded:    counts.document_uploaded    ?? 0,
    navigation:           counts.navigation           ?? 0,
    session_terminated:   counts.session_terminated   ?? 0,
    session_completed:    counts.session_completed    ?? 0,
  }
}

// ── Internals ────────────────────────────────────────────────────────────

const SECRET_MARKERS = [
  /password/i,
  /cookie/i,
  /session[-_ ]?token/i,
  /bearer\s+/i,
  /authorization:/i,
  /api[-_ ]?key/i,
]

function assertNoSecrets(summary: string): void {
  for (const re of SECRET_MARKERS) {
    if (re.test(summary)) {
      throw new Error(`Hermes audit summary appears to contain a secret marker (${re.source}); refusing to log`)
    }
  }
}
