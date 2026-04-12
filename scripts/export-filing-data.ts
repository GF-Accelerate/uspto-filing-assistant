#!/usr/bin/env npx tsx
// Export structured filing data for AI-assisted Patent Center form filling
// Usage: npx tsx scripts/export-filing-data.ts PA-5
// Output: filing-data/PA-5-filing-data.json

// Note: Uses relative imports because tsx does not resolve Vite's @/ path aliases
import { buildFilingExportData } from '../src/lib/filing-export'
import { writeFileSync, mkdirSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const patentId = process.argv[2]

if (!patentId) {
  console.error('Usage: npx tsx scripts/export-filing-data.ts <PATENT_ID>')
  console.error('Example: npx tsx scripts/export-filing-data.ts PA-5')
  process.exit(1)
}

try {
  const data = buildFilingExportData(patentId)
  const outDir = resolve(join(__dirname, '..', 'filing-data'))
  mkdirSync(outDir, { recursive: true })
  const outPath = join(outDir, `${patentId}-filing-data.json`)
  writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8')
  console.log(`Filing data exported to: ${outPath}`)
  console.log(`Patent: ${data.applicationDataSheet.title}`)
  console.log(`Inventors: ${data.applicationDataSheet.inventors.map(i => `${i.firstName} ${i.lastName}`).join(', ')}`)
  console.log(`Entity: ${data.fee.entityType} (${data.fee.amount})`)
  console.log(`Documents: ${data.documents.length} files`)
  console.log(`Drawings: ${data.drawingCount} figures`)
} catch (err) {
  console.error(`Error exporting filing data for ${patentId}:`, err)
  process.exit(1)
}
