// Patent-specific drawing definitions — Mermaid diagram code per patent
// Each patent has its own set of figures matching its specification

export interface DrawingDef {
  id: string
  figNum: string
  title: string
  desc: string
  mermaid: string
}

// ── PA-1: Voice-Controlled Database Query + Agent Execution ───────────────

export const PA1_FIGURES: DrawingDef[] = [
  {
    id: 'pa1-fig1', figNum: 'FIG. 1', title: 'System Architecture Overview',
    desc: 'Overall block diagram: Voice Input Layer (110) → NLP Engine (120) → SQL Query Generator (130) → Database Layer (140) → Agent Framework (150) → Multi-Modal Response (160)',
    mermaid: `graph TD
    A["110 — Voice Input Layer<br/>Web Speech API · Noise Cancellation<br/>Athletic-Domain Vocabulary"]
    B["120 — NLP Engine<br/>GPT-4o-mini · 94% Accuracy<br/>200+ Intent Patterns"]
    C["130 — SQL Query Generator<br/>Semantic Schema Mapping<br/>Join-Path Optimization · &lt;200ms"]
    D["140 — Database Layer<br/>PostgreSQL · 170,529 Records<br/>Row-Level Security · 10 Roles"]
    E["150 — Agent Framework<br/>9 Specialized AI Agents<br/>HITL Approval Gate"]
    F["160 — Multi-Modal Response<br/>Voice Synthesis · Dashboard<br/>WebSocket Streaming"]
    G["125 — Disambiguation<br/>confidence &lt; 0.75 threshold"]
    A --> B
    B --> C
    B -.->|"low confidence"| G
    G --> C
    C --> D
    D --> E
    E --> F
    style A fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style B fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style C fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style D fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style E fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    style F fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style G fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#991b1b`,
  },
  {
    id: 'pa1-fig2', figNum: 'FIG. 2', title: 'Voice Processing & SQL Generation Flow',
    desc: 'Flowchart from voice input through NLP intent classification, confidence check, disambiguation, SQL generation, database execution, and result return',
    mermaid: `flowchart TD
    S(["START — Voice Command Received"])
    A["210 — Audio Preprocessing<br/>Noise Cancellation · Domain Vocab"]
    B["220 — Intent Classification<br/>GPT-4o-mini LLM · NER Extraction"]
    C{"230 — Confidence Check"}
    D["235 — Disambiguation Query<br/>Prompt User for Clarification"]
    E["240 — Parameter Extraction<br/>Entity-to-Schema Mapping"]
    F["250 — Join-Path Optimizer<br/>Cost-Based Query Planner"]
    G["260 — SQL Generation<br/>Validation &amp; Index Selection"]
    H["270 — Database Execution<br/>RLS Applied · Audit Logged"]
    K{"280 — Result Size Check"}
    L["285 — Batch Pagination<br/>1,000 rows per cycle"]
    E2(["END — Results Returned"])
    S --> A --> B --> C
    C -->|"≥ 0.75"| E
    C -->|"&lt; 0.75"| D
    D --> B
    E --> F --> G --> H --> K
    K -->|"&gt; 1,000 rows"| L --> E2
    K -->|"≤ 1,000 rows"| E2
    style S fill:#1e40af,stroke:#1e40af,color:#ffffff
    style E2 fill:#15803d,stroke:#15803d,color:#ffffff
    style C fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    style K fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    style D fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#991b1b
    style A fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style B fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style E fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style F fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style G fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style H fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style L fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#1e293b`,
  },
  {
    id: 'pa1-fig3', figNum: 'FIG. 3', title: 'Nine-Agent Autonomous Framework',
    desc: 'All 9 AI agents (310-390) coordinated by Multi-Agent Chain Orchestrator (305) under mandatory Human-in-the-Loop Approval Gate (300)',
    mermaid: `graph TD
    HITL["300 — HUMAN-IN-THE-LOOP APPROVAL GATE<br/>Mandatory · Cannot Be Bypassed · Explicit Staff Authorization"]
    ORCH["305 — Multi-Agent Chain Orchestrator<br/>Task Routing · Dependency Resolution · State Management"]
    A1["310<br/>Donor Cultivation"]
    A2["320<br/>Proposal Generation"]
    A3["330<br/>Campaign Manager"]
    A4["340<br/>Compliance Monitor"]
    A5["350<br/>Revenue Analytics"]
    A6["360<br/>Fan Engagement"]
    A7["370<br/>Recruiting Intelligence"]
    A8["380<br/>Facility Operations"]
    A9["390<br/>Executive Briefing"]
    HITL --> ORCH
    ORCH --> A1 & A2 & A3
    ORCH --> A4 & A5 & A6
    ORCH --> A7 & A8 & A9
    style HITL fill:#fee2e2,stroke:#dc2626,stroke-width:3px,color:#991b1b
    style ORCH fill:#1e3a5f,stroke:#1e3a5f,stroke-width:2px,color:#ffffff
    style A1 fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style A2 fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style A3 fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style A4 fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    style A5 fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style A6 fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style A7 fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style A8 fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style A9 fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#1e293b`,
  },
  {
    id: 'pa1-fig4', figNum: 'FIG. 4', title: 'Multi-Provider Communication Failover',
    desc: 'Human Approval Gate (400) → SendGrid primary (410) → Resend secondary (420) → AgentMail tertiary (430) with Webhook Monitoring (440) and Cryptographic Audit Trail (450)',
    mermaid: `flowchart LR
    HITL["400<br/>Human Approval Gate<br/>Explicit Authorization"]
    SP["410<br/>SendGrid<br/>Primary Provider"]
    R["420<br/>Resend<br/>Secondary Provider"]
    AM["430<br/>AgentMail<br/>Tertiary Provider"]
    OK(["Delivered"])
    FAIL(["Alert Staff"])
    WH["440<br/>Webhook Monitoring<br/>Open · Click · Bounce"]
    AT["450<br/>Cryptographic<br/>Audit Trail"]
    HITL --> SP
    SP -->|"Success"| OK
    SP -->|"Failure"| R
    R -->|"Success"| OK
    R -->|"Failure"| AM
    AM -->|"Success"| OK
    AM -->|"All fail"| FAIL
    OK --> WH & AT
    style HITL fill:#fee2e2,stroke:#dc2626,stroke-width:3px,color:#991b1b
    style SP fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style R fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    style AM fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    style OK fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style FAIL fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#991b1b
    style WH fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#1e293b
    style AT fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#1e293b`,
  },
  {
    id: 'pa1-fig5', figNum: 'FIG. 5', title: 'Database Layer & RFE Lead Scoring',
    desc: 'Core tables with record counts, RFE Scoring Engine (550), external cross-reference sources (560), and Row-Level Security enforcement (570)',
    mermaid: `graph TD
    EXT["560 — External Data Sources<br/>SEC EDGAR · FEC Records<br/>OpenCorporates · LinkedIn Evaboot"]
    RFE["550 — RFE Scoring Engine<br/>calculate_lead_scores()<br/>Configurable Weights · Continuous Updates"]
    CM["510 — constituent_master<br/>170,529 Records"]
    PT["520 — pac_transactions<br/>334,518 Records"]
    OPP["530 — opportunities<br/>8,113 Records"]
    LS["540 — lead_scores<br/>167,740 Scored Records<br/>Renewal · Gift · Churn Risk"]
    RLS["570 — Row-Level Security<br/>10 Enterprise Roles · JWT Auth"]
    EXT --> RFE
    CM --> RFE
    PT --> RFE
    OPP --> RFE
    RFE --> LS
    RLS -.->|"enforces on"| CM & PT & OPP & LS
    style EXT fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#1e293b
    style RFE fill:#1e3a5f,stroke:#1e3a5f,stroke-width:2px,color:#ffffff
    style CM fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style PT fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style OPP fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style LS fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style RLS fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#991b1b`,
  },
]

// ── PA-5: Voice-First Agentic Database Infrastructure (VADI) ──────────────

export const PA5_FIGURES: DrawingDef[] = [
  {
    id: 'pa5-fig1', figNum: 'FIG. 1', title: 'VADI Platform Architecture Overview',
    desc: 'Four platform primitives: Voice-to-Query Engine (VQE) 100, Agentic Execution Framework (AEF) 200, Human Authorization Layer (HAL) 300, Multi-Provider Communication Bus (MPCB) 400, with Developer SDK interfaces and multi-tenant isolation boundaries',
    mermaid: `graph TD
    SDK["Developer SDK<br/>TypeScript API · REST · WebSocket"]
    VQE["100 — Voice-to-Query Engine<br/>VQE<br/>Audio Capture · STT · NLP · Query Gen"]
    AEF["200 — Agentic Execution Framework<br/>AEF<br/>Agent Registry · Routing · Chain Orchestration"]
    HAL["300 — Human Authorization Layer<br/>HAL<br/>Non-Bypassable · Platform-Level Enforcement"]
    MPCB["400 — Multi-Provider Communication Bus<br/>MPCB<br/>Failover Delivery · Compliance Tracking"]
    MT["Multi-Tenant Isolation<br/>Row-Level Security · Resource Allocation<br/>Edge Function Deployment"]
    SDK --> VQE & AEF
    VQE --> AEF
    AEF --> HAL
    HAL --> MPCB
    MT -.->|"isolates"| VQE & AEF & HAL & MPCB
    style SDK fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#1e293b
    style VQE fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style AEF fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style HAL fill:#fee2e2,stroke:#dc2626,stroke-width:3px,color:#991b1b
    style MPCB fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    style MT fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d`,
  },
  {
    id: 'pa5-fig2', figNum: 'FIG. 2', title: 'Voice-to-Query Engine (VQE) Pipeline Detail',
    desc: 'Standardized audio capture interface 110, multi-provider STT 111, domain-aware NLP 120, configurable semantic mapping 130, query generation 140, disambiguation protocol 150',
    mermaid: `flowchart TD
    IN(["Voice Input"])
    A["110 — Standardized Audio<br/>Capture Interface"]
    B["111 — Multi-Provider<br/>Speech-to-Text Module<br/>Google · Azure · Whisper"]
    C["120 — Domain-Aware<br/>NLP Pipeline<br/>Intent + Entity Extraction"]
    D["130 — Configurable Semantic<br/>Mapping Layer<br/>Schema-Aware Mapping"]
    E["140 — Query Generation<br/>Engine<br/>SQL · GraphQL · REST"]
    F["150 — Disambiguation<br/>Protocol<br/>Confidence Threshold"]
    OUT(["Database Query Output"])
    IN --> A --> B --> C
    C --> D --> E --> OUT
    C -.->|"confidence &lt; threshold"| F
    F -.->|"clarified"| C
    style IN fill:#1e40af,stroke:#1e40af,color:#ffffff
    style OUT fill:#15803d,stroke:#15803d,color:#ffffff
    style A fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style B fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style C fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style D fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style E fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style F fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e`,
  },
  {
    id: 'pa5-fig3', figNum: 'FIG. 3', title: 'Human Authorization Layer (HAL) Authorization Flow',
    desc: 'Action Interceptor 310, Preview Generator 320, Authorization Interface 330, Authorization Store 340 with immutable cryptographically-signed audit records, Enforcement Engine 350. Platform-layer enforcement boundary cannot be bypassed by application-layer code.',
    mermaid: `flowchart TD
    IN(["Proposed Agent Action"])
    A["310 — Action Interceptor<br/>Receives all proposed actions<br/>from registered agents"]
    B["320 — Preview Generator<br/>Human-readable summary<br/>of proposed action"]
    C["330 — Authorization Interface<br/>Collects human decision<br/>Approve / Deny / Modify"]
    D["340 — Authorization Store<br/>Immutable audit records<br/>Cryptographically signed"]
    E["350 — Enforcement Engine<br/>Executes approved actions<br/>Blocks denied actions"]
    APPROVE(["Action Executed"])
    DENY(["Action Blocked"])
    BOUNDARY["PLATFORM-LAYER ENFORCEMENT BOUNDARY<br/>Cannot be bypassed by application code"]
    IN --> A --> B --> C
    C -->|"Approved"| E --> APPROVE
    C -->|"Denied"| DENY
    C --> D
    E --> D
    BOUNDARY -.->|"enforces"| A & B & C & E
    style IN fill:#1e40af,stroke:#1e40af,color:#ffffff
    style APPROVE fill:#15803d,stroke:#15803d,color:#ffffff
    style DENY fill:#dc2626,stroke:#dc2626,color:#ffffff
    style A fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#991b1b
    style B fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#991b1b
    style C fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#991b1b
    style D fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#1e293b
    style E fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#991b1b
    style BOUNDARY fill:#fef3c7,stroke:#d97706,stroke-width:3px,color:#92400e`,
  },
  {
    id: 'pa5-fig4', figNum: 'FIG. 4', title: 'Multi-Tenant Platform Architecture',
    desc: 'Tenant isolation through row-level security, shared platform infrastructure (VQE, AEF, HAL, MPCB), configurable resource allocation, and serverless edge-function deployment with geographic distribution',
    mermaid: `graph TD
    T1["Tenant A<br/>Athletic Department"]
    T2["Tenant B<br/>Marketing Agency"]
    T3["Tenant C<br/>Financial Advisor"]
    RLS["Row-Level Security<br/>JWT-Based Tenant Isolation"]
    VQE["Shared VQE<br/>Voice-to-Query Engine"]
    AEF["Shared AEF<br/>Agent Execution Framework"]
    HAL["Shared HAL<br/>Human Authorization Layer"]
    MPCB["Shared MPCB<br/>Communication Bus"]
    EDGE["Serverless Edge Functions<br/>Geographic Distribution<br/>Auto-Scaling · Cold Start &lt;50ms"]
    RA["Resource Allocation<br/>Configurable per tenant<br/>Rate Limits · Quotas"]
    T1 & T2 & T3 --> RLS
    RLS --> VQE & AEF
    AEF --> HAL --> MPCB
    EDGE -.->|"deploys"| VQE & AEF & HAL & MPCB
    RA -.->|"limits"| T1 & T2 & T3
    style T1 fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style T2 fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style T3 fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style RLS fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#991b1b
    style VQE fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style AEF fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style HAL fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style MPCB fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style EDGE fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#1e293b
    style RA fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e`,
  },
  {
    id: 'pa5-fig5', figNum: 'FIG. 5', title: 'End-to-End Data Flow',
    desc: 'Complete voice-to-authorized-action sequence: (1) voice input, (2) STT, (3) NLP intent, (4) semantic mapping, (5) query generation, (6) result to agent, (7) action proposal, (8) HAL interception, (9) human authorization, (10) execution via MPCB',
    mermaid: `flowchart LR
    S1["1<br/>Voice Input<br/>Capture"]
    S2["2<br/>STT<br/>Transcription"]
    S3["3<br/>NLP Intent<br/>Classification"]
    S4["4<br/>Semantic<br/>Mapping"]
    S5["5<br/>Query<br/>Generation"]
    S6["6<br/>Result to<br/>Agent"]
    S7["7<br/>Agent Action<br/>Proposal"]
    S8["8<br/>HAL<br/>Interception"]
    S9["9<br/>Human<br/>Authorization"]
    S10["10<br/>Authorized<br/>Execution"]
    S1 --> S2 --> S3 --> S4 --> S5
    S5 --> S6 --> S7 --> S8 --> S9 --> S10
    style S1 fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style S2 fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style S3 fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style S4 fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style S5 fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style S6 fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style S7 fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    style S8 fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#991b1b
    style S9 fill:#fee2e2,stroke:#dc2626,stroke-width:3px,color:#991b1b
    style S10 fill:#15803d,stroke:#15803d,color:#ffffff`,
  },
  {
    id: 'pa5-fig6', figNum: 'FIG. 6', title: 'Visual Capture Engine (VCE) Pipeline',
    desc: 'Camera Interface Module 510 capturing physical invention photographs, Image Processing Pipeline 520, Vision Analysis Engine 530 via multi-modal LLM, Component Classifier 540 assessing novelty, Documentation Generator 550 producing patent-ready artifacts. HAL authorization gate between draft generation and document inclusion.',
    mermaid: `flowchart TD
    CAM["510 — Camera Interface Module<br/>Physical Invention Photography<br/>Multi-Angle Capture"]
    IMG["520 — Image Processing Pipeline<br/>Normalization · Enhancement<br/>Resolution Optimization"]
    VIS["530 — Vision Analysis Engine<br/>Multi-Modal LLM Analysis<br/>Component Identification"]
    CLS["540 — Component Classifier<br/>Novelty Assessment<br/>Prior Art Comparison"]
    DOC["550 — Documentation Generator<br/>Patent-Ready Artifacts"]
    HAL["HAL Authorization Gate<br/>Human Review Required"]
    F1(["Figure References"])
    F2(["Specification Text"])
    F3(["Claim Elements"])
    F4(["Abstract Contributions"])
    CAM --> IMG --> VIS --> CLS --> DOC
    DOC --> HAL
    HAL --> F1 & F2 & F3 & F4
    style CAM fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style IMG fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style VIS fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style CLS fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    style DOC fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style HAL fill:#fee2e2,stroke:#dc2626,stroke-width:3px,color:#991b1b
    style F1 fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#1e293b
    style F2 fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#1e293b
    style F3 fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#1e293b
    style F4 fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#1e293b`,
  },
  {
    id: 'pa5-fig7', figNum: 'FIG. 7', title: 'Domain Intelligence Collector (DIC) Architecture',
    desc: 'Schema Registry 610 with registered domain schemas per vertical, Learning Event Capture Pipeline 620, Quality Assessment Module 630, Training Data Aggregator 640 computing model readiness, Privacy Enforcement Layer 650. Data flows from registered applications through quality assessment to domain model training.',
    mermaid: `flowchart TD
    APP1["Registered App A<br/>Sports Vertical"]
    APP2["Registered App B<br/>Marketing Vertical"]
    APP3["Registered App C<br/>Financial Vertical"]
    SR["610 — Schema Registry<br/>Domain Schemas per Vertical<br/>Field Definitions · Validation Rules"]
    EC["620 — Learning Event<br/>Capture Pipeline<br/>Operational Data Ingestion"]
    QA["630 — Quality Assessment<br/>Module<br/>Data Quality Scoring<br/>Completeness · Consistency"]
    TDA["640 — Training Data<br/>Aggregator<br/>Model Readiness Computation<br/>Volume · Quality Thresholds"]
    PEL["650 — Privacy<br/>Enforcement Layer<br/>PII Scrubbing · k-Anonymity<br/>Differential Privacy"]
    OUT(["Domain Model Training"])
    APP1 & APP2 & APP3 --> SR
    SR --> EC --> QA --> TDA
    PEL -.->|"enforces at each stage"| EC & QA & TDA
    TDA --> OUT
    style APP1 fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style APP2 fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style APP3 fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style SR fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    style EC fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style QA fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style TDA fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style PEL fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#991b1b
    style OUT fill:#1e40af,stroke:#1e40af,color:#ffffff`,
  },
  {
    id: 'pa5-fig8', figNum: 'FIG. 8', title: 'Physical-Digital Bridge (PDB) Flow',
    desc: 'Captured image analysis input, Mapping Engine 710 connecting analyses to target documents, Content Generator 720 producing patent-compliant text, Measurement Integration Module 730, HAL Integration Layer 740 enforcing authorization. Output: figure references, specification paragraphs, claim elements, abstract contributions.',
    mermaid: `flowchart TD
    IN(["Captured Image Analysis"])
    MAP["710 — Mapping Engine<br/>Connects Image Analysis<br/>to Target Documents"]
    GEN["720 — Content Generator<br/>Patent-Compliant Text<br/>37 CFR 1.52 Formatting"]
    MEAS["730 — Measurement<br/>Integration Module<br/>Physical Dimensions<br/>Scale · Tolerances"]
    HAL["740 — HAL Integration Layer<br/>Authorization Before<br/>Document Inclusion"]
    O1(["Figure References"])
    O2(["Specification Paragraphs"])
    O3(["Claim Elements"])
    O4(["Abstract Contributions"])
    IN --> MAP
    MAP --> GEN
    MAP --> MEAS
    GEN --> HAL
    MEAS --> HAL
    HAL --> O1 & O2 & O3 & O4
    style IN fill:#1e40af,stroke:#1e40af,color:#ffffff
    style MAP fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style GEN fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style MEAS fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    style HAL fill:#fee2e2,stroke:#dc2626,stroke-width:3px,color:#991b1b
    style O1 fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style O2 fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style O3 fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style O4 fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d`,
  },
]

// ── Patent Drawings Map ───────────────────────────────────────────────────

export const PATENT_DRAWINGS: Record<string, DrawingDef[]> = {
  'PA-1': PA1_FIGURES,
  'PA-2': [],
  'PA-3': [],
  'PA-4': [],
  'PA-5': PA5_FIGURES,
  'PA-6': [],
  'PA-7': [],
  'PA-8': [],
  'PA-9': [],
  'PA-10': [],
  'RS-1': [],
  'PGI-1': [],
}

// ── Custom drawings localStorage helpers ──────────────────────────────────

const CUSTOM_DRAWINGS_PREFIX = 'vais:custom-drawings:'

export function loadCustomDrawings(patentId: string): DrawingDef[] {
  try {
    const raw = localStorage.getItem(CUSTOM_DRAWINGS_PREFIX + patentId)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveCustomDrawings(patentId: string, drawings: DrawingDef[]): void {
  localStorage.setItem(CUSTOM_DRAWINGS_PREFIX + patentId, JSON.stringify(drawings))
}

export function getPatentIds(): string[] {
  return Object.keys(PATENT_DRAWINGS)
}
