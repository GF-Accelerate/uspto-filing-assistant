// Reusable Inventor & Assignee Profiles — Phase 1: localStorage
// Phase 2: migrate to Supabase inventor_profiles / assignee_profiles tables

import type { Inventor, Assignee } from '@/types/patent'

const INVENTOR_KEY = 'uspto-inventor-profiles-v1'
const ASSIGNEE_KEY = 'uspto-assignee-profiles-v1'

export interface InventorProfile extends Inventor {
  id: string
  isPrimary: boolean
  email?: string
}

export interface AssigneeProfile extends Assignee {
  id: string
  stateId?: string
  ein?: string
  isDefault: boolean
}

// ── Default profiles (seeded on first load) ─────────────────────

const DEFAULT_INVENTORS: InventorProfile[] = [
  {
    id: 'inv-milton',
    name: 'Milton Overton',
    address: '1102 Cool Springs Drive, Kennesaw, GA 30144',
    citizenship: 'United States',
    isPrimary: true,
    email: 'moverton7474@gmail.com',
  },
  {
    id: 'inv-lisa',
    name: 'Lisa Overton',
    address: '1102 Cool Springs Drive, Kennesaw, GA 30144',
    citizenship: 'United States',
    isPrimary: false,
    email: 'lisa.overton2022@gmail.com',
  },
]

const DEFAULT_ASSIGNEES: AssigneeProfile[] = [
  {
    id: 'asg-visionary',
    name: 'Visionary AI Systems, Inc.',
    address: '1102 Cool Springs Drive, Kennesaw, GA 30144',
    type: 'Corporation',
    state: 'Delaware',
    stateId: '10468520',
    ein: '41-3757112',
    isDefault: true,
  },
]

// ── Inventor profiles ────────────────────────────────────────────

export function loadInventorProfiles(): InventorProfile[] {
  try {
    const raw = localStorage.getItem(INVENTOR_KEY)
    if (!raw) {
      saveInventorProfiles(DEFAULT_INVENTORS)
      return [...DEFAULT_INVENTORS]
    }
    return JSON.parse(raw) as InventorProfile[]
  } catch {
    return [...DEFAULT_INVENTORS]
  }
}

export function saveInventorProfiles(profiles: InventorProfile[]): void {
  localStorage.setItem(INVENTOR_KEY, JSON.stringify(profiles))
}

export function addInventorProfile(profile: Omit<InventorProfile, 'id'>): InventorProfile {
  const profiles = loadInventorProfiles()
  const newProfile: InventorProfile = {
    ...profile,
    id: `inv-${Date.now()}`,
  }
  profiles.push(newProfile)
  saveInventorProfiles(profiles)
  return newProfile
}

export function removeInventorProfile(id: string): void {
  const profiles = loadInventorProfiles().filter(p => p.id !== id)
  saveInventorProfiles(profiles)
}

export function getPrimaryInventor(): InventorProfile | undefined {
  return loadInventorProfiles().find(p => p.isPrimary)
}

// ── Assignee profiles ────────────────────────────────────────────

export function loadAssigneeProfiles(): AssigneeProfile[] {
  try {
    const raw = localStorage.getItem(ASSIGNEE_KEY)
    if (!raw) {
      saveAssigneeProfiles(DEFAULT_ASSIGNEES)
      return [...DEFAULT_ASSIGNEES]
    }
    return JSON.parse(raw) as AssigneeProfile[]
  } catch {
    return [...DEFAULT_ASSIGNEES]
  }
}

export function saveAssigneeProfiles(profiles: AssigneeProfile[]): void {
  localStorage.setItem(ASSIGNEE_KEY, JSON.stringify(profiles))
}

export function addAssigneeProfile(profile: Omit<AssigneeProfile, 'id'>): AssigneeProfile {
  const profiles = loadAssigneeProfiles()
  const newProfile: AssigneeProfile = {
    ...profile,
    id: `asg-${Date.now()}`,
  }
  profiles.push(newProfile)
  saveAssigneeProfiles(profiles)
  return newProfile
}

export function getDefaultAssigneeProfile(): AssigneeProfile | undefined {
  return loadAssigneeProfiles().find(p => p.isDefault)
}

// ── Single-item CRUD aliases (used by Settings page) ─────────────

export const getInventorProfiles = loadInventorProfiles
export const getAssigneeProfiles = loadAssigneeProfiles

export function saveInventorProfile(profile: InventorProfile): void {
  const profiles = loadInventorProfiles()
  const idx = profiles.findIndex(p => p.id === profile.id)
  if (idx >= 0) profiles[idx] = profile
  else profiles.push(profile)
  saveInventorProfiles(profiles)
}

export function saveAssigneeProfile(profile: AssigneeProfile): void {
  const profiles = loadAssigneeProfiles()
  const idx = profiles.findIndex(p => p.id === profile.id)
  if (idx >= 0) profiles[idx] = profile
  else profiles.push(profile)
  saveAssigneeProfiles(profiles)
}

export function deleteInventorProfile(id: string): void {
  removeInventorProfile(id)
}

export function deleteAssigneeProfile(id: string): void {
  const profiles = loadAssigneeProfiles().filter(p => p.id !== id)
  saveAssigneeProfiles(profiles)
}

// ── Convert profiles to filing data format ───────────────────────

export function inventorProfilesToFilingData(): Inventor[] {
  return loadInventorProfiles().map(p => ({
    name: p.name,
    address: p.address,
    citizenship: p.citizenship,
  }))
}
