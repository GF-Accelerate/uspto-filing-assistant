// MPCB — Multi-Provider Communication Bus (PA-5 Component 400)
// Abstracts TTS/STT providers with failover capability.
// Currently: Web Speech API only. Ready for cloud provider failover.

// ── TTS Provider interface ─────────────────────────────────────────────────

export interface TTSProvider {
  name: string
  available: boolean
  speak: (text: string, voice: SpeechSynthesisVoice | null, callbacks: TTSCallbacks) => void
  cancel: () => void
}

export interface TTSCallbacks {
  onStart: () => void
  onEnd: () => void
  onError: () => void
}

// ── Web Speech TTS provider ────────────────────────────────────────────────

export function createWebSpeechTTS(): TTSProvider {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null

  return {
    name: 'WebSpeech',
    available: !!synth,

    speak(text: string, voice: SpeechSynthesisVoice | null, callbacks: TTSCallbacks) {
      if (!synth) { callbacks.onError(); return }
      synth.cancel()

      // Chrome 15-second bug workaround: chunk long text into sentences
      if (text.length > 200) {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
        let idx = 0

        const speakNext = () => {
          if (idx >= sentences.length) { callbacks.onEnd(); return }
          const utt = createUtterance(sentences[idx].trim(), voice)
          utt.onstart = () => callbacks.onStart()
          utt.onend = () => { idx++; speakNext() }
          utt.onerror = () => callbacks.onError()
          synth.speak(utt)
        }

        callbacks.onStart()
        speakNext()
      } else {
        const utt = createUtterance(text, voice)
        utt.onstart = () => callbacks.onStart()
        utt.onend = () => callbacks.onEnd()
        utt.onerror = () => callbacks.onError()
        synth.speak(utt)
      }
    },

    cancel() {
      synth?.cancel()
    },
  }
}

function createUtterance(text: string, voice: SpeechSynthesisVoice | null): SpeechSynthesisUtterance {
  const utt = new SpeechSynthesisUtterance(text)
  utt.rate = 1.05
  utt.pitch = 1.05
  utt.volume = 1.0
  if (voice) utt.voice = voice
  return utt
}

// ── STT Provider interface ─────────────────────────────────────────────────

export interface STTProvider {
  name: string
  available: boolean
  start: (callbacks: STTCallbacks, options?: STTOptions) => void
  stop: () => void
  abort: () => void
}

export interface STTOptions {
  continuous?: boolean
}

export interface STTCallbacks {
  onStart: () => void
  onEnd: () => void
  onResult: (text: string, isFinal: boolean) => void
  onError: () => void
}

// ── Web Speech STT provider ────────────────────────────────────────────────

export function createWebSpeechSTT(): STTProvider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = typeof window !== 'undefined' ? window as any : null
  const RecognitionClass = win?.SpeechRecognition ?? win?.webkitSpeechRecognition
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recognition: any = null

  return {
    name: 'WebSpeech',
    available: !!RecognitionClass,

    start(callbacks: STTCallbacks, options?: STTOptions) {
      if (!RecognitionClass) {
        callbacks.onError()
        return
      }

      if (recognition) recognition.abort()

      recognition = new RecognitionClass()
      recognition.continuous = options?.continuous ?? false
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => callbacks.onStart()
      recognition.onend = () => callbacks.onEnd()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (e: any) => {
        const results = Array.from(e.results)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const text = results.map((r: any) => r[0].transcript).join('')
        const isFinal = e.results[e.results.length - 1].isFinal
        callbacks.onResult(text, isFinal)
      }

      recognition.onerror = () => callbacks.onError()
      recognition.start()
    },

    stop() {
      recognition?.stop()
    },

    abort() {
      recognition?.abort()
    },
  }
}

// ── Provider bus — manages failover ────────────────────────────────────────

export interface CommunicationBus {
  tts: TTSProvider
  stt: STTProvider
}

export function createDefaultBus(): CommunicationBus {
  return {
    tts: createWebSpeechTTS(),
    stt: createWebSpeechSTT(),
  }
}
