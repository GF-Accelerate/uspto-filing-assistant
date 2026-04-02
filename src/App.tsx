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
import { AuthModal }     from '@/components/auth/AuthModal'
import { UserMenu }      from '@/components/auth/UserMenu'
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

  const navLinks = [
    { to: '/',          label: 'Portfolio'      },
    { to: '/wizard',    label: 'Filing Wizard'  },
    { to: '/drawings',  label: '📐 Drawings'    },
    { to: '/deadlines', label: 'Deadlines'      },
    { to: '/downloads', label: '📥 Downloads'   },
    { to: '/legal',     label: '📄 Legal Docs'  },
    { to: '/trademark', label: '™ Trademarks'   },
    { to: '/guide',     label: 'USPTO Guide'    },
  ] as const

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-5 flex items-center gap-3 h-12">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-sm flex-shrink-0">⚖</div>
          <span className="font-medium text-sm text-slate-800 flex-1">USPTO Patent Filing Assistant</span>
          <nav className="flex gap-0.5">
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-800 font-medium'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <UserMenu auth={auth} onShowLogin={() => setShowAuth(true)} />
          <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium flex-shrink-0">
            PATENT PENDING
          </span>
        </div>
      </header>

      <div className="bg-amber-50 border-b border-amber-200 px-5 py-1.5 text-xs text-amber-800">
        <strong>Authentication required:</strong> Patent Center requires ID.me biometric verification + MFA —
        this tool prepares all documents, you must log in and click Submit.
        {pa1Days !== null && pa1Days < 365 && (
          <span className="ml-3 font-semibold text-red-700">
            ⚠ PA-1 nonprovisional deadline: {pa1Days} days remaining
          </span>
        )}
        {auth.isAuthenticated && (
          <span className="ml-3 text-green-700 font-medium">
            ✓ Signed in — portfolio synced to cloud
          </span>
        )}
      </div>

      <main className="max-w-5xl mx-auto px-5 py-5">
        <Routes>
          <Route path="/"          element={<Dashboard portfolio={portfolio} onOpen={handleOpen} />} />
          <Route path="/wizard"    element={<Wizard ctx={wizardCtx} portfolio={portfolio} onMarkFiled={markFiled} />} />
          <Route path="/drawings"  element={<Drawings />} />
          <Route path="/deadlines" element={<Deadlines />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/legal"     element={<Legal />} />
          <Route path="/trademark" element={<Trademark />} />
          <Route path="/guide"     element={<Guide />} />
        </Routes>
      </main>

      {showAuth && <AuthModal auth={auth} onClose={() => setShowAuth(false)} />}
    </div>
  )
}
