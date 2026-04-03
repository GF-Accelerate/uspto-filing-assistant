// api/openrouter.ts — Adaptive model routing for Visionary AI ecosystem
// Phase 1 of AI Independence Roadmap: route by task complexity and domain
// PA-7 federated learning data capture also runs here (interaction logging)

import type { VercelRequest, VercelResponse } from '@vercel/node'

// ── Model registry — cost vs capability tiers ─────────────────────────────
const MODELS = {
  // Simple classification tasks — fast and cheap
  simple:  'meta-llama/llama-3.1-8b-instruct:free',
  // Domain Q&A — good quality for factual retrieval
  domain:  'mistralai/mistral-7b-instruct:free',
  // Complex multi-step reasoning
  complex: 'meta-llama/llama-3.3-70b-instruct',
  // Premium — patent claims, legal analysis, business strategy
  premium: 'anthropic/claude-sonnet-4-5',
} as const

type ModelTier = keyof typeof MODELS

// ── Task → model tier classification ─────────────────────────────────────
function classifyTask(system: string, user: string): ModelTier {
  const combined = (system + ' ' + user).toLowerCase()

  // Premium tier — high-stakes legal/IP work
  if (combined.includes('claim') || combined.includes('patent spec') ||
      combined.includes('prior art') || combined.includes('trade secret') ||
      combined.includes('business structure') || combined.includes('attorney') ||
      combined.includes('filing package') || combined.includes('draft the')) {
    return 'premium'
  }

  // Complex tier — multi-step reasoning with context
  if (combined.includes('conversation') || combined.includes('portfolio') ||
      combined.includes('federated') || combined.includes('model routing') ||
      combined.includes('strategy') || combined.includes('ecosystem')) {
    return 'complex'
  }

  // Domain tier — Q&A with domain knowledge
  if (combined.includes('deadline') || combined.includes('document') ||
      combined.includes('filing') || combined.includes('step') ||
      combined.includes('how to') || combined.includes('what is')) {
    return 'domain'
  }

  // Simple tier — intent classification, confirmations
  return 'simple'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { system, user, max_tokens = 300, force_tier } = req.body as {
    system: string
    user: string
    max_tokens?: number
    force_tier?: ModelTier
  }

  if (!system || !user) {
    return res.status(400).json({ error: 'system and user are required' })
  }

  const tier = (force_tier as ModelTier) || classifyTask(system, user)
  const model = MODELS[tier]

  // Fall back to Claude proxy for premium tier (existing api/claude.ts handles this)
  if (tier === 'premium') {
    const claudeRes = await fetch(`${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/claude`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system, user, max_tokens }),
    })
    const data = await claudeRes.json()
    return res.status(claudeRes.status).json({ ...data, model: 'claude-sonnet-4-5', tier })
  }

  // Route to OpenRouter for non-premium tiers
  const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY
  if (!OPENROUTER_KEY) {
    // Graceful degradation: fall back to claude proxy if no OpenRouter key
    const claudeRes = await fetch(`${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/claude`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system, user, max_tokens }),
    })
    const data = await claudeRes.json()
    return res.status(claudeRes.status).json({ ...data, tier: 'premium_fallback' })
  }

  try {
    const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://uspto-filing-assistant-g9gc6949x-gf-accelerate-llcs-projects.vercel.app',
        'X-Title': 'Visionary AI Patent Filing Assistant',
      },
      body: JSON.stringify({
        model,
        max_tokens,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    })

    if (!orRes.ok) {
      const errText = await orRes.text()
      throw new Error(`OpenRouter ${orRes.status}: ${errText}`)
    }

    const data = await orRes.json()
    const text = data.choices?.[0]?.message?.content ?? ''

    return res.status(200).json({ text, model, tier })

  } catch (err) {
    // Graceful degradation to Claude on OpenRouter failure
    console.error('OpenRouter error, falling back to Claude:', err)
    const claudeRes = await fetch(`${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/claude`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system, user, max_tokens }),
    })
    const data = await claudeRes.json()
    return res.status(claudeRes.status).json({ ...data, tier: 'fallback' })
  }
}
