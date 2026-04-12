# Hermes USPTO Filing Agent — Terms of Service Review

**Purpose.** Record the legal and policy review that justifies building
an AI-assisted form-filling agent for USPTO Patent Center. Future
maintainers should re-read this before making any change that affects
the agent's scope, automation surface, or human-in-the-loop gates.

**Last reviewed.** April 11, 2026
**Reviewer.** Claude Opus 4.6 (on behalf of Milton Overton, Visionary AI Systems Inc)
**Next review due.** October 2026 (or earlier if USPTO publishes new policy)

---

## 1. What the agent does

- Attaches to an **existing, authenticated Chrome tab** via Playwright
  MCP in `--extension` mode.
- Reads a **user-exported JSON** containing patent data (title, inventors,
  assignee, entity status, correspondence) from `filing-data/*.json`.
- Fills Patent Center Web ADS fields, uploads user-supplied documents,
  clicks the **"Calculate Fees"** button, and **stops**.
- **Never** clicks Submit. The human reviews everything and submits manually.

## 2. What the agent explicitly does NOT do

| Action | Blocked by |
|--------|-----------|
| Store, log, or transmit USPTO credentials | `--extension` mode never sees them |
| Store, log, or transmit session cookies or tokens | Same |
| Click the final Submit button | Playbook rule + checkpoint `FinalSubmissionApproval` |
| Scrape other users' patent data | Agent only reads patent IDs listed in the user's own filing-data JSON |
| File without human review of every field | Playbook stops before every irreversible action |
| Operate without explicit `hermes_agent_enabled` feature flag | Default is **off** |

## 3. Relevant USPTO policies

### 3.1 USPTO Terms of Use
*Source: https://www.uspto.gov/terms-use-uspto-websites*

Key passage:

> "Individuals, companies, IP addresses, or blocks of IP addresses who,
> in effect, deny or decrease service by generating unusually high numbers
> of database accesses (searches, pages, or hits), whether generated
> manually or in an automated fashion, may be denied access to USPTO
> servers without notice."

**Applies to us?** No. Our agent performs a finite set of actions for a
single filing, at human speed, in the user's own authenticated session.
This is not a denial-of-service pattern.

### 3.2 Patent Electronic System Subscriber Agreement
*Source: https://www.uspto.gov/sites/default/files/documents/Patent-Electronic-System-Subscriber-Agreement.pdf*

Primary restrictions:
- Accounts must not be shared between individuals.
- Practitioner support staff each need their own USPTO.gov account.
- The USPTO may revoke accounts without notice for violations.

**Applies to us?** The agent uses the account-holder's own authenticated
session; there is no account sharing. The account-holder personally
completes ID.me + MFA, personally reviews every field, and personally
clicks Submit.

### 3.3 Historical precedent: Private PAIR scripting
*Source: https://www.uspto.gov/about-us/news-updates/securing-uspto-online-access*

USPTO disabled automated scripts in Private PAIR that queried *other users'*
data. The restriction is explicitly about **mass data retrieval**, not
about submitting one's own filings.

**Applies to us?** No. We do not query other users' data. We submit a
single patent application that the user owns.

### 3.4 Identity verification mandate (Sept 11, 2025)
*Source: https://blog.patentriff.com/p/uspto-ends-guest-access-to-patent*

All Patent Center access now requires an identity-verified account.

**Applies to us?** **Compatible.** The agent explicitly requires the user
to complete ID.me + MFA manually before the agent begins. This matches
USPTO's intent: a verified human remains the actor.

## 4. Risk assessment

| Risk | Likelihood | Severity | Mitigation |
|------|-----------|----------|------------|
| ToS violation — rate-limit abuse | Very low | Medium | Single filing at human speed |
| ToS violation — data mining | Very low | High | Agent only operates on user's own patent data |
| ToS violation — account sharing | Very low | High | User authenticates personally; agent attaches to their session |
| Credential leakage | Very low | Critical | `--extension` mode; no storage; no logging of headers/cookies |
| Unauthorized submission | Very low | Critical | Playbook prohibits Submit; 4 HITL checkpoints enforce |
| USPTO rejects filing due to automated provenance | Low | Medium | Human clicks Submit, so the human is the legal submitter of record |
| Patent Center UI change breaks agent mid-flow | Medium | Low | Agent stops on any field mismatch and alerts the user |

## 5. Four human-in-the-loop checkpoints (non-bypassable)

Defined in `src/lib/hermes/checkpoints.ts`. Every Hermes filing session
must pass all four checkpoints in order:

1. **`PostLoginVerification`** — agent confirms user is authenticated
   in Patent Center before any action.
2. **`DocumentUploadConfirmation`** — agent pauses after each document
   upload so the human can verify the upload succeeded and the document
   type is correct.
3. **`FeePaymentAuthorization`** — agent pauses after "Calculate Fees"
   and before any payment action; the human confirms the fee amount.
4. **`FinalSubmissionApproval`** — agent stops before Submit and hands
   control to the human.

Each checkpoint is recorded in the append-only audit log
(`src/lib/hermes/audit-log.ts`) with timestamp, action description,
status, and human decision.

## 6. Open questions / known limitations

- **Subscriber Agreement full text** — we reviewed the plain-text
  extracts but could not parse the PDF in-context. If any future revision
  explicitly addresses third-party automation tools, this document must
  be updated and the agent must be re-reviewed.
- **Rate limits for Web ADS POST endpoints** — not publicly documented.
  Single-filing use should never trip any reasonable rate limit.
- **Agent does not attempt to file non-provisional applications** — scope
  limited to provisional (35 U.S.C. 111(b)) filings. Re-review required
  before expanding.

## 7. Who to contact if USPTO flags an account

1. Stop using the agent immediately.
2. Email USPTO eBC (Electronic Business Center): `ebc@uspto.gov` or
   1-866-217-9197.
3. Be prepared to explain: the account-holder personally authenticated,
   personally reviewed, and personally submitted. The agent only filled
   form fields and uploaded documents the user had already prepared.

## 8. Review trail

| Date | Reviewer | Change |
|------|----------|--------|
| 2026-04-11 | Claude Opus 4.6 | Initial draft; Phase 2 recon |
