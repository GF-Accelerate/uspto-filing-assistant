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

function loadReceipts(): FilingReceipt[] {
  try {
    const raw = localStorage.getItem(RECEIPTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
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
