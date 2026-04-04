# CLAUDE.md — AI-First Development Guide
## USPTO Patent Filing Assistant | Visionary AI Systems Inc

This file instructs all AI coding assistants (Claude, Cursor, Copilot, etc.) on
conventions, architecture decisions, and domain-specific rules. Read this ENTIRE file
before making any changes to the codebase.

---

## Project Overview

| Field | Value |
|-------|-------|
| Product | USPTO Patent Filing Assistant |
| Owner | Visionary AI Systems Inc — Milton & Lisa Overton |
| Domain | US Patent law, provisional patent applications, IP portfolio management |
| Stack | React 18 + TypeScript 5 + Vite 5 + Tailwind CSS 3 + Vercel |
| AI Model | Anthropic Claude claude-sonnet-4-20250514 |
| Live URL | https://uspto-filing-assistant.vercel.app |
| Repo | https://github.com/GF-Accelerate/uspto-filing-assistant |
| Company | Visionary AI Systems, Inc. — **Delaware Corporation** (State ID: 10468520) |
| EIN | 41-3757112 |
| Address | 1102 Cool Springs Drive, Kennesaw, GA 30144 |

---

## Critical Domain Rules — Read Before Touching Any Code

### USPTO Legal Constraints
- **NEVER** automate the final Submit button in Patent Center — ID.me + MFA require human
- **NEVER** store USPTO credentials, session tokens, or cookies
- **ALWAYS** display the 12-month nonprovisional deadline wherever an app number appears
- **ALWAYS** enforce the HITL (human-in-the-loop) gate before any filing action
- Patent dates use ISO 8601 internally; display as US locale strings in the UI
- Small Entity provisional fee is **$320** (2026 — verify at USPTO fee schedule annually Jan 1)
- `"Batman MO Development Team"` is NOT a valid inventor — flag and reject this string
- `KSU` / `Kennesaw State University` has NO ownership interest — flag if it appears as assignee
- **Visionary AI Systems, Inc. is a Delaware Corporation** — NOT Georgia. The office is in Georgia but incorporation is in Delaware. Always say "Delaware Corporation" in legal documents.

### Inventor Validation
- All inventors must be human persons with full legal names
- Each inventor requires: `name`, `address` (City State ZIP), `citizenship`
- Min 1 inventor, max 10 per provisional application
- AI systems, teams, and organizations cannot be named as inventors

### Patent Filing Status Rules
- Only update a patent status to `'filed'` after receiving an official USPTO Filing Receipt
- Filing receipt must include an Application Number (format: `63/XXX,XXX` or `64/XXX,XXX`)
- PA-1 has been filed: Application #64/029,100 (filed April 3, 2026, nonprovisional due April 3, 2027)
- PA-2 and PA-3 deadlines: April 27, 2026 — CRITICAL
- PA-5 VADI: file this week — platform licensing moat

---

## Architecture

```
src/
├── components/
│   ├── ui/             # Primitives: Button, Card, Badge, CopyField, Alert
│   ├── wizard/         # Filing wizard step components (Step1–Step6)
│   ├── voice/          # VoiceAssistant.tsx — floating chat panel
│   ├── auth/           # AuthModal, UserMenu (Phase 2)
│   ├── portfolio/      # PatentCard
│   └── shared/         # DeadlineBadge, SectionHead, Spinner
├── hooks/
│   ├── useClaudeAPI.ts # Claude API wrapper for wizard
│   ├── usePortfolio.ts # Portfolio CRUD + localStorage persistence
│   ├── useWizard.ts    # 6-step wizard state machine
│   ├── useAuth.ts      # Supabase auth (Phase 2, scaffolded)
│   └── useVoiceAssistant.ts # Voice pipeline: STT → intent → agent → TTS
├── lib/
│   ├── claude.ts       # Claude client, system prompts as named constants
│   ├── uspto.ts        # USPTO URLs, fees, checklist items, portfolio init, patent specs
│   ├── validation.ts   # Patent data validators (inventors, title, entity)
│   ├── storage.ts      # localStorage helpers with type safety + versioning
│   └── supabase.ts     # Supabase client (Phase 2, scaffolded)
├── types/
│   └── patent.ts       # All domain types — import from here, never redefine
├── pages/              # 9 route pages
└── App.tsx             # Root component with routing
api/
├── claude.ts           # Vercel serverless proxy for Anthropic API
└── openrouter.ts       # Adaptive model routing for voice assistant
```

---

## State Management

- `useState` + `useReducer` for component-level state
- Custom hooks for shared domain state (see `src/hooks/`)
- Portfolio state persisted to `localStorage` via `usePortfolio`
- **No Redux, Zustand, or Jotai** — hooks are sufficient for this scope
- Phase 2: Add Supabase as source of truth, localStorage as offline fallback

---

## Claude API Rules

- Model: `claude-sonnet-4-20250514` — do not change without full regression test
- All Claude calls go through `/api/claude` Vercel proxy (server-side API key)
- Voice calls go through `/api/openrouter` with adaptive model routing
- All system prompts are named constants in `src/lib/claude.ts`
- Handle errors: show `Alert` component — never raw error objects to users
- API key lives in env vars — never hardcoded in source

---

## Code Conventions

### TypeScript
- `strict: true` — no `any`, no `@ts-ignore`
- Props interfaces explicitly defined — no implicit spreading
- Domain types imported from `src/types/patent.ts`
- Prefer `type` for unions; `interface` for object shapes

### React
- Functional components only
- Custom hooks for logic > ~20 lines
- `useMemo`/`useCallback` only with measured perf justification

### Styling
- Tailwind CSS utilities only — no custom `.css` files
- Design tokens in `tailwind.config.js`
- Mobile-first; `md:` breakpoint for desktop
- Dark mode: `dark:` variants on all color classes

### Naming
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utilities: `camelCase.ts`
- Constants: `SCREAMING_SNAKE_CASE`

---

## Environment Variables

```bash
VITE_ANTHROPIC_API_KEY=sk-ant-...   # Required: Claude API key
VITE_APP_VERSION=1.0.0              # Set by CI/CD
VITE_ENVIRONMENT=development        # development | staging | production
# Phase 2:
# VITE_SUPABASE_URL=https://xxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...
# OPENROUTER_API_KEY=sk-or-...      # Server-side only (no VITE_ prefix)
# USPTO_ODP_API_KEY=...             # Server-side only
```

Only `.env.example` is committed. Never commit `.env`.

---

## What NOT To Do

### Immutable Rules
- **NEVER** remove the HITL gate or the 14-item compliance checklist
- **NEVER** remove the 12-month deadline display
- **NEVER** rename the `CHECKLIST_ITEMS` constant — the order maps to legal requirements
- **NEVER** hardcode inventor names, application numbers, or patent titles in components
- **NEVER** store USPTO credentials, session tokens, or cookies
- **NEVER** upgrade React/Vite major versions without testing all Claude API integrations
- **NEVER** modify any patent specification text without Milton's explicit approval
- **NEVER** change the HITL gate language in patent claims (Claims 1, 9, 14)

### Voice Assistant Safeguards
- **DO NOT** break the voice assistant — it is working and deployed
- **DO NOT** remove any of the 6 agent roles (deadline, document, filing, portfolio, claims, general)
- **DO NOT** change the voice selection priority list without testing on Chrome + Edge
- **DO NOT** remove the sentence chunking for Chrome 15-second TTS bug
- **DO NOT** remove the auto-stop-on-new-input behavior

### Filing Wizard Safeguards
- **DO NOT** change the 6-step wizard flow — it successfully filed PA-1
- **DO NOT** reduce the checklist below 14 items
- **DO NOT** allow the checklist to be bypassed programmatically
- **DO NOT** auto-check checklist items — human must check each one manually

### Patent Spec Safeguards
- **DO NOT** include trade secrets in patent specifications:
  - Exact NLP prompt templates
  - Specific RFE scoring weight values
  - Athletic domain vocabulary corpus
  - Edge function performance tuning configurations
  - External API integration methods
- **DO NOT** include KSU as co-inventor, assignee, or rights holder
- **DO NOT** change entity status from "Small Entity" without legal review
- **DO NOT** modify the HITL "non-bypassable" claim language — this is the core IP differentiator

---

## Vercel Deployment

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "nodeVersion": "20.x"
}
```

All env vars must be set in the Vercel dashboard — never in committed files.

---

## The 14-Item HITL Checklist (Immutable)

These map to actual USPTO provisional application requirements.
**Do not add, remove, or reword** without legal review.

1. All inventor legal names listed (human persons only)
2. All inventor mailing addresses and citizenship included
3. Title is technically accurate and descriptive
4. Assignee is Visionary AI Systems Inc (**Delaware Corporation**)
5. Small Entity status claimed (50% fee reduction)
6. Specification complies with 35 U.S.C. §112(a) enablement
7. Drawings or FIG. diagrams included
8. Claims included (strengthens priority benefit)
9. Abstract included (150 words max)
10. NO information disclosure statement (not permitted in provisionals)
11. Documents in DOCX or PDF format
12. ID.me identity verification complete for USPTO.gov account
13. MFA configured (Okta Verify — email no longer accepted after Nov 2025)
14. Payment method ready (credit card or EFT)

---

## Patent Portfolio Reference

| ID | Title | Status | App # | Deadline |
|----|-------|--------|-------|----------|
| PA-1 | Voice-Controlled Database Query + Agent Execution | Filed | 64/029,100 | Apr 3, 2027 |
| PA-2 | Athletic Department Management Platform | Ready | — | Apr 27, 2026 |
| PA-3 | Multi-Modal Campaign Orchestration via Voice | Ready | — | Apr 27, 2026 |
| PA-4 | Predictive Sports Revenue Intelligence Engine | Draft | — | May 27, 2026 |
| PA-5 | Voice-First Agentic Database Infrastructure (VADI) | Ready | — | File this week |
| PA-6 | Conversational AI-Guided IP Development Platform | Ready | — | File this week |
| PA-7 | Federated Multi-Vertical Industry Learning System | Ready | — | Within 30 days |

---

## PA-5 VADI Architecture Primitives (Reference)

When modifying the voice assistant or building new features, align with these
PA-5 primitives where applicable:

- **VQE** (Voice-to-Query Engine): Standardized audio → NLP → semantic mapping → query
- **AEF** (Agentic Execution Framework): Agent registry, routing rules, chain orchestrator
- **HAL** (Human Authorization Layer): Non-bypassable platform-layer action interceptor
- **MPCB** (Multi-Provider Communication Bus): Failover delivery with compliance

See `ARCHITECTURE.md` Section 3 for detailed mapping.

---

## Testing Requirements

Before merging any PR:
1. `npm run type-check` must pass (zero errors)
2. `npm run lint` must pass (zero warnings)
3. `npm run build` must succeed
4. Manual test: voice assistant responds on Chrome
5. Manual test: wizard flow completes all 6 steps
6. Manual test: drawings generate and download as PDF
7. If auth changes: test login/logout/protected routes
8. If database changes: test RLS policies with multiple users

---

## Key Contacts

- **Milton Overton** — Owner, primary inventor
- **Lisa Overton** — Co-inventor
- **Patent counsel** — To be retained (see attorney search at oedci.uspto.gov)
- **Repository:** https://github.com/GF-Accelerate/uspto-filing-assistant
- **Live app:** https://uspto-filing-assistant.vercel.app
