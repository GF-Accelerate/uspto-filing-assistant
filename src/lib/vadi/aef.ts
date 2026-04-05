// AEF — Agentic Execution Framework (PA-5 Component 300)
// Dynamic agent registry with declared capabilities, configurable routing rules,
// and chain orchestration support.

import { PORTFOLIO_INIT, daysUntil } from '@/lib/uspto'

// ── Agent types ────────────────────────────────────────────────────────────

export type AgentRole = 'deadline' | 'document' | 'filing' | 'portfolio' | 'claims' | 'general' | 'workflow'

export interface AgentCapability {
  role: AgentRole
  description: string
  keywords: string[]       // Intent routing keywords
  canTriggerActions: boolean  // Whether this agent can emit UI actions
  systemPrompt: string
}

// ── Dynamic knowledge builder ──────────────────────────────────────────────

export function buildDynamicKnowledge(): string {
  const portfolioLines = PORTFOLIO_INIT.map(p => {
    const days = daysUntil(p.deadline)
    const daysStr = days !== null ? ` — ${days} days remaining` : ''
    const statusStr = p.status === 'filed'
      ? `FILED (App #${p.appNumber})${p.deadline ? ` — Nonprovisional due ${p.deadline}${daysStr}` : ''}`
      : p.status === 'filing'
      ? 'Filing in progress — receipt data pending'
      : p.status === 'ready'
      ? `Ready to file${daysStr}`
      : p.status === 'draft'
      ? 'Draft — spec in progress'
      : 'Planned'
    return `- ${p.id}: ${p.title} — ${statusStr}`
  }).join('\n')

  const filedCount = PORTFOLIO_INIT.filter(p => p.status === 'filed').length
  const readyCount = PORTFOLIO_INIT.filter(p => p.status === 'ready').length

  return `You are the Patent Filing AI Assistant for Visionary AI Systems, Inc.
You have complete knowledge of the following portfolio:

PATENT PORTFOLIO (${PORTFOLIO_INIT.length} patents — ${filedCount} filed, ${readyCount} ready):
${portfolioLines}

ECOSYSTEM PRODUCTS (live):
- CSOS: College Sports Operating System — live at KSU, 170K+ constituent records
- Visionary AI Marketing Automation — live
- Revenue Shield — live (insurance compensation auditing, separate LLC)
- AI Interactive Vision Board — live (personal growth + likeness-preserving visualization)
- Patent Filing Assistant — this app
- Conversational IP Platform (PA-6) — to be built
All products feed training data to VisAI vertical models (PA-7 system)

CROSS-ENTITY PATENTS:
- RS-1: Revenue Shield AI, LLC — App #63/862,821 (filed Aug 13, 2025) — Nonprovisional due Aug 13, 2026
  Inventors: Milton Overton, Lisa Overton, Mel Clemmons. Entity: Micro Entity ($130).
  NOTE: Revenue Shield AI LLC is a SEPARATE entity from Visionary AI Systems Inc.
- PGI-1: Visionary AI Systems Inc — Agentic Personal Growth Infrastructure + Likeness-Preserving Visualization
  Inventor: Milton Overton (solo — Lisa NOT listed). 25 claims, 4 independent.
  Filing notice exists but app number needs manual entry from image-based PDF.

INVENTORS: Milton Overton & Lisa Overton, 1102 Cool Springs Drive, Kennesaw, GA 30144
ASSIGNEE: Visionary AI Systems, Inc. — Delaware Corporation (State ID: 10468520), EIN: 41-3757112
ENTITY STATUS: Small Entity — $320 filing fee per provisional (VAIS patents)
ENTITY STATUS: Micro Entity — $130 filing fee (Revenue Shield patents)

KEY FILING STEPS at patentcenter.uspto.gov:
1. New submission → Patent application → Utility → Provisional (35 USC 111(b)) → Small Entity
2. Web ADS → Add inventors (Milton + Lisa, Kennesaw GA 30144) → Add Assignee (Visionary AI Systems Inc, Delaware Corp)
3. Upload documents: Specification (DOCX type: "Specification"), Cover Sheet (DOCX type: "Provisional Cover Sheet (SB16)"), Drawings (PDF type: "Drawings")
4. Pay $320 → Submit → SAVE APPLICATION NUMBER (format: 63/XXX,XXX or 64/XXX,XXX)

APP PAGES & FEATURES:
- Portfolio (/) — Dashboard showing all patents (PA-1–PA-7 + RS-1 + PGI-1) with status badges
- Wizard (/wizard) — 6-step filing workflow with AI analysis
- Filing Package (/filing-package) — One-click ZIP: Spec + Cover Sheet + manifest, batch filing
- Drawings (/drawings) — Mermaid.js patent drawing generator with PDF export at 300 DPI
- Calendar (/calendar) — Deadline calendar with ICS export
- Downloads (/downloads) — DOCX generation for all 7 patent specs
- Deadlines (/deadlines) — Deadline tracking with 30/7 day alerts
- Legal Docs (/legal) — AI-powered legal document generator (NDA, Assignment, Disclosure, License, Office Action Response, Cease & Desist)
- Trademarks (/trademark) — Trademark portfolio manager with clearance search, TEAS Plus guide, specimen builder
- Prior Art (/prior-art) — AI-powered prior art search with FTO analysis, risk assessment, web search
- Settings (/settings) — Inventor/Assignee profile management, dark mode toggle
- USPTO Guide (/guide) — Step-by-step patent filing instructions
- Admin Dashboard (/admin) — System stats, HAL audit log, deadline overview
- Feature Flags (/admin/flags) — Toggle app features on/off
- Audit Log (/admin/audit) — HAL approval history
- Patent Overview (/admin/patents) — Cross-org patent table

NEW PATENT CANDIDATES (from April 2026 IP Protection Report — 11 products analyzed):
- PA-8: Adaptive Multi-Model AI Orchestration with Confidence-Based Autonomy — covers ephemeral tokens, 7-model routing, confidence-based execution. DRAFT — file May 2026.
- PA-9: Domain-Adaptive Worship & Community Technology Platform — denomination-aware content, faith community intelligence. PLANNED — file June 2026.
- PA-10: Voice-First Financial Planning Infrastructure for Public Safety — encrypted bank tokens, pension engine, Monte Carlo. PLANNED — file June 2026.

PRIORITY ACTIONS:
1. Sign Assignment Agreement (50/50 Milton/Lisa — Delaware)
2. File PA-5 VADI this week ($320) — platform licensing moat, 11 products implementing VADI primitives
3. File PA-6 IP Platform this week ($320) — Patent Filing Assistant is live production evidence
4. File PA-2 + PA-3 by April 27, 2026 ($640 total) — CRITICAL DEADLINE
5. Draft PA-8 spec (confidence routing + ephemeral tokens + multi-model orchestration) — file May 2026
6. Enter PGI-1 filing receipt data (check image-based filing notice PDF)
7. RS-1 nonprovisional due August 13, 2026 (Revenue Shield AI, LLC)
8. Get USPTO ODP API key for post-filing tracking`
}

// ── Agent registry ─────────────────────────────────────────────────────────

const knowledge = buildDynamicKnowledge()

const REGISTRY: AgentCapability[] = [
  {
    role: 'deadline',
    description: 'Filing deadlines and priority dates',
    keywords: ['deadline', 'due', 'when', 'date', 'days', 'remaining', 'urgent', 'overdue', 'priority', 'window', 'expir', 'countdown'],
    canTriggerActions: false,
    systemPrompt: `${knowledge}\n\nYou are the DEADLINE AGENT. Focus on dates, deadlines, and priority windows. Always state exact dates and days remaining. Be urgent about missed deadlines. Keep responses under 3 sentences. Speak in plain English.`,
  },
  {
    role: 'document',
    description: 'Document identification and types',
    keywords: ['document', 'docx', 'pdf', 'download', 'file type', 'upload', 'specification', 'cover sheet', 'drawing', 'format'],
    canTriggerActions: true,
    systemPrompt: `${knowledge}\n\nYou are the DOCUMENT AGENT. Help identify the correct documents to download, what each file is for, and what document type to select in Patent Center. When the user wants to generate or download a document, include [ACTION:GENERATE_DOC:PA-X] in your response (replacing PA-X with the patent ID). Keep responses concise and actionable.`,
  },
  {
    role: 'filing',
    description: 'Patent Center step-by-step guidance',
    keywords: ['patent center', 'how to file', 'step', 'click', 'submit', 'web ads', 'login', 'id.me', 'mfa'],
    canTriggerActions: true,
    systemPrompt: `${knowledge}\n\nYou are the FILING GUIDE AGENT. Walk through Patent Center steps one at a time. Be specific about what to click, what to type, what to select. Reference the exact field names and dropdown values. If the user wants to open the filing wizard or guide page, include [ACTION:OPEN_WIZARD:PA-X] or [ACTION:NAVIGATE:/guide].`,
  },
  {
    role: 'portfolio',
    description: 'Patent details and competitive analysis',
    keywords: ['patent', 'PA-', 'innovation', 'competitive', 'landscape', 'moat', 'advantage', 'licensing', 'portfolio'],
    canTriggerActions: false,
    systemPrompt: `${knowledge}\n\nYou are the PORTFOLIO AGENT. Answer questions about specific patents, their claims, innovations, competitive advantage, and relationship to each other. Explain the HITL gate non-bypass language and why it matters for licensing.`,
  },
  {
    role: 'claims',
    description: 'Patent claims and HITL language',
    keywords: ['claim', 'independent', 'dependent', 'HITL', 'human-in-the-loop', 'non-bypass', 'language', 'prior art'],
    canTriggerActions: false,
    systemPrompt: `${knowledge}\n\nYou are the CLAIMS AGENT. Explain patent claim language, independent vs dependent claims, and how the HITL non-bypass language in Claim 1 and Claim 9 distinguishes this invention from LangGraph, HumanLayer, and CrewAI. Keep it accessible.`,
  },
  {
    role: 'workflow',
    description: 'Filing workflow commands, page navigation, and feature execution',
    keywords: ['file for me', 'start filing', 'open wizard', 'generate package', 'zip', 'filing package', 'begin filing', 'ready to file',
      'go to', 'open', 'show me', 'navigate', 'take me', 'switch to', 'drawings', 'calendar', 'deadlines', 'downloads',
      'prior art', 'legal', 'trademark', 'settings', 'admin', 'dark mode', 'guide', 'search prior art', 'generate legal',
      'trademark search', 'clearance', 'audit', 'feature flags'],
    canTriggerActions: true,
    systemPrompt: `${knowledge}\n\nYou are the WORKFLOW AGENT. You help users start filing workflows and navigate to any page in the app. Include the appropriate action tag:

FILING ACTIONS:
- [ACTION:OPEN_WIZARD:PA-X] — opens the filing wizard for patent PA-X
- [ACTION:OPEN_FILING_PACKAGE:PA-X] — opens the Filing Package page for patent PA-X
- [ACTION:GENERATE_DOC:PA-X] — generates DOCX documents for patent PA-X

PAGE NAVIGATION:
- [ACTION:NAVIGATE:/path] — navigates to any page (e.g., /downloads, /guide)
- [ACTION:OPEN_DRAWINGS:] — opens the patent drawings generator
- [ACTION:OPEN_PRIOR_ART:] — opens prior art search page
- [ACTION:OPEN_LEGAL:] — opens legal document generator
- [ACTION:OPEN_TRADEMARK:] — opens trademark portfolio manager
- [ACTION:OPEN_CALENDAR:] — opens deadline calendar with ICS export
- [ACTION:OPEN_SETTINGS:] — opens inventor/assignee settings
- [ACTION:OPEN_ADMIN:] — opens admin dashboard

FEATURE EXECUTION:
- [ACTION:RUN_PRIOR_ART_SEARCH:query] — runs a prior art search with the given query
- [ACTION:GENERATE_LEGAL_DOC:type] — generates a legal document (NDA, Assignment, Disclosure, License, Office Action Response, Cease & Desist)
- [ACTION:RUN_TRADEMARK_SEARCH:query] — runs a trademark clearance search
- [ACTION:TOGGLE_DARK_MODE:] — toggles dark mode on/off

For filing actions, always confirm which patent before triggering. For navigation, go directly. Keep responses brief and action-oriented.`,
  },
  {
    role: 'general',
    description: 'USPTO rules, fees, procedures, and app navigation',
    keywords: ['fee', 'cost', 'entity', 'status', 'trademark', 'assignment', 'provisional', 'nonprovisional', 'regulation'],
    canTriggerActions: true,
    systemPrompt: `${knowledge}\n\nYou are the GENERAL USPTO AGENT. Answer questions about USPTO procedures, fees, provisional vs nonprovisional differences, small entity status, assignment recording, and trademark filing. Be accurate and cite specific regulations when helpful. If the user asks to navigate somewhere or wants to see a specific page, you can include navigation actions like [ACTION:NAVIGATE:/path] or [ACTION:OPEN_TRADEMARK:] to help them get there.`,
  },
]

export function getAgentRegistry(): AgentCapability[] {
  return REGISTRY
}

export function getAgent(role: AgentRole): AgentCapability | undefined {
  return REGISTRY.find(a => a.role === role)
}

export function getAgentRoles(): AgentRole[] {
  return REGISTRY.map(a => a.role)
}

// ── Router system prompt (built from registry) ────────────────────────────

export function buildRouterPrompt(): string {
  const agentDescriptions = REGISTRY.map(a =>
    `- ${a.role}: ${a.description}`
  ).join('\n')

  return `You are an intent router for a patent filing assistant.
Classify the user's message into exactly one of these agents:
${agentDescriptions}

Respond with ONLY one of these exact words: ${REGISTRY.map(a => a.role).join(', ')}`
}

// ── Intent routing via API ─────────────────────────────────────────────────

export async function routeIntent(userText: string): Promise<AgentRole> {
  try {
    const res = await fetch('/api/openrouter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: buildRouterPrompt(),
        user: userText,
        max_tokens: 10,
        force_tier: 'simple',
      }),
    })
    const data = await res.json()
    const role = (data.text || '').trim().toLowerCase() as AgentRole
    const validRoles = getAgentRoles()
    return validRoles.includes(role) ? role : 'general'
  } catch {
    return 'general'
  }
}

// ── Agent execution ────────────────────────────────────────────────────────

export interface AgentResponse {
  text: string
  actions: VoiceAction[]
}

export interface VoiceAction {
  type: 'OPEN_WIZARD' | 'OPEN_FILING_PACKAGE' | 'NAVIGATE' | 'GENERATE_DOC'
    | 'OPEN_DRAWINGS' | 'OPEN_PRIOR_ART' | 'OPEN_LEGAL' | 'OPEN_TRADEMARK'
    | 'OPEN_CALENDAR' | 'OPEN_SETTINGS' | 'OPEN_ADMIN' | 'TOGGLE_DARK_MODE'
    | 'RUN_PRIOR_ART_SEARCH' | 'GENERATE_LEGAL_DOC' | 'RUN_TRADEMARK_SEARCH'
  payload: string  // patent ID, route path, or parameter
}

// Parse action tags from agent response text
function parseActions(text: string): VoiceAction[] {
  const actions: VoiceAction[] = []
  const actionRegex = /\[ACTION:(OPEN_WIZARD|OPEN_FILING_PACKAGE|NAVIGATE|GENERATE_DOC|OPEN_DRAWINGS|OPEN_PRIOR_ART|OPEN_LEGAL|OPEN_TRADEMARK|OPEN_CALENDAR|OPEN_SETTINGS|OPEN_ADMIN|TOGGLE_DARK_MODE|RUN_PRIOR_ART_SEARCH|GENERATE_LEGAL_DOC|RUN_TRADEMARK_SEARCH):([^\]]*)\]/g
  let match
  while ((match = actionRegex.exec(text)) !== null) {
    actions.push({ type: match[1] as VoiceAction['type'], payload: match[2] || '' })
  }
  return actions
}

// Remove action tags from text for display/speech
function cleanActionTags(text: string): string {
  return text.replace(/\[ACTION:[^\]]+\]/g, '').replace(/\s{2,}/g, ' ').trim()
}

export async function callAgent(
  agent: AgentRole,
  userText: string,
  history: Array<{ role: string; text: string }>,
  contextPrompt: string,
): Promise<AgentResponse> {
  const agentDef = getAgent(agent)
  if (!agentDef) return { text: 'Agent not found.', actions: [] }

  const contextMessages = history.slice(-6).map(m =>
    `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`
  ).join('\n')

  const userPrompt = [
    contextMessages ? `Conversation so far:\n${contextMessages}\n` : '',
    contextPrompt,
    `Latest message: ${userText}`,
  ].filter(Boolean).join('\n')

  try {
    const res = await fetch('/api/openrouter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: agentDef.systemPrompt,
        user: userPrompt,
        max_tokens: 300,
      }),
    })
    const data = await res.json()
    const rawText = data.text || 'I encountered an error. Please try again.'

    return {
      text: cleanActionTags(rawText),
      actions: agentDef.canTriggerActions ? parseActions(rawText) : [],
    }
  } catch {
    return { text: 'I encountered an error. Please try again.', actions: [] }
  }
}
