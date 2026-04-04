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
- Revenue Shield — live
- Patent Filing Assistant — this app
- Conversational IP Platform (PA-6) — to be built
All products feed training data to VisAI vertical models (PA-7 system)

INVENTORS: Milton Overton & Lisa Overton, 1102 Cool Springs Drive, Kennesaw, GA 30144
ASSIGNEE: Visionary AI Systems, Inc. — Delaware Corporation (State ID: 10468520), EIN: 41-3757112
ENTITY STATUS: Small Entity — $320 filing fee per provisional

KEY FILING STEPS at patentcenter.uspto.gov:
1. New submission → Patent application → Utility → Provisional (35 USC 111(b)) → Small Entity
2. Web ADS → Add inventors (Milton + Lisa, Kennesaw GA 30144) → Add Assignee (Visionary AI Systems Inc, Delaware Corp)
3. Upload documents: Specification (DOCX type: "Specification"), Cover Sheet (DOCX type: "Provisional Cover Sheet (SB16)"), Drawings (PDF type: "Drawings")
4. Pay $320 → Submit → SAVE APPLICATION NUMBER (format: 63/XXX,XXX or 64/XXX,XXX)

APP FEATURES:
- Downloads page has DOCX generation for all 7 patent specs
- Filing Package page generates one-click ZIP with Specification + Cover Sheet + manifest
- Wizard walks through 6-step filing process with AI analysis
- Voice commands can navigate to Filing Package, Wizard, or Downloads

PRIORITY ACTIONS:
1. Sign Assignment Agreement (50/50 Milton/Lisa — Delaware)
2. File PA-5 VADI this week ($320) — platform licensing moat
3. File PA-2 + PA-3 by April 27, 2026 ($640 total) — CRITICAL DEADLINE
4. Get USPTO ODP API key for post-filing tracking`
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
    canTriggerActions: false,
    systemPrompt: `${knowledge}\n\nYou are the FILING GUIDE AGENT. Walk through Patent Center steps one at a time. Be specific about what to click, what to type, what to select. Reference the exact field names and dropdown values.`,
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
    description: 'Filing workflow commands — open wizard, generate packages',
    keywords: ['file for me', 'start filing', 'open wizard', 'generate package', 'zip', 'filing package', 'begin filing', 'ready to file'],
    canTriggerActions: true,
    systemPrompt: `${knowledge}\n\nYou are the WORKFLOW AGENT. You help users start filing workflows. When a user wants to file a patent, include the appropriate action tag:
- [ACTION:OPEN_WIZARD:PA-X] — opens the filing wizard for patent PA-X
- [ACTION:OPEN_FILING_PACKAGE:PA-X] — opens the Filing Package page for patent PA-X
- [ACTION:NAVIGATE:/path] — navigates to a page (e.g., /downloads, /drawings)

Always confirm which patent before triggering an action. If the user says "file PA-5" or "start filing PA-3", include the action tag AND explain what will happen next. Keep responses brief and action-oriented.`,
  },
  {
    role: 'general',
    description: 'USPTO rules, fees, and procedures',
    keywords: ['fee', 'cost', 'entity', 'status', 'trademark', 'assignment', 'provisional', 'nonprovisional', 'regulation'],
    canTriggerActions: false,
    systemPrompt: `${knowledge}\n\nYou are the GENERAL USPTO AGENT. Answer questions about USPTO procedures, fees, provisional vs nonprovisional differences, small entity status, assignment recording, and trademark filing. Be accurate and cite specific regulations when helpful.`,
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
  payload: string  // patent ID or route path
}

// Parse action tags from agent response text
function parseActions(text: string): VoiceAction[] {
  const actions: VoiceAction[] = []
  const actionRegex = /\[ACTION:(OPEN_WIZARD|OPEN_FILING_PACKAGE|NAVIGATE|GENERATE_DOC):([^\]]+)\]/g
  let match
  while ((match = actionRegex.exec(text)) !== null) {
    actions.push({ type: match[1] as VoiceAction['type'], payload: match[2] })
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
