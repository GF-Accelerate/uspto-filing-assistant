// VoiceAssistant — floating voice AI panel (PA-5 VADI aligned)
// Pipeline: VQE (capture) → AEF (agents) → HAL (approval) → MPCB (speak)
// Agents: deadline | document | filing | portfolio | claims | workflow | general

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVoiceAssistant, type AgentRole } from '@/hooks/useVoiceAssistant'

const AGENT_LABELS: Record<AgentRole, { label: string; color: string }> = {
  deadline:  { label: '⏰ Deadline',  color: 'text-red-700'    },
  document:  { label: '📄 Document',  color: 'text-blue-700'   },
  filing:    { label: '📋 Filing',    color: 'text-indigo-700' },
  portfolio: { label: '🗂 Portfolio',  color: 'text-violet-700' },
  claims:    { label: '⚖️ Claims',    color: 'text-amber-700'  },
  workflow:  { label: '🚀 Workflow',  color: 'text-emerald-700' },
  strategy:  { label: '📊 Strategy', color: 'text-teal-700'   },
  general:   { label: '🏛 USPTO',     color: 'text-slate-700'  },
}

export function VoiceAssistant() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const {
    messages, isListening, isThinking, isSpeaking, transcript,
    currentAgent, voiceReady, pendingApproval, handsFree, wakeWordActive,
    sendMessage, startListening, stopListening, stopSpeaking,
    handleApproval, setActionCallback, toggleHandsFree,
  } = useVoiceAssistant()

  // Wire up action callbacks for navigation and feature execution
  useEffect(() => {
    setActionCallback((action) => {
      switch (action.type) {
        case 'OPEN_WIZARD':
          navigate('/wizard')
          break
        case 'OPEN_FILING_PACKAGE':
          navigate('/filing-package')
          break
        case 'NAVIGATE':
          navigate(action.payload)
          break
        case 'GENERATE_DOC':
          navigate('/filing-package')
          break
        case 'OPEN_DRAWINGS':
          navigate('/drawings')
          break
        case 'OPEN_PRIOR_ART':
          navigate('/prior-art')
          break
        case 'OPEN_LEGAL':
          navigate('/legal')
          break
        case 'OPEN_TRADEMARK':
          navigate('/trademark')
          break
        case 'OPEN_CALENDAR':
          navigate('/calendar')
          break
        case 'OPEN_SETTINGS':
          navigate('/settings')
          break
        case 'OPEN_ADMIN':
          navigate('/admin')
          break
        case 'TOGGLE_DARK_MODE':
          document.documentElement.classList.toggle('dark')
          localStorage.setItem('dark-mode',
            document.documentElement.classList.contains('dark') ? 'true' : 'false')
          break
        case 'RUN_PRIOR_ART_SEARCH':
          navigate(`/prior-art?q=${encodeURIComponent(action.payload)}`)
          break
        case 'GENERATE_LEGAL_DOC':
          navigate(`/legal?type=${encodeURIComponent(action.payload)}`)
          break
        case 'RUN_TRADEMARK_SEARCH':
          navigate(`/trademark?q=${encodeURIComponent(action.payload)}`)
          break
        case 'RENDER_DRAWINGS':
          window.dispatchEvent(new CustomEvent('voice-action', { detail: { type: 'RENDER_DRAWINGS' } }))
          break
        case 'DOWNLOAD_DRAWING':
          window.dispatchEvent(new CustomEvent('voice-action', { detail: { type: 'DOWNLOAD_DRAWING', payload: action.payload } }))
          break
        case 'ADD_CUSTOM_DRAWING':
          window.dispatchEvent(new CustomEvent('voice-action', { detail: { type: 'ADD_CUSTOM_DRAWING' } }))
          break
        case 'DOWNLOAD_ALL_DRAWINGS':
          window.dispatchEvent(new CustomEvent('voice-action', { detail: { type: 'DOWNLOAD_ALL_DRAWINGS' } }))
          break
        case 'DOWNLOAD_SPEC':
          navigate(`/downloads?generate=${encodeURIComponent(action.payload)}`)
          break
      }
    })
  }, [navigate, setActionCallback])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking, pendingApproval])

  const handleSend = () => {
    if (!input.trim()) return
    sendMessage(input)
    setInput('')
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const agentMeta = AGENT_LABELS[currentAgent]

  return (
    <>
      {/* ── Floating trigger button ──────────────────────────────── */}
      <button
        onClick={() => { setOpen(!open); stopSpeaking() }}
        title="Patent AI Assistant"
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 200,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: isListening
            ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
            : isSpeaking
            ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
            : handsFree
            ? 'linear-gradient(135deg, #059669, #10b981)'
            : 'linear-gradient(135deg, #1e3a5f, #2563eb)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          boxShadow: isListening
            ? '0 0 0 4px rgba(220,38,38,0.3), 0 4px 16px rgba(0,0,0,0.25)'
            : isSpeaking
            ? '0 0 0 4px rgba(124,58,237,0.3), 0 4px 16px rgba(0,0,0,0.25)'
            : handsFree
            ? '0 0 0 4px rgba(16,185,129,0.3), 0 4px 16px rgba(0,0,0,0.25)'
            : '0 4px 16px rgba(0,0,0,0.2)',
          transition: 'all 0.2s',
          animation: isSpeaking ? 'speakPulse 1.5s ease-in-out infinite' : 'none',
        }}
      >
        {isListening ? '🔴' : isSpeaking ? '🔊' : handsFree ? '🟢' : open ? '✕' : '🎙️'}
      </button>

      {/* ── Assistant panel ──────────────────────────────────────── */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 82,
            right: 16,
            width: 380,
            maxWidth: 'calc(100vw - 32px)',
            height: 520,
            zIndex: 199,
            display: 'flex',
            flexDirection: 'column',
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            border: '1px solid rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 20 }}>⚖️</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Patent Filing Assistant</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
                Visionary AI Systems, Inc. — 7 patents
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontSize: 10,
                  padding: '2px 8px',
                  borderRadius: 99,
                  fontWeight: 500,
                }}>
                  {agentMeta.label}
                </span>
                {handsFree && (
                  <span style={{
                    background: 'rgba(16,185,129,0.3)',
                    color: '#6ee7b7',
                    fontSize: 9,
                    padding: '2px 6px',
                    borderRadius: 99,
                    fontWeight: 600,
                  }}>
                    HANDS-FREE
                  </span>
                )}
              </div>
              {isSpeaking && (
                <span style={{
                  background: 'rgba(124,58,237,0.3)',
                  color: '#e9d5ff',
                  fontSize: 9,
                  padding: '1px 6px',
                  borderRadius: 99,
                  fontWeight: 500,
                  animation: 'speakPulse 1.5s ease-in-out infinite',
                }}>
                  🔊 Speaking...
                </span>
              )}
              {!voiceReady && (
                <span style={{
                  background: 'rgba(239,68,68,0.3)',
                  color: '#fca5a5',
                  fontSize: 9,
                  padding: '1px 6px',
                  borderRadius: 99,
                }}>
                  Loading voice...
                </span>
              )}
            </div>
          </div>

          {/* Quick action pills */}
          <div style={{
            display: 'flex',
            gap: 6,
            padding: '8px 12px',
            overflowX: 'auto',
            borderBottom: '1px solid #f1f5f9',
            flexShrink: 0,
          }}>
            {[
              { label: '⏰ Deadlines', q: 'What are my most urgent patent deadlines?' },
              { label: '🚀 File PA-5', q: 'File PA-5 for me' },
              { label: '📄 Documents', q: 'Which documents do I need to upload to Patent Center?' },
              { label: '🔍 Prior Art', q: 'Open prior art search' },
              { label: '📝 Legal Docs', q: 'Open legal document generator' },
              { label: '🎨 Drawings', q: 'Open patent drawings' },
            ].map(({ label, q }) => (
              <button
                key={label}
                onClick={() => sendMessage(q)}
                style={{
                  flexShrink: 0,
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: 99,
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 500,
                  color: '#475569',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            {messages.map(msg => (
              <div key={msg.id} style={{
                display: 'flex',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                gap: 8,
                alignItems: 'flex-end',
              }}>
                {msg.role === 'assistant' && (
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: '#1e3a5f', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 13, flexShrink: 0,
                  }}>⚖️</div>
                )}
                <div style={{
                  maxWidth: '80%',
                  background: msg.role === 'user' ? '#2563eb' : '#f8fafc',
                  color: msg.role === 'user' ? '#fff' : '#1e293b',
                  borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                  padding: '8px 12px',
                  fontSize: 13,
                  lineHeight: 1.5,
                  border: msg.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
                }}>
                  {msg.role === 'assistant' && msg.agent && msg.agent !== 'general' && (
                    <div style={{
                      fontSize: 10,
                      fontWeight: 600,
                      marginBottom: 4,
                      color: AGENT_LABELS[msg.agent].color,
                    }}>
                      {AGENT_LABELS[msg.agent].label}
                    </div>
                  )}
                  {msg.text}
                </div>
              </div>
            ))}

            {/* HAL Approval prompt */}
            {pendingApproval && (
              <div style={{
                background: '#fffbeb',
                border: '1px solid #fbbf24',
                borderRadius: 12,
                padding: '10px 14px',
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#92400e', marginBottom: 6 }}>
                  ⚖️ Action requires approval
                </div>
                <div style={{ fontSize: 12, color: '#78350f', marginBottom: 8 }}>
                  {pendingApproval.description}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleApproval(true)}
                    style={{
                      padding: '4px 14px', borderRadius: 99, border: 'none',
                      background: '#059669', color: '#fff', fontSize: 11,
                      fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproval(false)}
                    style={{
                      padding: '4px 14px', borderRadius: 99,
                      border: '1px solid #d1d5db', background: '#fff',
                      color: '#6b7280', fontSize: 11, fontWeight: 500, cursor: 'pointer',
                    }}
                  >
                    Deny
                  </button>
                </div>
              </div>
            )}

            {/* Thinking indicator */}
            {isThinking && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: '#1e3a5f', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 13,
                }}>⚖️</div>
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px 14px 14px 14px',
                  padding: '10px 14px',
                  display: 'flex',
                  gap: 4,
                  alignItems: 'center',
                }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: '#94a3b8',
                      animation: 'pulse 1.2s ease-in-out infinite',
                      animationDelay: `${i * 0.2}s`,
                      display: 'inline-block',
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* Speaking indicator */}
            {isSpeaking && !isThinking && (
              <div style={{
                display: 'flex', gap: 8, alignItems: 'center',
                padding: '4px 8px',
              }}>
                <div style={{
                  display: 'flex', gap: 2, alignItems: 'flex-end', height: 16,
                }}>
                  {[0,1,2,3,4].map(i => (
                    <span key={i} style={{
                      width: 3,
                      background: '#7c3aed',
                      borderRadius: 2,
                      animation: 'soundWave 0.8s ease-in-out infinite',
                      animationDelay: `${i * 0.1}s`,
                      display: 'inline-block',
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: '#7c3aed', fontWeight: 500 }}>
                  Speaking...
                </span>
                <button
                  onClick={stopSpeaking}
                  style={{
                    fontSize: 10, color: '#94a3b8', background: 'none',
                    border: '1px solid #e2e8f0', borderRadius: 99,
                    padding: '2px 8px', cursor: 'pointer',
                  }}
                >
                  Stop
                </button>
              </div>
            )}

            {/* Interim transcript */}
            {transcript && (
              <div style={{
                fontSize: 12, color: '#94a3b8', fontStyle: 'italic',
                padding: '0 4px',
              }}>
                🎙️ {transcript}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Hands-free toggle + wake word hint */}
          <div style={{
            borderTop: '1px solid #f1f5f9',
            padding: '4px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            background: handsFree ? '#f0fdf4' : '#fff',
          }}>
            <button
              onClick={toggleHandsFree}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 10px',
                borderRadius: 99,
                border: handsFree ? '1px solid #16a34a' : '1px solid #e2e8f0',
                background: handsFree ? '#dcfce7' : '#f8fafc',
                color: handsFree ? '#15803d' : '#64748b',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 13 }}>{handsFree ? '🟢' : '🔘'}</span>
              Hands-free
            </button>
            {handsFree && wakeWordActive && (
              <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 500 }}>
                Listening... speak naturally
              </span>
            )}
            {handsFree && !wakeWordActive && !isSpeaking && !isThinking && (
              <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>
                Say "Hey Patent" or just speak
              </span>
            )}
          </div>

          {/* Input bar */}
          <div style={{
            borderTop: '1px solid #f1f5f9',
            padding: '10px 12px',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexShrink: 0,
            background: '#fff',
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about your patents..."
              style={{
                flex: 1,
                border: '1px solid #e2e8f0',
                borderRadius: 99,
                padding: '7px 14px',
                fontSize: 13,
                outline: 'none',
                background: '#f8fafc',
                color: '#1e293b',
              }}
            />

            {/* Send */}
            <button
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              style={{
                width: 34, height: 34, borderRadius: '50%',
                background: input.trim() && !isThinking ? '#2563eb' : '#e2e8f0',
                border: 'none', cursor: input.trim() && !isThinking ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: '#fff', flexShrink: 0, transition: 'all 0.15s',
              }}
            >
              ➤
            </button>

            {/* Voice */}
            <button
              onClick={isListening ? stopListening : isSpeaking ? stopSpeaking : startListening}
              disabled={isThinking}
              title={isListening ? 'Stop listening' : isSpeaking ? 'Stop speaking' : 'Speak your question'}
              style={{
                width: 34, height: 34, borderRadius: '50%',
                background: isListening ? '#dc2626' : isSpeaking ? '#7c3aed' : '#1e3a5f',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, flexShrink: 0, transition: 'all 0.15s',
                boxShadow: isListening
                  ? '0 0 0 3px rgba(220,38,38,0.3)'
                  : isSpeaking
                  ? '0 0 0 3px rgba(124,58,237,0.3)'
                  : 'none',
              }}
            >
              {isListening ? '⏹' : isSpeaking ? '🔊' : '🎙️'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1); }
        }
        @keyframes speakPulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        @keyframes soundWave {
          0%, 100% { height: 4px; }
          50% { height: 14px; }
        }
      `}</style>
    </>
  )
}
