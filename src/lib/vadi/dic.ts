// DIC — Domain Intelligence Collector (PA-5 Component 600)
// Captures industry-specific operational data for vertical AI model training.
// This primitive enables VADI to evolve from a static platform into a learning
// system that improves its domain-specific capabilities over time.
//
// Example verticals and their data categories:
// - College Sports: ticket sales, recruiting, fundraising, marketing, player analysis
// - Healthcare: patient encounters, treatment protocols, billing codes
// - Legal: case filings, precedent citations, client interactions
// - Financial: transactions, risk assessments, compliance events
//
// This is a novel patent differentiator — no existing voice-first agent platform
// captures structured industry training data through its operational pipeline.

import type {
  DomainSchema, DomainVertical, DataCategory, DataField,
  LearningEvent, TrainingDataSummary
} from '@/types/patent'

// ── Storage ───────────────────────────────────────────────────────────────

const SCHEMAS_KEY = 'vais:dic-schemas'
const EVENTS_KEY = 'vais:dic-events'
const MAX_EVENTS = 500  // localStorage limit; Supabase in Phase 2

function loadSchemas(): DomainSchema[] {
  try {
    const raw = localStorage.getItem(SCHEMAS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveSchemas(schemas: DomainSchema[]): void {
  try {
    localStorage.setItem(SCHEMAS_KEY, JSON.stringify(schemas))
  } catch { /* storage full */ }
}

function loadEvents(): LearningEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveEvents(events: LearningEvent[]): void {
  try {
    const trimmed = events.slice(-MAX_EVENTS)
    localStorage.setItem(EVENTS_KEY, JSON.stringify(trimmed))
  } catch { /* storage full */ }
}

// ── Domain Schema Registration ────────────────────────────────────────────
// SDK-style interface: DIC.registerDomain(schema)

export function registerDomain(
  vertical: DomainVertical,
  name: string,
  categories: Omit<DataCategory, 'id'>[]
): DomainSchema {
  const schema: DomainSchema = {
    id: `dic-${vertical}-${Date.now()}`,
    vertical,
    name,
    version: '1.0.0',
    dataCategories: categories.map((c, i) => ({ ...c, id: `cat-${i}-${Date.now()}` })),
    registeredAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const schemas = loadSchemas()
  schemas.push(schema)
  saveSchemas(schemas)
  return schema
}

export function getDomainSchema(schemaId: string): DomainSchema | null {
  return loadSchemas().find(s => s.id === schemaId) ?? null
}

export function getSchemasByVertical(vertical: DomainVertical): DomainSchema[] {
  return loadSchemas().filter(s => s.vertical === vertical)
}

export function getAllSchemas(): DomainSchema[] {
  return loadSchemas()
}

export function updateDomainSchema(
  schemaId: string,
  updates: Partial<Pick<DomainSchema, 'name' | 'dataCategories' | 'version'>>
): DomainSchema | null {
  const schemas = loadSchemas()
  const idx = schemas.findIndex(s => s.id === schemaId)
  if (idx === -1) return null

  schemas[idx] = {
    ...schemas[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  saveSchemas(schemas)
  return schemas[idx]
}

// ── Learning Event Capture ────────────────────────────────────────────────
// SDK-style interface: DIC.captureEvent(event)

export function captureEvent(
  domainSchemaId: string,
  categoryId: string,
  eventType: LearningEvent['eventType'],
  data: Record<string, unknown>,
  source: string,
  quality: LearningEvent['quality'] = 'unvalidated'
): LearningEvent {
  const event: LearningEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    domainSchemaId,
    categoryId,
    timestamp: new Date().toISOString(),
    eventType,
    data,
    source,
    quality,
  }

  const events = loadEvents()
  events.push(event)
  saveEvents(events)
  return event
}

export function getEventsForSchema(schemaId: string): LearningEvent[] {
  return loadEvents().filter(e => e.domainSchemaId === schemaId)
}

export function getEventsForCategory(schemaId: string, categoryId: string): LearningEvent[] {
  return loadEvents().filter(e => e.domainSchemaId === schemaId && e.categoryId === categoryId)
}

// ── Training Data Summary ─────────────────────────────────────────────────
// Aggregates captured data for model readiness assessment

export function getTrainingDataSummary(schemaId: string): TrainingDataSummary {
  const events = getEventsForSchema(schemaId)

  const categoryCounts: Record<string, number> = {}
  const qualityDistribution: Record<string, number> = {}
  let earliest = ''
  let latest = ''

  for (const event of events) {
    categoryCounts[event.categoryId] = (categoryCounts[event.categoryId] ?? 0) + 1
    qualityDistribution[event.quality] = (qualityDistribution[event.quality] ?? 0) + 1

    if (!earliest || event.timestamp < earliest) earliest = event.timestamp
    if (!latest || event.timestamp > latest) latest = event.timestamp
  }

  // Readiness heuristic: 100+ high-quality events per category = ready
  const schema = getDomainSchema(schemaId)
  const categoryCount = schema?.dataCategories.length ?? 1
  const highQuality = qualityDistribution['high'] ?? 0
  const readiness = Math.min(100, Math.round((highQuality / (categoryCount * 100)) * 100))

  return {
    domainSchemaId: schemaId,
    totalEvents: events.length,
    categoryCounts,
    qualityDistribution,
    dateRange: { earliest: earliest || new Date().toISOString(), latest: latest || new Date().toISOString() },
    estimatedModelReadiness: readiness,
  }
}

// ── Pre-built Domain Templates ────────────────────────────────────────────
// Ready-to-register schemas for known verticals

export function getCollegeSportsTemplate(): Omit<DataCategory, 'id'>[] {
  return [
    {
      name: 'Ticket Sales',
      description: 'Athletic event ticket sales data including pricing, capacity, and revenue',
      fields: createFields([
        ['event_name', 'string', 'Name of the athletic event', true],
        ['sport', 'string', 'Sport type (football, basketball, etc.)', true],
        ['tickets_sold', 'number', 'Number of tickets sold', true],
        ['revenue', 'number', 'Total ticket revenue in USD', true],
        ['capacity_pct', 'number', 'Percentage of venue capacity filled', false],
        ['date', 'date', 'Event date', true],
      ]),
      captureFrequency: 'event-driven',
      privacyLevel: 'internal',
    },
    {
      name: 'Fundraising',
      description: 'Donor engagement, gift tracking, and campaign performance',
      fields: createFields([
        ['campaign_name', 'string', 'Name of fundraising campaign', true],
        ['amount_raised', 'number', 'Total amount raised in USD', true],
        ['donor_count', 'number', 'Number of unique donors', true],
        ['channel', 'string', 'Fundraising channel (email, phone, event, online)', true],
        ['date', 'date', 'Campaign date or period end', true],
      ]),
      captureFrequency: 'daily',
      privacyLevel: 'confidential',
    },
    {
      name: 'Recruiting',
      description: 'Prospect evaluation, visit tracking, and commitment pipeline',
      fields: createFields([
        ['sport', 'string', 'Sport being recruited for', true],
        ['prospect_rating', 'number', 'Prospect rating (1-5 stars)', true],
        ['pipeline_stage', 'enum', 'Pipeline stage (prospect, contact, visit, offer, commit)', true],
        ['visit_type', 'string', 'Visit type (unofficial, official, virtual)', false],
        ['date', 'date', 'Interaction date', true],
      ]),
      captureFrequency: 'event-driven',
      privacyLevel: 'confidential',
    },
    {
      name: 'Sports Marketing',
      description: 'Campaign engagement, social media metrics, and brand analytics',
      fields: createFields([
        ['campaign_type', 'string', 'Type of marketing campaign', true],
        ['platform', 'string', 'Marketing platform (social, email, digital, print)', true],
        ['impressions', 'number', 'Total impressions/reach', true],
        ['engagement_rate', 'number', 'Engagement rate percentage', false],
        ['conversions', 'number', 'Number of conversions (ticket sales, signups)', false],
        ['date', 'date', 'Campaign date', true],
      ]),
      captureFrequency: 'daily',
      privacyLevel: 'internal',
    },
    {
      name: 'Player Analysis',
      description: 'Performance metrics, health tracking, and development analytics',
      fields: createFields([
        ['sport', 'string', 'Sport', true],
        ['metric_type', 'string', 'Type of performance metric', true],
        ['metric_value', 'number', 'Measured value', true],
        ['context', 'string', 'Game, practice, or training context', true],
        ['date', 'date', 'Measurement date', true],
      ]),
      captureFrequency: 'event-driven',
      privacyLevel: 'pii',
    },
    {
      name: 'Simulation Training',
      description: 'AI training simulation data for coaching and game planning scenarios',
      fields: createFields([
        ['scenario_type', 'string', 'Type of simulation (game plan, practice drill, strategy)', true],
        ['sport', 'string', 'Sport', true],
        ['participants', 'number', 'Number of participants', false],
        ['outcome_metric', 'string', 'Primary outcome metric', true],
        ['outcome_value', 'number', 'Measured outcome value', true],
        ['ai_recommendation', 'string', 'AI-generated coaching recommendation', false],
        ['human_override', 'boolean', 'Whether human coach overrode AI recommendation', false],
        ['date', 'date', 'Simulation date', true],
      ]),
      captureFrequency: 'event-driven',
      privacyLevel: 'internal',
    },
  ]
}

// ── Marketing Automation Template (PA-7 primary data source) ──────────────

export function getMarketingAutomationTemplate(): Omit<DataCategory, 'id'>[] {
  return [
    {
      name: 'Campaign Performance',
      description: 'Campaign engagement metrics, delivery stats, and conversion data',
      fields: createFields([
        ['campaign_type', 'string', 'Type of campaign (email, social, SMS, multi-channel)', true],
        ['send_count', 'number', 'Number of messages sent', true],
        ['open_rate', 'number', 'Open rate percentage', true],
        ['click_rate', 'number', 'Click-through rate percentage', true],
        ['conversion_rate', 'number', 'Conversion rate percentage', false],
        ['send_time', 'string', 'Time of day sent (hour bucket)', true],
        ['day_of_week', 'string', 'Day of week sent', true],
        ['date', 'date', 'Campaign date', true],
      ]),
      captureFrequency: 'event-driven',
      privacyLevel: 'internal',
    },
    {
      name: 'Lead Scoring',
      description: 'Lead scoring signal weights and conversion predictions',
      fields: createFields([
        ['score', 'number', 'Computed lead score (0-100)', true],
        ['signals_used', 'number', 'Number of behavioral signals in score', true],
        ['top_signal', 'string', 'Highest-weight scoring signal', true],
        ['converted', 'boolean', 'Whether lead eventually converted', false],
        ['days_to_convert', 'number', 'Days from first touch to conversion', false],
        ['date', 'date', 'Scoring date', true],
      ]),
      captureFrequency: 'daily',
      privacyLevel: 'internal',
    },
    {
      name: 'Audience Segmentation',
      description: 'Segment performance differentials and targeting effectiveness',
      fields: createFields([
        ['segment_name', 'string', 'Name of audience segment', true],
        ['segment_size', 'number', 'Number of contacts in segment', true],
        ['engagement_rate', 'number', 'Segment engagement rate', true],
        ['response_differential', 'number', 'Performance vs unsegmented baseline', false],
        ['date', 'date', 'Analysis date', true],
      ]),
      captureFrequency: 'daily',
      privacyLevel: 'internal',
    },
    {
      name: 'Content Effectiveness',
      description: 'Subject line, template, and content type performance',
      fields: createFields([
        ['content_type', 'string', 'Content type (email, landing page, social post)', true],
        ['template_category', 'string', 'Template category used', true],
        ['engagement_score', 'number', 'Composite engagement score (0-100)', true],
        ['funnel_stage', 'string', 'Funnel stage (awareness, consideration, decision)', true],
        ['date', 'date', 'Content date', true],
      ]),
      captureFrequency: 'event-driven',
      privacyLevel: 'internal',
    },
  ]
}

// ── Faith Community Template (MDALS — NO religious data) ──────────────────

export function getFaithCommunityTemplate(): Omit<DataCategory, 'id'>[] {
  return [
    {
      name: 'Content Engagement',
      description: 'Content viewing patterns and engagement curves — NO religious content analysis',
      fields: createFields([
        ['content_type', 'string', 'Type of content (sermon, devotional, announcement, event)', true],
        ['view_duration_seconds', 'number', 'Seconds spent viewing content', true],
        ['completion_rate', 'number', 'Percentage of content consumed', true],
        ['interaction_count', 'number', 'Number of interactions (likes, shares, comments)', false],
        ['day_of_week', 'string', 'Day of week', true],
        ['date', 'date', 'Content date', true],
      ]),
      captureFrequency: 'event-driven',
      privacyLevel: 'internal',
    },
    {
      name: 'Event Attendance',
      description: 'Event attendance patterns and scheduling effectiveness',
      fields: createFields([
        ['event_type', 'string', 'Type of event (service, study, social, outreach)', true],
        ['attendance_count', 'number', 'Number of attendees', true],
        ['capacity_pct', 'number', 'Percentage of capacity filled', false],
        ['day_of_week', 'string', 'Day of week', true],
        ['time_slot', 'string', 'Time slot (morning, afternoon, evening)', true],
        ['date', 'date', 'Event date', true],
      ]),
      captureFrequency: 'event-driven',
      privacyLevel: 'internal',
    },
    {
      name: 'Community Health',
      description: 'Aggregate community interaction metrics — NO individual edges or religious data',
      fields: createFields([
        ['active_members', 'number', 'Count of members active this period', true],
        ['new_members', 'number', 'New members joined', true],
        ['group_count', 'number', 'Number of active groups', true],
        ['avg_group_size', 'number', 'Average group size', true],
        ['retention_rate', 'number', 'Member retention rate percentage', false],
        ['date', 'date', 'Measurement date', true],
      ]),
      captureFrequency: 'weekly',
      privacyLevel: 'internal',
    },
  ]
}

// ── Personal Growth Template (Vision Board) ───────────────────────────────

export function getPersonalGrowthTemplate(): Omit<DataCategory, 'id'>[] {
  return [
    {
      name: 'Goal Tracking',
      description: 'Goal categories, progress trajectories, and completion patterns',
      fields: createFields([
        ['goal_category', 'string', 'Goal category (fitness, financial, career, relationship, creative)', true],
        ['progress_pct', 'number', 'Progress percentage toward goal (0-100)', true],
        ['days_since_creation', 'number', 'Days since goal was created', true],
        ['check_in_count', 'number', 'Number of progress check-ins', true],
        ['status', 'enum', 'Goal status (active, completed, paused, abandoned)', true],
        ['date', 'date', 'Check-in date', true],
      ]),
      captureFrequency: 'event-driven',
      privacyLevel: 'internal',
    },
    {
      name: 'Board Engagement',
      description: 'Vision board creation patterns and visualization preferences',
      fields: createFields([
        ['board_theme', 'string', 'Board theme category', true],
        ['item_count', 'number', 'Number of items on board', true],
        ['view_frequency', 'number', 'Times board was viewed this period', true],
        ['edit_count', 'number', 'Number of edits/updates', false],
        ['visualization_type', 'string', 'Preferred visualization style', false],
        ['date', 'date', 'Activity date', true],
      ]),
      captureFrequency: 'daily',
      privacyLevel: 'internal',
    },
  ]
}

// ── Financial Planning Template (FirePath — max anonymization) ────────────

export function getFinancialPlanningTemplate(): Omit<DataCategory, 'id'>[] {
  return [
    {
      name: 'Planning Patterns',
      description: 'Financial planning workflow patterns — anonymized aggregate only, k>=50',
      fields: createFields([
        ['plan_type', 'string', 'Type of financial plan (retirement, savings, debt, education)', true],
        ['simulation_count', 'number', 'Number of Monte Carlo simulations run', true],
        ['risk_tolerance', 'enum', 'Risk tolerance level (conservative, moderate, aggressive)', true],
        ['planning_horizon_years', 'number', 'Planning time horizon in years', true],
        ['feature_used', 'string', 'Feature used (calculator, simulator, planner, advisor)', true],
        ['date', 'date', 'Activity date', true],
      ]),
      captureFrequency: 'event-driven',
      privacyLevel: 'confidential',
    },
    {
      name: 'Financial Wellness',
      description: 'Aggregate financial wellness indicators — statistical summaries only, never individual',
      fields: createFields([
        ['wellness_score_bucket', 'string', 'Score bucket (0-20, 21-40, 41-60, 61-80, 81-100)', true],
        ['goal_category', 'string', 'Financial goal category', true],
        ['goal_completion_rate', 'number', 'Goal completion rate for cohort', true],
        ['cohort_size', 'number', 'Size of anonymized cohort (must be >= 50)', true],
        ['date', 'date', 'Measurement period', true],
      ]),
      captureFrequency: 'weekly',
      privacyLevel: 'confidential',
    },
  ]
}

function createFields(specs: [string, DataField['type'], string, boolean][]): DataField[] {
  return specs.map(([name, type, description, required]) => ({
    name, type, description, required,
  }))
}

// ── Clear all DIC data (admin/reset) ──────────────────────────────────────

export function clearAllDomainData(): void {
  localStorage.removeItem(SCHEMAS_KEY)
  localStorage.removeItem(EVENTS_KEY)
}
