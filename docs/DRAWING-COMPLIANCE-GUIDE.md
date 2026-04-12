# Drawing Compliance Guide

**Purpose.** Quick reference for using the Drawing Compliance Analyzer to
check patent drawings against USPTO rule **37 C.F.R. §1.84** before
uploading them to Patent Center.

---

## TL;DR

Three ways to check a drawing:

| Where | Best for | Speed |
|-------|----------|-------|
| **Inline on the Drawings page** | Checking one rendered figure at a time, quickly | Instant |
| **"Check all (N)" button** on the Drawings page | Bulk-checking every rendered figure for a patent | ~1s per figure |
| **Admin page** (`/admin/drawing-compliance`) | Uploading external drawings (PDF, PNG, JPG, SVG) from outside the app, optional Claude Vision qualitative review, history/audit trail | Seconds — minutes with vision |
| **CLI** (`scripts/check-drawing-compliance.ts`) | Node-side CI/automation, offline checking of rendered output | Seconds |

---

## What gets checked

The compliance engine enforces subset of 37 C.F.R. §1.84 that can be
measured mechanically:

| Rule | What it checks | Deterministic? |
|------|---------------|----------------|
| **1.84(f) Sheet size** | A4 (21.0x29.7 cm) or US Letter (21.6x27.9 cm) | ✅ Yes (raster + SVG width/height) |
| **1.84(g) Margins** | top &ge;2.5 cm, left &ge;2.5 cm, right &ge;1.5 cm, bottom &ge;1.0 cm | ❌ Requires vision AI |
| **1.84(l) Print quality** | Solid black lines, uniform thickness | ❌ Requires vision AI |
| **1.84(l) Resolution** | &ge;300 DPI for raster drawings | ✅ Yes (pixels / estimated page size) |
| **1.84(p)(3) Numeral height** | &ge;0.32 cm (1/8") for all reference numerals | ✅ Yes for SVG (font-size attr) |
| **Adequate views** | Multiple views if needed for disclosure | ❌ Requires vision AI + human judgement |

**Deterministic checks always run.** Vision-AI checks are **optional** and
only available on the admin page (they call `/api/claude` with the image).

---

## Severity levels

| Level | Meaning | Block filing? |
|-------|---------|---------------|
| **Error** (red) | Hard USPTO rule violation — fix before filing | Yes |
| **Warning** (amber) | Probably fine for provisional, might be flagged on nonprovisional | No for provisional |
| **Info** (blue/grey) | Passing check or informational note | No |

For **provisional** applications, only errors are truly blocking —
USPTO accepts "informal drawings" for provisionals (see MPEP §601.01(a)).
**Nonprovisional** filings require formal drawings and will be more strict.

---

## Inline check (Drawings page)

1. Open `/drawings` in the web app
2. Select a patent (e.g. PA-5)
3. Click "Render all N figures"
4. Next to each rendered figure's SVG/PDF buttons you'll see a
   **"Check 37 CFR 1.84"** button
5. Click it — a severity badge appears
6. Click the badge to expand the per-figure findings

**When to use:** quick sanity check before downloading a single figure.

---

## Bulk check (Drawings page)

1. Same as above, but after rendering, click the **"Check all (N)"**
   button in the header (next to "Render all")
2. An alert panel appears below the header summarizing errors,
   warnings, and passes across all figures
3. If any figure has errors, drill into the inline checks to see
   which ones and why

**When to use:** final sanity pass before downloading the full drawing
package for upload to Patent Center.

---

## Admin page (`/admin/drawing-compliance`)

**Most powerful check — accepts external files and can use Claude Vision.**

1. Open `/admin/drawing-compliance`
2. Select the patent the drawing belongs to (affects the history tag)
3. Drag and drop a PNG / JPG / SVG / PDF — or click "Choose file"
4. (Optional) Toggle "Include AI vision analysis" to run qualitative
   checks for line quality, margins, view adequacy
5. Click "Run compliance check"
6. Review the severity-coded report with metadata summary
7. The report is saved to localStorage under the selected patent
   and appears in the "History" section at the bottom

**When to use:**
- Checking a drawing that was produced outside the app (e.g. by a patent
  attorney or an external tool)
- Getting a qualitative AI review before filing
- Building an audit trail of what was checked when

**Admin-only:** the page is feature-flag gated by
`drawing_compliance_enabled` (on by default). Toggle at `/admin/flags`.

---

## CLI (offline / Node / CI)

```bash
# Render drawings for a patent to disk
npx tsx scripts/generate-drawings.ts PA-5

# Check all rendered figures
npx tsx scripts/check-drawing-compliance.ts PA-5
```

**Output:** `filing-data/PA-5/drawings/COMPLIANCE-REPORT.md` with a
per-figure findings table.

**When to use:**
- Preparing a filing package from the command line (no browser)
- Adding compliance checks to a CI pipeline
- Producing an auditable report for legal review

---

## Interpreting results

### "All figures passed 37 CFR 1.84 deterministic checks"

Safe to upload to Patent Center as informal provisional drawings. For
nonprovisional filing, ask a patent attorney to review the drawings for
formal-drawing requirements (exact line weights, cross-hatching, etc.).

### "Sheet size: other" or "inline diagram" (info)

Common for Mermaid-generated diagrams — the SVG itself is the diagram,
not a full 8.5x11" sheet. This is **not** an error for provisional
drawings because the PDF wrapper (from the web app or from
`scripts/generate-drawings.ts`) renders the diagram onto a proper
USPTO-compliant sheet.

### "At least one reference numeral is smaller than 0.32 cm" (error)

Find the smallest `<text>` or `<tspan>` element in the SVG and increase
its `font-size` to at least `12px` (which is approximately 0.32 cm at
96 DPI). For Mermaid, this usually means editing the theme in
`src/pages/Drawings.tsx` → `MERMAID_INIT` → `themeVariables.fontSize`.

### "Resolution too low (XYZ DPI)" (error)

The raster image was exported at less than 300 DPI. Re-export the drawing
at 300 DPI or higher. If the source is a vector (SVG, PDF), re-render
from the vector rather than upscaling the raster.

### Vision AI says margins are insufficient

The diagram doesn't have enough whitespace around it. Add padding to the
Mermaid theme or increase the PDF margin parameters in the export
pipeline. USPTO requires top &ge;2.5 cm, left &ge;2.5 cm, right &ge;1.5 cm,
bottom &ge;1.0 cm.

---

## Provisional vs nonprovisional

This tool is calibrated for **provisional** drawings, which have a
relaxed standard. Key differences:

| | Provisional | Nonprovisional |
|---|-------------|----------------|
| Formal drawings required? | No — informal acceptable | Yes |
| Line weights | Any clear line | Specific USPTO standards |
| Cross-hatching | Not required | Required in views of solid materials |
| Numerals | &ge;0.32 cm | &ge;0.32 cm (strictly enforced) |
| Views | "Enough to disclose" | Must include all necessary views |
| This tool's verdict | Trustworthy for informal filings | **Not sufficient** — get attorney review |

For a nonprovisional filing, use this tool as a **first-pass sanity
check**, then pay a patent attorney or draftsperson to produce formal
drawings per 37 CFR 1.84's full requirements.

---

## Where things live

| What | Where |
|------|-------|
| Engine (rules + parsing) | `src/lib/drawing-compliance.ts` |
| Inline UI (Drawings page) | `src/components/InlineComplianceCheck.tsx` |
| Full UI (admin page) | `src/components/DrawingAnalyzer.tsx` |
| Admin page wrapper | `src/pages/admin/DrawingCompliance.tsx` |
| Feature flag | `src/lib/feature-flags.ts` → `drawing_compliance_enabled` |
| CLI: render drawings | `scripts/generate-drawings.ts` |
| CLI: check compliance | `scripts/check-drawing-compliance.ts` |
| History storage | `localStorage` key `uspto-drawing-compliance-history-v1` |

---

## Known limitations

- **PDF parsing is metadata-only.** Deterministic PDF page-size + content
  parsing requires `pdfjs-dist` which is not currently installed. PDFs
  are sent to Claude Vision if AI analysis is enabled; otherwise only
  file-size sanity is checked.
- **Margin detection requires AI.** No pixel-perfect margin measurement
  without vision AI. Vector diagrams (SVG) don't have measurable margins
  until they're wrapped in a page.
- **Mermaid theme limitations.** If you customize the Mermaid theme to
  use very small fonts, the numeral-height check will correctly flag it,
  but the fix requires editing the theme, not the individual figure.
- **No printer-calibration check.** If your PDF printer's default margins
  differ from the web app's, compliance checked in-app might not match
  compliance on the physical print. Always verify the final PDF.
