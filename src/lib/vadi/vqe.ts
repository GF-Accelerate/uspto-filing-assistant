// VQE — Voice-to-Query Engine (PA-5 Component 200)
// Standardized pipeline: audio capture → NLP intent → semantic mapping → query
// This module handles the STT and voice selection layers of the pipeline.

// ── Voice configuration ────────────────────────────────────────────────────

const PREFERRED_VOICES_PRIORITY = [
  'Microsoft Aria Online (Natural)',
  'Microsoft Jenny Online (Natural)',
  'Google US English',
  'Samantha',
  'Karen',
  'Microsoft Zira',
  'Microsoft Aria',
  'Google US English Female',
]

export function selectAmericanFemaleVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  for (const preferred of PREFERRED_VOICES_PRIORITY) {
    const match = voices.find(v => v.name.includes(preferred))
    if (match) return match
  }

  const usEnglish = voices.filter(v => v.lang === 'en-US' || v.lang === 'en_US')
  if (usEnglish.length > 0) {
    const femaleHints = ['female', 'woman', 'zira', 'aria', 'jenny', 'samantha', 'salli', 'joanna', 'kendra', 'ivy']
    const female = usEnglish.find(v =>
      femaleHints.some(h => v.name.toLowerCase().includes(h))
    )
    if (female) return female
    return usEnglish[0]
  }

  const anyEnglish = voices.find(v => v.lang.startsWith('en'))
  if (anyEnglish) return anyEnglish

  return voices[0] || null
}

// ── Conversation context for multi-turn resolution ─────────────────────────

export interface ConversationContext {
  currentPatentId: string | null   // The patent currently being discussed
  lastAction: string | null        // Last suggested action ("file PA-5", "download spec")
  mentionedPatents: string[]       // All patents mentioned in recent conversation
  currentTopic: string | null      // High-level topic being discussed
}

export function emptyContext(): ConversationContext {
  return { currentPatentId: null, lastAction: null, mentionedPatents: [], currentTopic: null }
}

// Extract patent IDs from text (PA-1 through PA-7)
export function extractPatentIds(text: string): string[] {
  const matches = text.match(/PA-[1-7]/gi) || []
  return [...new Set(matches.map(m => m.toUpperCase()))]
}

// Update context after a message exchange
export function updateContext(ctx: ConversationContext, userText: string, agentRole: string): ConversationContext {
  const mentioned = extractPatentIds(userText)
  const allMentioned = [...new Set([...ctx.mentionedPatents, ...mentioned])].slice(-5)

  return {
    currentPatentId: mentioned.length > 0 ? mentioned[mentioned.length - 1] : ctx.currentPatentId,
    lastAction: detectAction(userText) ?? ctx.lastAction,
    mentionedPatents: allMentioned,
    currentTopic: agentRole,
  }
}

function detectAction(text: string): string | null {
  const lower = text.toLowerCase()
  if (lower.includes('file') || lower.includes('filing')) return 'file'
  if (lower.includes('download') || lower.includes('generate') || lower.includes('docx')) return 'generate'
  if (lower.includes('deadline') || lower.includes('when') || lower.includes('due')) return 'check-deadline'
  if (lower.includes('status') || lower.includes('how many')) return 'check-status'
  return null
}

// ── Wake word detection ─────────────────────────────────────────────────────

const WAKE_PHRASES = ['hey patent', 'patent assistant', 'hey assistant', 'ok patent']

export function detectWakeWord(transcript: string): { detected: boolean; cleanedText: string } {
  const lower = transcript.toLowerCase().trim()
  for (const phrase of WAKE_PHRASES) {
    if (lower.startsWith(phrase)) {
      const cleaned = transcript.slice(phrase.length).trim()
      return { detected: true, cleanedText: cleaned || '' }
    }
  }
  return { detected: false, cleanedText: transcript }
}

// Build context injection string for agent prompts
export function contextToPrompt(ctx: ConversationContext): string {
  const parts: string[] = []
  if (ctx.currentPatentId) parts.push(`Currently discussing: ${ctx.currentPatentId}`)
  if (ctx.lastAction) parts.push(`User's recent intent: ${ctx.lastAction}`)
  if (ctx.mentionedPatents.length > 0) parts.push(`Patents mentioned: ${ctx.mentionedPatents.join(', ')}`)
  if (parts.length === 0) return ''
  return `\nCONVERSATION CONTEXT:\n${parts.join('\n')}\nUse this context to resolve pronouns like "that one", "it", "this patent" to the correct patent.\n`
}
