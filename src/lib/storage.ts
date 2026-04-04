import type { Patent } from '@/types/patent'
import { PORTFOLIO_INIT } from '@/lib/uspto'

const PORTFOLIO_KEY = 'vais:patent-portfolio'
const SCHEMA_VERSION = '3'   // v3: PA-1 status=filed, extended PatentStatus types
const VERSION_KEY    = 'vais:schema-version'

export function loadPortfolio(): Patent[] | null {
  try {
    // If schema version changed, clear stale data so new defaults load
    const storedVersion = localStorage.getItem(VERSION_KEY)
    if (storedVersion !== SCHEMA_VERSION) {
      localStorage.removeItem(PORTFOLIO_KEY)
      localStorage.setItem(VERSION_KEY, SCHEMA_VERSION)
      return null   // caller falls back to PORTFOLIO_INIT
    }
    const raw = localStorage.getItem(PORTFOLIO_KEY)
    return raw ? (JSON.parse(raw) as Patent[]) : null
  } catch {
    return null
  }
}

export function savePortfolio(portfolio: Patent[]): void {
  try {
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolio))
    localStorage.setItem(VERSION_KEY, SCHEMA_VERSION)
  } catch {
    /* storage full or unavailable */
  }
}

export function resetPortfolio(): Patent[] {
  try {
    localStorage.removeItem(PORTFOLIO_KEY)
    localStorage.setItem(VERSION_KEY, SCHEMA_VERSION)
  } catch { /* ignore */ }
  return PORTFOLIO_INIT
}
