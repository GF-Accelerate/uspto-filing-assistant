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

---

## Critical Domain Rules — Read Before Touching Any Code

### USPTO Legal Constraints
- **NEVER** automate the final Submit button in Patent Center — ID.me + MFA require human
- **NEVER** store USPTO credentials, session tokens, or cookies
- **ALWAYS** display the 12-month nonprovisional deadline wherever an app number appears
- **ALWAYS** enforce the HITL (human-in-the-loop) gate before any filing action
- Patent dates use ISO 8601 internally; display as US locale strings in the UI
- Small Entity provisional fee is ~$320 (verify at USPTO — fees update annually Jan 1)
- `"Batman MO Development Team"` is NOT a valid inventor — flag and reject this string
- `KSU` / `Kennesaw State University` has NO ownership interest — flag if it appears as assignee

### Inventor Validation
- All inventors must be human persons with full legal names
- Each inventor requires: `name`, `address` (City State ZIP), `citizenship`
- Min 1 inventor, max 10 per provisional application
- AI systems, teams, and organizations cannot be named as inventors

---

## Architecture

```
src/
├── components/
│   ├── ui/             # Primitives: Button, Card, Badge, CopyField, Alert
│   ├── wizard/         # Filing wizard step components (Step1–Step6)
│   ├── portfolio/      # PatentCard, PortfolioGrid, StatusBadge
│   └── shared/         # DeadlineBadge, HitlGate, PatentPending
├── hooks/
│   ├── useClaudeAPI.ts # All Claude API calls — never call fetch directly
│   ├── usePortfolio.ts # Portfolio CRUD + localStorage persistence
│   └── useChecklist.ts # Checklist state + validation
├── lib/
│   ├── claude.ts       # Claude client, system prompts as named constants
│   ├── uspto.ts        # USPTO URLs, fees, checklist items, portfolio init
│   ├── validation.ts   # Patent data validators (inventors, title, entity)
│   └── storage.ts      # localStorage helpers with type safety
├── types/
│   ├── patent.ts       # All domain types — import from here, never redefine
│   └── api.ts          # Claude API request/response types
└── pages/
    ├── Dashboard.tsx
    ├── Wizard.tsx
    ├── Deadlines.tsx
    └── Guide.tsx
```

---

## State Management

- `useState` + `useReducer` for component-level state
- Custom hooks for shared domain state (see `src/hooks/`)
- Portfolio state persisted to `localStorage` via `usePortfolio`
- **No Redux, Zustand, or Jotai** — hooks are sufficient for this scope

---

## Claude API Rules

```typescript
// CORRECT — always use the claude client
import { claudeClient } from '@/lib/claude';
const data = await claudeClient.extract(specText);

// WRONG — never call fetch directly in components
const r = await fetch('https://api.anthropic.com/v1/messages', ...);
```

- Model: `claude-sonnet-4-20250514` — do not change without full regression test
- All system prompts are named constants in `src/lib/claude.ts`
- Handle errors: show `Alert` component — never raw error objects to users
- API key lives in `VITE_ANTHROPIC_API_KEY` env var — never hardcoded

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
```

Only `.env.example` is committed. Never commit `.env`.

---

## What NOT To Do

- Do not add auth — this is a personal tool for the Overtons
- Do not add a database — localStorage is intentional and sufficient
- Do not remove the HITL gate or the 12-month deadline display
- Do not upgrade React/Vite major versions without testing Claude API integration
- Do not hardcode inventor names, application numbers, or patent titles
- Do not rename the `CHECKLIST_ITEMS` constant — the order maps to legal requirements

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
4. Assignee is Visionary AI Systems Inc (Georgia Corporation)
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
