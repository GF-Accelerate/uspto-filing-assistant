// useVoiceAssistant — PA-5 VADI-aligned voice pipeline
// VQE (voice capture + context) → AEF (agent routing + execution) → HAL (approval gate) → MPCB (TTS/STT)
// Refactored from flat implementation to modular VADI primitives.

import { useState, useRef, useCallback, useEffect } from 'react'
import type { AgentRole, VoiceAction } from '@/lib/vadi/aef'
import { routeIntent, callAgent } from '@/lib/vadi/aef'
import { selectAmericanFemaleVoice, emptyContext, updateContext, contextToPrompt, extractPatentIds } from '@/lib/vadi/vqe'
import type { ConversationContext } from '@/lib/vadi/vqe'
import { requiresApproval, createApprovalRequest, approveRequest, logApproval } from '@/lib/vadi/hal'
import type { ApprovalRequest } from '@/lib/vadi/hal'
import { createDefaultBus } from '@/lib/vadi/mpcb'
import type { CommunicationBus } from '@/lib/vadi/mpcb'

export type { AgentRole } from '@/lib/vadi/aef'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  agent?: AgentRole
  timestamp: Date
  actions?: VoiceAction[]
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useVoiceAssistant() {
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    role: 'assistant',
    text: "Hi Milton! I'm your Patent Filing Assistant. I can help with deadlines, documents, filing steps, and your patent portfolio. Ask me anything — or tap the mic to speak. Try: \"File PA-5 for me\" or \"What's my next deadline?\"",
    agent: 'general',
    timestamp: new Date(),
  }])
  const [isListening, setIsListening] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [currentAgent, setCurrentAgent] = useState<AgentRole>('general')
  const [voiceReady, setVoiceReady] = useState(false)
  const [pendingApproval, setPendingApproval] = useState<ApprovalRequest | null>(null)

  // VADI modules
  const busRef = useRef<CommunicationBus | null>(null)
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const contextRef = useRef<ConversationContext>(emptyContext())

  // Action callback — set by the parent component to handle navigation
  const actionCallbackRef = useRef<((action: VoiceAction) => void) | null>(null)

  const setActionCallback = useCallback((cb: (action: VoiceAction) => void) => {
    actionCallbackRef.current = cb
  }, [])

  // ── Initialize MPCB (TTS/STT providers) ──────────────────────────────
  useEffect(() => {
    const bus = createDefaultBus()
    busRef.current = bus

    // Initialize voice selection
    const synth = window.speechSynthesis
    if (!synth) return

    const loadVoices = () => {
      const voices = synth.getVoices()
      if (voices.length === 0) return

      const selected = selectAmericanFemaleVoice(voices)
      selectedVoiceRef.current = selected
      setVoiceReady(true)

      if (selected) {
        console.log(`[VADI/MPCB] Selected voice: "${selected.name}" (${selected.lang})`)
      }
    }

    loadVoices()
    synth.onvoiceschanged = loadVoices

    return () => { synth.onvoiceschanged = null }
  }, [])

  // ── MPCB: Speak via TTS provider ─────────────────────────────────────
  const speak = useCallback((text: string) => {
    const bus = busRef.current
    if (!bus) return

    bus.tts.cancel()
    bus.tts.speak(text, selectedVoiceRef.current, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    })
  }, [])

  // ── HAL: Execute action after approval ─────────────────────────────
  const executeAction = useCallback((action: VoiceAction) => {
    if (actionCallbackRef.current) {
      actionCallbackRef.current(action)
    }
  }, [])

  const handleApproval = useCallback((approved: boolean) => {
    if (!pendingApproval) return

    const resolved = approved
      ? approveRequest(pendingApproval)
      : { ...pendingApproval, status: 'denied' as const, resolvedAt: new Date().toISOString() }

    logApproval(resolved)

    if (approved) {
      executeAction(pendingApproval.action)
      speak(`Okay, ${pendingApproval.description.toLowerCase()}.`)
    } else {
      speak('Action cancelled.')
    }

    setPendingApproval(null)
  }, [pendingApproval, executeAction, speak])

  // ── Main message pipeline: VQE → AEF → HAL → MPCB ──────────────────
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return

    // Stop speech before processing
    busRef.current?.tts.cancel()
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
      // VQE: Extract patent mentions and update context
      const mentionedPatents = extractPatentIds(text)
      if (mentionedPatents.length > 0) {
        contextRef.current = {
          ...contextRef.current,
          currentPatentId: mentionedPatents[mentionedPatents.length - 1],
          mentionedPatents: [...new Set([...contextRef.current.mentionedPatents, ...mentionedPatents])].slice(-5),
        }
      }

      // AEF: Route to agent
      const agent = await routeIntent(text)
      setCurrentAgent(agent)

      // VQE: Update context with agent role
      contextRef.current = updateContext(contextRef.current, text, agent)
      const ctxPrompt = contextToPrompt(contextRef.current)

      // AEF: Call agent with context
      const response = await callAgent(
        agent,
        text,
        [...messages, userMsg].map(m => ({ role: m.role, text: m.text })),
        ctxPrompt,
      )

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response.text,
        agent,
        timestamp: new Date(),
        actions: response.actions,
      }
      setMessages(prev => [...prev, assistantMsg])

      // HAL: Check actions for approval requirement
      for (const action of response.actions) {
        if (requiresApproval(action)) {
          const request = createApprovalRequest(action)
          setPendingApproval(request)
          // Speak the response but don't execute until approved
          speak(response.text)
          return
        } else {
          // Auto-approved actions execute immediately
          executeAction(action)
        }
      }

      // MPCB: Speak response
      speak(response.text)
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
  }, [messages, speak, executeAction])

  // ── MPCB: STT controls ──────────────────────────────────────────────
  const startListening = useCallback(() => {
    busRef.current?.tts.cancel()
    setIsSpeaking(false)

    const bus = busRef.current
    if (!bus || !bus.stt.available) {
      alert('Voice input requires Chrome or Edge. Please type your question.')
      return
    }

    bus.stt.start({
      onStart: () => setIsListening(true),
      onEnd: () => setIsListening(false),
      onResult: (text, isFinal) => {
        setTranscript(text)
        if (isFinal) sendMessage(text)
      },
      onError: () => setIsListening(false),
    })
  }, [sendMessage])

  const stopListening = useCallback(() => {
    busRef.current?.stt.stop()
    setIsListening(false)
  }, [])

  const stopSpeaking = useCallback(() => {
    busRef.current?.tts.cancel()
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
    pendingApproval,
    sendMessage,
    startListening,
    stopListening,
    stopSpeaking,
    handleApproval,
    setActionCallback,
  }
}
