// Patent status lifecycle state machine
// Status flow: draft → ready → filing → filed → prosecution → granted
// Patents can be abandoned from any active state

import type { PatentStatus } from '@/types/patent'

// Valid transitions — key is current status, value is allowed next statuses
const TRANSITIONS: Record<PatentStatus, PatentStatus[]> = {
  draft:       ['ready', 'abandoned'],
  ready:       ['filing', 'draft', 'abandoned'],
  filing:      ['filed', 'ready', 'abandoned'],
  filed:       ['prosecution', 'abandoned'],
  prosecution: ['granted', 'abandoned'],
  granted:     [],        // terminal state
  abandoned:   ['draft'], // can revive to draft
  planned:     ['draft', 'abandoned'],
}

export interface StatusTransition {
  patentId: string
  from: PatentStatus
  to: PatentStatus
  timestamp: string
  note?: string
  appNumber?: string
}

export interface PatentLifecycle {
  patentId: string
  currentStatus: PatentStatus
  transitions: StatusTransition[]
  createdAt: string
  updatedAt: string
}

const LIFECYCLE_KEY = 'vais:patent-lifecycles'

// ── Validation ─────────────────────────────────────────────────────

export function canTransition(from: PatentStatus, to: PatentStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false
}

export function getValidTransitions(from: PatentStatus): PatentStatus[] {
  return TRANSITIONS[from] ?? []
}

// ── Storage ────────────────────────────────────────────────────────

function loadLifecycles(): Record<string, PatentLifecycle> {
  try {
    const raw = localStorage.getItem(LIFECYCLE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveLifecycles(data: Record<string, PatentLifecycle>): void {
  try {
    localStorage.setItem(LIFECYCLE_KEY, JSON.stringify(data))
  } catch { /* storage full */ }
}

export function getLifecycle(patentId: string): PatentLifecycle | null {
  const all = loadLifecycles()
  return all[patentId] ?? null
}

export function getAllLifecycles(): Record<string, PatentLifecycle> {
  return loadLifecycles()
}

// ── Transitions ────────────────────────────────────────────────────

export function transitionStatus(
  patentId: string,
  from: PatentStatus,
  to: PatentStatus,
  note?: string,
  appNumber?: string,
): StatusTransition | null {
  if (!canTransition(from, to)) return null

  const now = new Date().toISOString()
  const transition: StatusTransition = {
    patentId, from, to,
    timestamp: now,
    note,
    appNumber,
  }

  const all = loadLifecycles()
  const existing = all[patentId]

  if (existing) {
    existing.currentStatus = to
    existing.transitions.push(transition)
    existing.updatedAt = now
  } else {
    all[patentId] = {
      patentId,
      currentStatus: to,
      transitions: [transition],
      createdAt: now,
      updatedAt: now,
    }
  }

  saveLifecycles(all)
  return transition
}

// Initialize lifecycle for a patent without creating a transition
export function initLifecycle(patentId: string, status: PatentStatus): void {
  const all = loadLifecycles()
  if (all[patentId]) return // already exists

  const now = new Date().toISOString()
  all[patentId] = {
    patentId,
    currentStatus: status,
    transitions: [],
    createdAt: now,
    updatedAt: now,
  }
  saveLifecycles(all)
}

// ── Display helpers ────────────────────────────────────────────────

export const STATUS_LABELS: Record<PatentStatus, string> = {
  planned:     'Planned',
  draft:       'Draft',
  ready:       'Ready to File',
  filing:      'Filing in Progress',
  filed:       'Filed',
  prosecution: 'In Prosecution',
  granted:     'Granted',
  abandoned:   'Abandoned',
}

export const STATUS_COLORS: Record<PatentStatus, string> = {
  planned:     'bg-slate-100 text-slate-600',
  draft:       'bg-yellow-100 text-yellow-800',
  ready:       'bg-blue-100 text-blue-800',
  filing:      'bg-indigo-100 text-indigo-800',
  filed:       'bg-green-100 text-green-800',
  prosecution: 'bg-purple-100 text-purple-800',
  granted:     'bg-emerald-100 text-emerald-800',
  abandoned:   'bg-red-100 text-red-800',
}
