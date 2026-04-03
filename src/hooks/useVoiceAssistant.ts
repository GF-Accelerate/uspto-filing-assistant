// useVoiceAssistant — mirrors CSOS voice pipeline exactly
// Web Speech API → intent parse → agent router → specialized agents → TTS
// No CSOS codebase was modified — this is a standalone implementation

import { useState, useRef, useCallback, useEffect } from 'react'

export type AgentRole = 'deadline' | 'document' | 'filing' | 'portfolio' | 'claims' | 'general'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  agent?: AgentRole
  timestamp: Date
}

// ── Knowledge base: patent filing domain context ──────────────────────────
const PATENT_KNOWLEDGE = `You are the Patent Filing AI Assistant for Visionary AI Systems, Inc.
You have complete knowledge of the following portfolio:

PATENT PORTFOLIO:
- PA-1: Voice-Controlled Database Query + Autonomous Agent Execution — Provisional BEING FILED NOW at patentcenter.uspto.gov — Nonprovisional deadline: March 28, 2027 (ABSOLUTE — no extensions)
- PA-2: Athletic Department Management Platform — File by April 27, 2026 (25 days away — CRITICAL)
- PA-3: Multi-Modal Campaign Orchestration via Voice — File by April 27, 2026 (CRITICAL)
- PA-4: Predictive Sports Revenue Intelligence Engine — File by May 27, 2026
- PA-5: Voice-First Agentic Database Infrastructure (VADI) — File within 30 days — Platform/licensing moat patent

INVENTORS: Milton Overton & Lisa Overton, 1102 Cool Springs Drive, Kennesaw, GA 30144
ASSIGNEE: Visionary AI Systems, Inc. — Delaware Corporation (State ID: 10468520), EIN: 41-3757112
ENTITY STATUS: Small Entity — $320 filing fee per provisional

KEY FILING STEPS at patentcenter.uspto.gov:
1. New submission → Patent application → Utility → Provisional (35 USC 111(b)) → Small Entity
2. Web ADS → Add inventors (Milton + Lisa, Kennesaw GA 30144) → Application details (title + Small Entity) → Skip Representatives → Skip First Inventor to File → Skip Authorization to Permit Access → Skip Applicant → Add Assignee (Visionary AI Systems Inc, Delaware Corp)
3. Upload documents: Specification (DOCX), Cover Sheet (DOCX), FIG 1-5 PDFs (type: Drawings)
4. Pay $320 → Submit → SAVE APPLICATION NUMBER (format: 63/XXX,XXX)

TRADE SECRETS (do NOT include in any patent document):
- Exact NLP prompt templates achieving 94% accuracy
- Specific RFE scoring weight values
- Athletic domain vocabulary corpus
- Edge function performance tuning configurations
- External API integration methods

KEY LEGAL DOCUMENTS READY TO DOWNLOAD in the app:
- PA1-Complete-Provisional-Patent-DELAWARE.docx
- PA1-Cover-Sheet-PTO-SB-16-DELAWARE.docx
- PA1-FIG-1 through PA1-FIG-5 PDFs (drawings)
- PA5-Voice-First-Agentic-DB-Infrastructure-VADI.docx
- Assignment-Agreement-Final-Delaware-50-50.docx (SIGN TONIGHT — 50/50 Milton/Lisa)
- Invention-Disclosure-IDF-001.docx (SIGN TONIGHT)
- Trade-Secret-Registry.docx
- Attorney-Handoff-Package.docx

CRITICAL ACTIONS TONIGHT:
1. Fix inventor names in Patent Center (remove prefix/middle name)
2. Complete ADS → Upload documents → Pay $320 → Get application number
3. Sign Assignment Agreement + Invention Disclosure (both inventors)
4. File PA-5 this week ($320)
5. File PA-2 + PA-3 by April 27 ($640)
6. Rotate ALL API keys (GitHub, Vercel, Supabase, Anthropic — all shared in chat)

AGENTS AVAILABLE:
- deadline: answers questions about filing deadlines and priority dates
- document: helps find and identify correct documents to file
- filing: walks through Patent Center step by step
- portfolio: answers questions about specific patents and claims
- claims: explains patent claims language and HITL gate innovations
- general: USPTO rules, fees, procedures`

// ── Agent system prompts ──────────────────────────────────────────────────
const AGENT_PROMPTS: Record<AgentRole, string> = {
  deadline: `${PATENT_KNOWLEDGE}\n\nYou are the DEADLINE AGENT. Focus on dates, deadlines, and priority windows. Always state exact dates and days remaining. Be urgent about missed deadlines. Keep responses under 3 sentences. Speak in plain English.`,
  document: `${PATENT_KNOWLEDGE}\n\nYou are the DOCUMENT AGENT. Help identify the correct documents to download, what each file is for, and what document type to select in Patent Center. Keep responses concise and actionable.`,
  filing: `${PATENT_KNOWLEDGE}\n\nYou are the FILING GUIDE AGENT. Walk through Patent Center steps one at a time. Be specific about what to click, what to type, what to select. Reference the exact field names and dropdown values.`,
  portfolio: `${PATENT_KNOWLEDGE}\n\nYou are the PORTFOLIO AGENT. Answer questions about specific patents, their claims, innovations, competitive advantage, and relationship to each other. Explain the HITL gate non-bypass language and why it matters for licensing.`,
  claims: `${PATENT_KNOWLEDGE}\n\nYou are the CLAIMS AGENT. Explain patent claim language, independent vs dependent claims, and how the HITL non-bypass language in Claim 1 and Claim 9 distinguishes this invention from LangGraph, HumanLayer, and CrewAI. Keep it accessible.`,
  general: `${PATENT_KNOWLEDGE}\n\nYou are the GENERAL USPTO AGENT. Answer questions about USPTO procedures, fees, provisional vs nonprovisional differences, small entity status, assignment recording, and trademark filing. Be accurate and cite specific regulations when helpful.`,
}

// ── Intent router — maps user query to agent ─────────────────────────────
const ROUTER_SYSTEM = `You are an intent router for a patent filing assistant.
Classify the user's message into exactly one of these agents:
- deadline: anything about dates, deadlines, days remaining, priority windows, when to file
- document: anything about which files to use, what to download, document types
- filing: anything about steps in Patent Center, how to file, what to click
- portfolio: questions about specific patents PA-1 through PA-5, innovations, competitive landscape
- claims: questions about claim language, HITL gate, independent/dependent claims
- general: USPTO rules, fees, entity status, procedures, assignment, trademarks

Respond with ONLY one of these exact words: deadline, document, filing, portfolio, claims, general`

async function routeIntent(userText: string): Promise<AgentRole> {
  try {
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: ROUTER_SYSTEM,
        user: userText,
        max_tokens: 10,
      }),
    })
    const data = await res.json()
    const role = (data.text || '').trim().toLowerCase() as AgentRole
    return ['deadline','document','filing','portfolio','claims','general'].includes(role)
      ? role : 'general'
  } catch {
    return 'general'
  }
}

async function callAgent(agent: AgentRole, userText: string, history: Message[]): Promise<string> {
  const contextMessages = history.slice(-6).map(m =>
    `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`
  ).join('\n')

  const userPrompt = contextMessages
    ? `Conversation so far:\n${contextMessages}\n\nLatest message: ${userText}`
    : userText

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system: AGENT_PROMPTS[agent],
      user: userPrompt,
      max_tokens: 300,
    }),
  })
  const data = await res.json()
  return data.text || 'I encountered an error. Please try again.'
}

// ── Hook ──────────────────────────────────────────────────────────────────
export function useVoiceAssistant() {
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    role: 'assistant',
    text: "Hi Milton! I'm your Patent Filing Assistant. I can help with deadlines, documents, filing steps, and your patent portfolio. Ask me anything — or tap the mic to speak.",
    agent: 'general',
    timestamp: new Date(),
  }])
  const [isListening, setIsListening] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [currentAgent, setCurrentAgent] = useState<AgentRole>('general')
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    synthRef.current = window.speechSynthesis
  }, [])

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return
    synthRef.current.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = 1.0
    utt.pitch = 1.0
    utt.volume = 1.0
    // Prefer a natural-sounding voice
    const voices = synthRef.current.getVoices()
    const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Alex'))
    if (preferred) utt.voice = preferred
    synthRef.current.speak(utt)
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsThinking(true)
    setTranscript('')

    try {
      // Route to correct agent
      const agent = await routeIntent(text)
      setCurrentAgent(agent)

      // Call agent with conversation history
      const response = await callAgent(agent, text, [...messages, userMsg])

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response,
        agent,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMsg])
      speak(response)
    } catch (err) {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'Sorry, I had trouble connecting. Please check your connection and try again.',
        agent: 'general',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setIsThinking(false)
    }
  }, [messages, speak])

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Voice input requires Chrome or Edge. Please type your question.')
      return
    }

    if (recognitionRef.current) {
      recognitionRef.current.abort()
    }

    const rec = new SpeechRecognition()
    rec.continuous = false
    rec.interimResults = true
    rec.lang = 'en-US'

    rec.onstart = () => setIsListening(true)
    rec.onend = () => setIsListening(false)

    rec.onresult = (e: any) => {
      const results = Array.from(e.results as any[])
      const text = results.map((r: any) => r[0].transcript).join('')
      setTranscript(text)
      if (e.results[e.results.length - 1].isFinal) {
        sendMessage(text)
      }
    }

    rec.onerror = () => setIsListening(false)
    recognitionRef.current = rec
    rec.start()
  }, [sendMessage])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel()
  }, [])

  return {
    messages,
    isListening,
    isThinking,
    transcript,
    currentAgent,
    sendMessage,
    startListening,
    stopListening,
    stopSpeaking,
  }
}
