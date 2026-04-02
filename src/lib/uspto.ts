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
  { id:'c4',  label:'Assignee is Visionary AI Systems Inc (Delaware Corporation)',        section:'Application' },
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

APPLICANT / ASSIGNEE: Visionary AI Systems Inc, Kennesaw, GA 30144 (Delaware Corporation)

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

// ── PA-2 Specification — Athletic Department Management Platform ──────────
export const PA2_SPEC_SUMMARY = `TITLE: System and Method for AI-Powered Athletic Department Management with Voice-First Interface

APPLICANT / ASSIGNEE: Visionary AI Systems Inc, Kennesaw, GA 30144 (Delaware Corporation)

PRIMARY INVENTOR: Milton Overton, Kennesaw, GA 30144, United States Citizen
CO-INVENTOR: Lisa Overton, Kennesaw, GA 30144, United States Citizen

ENTITY STATUS: Small Entity
FILING DEADLINE: April 27, 2026

---

TECHNICAL FIELD

[0001] The present invention relates to artificial intelligence-powered athletic department management systems, and more specifically to a multi-tenant cloud-based SaaS platform integrating constituent relationship management, NCAA compliance monitoring, revenue analytics with House v. NCAA revenue sharing modeling, recruiting intelligence, donor cultivation, and voice-first database interaction for college and professional athletic departments.

---

BACKGROUND

[0002] College athletic departments manage complex operational environments requiring simultaneous tracking of donor relationships (50,000–300,000 constituents), NCAA compliance obligations across NIL disclosures, scholarship limits, recruiting contact calendars, and revenue distributions.

[0003] The revenue sharing era introduced by House v. NCAA (2024) created unprecedented budget modeling complexity. No existing enterprise platform addresses these combined requirements with AI-assisted voice interaction, automated compliance monitoring, and ML-based donor gift readiness scoring.

[0004] Existing enterprise software (Salesforce, Raiser's Edge, Total Team) requires extensive customization, lacks athletic-domain intelligence, and provides no voice interface or predictive scoring for the revenue sharing era.

---

SUMMARY OF THE INVENTION

[0005] The present invention provides a cloud-based athletic department management platform comprising:
- Multi-tenant SaaS architecture with row-level data isolation
- Constituent relationship management (170,000+ record capacity, RFE scoring)
- NCAA compliance automation engine (NIL, scholarship limits, contact calendars)
- Revenue intelligence with House v. NCAA forecasting and scenario modeling
- Recruiting intelligence module with prospect pipeline and compliance-aware logging
- Donor cultivation AI with predictive major gift readiness scoring
- Voice-first query interface integrating with co-pending Application PA-1

---

DETAILED DESCRIPTION

[0006] System Architecture (FIG. 1): Frontend Layer 110 → API Gateway 120 → Database Layer 130 → AI Processing 140 → Communication Layer 150 → Analytics 160.

[0007] Constituent CRM Module 200: Manages personal identification, giving history, engagement metrics, relationship mapping, predictive scores. RFE Scoring Engine 201 updates continuously. Supports 170,000+ records with sub-second query response.

[0008] NCAA Compliance Engine 300: Monitors NIL activity and disclosure; transfer portal eligibility; scholarship equivalency calculations; recruiting contact calendar restrictions; House v. NCAA revenue sharing caps. Generates automated alerts 301 when thresholds approach and maintains audit trail 302.

[0009] Revenue Intelligence Module 400: Real-time revenue tracking (ticket sales, donations, media rights, licensing, sponsorships); ML forecasting; House v. NCAA revenue share modeling with configurable athlete allocation; budget variance analysis with drill-down.

[0010] Recruiting Module 500: Prospect database with academic/athletic profiles; NCAA contact limit compliance logging; offer management and scholarship modeling; transfer portal monitoring.

---

CLAIMS

Claim 1 (System — Independent): A cloud-based athletic department management system comprising: a multi-tenant database architecture storing and isolating constituent records, compliance data, revenue records, and recruiting pipeline data for multiple athletic organizations simultaneously; a constituent relationship management module managing at least 50,000 constituent records with real-time RFE scoring; a NCAA compliance automation engine monitoring NIL activity, recruiting contact limits, scholarship equivalency calculations, and revenue sharing distributions with real-time threshold alerts; a revenue intelligence module providing real-time revenue tracking, predictive forecasting, and House v. NCAA revenue share modeling with configurable athlete allocation scenarios; a recruiting intelligence module tracking prospect pipelines with compliance-aware communication logging; and a voice-first query interface accepting natural language voice commands for all system functions.

Claim 2: The system of claim 1, wherein the multi-tenant database enforces row-level security such that each athletic organization's data is accessible only to authenticated users of that organization.

Claim 3: The system of claim 1, wherein the NCAA compliance engine generates real-time alerts when any monitored metric approaches applicable NCAA bylaw thresholds.

Claim 4: The system of claim 1, wherein the revenue intelligence module generates predictive forecasts using ML models trained on historical giving patterns, season ticket renewal data, and economic indicators.

Claim 5: The system of claim 1, wherein the RFE scoring model computes constituent scores based on configurable weights applied to recency, frequency, and engagement metrics.

Claim 6: The system of claim 1, further comprising a donor cultivation AI module configured to identify constituents with high major gift readiness and generate personalized cultivation recommendations.

Claim 7 (Method — Independent): A computer-implemented method for athletic department management comprising: storing and continuously scoring constituent interaction data including event attendance, email engagement, donation transactions, and voice command queries; monitoring all NCAA-regulated activities and generating compliance alerts when limits are approached; generating revenue analytics incorporating ticket sales, donations, media rights, and House v. NCAA revenue share distributions; maintaining recruiting pipelines with compliance-aware contact logging; and providing natural language voice query access to all stored data and analytics.

Claim 8: The method of claim 7, further comprising generating personalized AI-drafted donor communications calibrated to each constituent's giving history, engagement level, and predicted gift capacity.

Claim 9 (CRM — Independent): A non-transitory computer-readable medium storing processor-executable instructions implementing the method of claim 7, deployed as a multi-tenant cloud service supporting at least 10 simultaneous athletic organizations with data isolation, row-level security, and sub-second query response for databases of at least 50,000 constituent records.

---

ABSTRACT

A cloud-based athletic department management platform provides multi-tenant SaaS infrastructure for college and professional athletic organizations integrating constituent relationship management, NCAA compliance automation with NIL monitoring, revenue intelligence with House v. NCAA modeling, recruiting pipeline management, and donor cultivation with AI-assisted gift readiness scoring. The platform supports 170,000+ constituent records with real-time RFE scoring and voice-first interaction. Deployed on serverless cloud architecture with row-level security across enterprise user roles.

INVENTORS: Milton Overton & Lisa Overton
ASSIGNEE: Visionary AI Systems Inc, Kennesaw, GA 30144
FILING DEADLINE: April 27, 2026 — MANDATORY`

// ── PA-3 Specification — Multi-Modal Campaign Orchestration via Voice ────
export const PA3_SPEC_SUMMARY = `TITLE: System and Method for Multi-Modal AI Campaign Orchestration via Voice Command

APPLICANT / ASSIGNEE: Visionary AI Systems Inc, Kennesaw, GA 30144 (Delaware Corporation)

PRIMARY INVENTOR: Milton Overton, Kennesaw, GA 30144, United States Citizen
CO-INVENTOR: Lisa Overton, Kennesaw, GA 30144, United States Citizen

ENTITY STATUS: Small Entity
FILING DEADLINE: April 27, 2026

---

TECHNICAL FIELD

[0001] The present invention relates to AI-powered marketing campaign orchestration systems that accept voice commands to plan, configure, execute, and monitor multi-modal outbound campaigns combining email, SMS, personalized AI-generated video, and social media channels across constituent databases of 100,000+ records, with mandatory human-in-the-loop approval gates at all outbound action stages.

---

BACKGROUND

[0002] Enterprise marketing campaign tools require significant manual configuration, lack voice interaction, and do not integrate AI-generated personalized video. No existing platform combines voice-commanded campaign setup, multi-provider failover delivery, AI video personalization, and mandatory human approval gates in a single unified system.

[0003] Athletic department development offices need to execute donor cultivation campaigns rapidly in response to fundraising triggers (game wins, recruiting announcements, revenue sharing events) without the delays of traditional campaign management tool configuration.

---

SUMMARY OF THE INVENTION

[0004] The present invention provides a multi-modal campaign orchestration system activated by voice commands comprising:
- Voice Command Interface processing natural language campaign instructions
- Campaign Configuration AI generating audience segments, messaging, and schedules
- Multi-Provider Communication Router with failover (SendGrid → Resend → AgentMail)
- AI Video Personalization Pipeline generating individualized video content per recipient
- Human-in-the-Loop Approval Gate intercepting all outbound actions before execution
- Campaign Analytics Engine tracking delivery, engagement, and revenue attribution
- Webhook Monitoring System with real-time open/click/bounce tracking

---

DETAILED DESCRIPTION

[0005] Voice Command Interface 110: Receives spoken campaign commands such as "Create a campaign for season ticket renewal for all donors who gave over $500 last year but haven't renewed." Processes through NLP engine 115 to extract: target audience criteria, campaign type, channel preferences, timing, and approval requirements.

[0006] Campaign Configuration AI 120: Generates complete campaign specifications including audience segmentation query 121, message content 122 calibrated to constituent giving history and engagement score, channel selection 123, send schedule 124, and tracking configuration 125.

[0007] Human-in-the-Loop Gate 130 (CRITICAL): All campaign specifications must receive explicit human approval 131 before any outbound action is initiated. Gate presents: estimated recipient count, message preview, projected cost, expected engagement metrics, and revenue attribution forecast. Human staff explicitly approve, modify, or reject. No bypass mechanism exists.

[0008] Multi-Provider Communication Router 140: Primary channel SendGrid 141; failover Resend 142; failover AgentMail 143. Each transition logged in Cryptographic Audit Trail 144. CAN-SPAM and GDPR compliance modules 145 applied at each stage.

[0009] AI Video Personalization Pipeline 150: Generates individualized video content 151 for each recipient incorporating: constituent name, giving history, personalized ask amount, and program-specific content. VEO AI video generation 152 produces 30-60 second personalized videos. Video delivery 153 via embedded links in email campaigns with view tracking 154.

[0010] Campaign Analytics Engine 160: Real-time tracking of delivery rates 161, open rates 162, click rates 163, video view completion 164, response rates 165, and revenue attribution 166 (donations made within 30/60/90 days of campaign interaction).

---

CLAIMS

Claim 1 (System — Independent): A multi-modal campaign orchestration system comprising: a voice command interface configured to receive natural language campaign instructions and extract audience criteria, channel preferences, message parameters, and scheduling requirements; a campaign configuration AI module configured to generate complete campaign specifications including audience segmentation queries, personalized message content calibrated to recipient engagement scores, channel routing, and projected performance metrics; a human-in-the-loop approval gate configured to present complete campaign specifications to human staff and require explicit authorization before any outbound communication is initiated, with no mechanism to bypass this requirement; a multi-provider communication router configured to deliver campaigns through at least three independent communication providers with automatic failover and cryptographic audit logging; an AI video personalization pipeline configured to generate individualized video content for each recipient incorporating constituent-specific data; and a campaign analytics engine providing real-time tracking of delivery, engagement, and revenue attribution.

Claim 2: The system of claim 1, wherein the voice command interface processes commands in natural language without requiring structured query syntax, extracting audience criteria including demographic filters, giving history thresholds, engagement scores, and geographic parameters.

Claim 3: The system of claim 1, wherein the human-in-the-loop gate presents estimated recipient count, per-message cost, projected revenue impact, and compliance verification before requiring human authorization.

Claim 4: The system of claim 1, wherein the multi-provider router maintains a cryptographic audit trail recording each provider transition, delivery timestamp, recipient response, and authorizing staff member identity.

Claim 5: The system of claim 1, wherein the AI video pipeline generates individualized video segments of 15-120 seconds incorporating the recipient's name, giving history summary, personalized gift request amount, and program-specific content selected based on recipient engagement profile.

Claim 6: The system of claim 1, wherein the analytics engine performs revenue attribution by correlating campaign interaction events with donation transactions received within a configurable attribution window of 7-90 days.

Claim 7 (Method — Independent): A computer-implemented method for multi-modal campaign orchestration comprising: receiving a natural language voice command specifying campaign objectives and target criteria; generating a complete campaign specification including audience segmentation, personalized messaging, channel routing, and projected metrics; presenting the specification to human staff for review and requiring explicit approval before execution; routing approved campaigns through a primary communication provider with automatic failover to secondary providers upon failure; generating individualized AI video content for each recipient; and tracking delivery, engagement, and revenue attribution in real time.

Claim 8: The method of claim 7, wherein generating personalized messaging comprises: retrieving each recipient's giving history, engagement score, and predicted gift capacity; applying a language model to draft personalized message content; and calibrating the gift request amount to the recipient's predicted gift capacity.

Claim 9 (CRM — Independent): A non-transitory computer-readable medium storing processor-executable instructions implementing the method of claim 7, wherein the system executes campaigns across constituent databases of at least 100,000 records with individual personalization for each recipient, multi-provider failover communication, and mandatory human authorization at all outbound action stages.

---

ABSTRACT

A multi-modal campaign orchestration system accepts voice commands to configure, approve, and execute personalized outbound campaigns across email, SMS, and AI-generated video channels against constituent databases of 100,000+ records. A campaign configuration AI generates complete campaign specifications from natural language instructions. A mandatory human-in-the-loop approval gate intercepts all campaigns before execution with no bypass mechanism. Multi-provider communication failover ensures delivery with cryptographic audit logging. An AI video personalization pipeline generates individualized 15-120 second video content per recipient. Real-time analytics tracks delivery, engagement, and revenue attribution.

INVENTORS: Milton Overton & Lisa Overton
ASSIGNEE: Visionary AI Systems Inc, Kennesaw, GA 30144
FILING DEADLINE: April 27, 2026 — MANDATORY`

// Map patent ID to spec text
export const PATENT_SPECS: Record<string, string> = {
  'PA-1': PA1_SPEC_SUMMARY,
  'PA-2': PA2_SPEC_SUMMARY,
  'PA-3': PA3_SPEC_SUMMARY,
}
