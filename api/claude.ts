// api/claude.ts — Vercel serverless proxy for Anthropic API
// Keeps ANTHROPIC_API_KEY server-side, avoids browser CORS restrictions.
// Called by the frontend as POST /api/claude

import type { VercelRequest, VercelResponse } from '@vercel/node'

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // API key lives server-side only — never exposed to browser
  const apiKey =
    process.env.ANTHROPIC_API_KEY ||
    process.env.VITE_ANTHROPIC_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured on server' })
  }

  const { system, user, max_tokens = 1000 } = req.body as {
    system: string
    user: string
    max_tokens?: number
  }

  if (!system || !user) {
    return res.status(400).json({ error: 'Missing required fields: system, user' })
  }

  try {
    const upstream = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    })

    const data = await upstream.json()

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: data.error?.message || 'Upstream error' })
    }

    // Return just the text content
    const text = data.content?.[0]?.text ?? ''
    return res.status(200).json({ text })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ error: `Proxy error: ${message}` })
  }
}
