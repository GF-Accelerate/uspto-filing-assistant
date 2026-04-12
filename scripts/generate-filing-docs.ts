#!/usr/bin/env npx tsx
// Generate USPTO filing DOCX files to disk for a given patent ID.
//
// Usage: npx tsx scripts/generate-filing-docs.ts PA-5
// Output:
//   filing-data/PA-5/PA-5-Specification.docx
//   filing-data/PA-5/PA-5-Cover-Sheet-PTO-SB-16.docx
//   filing-data/PA-5/MANIFEST.txt
//
// Uses docx-generator's Document-building logic and Packer.toBuffer to
// write files directly. The browser-only file-saver dependency is
// loaded dynamically in docx-generator, so this script can import it
// from Node without crashing.

import { writeFileSync, mkdirSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { PATENT_SPECS } from '../src/lib/uspto'
import { buildExtractedData } from '../src/lib/filing-export'
import { generateSpecDOCX, generateCoverSheetDOCX } from '../src/lib/docx-generator'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const patentId = process.argv[2]

if (!patentId) {
  console.error('Usage: npx tsx scripts/generate-filing-docs.ts <PATENT_ID>')
  console.error('Example: npx tsx scripts/generate-filing-docs.ts PA-5')
  process.exit(1)
}

async function blobToBuffer(blob: Blob): Promise<Buffer> {
  // In Node, docx Packer.toBlob may return a Blob-like (Uint8Array wrapper)
  // or a real Blob (Node 18+). Handle both.
  if (typeof (blob as unknown as { arrayBuffer?: () => Promise<ArrayBuffer> }).arrayBuffer === 'function') {
    const ab = await blob.arrayBuffer()
    return Buffer.from(ab)
  }
  return Buffer.from(blob as unknown as ArrayBuffer)
}

async function main(): Promise<void> {
  const specText = PATENT_SPECS[patentId]
  if (!specText) {
    console.error(`No specification found for patent ${patentId}`)
    console.error(`Available: ${Object.keys(PATENT_SPECS).join(', ')}`)
    process.exit(1)
  }

  const titleMatch = specText.match(/TITLE:\s*(.+)/)
  const title = titleMatch?.[1]?.trim() ?? `${patentId} Patent Specification`

  const data = buildExtractedData(patentId)

  console.log(`Generating filing documents for ${patentId}...`)
  console.log(`  Title: ${title}`)
  console.log(`  Inventors: ${data.inventors.map(i => i.name).join(', ')}`)
  console.log(`  Assignee: ${data.assignee.name}`)
  console.log(`  Entity: ${data.entityStatus}`)

  // Build docs. Packer.toBlob works in Node 18+ thanks to native Blob.
  // If it returns a Buffer directly we adapt below.
  const specBlob  = await generateSpecDOCX(specText, title, patentId)
  const coverBlob = await generateCoverSheetDOCX(data, null, patentId)

  const specBuf  = await blobToBuffer(specBlob)
  const coverBuf = await blobToBuffer(coverBlob)

  // Write to filing-data/{patentId}/
  const outDir = resolve(join(__dirname, '..', 'filing-data', patentId))
  mkdirSync(outDir, { recursive: true })

  const safeName = patentId.replace(/[^a-zA-Z0-9-]/g, '')
  const specPath  = join(outDir, `${safeName}-Specification.docx`)
  const coverPath = join(outDir, `${safeName}-Cover-Sheet-PTO-SB-16.docx`)

  writeFileSync(specPath, specBuf)
  writeFileSync(coverPath, coverBuf)

  // Also write a short manifest
  const manifestPath = join(outDir, 'MANIFEST.txt')
  const manifest = [
    `Filing Package for ${patentId}`,
    `Title: ${title}`,
    `Generated: ${new Date().toISOString()}`,
    `Entity: ${data.entityStatus}`,
    `Assignee: ${data.assignee.name} (${data.assignee.state})`,
    `Inventors: ${data.inventors.map(i => i.name).join(', ')}`,
    '',
    'DOCUMENT TYPE MAPPING FOR PATENT CENTER:',
    '─────────────────────────────────────────',
    `${safeName}-Specification.docx          → "Specification"`,
    `${safeName}-Cover-Sheet-PTO-SB-16.docx  → "Provisional Cover Sheet (SB16)"`,
    '(Drawing PDFs generated separately via scripts/generate-drawings.ts)',
    '',
    'NEXT STEPS:',
    '1. Go to patentcenter.uspto.gov and log in',
    '2. Start new Provisional submission',
    '3. Upload each document with the Document Type shown above',
    '4. Calculate fees → verify $320 → Pay → Submit',
    '5. Save the Application Number',
    '',
  ].join('\n')
  writeFileSync(manifestPath, manifest, 'utf-8')

  // Report sizes
  const sizeKB = (n: number): string => `${(n / 1024).toFixed(1)} KB`
  console.log('')
  console.log('Written:')
  console.log(`  ${specPath} (${sizeKB(specBuf.length)})`)
  console.log(`  ${coverPath} (${sizeKB(coverBuf.length)})`)
  console.log(`  ${manifestPath}`)
  console.log('')
  console.log('Done. Ready to upload to Patent Center.')
}

main().catch((err) => {
  console.error('Error generating filing docs:', err)
  process.exit(1)
})
