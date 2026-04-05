// useDomainIntel — React hook for Domain Intelligence Collector
// Provides domain schema management, learning event capture,
// and training data summary access.

import { useState, useCallback } from 'react'
import type { DomainVertical, DomainSchema, DataCategory, LearningEvent, TrainingDataSummary } from '@/types/patent'
import {
  registerDomain, getAllSchemas, getSchemasByVertical,
  captureEvent, getTrainingDataSummary,
  getCollegeSportsTemplate, clearAllDomainData
} from '@/lib/vadi/dic'

export interface UseDomainIntelResult {
  schemas: DomainSchema[]
  refreshSchemas: () => void
  registerNewDomain: (vertical: DomainVertical, name: string, categories: Omit<DataCategory, 'id'>[]) => DomainSchema
  registerCollegeSports: (name?: string) => DomainSchema
  captureDataEvent: (
    schemaId: string,
    categoryId: string,
    eventType: LearningEvent['eventType'],
    data: Record<string, unknown>,
    source: string
  ) => LearningEvent
  getSummary: (schemaId: string) => TrainingDataSummary
  filterByVertical: (vertical: DomainVertical) => DomainSchema[]
  clearAll: () => void
}

export function useDomainIntel(): UseDomainIntelResult {
  const [schemas, setSchemas] = useState<DomainSchema[]>(() => getAllSchemas())

  const refreshSchemas = useCallback(() => {
    setSchemas(getAllSchemas())
  }, [])

  const registerNewDomain = useCallback((
    vertical: DomainVertical,
    name: string,
    categories: Omit<DataCategory, 'id'>[]
  ) => {
    const schema = registerDomain(vertical, name, categories)
    setSchemas(getAllSchemas())
    return schema
  }, [])

  const registerCollegeSports = useCallback((name?: string) => {
    const categories = getCollegeSportsTemplate()
    return registerNewDomain('sports', name ?? 'College Sports Operating System', categories)
  }, [registerNewDomain])

  const captureDataEvent = useCallback((
    schemaId: string,
    categoryId: string,
    eventType: LearningEvent['eventType'],
    data: Record<string, unknown>,
    source: string
  ) => {
    return captureEvent(schemaId, categoryId, eventType, data, source)
  }, [])

  const getSummary = useCallback((schemaId: string) => {
    return getTrainingDataSummary(schemaId)
  }, [])

  const filterByVertical = useCallback((vertical: DomainVertical) => {
    return getSchemasByVertical(vertical)
  }, [])

  const clearAll = useCallback(() => {
    clearAllDomainData()
    setSchemas([])
  }, [])

  return {
    schemas, refreshSchemas, registerNewDomain, registerCollegeSports,
    captureDataEvent, getSummary, filterByVertical, clearAll,
  }
}
