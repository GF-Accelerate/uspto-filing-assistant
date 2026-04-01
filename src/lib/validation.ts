import type { ExtractedFilingData } from '@/types/patent'
import { isInvalidInventor } from './uspto'

export interface ValidationIssue { field: string; message: string }

export function validateFilingData(data: ExtractedFilingData): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  if (!data.title?.trim()) issues.push({ field:'title', message:'Title is required' })
  if (!data.inventors?.length) issues.push({ field:'inventors', message:'At least one inventor is required' })
  data.inventors?.forEach((inv, i) => {
    if (isInvalidInventor(inv.name)) issues.push({ field:`inventors[${i}]`, message:`Invalid inventor name: "${inv.name}" — must be a human person's legal name` })
    if (!inv.address?.trim()) issues.push({ field:`inventors[${i}].address`, message:'Inventor address is required' })
    if (!inv.citizenship?.trim()) issues.push({ field:`inventors[${i}].citizenship`, message:'Inventor citizenship is required' })
  })
  if (data.assignee?.name?.toLowerCase().includes('ksu') || data.assignee?.name?.toLowerCase().includes('kennesaw state')) {
    issues.push({ field:'assignee', message:'KSU / Kennesaw State University has NO ownership interest — assignee must be Visionary AI Systems Inc' })
  }
  return issues
}
