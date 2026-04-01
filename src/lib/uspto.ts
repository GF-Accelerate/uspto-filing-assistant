import type { Patent } from '@/types/patent'

// USPTO URLs — never hardcode these in components
export const USPTO_URLS = {
  patentCenter:   'https://patentcenter.uspto.gov',
  coverSheet:     'https://www.uspto.gov/sites/default/files/documents/sb0016.pdf',
  feeSchedule:    'https://www.uspto.gov/learning-and-resources/fees-and-payment/uspto-fee-schedule',
  idMe:           'https://help.id.me/hc/en-us/articles/4412245504407',
  assignmentCenter:'https://assignmentcenter.uspto.gov',
  attorneySearch: 'https://oedci.uspto.gov/practitioner-search',
  teasTrademark:  'https://trademarkcenter.uspto.gov',
  priorArtSearch: 'https://ppubs.uspto.gov',
  newAccount:     'https://www.uspto.gov/about-us/usptogov-account',
} as const

// 2026 USPTO Fees (verify annually at USPTO fee schedule)
export const USPTO_FEES = {
  provisionalSmall: '$320',
  provisionalLarge: '$1,600',
  provisionalMicro: '$160',
  nonprovisionalSmall: '$910 + $350 + $400',
  teasPlusPerClass: '$250',
} as const

// Initial patent portfolio — Visionary AI Systems Inc
export const PORTFOLIO_INIT: Patent[] = [
  { id:'PA-1', title:'Voice-Controlled Database Query + Autonomous Agent Execution', status:'filed', filedDate:'2026-03-28', appNumber:'', deadline:'2027-03-28', priority:1 },
  { id:'PA-2', title:'Athletic Department Management Platform (Corrected)', status:'ready', filedDate:null, appNumber:'', deadline:null, priority:1 },
  { id:'PA-3', title:'Multi-Modal Campaign Orchestration via Voice', status:'ready', filedDate:null, appNumber:'', deadline:null, priority:2 },
  { id:'PA-4', title:'Predictive Sports Revenue Intelligence Engine', status:'draft', filedDate:null, appNumber:'', deadline:null, priority:2 },
  { id:'PA-5', title:'Voice-First Agentic Database Infrastructure', status:'planned', filedDate:null, appNumber:'', deadline:null, priority:3 },
]

// 14-item HITL checklist — DO NOT MODIFY without legal review
export const CHECKLIST_ITEMS = [
  { id:'c1',  label:'All inventor legal names listed (human persons only)',     section:'Inventors' },
  { id:'c2',  label:'All inventor mailing addresses and citizenship included',  section:'Inventors' },
  { id:'c3',  label:'Title is technically accurate and descriptive',            section:'Application' },
  { id:'c4',  label:'Assignee is Visionary AI Systems Inc (Georgia Corporation)',section:'Application' },
  { id:'c5',  label:'Small Entity status claimed (50% fee reduction)',          section:'Application' },
  { id:'c6',  label:'Specification complies with 35 U.S.C. §112(a) enablement',section:'Documents' },
  { id:'c7',  label:'Drawings or FIG. diagrams included',                      section:'Documents' },
  { id:'c8',  label:'Claims included (strengthens priority benefit)',           section:'Documents' },
  { id:'c9',  label:'Abstract included (150 words max)',                        section:'Documents' },
  { id:'c10', label:'NO information disclosure statement (not permitted in provisionals)', section:'Documents' },
  { id:'c11', label:'Documents in DOCX or PDF format',                         section:'Documents' },
  { id:'c12', label:'ID.me identity verification complete for USPTO.gov account', section:'Authentication' },
  { id:'c13', label:'MFA configured (Okta Verify — email no longer accepted after Nov 2025)', section:'Authentication' },
  { id:'c14', label:'Payment method ready (credit card or EFT)',                section:'Filing' },
] as const

export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
}

export function addOneYear(isoDate: string): string {
  const d = new Date(isoDate)
  d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().split('T')[0]
}

export function isInvalidInventor(name: string): boolean {
  const invalid = ['batman mo', 'development team', 'ksu', 'kennesaw state']
  return invalid.some(s => name.toLowerCase().includes(s))
}
