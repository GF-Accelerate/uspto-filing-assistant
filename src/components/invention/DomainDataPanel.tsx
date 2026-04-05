// DomainDataPanel — Industry data capture and training readiness dashboard
// Part of DIC (Domain Intelligence Collector). Feature-flagged: domain_intelligence_enabled
//
// Shows registered domain schemas, data capture stats, and model training readiness.
// Enables registering new domains from templates (e.g., College Sports).

import { useState, useCallback } from 'react'
import { useDomainIntel } from '@/hooks/useDomainIntel'
import type { DomainSchema, TrainingDataSummary } from '@/types/patent'

interface DomainDataPanelProps {
  className?: string
}

export function DomainDataPanel({ className = '' }: DomainDataPanelProps) {
  const {
    schemas, registerCollegeSports, getSummary, clearAll
  } = useDomainIntel()
  const [selectedSchema, setSelectedSchema] = useState<DomainSchema | null>(null)
  const [summary, setSummary] = useState<TrainingDataSummary | null>(null)
  const [showConfirmClear, setShowConfirmClear] = useState(false)

  const handleSelectSchema = useCallback((schema: DomainSchema) => {
    setSelectedSchema(schema)
    setSummary(getSummary(schema.id))
  }, [getSummary])

  const handleRegisterSports = useCallback(() => {
    const schema = registerCollegeSports()
    setSelectedSchema(schema)
    setSummary(getSummary(schema.id))
  }, [registerCollegeSports, getSummary])

  return (
    <div className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-lg">🧠</span>
          Domain Intelligence
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Industry-specific data capture for vertical AI model training
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Registered schemas */}
        {schemas.length > 0 ? (
          <div className="space-y-2">
            {schemas.map(schema => (
              <button
                key={schema.id}
                onClick={() => handleSelectSchema(schema)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedSchema?.id === schema.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{schema.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                    {schema.vertical}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {schema.dataCategories.length} categories · v{schema.version}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <p className="text-sm">No domain schemas registered</p>
          </div>
        )}

        {/* Quick register buttons */}
        <div className="flex gap-2">
          {!schemas.some(s => s.vertical === 'sports') && (
            <button
              onClick={handleRegisterSports}
              className="flex-1 px-3 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700
                rounded-md transition-colors"
            >
              Register College Sports
            </button>
          )}
        </div>

        {/* Selected schema details */}
        {selectedSchema && (
          <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              {selectedSchema.name}
            </h4>

            {/* Categories */}
            <div className="space-y-1">
              {selectedSchema.dataCategories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between text-xs p-2
                  bg-gray-50 dark:bg-gray-700/50 rounded">
                  <span className="text-gray-800 dark:text-gray-200">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">{cat.fields.length} fields</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs ${
                      cat.privacyLevel === 'pii' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                      cat.privacyLevel === 'confidential' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    }`}>
                      {cat.privacyLevel}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Training readiness */}
            {summary && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Model Training Readiness
                  </span>
                  <span className={`text-xs font-bold ${
                    summary.estimatedModelReadiness >= 80 ? 'text-green-600' :
                    summary.estimatedModelReadiness >= 40 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {summary.estimatedModelReadiness}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      summary.estimatedModelReadiness >= 80 ? 'bg-green-500' :
                      summary.estimatedModelReadiness >= 40 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${summary.estimatedModelReadiness}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{summary.totalEvents} total events</span>
                  <span>
                    {Object.keys(summary.categoryCounts).length}/{selectedSchema.dataCategories.length} categories active
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Admin: clear data */}
        {schemas.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            {showConfirmClear ? (
              <div className="flex gap-2">
                <button
                  onClick={() => { clearAll(); setShowConfirmClear(false); setSelectedSchema(null); setSummary(null) }}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded"
                >
                  Confirm Clear All
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear all domain data
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
