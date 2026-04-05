/// <reference types="vite/client" />
import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'

// ── Types ─────────────────────────────────────────────────────────────────
type DocId = 'nda' | 'assignment' | 'disclosure' | 'license' | 'office-action' | 'cease-desist'
type DocStatus = 'idle' | 'generating' | 'done' | 'error'

interface DocDef {
  id: DocId
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

// ── Document definitions ──────────────────────────────────────────────────
const DOCS: DocDef[] = [
  {
    id: 'nda',
    title: 'Non-Disclosure Agreement (NDA)',
    desc: 'Protects your invention during investor meetings, demos, and partnership discussions. Should be signed before sharing technical details.',
    badge: 'Sign before demos',
    badgeVariant: 'warning',
    urgency: 'Needed before any investor/partner meeting',
    fields: [
      { id: 'disclosing', label: 'Disclosing Party', placeholder: 'Visionary AI Systems Inc', type: 'text', required: true },
      { id: 'receiving',  label: 'Receiving Party', placeholder: 'e.g., ABC Venture Partners LLC', type: 'text', required: true },
      { id: 'purpose',    label: 'Purpose of Disclosure', placeholder: 'Evaluation of a potential investment or partnership in AI-powered athletic management software', type: 'textarea', required: true },
      { id: 'duration',   label: 'Confidentiality Period', placeholder: '', type: 'select', options: ['1 year', '2 years', '3 years', '5 years', 'Indefinite'], required: true },
      { id: 'state',      label: 'Governing State', placeholder: 'Georgia', type: 'text', required: true },
    ],
    systemPrompt: 'You are a business attorney drafting a mutual non-disclosure agreement. Create a comprehensive but readable NDA. Include: definitions, obligations, exclusions, return of information, term and termination, remedies, and general provisions. Use professional legal language. Format with numbered sections.',
  },
  {
    id: 'assignment',
    title: 'Inventor Assignment Agreement',
    desc: 'Legally transfers all patent rights from inventors (Milton & Lisa Overton) to Visionary AI Systems Inc. Must be signed before or at the time of filing.',
    badge: 'Sign this week',
    badgeVariant: 'danger',
    urgency: 'CRITICAL — required before any patent filing',
    fields: [
      { id: 'inventor1',  label: 'Inventor 1 Full Legal Name', placeholder: 'Milton Overton', type: 'text', required: true },
      { id: 'inventor1addr', label: 'Inventor 1 Address', placeholder: 'Kennesaw, Georgia 30144', type: 'text', required: true },
      { id: 'inventor2',  label: 'Inventor 2 Full Legal Name', placeholder: 'Lisa Overton', type: 'text', required: true },
      { id: 'inventor2addr', label: 'Inventor 2 Address', placeholder: 'Kennesaw, Georgia 30144', type: 'text', required: true },
      { id: 'company',    label: 'Assignee Company', placeholder: 'Visionary AI Systems Inc', type: 'text', required: true },
      { id: 'state',      label: 'Company State of Incorporation', placeholder: 'Georgia', type: 'text', required: true },
      { id: 'patents',    label: 'Patents Being Assigned', placeholder: 'PA-1: Voice-Controlled Database Query; PA-2: Athletic Department Management Platform; PA-3: Multi-Modal Campaign Orchestration; PA-4: Predictive Sports Revenue Intelligence; PA-5: Voice-First Agentic Database Infrastructure', type: 'textarea', required: true },
      { id: 'consideration', label: 'Consideration', placeholder: 'Equity interest in Visionary AI Systems Inc and mutual covenants herein', type: 'text', required: true },
    ],
    systemPrompt: 'You are a USPTO patent attorney drafting an inventor assignment agreement under 35 U.S.C. § 261. Create a comprehensive assignment agreement suitable for recording with the USPTO. Include: recitals, assignment clause covering all patent rights and future filings, representations and warranties (including that no third party such as KSU/Kennesaw State University has any rights), cooperation clause, further assurances, and signature blocks with notarization. Format with numbered sections.',
  },
  {
    id: 'disclosure',
    title: 'Invention Disclosure Form',
    desc: 'Internal document that establishes the date of invention and captures technical details before filing. Critical for establishing priority.',
    badge: 'File before sharing',
    badgeVariant: 'info',
    urgency: 'Creates internal record — do before any public disclosure',
    fields: [
      { id: 'title',       label: 'Invention Title', placeholder: 'Voice-Controlled Database Query with Autonomous Agent Execution', type: 'text', required: true },
      { id: 'inventors',   label: 'Inventors', placeholder: 'Milton Overton, Lisa Overton', type: 'text', required: true },
      { id: 'dateConceived', label: 'Date First Conceived', placeholder: 'e.g., January 2025', type: 'text', required: true },
      { id: 'problem',     label: 'Problem Being Solved', placeholder: 'Enterprise database systems require SQL expertise, blocking non-technical users from real-time data access', type: 'textarea', required: true },
      { id: 'solution',    label: 'Description of Invention', placeholder: 'A voice-controlled system that converts natural language to SQL queries and triggers autonomous AI agents...', type: 'textarea', required: true },
      { id: 'advantages',  label: 'Key Advantages Over Prior Art', placeholder: 'Sub-200ms latency, 9-agent framework, mandatory HITL gate, multi-provider failover', type: 'textarea', required: true },
      { id: 'disclosed',   label: 'Has This Been Publicly Disclosed?', placeholder: '', type: 'select', options: ['No — not yet disclosed', 'Yes — describe below'], required: true },
    ],
    systemPrompt: 'You are an IP attorney creating a formal invention disclosure document for internal company records. Create a comprehensive disclosure form that establishes the date of invention and captures all technical details. Include sections for: invention summary, background/problem, detailed description, claims scope, prior art considerations, inventors, conception date, reduction to practice, and disclosure history. This document should be suitable for use in establishing patent priority.',
  },
  {
    id: 'license',
    title: 'Patent License Agreement',
    desc: 'License your patents to third parties while retaining ownership. Generates royalty revenue without selling your IP.',
    badge: 'Revenue opportunity',
    badgeVariant: 'success',
    urgency: 'Use for partnerships and licensing deals',
    fields: [
      { id: 'licensor',   label: 'Licensor (Patent Owner)', placeholder: 'Visionary AI Systems Inc', type: 'text', required: true },
      { id: 'licensee',   label: 'Licensee', placeholder: 'e.g., University Athletic Conference LLC', type: 'text', required: true },
      { id: 'patents',    label: 'Patents Licensed', placeholder: 'PA-1: Voice-Controlled Database Query + Autonomous Agent Execution', type: 'textarea', required: true },
      { id: 'scope',      label: 'License Scope', placeholder: '', type: 'select', options: ['Exclusive license', 'Non-exclusive license', 'Field-of-use exclusive license', 'Sublicensable license'], required: true },
      { id: 'territory',  label: 'Territory', placeholder: '', type: 'select', options: ['United States only', 'North America', 'Worldwide', 'Custom territory'], required: true },
      { id: 'royalty',    label: 'Royalty Rate', placeholder: 'e.g., 5% of net sales, or $10 per unit, or $50,000 annual fee', type: 'text', required: true },
      { id: 'term',       label: 'License Term', placeholder: 'e.g., 5 years, or life of the patent', type: 'text', required: true },
      { id: 'field',      label: 'Field of Use', placeholder: 'e.g., collegiate athletic department operations only', type: 'text', required: false },
    ],
    systemPrompt: 'You are a patent licensing attorney drafting a patent license agreement. Create a comprehensive license agreement including: grant of license (with scope, field, territory), royalty provisions, payment terms and reporting, IP ownership (licensor retains all rights), sublicensing restrictions, quality control, patent prosecution cooperation, infringement handling, representations and warranties, indemnification, term and termination, and general provisions. Format with numbered sections.',
  },
  {
    id: 'office-action',
    title: 'Office Action Response Template',
    desc: 'When the USPTO examiner rejects claims, you must respond within the deadline. This template provides the structure for a professional response.',
    badge: 'Needed for prosecution',
    badgeVariant: 'warning',
    urgency: 'Required after any USPTO Office Action is received',
    fields: [
      { id: 'appNumber',  label: 'Application Number', placeholder: 'e.g., 63/123,456', type: 'text', required: true },
      { id: 'oaDate',     label: 'Office Action Date', placeholder: 'e.g., March 1, 2027', type: 'text', required: true },
      { id: 'rejections', label: 'Examiner Rejections (summarize)', placeholder: 'Claims 1-5 rejected under 35 USC 102 (anticipation) in view of US Patent 9,876,543; Claims 6-9 rejected under 35 USC 103 (obviousness)', type: 'textarea', required: true },
      { id: 'arguments',  label: 'Your Arguments / Distinctions', placeholder: 'The cited reference does not disclose the HITL approval gate of claim 1, nor the 9-agent autonomous framework...', type: 'textarea', required: true },
      { id: 'amendments', label: 'Proposed Claim Amendments (if any)', placeholder: 'Claim 1: Add "wherein the approval gate requires explicit human authorization via a two-factor authenticated interface"', type: 'textarea', required: false },
    ],
    systemPrompt: 'You are a USPTO patent prosecutor drafting a response to an office action. Create a professional response including: header with application info, listing of rejections being responded to, detailed arguments for patentability of each rejected claim (traverse the rejection), any proposed claim amendments, remarks section explaining why claims are allowable, and conclusion requesting reconsideration and allowance. Use formal USPTO prosecution language.',
  },
  {
    id: 'cease-desist',
    title: 'Cease and Desist Letter',
    desc: 'Enforce your patent rights against potential infringers. The first step before litigation.',
    badge: 'Enforcement tool',
    badgeVariant: 'danger',
    urgency: 'Use when competitor infringes your patents',
    fields: [
      { id: 'sender',     label: 'Sending Company', placeholder: 'Visionary AI Systems Inc', type: 'text', required: true },
      { id: 'recipient',  label: 'Recipient (Infringer)', placeholder: 'e.g., Competitor Corp, CEO Jane Smith', type: 'text', required: true },
      { id: 'patents',    label: 'Patents Being Infringed', placeholder: 'U.S. Patent Application No. 63/123,456 (Voice-Controlled Database Query)', type: 'text', required: true },
      { id: 'infringing', label: 'Infringing Products / Activities', placeholder: 'Competitor\'s "VoiceQuery Pro" product appears to implement voice-to-SQL conversion identical to our patented system...', type: 'textarea', required: true },
      { id: 'demands',    label: 'Demands', placeholder: '', type: 'select', options: ['Cease all infringing activity + licensing discussion', 'Cease all infringing activity immediately', 'Licensing negotiation only', 'Cease activity + damages'], required: true },
      { id: 'deadline',   label: 'Response Deadline', placeholder: '30 days', type: 'text', required: true },
    ],
    systemPrompt: 'You are a patent litigation attorney drafting a cease and desist letter. Create a firm but professional letter that: identifies the patents at issue, describes the infringing activity specifically, makes clear demands, sets a response deadline, and preserves litigation rights without being unnecessarily threatening. Include that the sender reserves all legal rights. Note: This is a template and should be reviewed by licensed patent counsel before sending.',
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
      max_tokens: 4000,
      system: doc.systemPrompt + '\n\nIMPORTANT: Generate a complete, professional legal document. Use proper legal formatting with numbered sections. Include all standard clauses for this document type. Add signature blocks. Include a disclaimer that this template should be reviewed by licensed legal counsel.',
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
export function Legal() {
  const [searchParams] = useSearchParams()
  const [activeDoc, setActiveDoc] = useState<DocId | null>(null)
  const [formData, setFormData]   = useState<Record<string, string>>({})
  const [status, setStatus]       = useState<DocStatus>('idle')
  const [result, setResult]       = useState('')
  const [error, setError]         = useState('')
  const [copied, setCopied]       = useState(false)

  // Read ?type= from voice command and auto-select document type
  useEffect(() => {
    const type = searchParams.get('type')
    if (type && DOCS.some(d => d.id === type)) {
      setActiveDoc(type as DocId)
    }
  }, [searchParams])

  const selectDoc = (id: DocId) => {
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
        <h2 className="font-medium text-slate-900 mb-1">Legal Document Builder</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          AI-generated legal documents tailored to Visionary AI Systems Inc.
          Fill in the form, click Generate, then download or copy the complete document.
        </p>
        <Alert variant="warning" className="mt-3">
          <strong>Important:</strong> These documents are AI-generated templates. Have a licensed attorney review before signing or sending.
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
              <p className="text-sm text-slate-400">Select a document type on the left to get started</p>
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
                            <option value="">Select…</option>
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
                          Generating…
                        </span>
                      ) : '⚡ Generate document'}
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
                    title="Generated document — review before using"
                    right={
                      <div className="flex gap-2">
                        <Button size="sm" variant={copied ? 'primary' : 'secondary'} onClick={copy}>
                          {copied ? '✓ Copied' : 'Copy'}
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => downloadTxt(result, `${doc!.id}-${Date.now()}.txt`)}
                        >
                          ⬇ Download
                        </Button>
                      </div>
                    }
                  />
                  <CardBody>
                    <Alert variant="warning" className="mb-4 text-xs">
                      AI-generated template — have a licensed attorney review and customize before signing or sending.
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
