# ROADMAP — USPTO Patent Filing Assistant
## Visionary AI Systems, Inc. | April 4, 2026
## Owner: Milton Overton | Approved by: __________ | Date: __________

---

## Executive Summary

This roadmap covers the transformation of the USPTO Patent Filing Assistant from a
single-user personal tool into a multi-tenant SaaS platform aligned with the PA-5
VADI (Voice-First Agentic Database Infrastructure) patent architecture. The plan is
organized into 5 phases over 8 weeks, with 44 features grouped by domain.

**Current state:** Production-grade filing wizard with 6-agent voice assistant,
7-patent portfolio, legal document generator, trademark module, prior art search,
and Mermaid.js drawing export. Deployed on Vercel. No database, no auth, localStorage only.

**Target state:** Multi-tenant platform with Supabase Auth + PostgreSQL, in-app DOCX
generation, admin console, feature flags, USPTO ODP API integration, and voice
architecture aligned with PA-5 VQE/AEF/HAL/MPCB primitives.

---

## Critical Fixes (Lessons from PA-1 Filing Session)

### CF-1: In-App DOCX Generation
- **Priority:** P0 (blocks PA-5 filing this week)
- **What:** Generate USPTO-compliant DOCX files directly in the app using the `docx`
  npm library (already in devDependencies as jszip, but need `docx` package)
- **Why:** PA-1 required manual DOCX generation outside the app. Cover sheet and
  specification had formatting issues (comments, non-white background, wrong margins)
  that caused USPTO validation warnings
- **Spec:** Times New Roman 12pt, 1" margins, 1.5 line spacing, white background,
  no comments, no tracked changes, no shading (37 CFR 1.52)
- **Files:** New `src/lib/docx-generator.ts` with `generateSpecDOCX()` and
  `generateCoverSheetDOCX()` functions
- **Effort:** 4-6 hours

### CF-2: Cover Sheet Heading Format
- **Priority:** P0
- **What:** Cover sheet DOCX must have heading "PROVISIONAL APPLICATION COVER SHEET"
  as the first line for USPTO auto-detection to label it correctly as
  "Provisional Cover Sheet (SB16)" instead of "Miscellaneous Incoming Letter"
- **Files:** Part of CF-1 implementation
- **Effort:** Included in CF-1

### CF-3: Drawing PDF Page Size Validation
- **Priority:** P0
- **What:** Validate that generated drawing PDFs are exactly 8.5x11" (US Letter).
  Current jsPDF generation uses correct dimensions but no validation step exists
- **Why:** USPTO requires exact page dimensions per 37 CFR 1.84
- **Files:** `src/pages/Drawings.tsx` — add page-size validation before download
- **Effort:** 1 hour

### CF-4: Filing Fee Correction
- **Priority:** P0
- **What:** The fee for a Small Entity provisional application is **$320** (2026).
  Update all references to ensure consistency. The CLAUDE.md HITL checklist item #4
  incorrectly says "Georgia Corporation" — Visionary AI Systems is a **Delaware Corporation**
- **Files:** `CLAUDE.md` (checklist item #4), verify `src/lib/uspto.ts`
- **Effort:** 30 minutes

### CF-5: Filing Package Screen
- **Priority:** P1
- **What:** New page `/filing-package` showing all documents for a patent with their
  USPTO document type labels (Specification, Provisional Cover Sheet SB16, Drawings)
- **Why:** During PA-1 filing, Milton had to manually determine which document type to
  select for each upload. The app should show this mapping clearly
- **Deliverables:**
  - Document list with type labels
  - Upload status tracking per document
  - "Copy document type" button for each
  - Download all as ZIP
- **Files:** New `src/pages/FilingPackage.tsx`, route in `App.tsx`
- **Effort:** 4-6 hours

### CF-6: PA-1 Portfolio Status Update
- **Priority:** P0
- **What:** PA-1 has been filed (Application #64/029,100). The `PORTFOLIO_INIT` in
  `src/lib/uspto.ts` still shows `status: 'ready'`. Update to `'filed'` with the
  application number and calculate the nonprovisional deadline (April 3, 2027)
- **Files:** `src/lib/uspto.ts` lines 32-41
- **Effort:** 15 minutes

---

## Voice Assistant Enhancements (PA-5 VADI Alignment)

### VA-1: Voice-Controlled Filing Workflow
- **Priority:** P1
- **What:** Enable voice commands like "File PA-5 for me" to open the wizard with
  PA-5 pre-loaded and walk through steps via voice narration
- **Architecture:** New `filing-workflow` agent role that can trigger wizard navigation
- **PA-5 Alignment:** Maps to VQE `processVoiceInput()` + AEF agent routing
- **Effort:** 8-12 hours

### VA-2: Voice Patent Portfolio Queries
- **Priority:** P1
- **What:** Answer questions like "What's my next deadline?", "How many patents are
  filed?", "What's the status of PA-3?" using structured portfolio data
- **Current gap:** The `portfolio` agent has knowledge baked into the prompt but can't
  query live data. Need to pass current portfolio state into agent context
- **PA-5 Alignment:** Maps to VQE semantic mapping for patent domain entities
- **Effort:** 4-6 hours

### VA-3: Voice Document Generation
- **Priority:** P2
- **What:** "Generate the specification for PA-3" triggers DOCX generation and offers
  download via voice confirmation
- **Depends on:** CF-1 (DOCX generation)
- **PA-5 Alignment:** Maps to AEF agent action → HAL approval gate → execution
- **Effort:** 6-8 hours

### VA-4: Multi-Turn Conversation with Filing Context
- **Priority:** P2
- **What:** Maintain conversation state across turns so follow-up questions work:
  "What's due this week?" → "File that one" → system knows which patent
- **Current state:** Last 6 messages passed as context, but no structured state tracking
- **PA-5 Alignment:** Maps to VQE context preservation module (component 220)
- **Effort:** 6-8 hours

### VA-5: Agent Memory Across Sessions
- **Priority:** P2 (requires database)
- **What:** Persist conversation history and user preferences across browser sessions
- **Current state:** Messages stored in React state only, lost on page refresh
- **Depends on:** Phase 1 database setup
- **PA-5 Alignment:** Maps to multi-tenant isolation layer for user-scoped data
- **Effort:** 4-6 hours

### VA-6: Voice-First USPTO Search via ODP API
- **Priority:** P3
- **What:** "Search for voice-controlled database patents filed in 2025" triggers
  USPTO ODP API query and reads back results
- **Depends on:** USPTO ODP API key (get from data.uspto.gov)
- **PA-5 Alignment:** Maps to VQE → database query → result routing → voice response
- **Effort:** 8-12 hours

### VA-7: Align Voice Architecture with PA-5 Primitives
- **Priority:** P2
- **What:** Refactor the voice assistant to use architecture patterns from the PA-5
  VADI specification:
  - **VQE pattern:** Standardized audio capture → NLP intent → semantic mapping → query
  - **AEF pattern:** Agent registry with declared capabilities, configurable routing rules
  - **HAL pattern:** Action interceptor for any voice-initiated filing/communication action
  - **MPCB pattern:** Multi-provider TTS/STT with failover
- **Current state:** Voice pipeline works but uses flat intent routing, not the
  registerable agent/routing pattern described in PA-5
- **Refactor scope:**
  - Extract agent registry from hardcoded `AGENT_PROMPTS` → dynamic registration
  - Add HAL approval gate before voice-initiated filing actions
  - Add MPCB pattern for TTS providers (Web Speech → cloud TTS fallback)
- **Files:** `src/hooks/useVoiceAssistant.ts` (major refactor), new `src/lib/vadi/`
  directory for VQE, AEF, HAL, MPCB modules
- **Effort:** 16-24 hours (spread across Phase 3)

---

## Authentication & User Management

### AU-1: Supabase Auth Integration
- **Priority:** P1 (Phase 1 foundation)
- **What:** Enable email/password + Google OAuth login via Supabase Auth
- **Current state:** `src/lib/supabase.ts` and `src/hooks/useAuth.ts` are fully
  scaffolded but inactive. Supabase client is conditionally initialized
- **Work needed:**
  - Create Supabase project
  - Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel
  - Enable email + Google providers in Supabase dashboard
  - Activate the auth flow in the existing code
- **Effort:** 2-4 hours (mostly config, code exists)

### AU-2: Role-Based Access Control (RBAC)
- **Priority:** P2
- **What:** 5 roles: Super Admin, Org Admin, Patent Manager, Inventor, Viewer
- **Implementation:** Store role in `profiles` table, enforce via RLS + React context
- **Role permissions:**
  | Role | File Patents | Manage Users | View Portfolio | Admin Console |
  |------|-------------|-------------|----------------|--------------|
  | Super Admin | Yes | Yes | All orgs | Full |
  | Org Admin | Yes | Org only | Org only | Org only |
  | Patent Manager | Yes | No | Org only | No |
  | Inventor | Own only | No | Own only | No |
  | Viewer | No | No | Assigned only | No |
- **Effort:** 8-12 hours

### AU-3: User Invite Flow
- **Priority:** P3
- **What:** Org admins can invite users via email with role assignment
- **Effort:** 4-6 hours

### AU-4: Session Management
- **Priority:** P1 (included with AU-1)
- **What:** JWT-based session management via Supabase. Auto-refresh tokens.
  Redirect to login on 401. Store session in secure httpOnly cookie
- **Effort:** Included in AU-1

### AU-5: Protected Routes
- **Priority:** P1
- **What:** Auth guard HOC wrapping routes that require login. Public routes:
  landing page, login, register. Everything else requires auth
- **Files:** New `src/components/auth/ProtectedRoute.tsx`
- **Effort:** 2 hours

### AU-6: User Profile Page
- **Priority:** P3
- **What:** `/profile` page showing user info, org membership, preferences,
  notification settings
- **Effort:** 4 hours

---

## Database & Data Model

### DB-1: Supabase PostgreSQL Schema
- **Priority:** P1 (Phase 1 foundation)
- **What:** Core tables for multi-tenant patent management
- **Tables:** See DATABASE.md for complete schema
  - `organizations` — multi-tenant org container
  - `profiles` — user profiles with role assignment
  - `patents` — patent portfolio with org isolation
  - `patent_documents` — file metadata and storage refs
  - `wizard_sessions` — save/resume wizard progress
  - `inventor_profiles` — reusable inventor data
  - `assignee_profiles` — reusable assignee data
  - `filing_receipts` — archived filing confirmations
  - `audit_log` — all significant actions
  - `feature_flags` — toggle features per scope
- **Effort:** 6-8 hours (schema + migrations + RLS)

### DB-2: RLS Policies
- **Priority:** P1
- **What:** Row-level security for complete multi-tenant data isolation
- **Policy pattern:** All tables filtered by `org_id` matching the user's org
- **PA-5 Alignment:** Maps to multi-tenant isolation layer (component 700)
- **Effort:** Included in DB-1

### DB-3: Patent Filing Status Tracking
- **Priority:** P1
- **What:** Status lifecycle: `draft` → `ready` → `filing` → `filed` → `prosecution` → `granted`
- **Current state:** Status is a simple string in localStorage. Need proper state machine
  with transition rules, timestamps, and audit trail
- **Effort:** 4 hours

### DB-4: Document Storage
- **Priority:** P1
- **What:** Supabase Storage bucket for DOCX, PDF, and image files. Metadata in
  `patent_documents` table. Signed URLs for download
- **Bucket structure:** `/{org_id}/{patent_id}/{document_type}/{filename}`
- **Effort:** 4 hours

### DB-5: Filing Receipt Archival
- **Priority:** P1
- **What:** Store filing receipt data (app number, filing date, confirmation number)
  in database with link to patent record
- **Effort:** 2 hours

---

## Admin Management Console

### AD-1: Admin Dashboard (`/admin/dashboard`)
- **Priority:** P2 (Phase 4)
- **What:** System-wide stats: total users, active sessions, patents filed, documents
  generated, voice queries processed, filing success rate
- **Effort:** 6-8 hours

### AD-2: User Management (`/admin/users`)
- **Priority:** P2
- **What:** User CRUD, role assignment, org assignment, invite flow, deactivation
- **Effort:** 8-12 hours

### AD-3: Organization Management (`/admin/organizations`)
- **Priority:** P3
- **What:** Create/edit orgs, assign admins, view org-level stats, billing info
- **Effort:** 6-8 hours

### AD-4: Patent Overview (`/admin/patents`)
- **Priority:** P2
- **What:** Cross-org patent table with filters (status, org, date range), bulk actions
- **Effort:** 6-8 hours

### AD-5: Audit Log Viewer (`/admin/audit`)
- **Priority:** P2
- **What:** Searchable log of all significant actions (filing submissions, document
  generation, role changes, feature flag toggles) with user attribution
- **PA-5 Alignment:** Maps to HAL authorization audit log (component 340)
- **Effort:** 6-8 hours

### AD-6: System Settings (`/admin/settings`)
- **Priority:** P3
- **What:** Global configuration: default entity status, fee overrides, API key
  management, email templates
- **Effort:** 4 hours

### AD-7: Feature Flags UI (`/admin/feature-flags`)
- **Priority:** P2
- **What:** Toggle features per scope (global, org, user) with UI
- **Effort:** 4-6 hours

---

## Feature Flags System

### FF-1: Database-Driven Feature Flags
- **Priority:** P1 (Phase 1 foundation)
- **What:** `feature_flags` table with scope hierarchy: global → org → user.
  Most specific scope wins. React context provider for client-side access
- **Flags needed at launch:**
  - `voice_assistant_enabled` (default: true)
  - `ai_analysis_enabled` (default: true)
  - `docx_generation_enabled` (default: false — enable after CF-1)
  - `drawing_generator_enabled` (default: true)
  - `odp_api_integration` (default: false — enable after VA-6)
  - `multi_patent_filing` (default: false)
  - `admin_console_enabled` (default: false — enable after AD-1)
  - `legal_docs_enabled` (default: true)
  - `trademark_module_enabled` (default: true)
  - `prior_art_search_enabled` (default: true)
- **Files:** New `src/lib/feature-flags.ts`, `src/hooks/useFeatureFlags.ts`,
  `src/contexts/FeatureFlagContext.tsx`
- **Effort:** 6-8 hours

---

## Post-Filing Integration

### PF-1: USPTO ODP API Integration
- **Priority:** P2 (Phase 5)
- **What:** Track filed applications via api.uspto.gov Open Data Portal
- **Prerequisite:** Get ODP API key from data.uspto.gov
- **Features:**
  - Auto-check application status on dashboard load
  - Show prosecution timeline (office actions, responses, grants)
  - Pull official filing receipt data
- **Effort:** 12-16 hours

### PF-2: Assignment Recording Status
- **Priority:** P2
- **What:** Check assignment recording status at assignmentcenter.uspto.gov via API
- **Why:** Assignment agreement must be recorded to perfect assignee rights
- **Effort:** 4-6 hours

### PF-3: Prosecution Timeline Viewer
- **Priority:** P3
- **What:** Visual timeline of patent prosecution events (filing → office actions →
  responses → allowance → grant) pulled from ODP API
- **Effort:** 8-12 hours

### PF-4: Office Action Alerts
- **Priority:** P3
- **What:** Email/in-app notifications when USPTO issues an office action on any
  tracked application. Critical for meeting 3-month response deadlines
- **Effort:** 6-8 hours

### PF-5: Deadline Calendar with Notifications
- **Priority:** P2
- **What:** Calendar view of all deadlines (provisional filings, nonprovisional
  deadlines, office action responses, trademark maintenance) with email reminders
  at 30, 14, 7, and 1 day before each deadline
- **Effort:** 8-12 hours

---

## Filing Automation

### FA-1: Reusable Inventor Profiles
- **Priority:** P1
- **What:** Save inventor details (name, address, citizenship) as reusable profiles.
  Auto-populate for PA-2 through PA-7 — all use the same two inventors
- **Current gap:** Inventor info is extracted fresh from spec text every time
- **Files:** New `src/components/wizard/InventorSelector.tsx`
- **Effort:** 4 hours

### FA-2: Reusable Assignee Profiles
- **Priority:** P1
- **What:** Save assignee details (company name, address, type, state, EIN) as
  reusable profile. All 7 patents use the same assignee
- **Effort:** 2 hours

### FA-3: One-Click Filing Package Generator
- **Priority:** P1
- **What:** For a given patent ID, generate all required documents (spec DOCX, cover
  sheet DOCX, drawing PDFs) as a downloadable ZIP with a manifest showing what
  document type to select for each file in Patent Center
- **Depends on:** CF-1, CF-5
- **Effort:** 6-8 hours

### FA-4: Patent Template System
- **Priority:** P2
- **What:** Clone PA-1 filing structure (inventor info, assignee, entity status) as a
  template for new patents. Only spec text and drawings differ
- **Effort:** 4-6 hours

### FA-5: Batch Filing Support
- **Priority:** P3
- **What:** Prepare filing packages for multiple patents simultaneously. Useful for
  filing PA-2 + PA-3 together (same deadline: April 27, 2026)
- **Effort:** 8-12 hours

---

## Additional Gaps Found During Review

### Code Quality Gaps
- **No test files exist** — vitest is configured but no tests written. Need unit tests
  for: validation logic, date utilities, JSON parsing, storage helpers
- **No error boundary** — React error boundary should wrap the app to prevent white screens
- **No loading skeleton** — pages show nothing while data loads
- **PATENT_SPECS map mutation** — `src/lib/uspto.ts` lines 634, 778-781 mutate the
  exported `PATENT_SPECS` object at module level. Should use a single const declaration
- **Patent specs as huge strings in source** — All 7 specs totaling ~40KB are hardcoded
  in `src/lib/uspto.ts`. Should be separate files or database entries

### Security Gaps
- **API key exposed in browser** — `VITE_ANTHROPIC_API_KEY` is client-side accessible.
  Acceptable for personal tool but must be moved server-side for SaaS
- **No rate limiting** — Claude API calls have no rate limiting, could exceed quota
- **No CSRF protection** — API endpoints have no CSRF tokens
- **GitHub token exposed** — Session handoff document contains a GitHub PAT that should
  be rotated immediately: `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`

### UX Gaps
- **No offline support** — No service worker, no offline cache. Filing prep should work offline
- **Voice requires Chrome/Edge** — Web Speech API not available in Firefox/Safari. Need
  fallback or user guidance
- **No keyboard navigation for voice** — Accessibility gap for users who can't use mouse
- **No dark mode toggle** — Dark mode classes exist in Tailwind config but no toggle UI
- **Mobile voice UX** — Floating voice panel may obscure content on small screens

### Feature Gaps
- **No PDF upload support** — Step 1 accepts .txt, .md, .docx, .doc but not .pdf.
  Many patent specs start as PDFs
- **No version history** — No way to see previous versions of a specification or compare changes
- **No collaboration** — Single-user tool with no sharing or commenting
- **No export to XML** — USPTO Patent Center accepts XML for some fields; could pre-fill
- **No analytics/telemetry** — No usage tracking for product improvement
- **No SEO** — SPA with no SSR/SSG, not discoverable by search engines (may be intentional)

### CLAUDE.md Correction Needed
- **Item #4 in HITL checklist** says "Georgia Corporation" but Visionary AI Systems is
  incorporated in **Delaware** (State ID: 10468520). The assignee address is in Georgia
  but the incorporation state is Delaware. This must be corrected.

---

## Phased Implementation Plan

### Phase 1 — Foundation (Week 1: April 7-11, 2026)
| ID | Feature | Effort | Depends On |
|----|---------|--------|------------|
| CF-4 | Filing fee + CLAUDE.md correction | 30 min | — |
| CF-6 | PA-1 status update in portfolio | 15 min | — |
| CF-1 | In-app DOCX generation | 6 hrs | — |
| CF-2 | Cover sheet heading format | incl. | CF-1 |
| CF-3 | Drawing PDF validation | 1 hr | — |
| AU-1 | Supabase Auth activation | 4 hrs | Supabase project |
| AU-5 | Protected routes | 2 hrs | AU-1 |
| DB-1 | PostgreSQL schema + RLS | 8 hrs | Supabase project |
| FF-1 | Feature flags system | 6 hrs | DB-1 |
| FA-1 | Reusable inventor profiles | 4 hrs | DB-1 |
| FA-2 | Reusable assignee profiles | 2 hrs | DB-1 |

**Phase 1 total: ~34 hours**
**Milestone:** PA-5 can be filed using improved in-app workflow

### Phase 2 — Filing Improvements (Week 2: April 14-18, 2026)
| ID | Feature | Effort | Depends On |
|----|---------|--------|------------|
| CF-5 | Filing Package screen | 6 hrs | CF-1 |
| FA-3 | One-click filing package ZIP | 8 hrs | CF-1, CF-5 |
| DB-3 | Patent status lifecycle | 4 hrs | DB-1 |
| DB-4 | Document storage (Supabase) | 4 hrs | DB-1 |
| DB-5 | Filing receipt archival | 2 hrs | DB-1 |
| VA-2 | Voice portfolio queries | 6 hrs | — |
| FA-4 | Patent template system | 6 hrs | DB-1 |

**Phase 2 total: ~36 hours**
**Milestone:** File PA-2 and PA-3 by April 27 deadline using new workflow

### Phase 3 — Voice Enhancement (Weeks 3-4: April 21 - May 2, 2026)
| ID | Feature | Effort | Depends On |
|----|---------|--------|------------|
| VA-1 | Voice-controlled filing | 12 hrs | CF-1 |
| VA-3 | Voice document generation | 8 hrs | CF-1 |
| VA-4 | Multi-turn context | 8 hrs | — |
| VA-5 | Agent memory persistence | 6 hrs | DB-1 |
| VA-7 | PA-5 VADI architecture alignment | 24 hrs | VA-1, VA-4 |
| AU-2 | RBAC implementation | 12 hrs | AU-1, DB-1 |

**Phase 3 total: ~70 hours**
**Milestone:** Voice assistant reflects PA-5 VADI architecture

### Phase 4 — Admin Console (Weeks 5-6: May 5-16, 2026)
| ID | Feature | Effort | Depends On |
|----|---------|--------|------------|
| AD-1 | Admin dashboard | 8 hrs | DB-1, AU-2 |
| AD-2 | User management | 12 hrs | AU-2 |
| AD-4 | Patent overview | 8 hrs | DB-1 |
| AD-5 | Audit log viewer | 8 hrs | DB-1 |
| AD-7 | Feature flags UI | 6 hrs | FF-1 |
| AU-3 | User invite flow | 6 hrs | AU-2 |

**Phase 4 total: ~48 hours**
**Milestone:** Admin console operational for multi-user management

### Phase 5 — Post-Filing & Enterprise (Month 2: May 19 - June 13, 2026)
| ID | Feature | Effort | Depends On |
|----|---------|--------|------------|
| PF-1 | USPTO ODP API integration | 16 hrs | ODP API key |
| PF-2 | Assignment recording check | 6 hrs | PF-1 |
| PF-5 | Deadline calendar + notifications | 12 hrs | DB-1 |
| VA-6 | Voice USPTO search | 12 hrs | PF-1 |
| AD-3 | Organization management | 8 hrs | AU-2 |
| AD-6 | System settings | 4 hrs | AD-1 |
| FA-5 | Batch filing support | 12 hrs | FA-3 |
| AU-6 | User profile page | 4 hrs | AU-1 |

**Phase 5 total: ~74 hours**
**Milestone:** Full post-filing tracking and enterprise-ready features

### Backlog (Month 3+)
| ID | Feature | Effort |
|----|---------|--------|
| PF-3 | Prosecution timeline viewer | 12 hrs |
| PF-4 | Office action alerts | 8 hrs |
| — | PDF upload support in wizard | 6 hrs |
| — | Error boundary + loading skeletons | 4 hrs |
| — | Unit test suite (vitest) | 16 hrs |
| — | E2E tests (Playwright) | 16 hrs |
| — | Offline support (service worker) | 8 hrs |
| — | Dark mode toggle | 2 hrs |
| — | Patent MCP server integration | 16 hrs |
| — | Playwright MCP filing agent (Phase 2) | 24 hrs |
| — | SSO (SAML/OIDC) support | 12 hrs |
| — | Billing/subscription management | 20 hrs |

---

## Recommended Tech Stack Additions

| Addition | Justification |
|----------|---------------|
| `docx` npm package | Generate USPTO-compliant DOCX files in-browser (CF-1) |
| `@supabase/supabase-js` | Already in package.json, needs activation |
| `@supabase/auth-helpers-react` | Simplify React auth integration |
| `react-error-boundary` | Prevent white-screen crashes |
| `zustand` or `@tanstack/react-query` | State management for multi-source data (database + API + localStorage) — evaluate need in Phase 2 |
| `playwright` (dev) | E2E testing framework |
| `@sentry/react` | Error tracking and performance monitoring for production |
| `ical-generator` | Generate calendar files for deadline reminders |

---

## Filing Calendar (Critical Dates)

| Date | Action | Fee | Status |
|------|--------|-----|--------|
| April 3, 2026 | PA-1 filed | $320 | DONE (App #64/029,100) |
| **This week** | PA-5 VADI filing | $320 | NEXT |
| **This week** | Sign Assignment Agreement | $0 | URGENT |
| April 27, 2026 | PA-2 Athletic Dept | $320 | CRITICAL DEADLINE |
| April 27, 2026 | PA-3 Campaign Orchestration | $320 | CRITICAL DEADLINE |
| May 27, 2026 | PA-4 Revenue Intelligence | $320 | Planned |
| June 2026 | Voice First Athletics TM | $250 | Planned |
| June 2026 | CSOS TM | $250 | Planned |
| March 28, 2027 | PA-1 Nonprovisional | ~$1,660 | MANDATORY |

---

## Success Metrics

| Metric | Phase 1 | Phase 3 | Phase 5 |
|--------|---------|---------|---------|
| Patents filed using app | PA-5 | PA-2, PA-3 | PA-4, PA-6, PA-7 |
| Time to prepare filing package | < 30 min | < 15 min | < 5 min |
| Voice assistant commands | 6 agents | 8 agents | 10+ agents |
| Active users | 1 (Milton) | 2-3 (Milton, Lisa, attorney) | 10+ (multi-tenant) |
| Test coverage | 0% | 40% | 80% |
| DOCX generation accuracy | Manual | In-app, validated | One-click, verified |

---

*This roadmap is a plan for Milton's review. NO code changes will be made until approved.*
*Generated: April 4, 2026 by Claude Code*
