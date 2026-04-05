// Feature Flags — Phase 1: localStorage-backed
// Phase 2: migrate to Supabase feature_flags table with scope hierarchy

const STORAGE_KEY = 'uspto-feature-flags-v1'

export interface FeatureFlags {
  voice_assistant_enabled: boolean
  ai_analysis_enabled: boolean
  docx_generation_enabled: boolean
  drawing_generator_enabled: boolean
  odp_api_integration: boolean
  multi_patent_filing: boolean
  admin_console_enabled: boolean
  legal_docs_enabled: boolean
  trademark_module_enabled: boolean
  prior_art_search_enabled: boolean
  filing_package_enabled: boolean
  reusable_profiles_enabled: boolean
  // PA-5 Extension: VCE + DIC + PDB primitives (disabled by default)
  invention_capture_enabled: boolean    // VCE: camera + AI vision analysis
  domain_intelligence_enabled: boolean  // DIC: industry data capture
  physical_digital_bridge_enabled: boolean  // PDB: photo-to-patent-doc pipeline
}

export type FlagKey = keyof FeatureFlags

const DEFAULT_FLAGS: FeatureFlags = {
  voice_assistant_enabled: true,
  ai_analysis_enabled: true,
  docx_generation_enabled: true,
  drawing_generator_enabled: true,
  odp_api_integration: false,
  multi_patent_filing: true,
  admin_console_enabled: true,
  legal_docs_enabled: true,
  trademark_module_enabled: true,
  prior_art_search_enabled: true,
  filing_package_enabled: true,
  reusable_profiles_enabled: true,
  // New VADI primitives — enabled for admin/owner access
  invention_capture_enabled: true,
  domain_intelligence_enabled: true,
  physical_digital_bridge_enabled: true,
}

export function loadFeatureFlags(): FeatureFlags {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_FLAGS }
    const stored = JSON.parse(raw) as Partial<FeatureFlags>
    // Merge with defaults so new flags get their default value
    return { ...DEFAULT_FLAGS, ...stored }
  } catch {
    return { ...DEFAULT_FLAGS }
  }
}

export function saveFeatureFlags(flags: FeatureFlags): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flags))
}

export function isEnabled(key: FlagKey): boolean {
  const flags = loadFeatureFlags()
  return flags[key] ?? false
}

export function toggleFlag(key: FlagKey): FeatureFlags {
  const flags = loadFeatureFlags()
  flags[key] = !flags[key]
  saveFeatureFlags(flags)
  return flags
}

// Aliases for admin UI
export const getFlags = loadFeatureFlags

export function setFlag(key: FlagKey, value: boolean): void {
  const flags = loadFeatureFlags()
  flags[key] = value
  saveFeatureFlags(flags)
}

export function resetFlags(): void {
  saveFeatureFlags({ ...DEFAULT_FLAGS })
}

// ── Admin feature access ──────────────────────────────────────────────────
// Enables all features for admin users. Call on login or role detection.
// In Phase 1 (no auth), all features default to enabled.
// In Phase 2 (Supabase), call this after confirming admin role.

const ALL_ENABLED: FeatureFlags = {
  voice_assistant_enabled: true,
  ai_analysis_enabled: true,
  docx_generation_enabled: true,
  drawing_generator_enabled: true,
  odp_api_integration: true,
  multi_patent_filing: true,
  admin_console_enabled: true,
  legal_docs_enabled: true,
  trademark_module_enabled: true,
  prior_art_search_enabled: true,
  filing_package_enabled: true,
  reusable_profiles_enabled: true,
  invention_capture_enabled: true,
  domain_intelligence_enabled: true,
  physical_digital_bridge_enabled: true,
}

export function enableAllForAdmin(): void {
  saveFeatureFlags({ ...ALL_ENABLED })
}

export function isAdminEmail(email: string): boolean {
  const ADMIN_EMAILS = ['moverton7474@gmail.com']
  return ADMIN_EMAILS.includes(email.toLowerCase())
}
