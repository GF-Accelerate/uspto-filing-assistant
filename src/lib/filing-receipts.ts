// Filing receipt storage — localStorage now, Supabase later
// Stores official USPTO filing receipt data for each patent

export interface FilingReceipt {
  id: string
  patentId: string
  appNumber: string
  filingDate: string
  confirmationNumber?: string
  nonprovisionalDeadline: string
  entityStatus: string
  feesPaid: number
  notes?: string
  createdAt: string
}

const RECEIPTS_KEY = 'vais:filing-receipts'

// Seed receipts for patents filed before the app was built
const SEED_RECEIPTS: FilingReceipt[] = [
  {
    id: 'receipt-rs1-seed',
    patentId: 'RS-1',
    appNumber: '63/862,821',
    filingDate: '2025-08-13',
    confirmationNumber: '1993',
    nonprovisionalDeadline: '2026-08-13',
    entityStatus: 'Micro Entity',
    feesPaid: 130,
    notes: 'Revenue Shield AI, LLC — separate entity from VAIS. Inventors: Milton Overton, Lisa Overton, Mel Clemmons.',
    createdAt: '2025-08-13T00:00:00.000Z',
  },
]

function loadReceipts(): FilingReceipt[] {
  try {
    const raw = localStorage.getItem(RECEIPTS_KEY)
    const stored: FilingReceipt[] = raw ? JSON.parse(raw) : []
    // Auto-seed known receipts that aren't in localStorage yet
    let changed = false
    for (const seed of SEED_RECEIPTS) {
      if (!stored.some(r => r.patentId === seed.patentId)) {
        stored.push(seed)
        changed = true
      }
    }
    if (changed) {
      try { localStorage.setItem(RECEIPTS_KEY, JSON.stringify(stored)) } catch { /* */ }
    }
    return stored
  } catch {
    return [...SEED_RECEIPTS]
  }
}

function saveReceipts(receipts: FilingReceipt[]): void {
  try {
    localStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts))
  } catch { /* storage full */ }
}

export function getAllReceipts(): FilingReceipt[] {
  return loadReceipts()
}

export function getReceiptByPatent(patentId: string): FilingReceipt | null {
  return loadReceipts().find(r => r.patentId === patentId) ?? null
}

export function saveReceipt(receipt: Omit<FilingReceipt, 'id' | 'createdAt'>): FilingReceipt {
  const full: FilingReceipt = {
    ...receipt,
    id: `receipt-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  const all = loadReceipts()
  // Replace existing receipt for same patent, or add new
  const idx = all.findIndex(r => r.patentId === receipt.patentId)
  if (idx >= 0) {
    all[idx] = full
  } else {
    all.push(full)
  }
  saveReceipts(all)
  return full
}

export function deleteReceipt(patentId: string): void {
  const all = loadReceipts().filter(r => r.patentId !== patentId)
  saveReceipts(all)
}
