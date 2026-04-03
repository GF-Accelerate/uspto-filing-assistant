import { useState } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { usePortfolio }  from '@/hooks/usePortfolio'
import { useWizard }     from '@/hooks/useWizard'
import { useAuth }       from '@/hooks/useAuth'
import { Dashboard }     from '@/pages/Dashboard'
import { Wizard }        from '@/pages/Wizard'
import { Drawings }      from '@/pages/Drawings'
import { Deadlines }     from '@/pages/Deadlines'
import { Guide }         from '@/pages/Guide'
import { Downloads }      from '@/pages/Downloads'
import { Legal }          from '@/pages/Legal'
import { Trademark }      from '@/pages/Trademark'
import { PriorArt }       from '@/pages/PriorArt'
import { AuthModal }      from '@/components/auth/AuthModal'
import { UserMenu }       from '@/components/auth/UserMenu'
import { VoiceAssistant } from '@/components/voice/VoiceAssistant'
import { daysUntil }     from '@/lib/uspto'

export default function App() {
  const { portfolio, markFiled } = usePortfolio()
  const wizardCtx  = useWizard()
  const auth       = useAuth()
  const navigate   = useNavigate()
  const pa1Days    = daysUntil('2027-03-28')
  const [showAuth, setShowAuth] = useState(false)

  const handleOpen = (id: string) => {
    wizardCtx.open(id)
    navigate('/wizard')
  }

  // Split nav into primary (always visible) and secondary (overflow menu)
  const primaryNav = [
    { to: '/',           label: 'Portfolio'      },
    { to: '/wizard',     label: 'Wizard'         },
    { to: '/drawings',   label: 'Drawings'       },
    { to: '/downloads',  label: 'Downloads'      },
    { to: '/deadlines',  label: 'Deadlines'      },
  ] as const

  const secondaryNav = [
    { to: '/legal',      label: '📄 Legal Docs'  },
    { to: '/trademark',  label: '™ Trademarks'   },
    { to: '/prior-art',  label: '🔬 Prior Art'   },
    { to: '/guide',      label: 'USPTO Guide'    },
  ] as const

  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Header: single responsive row ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-2 h-11">
          {/* Logo + title */}
          <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-xs flex-shrink-0">⚖</div>
          <span className="font-medium text-sm text-slate-800 hidden md:block whitespace-nowrap">Patent Filing</span>

          {/* Primary nav */}
          <nav className="flex gap-0.5 ml-1">
            {primaryNav.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'}
                className={({ isActive }) =>
                  `px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* More menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="px-2.5 py-1 rounded text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              More ▾
            </button>
            {moreOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setMoreOpen(false)} />
                <div style={{ position: 'absolute', left: 0, top: '100%', marginTop: 4, zIndex: 50, minWidth: 160 }}
                  className="bg-white border border-slate-200 rounded-xl shadow-sm py-1">
                  {secondaryNav.map(({ to, label }) => (
                    <NavLink key={to} to={to}
                      onClick={() => setMoreOpen(false)}
                      className={({ isActive }) =>
                        `block px-4 py-2 text-xs font-medium transition-colors ${
                          isActive
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`
                      }
                    >
                      {label}
                    </NavLink>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex-1" />

          <UserMenu auth={auth} onShowLogin={() => setShowAuth(true)} />
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0 hidden sm:block">
            PATENT PENDING
          </span>
        </div>

        {/* ── Warning / status bar — separate slim row ── */}
        <div className="bg-amber-50 border-t border-amber-200 px-4 py-1 flex items-center gap-3 flex-wrap text-xs text-amber-800">
          <span>
            <strong>USPTO requires ID.me + MFA to file</strong> — this app prepares all documents; you log in and click Submit.
          </span>
          {pa1Days !== null && pa1Days < 365 && (
            <span className="font-semibold text-red-700 flex-shrink-0">
              ⚠ PA-1 deadline: {pa1Days}d
            </span>
          )}
          {auth.isAuthenticated && (
            <span className="text-green-700 font-medium flex-shrink-0">
              ✓ Cloud synced
            </span>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-5">
        <Routes>
          <Route path="/"           element={<Dashboard portfolio={portfolio} onOpen={handleOpen} />} />
          <Route path="/wizard"     element={<Wizard ctx={wizardCtx} portfolio={portfolio} onMarkFiled={markFiled} />} />
          <Route path="/drawings"   element={<Drawings />} />
          <Route path="/deadlines"  element={<Deadlines />} />
          <Route path="/downloads"  element={<Downloads />} />
          <Route path="/legal"      element={<Legal />} />
          <Route path="/trademark"  element={<Trademark />} />
          <Route path="/prior-art"  element={<PriorArt />} />
          <Route path="/guide"      element={<Guide />} />
        </Routes>
      </main>

      {showAuth && <AuthModal auth={auth} onClose={() => setShowAuth(false)} />}

      {/* Voice AI Assistant — floating panel, always available */}
      <VoiceAssistant />
    </div>
  )
}
