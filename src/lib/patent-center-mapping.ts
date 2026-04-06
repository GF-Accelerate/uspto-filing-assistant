// Patent Center Form Field Mapping
// Maps app data fields to exact USPTO Patent Center form labels and navigation
// Used by filing-export.ts and the Playwright MCP playbook

export const PATENT_CENTER_URL = 'https://patentcenter.uspto.gov'

export const PATENT_CENTER_MAPPING = {
  // Step 1: New Submission
  newSubmission: {
    url: `${PATENT_CENTER_URL}/#!/newSubmission`,
    applicationType: 'Provisional (35 U.S.C. 111(b))',
    entityStatusOptions: ['Micro Entity', 'Small Entity', 'Large Entity'] as const,
  },

  // Step 2: Application Data Sheet (Web ADS)
  webADS: {
    // Application info
    title: 'Title of Invention',
    entityStatus: 'Entity Status',

    // Inventor fields (repeatable)
    inventor: {
      firstName: 'Given Name',
      lastName: 'Family Name',
      street: 'Street Address',
      city: 'City',
      state: 'State/Province',
      zip: 'Postal Code',
      country: 'Country of Residence',
      citizenship: 'Country of Citizenship',
    },

    // Assignee fields
    assignee: {
      name: 'Assignee Name',
      type: 'Assignee Type',
      stateOfIncorporation: 'State of Incorporation',
      street: 'Street Address',
      city: 'City',
      state: 'State/Province',
      zip: 'Postal Code',
      country: 'Country',
    },

    // Correspondence
    correspondence: {
      name: 'Name',
      street: 'Street Address',
      city: 'City',
      state: 'State/Province',
      zip: 'Postal Code',
      country: 'Country',
    },
  },

  // Step 3: Document Upload
  documentUpload: {
    documentTypes: {
      specification: 'Specification',
      coverSheet: 'Provisional Cover Sheet (SB16)',
      drawings: 'Drawings',
    } as const,
  },

  // Step 4: Fee Calculation
  fees: {
    smallEntity2026: '$320.00',
    largeEntity2026: '$1,600.00',
    microEntity2026: '$160.00',
    verifyUrl: 'https://www.uspto.gov/learning-and-resources/fees-and-payment/uspto-fee-schedule',
  },

  // Step 5: Review & Submit — HITL GATE
  review: {
    warning: 'DO NOT automate the Submit button. Human must review all fields and click Submit manually.',
    submitButtonProhibited: true,
  },
} as const

export type DocumentType = keyof typeof PATENT_CENTER_MAPPING.documentUpload.documentTypes
