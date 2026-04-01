import type { Patent } from '@/types/patent'

const PORTFOLIO_KEY = 'vais:patent-portfolio'

export function loadPortfolio(): Patent[] | null {
  try {
    const raw = localStorage.getItem(PORTFOLIO_KEY)
    return raw ? (JSON.parse(raw) as Patent[]) : null
  } catch { return null }
}

export function savePortfolio(portfolio: Patent[]): void {
  try { localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolio)) }
  catch { /* storage full or unavailable */ }
}
