# ARCHITECTURE — USPTO Patent Filing Assistant
## Visionary AI Systems, Inc. | April 4, 2026

---

## 1. Current Architecture (Phase 1 — Personal Tool)

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │  React 18     │  │  Tailwind    │  │  React Router 6    │    │
│  │  TypeScript 5 │  │  CSS 3       │  │  9 routes          │    │
│  └──────────────┘  └──────────────┘  └────────────────────┘    │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    State Management                       │   │
│  │  useState/useReducer → Custom Hooks → localStorage        │   │
│  │  usePortfolio │ useWizard │ useAuth │ useVoiceAssistant   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────┐  ┌────────────────┐  ┌────────────────────┐   │
│  │ Voice Input  │  │ Voice Output   │  │ Document Gen       │   │
│  │ Web Speech   │  │ Web Speech     │  │ jsPDF + Mermaid    │   │
│  │ API (STT)    │  │ API (TTS)      │  │ html2canvas        │   │
│  └──────┬───────┘  └───────▲────────┘  └────────────────────┘   │
│         │                  │                                     │
│  ┌──────▼──────────────────┴──────────────────────────────────┐ │
│  │              Voice Assistant Pipeline                       │ │
│  │  Audio → Intent Router → Agent Selection → Response → TTS   │ │
│  │         (simple tier)   (6 agents)      (domain tier)       │ │
│  └────────────────────────┬───────────────────────────────────┘ │
│                           │                                      │
│  ┌────────────────────────▼───────────────────────────────────┐ │
│  │              API Calls (fetch)                              │ │
│  │  /api/claude (AI extraction, cover sheet, validation)       │ │
│  │  /api/openrouter (voice intent routing, agent responses)    │ │
│  └────────────────────────┬───────────────────────────────────┘ │
└───────────────────────────┼─────────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼─────────────────────────────────────┐
│                    VERCEL (Serverless)                           │
│                                                                 │
│  ┌────────────────────┐  ┌──────────────────────┐               │
│  │ api/claude.ts       │  │ api/openrouter.ts     │               │
│  │ Claude Sonnet 4     │  │ Adaptive routing:     │               │
│  │ Proxy (API key      │  │ simple → domain →     │               │
│  │ server-side)        │  │ complex → premium     │               │
│  └─────────┬──────────┘  └──────────┬───────────┘               │
│            │                        │                            │
└────────────┼────────────────────────┼────────────────────────────┘
             │                        │
    ┌────────▼────────┐    ┌──────────▼──────────┐
    │ Anthropic API    │    │ OpenRouter API       │
    │ claude-sonnet-4  │    │ Multi-model routing  │
    │ -20250514        │    │ llama/mistral/claude │
    └─────────────────┘    └─────────────────────┘
```

### Tech Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + TypeScript | 18.3 + 5.6 |
| Build | Vite | 5.4 |
| Styling | Tailwind CSS | 3.4 |
| Routing | React Router DOM | 6.26 |
| AI (Filing) | Anthropic Claude Sonnet 4 | claude-sonnet-4-20250514 |
| AI (Voice) | OpenRouter (multi-model) | Various |
| Diagrams | Mermaid.js | 11.14 |
| PDF | jsPDF + html2canvas | 4.2 + 1.4 |
| DOCX parsing | jszip | 3.10 |
| Icons | Lucide React | 0.454 |
| Hosting | Vercel | Serverless Functions |
| Database | None (localStorage) | — |
| Auth | None (optional Supabase scaffolded) | — |

### Data Flow: Filing Wizard

```
User pastes/uploads spec text
        │
        ▼
Step 1: Input validation (src/components/wizard/Step1Input.tsx)
  - Accepts .txt, .md, .docx, .doc
  - DOCX extracted via jszip
  - Max 5000 chars sent to Claude
        │
        ▼
Step 2: AI Extraction (src/lib/claude.ts → extractFilingData)
  - Claude parses spec → structured JSON
  - Returns: title, inventors, assignee, claims, abstract, warnings
  - Validates inventor names (no Batman MO, no KSU)
        │
        ▼
Step 3: Cover Sheet Generation (src/lib/claude.ts → generateCoverSheet)
  - Claude generates PTO/SB/16 fields
  - Fee estimate, deadline, patent pending notice
        │
        ▼
Step 4: HITL Checklist (14 items — immutable)
  - All 14 must be checked
  - AI compliance check runs after all checked
  - Returns: score, passed items, issues, critical blocks
        │
        ▼
Step 5: Filing Guide
  - Step-by-step Patent Center instructions
  - Manual process: user logs in with ID.me + MFA
        │
        ▼
Step 6: Receipt Recorder
  - User enters application number (63/XXX,XXX format)
  - Saves to portfolio, starts 12-month nonprovisional clock
```

### Voice Assistant Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│                    Voice Pipeline                              │
│                                                               │
│  Microphone → Web Speech API (STT) → transcript text          │
│       │                                                       │
│       ▼                                                       │
│  Intent Router (/api/openrouter, simple tier)                 │
│  - Classifies to: deadline|document|filing|portfolio|claims|  │
│                   general                                     │
│  - 10 max tokens, fastest model (llama-3.1-8b)               │
│       │                                                       │
│       ▼                                                       │
│  Agent Selection (AGENT_PROMPTS[role])                        │
│  - Each agent has PATENT_KNOWLEDGE base + role-specific prompt│
│  - Last 6 messages included as conversation context           │
│       │                                                       │
│       ▼                                                       │
│  Agent Call (/api/openrouter, auto-tier classification)       │
│  - 300 max tokens                                             │
│  - Model selected by query complexity                         │
│       │                                                       │
│       ▼                                                       │
│  TTS Output (Web Speech API)                                  │
│  - American female voice (priority selection list)            │
│  - Sentence chunking for Chrome 15s cutoff bug                │
│  - Sequential chunk playback with isSpeaking state            │
│       │                                                       │
│       ▼                                                       │
│  UI Update (chat panel, agent badge, waveform animation)      │
└──────────────────────────────────────────────────────────────┘
```

### 6 Voice Agents (Current)

| Agent | Trigger Keywords | Knowledge Domain |
|-------|-----------------|-----------------|
| `deadline` | dates, deadlines, days remaining, when | Filing dates, priority windows |
| `document` | files, download, document types | DOCX/PDF files, Patent Center labels |
| `filing` | steps, how to file, Patent Center | Click-by-click Patent Center guide |
| `portfolio` | PA-1 through PA-7, innovations | Patent claims, competitive landscape |
| `claims` | claim language, HITL, independent | Claim structure, HITL gate innovation |
| `general` | fees, entity status, USPTO rules | USPTO procedures, regulations |

### OpenRouter Model Tiers

| Tier | Model | Use Case | Cost |
|------|-------|----------|------|
| simple | llama-3.1-8b | Intent classification | Lowest |
| domain | mistral-7b | Domain Q&A | Low |
| complex | llama-3.3-70b | Multi-step reasoning | Medium |
| premium | claude-sonnet-4.5 | Patent claims, legal | Highest |

---

## 2. Proposed Architecture (Phase 2+ — Multi-Tenant SaaS)

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React 18 + TypeScript 5 + Tailwind CSS 3                │   │
│  │  React Router 6 + React Error Boundary                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────┐  ┌────────────────┐  ┌────────────────────┐   │
│  │ Auth Context  │  │ Feature Flag   │  │ Supabase           │   │
│  │ (Supabase     │  │ Context        │  │ Realtime           │   │
│  │  Auth)        │  │ (DB-driven)    │  │ (WebSocket)        │   │
│  └──────┬───────┘  └───────┬────────┘  └────────┬───────────┘   │
│         │                  │                     │               │
│  ┌──────▼──────────────────▼─────────────────────▼───────────┐   │
│  │              VADI-Aligned Voice Pipeline                    │   │
│  │                                                            │   │
│  │  ┌─────────┐  ┌──────┐  ┌──────┐  ┌──────┐               │   │
│  │  │  VQE    │  │ AEF  │  │ HAL  │  │ MPCB │               │   │
│  │  │ Voice→  │  │ Agent│  │ Auth │  │ Multi│               │   │
│  │  │ Query   │  │ Exec │  │ Gate │  │ Prov │               │   │
│  │  │ Engine  │  │ Frmwk│  │      │  │ Comm │               │   │
│  │  └────┬────┘  └──┬───┘  └──┬───┘  └──┬───┘               │   │
│  │       │          │         │          │                    │   │
│  └───────┼──────────┼─────────┼──────────┼────────────────────┘   │
│          │          │         │          │                        │
└──────────┼──────────┼─────────┼──────────┼────────────────────────┘
           │          │         │          │
           │ HTTPS    │         │          │
┌──────────▼──────────▼─────────▼──────────▼────────────────────────┐
│                    VERCEL (Serverless)                             │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐     │
│  │ api/claude.ts │  │ api/openrouter│  │ api/uspto-odp.ts    │     │
│  │ (AI proxy)    │  │ (voice)      │  │ (post-filing track) │     │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘     │
└─────────┼─────────────────┼──────────────────────┼────────────────┘
          │                 │                      │
┌─────────▼────────┐ ┌─────▼──────┐  ┌────────────▼──────────────┐
│ Anthropic API     │ │ OpenRouter │  │ USPTO ODP API             │
│ claude-sonnet-4   │ │ Multi-model│  │ api.uspto.gov             │
│ -20250514         │ │            │  │ (app status, prosecution) │
└──────────────────┘ └────────────┘  └───────────────────────────┘
          │
┌─────────▼─────────────────────────────────────────────────────────┐
│                    SUPABASE (Backend)                              │
│                                                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐   │
│  │ Auth            │  │ PostgreSQL      │  │ Storage             │   │
│  │ - Email/password│  │ - organizations │  │ - DOCX files        │   │
│  │ - Google OAuth  │  │ - profiles      │  │ - PDF drawings      │   │
│  │ - JWT sessions  │  │ - patents       │  │ - Filing receipts   │   │
│  │ - RBAC          │  │ - documents     │  │                     │   │
│  └────────────────┘  │ - wizard_sessions│  └────────────────────┘   │
│                      │ - inventor_prof  │                          │
│                      │ - assignee_prof  │  ┌────────────────────┐   │
│                      │ - filing_receipts│  │ Realtime            │   │
│                      │ - audit_log      │  │ - Portfolio changes │   │
│                      │ - feature_flags  │  │ - Filing status     │   │
│                      │ - voice_sessions │  │ - Deadline alerts   │   │
│                      │                  │  └────────────────────┘   │
│                      │ RLS Policies:    │                          │
│                      │ All tables       │  ┌────────────────────┐   │
│                      │ filtered by      │  │ Edge Functions      │   │
│                      │ org_id           │  │ (future Phase 3+)  │   │
│                      └────────────────┘  │ - AI calls           │   │
│                                          │ - ODP API proxy      │   │
│                                          └────────────────────┘   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 3. PA-5 VADI Architecture Mapping

The PA-5 specification defines four infrastructure primitives. Here is how the
current app maps to them, and what needs to change:

### 3.1 Voice-to-Query Engine (VQE) — Component 200

**PA-5 Spec:** Domain-agnostic infrastructure service with:
- Multi-provider STT (210)
- Domain-aware NLP pipeline (220)
- Configurable semantic mapping layer (230)
- Query generation engine (240)
- Disambiguation protocol (250)
- Batch coordination (260)

**Current Implementation:**
```
Web Speech API (STT) → Intent Router (NLP) → Agent Selection → Response
```

**Gaps:**
- Single STT provider (Web Speech API only) — no failover
- No semantic mapping layer — intent is classified by keyword matching in LLM prompt
- No query generation engine — voice doesn't generate database queries
- No disambiguation protocol — low confidence falls through to `general` agent
- No batch coordination

**Proposed Changes (VA-7):**
- Add `src/lib/vadi/vqe.ts` implementing VQE interface:
  ```typescript
  interface VQE {
    registerDomain(config: DomainConfig): void
    processVoiceInput(audio: AudioBuffer, domainId: string): QueryIntent
    executeQuery(intent: QueryIntent): QueryResult
    setConfidenceThreshold(threshold: number, domainId: string): void
  }
  ```
- Register "patent-filing" domain with semantic mappings:
  - "PA-1" → patent record PA-1
  - "deadline" → deadline field
  - "filed" → status = 'filed'
- Add cloud STT fallback (Deepgram/Whisper) via MPCB pattern

### 3.2 Agentic Execution Framework (AEF) — Component 300

**PA-5 Spec:** Standardized interfaces for:
- Agent Registry (310)
- Result Router (320)
- Chain Orchestrator (330)
- Agent Communication Bus (340)

**Current Implementation:**
```typescript
const AGENT_PROMPTS: Record<AgentRole, string> = {
  deadline: '...',
  document: '...',
  filing:   '...',
  portfolio:'...',
  claims:   '...',
  general:  '...',
}
```

**Gaps:**
- Agents are hardcoded string prompts, not registered specifications
- No routing rules — intent router is a flat LLM classifier
- No chain orchestrator — single agent per query, no multi-agent workflows
- No inter-agent communication

**Proposed Changes (VA-7):**
- Add `src/lib/vadi/aef.ts` implementing AEF interface:
  ```typescript
  interface AEF {
    registerAgent(spec: AgentSpecification): void
    defineRoutingRule(rule: RoutingRule): void
    createWorkflow(steps: WorkflowStep[]): Workflow
    triggerAgent(agentId: string, payload: QueryResult): AgentResult
  }

  interface AgentSpecification {
    id: string
    domain: string
    triggerPatterns: string[]
    authorizedActions: string[]
    systemPrompt: string
  }
  ```
- Migrate 6 agents from hardcoded prompts to registered specifications
- Add workflow support: "File PA-5" → [document agent → filing agent → receipt agent]

### 3.3 Human Authorization Layer (HAL) — Component 400

**PA-5 Spec:** Platform primitive that:
- Intercepts all agent-proposed actions (410)
- Generates human-readable previews (420)
- Collects explicit authorization decisions (430)
- Maintains immutable audit log (440)
- Blocks unauthorized actions (450)

**Current Implementation:**
```
14-item HITL checklist (manual checkboxes) + AI compliance validation
```

**Gaps:**
- Checklist is a manual UI step, not a programmatic interceptor
- No action preview generation for voice-initiated actions
- No cryptographically-signed audit log
- Voice assistant can speak filing instructions without any gate
- No enforcement at the platform layer — it's a UI component

**Proposed Changes (VA-7):**
- Add `src/lib/vadi/hal.ts` implementing HAL interface:
  ```typescript
  interface HAL {
    registerActionType(spec: ActionTypeSpec): void
    interceptAction(action: ProposedAction): AuthorizationRequest
    authorize(requestId: string, decision: 'approve' | 'reject'): void
    getAuditLog(filters: AuditFilters): AuditRecord[]
  }

  interface ProposedAction {
    type: string
    agentId: string
    description: string
    scope: { recipients?: number, cost?: number }
    payload: unknown
  }
  ```
- Intercept voice-initiated actions before execution:
  - "File PA-5" → HAL preview: "This will open the filing wizard for PA-5. Approve?"
  - "Generate specification" → HAL preview: "This will generate a DOCX. Approve?"
  - "Download all documents" → HAL preview: "This will download 7 files. Approve?"
- Log all authorization decisions to `audit_log` table

### 3.4 Multi-Provider Communication Bus (MPCB) — Component 500

**PA-5 Spec:** Platform service for:
- Provider Registry (510)
- Delivery Engine (520)
- Webhook Monitor (530)
- Compliance Engine (540)
- Cryptographic Delivery Log (550)

**Current Implementation:**
- TTS: Web Speech API only (single provider)
- STT: Web Speech API only (single provider)
- Email: None
- No delivery monitoring, no compliance engine

**Proposed Changes (VA-7):**
- Add `src/lib/vadi/mpcb.ts` implementing MPCB interface:
  ```typescript
  interface MPCB {
    registerProvider(provider: ProviderSpec): void
    send(message: Message): DeliveryResult
    getDeliveryLog(filters: LogFilters): DeliveryRecord[]
  }
  ```
- TTS provider registry: Web Speech API → Deepgram → ElevenLabs
- STT provider registry: Web Speech API → Whisper → Deepgram
- Future: Email delivery for deadline notifications via MPCB

---

## 4. File Structure (Proposed)

```
src/
├── components/
│   ├── admin/                    # NEW: Admin console components
│   │   ├── AdminDashboard.tsx
│   │   ├── UserManagement.tsx
│   │   ├── AuditLogViewer.tsx
│   │   └── FeatureFlagManager.tsx
│   ├── auth/
│   │   ├── AuthModal.tsx         # Existing
│   │   ├── UserMenu.tsx          # Existing
│   │   └── ProtectedRoute.tsx    # NEW: Auth guard HOC
│   ├── filing/                   # NEW: Filing package components
│   │   ├── FilingPackage.tsx
│   │   ├── DocumentCard.tsx
│   │   └── UploadChecklist.tsx
│   ├── portfolio/
│   │   └── PatentCard.tsx        # Existing
│   ├── shared/
│   │   ├── DeadlineBadge.tsx     # Existing
│   │   ├── SectionHead.tsx       # Existing
│   │   ├── Spinner.tsx           # Existing
│   │   └── ErrorBoundary.tsx     # NEW
│   ├── ui/                       # Existing (unchanged)
│   ├── voice/
│   │   └── VoiceAssistant.tsx    # Existing (UI unchanged)
│   └── wizard/                   # Existing (unchanged)
├── contexts/                     # NEW
│   ├── AuthContext.tsx
│   └── FeatureFlagContext.tsx
├── hooks/
│   ├── useAuth.ts                # Existing (activate)
│   ├── useClaudeAPI.ts           # Existing
│   ├── useFeatureFlags.ts        # NEW
│   ├── usePortfolio.ts           # Existing (add DB sync)
│   ├── useVoiceAssistant.ts      # Existing (refactor for VADI)
│   └── useWizard.ts              # Existing
├── lib/
│   ├── claude.ts                 # Existing
│   ├── docx-generator.ts         # NEW: DOCX generation
│   ├── storage.ts                # Existing
│   ├── supabase.ts               # Existing (activate)
│   ├── uspto.ts                  # Existing
│   ├── validation.ts             # Existing
│   └── vadi/                     # NEW: PA-5 aligned modules
│       ├── vqe.ts                # Voice-to-Query Engine
│       ├── aef.ts                # Agentic Execution Framework
│       ├── hal.ts                # Human Authorization Layer
│       └── mpcb.ts               # Multi-Provider Communication Bus
├── pages/
│   ├── admin/                    # NEW
│   │   ├── Dashboard.tsx
│   │   ├── Users.tsx
│   │   ├── Organizations.tsx
│   │   ├── Patents.tsx
│   │   ├── Audit.tsx
│   │   ├── Settings.tsx
│   │   └── FeatureFlags.tsx
│   ├── Dashboard.tsx             # Existing
│   ├── Deadlines.tsx             # Existing
│   ├── Downloads.tsx             # Existing
│   ├── Drawings.tsx              # Existing
│   ├── FilingPackage.tsx         # NEW
│   ├── Guide.tsx                 # Existing
│   ├── Legal.tsx                 # Existing
│   ├── PriorArt.tsx              # Existing
│   ├── Profile.tsx               # NEW
│   ├── Trademark.tsx             # Existing
│   └── Wizard.tsx                # Existing
├── types/
│   ├── patent.ts                 # Existing (extend)
│   ├── admin.ts                  # NEW
│   └── vadi.ts                   # NEW: VADI type definitions
├── App.tsx                       # Existing (add routes)
└── main.tsx                      # Existing
```

---

## 5. Security Architecture (Proposed)

### Authentication Flow
```
User → Supabase Auth (email/Google) → JWT → API requests
                                        │
                                        ▼
                              Supabase RLS checks org_id
                              from JWT claims against
                              every database query
```

### API Key Migration (Phase 2)
```
Current:  Browser → VITE_ANTHROPIC_API_KEY → Anthropic API
                    (exposed in client)

Proposed: Browser → Vercel Proxy (server-side key) → Anthropic API
          Already partially implemented in api/claude.ts
          Need to remove VITE_ prefix fallback
```

### Row-Level Security Pattern
```sql
-- Every table includes org_id
-- RLS policy pattern:
CREATE POLICY "org_isolation" ON patents
  USING (org_id = (
    SELECT org_id FROM profiles
    WHERE id = auth.uid()
  ));
```

---

## 6. Deployment Architecture

### Current
```
GitHub (GF-Accelerate/uspto-filing-assistant)
    │
    ▼ (push to main)
Vercel (auto-deploy)
    │
    ├── Static assets (dist/) → CDN
    ├── api/claude.ts → Serverless Function
    └── api/openrouter.ts → Serverless Function
```

### Proposed (Phase 2+)
```
GitHub (GF-Accelerate/uspto-filing-assistant)
    │
    ▼ (push to main)
Vercel (auto-deploy)
    │
    ├── Static assets (dist/) → CDN
    ├── api/claude.ts → Serverless Function
    ├── api/openrouter.ts → Serverless Function
    └── api/uspto-odp.ts → Serverless Function (NEW)

Supabase (separate project)
    │
    ├── Auth (email + Google OAuth)
    ├── PostgreSQL (all tables + RLS)
    ├── Storage (DOCX, PDF files)
    ├── Realtime (WebSocket subscriptions)
    └── Edge Functions (future — move AI calls server-side)
```

---

## 7. Environment Variables

### Current (.env)
```bash
VITE_ANTHROPIC_API_KEY=sk-ant-...        # Claude API key (client-exposed)
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development
```

### Proposed (.env)
```bash
# Auth & Database (required for Phase 2)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# AI APIs (server-side only — no VITE_ prefix)
ANTHROPIC_API_KEY=sk-ant-...             # Server-side only
OPENROUTER_API_KEY=sk-or-...             # Server-side only

# USPTO (Phase 5)
USPTO_ODP_API_KEY=...                    # Server-side only

# App config
VITE_APP_VERSION=2.0.0
VITE_ENVIRONMENT=production
```

---

*This architecture document is for review only. No implementation until Milton approves.*
*Generated: April 4, 2026 by Claude Code*
