import { useState, useCallback } from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { getFlags, setFlag, resetFlags } from '@/lib/feature-flags'
import type { FeatureFlags as FeatureFlagsType } from '@/lib/feature-flags'
import { Button } from '@/components/ui/Button'

const FLAG_DESCRIPTIONS: Record<keyof FeatureFlagsType, string> = {
  voice_assistant_enabled: 'Enable the floating voice AI assistant panel',
  ai_analysis_enabled: 'Enable Claude AI analysis in the filing wizard',
  docx_generation_enabled: 'Enable in-app DOCX document generation',
  drawing_generator_enabled: 'Enable Mermaid.js patent drawing generation',
  odp_api_integration: 'Enable USPTO Open Data Portal API integration',
  multi_patent_filing: 'Allow filing multiple patents in batch mode',
  admin_console_enabled: 'Show admin console navigation links',
  legal_docs_enabled: 'Show legal document downloads',
  trademark_module_enabled: 'Show trademark filing module',
  prior_art_search_enabled: 'Show prior art search module',
  filing_package_enabled: 'Enable one-click filing package generation',
  reusable_profiles_enabled: 'Enable reusable inventor/assignee profiles',
  strategy_docs_enabled: 'Enable IP strategy document builder page',
  invention_capture_enabled: 'VCE: Camera capture + AI vision analysis of physical inventions',
  domain_intelligence_enabled: 'DIC: Industry-specific data capture for vertical AI model training',
  physical_digital_bridge_enabled: 'PDB: Photo-to-patent documentation pipeline (figures, specs, claims)',
  ai_filing_export_enabled: 'Export structured JSON for AI-assisted Patent Center form filling via Playwright MCP',
}

export function FeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlagsType>(getFlags)
  const [saved, setSaved] = useState(false)

  const handleToggle = useCallback((key: keyof FeatureFlagsType) => {
    const newValue = !flags[key]
    setFlag(key, newValue)
    setFlags(prev => ({ ...prev, [key]: newValue }))
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }, [flags])

  const handleReset = useCallback(() => {
    resetFlags()
    setFlags(getFlags())
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }, [])

  const enabledCount = Object.values(flags).filter(Boolean).length
  const totalCount = Object.keys(flags).length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Feature Flags</h1>
          <p className="text-sm text-slate-500">{enabledCount} of {totalCount} features enabled</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs text-green-600 font-medium">Saved</span>}
          <Button size="sm" onClick={handleReset}>Reset to Defaults</Button>
        </div>
      </div>

      <Card>
        <CardHeader title="All Feature Flags" right={
          <span className="text-xs text-slate-400">Changes apply immediately</span>
        } />
        <CardBody>
          <div className="divide-y divide-slate-100">
            {(Object.keys(flags) as Array<keyof FeatureFlagsType>).map(key => (
              <div key={key} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium text-slate-800">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{FLAG_DESCRIPTIONS[key]}</div>
                  <code className="text-xs text-slate-400 font-mono">{key}</code>
                </div>
                <button
                  onClick={() => handleToggle(key)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    flags[key] ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    flags[key] ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
