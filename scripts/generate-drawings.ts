#!/usr/bin/env npx tsx
// Generate patent drawings to disk for a given patent ID.
//
// Usage: npx tsx scripts/generate-drawings.ts PA-5
// Output:
//   filing-data/PA-5/drawings/FIG-1.mmd   (Mermaid source)
//   filing-data/PA-5/drawings/FIG-1.svg   (rendered SVG)
//   filing-data/PA-5/drawings/FIG-1.pdf   (USPTO 8.5x11" PDF)
//   ... one triple per figure ...
//   filing-data/PA-5/drawings/README.md
//
// Rendering strategy:
//   1. Always write the .mmd source files — source of truth.
//   2. Launch headless Chromium via Playwright (already a devDep).
//   3. Load a tiny HTML page that bundles Mermaid from CDN, renders each
//      figure, and prints the page to PDF with USPTO-compliant layout
//      (8.5x11", 1" margins, figure centered, caption at bottom).
//   4. Also extract the raw SVG for Patent Center direct upload.

import { writeFileSync, mkdirSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { chromium, type Browser } from '@playwright/test'
import { PATENT_DRAWINGS } from '../src/lib/patent-drawings'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const patentId = process.argv[2]
const skipRender = process.argv.includes('--no-render')

if (!patentId) {
  console.error('Usage: npx tsx scripts/generate-drawings.ts <PATENT_ID> [--no-render]')
  console.error('Example: npx tsx scripts/generate-drawings.ts PA-5')
  process.exit(1)
}

const figures = PATENT_DRAWINGS[patentId]
if (!figures || figures.length === 0) {
  console.error(`No drawings defined for patent ${patentId}`)
  console.error(`Available: ${Object.keys(PATENT_DRAWINGS).filter(id => PATENT_DRAWINGS[id].length > 0).join(', ')}`)
  process.exit(1)
}

const outDir = resolve(join(__dirname, '..', 'filing-data', patentId, 'drawings'))
mkdirSync(outDir, { recursive: true })

console.log(`Generating ${figures.length} drawings for ${patentId}...`)
console.log(`  Output: ${outDir}`)
console.log('')

// ── Shared Mermaid theme matching the web app ──────────────────────────
const MERMAID_INIT = `%%{init: {
  "theme": "base",
  "themeVariables": {
    "primaryColor": "#f0f4ff",
    "primaryBorderColor": "#1e3a5f",
    "primaryTextColor": "#1e293b",
    "lineColor": "#334155",
    "secondaryColor": "#e8f4fd",
    "tertiaryColor": "#f8fafc",
    "background": "#ffffff",
    "mainBkg": "#f0f4ff",
    "nodeBorder": "#1e3a5f",
    "clusterBkg": "#f0f4ff",
    "titleColor": "#1e293b",
    "edgeLabelBackground": "#ffffff",
    "fontFamily": "Arial, sans-serif",
    "fontSize": "13px"
  }
}}%%`

// ── Step 1: write .mmd source files ──────────────────────────────
const written: { figNum: string; title: string; safeName: string; mmd: string; svg: string | null; pdf: string | null }[] = []
for (const fig of figures) {
  const safeName = fig.figNum.replace(/[^A-Z0-9]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  const mmdPath = join(outDir, `${safeName}.mmd`)
  writeFileSync(mmdPath, MERMAID_INIT + '\n' + fig.mermaid, 'utf-8')
  written.push({ figNum: fig.figNum, title: fig.title, safeName, mmd: mmdPath, svg: null, pdf: null })
  console.log(`  Wrote ${safeName}.mmd`)
}

// ── Step 2: render via Playwright ────────────────────────────────
if (!skipRender) {
  console.log('')
  console.log('Launching headless Chromium via Playwright...')
  await renderAllWithPlaywright()
}

// ── Step 3: write README ─────────────────────────────────────────
const readmePath = join(outDir, 'README.md')
const readme = [
  `# ${patentId} Drawings`,
  '',
  `Generated: ${new Date().toISOString()}`,
  `Source: \`src/lib/patent-drawings.ts\` (${patentId})`,
  '',
  '## Figures',
  '',
  ...written.map((w, i) => {
    const lines = [`${i + 1}. **${w.figNum}** — ${w.title}`, `   Source: \`${w.safeName}.mmd\``]
    if (w.svg) lines.push(`   SVG: \`${w.safeName}.svg\``)
    if (w.pdf) lines.push(`   PDF: \`${w.safeName}.pdf\``)
    return lines.join('\n')
  }),
  '',
  '## How to regenerate',
  '',
  '### Option A — CLI (fastest)',
  '```bash',
  `npx tsx scripts/generate-drawings.ts ${patentId}`,
  '```',
  '',
  '### Option B — web app',
  '1. `npm run dev`',
  `2. Go to \`/drawings\` → select **${patentId}**`,
  '3. Click "Render all figures" → download PDF/SVG',
  '',
  '## Patent Center upload',
  '',
  'Upload each PDF with document type **Drawings** in Patent Center.',
  `Filename pattern: \`${patentId}-FIG-N.pdf\``,
  '',
].join('\n')
writeFileSync(readmePath, readme, 'utf-8')
console.log('')
console.log(`Wrote ${readmePath}`)
console.log('')
console.log('Done.')

// ── Playwright render function ───────────────────────────────────

async function renderAllWithPlaywright(): Promise<void> {
  let browser: Browser | null = null
  try {
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
      viewport: { width: 1200, height: 1600 },
      deviceScaleFactor: 2,
    })
    const page = await context.newPage()

    for (const entry of written) {
      const fig = figures.find(f => f.figNum === entry.figNum)!
      const htmlPage = buildHTMLForFigure(fig.mermaid, entry.figNum, entry.title)
      await page.setContent(htmlPage, { waitUntil: 'networkidle' })
      // Wait for mermaid to finish rendering
      await page.waitForFunction(() => {
        const el = document.querySelector('#diagram svg')
        return !!el
      }, { timeout: 30000 })

      // Extract raw SVG
      const svgMarkup = await page.evaluate(() => {
        const svg = document.querySelector('#diagram svg')
        return svg ? svg.outerHTML : null
      })
      if (svgMarkup) {
        const svgPath = join(outDir, `${entry.safeName}.svg`)
        writeFileSync(svgPath, svgMarkup, 'utf-8')
        entry.svg = svgPath
      }

      // Print to PDF — USPTO 8.5x11", 1" margins
      const pdfPath = join(outDir, `${entry.safeName}.pdf`)
      await page.pdf({
        path: pdfPath,
        format: 'Letter',
        margin: { top: '1in', left: '1in', right: '0.625in', bottom: '0.375in' },
        printBackground: true,
        preferCSSPageSize: false,
      })
      entry.pdf = pdfPath

      console.log(`  Rendered ${entry.safeName}.svg + ${entry.safeName}.pdf`)
    }

    await context.close()
  } finally {
    if (browser) await browser.close()
  }
}

function buildHTMLForFigure(mermaidCode: string, figNum: string, title: string): string {
  const fullCode = MERMAID_INIT + '\n' + mermaidCode
  // Inline a small HTML document that loads Mermaid from CDN and renders
  // one diagram into #diagram. CSS sizes the diagram to fit an 8.5x11"
  // page with USPTO margins and adds a caption + header.
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(figNum)}</title>
<style>
  html, body {
    margin: 0;
    padding: 0;
    font-family: Arial, Helvetica, sans-serif;
    background: #ffffff;
    color: #1e293b;
  }
  .page {
    width: 6.875in;   /* 8.5 - 1 - 0.625 */
    min-height: 9in;  /* 11 - 1 - 0.375 (approx) */
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 0;
  }
  .header {
    width: 100%;
    text-align: center;
    font-weight: bold;
    font-size: 11pt;
    margin-bottom: 0.2in;
  }
  .diagram {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .diagram svg {
    max-width: 100% !important;
    max-height: 100% !important;
    height: auto !important;
  }
  .caption {
    width: 100%;
    text-align: center;
    font-size: 9pt;
    color: #282828;
    margin-top: 0.2in;
  }
  .footer {
    width: 100%;
    text-align: center;
    font-size: 7pt;
    color: #828282;
    margin-top: 0.1in;
  }
  text, tspan { font-family: Arial, Helvetica, sans-serif; }
  foreignObject div, foreignObject span, foreignObject p,
  foreignObject b, foreignObject i, foreignObject em, foreignObject strong {
    font-family: Arial, Helvetica, sans-serif !important;
    font-style: normal !important;
    font-weight: normal !important;
  }
</style>
</head>
<body>
<div class="page">
  <div class="header">${escapeHtml(figNum)}</div>
  <div id="diagram" class="diagram"></div>
  <div class="caption">${escapeHtml(figNum)} — ${escapeHtml(title)}</div>
  <div class="footer">Visionary AI Systems, Inc. (Delaware) | Milton &amp; Lisa Overton, Inventors | ${escapeHtml(patentId)}</div>
</div>
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', flowchart: { htmlLabels: true } });
  const code = ${JSON.stringify(fullCode)};
  (async () => {
    try {
      const { svg } = await mermaid.render('d', code);
      document.getElementById('diagram').innerHTML = svg;
    } catch (err) {
      document.getElementById('diagram').innerHTML = '<pre style="color:red">' + err.message + '</pre>';
    }
  })();
</script>
</body>
</html>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
