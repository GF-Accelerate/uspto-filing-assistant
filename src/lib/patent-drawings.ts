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

// ── PA-2: Athletic Department Management Platform ─────────────────────────

export const PA2_FIGURES: DrawingDef[] = [
  {
    id: 'pa2-fig1', figNum: 'FIG. 1', title: 'Athletic Department Platform System Architecture',
    desc: 'Six-layer cloud SaaS architecture: Frontend Layer 110, API Gateway 120, Database Layer 130, AI Processing 140, Communication Layer 150, Analytics 160',
    mermaid: `graph TD
    A["110 — Frontend Layer<br/>Web Dashboard · Mobile Apps<br/>Voice Command UI"]
    B["120 — API Gateway<br/>Auth · Rate Limiting<br/>Multi-Tenant Routing"]
    C["130 — Database Layer<br/>Multi-Tenant PostgreSQL<br/>Row-Level Security · 10 Roles"]
    D["140 — AI Processing<br/>NLP · ML Forecasting<br/>RFE Scoring · Gift Readiness"]
    E["150 — Communication Layer<br/>Email · SMS · Video<br/>Provider Failover"]
    F["160 — Analytics Layer<br/>Revenue Attribution<br/>Engagement Metrics"]
    A --> B --> C
    B --> D
    D --> C
    D --> E
    C --> F
    D --> F
    style A fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style B fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style C fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style D fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    style E fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style F fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d`,
  },
  {
    id: 'pa2-fig2', figNum: 'FIG. 2', title: 'Constituent CRM with RFE Scoring Engine',
    desc: 'Constituent CRM Module 200 with RFE Scoring Engine 201 supporting 170,000+ records. Data flows from external sources through scoring to predicted donor tiers.',
    mermaid: `flowchart TD
    EXT1["Giving History<br/>Donations · Ticket Renewals"]
    EXT2["Engagement Events<br/>Emails · Clicks · Visits"]
    EXT3["External Wealth Data<br/>SEC · FEC · OpenCorporates"]
    CRM["200 — Constituent CRM Module<br/>170,000+ Records<br/>Relationship Mapping"]
    RFE["201 — RFE Scoring Engine<br/>Recency · Frequency · Engagement<br/>Configurable Weights"]
    SCR["Scored Constituents<br/>Major Gift Prospects<br/>Churn Risks · Renewal Candidates"]
    UI["Dashboard + Voice Queries<br/>Sub-Second Response"]
    EXT1 & EXT2 & EXT3 --> CRM
    CRM --> RFE --> SCR --> UI
    style EXT1 fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#1e293b
    style EXT2 fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#1e293b
    style EXT3 fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#1e293b
    style CRM fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style RFE fill:#1e3a5f,stroke:#1e3a5f,stroke-width:2px,color:#ffffff
    style SCR fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style UI fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f`,
  },
  {
    id: 'pa2-fig3', figNum: 'FIG. 3', title: 'NCAA Compliance Automation Engine',
    desc: 'NCAA Compliance Engine 300 monitoring NIL disclosures, scholarship limits, contact calendars, revenue sharing caps, with automated alerts 301 and audit trail 302',
    mermaid: `flowchart TD
    NIL["NIL Activity Monitor<br/>Disclosure Tracking"]
    SCHOL["Scholarship Equivalency<br/>Calculator"]
    CONTACT["Recruiting Contact<br/>Calendar Restrictions"]
    REV["Revenue Sharing Cap<br/>House v. NCAA Thresholds"]
    TRANS["Transfer Portal<br/>Eligibility Monitor"]
    CORE["300 — NCAA Compliance<br/>Automation Engine<br/>Bylaw-Aware Rule Set"]
    ALERT["301 — Automated Alerts<br/>Threshold Approaching<br/>Staff Notification"]
    AUDIT["302 — Audit Trail<br/>Immutable Record<br/>Bylaw Citation"]
    DASH["Compliance Dashboard<br/>Real-Time Status"]
    NIL & SCHOL & CONTACT & REV & TRANS --> CORE
    CORE --> ALERT --> DASH
    CORE --> AUDIT
    style NIL fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style SCHOL fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style CONTACT fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style REV fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style TRANS fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style CORE fill:#fef3c7,stroke:#d97706,stroke-width:3px,color:#92400e
    style ALERT fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#991b1b
    style AUDIT fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#1e293b
    style DASH fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d`,
  },
  {
    id: 'pa2-fig4', figNum: 'FIG. 4', title: 'Revenue Intelligence with House v. NCAA Modeling',
    desc: 'Revenue Intelligence Module 400 integrating real-time revenue streams with ML forecasting and House v. NCAA revenue sharing scenarios',
    mermaid: `flowchart LR
    TIX["Ticket Sales<br/>Season · Single-Game"]
    DON["Donations<br/>Annual · Major Gifts"]
    MEDIA["Media Rights<br/>TV · Streaming"]
    LIC["Licensing<br/>Merchandise · IP"]
    SPON["Sponsorships<br/>Corporate Partners"]
    AGG["400 — Revenue Intelligence<br/>Module · Real-Time Aggregation"]
    ML["ML Forecasting Engine<br/>Historical Trends · Economic Indicators"]
    HOUSE["House v. NCAA<br/>Revenue Share Modeling<br/>Configurable Athlete Allocation"]
    VAR["Budget Variance Analysis<br/>Drill-Down Reporting"]
    BRIEF["Executive Briefing<br/>Dashboard + Voice Summary"]
    TIX & DON & MEDIA & LIC & SPON --> AGG
    AGG --> ML --> HOUSE
    AGG --> VAR
    ML --> BRIEF
    HOUSE --> BRIEF
    VAR --> BRIEF
    style TIX fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style DON fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style MEDIA fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style LIC fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style SPON fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style AGG fill:#1e3a5f,stroke:#1e3a5f,stroke-width:2px,color:#ffffff
    style ML fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style HOUSE fill:#fef3c7,stroke:#d97706,stroke-width:3px,color:#92400e
    style VAR fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style BRIEF fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d`,
  },
  {
    id: 'pa2-fig5', figNum: 'FIG. 5', title: 'Recruiting Intelligence Module',
    desc: 'Recruiting Module 500 with prospect database, NCAA contact limit logging, offer management, scholarship modeling, and transfer portal monitoring',
    mermaid: `graph TD
    PROSPECT["500 — Recruiting Module<br/>Prospect Database"]
    ACAD["Academic Profile<br/>GPA · Test Scores · Transcripts"]
    ATH["Athletic Profile<br/>Stats · Film · Combine"]
    CONT["NCAA Contact Logger<br/>Compliance-Aware Limits"]
    OFFER["Offer Management<br/>Scholarship Modeling"]
    TRAN["Transfer Portal<br/>Monitor · Alerts"]
    COMM["Communication Hub<br/>Voice-Commanded Outreach"]
    HITL["Human Approval Gate<br/>(from PA-3 integration)"]
    OUT["Compliant Outreach<br/>Audit Logged"]
    PROSPECT --> ACAD
    PROSPECT --> ATH
    PROSPECT --> CONT
    PROSPECT --> OFFER
    PROSPECT --> TRAN
    CONT --> COMM
    COMM --> HITL --> OUT
    style PROSPECT fill:#1e3a5f,stroke:#1e3a5f,stroke-width:2px,color:#ffffff
    style ACAD fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style ATH fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style CONT fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    style OFFER fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style TRAN fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style COMM fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style HITL fill:#fee2e2,stroke:#dc2626,stroke-width:3px,color:#991b1b
    style OUT fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d`,
  },
]

// ── PA-3: Multi-Modal Campaign Orchestration via Voice ────────────────────

export const PA3_FIGURES: DrawingDef[] = [
  {
    id: 'pa3-fig1', figNum: 'FIG. 1', title: 'Voice-Commanded Campaign Orchestration Overview',
    desc: 'End-to-end pipeline: Voice Command Interface 110 → NLP 115 → Campaign Configuration AI 120 → HITL Gate 130 → Multi-Provider Router 140 → AI Video Pipeline 150 → Analytics 160',
    mermaid: `flowchart TD
    VOICE(["Voice Command<br/>Natural Language"])
    VCI["110 — Voice Command Interface"]
    NLP["115 — NLP Engine<br/>Intent + Entity Extraction"]
    CAI["120 — Campaign<br/>Configuration AI"]
    HITL["130 — Human-in-the-Loop<br/>Approval Gate<br/>CANNOT BE BYPASSED"]
    ROUTER["140 — Multi-Provider<br/>Communication Router"]
    VIDEO["150 — AI Video<br/>Personalization Pipeline"]
    ANALYTICS["160 — Campaign<br/>Analytics Engine"]
    OUT(["Approved Outbound<br/>Campaign"])
    VOICE --> VCI --> NLP --> CAI --> HITL
    HITL -->|"Approved"| ROUTER
    HITL -->|"Approved"| VIDEO
    ROUTER --> OUT
    VIDEO --> ROUTER
    OUT --> ANALYTICS
    style VOICE fill:#1e40af,stroke:#1e40af,color:#ffffff
    style OUT fill:#15803d,stroke:#15803d,color:#ffffff
    style VCI fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style NLP fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style CAI fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style HITL fill:#fee2e2,stroke:#dc2626,stroke-width:3px,color:#991b1b
    style ROUTER fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    style VIDEO fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style ANALYTICS fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d`,
  },
  {
    id: 'pa3-fig2', figNum: 'FIG. 2', title: 'Campaign Configuration AI Detail',
    desc: 'Campaign AI 120 generates complete specs: Audience Segmentation 121, Message Content 122, Channel Selection 123, Send Schedule 124, Tracking Configuration 125',
    mermaid: `flowchart TD
    IN(["Natural Language<br/>Campaign Instruction"])
    CAI["120 — Campaign Configuration AI"]
    AUD["121 — Audience<br/>Segmentation Query<br/>Giving History · Engagement"]
    MSG["122 — Message Content<br/>Calibrated to Recipient<br/>Gift Capacity + History"]
    CHAN["123 — Channel Selection<br/>Email · SMS · Video · Social"]
    SCHED["124 — Send Schedule<br/>Time-of-Day Optimization"]
    TRACK["125 — Tracking<br/>Configuration<br/>UTM · Webhooks"]
    SPEC(["Complete Campaign<br/>Specification"])
    IN --> CAI
    CAI --> AUD
    CAI --> MSG
    CAI --> CHAN
    CAI --> SCHED
    CAI --> TRACK
    AUD & MSG & CHAN & SCHED & TRACK --> SPEC
    style IN fill:#1e40af,stroke:#1e40af,color:#ffffff
    style SPEC fill:#15803d,stroke:#15803d,color:#ffffff
    style CAI fill:#1e3a5f,stroke:#1e3a5f,stroke-width:2px,color:#ffffff
    style AUD fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style MSG fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style CHAN fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style SCHED fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style TRACK fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f`,
  },
  {
    id: 'pa3-fig3', figNum: 'FIG. 3', title: 'Human-in-the-Loop Approval Gate',
    desc: 'Mandatory HITL Gate 130 intercepts all outbound actions. Presents recipient count, message preview, cost, projected metrics. Human Approval 131 is explicit and non-bypassable.',
    mermaid: `flowchart TD
    SPEC(["Campaign Specification"])
    GATE["130 — Human-in-the-Loop<br/>Approval Gate<br/>NO BYPASS MECHANISM"]
    PREV["Preview Bundle<br/>Recipient Count · Msg Sample<br/>Cost · Revenue Forecast"]
    HUMAN["131 — Explicit<br/>Human Authorization<br/>Approve · Modify · Reject"]
    APPROVE(["Outbound<br/>Execution Authorized"])
    REJECT(["Campaign<br/>Blocked"])
    MODIFY(["Return for Revision"])
    AUDIT["Cryptographic<br/>Decision Log"]
    SPEC --> GATE --> PREV --> HUMAN
    HUMAN -->|"Approve"| APPROVE
    HUMAN -->|"Reject"| REJECT
    HUMAN -->|"Modify"| MODIFY
    MODIFY --> SPEC
    APPROVE --> AUDIT
    REJECT --> AUDIT
    style SPEC fill:#1e40af,stroke:#1e40af,color:#ffffff
    style APPROVE fill:#15803d,stroke:#15803d,color:#ffffff
    style REJECT fill:#dc2626,stroke:#dc2626,color:#ffffff
    style MODIFY fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    style GATE fill:#fee2e2,stroke:#dc2626,stroke-width:3px,color:#991b1b
    style PREV fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#991b1b
    style HUMAN fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#991b1b
    style AUDIT fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#1e293b`,
  },
  {
    id: 'pa3-fig4', figNum: 'FIG. 4', title: 'Multi-Provider Communication Router with Failover',
    desc: 'Router 140 with primary SendGrid 141, secondary Resend 142, tertiary AgentMail 143, Cryptographic Audit Trail 144, CAN-SPAM/GDPR Compliance 145',
    mermaid: `flowchart LR
    IN(["Approved<br/>Campaign"])
    R["140 — Multi-Provider<br/>Communication Router"]
    C1["145 — Compliance Layer<br/>CAN-SPAM · GDPR"]
    SP["141 — SendGrid<br/>Primary Provider"]
    RS["142 — Resend<br/>Secondary Provider"]
    AM["143 — AgentMail<br/>Tertiary Provider"]
    OK(["Delivered"])
    AT["144 — Cryptographic<br/>Audit Trail<br/>Per-Provider Log"]
    IN --> C1 --> R --> SP
    SP -->|"Success"| OK
    SP -->|"Failure"| RS
    RS -->|"Success"| OK
    RS -->|"Failure"| AM
    AM -->|"Success"| OK
    SP --> AT
    RS --> AT
    AM --> AT
    style IN fill:#1e40af,stroke:#1e40af,color:#ffffff
    style OK fill:#15803d,stroke:#15803d,color:#ffffff
    style R fill:#1e3a5f,stroke:#1e3a5f,stroke-width:2px,color:#ffffff
    style C1 fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#991b1b
    style SP fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style RS fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    style AM fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    style AT fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#1e293b`,
  },
  {
    id: 'pa3-fig5', figNum: 'FIG. 5', title: 'AI Video Personalization + Analytics Pipeline',
    desc: 'Video Pipeline 150-154 generates individualized video per recipient; Analytics 160-166 tracks delivery, engagement, and revenue attribution',
    mermaid: `flowchart TD
    REC["Recipient Record<br/>Name · History · Capacity"]
    VID["150 — AI Video<br/>Personalization Pipeline"]
    CONT["151 — Personalized<br/>Video Content"]
    VEO["152 — VEO AI<br/>Video Generation<br/>30-60s Segments"]
    DEL["153 — Video Delivery<br/>Embedded Links"]
    TRK["154 — View Tracking"]
    ANA["160 — Campaign<br/>Analytics Engine"]
    M1["161 Delivery"]
    M2["162 Opens"]
    M3["163 Clicks"]
    M4["164 Video Completion"]
    M5["165 Response Rate"]
    M6["166 Revenue<br/>Attribution<br/>30 · 60 · 90 day"]
    REC --> VID --> CONT --> VEO --> DEL --> TRK
    TRK --> ANA
    DEL --> ANA
    ANA --> M1 & M2 & M3 & M4 & M5 & M6
    style REC fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style VID fill:#1e3a5f,stroke:#1e3a5f,stroke-width:2px,color:#ffffff
    style CONT fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style VEO fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style DEL fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style TRK fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f
    style ANA fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style M1 fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style M2 fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style M3 fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style M4 fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style M5 fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d
    style M6 fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#14532d`,
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
  'PA-2': PA2_FIGURES,
  'PA-3': PA3_FIGURES,
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
