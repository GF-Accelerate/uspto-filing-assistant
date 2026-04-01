import { useRef, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { PA1_SPEC_SUMMARY } from '@/lib/uspto'

interface Props {
  patentId: string
  value: string
  onChange: (v: string) => void
  onAnalyze: () => void
  loading: boolean
}

const ACCEPTED = '.txt,.md,.docx,.doc'

export function Step1Input({ patentId, value, onChange, onAnalyze, loading }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()

    if (ext === 'txt' || ext === 'md') {
      onChange(await file.text())
      return
    }

    if (ext === 'docx' || ext === 'doc') {
      try {
        const { default: JSZip } = await import('jszip')
        const zip = await JSZip.loadAsync(await file.arrayBuffer())
        const xml = await zip.file('word/document.xml')?.async('string')
        if (xml) {
          const text = xml
            .replace(/<w:p[ >][^>]*>/g, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/&amp;/g, '&').replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>').replace(/&quot;/g, '"')
            .replace(/\n{3,}/g, '\n\n')
            .trim()
          onChange(text)
          return
        }
      } catch { /* fall through */ }
      onChange(`[Could not extract text from ${file.name}. Try saving as .txt and uploading again.]`)
      return
    }

    if (ext === 'pdf') {
      onChange(
        `[PDF uploaded: ${file.name}]\n\n` +
        `PDFs cannot be read directly in the browser. Please either:\n` +
        `  1. Copy and paste the text from your PDF viewer\n` +
        `  2. Save as .docx or .txt and upload again\n` +
        `  3. Click "Load ${patentId} patent text" below to use the pre-built specification`
      )
      return
    }

    onChange(`[Unsupported file: ${file.name}. Use .txt, .md, or .docx]`)
  }, [onChange, patentId])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  // Pre-fill text from the built patent spec
  const specText = patentId === 'PA-1' ? PA1_SPEC_SUMMARY : null

  return (
    <div>
      <p className="text-sm text-slate-500 mb-3 leading-relaxed">
        Upload your provisional patent application or paste the text below.
        Claude will extract all required USPTO filing data.
      </p>

      {/* Quick-load for built patents */}
      {specText && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-green-800">
              {patentId} patent specification is ready
            </p>
            <p className="text-xs text-green-600 mt-0.5">
              Click to pre-load the complete prepared specification for analysis
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onChange(specText)}
          >
            Load {patentId} text ↓
          </Button>
        </div>
      )}

      {/* Upload drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors mb-3 group"
      >
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        <p className="text-xl mb-0.5">📄</p>
        <p className="text-sm font-medium text-slate-600 group-hover:text-blue-700">
          Click to upload or drag & drop
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          .docx · .txt · .md supported
        </p>
        {value.length > 100 && (
          <p className="text-xs text-green-600 mt-1 font-medium">
            ✓ {value.length.toLocaleString()} characters loaded
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400">or paste text</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={10}
        className="w-full px-3 py-2 border border-slate-200 rounded text-sm font-mono bg-slate-50 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={"TITLE: System and Method for...\n\nINVENTORS: Milton Overton, Kennesaw GA 30144...\n\nASSIGNEE: Visionary AI Systems Inc..."}
      />

      {!specText && (
        <Alert variant="info" className="mt-2 text-xs">
          <strong>Tip:</strong> Your patent documents are in the project files.
          Upload the <code className="bg-blue-100 px-1 rounded">.md</code> or{' '}
          <code className="bg-blue-100 px-1 rounded">.docx</code> file or copy the text here.
        </Alert>
      )}

      <div className="flex items-center gap-3 mt-3">
        <Button
          variant="primary"
          onClick={onAnalyze}
          disabled={loading || !value.trim()}
        >
          {loading ? 'Analyzing…' : 'Analyze with AI ↗'}
        </Button>
        <span className="text-xs text-slate-400">{value.length.toLocaleString()} chars</span>
        {value && (
          <button
            onClick={() => onChange('')}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors ml-auto"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
