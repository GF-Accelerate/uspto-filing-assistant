// Hermes checkpoint unit tests.
// Asserts the five invariants I1-I5 documented in checkpoints.ts.

import { describe, it, expect } from 'vitest'
import {
  createSession,
  requestCheckpoint,
  approveCheckpoint,
  denyCheckpoint,
  isReadyForSubmit,
  nextExpectedCheckpoint,
  CHECKPOINT_SEQUENCE,
  type HermesSession,
} from './checkpoints'

// Deterministic clock for tests
function fixedClock(iso = '2026-04-11T12:00:00.000Z'): () => Date {
  let t = new Date(iso).getTime()
  return () => {
    const d = new Date(t)
    t += 1000
    return d
  }
}

function fullApprovedSession(): HermesSession {
  const now = fixedClock()
  let s = createSession('PA-5', now)
  for (const name of CHECKPOINT_SEQUENCE) {
    s = requestCheckpoint(s, name, `request ${name}`, now)
    s = approveCheckpoint(s, name, undefined, now)
  }
  return s
}

describe('createSession', () => {
  it('rejects empty patentId', () => {
    expect(() => createSession('')).toThrow(/patentId/)
  })

  it('produces an unterminated session with zero checkpoints', () => {
    const s = createSession('PA-5', fixedClock())
    expect(s.patentId).toBe('PA-5')
    expect(s.checkpoints).toHaveLength(0)
    expect(s.terminated).toBe(false)
    expect(s.id).toMatch(/^hermes-/)
  })
})

describe('I1: canonical checkpoint order', () => {
  it('nextExpectedCheckpoint starts at PostLoginVerification', () => {
    const s = createSession('PA-5', fixedClock())
    expect(nextExpectedCheckpoint(s)).toBe('PostLoginVerification')
  })

  it('rejects out-of-order checkpoint requests', () => {
    const now = fixedClock()
    const s = createSession('PA-5', now)
    expect(() =>
      requestCheckpoint(s, 'FinalSubmissionApproval', 'try to skip', now),
    ).toThrow(/out of order/)
  })

  it('advances through all four checkpoints in order', () => {
    const now = fixedClock()
    let s = createSession('PA-5', now)
    for (const name of CHECKPOINT_SEQUENCE) {
      expect(nextExpectedCheckpoint(s)).toBe(name)
      s = requestCheckpoint(s, name, `summary for ${name}`, now)
      s = approveCheckpoint(s, name, 'looks good', now)
    }
    expect(nextExpectedCheckpoint(s)).toBeNull()
  })
})

describe('I2: only pending -> approved/denied transitions allowed', () => {
  it('rejects approving a checkpoint that was never requested', () => {
    const now = fixedClock()
    const s = createSession('PA-5', now)
    expect(() => approveCheckpoint(s, 'PostLoginVerification', undefined, now)).toThrow(
      /never requested/,
    )
  })

  it('rejects re-approving an already-approved checkpoint', () => {
    const now = fixedClock()
    let s = createSession('PA-5', now)
    s = requestCheckpoint(s, 'PostLoginVerification', 'first', now)
    s = approveCheckpoint(s, 'PostLoginVerification', undefined, now)
    expect(() => approveCheckpoint(s, 'PostLoginVerification', undefined, now)).toThrow(
      /current status is approved/,
    )
  })

  it('rejects re-opening an already-approved checkpoint via requestCheckpoint', () => {
    const now = fixedClock()
    let s = createSession('PA-5', now)
    s = requestCheckpoint(s, 'PostLoginVerification', 'first', now)
    s = approveCheckpoint(s, 'PostLoginVerification', undefined, now)
    // Can't request the same checkpoint again — it's already approved
    expect(() => requestCheckpoint(s, 'PostLoginVerification', 'retry', now)).toThrow(
      /already been approved/,
    )
  })

  it('allows idempotent re-request of a pending checkpoint', () => {
    const now = fixedClock()
    let s = createSession('PA-5', now)
    s = requestCheckpoint(s, 'PostLoginVerification', 'first', now)
    const s2 = requestCheckpoint(s, 'PostLoginVerification', 'first', now)
    expect(s2.checkpoints).toHaveLength(1)
    expect(s2.checkpoints[0].status).toBe('pending')
  })
})

describe('I3: denial terminates the session', () => {
  it('sets terminated=true after a denial', () => {
    const now = fixedClock()
    let s = createSession('PA-5', now)
    s = requestCheckpoint(s, 'PostLoginVerification', 'login check', now)
    s = denyCheckpoint(s, 'PostLoginVerification', 'user was not actually logged in', now)
    expect(s.terminated).toBe(true)
    expect(s.terminationReason).toMatch(/denied/)
  })

  it('blocks all further checkpoint operations after termination', () => {
    const now = fixedClock()
    let s = createSession('PA-5', now)
    s = requestCheckpoint(s, 'PostLoginVerification', 'login check', now)
    s = denyCheckpoint(s, 'PostLoginVerification', undefined, now)

    expect(() =>
      requestCheckpoint(s, 'DocumentUploadConfirmation', 'upload', now),
    ).toThrow(/terminated/)
    expect(() =>
      approveCheckpoint(s, 'PostLoginVerification', undefined, now),
    ).toThrow(/terminated/)
    expect(() =>
      denyCheckpoint(s, 'PostLoginVerification', undefined, now),
    ).toThrow(/terminated/)
  })

  it('isReadyForSubmit returns false after termination', () => {
    const now = fixedClock()
    let s = createSession('PA-5', now)
    s = requestCheckpoint(s, 'PostLoginVerification', 'x', now)
    s = denyCheckpoint(s, 'PostLoginVerification', undefined, now)
    expect(isReadyForSubmit(s)).toBe(false)
  })
})

describe('I4: isReadyForSubmit only after all four are approved', () => {
  it('returns false on a fresh session', () => {
    expect(isReadyForSubmit(createSession('PA-5', fixedClock()))).toBe(false)
  })

  it('returns false with only some checkpoints approved', () => {
    const now = fixedClock()
    let s = createSession('PA-5', now)
    s = requestCheckpoint(s, 'PostLoginVerification', 'x', now)
    s = approveCheckpoint(s, 'PostLoginVerification', undefined, now)
    s = requestCheckpoint(s, 'DocumentUploadConfirmation', 'x', now)
    s = approveCheckpoint(s, 'DocumentUploadConfirmation', undefined, now)
    expect(isReadyForSubmit(s)).toBe(false)
  })

  it('returns true only when all four checkpoints are approved', () => {
    expect(isReadyForSubmit(fullApprovedSession())).toBe(true)
  })
})

describe('I5: checkpoint records carry timestamps and summaries', () => {
  it('stores the provided summary text verbatim', () => {
    const now = fixedClock()
    let s = createSession('PA-5', now)
    s = requestCheckpoint(
      s, 'PostLoginVerification',
      'Verify authenticated session at patentcenter.uspto.gov',
      now,
    )
    expect(s.checkpoints[0].summary).toBe(
      'Verify authenticated session at patentcenter.uspto.gov',
    )
  })

  it('records note on approval', () => {
    const now = fixedClock()
    let s = createSession('PA-5', now)
    s = requestCheckpoint(s, 'PostLoginVerification', 'x', now)
    s = approveCheckpoint(s, 'PostLoginVerification', 'checked', now)
    expect(s.checkpoints[0].note).toBe('checked')
  })

  it('timestamps are ISO 8601 strings', () => {
    const s = fullApprovedSession()
    for (const c of s.checkpoints) {
      expect(c.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    }
  })
})
