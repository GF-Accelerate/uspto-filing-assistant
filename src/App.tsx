import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { usePortfolio }  from '@/hooks/usePortfolio'
import { useWizard }     from '@/hooks/useWizard'
import { useAuth }       from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useFeatureFlags } from '@/hooks/useFeatureFlags'
import { Dashboard }     from '@/pages/Dashboard'
import { Wizard }        from '@/pages/Wizard'
import { Drawings }      from '@/pages/Drawings'
import { Deadlines }     from '@/pages/Deadlines'
import { Guide }         from '@/pages/Guide'
import { Downloads }      from '@/pages/Downloads'
import { Legal }          from '@/pages/Legal'
import { Trademark }      from '@/pages/Trademark'
import { PriorArt }       from '@/pages/PriorArt'
import { FilingPackage }  from '@/pages/FilingPackage'
import { Calendar }       from '@/pages/Calendar'
import { Settings }       from '@/pages/Settings'
import { Strategy }       from '@/pages/Strategy'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { PatentOverview } from '@/pages/admin/PatentOverview'
import { AuditLog }       from '@/pages/admin/AuditLog'
import { FeatureFlags }   from '@/pages/admin/FeatureFlags'
import { DrawingCompliance } from '@/pages/admin/DrawingCompliance'
import { HermesAudit }    from '@/pages/admin/HermesAudit'
import { AuthModal }      from '@/components/auth/AuthModal'
import { UserMenu }       from '@/components/auth/UserMenu'
import { VoiceAssistant } from '@/components/voice/VoiceAssistant'
import { daysUntil }     from '@/lib/uspto'

export default function App() {
  const { portfolio, markFiled } = usePortfolio()
  const wizardCtx  = useWizard()
  const auth       = useAuth()
  const { isAdmin } = useUserProfile()
  const navigate   = useNavigate()
  const { isEnabled } = useFeatureFlags()
  const pa1Days    = daysUntil('2027-04-03')
  const [showAuth, setShowAuth] = useState(false)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('uspto-dark-mode') === 'true')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('uspto-dark-mode', String(darkMode))
  }, [darkMode])

  const handleOpen = (id: string) => {
    wizardCtx.open(id)
    navigate('/wizard')
  }

  const primaryNav = [
    { to: '/',           label: 'Portfolio'      },
    { to: '/wizard',     label: 'Wizard'         },
    ...(isEnabled('filing_package_enabled') ? [{ to: '/filing-package', label: 'Filing Pkg' }]  : []),
    { to: '/calendar',   label: 'Calendar'       },
    { to: '/downloads',  label: 'Downloads'      },
    ...(isEnabled('drawing_generator_enabled') ? [{ to: '/drawings', label: 'Drawings' }]  : []),
  ]

  const secondaryNav = [
    { to: '/deadlines',  label: 'Deadlines'      },
    ...(isEnabled('legal_docs_enabled')       ? [{ to: '/legal',     label: 'Legal Docs' }]  : []),
    ...(isEnabled('trademark_module_enabled') ? [{ to: '/trademark', label: 'Trademarks' }]  : []),
    ...(isEnabled('prior_art_search_enabled') ? [{ to: '/prior-art', label: 'Prior Art' }]   : []),
    ...(isEnabled('strategy_docs_enabled')  ? [{ to: '/strategy',  label: 'Strategy' }]    : []),
    { to: '/settings',   label: 'Settings'       },
    { to: '/guide',      label: 'USPTO Guide'    },
  ]

  const adminNav = [
    { to: '/admin',                    label: 'Dashboard'     },
    { to: '/admin/patents',            label: 'Patents'       },
    { to: '/admin/audit',              label: 'Audit Log'     },
    { to: '/admin/flags',              label: 'Feature Flags' },
    ...(isEnabled('drawing_compliance_enabled')
      ? [{ to: '/admin/drawing-compliance', label: 'Drawing Compliance' }]
      : []),
    ...(isEnabled('hermes_agent_enabled')
      ? [{ to: '/admin/hermes-audit', label: 'Hermes Audit' }]
      : []),
  ]

  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans dark:text-slate-100">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-2 h-11">
          <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-xs flex-shrink-0">⚖</div>
          <span className="font-medium text-sm text-slate-800 hidden md:block whitespace-nowrap">Patent Filing</span>

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
                <div style={{ position: 'absolute', left: 0, top: '100%', marginTop: 4, zIndex: 50, minWidth: 180 }}
                  className="bg-white border border-slate-200 rounded-xl shadow-sm py-1">
                  {secondaryNav.map(({ to, label }) => (
                    <NavLink key={to} to={to}
                      onClick={() => setMoreOpen(false)}
                      className={({ isActive }) =>
                        `block px-4 py-2 text-xs font-medium transition-colors ${
                          isActive ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'
                        }`
                      }
                    >
                      {label}
                    </NavLink>
                  ))}
                  {(isAdmin || isEnabled('admin_console_enabled')) && (
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <div className="px-4 py-1 text-xs text-slate-400 font-medium">Admin</div>
                    {adminNav.map(({ to, label }) => (
                      <NavLink key={to} to={to}
                        onClick={() => setMoreOpen(false)}
                        className={({ isActive }) =>
                          `block px-4 py-2 text-xs font-medium transition-colors ${
                            isActive ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:bg-slate-50'
                          }`
                        }
                      >
                        {label}
                      </NavLink>
                    ))}
                  </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex-1" />

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-2 py-1 rounded text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? 'Light' : 'Dark'}
          </button>
          <UserMenu auth={auth} onShowLogin={() => setShowAuth(true)} />
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0 hidden sm:block">
            PATENT PENDING
          </span>
        </div>

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
          <Route path="/filing-package" element={<FilingPackage />} />
          <Route path="/calendar"   element={<Calendar />} />
          <Route path="/settings"   element={<Settings />} />
          <Route path="/legal"      element={<Legal />} />
          <Route path="/trademark"  element={<Trademark />} />
          <Route path="/prior-art"  element={<PriorArt />} />
          <Route path="/strategy"  element={<Strategy />} />
          <Route path="/guide"      element={<Guide />} />
          {/* Admin routes */}
          <Route path="/admin"          element={<AdminDashboard />} />
          <Route path="/admin/patents"  element={<PatentOverview />} />
          <Route path="/admin/audit"    element={<AuditLog />} />
          <Route path="/admin/flags"    element={<FeatureFlags />} />
          <Route path="/admin/drawing-compliance" element={<DrawingCompliance />} />
          <Route path="/admin/hermes-audit" element={<HermesAudit />} />
        </Routes>
      </main>

      {showAuth && <AuthModal auth={auth} onClose={() => setShowAuth(false)} />}

      {/* Voice AI Assistant — floating panel, gated by feature flag */}
      {isEnabled('voice_assistant_enabled') && <VoiceAssistant />}
    </div>
  )
}
