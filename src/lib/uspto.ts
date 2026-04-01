/// <reference types="vite/client" />
import type { Patent } from '@/types/patent'

// USPTO URLs — never hardcode these in components
export const USPTO_URLS = {
  patentCenter:    'https://patentcenter.uspto.gov',
  coverSheet:      'https://www.uspto.gov/sites/default/files/documents/sb0016.pdf',
  feeSchedule:     'https://www.uspto.gov/learning-and-resources/fees-and-payment/uspto-fee-schedule',
  idMe:            'https://help.id.me/hc/en-us/articles/4412245504407',
  assignmentCenter:'https://assignmentcenter.uspto.gov',
  attorneySearch:  'https://oedci.uspto.gov/practitioner-search',
  teasTrademark:   'https://trademarkcenter.uspto.gov',
  priorArtSearch:  'https://ppubs.uspto.gov',
  newAccount:      'https://www.uspto.gov/about-us/usptogov-account',
} as const

// 2026 USPTO Fees (verify annually at USPTO fee schedule)
export const USPTO_FEES = {
  provisionalSmall:     '$320',
  provisionalLarge:     '$1,600',
  provisionalMicro:     '$160',
  nonprovisionalSmall:  '$910 + $350 + $400',
  teasPlusPerClass:     '$250',
} as const

// ── IMPORTANT: Status reflects ACTUAL filing status ──────────────
// PA-1 documents are PREPARED but NOT YET SUBMITTED to USPTO.
// You must go to patentcenter.uspto.gov, log in with ID.me + MFA,
// and submit the documents to receive an official Application Number.
// Only update status to 'filed' after receiving a USPTO Filing Receipt.
// ─────────────────────────────────────────────────────────────────
export const PORTFOLIO_INIT: Patent[] = [
  {
    id: 'PA-1',
    title: 'Voice-Controlled Database Query + Autonomous Agent Execution',
    status: 'ready',          // ← Documents prepared; awaiting USPTO submission
    filedDate: null,
    appNumber: '',
    deadline: null,
    priority: 1,
  },
  {
    id: 'PA-2',
    title: 'Athletic Department Management Platform (Corrected)',
    status: 'ready',
    filedDate: null,
    appNumber: '',
    deadline: null,
    priority: 1,
  },
  {
    id: 'PA-3',
    title: 'Multi-Modal Campaign Orchestration via Voice',
    status: 'ready',
    filedDate: null,
    appNumber: '',
    deadline: null,
    priority: 2,
  },
  {
    id: 'PA-4',
    title: 'Predictive Sports Revenue Intelligence Engine',
    status: 'draft',
    filedDate: null,
    appNumber: '',
    deadline: null,
    priority: 2,
  },
  {
    id: 'PA-5',
    title: 'Voice-First Agentic Database Infrastructure',
    status: 'planned',
    filedDate: null,
    appNumber: '',
    deadline: null,
    priority: 3,
  },
]

// 14-item HITL checklist — DO NOT MODIFY without legal review
export const CHECKLIST_ITEMS = [
  { id:'c1',  label:'All inventor legal names listed (human persons only)',              section:'Inventors' },
  { id:'c2',  label:'All inventor mailing addresses and citizenship included',           section:'Inventors' },
  { id:'c3',  label:'Title is technically accurate and descriptive',                     section:'Application' },
  { id:'c4',  label:'Assignee is Visionary AI Systems Inc (Georgia Corporation)',        section:'Application' },
  { id:'c5',  label:'Small Entity status claimed (50% fee reduction)',                   section:'Application' },
  { id:'c6',  label:'Specification complies with 35 U.S.C. §112(a) enablement',         section:'Documents' },
  { id:'c7',  label:'Drawings or FIG. diagrams included',                               section:'Documents' },
  { id:'c8',  label:'Claims included (strengthens priority benefit)',                    section:'Documents' },
  { id:'c9',  label:'Abstract included (150 words max)',                                 section:'Documents' },
  { id:'c10', label:'NO information disclosure statement (not permitted in provisionals)',section:'Documents' },
  { id:'c11', label:'Documents in DOCX or PDF format',                                  section:'Documents' },
  { id:'c12', label:'ID.me identity verification complete for USPTO.gov account',        section:'Authentication' },
  { id:'c13', label:'MFA configured (Okta Verify — email no longer accepted after Nov 2025)', section:'Authentication' },
  { id:'c14', label:'Payment method ready (credit card or EFT)',                         section:'Filing' },
] as const

export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
}

export function addOneYear(isoDate: string): string {
  const d = new Date(isoDate)
  d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().split('T')[0]
}

export function isInvalidInventor(name: string): boolean {
  const invalid = ['batman mo', 'development team', 'ksu', 'kennesaw state']
  return invalid.some(s => name.toLowerCase().includes(s))
}

// Patent PA-1 specification text — use this to pre-fill the wizard
export const PA1_SPEC_SUMMARY = `TITLE: System and Method for Voice-Controlled Database Query Processing with Autonomous Agent Execution

APPLICANT / ASSIGNEE: Visionary AI Systems Inc, Kennesaw, GA 30144 (Georgia Corporation)

PRIMARY INVENTOR: Milton Overton, Kennesaw, GA 30144, United States Citizen
CO-INVENTOR: Lisa Overton, Kennesaw, GA 30144, United States Citizen

ENTITY STATUS: Small Entity (50% fee reduction)

FILING DATE: March 28, 2026

---

TECHNICAL FIELD

[0001] The present invention relates to computer-implemented artificial intelligence systems for enterprise database interaction through voice commands. More specifically, to a voice-controlled system that converts spoken natural language into optimized SQL queries, executes those queries against large enterprise databases containing 170,000+ constituent records, and delegates intelligent follow-up actions to a framework of autonomous specialized AI agents — all with sub-200 millisecond voice-to-response latency and enterprise-grade row-level security.

---

BACKGROUND

[0002] Enterprise database management systems require complex GUI navigation or SQL expertise, blocking non-technical executives and mobile professionals from real-time data access. Current voice-AI products (Salesforce Einstein Voice, Microsoft Cortana for Business, Amazon Alexa for Business) fail to provide: complex multi-table SQL query generation from natural language; intelligent query optimization; autonomous agent execution triggered by query results; context-aware multi-turn conversation state; row-level security enforced at the voice interface layer; or multi-provider communication failover with human-in-the-loop gates.

---

SUMMARY OF THE INVENTION

[0003] The present invention provides a computer-implemented voice-controlled database interaction system comprising:

- Advanced NLP Engine: OpenAI GPT-4o-mini achieving 94%+ intent recognition across 200+ command patterns
- SQL Query Generation: Semantic table mapping, join-path optimization, index utilization, sub-200ms latency
- Nine-Agent Autonomous Framework: Donor Cultivation, Proposal Generation, Campaign Manager, Compliance Monitor, Revenue Analytics, Fan Engagement, Recruiting Intelligence, Facility Operations, Executive Briefing
- Multi-Provider Failover: SendGrid → Resend → AgentMail with webhook tracking + mandatory human approval gates
- Configurable RFE Lead Scoring: Recency/Frequency/Engagement with SEC/FEC/OpenCorporates cross-reference
- VEO Video Pipeline: Voice-initiated AI-generated personalized video campaigns
- Multi-Modal Response: Voice synthesis, WebSocket dashboard streaming, interactive confirmation flows

---

DETAILED DESCRIPTION

[0004] System Architecture (FIG. 1):
Voice Input Layer 110 → NLP Engine 120 → Query Generator 130 → Database Layer 140
                                                                        ↓
Response System 160 ← Agent Framework 150 ← Results Analysis

Component 110 — Voice Input: Web Speech API with noise cancellation and athletic-domain vocabulary adaptation.

Component 120 — NLP Engine: GPT-4o-mini intent classification (94% accuracy), NER parameter extraction, multi-turn context preservation module 125.

Component 130 — SQL Query Generation: Semantic schema mapping, cost-based join optimization, disambiguation engine (confidence < 0.75 threshold), batch coordinator for 1,000-row partial executions.

Component 140 — Database Layer: Supabase PostgreSQL, 90 migrations, 71 Edge Functions.
  - constituent_master: 170,529 records
  - pac_transactions: 334,518 records
  - opportunities: 8,113 records
  - lead_scores: 167,740 scored records

Component 150 — Agent Framework: Nine agents with multi-agent chain orchestrator 153 and immutable human-in-the-loop approval gate 154 (cannot be bypassed by voice).

Multi-Provider Failover: SendGrid → Resend → AgentMail; webhook-based monitoring; CAN-SPAM/GDPR automation; mandatory dry_run verification.

RFE Scoring: calculate_lead_scores() with configurable weights in lead_score_config table; external cross-reference: SEC EDGAR + FEC + OpenCorporates + LinkedIn (2,500 alumni, 61 columns via Evaboot).

Security: Row-Level Security at PostgreSQL layer, 10 enterprise roles, cryptographic audit trail, FERPA compliance, JWT/SSO authentication.

---

CLAIMS

Claim 1 (System — Independent): A voice-controlled database interaction system comprising: a speech recognition module configured to receive natural language voice commands with noise cancellation and athletic-domain vocabulary adaptation; a natural language processing engine using a large language model to classify intent and extract query parameters with at least 90% accuracy across at least 200 command patterns; a SQL query generation engine configured to translate extracted parameters into optimized database queries using semantic schema mapping, join-path optimization, and index utilization, executing against databases of at least 100,000 records with sub-300 millisecond response latency; an autonomous agent framework comprising at least nine specialized AI agents including a donor cultivation agent, campaign manager agent, compliance monitor agent, and revenue analytics agent; a human-in-the-loop approval gate configured to intercept all outbound communications and financial operations prior to execution and require explicit human staff authorization; and a multi-modal response system configured to deliver voice synthesis, visual dashboard updates, and WebSocket-streamed real-time data.

Claim 2 (System — Dependent): The system of Claim 1, wherein the natural language processing engine maintains multi-turn conversation context across sequential queries within a session window of at least 30 minutes.

Claim 3 (System — Dependent): The system of Claim 1, wherein the SQL query generation engine implements a confidence threshold module configured to generate disambiguation queries to the user when query intent confidence falls below 0.75.

Claim 4 (System — Dependent): The system of Claim 1, wherein the autonomous agent framework includes a multi-provider communication failover system configured to sequentially attempt delivery through at least three independent email service providers.

Claim 5 (System — Dependent): The system of Claim 4, wherein each communication provider transition is logged with a cryptographic audit trail and the human-in-the-loop gate requires re-authorization upon provider failover.

Claim 6 (System — Dependent): The system of Claim 1, wherein the system further comprises a machine learning lead scoring engine configured to compute recency, frequency, and engagement scores for each constituent record and update scores continuously as new interaction data is received.

Claim 7 (System — Dependent): The system of Claim 6, wherein the lead scoring engine cross-references constituent records with at least three external data sources including SEC EDGAR, Federal Election Commission records, and corporate registry data.

Claim 8 (System — Dependent): The system of Claim 1, wherein the system further comprises a video generation pipeline configured to produce personalized AI-generated video content for individual constituent outreach, triggered by voice command and gated by the human-in-the-loop approval gate.

Claim 9 (Method — Independent): A computer-implemented method for voice-controlled database interaction comprising: receiving a natural language voice command at a speech recognition module; parsing the command through a large language model to extract primary action intent, target entities, filter parameters, and required action types; generating an optimized database query through semantic entity-to-schema mapping and join-path optimization; executing the query against a relational database comprising constituent records, transaction history, opportunity tracking, and ML-derived scoring data; analyzing query results using predictive models for renewal risk, gift readiness, upgrade potential, and churn probability; routing actionable results to at least one specialized AI agent for autonomous business action execution; intercepting all agent-initiated outbound communications at a human-in-the-loop approval gate requiring explicit human staff authorization; and delivering a synchronized multi-modal response comprising voice synthesis and real-time dashboard update.

Claim 10 (Method — Dependent): The method of Claim 9, further comprising maintaining a multi-turn conversation context store that preserves prior query parameters, results, and action history for the duration of a user session.

Claim 11 (Method — Dependent): The method of Claim 9, wherein generating the optimized database query further comprises: estimating query cost using index statistics; selecting an optimal join order; and partitioning large result sets into paginated batches of at most 1,000 records per execution cycle.

Claim 12 (Method — Dependent): The method of Claim 9, further comprising applying row-level security policies at the database layer to restrict query results to records accessible by the authenticated user's assigned security role.

Claim 13 (Method — Dependent): The method of Claim 9, further comprising triggering a video personalization pipeline upon agent recommendation, wherein the pipeline generates individualized video content incorporating constituent-specific data fields extracted from the database query results.

Claim 14 (CRM — Independent): A non-transitory computer-readable medium storing processor-executable instructions that, when executed, implement the method of Claim 9, wherein the system is deployed on a serverless edge-function architecture comprising at least 60 independently deployable functions, accessible via an encrypted internet domain, enforcing row-level security across at least 10 enterprise user roles, and supporting at least 10 concurrent authenticated user sessions.

---

ABSTRACT

A voice-controlled database interaction system converts spoken natural language commands into optimized SQL queries executed against enterprise databases containing 170,000+ constituent records. Commands trigger multi-table queries, ML-based result analysis, and delegation to nine specialized AI agents covering donor cultivation, campaign management, NCAA compliance, revenue analytics, and executive briefing. A multi-provider failover communication system dispatches personalized campaigns including AI-generated personalized videos with mandatory human staff approval. The system deploys on a 71-function serverless architecture with sub-200ms voice response latency, row-level security across ten enterprise roles, and multi-tenant SaaS architecture.

INVENTORS: Milton Overton & Lisa Overton
ASSIGNEE: Visionary AI Systems Inc, Kennesaw, GA 30144`
