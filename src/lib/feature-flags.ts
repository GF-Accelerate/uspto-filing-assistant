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
}

export type FlagKey = keyof FeatureFlags

const DEFAULT_FLAGS: FeatureFlags = {
  voice_assistant_enabled: true,
  ai_analysis_enabled: true,
  docx_generation_enabled: true,
  drawing_generator_enabled: true,
  odp_api_integration: false,
  multi_patent_filing: false,
  admin_console_enabled: false,
  legal_docs_enabled: true,
  trademark_module_enabled: true,
  prior_art_search_enabled: true,
  filing_package_enabled: true,
  reusable_profiles_enabled: true,
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
