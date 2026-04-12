// Hermes HITL Checkpoints — non-bypassable human-approval gates for the
// USPTO Patent Center filing agent.
//
// This module defines the four checkpoints, the machine that enforces
// their sequence, and helpers to mark a checkpoint pending / approved /
// denied. It is pure TypeScript and has no DOM / React dependencies so
// it can be unit-tested in isolation.
//
// Design invariants (tested in checkpoints.test.ts):
//
//   (I1) A session always starts with an empty checkpoint list and must
//        populate them in canonical order. No checkpoint can be skipped.
//
//   (I2) A checkpoint can only transition: pending -> approved OR
//        pending -> denied. Any other transition (e.g. approved -> pending)
//        is rejected.
//
//   (I3) Once any checkpoint is denied, the session is terminated. No
//        further checkpoints may be added or mutated.
//
//   (I4) `isReadyForSubmit()` returns true only when ALL four checkpoints
//        exist in canonical order AND all are approved.
//
//   (I5) Checkpoint records contain a timestamp and a human-readable
//        summary; once written the summary cannot be edited (we only ever
//        append new records; see audit-log.ts).

// ── Types ────────────────────────────────────────────────────────────────

export const CHECKPOINT_SEQUENCE = [
  'PostLoginVerification',
  'DocumentUploadConfirmation',
  'FeePaymentAuthorization',
  'FinalSubmissionApproval',
] as const

export type CheckpointName = typeof CHECKPOINT_SEQUENCE[number]

export type CheckpointStatus = 'pending' | 'approved' | 'denied'

export interface CheckpointRecord {
  name: CheckpointName
  status: CheckpointStatus
  /** ISO 8601 timestamp of most recent status change */
  updatedAt: string
  /** Human-readable summary of what was about to happen */
  summary: string
  /** Optional free-text note from the human decision-maker */
  note?: string
}

export interface HermesSession {
  /** Unique session identifier */
  id: string
  /** Patent ID the session is filing (e.g. "PA-5") */
  patentId: string
  /** ISO 8601 start timestamp */
  startedAt: string
  /** Checkpoints in order of first encounter */
  checkpoints: CheckpointRecord[]
  /** Terminal state — set to true after a denial */
  terminated: boolean
  /** Reason for termination, if any */
  terminationReason?: string
}

// ── Session lifecycle ────────────────────────────────────────────────────

export function createSession(patentId: string, now: () => Date = () => new Date()): HermesSession {
  if (!patentId || !patentId.trim()) {
    throw new Error('Hermes session requires a patentId')
  }
  return {
    id: `hermes-${now().getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    patentId: patentId.trim(),
    startedAt: now().toISOString(),
    checkpoints: [],
    terminated: false,
  }
}

/**
 * Request the next checkpoint in the canonical sequence. Throws if the
 * session is terminated or if the caller tries to request an out-of-order
 * checkpoint. Idempotent: returns the same session if the next expected
 * checkpoint is already pending.
 */
export function requestCheckpoint(
  session: HermesSession,
  name: CheckpointName,
  summary: string,
  now: () => Date = () => new Date(),
): HermesSession {
  assertNotTerminated(session)

  // Idempotent path: if the tail checkpoint is this one and still pending,
  // return the session unchanged. Allows the agent to re-announce the
  // current gate without side effects.
  const last = session.checkpoints[session.checkpoints.length - 1]
  if (last && last.name === name && last.status === 'pending') {
    return session
  }

  // Any other reference to an existing record means we tried to go backward
  const existing = session.checkpoints.find(c => c.name === name)
  if (existing) {
    throw new Error(`Hermes checkpoint ${name} has already been ${existing.status}; cannot re-open`)
  }

  const expected = nextExpectedCheckpoint(session)
  if (expected !== name) {
    throw new Error(
      `Hermes checkpoint out of order: expected ${expected ?? '(none)'} but got ${name}`,
    )
  }

  const record: CheckpointRecord = {
    name,
    status: 'pending',
    updatedAt: now().toISOString(),
    summary,
  }
  return {
    ...session,
    checkpoints: [...session.checkpoints, record],
  }
}

/**
 * Human decision-maker approves a pending checkpoint.
 */
export function approveCheckpoint(
  session: HermesSession,
  name: CheckpointName,
  note?: string,
  now: () => Date = () => new Date(),
): HermesSession {
  assertNotTerminated(session)
  return transitionCheckpoint(session, name, 'approved', note, now)
}

/**
 * Human decision-maker denies a pending checkpoint. This terminates the
 * session permanently (I3).
 */
export function denyCheckpoint(
  session: HermesSession,
  name: CheckpointName,
  note?: string,
  now: () => Date = () => new Date(),
): HermesSession {
  assertNotTerminated(session)
  const transitioned = transitionCheckpoint(session, name, 'denied', note, now)
  return {
    ...transitioned,
    terminated: true,
    terminationReason: `${name} denied by human reviewer`,
  }
}

/**
 * Returns true only when the session is in a state where the human may
 * safely click Submit in Patent Center. Invariant (I4).
 */
export function isReadyForSubmit(session: HermesSession): boolean {
  if (session.terminated) return false
  if (session.checkpoints.length !== CHECKPOINT_SEQUENCE.length) return false
  return CHECKPOINT_SEQUENCE.every((name, i) => {
    const rec = session.checkpoints[i]
    return rec?.name === name && rec.status === 'approved'
  })
}

/**
 * Returns the name of the next checkpoint the agent should request, or
 * null if all have been seen.
 */
export function nextExpectedCheckpoint(session: HermesSession): CheckpointName | null {
  const idx = session.checkpoints.length
  return idx < CHECKPOINT_SEQUENCE.length ? CHECKPOINT_SEQUENCE[idx] : null
}

// ── Internals ────────────────────────────────────────────────────────────

function assertNotTerminated(session: HermesSession): void {
  if (session.terminated) {
    throw new Error(`Hermes session ${session.id} is terminated${session.terminationReason ? `: ${session.terminationReason}` : ''}`)
  }
}

function transitionCheckpoint(
  session: HermesSession,
  name: CheckpointName,
  nextStatus: 'approved' | 'denied',
  note: string | undefined,
  now: () => Date,
): HermesSession {
  const idx = session.checkpoints.findIndex(c => c.name === name)
  if (idx < 0) {
    throw new Error(`Cannot ${nextStatus} checkpoint ${name}: it was never requested`)
  }
  const existing = session.checkpoints[idx]
  if (existing.status !== 'pending') {
    throw new Error(`Cannot ${nextStatus} checkpoint ${name}: current status is ${existing.status} (I2)`)
  }
  const updated: CheckpointRecord = {
    ...existing,
    status: nextStatus,
    updatedAt: now().toISOString(),
    note,
  }
  const nextCheckpoints = session.checkpoints.slice()
  nextCheckpoints[idx] = updated
  return { ...session, checkpoints: nextCheckpoints }
}

// ── Display helpers ──────────────────────────────────────────────────────

export function checkpointLabel(name: CheckpointName): string {
  switch (name) {
    case 'PostLoginVerification':      return 'Post-login verification'
    case 'DocumentUploadConfirmation': return 'Document upload confirmation'
    case 'FeePaymentAuthorization':    return 'Fee payment authorization'
    case 'FinalSubmissionApproval':    return 'Final submission approval'
  }
}

export function checkpointDescription(name: CheckpointName): string {
  switch (name) {
    case 'PostLoginVerification':
      return 'Confirm the user is authenticated in Patent Center before any action.'
    case 'DocumentUploadConfirmation':
      return 'Verify each uploaded document (spec, cover sheet, drawings) matches the intended document type.'
    case 'FeePaymentAuthorization':
      return 'Confirm the calculated filing fee matches expectations before any payment step.'
    case 'FinalSubmissionApproval':
      return 'Hand control back to the human. The agent must NEVER click Submit.'
  }
}
