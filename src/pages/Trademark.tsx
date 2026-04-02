/// <reference types="vite/client" />
import { useState, useCallback } from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'

// ── Your trademark portfolio ──────────────────────────────────────────────
const TRADEMARK_PORTFOLIO = [
  {
    id: 'tm1',
    mark: 'Voice First Athletics™',
    class: 42,
    classDesc: 'Software as a service (SaaS) for athletic department management',
    status: 'file-now',
    deadline: 'June 2026',
    fee: '$250',
    goods: 'AI-powered software for athletic department constituent management, donor cultivation, NCAA compliance monitoring, and voice-controlled database query processing',
    useInCommerce: true,
  },
  {
    id: 'tm2',
    mark: 'CSOS™',
    class: 42,
    classDesc: 'Constituent management system software',
    status: 'file-now',
    deadline: 'June 2026',
    fee: '$250',
    goods: 'Cloud-based constituent operating system software for athletic departments and sports organizations',
    useInCommerce: true,
  },
  {
    id: 'tm3',
    mark: 'VoiceDB™',
    class: 42,
    classDesc: 'Voice-controlled database software',
    status: 'file-soon',
    deadline: 'Q3 2026',
    fee: '$250',
    goods: 'Software for voice-controlled natural language database query and autonomous agent execution',
    useInCommerce: false,
  },
  {
    id: 'tm4',
    mark: 'AgentMail™',
    class: 38,
    classDesc: 'Electronic communication services',
    status: 'file-soon',
    deadline: 'Q3 2026',
    fee: '$250',
    goods: 'AI-powered multi-provider electronic communication and campaign delivery services',
    useInCommerce: false,
  },
  {
    id: 'tm5',
    mark: 'Visionary AI™',
    class: 42,
    classDesc: 'AI consulting and software',
    status: 'planned',
    deadline: 'Q4 2026',
    fee: '$250',
    goods: 'Artificial intelligence software development and consulting services',
    useInCommerce: true,
  },
]

const STATUS_META = {
  'file-now':  { label: 'File now', color: 'danger'  as const },
  'file-soon': { label: 'File Q3',  color: 'warning' as const },
  'filed':     { label: 'Filed ✓',  color: 'success' as const },
  'planned':   { label: 'Planned',  color: 'neutral' as const },
}

// NICE Classification reference
const NICE_CLASSES = [
  { n: 35, desc: 'Advertising, business management, retail services' },
  { n: 38, desc: 'Telecommunications and electronic communications' },
  { n: 41, desc: 'Education, entertainment, sports and cultural activities' },
  { n: 42, desc: 'Scientific and technological services, software as a service' },
  { n: 45, desc: 'Legal services, personal and social services' },
]

async function callClaude(system: string, user: string): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('API key not set')
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })
  const d = await res.json()
  if (d.error) throw new Error(d.error.message)
  return d.content?.[0]?.text ?? ''
}

export function Trademark() {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'search' | 'guide' | 'specimen'>('portfolio')
  const [searchMark, setSearchMark] = useState('')
  const [searchResult, setSearchResult] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [specimenMark, setSpecimenMark] = useState('')
  const [specimenGoods, setSpecimenGoods] = useState('')
  const [specimenResult, setSpecimenResult] = useState('')
  const [specimenLoading, setSpecimenLoading] = useState(false)
  const [portfolio, setPortfolio] = useState(TRADEMARK_PORTFOLIO)

  const analyzeConflicts = useCallback(async () => {
    if (!searchMark.trim()) return
    setSearchLoading(true)
    setSearchResult('')
    try {
      const result = await callClaude(
        'You are a trademark attorney conducting a preliminary trademark clearance search analysis. Provide a professional assessment. Be specific about potential conflicts and risks.',
        `Analyze trademark clearance for the mark "${searchMark}" in connection with AI software for athletic department management, voice-controlled database systems, and sports technology SaaS platforms (International Classes 38 and 42).

Provide:
1. LIKELIHOOD OF CONFUSION ANALYSIS: Common marks or terms that could conflict
2. DESCRIPTIVENESS RISK: Is this mark too descriptive or generic?
3. DISTINCTIVENESS RATING: (Arbitrary/Fanciful = strong, Suggestive = good, Descriptive = risky, Generic = not protectable)
4. RECOMMENDED CLASSES: Which Nice Classes to file in
5. SPECIMEN REQUIREMENTS: What specimen of use would be needed
6. OVERALL RECOMMENDATION: File as-is / Modify / High risk — with explanation
7. SEARCH RECOMMENDATION: Full professional search recommended before filing

Note: This is a preliminary AI analysis only. A full professional trademark search through Thomson CompuMark or similar service is required before filing.`
      )
      setSearchResult(result)
    } catch (e) {
      setSearchResult('Error: ' + (e as Error).message)
    }
    setSearchLoading(false)
  }, [searchMark])

  const generateSpecimen = useCallback(async () => {
    if (!specimenMark.trim() || !specimenGoods.trim()) return
    setSpecimenLoading(true)
    setSpecimenResult('')
    try {
      const result = await callClaude(
        'You are a trademark attorney advising on USPTO specimen requirements. Provide specific, actionable guidance.',
        `Advise on USPTO specimen requirements for the trademark "${specimenMark}" for use in connection with: ${specimenGoods}

Provide:
1. ACCEPTABLE SPECIMEN TYPES for this mark and goods/services
2. SPECIFIC EXAMPLES of what to capture (screenshots, photos, labels)
3. WHAT USPTO LOOKS FOR in a valid specimen
4. COMMON REJECTION REASONS to avoid
5. STEP-BY-STEP instructions to prepare your specimen
6. ITU vs USE-BASED: Should this be filed as Intent to Use or Use in Commerce?

Be very specific and practical.`
      )
      setSpecimenResult(result)
    } catch (e) {
      setSpecimenResult('Error: ' + (e as Error).message)
    }
    setSpecimenLoading(false)
  }, [specimenMark, specimenGoods])

  const markFiled = (id: string) => {
    setPortfolio(prev => prev.map(tm => tm.id === id ? { ...tm, status: 'filed' } : tm))
  }

  const totalFees = portfolio.filter(tm => tm.status !== 'filed').reduce((sum, tm) => sum + parseInt(tm.fee.replace('$', '')), 0)

  const tabs = [
    { id: 'portfolio', label: '📋 Portfolio' },
    { id: 'search',    label: '🔍 Clearance Search' },
    { id: 'guide',     label: '📝 TEAS Plus Guide' },
    { id: 'specimen',  label: '📸 Specimen Builder' },
  ] as const

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-medium text-slate-900 mb-1">Trademark Search & Registration</h2>
            <p className="text-sm text-slate-500">
              AI-powered trademark clearance, TEAS Plus filing guidance, and portfolio management for Visionary AI Systems Inc.
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-medium text-slate-900">${totalFees.toLocaleString()}</div>
            <div className="text-xs text-slate-400">estimated filing fees remaining</div>
          </div>
        </div>

        <div className="flex gap-1 mt-4 border-b border-slate-200">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={[
                'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2',
                activeTab === t.id
                  ? 'border-blue-500 text-blue-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* PORTFOLIO TAB */}
      {activeTab === 'portfolio' && (
        <div className="space-y-3">
          <Alert variant="danger">
            <strong>File by June 2026:</strong> "Voice First Athletics" and "CSOS" should be filed now while you have first-mover advantage and clear use in commerce.
          </Alert>

          {portfolio.map(tm => {
            const meta = STATUS_META[tm.status as keyof typeof STATUS_META]
            return (
              <Card key={tm.id}>
                <CardHeader
                  title={
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{tm.mark}</span>
                      <Badge variant={meta.color}>{meta.label}</Badge>
                      <Badge variant="neutral">Class {tm.class}</Badge>
                    </div>
                  }
                  right={
                    tm.status !== 'filed' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">{tm.fee} · {tm.deadline}</span>
                        <a href="https://trademarkcenter.uspto.gov" target="_blank" rel="noreferrer">
                          <Button size="sm" variant="primary">File via TEAS Plus ↗</Button>
                        </a>
                        <Button size="sm" onClick={() => markFiled(tm.id)}>Mark filed</Button>
                      </div>
                    ) : (
                      <Badge variant="success">✓ Filed</Badge>
                    )
                  }
                />
                <CardBody>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Nice Class {tm.class}</div>
                      <div className="text-slate-700">{tm.classDesc}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Use in commerce</div>
                      <div className="text-slate-700">{tm.useInCommerce ? '✓ In use — file as Use in Commerce' : '○ Intent to Use (ITU)'}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-slate-400 mb-1">Goods / Services description</div>
                      <div className="text-slate-700 text-xs leading-relaxed">{tm.goods}</div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )
          })}

          <Card>
            <CardHeader title="Nice Classification reference" />
            <CardBody>
              <div className="grid grid-cols-1 gap-2">
                {NICE_CLASSES.map(c => (
                  <div key={c.n} className="flex gap-3 text-sm py-1 border-b border-slate-100 last:border-0">
                    <span className="font-mono text-blue-600 w-8 flex-shrink-0">Class {c.n}</span>
                    <span className="text-slate-600">{c.desc}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* CLEARANCE SEARCH TAB */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          <Alert variant="info">
            AI preliminary analysis only. Always conduct a full professional search through Thomson CompuMark or similar before filing.
          </Alert>
          <Card>
            <CardHeader title="Preliminary trademark clearance analysis" />
            <CardBody>
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-600 mb-1">Trademark to analyze</label>
                <input
                  value={searchMark}
                  onChange={e => setSearchMark(e.target.value)}
                  placeholder="e.g., Voice First Athletics"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 mb-4">
                {['Voice First Athletics', 'CSOS', 'VoiceDB', 'AgentMail', 'Visionary AI'].map(mark => (
                  <button key={mark} onClick={() => setSearchMark(mark)}
                    className="text-xs px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-600">
                    {mark}
                  </button>
                ))}
              </div>
              <Button variant="primary" onClick={analyzeConflicts} disabled={searchLoading || !searchMark.trim()}>
                {searchLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing…
                  </span>
                ) : '🔍 Analyze clearance'}
              </Button>
              {searchResult && (
                <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-xs text-slate-700 leading-relaxed font-mono">{searchResult}</pre>
                </div>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Official search resources" />
            <CardBody>
              <div className="space-y-2">
                {[
                  { label: 'USPTO TESS (Trademark Electronic Search System)', url: 'https://tmsearch.uspto.gov', desc: 'Official free search — search exact marks and phonetic equivalents' },
                  { label: 'Trademark Center (TEAS Plus filing)', url: 'https://trademarkcenter.uspto.gov', desc: 'File your trademark application — $250 per class with TEAS Plus' },
                  { label: 'WIPO Global Brand Database', url: 'https://branddb.wipo.int', desc: 'Search international trademarks' },
                  { label: 'USPTO ID Manual (goods/services descriptions)', url: 'https://idm.uspto.gov', desc: 'Find accepted descriptions for your goods/services' },
                ].map(r => (
                  <div key={r.label} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                    <div className="flex-1">
                      <a href={r.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline font-medium">
                        {r.label} ↗
                      </a>
                      <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* TEAS PLUS GUIDE TAB */}
      {activeTab === 'guide' && (
        <div className="space-y-4">
          <Alert variant="info">
            TEAS Plus is the most cost-effective filing option at <strong>$250 per class</strong>. Requires selecting a pre-approved goods/services description from the USPTO ID Manual.
          </Alert>
          <Card>
            <CardHeader title="Step-by-step TEAS Plus filing guide" />
            <CardBody>
              {[
                { n: '1', title: 'Create USPTO.gov account', manual: true,
                  steps: ['Go to uspto.gov → MyUSPTO → Create account', 'Verify identity with ID.me (same account used for patents)', 'Set up Okta Verify MFA', 'Select role: "Trademark Owner" or "Authorized Signatory"'] },
                { n: '2', title: 'Run TESS search first', manual: true,
                  steps: ['Go to tmsearch.uspto.gov', 'Search your exact mark AND phonetic equivalents', 'Search for similar marks in your same class', 'Document your search results — examiner expects you did this'] },
                { n: '3', title: 'Open TEAS Plus application', manual: true,
                  steps: ['Go to trademarkcenter.uspto.gov', 'Click "Apply to register a trademark"', 'Select "TEAS Plus" (not TEAS Standard — costs more)', 'Enter your mark exactly as you use it'] },
                { n: '4', title: 'Classify goods/services', manual: true,
                  steps: ['Click "Add goods/services"', 'Search the ID Manual for your description', 'Use pre-approved descriptions only (required for TEAS Plus)', 'Select the correct Nice Class (42 for software, 38 for communications)'] },
                { n: '5', title: 'Upload specimen of use', manual: true,
                  steps: ['For software: screenshot showing mark on your actual software/website', 'Mark must be clearly visible and associated with the services', 'Not just a logo alone — must show mark in use with the services', 'File screenshot as JPG or PNG under 5MB'] },
                { n: '6', title: 'Pay and submit', manual: true,
                  steps: ['$250 per class (e.g., $500 for Classes 38 + 42)', 'Credit/debit card or deposit account', 'Save the serial number from your filing receipt', 'USPTO will send a filing receipt to your email'] },
                { n: '7', title: 'Monitor and respond', manual: false,
                  steps: ['USPTO review typically takes 8-12 months', 'Watch for Office Actions (you have 3 months to respond)', 'After approval: 30-day publication for opposition', 'If no opposition: registration certificate issued'] },
              ].map(step => (
                <div key={step.n} className={`border rounded-lg mb-3 overflow-hidden ${step.manual ? 'border-amber-200' : 'border-green-200'}`}>
                  <div className={`px-4 py-2 flex items-center gap-3 ${step.manual ? 'bg-amber-50' : 'bg-green-50'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step.manual ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'}`}>
                      {step.n}
                    </div>
                    <span className="font-medium text-sm text-slate-900">{step.title}</span>
                    {step.manual && <span className="ml-auto text-xs text-amber-700 font-medium">human action required</span>}
                  </div>
                  <div className="px-4 py-3">
                    {step.steps.map((s, i) => (
                      <div key={i} className="text-xs text-slate-700 py-1 flex gap-2">
                        <span className="text-slate-400 flex-shrink-0">{i + 1}.</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}

      {/* SPECIMEN BUILDER TAB */}
      {activeTab === 'specimen' && (
        <div className="space-y-4">
          <Alert variant="info">
            A specimen shows the USPTO your trademark in actual use with your goods/services. Getting this right is critical — wrong specimens are the #1 reason for trademark refusals.
          </Alert>
          <Card>
            <CardHeader title="Specimen guidance generator" />
            <CardBody>
              <div className="mb-3">
                <label className="block text-xs font-medium text-slate-600 mb-1">Trademark mark</label>
                <input value={specimenMark} onChange={e => setSpecimenMark(e.target.value)}
                  placeholder="e.g., Voice First Athletics"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-600 mb-1">Goods / Services description</label>
                <textarea rows={2} value={specimenGoods} onChange={e => setSpecimenGoods(e.target.value)}
                  placeholder="AI-powered software for athletic department management, voice-controlled database query, and constituent relationship management"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <Button variant="primary" onClick={generateSpecimen} disabled={specimenLoading || !specimenMark.trim() || !specimenGoods.trim()}>
                {specimenLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating guidance…
                  </span>
                ) : '📸 Generate specimen guidance'}
              </Button>
              {specimenResult && (
                <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-xs text-slate-700 leading-relaxed font-mono">{specimenResult}</pre>
                </div>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Quick specimen checklist" />
            <CardBody>
              <div className="space-y-2 text-sm text-slate-700">
                {[
                  ['✓', 'Mark is clearly visible in the screenshot/photo'],
                  ['✓', 'Mark appears in direct connection with the services being offered'],
                  ['✓', 'For software: screenshot shows the mark in the actual software UI or website header'],
                  ['✓', 'For services: website shows mark + description of services offered'],
                  ['✓', 'Image is clear, not blurry, and readable at normal viewing distance'],
                  ['✓', 'File size under 5MB (JPG, PNG, PDF accepted)'],
                  ['✗', 'Do NOT use: just a logo without services context'],
                  ['✗', 'Do NOT use: a mockup or draft — must show actual use'],
                  ['✗', 'Do NOT use: business card alone (not direct service connection)'],
                  ['✗', 'Do NOT use: invoices alone (acceptable for goods, not services)'],
                ].map(([icon, text]) => (
                  <div key={text} className={`flex gap-2 text-xs py-1 ${icon === '✗' ? 'text-red-600' : 'text-green-700'}`}>
                    <span className="flex-shrink-0 font-medium">{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}
