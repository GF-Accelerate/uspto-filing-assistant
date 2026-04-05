/// <reference types="vite/client" />
import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { PORTFOLIO_INIT } from '@/lib/uspto'
import { downloadStrategyDOCX } from '@/lib/docx-generator'

// ── Types ─────────────────────────────────────────────────────────────────
type StrategyDocId = 'business-plan' | 'freemium-strategy' | 'licensing-framework' | 'data-policy' | 'llm-training' | 'competitive-moat' | 'investor-pitch' | 'product-roadmap'
type DocStatus = 'idle' | 'generating' | 'done' | 'error'

interface DocDef {
  id: StrategyDocId
  title: string
  desc: string
  badge: string
  badgeVariant: 'success' | 'info' | 'warning' | 'danger' | 'neutral'
  urgency: string
  fields: Field[]
  systemPrompt: string
}

interface Field {
  id: string
  label: string
  placeholder: string
  type: 'text' | 'textarea' | 'select'
  options?: string[]
  required: boolean
}

// ── Portfolio context for system prompts ───────────────────────────────────
const portfolioContext = PORTFOLIO_INIT.map(p =>
  `- ${p.id}: ${p.title} (Status: ${p.status}${p.appNumber ? `, App #${p.appNumber}` : ''}${p.deadline ? `, Deadline: ${p.deadline}` : ''})`
).join('\n')

const COMPANY_CONTEXT = `
COMPANY: Visionary AI Systems, Inc. — Delaware Corporation (State ID: 10468520), EIN: 41-3757112
ADDRESS: 1102 Cool Springs Drive, Kennesaw, GA 30144
FOUNDERS: Milton Overton & Lisa Overton
PATENT PORTFOLIO (${PORTFOLIO_INIT.length} patents):
${portfolioContext}

PRODUCT ECOSYSTEM (11 products):
- CSOS: College Sports Operating System — live at KSU, 172K+ constituents (internal, not commercializable)
- Visionary AI Marketing Automation — live, Stripe integrated ($0-$2,499/mo tiers)
- MDALS Virtual Church — denomination-aware content, giving system Stripe-ready
- FirePath Financial Aid — Plaid integrated, pension + Monte Carlo simulations
- AI Interactive Vision Board — personal growth + likeness-preserving visualization
- Revenue Shield — insurance compensation auditing (separate LLC)
- Patent Filing Assistant — this app (live, PA-6 embodiment)
- Batman OS — internal orchestration hub
- KSU Athletics Strategic Plan — internal strategic planning
- KSU Contracts System — internal contract management
- Visionary Ops Command Center — internal ops dashboard

KEY IP INNOVATIONS:
- PA-5 VADI: 7 primitives (VQE, AEF, HAL, MPCB, VCE, DIC, PDB) — platform licensing moat
- PA-7: Federated Multi-Vertical Industry Learning — data flywheel across products
- PA-8: Confidence-based autonomy routing + ephemeral token voice auth
- HITL (Human-in-the-Loop) non-bypassable gate — core IP differentiator across all patents
`

// ── Document definitions ──────────────────────────────────────────────────
const DOCS: DocDef[] = [
  {
    id: 'business-plan',
    title: 'IP Portfolio Business Plan',
    desc: 'Comprehensive business plan leveraging your patent portfolio across all products. Covers market opportunity, competitive moat, revenue model, and patent-backed defensibility.',
    badge: 'Start here',
    badgeVariant: 'success',
    urgency: 'Foundation document for investors and strategy',
    fields: [
      { id: 'company', label: 'Company Name', placeholder: 'Visionary AI Systems Inc', type: 'text', required: true },
      { id: 'products', label: 'Key Products', placeholder: 'Marketing Automation, MDALS Virtual Church, FirePath Financial, AI Vision Board, Patent Filing Assistant', type: 'textarea', required: true },
      { id: 'market', label: 'Target Market', placeholder: 'SMB SaaS across marketing, faith community, financial planning, and personal growth verticals', type: 'textarea', required: true },
      { id: 'revenueModel', label: 'Revenue Model', placeholder: 'Freemium SaaS + patent licensing + PA-7 domain LLM API access', type: 'textarea', required: true },
      { id: 'vision', label: '3-Year Vision', placeholder: 'Build cross-vertical AI moat via federated learning (PA-7), achieve $782K/mo ARR by Year 3', type: 'textarea', required: true },
      { id: 'competitors', label: 'Key Competitors', placeholder: 'HubSpot (marketing), Tithe.ly (church), Fidelity Go (financial), Canva/Pinterest (vision boards)', type: 'textarea', required: false },
    ],
    systemPrompt: `You are a business strategist and IP portfolio advisor creating a comprehensive business plan for a patent-backed AI company.
${COMPANY_CONTEXT}
Create a detailed business plan with: Executive Summary, Market Opportunity (TAM/SAM/SOM), Product-Market Fit (how products map to patents), Competitive Moat Analysis (patent fence + data flywheel), Revenue Model (freemium + licensing + API), 3-Year Financial Projections, Patent Portfolio Valuation, Go-to-Market Strategy, and Risk Mitigation. Format with clear numbered sections and bullet points.`,
  },
  {
    id: 'freemium-strategy',
    title: 'Freemium Data Collection Strategy',
    desc: 'Design free tier features and data collection touchpoints to feed PA-7 federated learning. Covers privacy compliance, consent architecture, and data pipeline specifications.',
    badge: 'PA-7 enabler',
    badgeVariant: 'warning',
    urgency: 'Required before launching free tiers',
    fields: [
      { id: 'product', label: 'Product Name', placeholder: '', type: 'select', options: ['Visionary Marketing Automation', 'MDALS Virtual Church', 'AI Vision Board', 'FirePath Financial Aid', 'All Products'], required: true },
      { id: 'freeFeatures', label: 'Proposed Free Tier Features', placeholder: 'e.g., 3 campaigns, 500 contacts, basic analytics dashboard', type: 'textarea', required: true },
      { id: 'dataTypes', label: 'Data Types to Collect', placeholder: 'e.g., campaign engagement patterns, send-time optimization data, content preferences', type: 'textarea', required: true },
      { id: 'privacyReqs', label: 'Privacy Requirements', placeholder: '', type: 'select', options: ['CCPA only (US)', 'CCPA + GDPR (US + EU)', 'CCPA + GDPR + GLBA (financial data)', 'CCPA + GDPR + religious data protections'], required: true },
      { id: 'pa7Goals', label: 'PA-7 Training Goals', placeholder: 'e.g., Train marketing engagement timing model, build vertical-specific content recommendations', type: 'textarea', required: true },
    ],
    systemPrompt: `You are a growth strategist specializing in data-driven freemium business models and AI/ML data collection.
${COMPANY_CONTEXT}
PA-7 CONTEXT: PA-7 covers federated multi-vertical industry learning. Each product contributes anonymized domain data to train vertical AI models WITHOUT sharing raw data between verticals. Freemium = more users = more data = stronger domain LLMs = competitive moat.
Create a detailed freemium strategy with: Free vs Paid Feature Matrix, Data Collection Touchpoints (Category A: functional, B: analytical/PA-7, C: sensitive/never shared), Consent Architecture, Anonymization Pipeline (PII scrubbing, k-anonymity k>=50, differential privacy), Conversion Triggers (specific moments for upgrade prompts), Revenue Impact Projections, and PA-7 Data Volume Timeline. Format with tables and numbered sections.`,
  },
  {
    id: 'licensing-framework',
    title: 'IP Licensing Framework',
    desc: 'Patent licensing revenue strategy — license VADI primitives, voice-to-database, or federated learning to third parties while retaining ownership.',
    badge: 'Revenue stream',
    badgeVariant: 'success',
    urgency: 'Prepare before partnership discussions',
    fields: [
      { id: 'licensor', label: 'Licensor', placeholder: 'Visionary AI Systems Inc', type: 'text', required: true },
      { id: 'patents', label: 'Patents to License', placeholder: '', type: 'select', options: ['PA-1: Voice-to-Database Query', 'PA-5: VADI Platform Infrastructure', 'PA-7: Federated Learning System', 'PA-1 + PA-5 Bundle (Voice Platform)', 'Full Portfolio License', 'Custom Selection'], required: true },
      { id: 'model', label: 'Licensing Model', placeholder: '', type: 'select', options: ['Per-seat SaaS license', 'Per-API-call usage', 'Revenue share (royalty)', 'Field-of-use exclusive', 'Annual flat fee'], required: true },
      { id: 'verticals', label: 'Target Verticals / Licensees', placeholder: 'e.g., enterprise SaaS platforms, athletic conference systems, church management software vendors', type: 'textarea', required: true },
      { id: 'pricing', label: 'Pricing Strategy', placeholder: 'e.g., $0.001-0.01 per API call, or 3-5% revenue share, or $50K-500K annual license', type: 'textarea', required: true },
    ],
    systemPrompt: `You are a patent licensing strategist and IP monetization advisor.
${COMPANY_CONTEXT}
Create a comprehensive licensing framework with: Licensable Patent Assets (what each patent covers and why it's valuable to licensees), Licensing Model Options (per-seat, per-call, royalty, field-of-use), Pricing Tiers by Licensee Size, Standard vs Enterprise Terms, Field-of-Use Restrictions, Geographic Scope, Sublicensing Policies, Revenue Projections (Year 1-3), and Key Negotiation Points. Include sample term sheets. Format with numbered sections and tables.`,
  },
  {
    id: 'data-policy',
    title: 'Data Collection & Privacy Policy',
    desc: 'CCPA/GDPR-compliant privacy policy covering data collection for AI training across all products. Includes PA-7 federated learning disclosures.',
    badge: 'Legal requirement',
    badgeVariant: 'danger',
    urgency: 'Must have before collecting user data',
    fields: [
      { id: 'company', label: 'Company Name', placeholder: 'Visionary AI Systems Inc', type: 'text', required: true },
      { id: 'products', label: 'Products Collecting Data', placeholder: 'Marketing Automation, MDALS Virtual Church, AI Vision Board, FirePath Financial Aid', type: 'textarea', required: true },
      { id: 'dataTypes', label: 'Data Types Collected', placeholder: 'Campaign analytics, content engagement, financial planning patterns, goal tracking', type: 'textarea', required: true },
      { id: 'jurisdictions', label: 'Jurisdictions', placeholder: '', type: 'select', options: ['United States only', 'US + EU (GDPR)', 'US + EU + UK', 'Global'], required: true },
      { id: 'retention', label: 'Data Retention Period', placeholder: '', type: 'select', options: ['12 months', '24 months', '36 months', 'While account active + 30 days'], required: true },
    ],
    systemPrompt: `You are a privacy attorney specializing in AI/ML data collection and multi-product SaaS platforms.
${COMPANY_CONTEXT}
CRITICAL PRIVACY RULES:
- MDALS religious data (prayer requests, denomination, beliefs) must NEVER be used for AI training — GDPR Article 9 special category
- FirePath financial data requires GLBA compliance — explicit opt-in for cross-product sharing
- All PA-7 training data must be anonymized: PII scrubbing → k-anonymity (k>=50) → differential privacy
- Revenue Shield is a separate LLC — no data sharing without formal DPA
Create a comprehensive privacy policy with: Data Collection Scope (per product), AI Training Data Use Disclosure, Federated Learning Transparency Statement, Consent Architecture (opt-in for analytical data), User Rights (access, export, deletion), CCPA/GDPR/GLBA Compliance Checklist, Data Retention Schedule, and Third-Party Sharing Policy. Format as a legal document with numbered sections.`,
  },
  {
    id: 'llm-training',
    title: 'Domain LLM Training Data Strategy',
    desc: 'PA-7 data collection roadmap — define vertical-specific training datasets, quality gates, model readiness milestones, and the data flywheel timeline.',
    badge: 'PA-7 core',
    badgeVariant: 'info',
    urgency: 'Plan before product launches',
    fields: [
      { id: 'vertical', label: 'Target Vertical', placeholder: '', type: 'select', options: ['Marketing Automation', 'Faith Community (MDALS)', 'Financial Planning (FirePath)', 'Personal Growth (Vision Board)', 'All Verticals'], required: true },
      { id: 'dataSources', label: 'Data Sources', placeholder: 'e.g., Campaign performance metrics, email engagement analytics, audience segmentation patterns', type: 'textarea', required: true },
      { id: 'currentVolume', label: 'Current Data Volume', placeholder: 'e.g., 0 events (pre-launch) or 50K monthly events', type: 'text', required: true },
      { id: 'targetVolume', label: 'Target Data Volume (12 months)', placeholder: 'e.g., 2M monthly events', type: 'text', required: true },
      { id: 'modelGoals', label: 'Model Training Goals', placeholder: 'e.g., Send-time optimization, content recommendation, engagement prediction', type: 'textarea', required: true },
    ],
    systemPrompt: `You are an AI/ML product strategist specializing in vertical AI model development and data flywheel strategy.
${COMPANY_CONTEXT}
PA-7 ARCHITECTURE: Federated learning across verticals. Each product trains a local vertical model on anonymized data. Only gradient updates (NOT raw data) cross vertical boundaries. A cross-vertical meta-model learns patterns that no single vertical could discover alone.
Create a detailed training data strategy with: Data Taxonomy (Category A functional, B analytical, C sensitive), Collection Points per Product Feature, Quality Scoring Rubric, Minimum Viable Dataset Thresholds (events needed per vertical), Data Volume Timeline (Month 1-36), Model Architecture Recommendations, Anonymization Pipeline Specs, Training Compute Estimates, Model Readiness Milestones, and Data Moat Analysis. Format with tables and numbered sections.`,
  },
  {
    id: 'competitive-moat',
    title: 'Competitive Moat Analysis',
    desc: 'Patent fence analysis, cross-product data moat assessment, switching cost analysis, and time-to-replicate estimates for each competitive advantage.',
    badge: 'Investor ready',
    badgeVariant: 'info',
    urgency: 'Key document for fundraising',
    fields: [
      { id: 'company', label: 'Company Name', placeholder: 'Visionary AI Systems Inc', type: 'text', required: true },
      { id: 'competitors', label: 'Key Competitors', placeholder: 'HubSpot, Mailchimp (marketing); Tithe.ly, Planning Center (church); Fidelity, Betterment (financial); LangGraph, CrewAI (AI agents)', type: 'textarea', required: true },
      { id: 'segments', label: 'Market Segments', placeholder: 'SMB marketing automation, faith community management, personal financial planning, enterprise voice-to-database', type: 'textarea', required: true },
      { id: 'strengths', label: 'Key Differentiators', placeholder: 'HITL non-bypass gate, cross-vertical federated learning, voice-first architecture, 10-patent portfolio', type: 'textarea', required: true },
    ],
    systemPrompt: `You are a strategy consultant and patent analyst evaluating competitive defensibility.
${COMPANY_CONTEXT}
Create a comprehensive moat analysis with: Patent Fence Map (how 10 patents create barriers to entry), Cross-Product Data Moat (PA-7 federated learning advantage), HITL Differentiation (vs LangGraph, HumanLayer, CrewAI), Switching Cost Analysis (per product), Network Effect Potential, Time-to-Replicate Estimates (how long would it take a competitor to build equivalent), Vulnerability Assessment, and Moat Strengthening Recommendations. Format with comparison tables and numbered sections.`,
  },
  {
    id: 'investor-pitch',
    title: 'Investor Pitch IP Summary',
    desc: 'One-page IP-backed pitch summary with portfolio valuation framework, defensibility narrative, and market opportunity sizing.',
    badge: 'Fundraising',
    badgeVariant: 'success',
    urgency: 'Needed for investor meetings',
    fields: [
      { id: 'company', label: 'Company Name', placeholder: 'Visionary AI Systems Inc', type: 'text', required: true },
      { id: 'ask', label: 'Funding Ask', placeholder: 'e.g., $2M seed round, $500K pre-seed', type: 'text', required: true },
      { id: 'marketSize', label: 'Target Market Size', placeholder: 'e.g., $47B SMB SaaS market, $2.4B church management software, $12B financial planning tools', type: 'textarea', required: true },
      { id: 'traction', label: 'Current Traction', placeholder: 'e.g., 1 patent filed, 9 ready to file, 5 products live, CSOS managing 172K constituents', type: 'textarea', required: true },
      { id: 'useOfFunds', label: 'Use of Funds', placeholder: 'e.g., Patent prosecution ($30K), Product development ($1M), Marketing ($500K), Legal/compliance ($200K)', type: 'textarea', required: true },
    ],
    systemPrompt: `You are a venture capital pitch strategist and IP valuation expert.
${COMPANY_CONTEXT}
Create a concise, compelling investor pitch document with: Executive Hook (one-sentence value proposition), Problem Statement, Solution (patent-backed), Market Opportunity (TAM/SAM/SOM), Product Traction, Patent Portfolio Valuation (comparable patent sales, licensing revenue potential), Business Model, Financial Projections (Year 1-3), Team, Competitive Landscape, IP Defensibility Thesis, Ask and Use of Funds, and Key Milestones. Keep it scannable — use bullet points and bold text for key numbers.`,
  },
  {
    id: 'product-roadmap',
    title: 'Product Roadmap with IP Alignment',
    desc: 'Feature roadmap mapped to patent coverage, data collection milestones, and IP-filing timeline. Shows how each feature strengthens the patent portfolio.',
    badge: 'Planning tool',
    badgeVariant: 'neutral',
    urgency: 'Align product and IP strategy',
    fields: [
      { id: 'product', label: 'Product', placeholder: '', type: 'select', options: ['Visionary Marketing Automation', 'MDALS Virtual Church', 'AI Vision Board', 'FirePath Financial Aid', 'Patent Filing Assistant', 'All Products'], required: true },
      { id: 'currentFeatures', label: 'Current Features', placeholder: 'e.g., Campaign builder, email analytics, lead scoring, audience segmentation, Stripe billing', type: 'textarea', required: true },
      { id: 'plannedFeatures', label: 'Planned Features (Next 12 Months)', placeholder: 'e.g., AI send-time optimization, predictive lead scoring, voice-controlled campaigns, cross-vertical insights', type: 'textarea', required: true },
      { id: 'patents', label: 'Associated Patents', placeholder: 'e.g., PA-1 (voice-to-database), PA-3 (campaign orchestration), PA-7 (federated learning)', type: 'textarea', required: true },
      { id: 'dataGoals', label: 'Data Flywheel Goals', placeholder: 'e.g., 500K events/month by Month 6, first vertical model by Month 10', type: 'textarea', required: true },
    ],
    systemPrompt: `You are a product strategist specializing in patent-aligned product development and data flywheel design.
${COMPANY_CONTEXT}
Create a detailed product roadmap with: Current State Assessment, Feature-to-Patent Alignment Matrix (which features are covered by which patents), Quarterly Milestones (Q1-Q4), Data Collection Integration Points (where features generate PA-7 training data), IP Filing Timeline Integration (when to file continuation patents based on new features), Resource Requirements, Dependencies, and Success Metrics. Format as a structured roadmap with tables and timeline.`,
  },
]

// ── Claude API call ───────────────────────────────────────────────────────
async function generateDocument(doc: DocDef, formData: Record<string, string>): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY not set')

  const fieldSummary = doc.fields
    .map(f => `${f.label}: ${formData[f.id] || '(not provided)'}`)
    .join('\n')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 6000,
      system: doc.systemPrompt + '\n\nIMPORTANT: Generate a complete, professional strategy document. Use clear section headings, numbered lists, tables where appropriate, and bullet points. Include specific numbers, timelines, and actionable recommendations. Mark all documents as CONFIDENTIAL — VISIONARY AI SYSTEMS INC.',
      messages: [{
        role: 'user',
        content: `Generate a ${doc.title} with these details:\n\n${fieldSummary}\n\nGenerate the complete document now.`,
      }],
    }),
  })

  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.content?.[0]?.text ?? ''
}

function downloadTxt(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// ── Component ─────────────────────────────────────────────────────────────
export function Strategy() {
  const [searchParams] = useSearchParams()
  const [activeDoc, setActiveDoc] = useState<StrategyDocId | null>(null)
  const [formData, setFormData]   = useState<Record<string, string>>({})
  const [status, setStatus]       = useState<DocStatus>('idle')
  const [result, setResult]       = useState('')
  const [error, setError]         = useState('')
  const [copied, setCopied]       = useState(false)

  useEffect(() => {
    const type = searchParams.get('type')
    if (type && DOCS.some(d => d.id === type)) {
      setActiveDoc(type as StrategyDocId)
    }
  }, [searchParams])

  const selectDoc = (id: StrategyDocId) => {
    setActiveDoc(id)
    setFormData({})
    setStatus('idle')
    setResult('')
    setError('')
  }

  const doc = DOCS.find(d => d.id === activeDoc)

  const generate = useCallback(async () => {
    if (!doc) return
    const missing = doc.fields.filter(f => f.required && !formData[f.id]?.trim())
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.map(f => f.label).join(', ')}`)
      return
    }
    setStatus('generating')
    setError('')
    setResult('')
    try {
      const text = await generateDocument(doc, formData)
      setResult(text)
      setStatus('done')
    } catch (e) {
      setError((e as Error).message)
      setStatus('error')
    }
  }, [doc, formData])

  const copy = () => {
    navigator.clipboard?.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="font-medium text-slate-900 mb-1">IP Strategy Document Builder</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          AI-generated business strategy documents powered by your patent portfolio data.
          Each document is pre-loaded with your {PORTFOLIO_INIT.length}-patent portfolio and 11-product ecosystem context.
        </p>
        <Alert variant="info" className="mt-3">
          <strong>Tip:</strong> Start with the IP Portfolio Business Plan to create your foundation document, then generate supporting strategy documents as needed.
        </Alert>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Doc selector */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-widest px-1 mb-3">
            Select document type
          </div>
          {DOCS.map(d => (
            <button
              key={d.id}
              onClick={() => selectDoc(d.id)}
              className={[
                'w-full text-left p-3 rounded-xl border transition-colors',
                activeDoc === d.id
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-slate-200 bg-white hover:bg-slate-50',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-sm font-medium text-slate-900 leading-tight">{d.title}</span>
              </div>
              <Badge variant={d.badgeVariant} className="text-xs">{d.badge}</Badge>
            </button>
          ))}
        </div>

        {/* Form + result */}
        <div className="lg:col-span-2 space-y-4">
          {!activeDoc ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-xl p-10 text-center">
              <p className="text-sm text-slate-400">Select a strategy document type on the left to get started</p>
              <p className="text-xs text-slate-300 mt-2">All documents include your full patent portfolio and product ecosystem context</p>
            </div>
          ) : (
            <>
              <Card>
                <CardHeader
                  title={doc!.title}
                  right={<Badge variant={doc!.badgeVariant}>{doc!.urgency}</Badge>}
                />
                <CardBody>
                  <p className="text-sm text-slate-500 mb-4 leading-relaxed">{doc!.desc}</p>

                  <div className="space-y-4">
                    {doc!.fields.map(field => (
                      <div key={field.id}>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {field.type === 'select' ? (
                          <select
                            value={formData[field.id] ?? ''}
                            onChange={e => setFormData(p => ({ ...p, [field.id]: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select...</option>
                            {field.options!.map(o => (
                              <option key={o} value={o}>{o}</option>
                            ))}
                          </select>
                        ) : field.type === 'textarea' ? (
                          <textarea
                            rows={3}
                            value={formData[field.id] ?? ''}
                            onChange={e => setFormData(p => ({ ...p, [field.id]: e.target.value }))}
                            placeholder={field.placeholder}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <input
                            type="text"
                            value={formData[field.id] ?? ''}
                            onChange={e => setFormData(p => ({ ...p, [field.id]: e.target.value }))}
                            placeholder={field.placeholder}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {error && <Alert variant="danger" className="mt-4">{error}</Alert>}

                  <div className="flex gap-2 mt-5">
                    <Button
                      variant="primary"
                      onClick={generate}
                      disabled={status === 'generating'}
                    >
                      {status === 'generating' ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Generating...
                        </span>
                      ) : 'Generate Strategy Document'}
                    </Button>
                    <Button onClick={() => { setFormData({}); setStatus('idle'); setResult('') }}>
                      Clear
                    </Button>
                  </div>
                </CardBody>
              </Card>

              {/* Generated result */}
              {status === 'done' && result && (
                <Card>
                  <CardHeader
                    title="Generated document — CONFIDENTIAL"
                    right={
                      <div className="flex gap-2">
                        <Button size="sm" variant={copied ? 'primary' : 'secondary'} onClick={copy}>
                          {copied ? 'Copied' : 'Copy'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => downloadTxt(result, `${doc!.id}-${Date.now()}.txt`)}
                        >
                          .txt
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => downloadStrategyDOCX(result, doc!.title, doc!.id)}
                        >
                          DOCX
                        </Button>
                      </div>
                    }
                  />
                  <CardBody>
                    <Alert variant="info" className="mb-4 text-xs">
                      CONFIDENTIAL — Visionary AI Systems Inc. AI-generated strategy document — review and customize before distribution.
                    </Alert>
                    <pre className="whitespace-pre-wrap text-xs text-slate-700 font-mono leading-relaxed bg-slate-50 rounded-lg p-4 border border-slate-100 max-h-96 overflow-y-auto">
                      {result}
                    </pre>
                  </CardBody>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
