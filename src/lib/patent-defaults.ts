// Patent Defaults — default inventor and assignee data for Visionary AI Systems.
//
// Extracted from docx-generator.ts so that Node-side scripts
// (scripts/export-filing-data.ts) can import this without pulling in
// browser-only dependencies like file-saver.

import type { Inventor } from '@/types/patent'

export function getDefaultInventors(): Inventor[] {
  return [
    { name: 'Milton Overton', address: '1102 Cool Springs Drive, Kennesaw, GA 30144', citizenship: 'United States' },
    { name: 'Lisa Overton',   address: '1102 Cool Springs Drive, Kennesaw, GA 30144', citizenship: 'United States' },
  ]
}

export function getDefaultAssignee() {
  return {
    name: 'Visionary AI Systems, Inc.',
    address: '1102 Cool Springs Drive, Kennesaw, GA 30144',
    type: 'Corporation',
    state: 'Delaware',
  }
}
