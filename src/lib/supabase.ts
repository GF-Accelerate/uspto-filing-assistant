/// <reference types="vite/client" />

// Supabase client — currently optional (falls back to localStorage if not configured)
// To activate: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel
// Full migration guide: see SUPABASE.md

let supabaseClient: ReturnType<typeof import('@supabase/supabase-js').createClient> | null = null

export async function getSupabase() {
  const url  = import.meta.env.VITE_SUPABASE_URL
  const key  = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return null   // Not configured — app uses localStorage

  if (!supabaseClient) {
    const { createClient } = await import('@supabase/supabase-js')
    supabaseClient = createClient(url, key)
  }
  return supabaseClient
}

export const isSupabaseConfigured = () =>
  !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY
