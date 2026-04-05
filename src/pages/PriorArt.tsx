/// <reference types="vite/client" />
import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'

// ── Types ─────────────────────────────────────────────────────────────────
interface PriorArtResult {
  patents: ParsedPatent[]
  analysis: string
  riskLevel: 'low' | 'medium' | 'high'
  summary: string
  keyDifferences: string[]
  recommendations: string[]
}

interface ParsedPatent {
  number: string
  title: string
  abstract: string
  assignee: string
  date: string
  relevance: 'high' | 'medium' | 'low'
  conflictRisk: string
  distinguishingFeatures: string[]
}

interface SearchConfig {
  patentId: string
  title: string
  keywords: string[]
  cpcClasses: string[]
  description: string
}

// ── Pre-configured searches for each patent ───────────────────────────────
const PATENT_SEARCHES: SearchConfig[] = [
  {
    patentId: 'PA-1',
    title: 'Voice-Controlled Database Query + Autonomous Agent Execution',
    keywords: ['voice controlled database query', 'natural language SQL generation', 'autonomous agent framework', 'human-in-the-loop approval', 'multi-provider email failover'],
    cpcClasses: ['G10L 15/22', 'G06F 16/903', 'G06N 5/04'],
    description: 'Voice-to-SQL system with 9 autonomous AI agents, HITL approval gate, 170K+ constituent records, sub-200ms latency',
  },
  {
    patentId: 'PA-2',
    title: 'Athletic Department Management Platform',
    keywords: ['athletic department management software', 'NCAA compliance automation', 'donor cultivation AI', 'sports revenue intelligence', 'constituent relationship management athletics'],
    cpcClasses: ['G06Q 10/06', 'G06Q 50/10', 'G06F 16/9038'],
    description: 'Multi-tenant SaaS for athletic departments with NCAA compliance, RFE scoring, House v. NCAA revenue modeling',
  },
  {
    patentId: 'PA-3',
    title: 'Multi-Modal Campaign Orchestration via Voice',
    keywords: ['voice campaign orchestration', 'AI personalized video email', 'multi-channel marketing automation', 'donor campaign management voice command'],
    cpcClasses: ['G06Q 30/02', 'H04L 51/00', 'G10L 15/22'],
    description: 'Voice-commanded campaign setup with AI video personalization, multi-provider failover, mandatory HITL gate',
  },
]

// ── Claude API with web search (via /api/claude proxy) ────────────────────
async function searchPriorArt(config: SearchConfig): Promise<string> {
  const keywordStr = config.keywords.join('; ')
  const query = `Prior art patent search for: "${config.title}"

Search for US patents that may conflict with this invention:
${config.description}

Key technical concepts to search: ${keywordStr}
CPC Classification areas: ${config.cpcClasses.join(', ')}

Please:
1. Search USPTO, Google Patents, and academic databases for relevant prior art
2. Find 4-6 most relevant patents or patent applications
3. For each patent found provide: patent number, title, filing/publication date, assignee, brief abstract, and why it's relevant
4. Analyze whether each patent would block or limit the claims of this invention
5. Identify the KEY DISTINGUISHING FEATURES that make this invention novel over the prior art
6. Provide an overall freedom-to-operate assessment (Low/Medium/High risk)
7. Recommend specific claim language to strengthen novelty

Format your response with clear sections for each patent found, then the analysis.`

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      raw: true,
      anthropic_beta: 'web-search-2025-03-05',
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      system: 'You are a USPTO patent examiner and freedom-to-operate expert. Conduct thorough prior art searches using web search. Be specific about patent numbers and titles. Focus on US patents but include PCT/international if highly relevant. Provide actionable analysis.',
      messages: [{ role: 'user', content: query }],
    }),
  })

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    throw new Error(errData.error || `API error: ${res.status}`)
  }
  const data = await res.json()
  if (data.error) throw new Error(data.error)

  // Extract all text blocks from the response (web search returns multiple content blocks)
  return data.content
    ?.filter((b: { type: string }) => b.type === 'text')
    ?.map((b: { text: string }) => b.text)
    ?.join('\n\n') ?? ''
}

async function analyzePatentConflict(
  _ourPatent: string,
  priorArtText: string,
  config: SearchConfig
): Promise<PriorArtResult> {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system: 'You are a patent attorney analyzing prior art results. Respond ONLY with valid JSON, no markdown fences.',
      user: `Analyze this prior art search result for patent "${config.title}" and return structured JSON.

Prior art search results:
${priorArtText.substring(0, 3000)}

Our invention key features: ${config.description}

Return JSON with EXACTLY this structure:
{
  "patents": [
    {
      "number": "US 12,345,678",
      "title": "Patent title here",
      "abstract": "Brief abstract",
      "assignee": "Company name",
      "date": "2023",
      "relevance": "high",
      "conflictRisk": "One sentence on conflict risk",
      "distinguishingFeatures": ["how our invention differs from this one"]
    }
  ],
  "analysis": "2-3 paragraph overall analysis",
  "riskLevel": "low",
  "summary": "One sentence FTO summary",
  "keyDifferences": ["key difference 1", "key difference 2", "key difference 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}`,
      max_tokens: 2000,
    }),
  })

  const data = await res.json()
  const raw = data.text ?? ''
  return JSON.parse(raw.replace(/```json|```/g, '').trim()) as PriorArtResult
}

function downloadReport(result: PriorArtResult, config: SearchConfig) {
  const lines = [
    `PRIOR ART SEARCH REPORT`,
    `Patent: ${config.patentId} — ${config.title}`,
    `Generated: ${new Date().toLocaleDateString()}`,
    `Risk Level: ${result.riskLevel.toUpperCase()}`,
    ``,
    `SUMMARY`,
    result.summary,
    ``,
    `OVERALL ANALYSIS`,
    result.analysis,
    ``,
    `KEY DISTINGUISHING FEATURES`,
    ...result.keyDifferences.map((d, i) => `${i + 1}. ${d}`),
    ``,
    `PRIOR ART PATENTS FOUND`,
    ...result.patents.map(p => [
      ``,
      `Patent: ${p.number}`,
      `Title: ${p.title}`,
      `Assignee: ${p.assignee}`,
      `Date: ${p.date}`,
      `Relevance: ${p.relevance.toUpperCase()}`,
      `Conflict Risk: ${p.conflictRisk}`,
      `Abstract: ${p.abstract}`,
      `How We Differ: ${p.distinguishingFeatures.join('; ')}`,
    ].join('\n')),
    ``,
    `RECOMMENDATIONS FOR CLAIM DRAFTING`,
    ...result.recommendations.map((r, i) => `${i + 1}. ${r}`),
    ``,
    `DISCLAIMER: This is an AI-generated preliminary search. A comprehensive professional`,
    `freedom-to-operate opinion from a licensed patent attorney is required before`,
    `commercial launch or significant investment decisions.`,
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${config.patentId}-Prior-Art-Search-${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Component ─────────────────────────────────────────────────────────────
export function PriorArt() {
  const [searchParams] = useSearchParams()
  const [selected, setSelected] = useState<string>('PA-1')
  const [customQuery, setCustomQuery] = useState('')
  const [step, setStep] = useState<'idle' | 'searching' | 'analyzing' | 'done' | 'error'>('idle')
  const [rawResults, setRawResults] = useState('')
  const [result, setResult] = useState<PriorArtResult | null>(null)
  const [error, setError] = useState('')
  const [autoSearchDone, setAutoSearchDone] = useState(false)

  const config = PATENT_SEARCHES.find(p => p.patentId === selected)!

  // Read ?q= from voice command and auto-populate
  useEffect(() => {
    const q = searchParams.get('q')
    if (q && !autoSearchDone) {
      setCustomQuery(q)
      setAutoSearchDone(true)
    }
  }, [searchParams, autoSearchDone])

  const runSearch = useCallback(async () => {
    setStep('searching')
    setError('')
    setRawResults('')
    setResult(null)

    try {
      // Step 1: Web search for prior art
      const searchConfig = customQuery.trim()
        ? { ...config, description: customQuery }
        : config

      const raw = await searchPriorArt(searchConfig)
      setRawResults(raw)
      setStep('analyzing')

      // Step 2: Structured analysis
      const analyzed = await analyzePatentConflict('', raw, searchConfig)
      setResult(analyzed)
      setStep('done')
    } catch (e) {
      setError((e as Error).message)
      setStep('error')
    }
  }, [config, customQuery])

  const riskColors = {
    low:    { badge: 'success' as const, bg: 'bg-green-50 border-green-200',  text: 'text-green-800' },
    medium: { badge: 'warning' as const, bg: 'bg-amber-50 border-amber-200',  text: 'text-amber-800' },
    high:   { badge: 'danger'  as const, bg: 'bg-red-50  border-red-200',    text: 'text-red-800'   },
  }

  const relevanceBadge = (r: string) =>
    r === 'high' ? 'danger' : r === 'medium' ? 'warning' : 'neutral'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h2 className="font-medium text-slate-900 mb-1">Prior Art Search & Freedom to Operate</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              AI-powered prior art discovery using live USPTO and patent database search.
              Identifies conflicting patents and distinguishing features before your nonprovisional filing.
            </p>
          </div>
          <Badge variant="info">Web search enabled</Badge>
        </div>
        <Alert variant="warning">
          <strong>Use before filing nonprovisionals (due March 28, 2027).</strong> This AI search is a preliminary screen — a full FTO opinion from a licensed patent attorney is required before commercial launch.
        </Alert>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Patent selector */}
        <div className="space-y-3">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-widest px-1">
            Select patent to search
          </div>
          {PATENT_SEARCHES.map(p => (
            <button
              key={p.patentId}
              onClick={() => { setSelected(p.patentId); setStep('idle'); setResult(null); setRawResults('') }}
              className={[
                'w-full text-left p-3 rounded-xl border transition-colors',
                selected === p.patentId
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-slate-200 bg-white hover:bg-slate-50',
              ].join(' ')}
            >
              <div className="text-xs font-mono text-slate-400 mb-0.5">{p.patentId}</div>
              <div className="text-sm font-medium text-slate-900 leading-tight mb-2">{p.title}</div>
              <div className="flex flex-wrap gap-1">
                {p.cpcClasses.slice(0, 2).map(c => (
                  <span key={c} className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
                    {c}
                  </span>
                ))}
              </div>
            </button>
          ))}

          {/* Custom search */}
          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <div className="text-xs font-medium text-slate-600 mb-2">Custom search (optional)</div>
            <textarea
              rows={3}
              value={customQuery}
              onChange={e => setCustomQuery(e.target.value)}
              placeholder="Override the default description with custom prior art search terms..."
              className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded bg-slate-50 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Right: Search + results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search config card */}
          <Card>
            <CardHeader
              title={`${config.patentId}: ${config.title}`}
              right={
                <Button
                  variant="primary"
                  onClick={runSearch}
                  disabled={step === 'searching' || step === 'analyzing'}
                >
                  {step === 'searching' ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Searching USPTO…
                    </span>
                  ) : step === 'analyzing' ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing conflicts…
                    </span>
                  ) : '🔍 Run prior art search'}
                </Button>
              }
            />
            <CardBody>
              <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                <div>
                  <div className="text-xs text-slate-400 mb-1">CPC classifications</div>
                  {config.cpcClasses.map(c => (
                    <div key={c} className="text-xs font-mono text-blue-600">{c}</div>
                  ))}
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Search keywords</div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    {config.keywords.slice(0, 3).join(' · ')}
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-500 bg-slate-50 rounded p-2 leading-relaxed">
                <strong>Invention:</strong> {config.description}
              </div>
            </CardBody>
          </Card>

          {/* Error */}
          {step === 'error' && (
            <Alert variant="danger">{error}</Alert>
          )}

          {/* Loading states */}
          {(step === 'searching' || step === 'analyzing') && (
            <Card>
              <CardBody>
                <div className="space-y-3 py-4">
                  <div className={`flex items-center gap-3 text-sm ${step === 'searching' ? 'text-blue-600' : 'text-green-600'}`}>
                    {step === 'searching'
                      ? <><span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" /> Searching USPTO, Google Patents, and patent databases…</>
                      : <><span className="text-green-500">✓</span> Prior art patents found — running conflict analysis…</>
                    }
                  </div>
                  {step === 'analyzing' && rawResults && (
                    <div className="bg-slate-50 rounded p-3 max-h-48 overflow-y-auto">
                      <pre className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed font-mono">
                        {rawResults.substring(0, 800)}…
                      </pre>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Results */}
          {step === 'done' && result && (
            <>
              {/* Risk summary */}
              <div className={`rounded-xl border p-4 ${riskColors[result.riskLevel].bg}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`text-base font-medium ${riskColors[result.riskLevel].text}`}>
                      Freedom-to-Operate Assessment
                    </div>
                    <Badge variant={riskColors[result.riskLevel].badge}>
                      {result.riskLevel.toUpperCase()} RISK
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => navigator.clipboard?.writeText(rawResults)}>
                      Copy raw results
                    </Button>
                    <Button size="sm" variant="primary" onClick={() => downloadReport(result, config)}>
                      ⬇ Download report
                    </Button>
                  </div>
                </div>
                <p className={`text-sm leading-relaxed ${riskColors[result.riskLevel].text}`}>
                  {result.summary}
                </p>
              </div>

              {/* Key differences */}
              <Card>
                <CardHeader title="Key distinguishing features — use in claim drafting" />
                <CardBody>
                  <div className="space-y-2">
                    {result.keyDifferences.map((diff, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <span className="text-green-600 font-medium flex-shrink-0 w-5">✓</span>
                        <span className="text-slate-700">{diff}</span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Prior art patents */}
              <div className="space-y-3">
                <div className="text-xs font-medium text-slate-400 uppercase tracking-widest px-1">
                  Prior art patents found ({result.patents.length})
                </div>
                {result.patents.map((patent, i) => (
                  <Card key={i}>
                    <CardHeader
                      title={
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-blue-600 text-sm">{patent.number}</span>
                          <Badge variant={relevanceBadge(patent.relevance)}>
                            {patent.relevance} relevance
                          </Badge>
                        </div>
                      }
                      right={
                        <a
                          href={`https://patents.google.com/patent/${patent.number.replace(/[^A-Z0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button size="sm">View on Google Patents ↗</Button>
                        </a>
                      }
                    />
                    <CardBody>
                      <div className="mb-2">
                        <p className="text-sm font-medium text-slate-900 mb-0.5">{patent.title}</p>
                        <p className="text-xs text-slate-400">{patent.assignee} · {patent.date}</p>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-3">{patent.abstract}</p>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
                        <div className="text-xs font-medium text-amber-800 mb-1">Conflict risk</div>
                        <div className="text-xs text-amber-700">{patent.conflictRisk}</div>
                      </div>
                      {patent.distinguishingFeatures.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="text-xs font-medium text-green-800 mb-1">How our invention differs</div>
                          {patent.distinguishingFeatures.map((f, j) => (
                            <div key={j} className="text-xs text-green-700 flex gap-1.5">
                              <span>→</span><span>{f}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </div>

              {/* Recommendations */}
              <Card>
                <CardHeader title="Recommendations for nonprovisional claim drafting" />
                <CardBody>
                  <div className="space-y-2">
                    {result.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-3 text-sm py-1 border-b border-slate-100 last:border-0">
                        <span className="text-blue-600 font-medium w-5 flex-shrink-0">{i + 1}.</span>
                        <span className="text-slate-700">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Overall analysis */}
              <Card>
                <CardHeader title="Full analysis" />
                <CardBody>
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {result.analysis}
                  </div>
                </CardBody>
              </Card>

              <Alert variant="warning">
                <strong>Next step:</strong> Share this report with your patent attorney when filing nonprovisionals (due March 28, 2027). The attorney will conduct a comprehensive professional FTO search before the nonprovisional is submitted.
              </Alert>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
