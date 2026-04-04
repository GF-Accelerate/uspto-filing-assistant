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

PATENT PORTFOLIO (7 patents):
- PA-1: Voice-Controlled Database Query + Autonomous Agent Execution — Provisional FILED at patentcenter.uspto.gov — Nonprovisional deadline: March 28, 2027 (ABSOLUTE)
- PA-2: Athletic Department Management Platform — File by April 27, 2026 (CRITICAL — 25 days)
- PA-3: Multi-Modal Campaign Orchestration via Voice — File by April 27, 2026 (CRITICAL)
- PA-4: Predictive Sports Revenue Intelligence Engine — File by May 27, 2026
- PA-5: Voice-First Agentic Database Infrastructure (VADI) — File this week — Platform licensing moat
- PA-6: Conversational AI-Guided IP Development Platform — File this week — LegalZoom replacement, $600M market
- PA-7: Federated Multi-Vertical Industry Learning System — File within 30 days — AI independence data flywheel

ECOSYSTEM PRODUCTS (live):
- CSOS: College Sports Operating System — live at KSU, 170K+ constituent records
- Visionary AI Marketing Automation — live
- Revenue Shield — live
- Patent Filing Assistant — this app, being built
- Conversational IP Platform (PA-6) — to be built
All products feed training data to VisAI vertical models (PA-7 system)

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
    const res = await fetch('/api/openrouter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: ROUTER_SYSTEM,
        user: userText,
        max_tokens: 10,
        force_tier: 'simple',
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

  const res = await fetch('/api/openrouter', {
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

// ── American female voice selection with async loading ────────────────────
// Web Speech API voices load asynchronously. We must wait for onvoiceschanged
// before selecting. Priority order targets natural American female voices.
const PREFERRED_VOICES_PRIORITY = [
  // Chrome on Windows — best quality American female voices
  'Microsoft Aria Online (Natural)',     // Windows 11 neural voice — best quality
  'Microsoft Jenny Online (Natural)',    // Windows 11 neural voice
  'Google US English',                   // Chrome's built-in US English female
  // macOS voices
  'Samantha',                            // macOS default female — very natural
  'Karen',                               // macOS Australian but clear English
  // Fallback patterns — match by language and gender hints
  'Microsoft Zira',                      // Windows built-in US female
  'Microsoft Aria',                      // Windows neural (offline version)
  'Google US English Female',            // Some Chrome versions label it this way
]

function selectAmericanFemaleVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  // First pass: exact name match from priority list
  for (const preferred of PREFERRED_VOICES_PRIORITY) {
    const match = voices.find(v => v.name.includes(preferred))
    if (match) return match
  }

  // Second pass: any English (US) female voice
  const usEnglish = voices.filter(v =>
    v.lang === 'en-US' || v.lang === 'en_US'
  )
  if (usEnglish.length > 0) {
    // Prefer voices with "female" or common female voice names
    const femaleHints = ['female', 'woman', 'zira', 'aria', 'jenny', 'samantha', 'salli', 'joanna', 'kendra', 'ivy']
    const female = usEnglish.find(v =>
      femaleHints.some(h => v.name.toLowerCase().includes(h))
    )
    if (female) return female
    // If no female hint found, return the first US English voice
    return usEnglish[0]
  }

  // Third pass: any English voice at all (en-GB, en-AU, etc.)
  const anyEnglish = voices.find(v => v.lang.startsWith('en'))
  if (anyEnglish) return anyEnglish

  // Last resort: first available voice
  return voices[0] || null
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
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [currentAgent, setCurrentAgent] = useState<AgentRole>('general')
  const [voiceReady, setVoiceReady] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null)

  // ── Initialize TTS with proper async voice loading ──────────────────
  useEffect(() => {
    const synth = window.speechSynthesis
    if (!synth) return
    synthRef.current = synth

    const loadVoices = () => {
      const voices = synth.getVoices()
      if (voices.length === 0) return // not loaded yet

      const selected = selectAmericanFemaleVoice(voices)
      selectedVoiceRef.current = selected
      setVoiceReady(true)

      if (selected) {
        console.log(`[VoiceAssistant] Selected voice: "${selected.name}" (${selected.lang})`)
      }
    }

    // Try immediately (works in some browsers)
    loadVoices()

    // Also listen for async load event (required in Chrome)
    synth.onvoiceschanged = loadVoices

    return () => {
      synth.onvoiceschanged = null
    }
  }, [])

  const speak = useCallback((text: string) => {
    const synth = synthRef.current
    if (!synth) return

    // Cancel any ongoing speech
    synth.cancel()

    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = 1.05    // Slightly faster than default for conversational feel
    utt.pitch = 1.05   // Slightly higher for friendly female tone
    utt.volume = 1.0

    // Apply the pre-selected American female voice
    if (selectedVoiceRef.current) {
      utt.voice = selectedVoiceRef.current
    }

    // Track speaking state for UI feedback
    utt.onstart = () => setIsSpeaking(true)
    utt.onend = () => setIsSpeaking(false)
    utt.onerror = () => setIsSpeaking(false)

    // Chrome has a bug where long utterances get cut off after ~15 seconds.
    // Workaround: chunk long text into sentences and speak sequentially.
    if (text.length > 200) {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
      let idx = 0

      const speakNext = () => {
        if (idx >= sentences.length) {
          setIsSpeaking(false)
          return
        }
        const chunk = new SpeechSynthesisUtterance(sentences[idx].trim())
        chunk.rate = utt.rate
        chunk.pitch = utt.pitch
        chunk.volume = utt.volume
        if (selectedVoiceRef.current) chunk.voice = selectedVoiceRef.current

        chunk.onstart = () => setIsSpeaking(true)
        chunk.onend = () => {
          idx++
          speakNext()
        }
        chunk.onerror = () => {
          setIsSpeaking(false)
        }
        synth.speak(chunk)
      }

      setIsSpeaking(true)
      speakNext()
    } else {
      synth.speak(utt)
    }
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return

    // Stop any current speech before processing new message
    synthRef.current?.cancel()
    setIsSpeaking(false)

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

      // Speak the response — this is what makes it two-way
      speak(response)
    } catch {
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
    // Stop speaking before listening — prevents feedback loop
    synthRef.current?.cancel()
    setIsSpeaking(false)

    // Web Speech API — same pattern as CSOS voice pipeline
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any
    const RecognitionClass = win.SpeechRecognition ?? win.webkitSpeechRecognition
    if (!RecognitionClass) {
      alert('Voice input requires Chrome or Edge. Please type your question.')
      return
    }

    if (recognitionRef.current) {
      recognitionRef.current.abort()
    }

    const rec = new RecognitionClass()
    rec.continuous = false
    rec.interimResults = true
    rec.lang = 'en-US'

    rec.onstart = () => setIsListening(true)
    rec.onend = () => setIsListening(false)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const results = Array.from(e.results)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    setIsSpeaking(false)
  }, [])

  return {
    messages,
    isListening,
    isThinking,
    isSpeaking,
    transcript,
    currentAgent,
    voiceReady,
    sendMessage,
    startListening,
    stopListening,
    stopSpeaking,
  }
}
