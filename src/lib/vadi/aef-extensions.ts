// AEF Extensions — Additional agent capabilities for VCE, DIC, PDB
// These extend the existing AEF agent registry without modifying aef.ts.
// Import and register these when the corresponding feature flags are enabled.

import type { AgentCapability } from './aef'

// ── Invention Capture Agent ───────────────────────────────────────────────
// Handles voice commands related to photographing and analyzing inventions

export const INVENTION_AGENT: AgentCapability = {
  role: 'general', // Uses 'general' role type to avoid modifying AgentRole union
  description: 'Handles invention capture, camera operations, and physical prototype analysis',
  keywords: [
    'camera', 'photo', 'photograph', 'picture', 'capture', 'scan',
    'prototype', 'hardware', 'device', 'invention', 'physical',
    'analyze', 'vision', 'image', 'look at', 'show me',
  ],
  canTriggerActions: true,
  systemPrompt: `You are the Invention Capture specialist for Visionary AI Systems.
You help inventors photograph and analyze physical prototypes, hardware devices,
and real-world inventions for inclusion in patent documentation.

You can:
- Guide users to open the camera to photograph inventions
- Explain how AI vision analysis works for patent documentation
- Describe how photos become patent figures, specification paragraphs, and claim elements
- Remind users that all generated content requires HAL approval before filing

IMPORTANT: Generated patent content from photos is DRAFT status only.
The Human Authorization Layer (HAL) must approve all content before
it enters official patent documents.`,
}

// ── Domain Intelligence Agent ─────────────────────────────────────────────
// Handles voice commands about industry data capture and training

export const DOMAIN_INTEL_AGENT: AgentCapability = {
  role: 'general',
  description: 'Manages domain-specific data schemas, training data capture, and model readiness',
  keywords: [
    'domain', 'training', 'data', 'capture', 'industry', 'vertical',
    'sports', 'tickets', 'recruiting', 'fundraising', 'marketing',
    'player', 'coaching', 'simulation', 'robot', 'ai training',
    'learning', 'model', 'readiness', 'schema', 'register',
    'healthcare', 'legal', 'financial',
  ],
  canTriggerActions: true,
  systemPrompt: `You are the Domain Intelligence specialist for Visionary AI Systems.
You help users understand and manage industry-specific data capture for
vertical AI model training through the VADI platform.

Current registered domains and their data categories:
- College Sports Operating System (CSOS): Ticket Sales, Fundraising, Recruiting,
  Sports Marketing, Player Analysis, Simulation Training
- More domains can be registered through the SDK

You can explain:
- How industry data flows into domain-specific AI model training
- The data categories available for each vertical (sports, healthcare, legal, etc.)
- Training data readiness scores and what they mean
- How human coaches/experts override AI recommendations (HAL-gated)
- The path from operational data → training events → vertical model improvement

IMPORTANT: PII and confidential data must be handled according to privacy levels
defined in the domain schema. Never expose raw PII in responses.`,
}

// ── Extended action types for new agents ──────────────────────────────────
// These can be imported by components that need to handle the new action types

export type ExtendedActionType =
  | 'OPEN_CAMERA'           // Launch camera viewfinder
  | 'ANALYZE_IMAGE'         // Run AI vision analysis on captured image
  | 'REGISTER_DOMAIN'       // Register a new domain schema
  | 'SHOW_TRAINING_STATUS'  // Show training data readiness
  | 'CAPTURE_DATA_EVENT'    // Log a domain data event

export interface ExtendedVoiceAction {
  type: ExtendedActionType
  payload?: string
}

// ── Keyword matching for extended agents ──────────────────────────────────

export function matchesInventionAgent(text: string): boolean {
  const lower = text.toLowerCase()
  return INVENTION_AGENT.keywords.some(k => lower.includes(k))
}

export function matchesDomainIntelAgent(text: string): boolean {
  const lower = text.toLowerCase()
  return DOMAIN_INTEL_AGENT.keywords.some(k => lower.includes(k))
}
