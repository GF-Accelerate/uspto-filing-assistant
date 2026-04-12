---
name: uspto-filing-agent
description: Hermes USPTO Patent Center filing assistant — fills Web ADS forms and uploads documents via Playwright MCP, with 4 non-bypassable human-in-the-loop checkpoints. Never clicks Submit.
version: 0.1.0
status: poc
---

# Hermes USPTO Filing Agent

**Purpose.** Assist the account-holder in completing a USPTO Patent Center
provisional filing by filling form fields and uploading documents, while
preserving the legal integrity of the submission: the human remains the
authenticated actor, reviews every field, and clicks Submit personally.

**Status.** Proof of concept. Feature-flag gated by `hermes_agent_enabled`
in the USPTO Filing Assistant web app. Disabled by default.

---

## When to use

Use this skill when:

- The user has completed the 6-step filing wizard for a patent
  (all 14 HITL checklist items checked).
- The user has downloaded the filing documents (Specification DOCX,
  Cover Sheet DOCX, Drawing PDFs).
- The user is logged into `patentcenter.uspto.gov` in Chrome, with
  ID.me + MFA complete.
- The Playwright MCP Bridge Chrome Extension is installed and connected.

Do NOT use this skill to:

- Scrape or query USPTO data for anything other than the user's own
  in-flight patent filing.
- Attempt to store, log, or transmit USPTO credentials or session tokens.
- Click the Submit button in Patent Center.
- File any non-provisional application. Provisional only for Phase 2 POC.

---

## Security model

| Guarantee | Mechanism |
|-----------|-----------|
| No credential access | Playwright MCP `--extension` mode attaches to the user's already-authenticated Chrome tab; the agent never sees passwords or MFA tokens. |
| No session token storage | The agent never reads, logs, or caches cookies, bearer tokens, or session headers. See `src/lib/hermes/audit-log.ts` — the audit logger actively rejects any summary containing secret markers. |
| No unauthorized submission | Agent code includes four checkpoints (see `src/lib/hermes/checkpoints.ts`). The `FinalSubmissionApproval` checkpoint is the terminal gate — when reached, the agent stops and hands control to the human. |
| Append-only audit trail | Every agent action is appended to `src/lib/hermes/audit-log.ts`. Entries are immutable after creation; clearing the log requires an explicit admin acknowledgement string. |
| Human approval at every risk point | Four checkpoints: post-login verification, document upload confirmation, fee payment authorization, final submission approval. Each can only transition `pending → approved / denied`, enforced by unit tests. |

---

## Prerequisites

1. **Filing data JSON** at `filing-data/{PATENT_ID}-filing-data.json`.
   Generate with `npm run filing:export -- PA-5`.
2. **Downloaded documents** — Specification DOCX, Cover Sheet DOCX, one
   or more Drawing PDFs. Paths must be absolute.
3. **Playwright MCP registered** — follow `docs/PLAYWRIGHT-MCP-SETUP.md`.
4. **Patent Center tab** — user must be logged in at
   `https://patentcenter.uspto.gov` in Chrome before invoking the skill.
5. **Feature flag enabled** — toggle `hermes_agent_enabled` on at
   `/admin/flags` in the web app.

## Invocation

From Claude Code inside the `uspto-filing-assistant` project:

```
Fill Patent Center forms for PA-5 using scripts/patent-center-filing.md
```

The agent will execute the playbook, pausing at each checkpoint for
human approval.

## Four human-in-the-loop checkpoints

| # | Name | When | Action required |
|---|------|------|----------------|
| 1 | `PostLoginVerification` | Before any navigation | Human confirms Patent Center is open and authenticated. |
| 2 | `DocumentUploadConfirmation` | After each document upload | Human confirms the document uploaded successfully and the document type is correct. |
| 3 | `FeePaymentAuthorization` | After "Calculate Fees" click | Human confirms the fee amount matches expectations ($320 for Small Entity). |
| 4 | `FinalSubmissionApproval` | After form fill complete, before Submit | Agent stops. Human reviews everything and clicks Submit manually. |

Each checkpoint is backed by a `CheckpointRecord` in the session state.
See `src/lib/hermes/checkpoints.ts` for the enforcement code and
`src/lib/hermes/checkpoints.test.ts` for the invariant tests.

## Files this skill touches

**Reads:**
- `filing-data/{PATENT_ID}-filing-data.json` — patent field values
- `scripts/patent-center-filing.md` — the filing playbook
- User-supplied DOCX / PDF files via Playwright file upload

**Writes:**
- `localStorage` audit log in the web app (via `src/lib/hermes/audit-log.ts`)

**Never touches:**
- Patent Center credentials, cookies, session tokens
- USPTO databases outside the user's own filing submission

## Terms of service

See `docs/HERMES-TOS-REVIEW.md` for the full policy review. Summary: the
agent's flow (human auth + AI form-fill + human submit) is compatible with
the USPTO Terms of Use, the Patent Electronic System Subscriber Agreement,
and the September 2025 identity verification mandate because the
authenticated human remains the legal submitter.

## Rollback

If the agent misbehaves or Patent Center's UI changes in a way that
breaks the playbook:

1. Immediately toggle `hermes_agent_enabled` to **off** at `/admin/flags`.
2. Report the failure at `/admin/hermes-audit` — the audit log will show
   what the agent was doing when it stopped.
3. Continue the filing manually in Patent Center.
4. File a bug in `docs/HERMES-TOS-REVIEW.md` under "Review trail" so the
   failure mode is documented for future reviewers.

## Known limitations

- Provisional filings only (35 U.S.C. 111(b)).
- Single-patent filings only — no batch mode in Phase 2 POC.
- No support for Track One, RCE, or continuation applications.
- Agent does not handle payment method selection; user selects payment
  method before the agent begins the checkout flow.
- Agent cannot recover from Patent Center session expiry — user must
  re-authenticate manually.
