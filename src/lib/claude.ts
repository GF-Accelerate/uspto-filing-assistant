/// <reference types="vite/client" />
import type { ExtractedFilingData, CoverSheetData, ValidationResult } from '@/types/patent'

const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL   = 'claude-sonnet-4-20250514'

async function callClaude(system: string, user: string): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY is not set')

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })

  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.content?.[0]?.text ?? ''
}

function parseJSON<T>(raw: string): T {
  return JSON.parse(raw.replace(/```json|```/g, '').trim()) as T
}

// ── Prompts (named constants — never inline in components) ────────

const EXTRACT_SYSTEM = `You are a USPTO patent filing specialist.
Extract structured filing data from the provided specification.
Respond ONLY with valid JSON. No markdown, no preamble, no explanation.
If an inventor name contains "Batman MO", "Development Team", "KSU", or "Kennesaw State University",
add a warning in the warnings array: "INVALID INVENTOR or ASSIGNEE detected — must be corrected before filing."`

const COVER_SYSTEM = `You are a USPTO patent attorney generating a PTO/SB/16 provisional application cover sheet.
Respond ONLY with valid JSON. No markdown, no preamble.`

const VALIDATE_SYSTEM = `You are a USPTO patent attorney performing a pre-filing compliance check.
Respond ONLY with valid JSON. No markdown, no preamble.`

// ── Public API ────────────────────────────────────────────────────

export async function extractFilingData(specText: string): Promise<ExtractedFilingData> {
  const raw = await callClaude(EXTRACT_SYSTEM, `
Extract from this provisional patent specification and return JSON with EXACTLY these keys:
{
  "title": "full patent title",
  "technicalField": "one sentence description of technical field",
  "inventors": [{"name":"Full Legal Name","address":"City, State ZIP","citizenship":"United States"}],
  "assignee": {"name":"company name","address":"city, state zip","type":"Corporation","state":"Georgia"},
  "entityStatus": "Small Entity",
  "filingDate": "March 28, 2026",
  "independentClaims": 3,
  "totalClaims": 14,
  "hasDrawings": true,
  "abstract": "50-100 word summary of the invention",
  "keyInnovations": ["key innovation 1","key innovation 2","key innovation 3"],
  "warnings": ["any missing items, errors, or invalid inventor/assignee names"]
}

Specification:
${specText.substring(0, 5000)}`)
  return parseJSON<ExtractedFilingData>(raw)
}

export async function generateCoverSheet(data: ExtractedFilingData): Promise<CoverSheetData> {
  const raw = await callClaude(COVER_SYSTEM, `
Generate PTO/SB/16 cover sheet fields from this data: ${JSON.stringify(data)}
Return JSON with EXACTLY these keys:
{
  "applicationTitle": "...",
  "inventors": ["Name, City State Country"],
  "correspondence": "Visionary AI Systems Inc, Kennesaw, GA 30144",
  "entityStatus": "Small Entity",
  "govInterest": "None",
  "feeEst": "$320.00 (Small Entity, 2026)",
  "deadline": "March 28, 2027 — MANDATORY nonprovisional deadline",
  "patentPending": "Patent Pending — U.S. Provisional Application Filed March 28, 2026",
  "reminders": ["reminder 1","reminder 2","reminder 3","reminder 4"]
}`)
  return parseJSON<CoverSheetData>(raw)
}

export async function validateFiling(
  data: ExtractedFilingData,
  checkedCount: number
): Promise<ValidationResult> {
  const raw = await callClaude(VALIDATE_SYSTEM, `
Pre-filing compliance check. Filing data: ${JSON.stringify(data)}
HITL checklist: ${checkedCount}/14 items checked.
Return JSON with EXACTLY these keys:
{
  "status": "READY TO FILE",
  "score": 95,
  "passed": ["passed check 1","passed check 2"],
  "issues": ["issue if any"],
  "critical": ["critical block if any — things that must be fixed before filing"],
  "recs": ["recommendation 1","recommendation 2"]
}`)
  return parseJSON<ValidationResult>(raw)
}
