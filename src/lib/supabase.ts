/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'
import type { Patent, WizardState } from '@/types/patent'

const url  = import.meta.env.VITE_SUPABASE_URL  as string | undefined
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase = url && key ? createClient(url, key) : null
export const isSupabaseConfigured = () => !!(url && key)

// ── Auth helpers ──────────────────────────────────────────────────────────
export async function signUp(email: string, password: string, fullName: string) {
  if (!supabase) throw new Error('Supabase not configured')
  return supabase.auth.signUp({
    email, password,
    options: { data: { full_name: fullName } }
  })
}

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error('Supabase not configured')
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase not configured')
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  })
}

export async function signOut() {
  if (!supabase) return
  return supabase.auth.signOut()
}

export async function getUser() {
  if (!supabase) return null
  const { data } = await supabase.auth.getUser()
  return data.user
}

// ── Portfolio cloud sync ──────────────────────────────────────────────────
export async function loadPortfolioFromCloud(userId: string): Promise<Patent[] | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('patents')
    .select('*')
    .eq('user_id', userId)
    .order('priority')
  if (error) { console.error('Cloud load error:', error); return null }
  return data?.map(row => ({
    id: row.patent_id,
    title: row.title,
    status: row.status,
    filedDate: row.filed_date,
    appNumber: row.app_number,
    deadline: row.deadline,
    priority: row.priority,
  })) ?? null
}

export async function savePortfolioToCloud(userId: string, portfolio: Patent[]) {
  if (!supabase) return
  const rows = portfolio.map(p => ({
    user_id: userId,
    patent_id: p.id,
    title: p.title,
    status: p.status,
    filed_date: p.filedDate,
    app_number: p.appNumber,
    deadline: p.deadline,
    priority: p.priority,
  }))
  await supabase.from('patents').upsert(rows, { onConflict: 'user_id,patent_id' })
}

// ── Wizard session cloud sync ─────────────────────────────────────────────
export async function saveWizardSession(userId: string, patentId: string, state: Partial<WizardState>) {
  if (!supabase) return
  await supabase.from('wizard_sessions').upsert({
    user_id: userId,
    patent_id: patentId,
    step: state.step ?? 1,
    doc_input: state.docInput ?? '',
    ai_data: state.aiData,
    cover_data: state.coverData,
    checks: state.checks ?? {},
    valid_result: state.validResult,
    app_num: state.appNum ?? '',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,patent_id' })
}

export async function loadWizardSession(userId: string, patentId: string): Promise<Partial<WizardState> | null> {
  if (!supabase) return null
  const { data } = await supabase
    .from('wizard_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('patent_id', patentId)
    .single()
  if (!data) return null
  return {
    step: data.step,
    docInput: data.doc_input,
    aiData: data.ai_data,
    coverData: data.cover_data,
    checks: data.checks,
    validResult: data.valid_result,
    appNum: data.app_num,
  }
}
