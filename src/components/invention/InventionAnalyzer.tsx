// InventionAnalyzer — AI vision analysis panel for captured invention images
// Part of VCE + PDB pipeline. Shows analysis results and generated patent content.
// Feature-flagged: invention_capture_enabled

import { useState, useCallback } from 'react'
import type { CapturedImage, InventionAnalysis, PhysicalDigitalMapping } from '@/types/patent'
import { analyzeInventionImage, getAllCaptures, deleteCapture } from '@/lib/vadi/vce'
import { generateAllMappingsFromAnalysis } from '@/lib/vadi/pdb'

interface InventionAnalyzerProps {
  patentId: string
  patentTitle: string
  claimSummary: string
  onMappingsGenerated?: (mappings: PhysicalDigitalMapping[]) => void
}

export function InventionAnalyzer({
  patentId, patentTitle, claimSummary, onMappingsGenerated
}: InventionAnalyzerProps) {
  const [captures] = useState<CapturedImage[]>(() =>
    getAllCaptures().filter(c => c.patentId === patentId || c.patentId === null)
  )
  const [selectedImage, setSelectedImage] = useState<CapturedImage | null>(null)
  const [analysis, setAnalysis] = useState<InventionAnalysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mappings, setMappings] = useState<PhysicalDigitalMapping[]>([])

  const runAnalysis = useCallback(async (image: CapturedImage) => {
    setAnalyzing(true)
    setError(null)
    setAnalysis(null)
    setMappings([])
    setSelectedImage(image)

    try {
      const result = await analyzeInventionImage(image.dataUrl, {
        patentId,
        title: patentTitle,
        claimSummary,
      })
      result.imageId = image.id
      setAnalysis(result)

      // Generate patent document mappings
      const generated = generateAllMappingsFromAnalysis(
        result, image.id, patentId, 6, 21 // Start from FIG. 6, paragraph [0021]
      )
      setMappings(generated)
      onMappingsGenerated?.(generated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }, [patentId, patentTitle, claimSummary, onMappingsGenerated])

  const handleDelete = useCallback((imageId: string) => {
    deleteCapture(imageId)
    if (selectedImage?.id === imageId) {
      setSelectedImage(null)
      setAnalysis(null)
      setMappings([])
    }
  }, [selectedImage])

  if (captures.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p className="text-sm">No invention images captured yet.</p>
        <p className="text-xs mt-1">Use the camera or upload photos to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Image gallery */}
      <div className="grid grid-cols-3 gap-2">
        {captures.map(img => (
          <div
            key={img.id}
            className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition-colors
              ${selectedImage?.id === img.id ? 'border-blue-500' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}
          >
            <img
              src={img.dataUrl}
              alt={img.label}
              onClick={() => runAnalysis(img)}
              className="w-full aspect-square object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1 py-0.5">
              <p className="text-xs text-white truncate">{img.label}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(img.id) }}
              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs
                flex items-center justify-center hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Analysis loading state */}
      {analyzing && (
        <div className="text-center py-6">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Analyzing invention image...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Analysis results */}
      {analysis && (
        <div className="space-y-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200">Analysis Results</h4>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Confidence: {Math.round(analysis.confidence * 100)}%
            </p>
          </div>

          {/* Components detected */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
            <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Components Identified ({analysis.components.length})
            </h5>
            <ul className="mt-2 space-y-1">
              {analysis.components.map((c, i) => (
                <li key={i} className="text-sm text-gray-800 dark:text-gray-200 flex items-start gap-2">
                  <span className={`inline-block w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                    c.noveltyIndicator === 'novel' ? 'bg-green-500' :
                    c.noveltyIndicator === 'known' ? 'bg-gray-400' : 'bg-yellow-500'
                  }`} />
                  <span><strong>{c.name}</strong> — {c.description}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Functional description */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
            <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Functional Description
            </h5>
            <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{analysis.functionalDescription}</p>
          </div>

          {/* Suggested claim elements */}
          {analysis.suggestedClaimElements.length > 0 && (
            <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-3">
              <h5 className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">
                Suggested Claim Elements
              </h5>
              <ul className="mt-1 space-y-1">
                {analysis.suggestedClaimElements.map((el, i) => (
                  <li key={i} className="text-sm text-green-800 dark:text-green-200">• {el}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Generated document mappings */}
          {mappings.length > 0 && (
            <div className="rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-3">
              <h5 className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                Generated Patent Content ({mappings.length} sections)
              </h5>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Status: Draft — requires HAL approval before inclusion in filing documents
              </p>
              <ul className="mt-2 space-y-1">
                {mappings.map(m => (
                  <li key={m.id} className="text-xs text-purple-800 dark:text-purple-200">
                    ✎ {m.targetDocument} → {m.mappingType}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
