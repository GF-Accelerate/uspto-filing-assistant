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
    A["<b>110</b> — Voice Input Layer<br/><i>Web Speech API · Noise Cancellation</i><br/><i>Athletic-Domain Vocabulary</i>"]
    B["<b>120</b> — NLP Engine<br/><i>GPT-4o-mini · 94% Accuracy</i><br/><i>200+ Intent Patterns</i>"]
    C["<b>130</b> — SQL Query Generator<br/><i>Semantic Schema Mapping</i><br/><i>Join-Path Optimization · &lt;200ms</i>"]
    D["<b>140</b> — Database Layer<br/><i>PostgreSQL · 170,529 Records</i><br/><i>Row-Level Security · 10 Roles</i>"]
    E["<b>150</b> — Agent Framework<br/><i>9 Specialized AI Agents</i><br/><i>HITL Approval Gate</i>"]
    F["<b>160</b> — Multi-Modal Response<br/><i>Voice Synthesis · Dashboard</i><br/><i>WebSocket Streaming</i>"]
    G["<b>125</b> — Disambiguation<br/><i>confidence &lt; 0.75 threshold</i>"]
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
    S(["<b>START</b> — Voice Command Received"])
    A["<b>210</b> — Audio Preprocessing<br/><i>Noise Cancellation · Domain Vocab</i>"]
    B["<b>220</b> — Intent Classification<br/><i>GPT-4o-mini LLM · NER Extraction</i>"]
    C{"<b>230</b> — Confidence Check"}
    D["<b>235</b> — Disambiguation Query<br/><i>Prompt User for Clarification</i>"]
    E["<b>240</b> — Parameter Extraction<br/><i>Entity-to-Schema Mapping</i>"]
    F["<b>250</b> — Join-Path Optimizer<br/><i>Cost-Based Query Planner</i>"]
    G["<b>260</b> — SQL Generation<br/><i>Validation &amp; Index Selection</i>"]
    H["<b>270</b> — Database Execution<br/><i>RLS Applied · Audit Logged</i>"]
    K{"<b>280</b> — Result Size Check"}
    L["<b>285</b> — Batch Pagination<br/><i>1,000 rows per cycle</i>"]
    E2(["<b>END</b> — Results Returned"])
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
    HITL["<b>300</b> — HUMAN-IN-THE-LOOP APPROVAL GATE<br/><i>Mandatory · Cannot Be Bypassed · Explicit Staff Authorization</i>"]
    ORCH["<b>305</b> — Multi-Agent Chain Orchestrator<br/><i>Task Routing · Dependency Resolution · State Management</i>"]
    A1["<b>310</b><br/>Donor Cultivation"]
    A2["<b>320</b><br/>Proposal Generation"]
    A3["<b>330</b><br/>Campaign Manager"]
    A4["<b>340</b><br/>Compliance Monitor"]
    A5["<b>350</b><br/>Revenue Analytics"]
    A6["<b>360</b><br/>Fan Engagement"]
    A7["<b>370</b><br/>Recruiting Intelligence"]
    A8["<b>380</b><br/>Facility Operations"]
    A9["<b>390</b><br/>Executive Briefing"]
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
    HITL["<b>400</b><br/>Human Approval Gate<br/><i>Explicit Authorization</i>"]
    SP["<b>410</b><br/>SendGrid<br/><i>Primary Provider</i>"]
    R["<b>420</b><br/>Resend<br/><i>Secondary Provider</i>"]
    AM["<b>430</b><br/>AgentMail<br/><i>Tertiary Provider</i>"]
    OK(["Delivered"])
    FAIL(["Alert Staff"])
    WH["<b>440</b><br/>Webhook Monitoring<br/><i>Open · Click · Bounce</i>"]
    AT["<b>450</b><br/>Cryptographic<br/>Audit Trail"]
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
    EXT["<b>560</b> — External Data Sources<br/><i>SEC EDGAR · FEC Records</i><br/><i>OpenCorporates · LinkedIn Evaboot</i>"]
    RFE["<b>550</b> — RFE Scoring Engine<br/><i>calculate_lead_scores()</i><br/><i>Configurable Weights · Continuous Updates</i>"]
    CM["<b>510</b> — constituent_master<br/><i>170,529 Records</i>"]
    PT["<b>520</b> — pac_transactions<br/><i>334,518 Records</i>"]
    OPP["<b>530</b> — opportunities<br/><i>8,113 Records</i>"]
    LS["<b>540</b> — lead_scores<br/><i>167,740 Scored Records</i><br/><i>Renewal · Gift · Churn Risk</i>"]
    RLS["<b>570</b> — Row-Level Security<br/><i>10 Enterprise Roles · JWT Auth</i>"]
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
    SDK["<b>Developer SDK</b><br/><i>TypeScript API · REST · WebSocket</i>"]
    VQE["<b>100</b> — Voice-to-Query Engine<br/><i>VQE</i><br/><i>Audio Capture · STT · NLP · Query Gen</i>"]
    AEF["<b>200</b> — Agentic Execution Framework<br/><i>AEF</i><br/><i>Agent Registry · Routing · Chain Orchestration</i>"]
    HAL["<b>300</b> — Human Authorization Layer<br/><i>HAL</i><br/><i>Non-Bypassable · Platform-Level Enforcement</i>"]
    MPCB["<b>400</b> — Multi-Provider Communication Bus<br/><i>MPCB</i><br/><i>Failover Delivery · Compliance Tracking</i>"]
    MT["<b>Multi-Tenant Isolation</b><br/><i>Row-Level Security · Resource Allocation</i><br/><i>Edge Function Deployment</i>"]
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
    A["<b>110</b> — Standardized Audio<br/>Capture Interface"]
    B["<b>111</b> — Multi-Provider<br/>Speech-to-Text Module<br/><i>Google · Azure · Whisper</i>"]
    C["<b>120</b> — Domain-Aware<br/>NLP Pipeline<br/><i>Intent + Entity Extraction</i>"]
    D["<b>130</b> — Configurable Semantic<br/>Mapping Layer<br/><i>Schema-Aware Mapping</i>"]
    E["<b>140</b> — Query Generation<br/>Engine<br/><i>SQL · GraphQL · REST</i>"]
    F["<b>150</b> — Disambiguation<br/>Protocol<br/><i>Confidence Threshold</i>"]
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
    A["<b>310</b> — Action Interceptor<br/><i>Receives all proposed actions</i><br/><i>from registered agents</i>"]
    B["<b>320</b> — Preview Generator<br/><i>Human-readable summary</i><br/><i>of proposed action</i>"]
    C["<b>330</b> — Authorization Interface<br/><i>Collects human decision</i><br/><i>Approve / Deny / Modify</i>"]
    D["<b>340</b> — Authorization Store<br/><i>Immutable audit records</i><br/><i>Cryptographically signed</i>"]
    E["<b>350</b> — Enforcement Engine<br/><i>Executes approved actions</i><br/><i>Blocks denied actions</i>"]
    APPROVE(["Action Executed"])
    DENY(["Action Blocked"])
    BOUNDARY["PLATFORM-LAYER ENFORCEMENT BOUNDARY<br/><i>Cannot be bypassed by application code</i>"]
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
    T1["<b>Tenant A</b><br/><i>Athletic Department</i>"]
    T2["<b>Tenant B</b><br/><i>Marketing Agency</i>"]
    T3["<b>Tenant C</b><br/><i>Financial Advisor</i>"]
    RLS["<b>Row-Level Security</b><br/><i>JWT-Based Tenant Isolation</i>"]
    VQE["<b>Shared VQE</b><br/><i>Voice-to-Query Engine</i>"]
    AEF["<b>Shared AEF</b><br/><i>Agent Execution Framework</i>"]
    HAL["<b>Shared HAL</b><br/><i>Human Authorization Layer</i>"]
    MPCB["<b>Shared MPCB</b><br/><i>Communication Bus</i>"]
    EDGE["<b>Serverless Edge Functions</b><br/><i>Geographic Distribution</i><br/><i>Auto-Scaling · Cold Start &lt;50ms</i>"]
    RA["<b>Resource Allocation</b><br/><i>Configurable per tenant</i><br/><i>Rate Limits · Quotas</i>"]
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
    S1["<b>1</b><br/>Voice Input<br/>Capture"]
    S2["<b>2</b><br/>STT<br/>Transcription"]
    S3["<b>3</b><br/>NLP Intent<br/>Classification"]
    S4["<b>4</b><br/>Semantic<br/>Mapping"]
    S5["<b>5</b><br/>Query<br/>Generation"]
    S6["<b>6</b><br/>Result to<br/>Agent"]
    S7["<b>7</b><br/>Agent Action<br/>Proposal"]
    S8["<b>8</b><br/>HAL<br/>Interception"]
    S9["<b>9</b><br/>Human<br/>Authorization"]
    S10["<b>10</b><br/>Authorized<br/>Execution"]
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
    CAM["<b>510</b> — Camera Interface Module<br/><i>Physical Invention Photography</i><br/><i>Multi-Angle Capture</i>"]
    IMG["<b>520</b> — Image Processing Pipeline<br/><i>Normalization · Enhancement</i><br/><i>Resolution Optimization</i>"]
    VIS["<b>530</b> — Vision Analysis Engine<br/><i>Multi-Modal LLM Analysis</i><br/><i>Component Identification</i>"]
    CLS["<b>540</b> — Component Classifier<br/><i>Novelty Assessment</i><br/><i>Prior Art Comparison</i>"]
    DOC["<b>550</b> — Documentation Generator<br/><i>Patent-Ready Artifacts</i>"]
    HAL["<b>HAL Authorization Gate</b><br/><i>Human Review Required</i>"]
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
    APP1["<b>Registered App A</b><br/><i>Sports Vertical</i>"]
    APP2["<b>Registered App B</b><br/><i>Marketing Vertical</i>"]
    APP3["<b>Registered App C</b><br/><i>Financial Vertical</i>"]
    SR["<b>610</b> — Schema Registry<br/><i>Domain Schemas per Vertical</i><br/><i>Field Definitions · Validation Rules</i>"]
    EC["<b>620</b> — Learning Event<br/>Capture Pipeline<br/><i>Operational Data Ingestion</i>"]
    QA["<b>630</b> — Quality Assessment<br/>Module<br/><i>Data Quality Scoring</i><br/><i>Completeness · Consistency</i>"]
    TDA["<b>640</b> — Training Data<br/>Aggregator<br/><i>Model Readiness Computation</i><br/><i>Volume · Quality Thresholds</i>"]
    PEL["<b>650</b> — Privacy<br/>Enforcement Layer<br/><i>PII Scrubbing · k-Anonymity</i><br/><i>Differential Privacy</i>"]
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
    MAP["<b>710</b> — Mapping Engine<br/><i>Connects Image Analysis</i><br/><i>to Target Documents</i>"]
    GEN["<b>720</b> — Content Generator<br/><i>Patent-Compliant Text</i><br/><i>37 CFR 1.52 Formatting</i>"]
    MEAS["<b>730</b> — Measurement<br/>Integration Module<br/><i>Physical Dimensions</i><br/><i>Scale · Tolerances</i>"]
    HAL["<b>740</b> — HAL Integration Layer<br/><i>Authorization Before</i><br/><i>Document Inclusion</i>"]
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
