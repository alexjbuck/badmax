/**
 * Migration utilities for converting legacy v2 JSON files to v0.7.0 format.
 *
 * Legacy format (v2):
 * - Uses Proxy-based multi-day storage with julianDate keys
 * - Has squadrons, lines, sorties, cycles as ID-keyed objects
 * - Sorties reference lines, lines reference squadrons
 * - Parent references are circular and stripped from JSON
 *
 * New format (v0.7.0):
 * - Events directly reference squadrons (no intermediate Line)
 * - All dates stored as ISO 8601 strings
 * - Days are separate objects with their own metadata
 * - Connections stored directly on events
 */

import type {
  AirplanState,
  Squadron,
  Event,
  Cycle,
  DayData,
  StartEndType
} from './types'
import { toJulianDate, fromJulianDate } from './types'

// =============================================================================
// Legacy Type Definitions (for parsing v2 files)
// =============================================================================

interface LegacySquadron {
  ID: string
  name: string
  cs: string      // callsign
  tms: string
  modex: string
  _day?: number
  _night?: number
}

interface LegacyLine {
  ID: string
  squadronID: string
  _display?: boolean
}

interface LegacySortie {
  ID: string
  lineID: string
  _start: string
  _end: string
  startType: string
  endType: string
  note: string
  prenote?: string
  postnote?: string
  startCycleID?: string | null
  endCycleID?: string | null
  isAlert?: boolean
}

interface LegacyCycle {
  ID: string
  _start: string
  _end: string
}

interface LegacyData {
  version?: number
  title: Record<string, string> | string
  subtitle: Record<string, string> | string
  _start: Record<string, string> | string
  _end: Record<string, string> | string
  _sunrise: Record<string, string> | string
  _sunset: Record<string, string> | string
  _moonrise: Record<string, string> | string
  _moonset: Record<string, string> | string
  moonphase: Record<string, string> | string
  _flightquarters: Record<string, string> | string
  _heloquarters: Record<string, string> | string
  variation: Record<string, string> | string
  timezone?: Record<string, string> | string
  squadrons: Record<string, LegacySquadron>
  lines: Record<string, LegacyLine>
  sorties: Record<string, LegacySortie>
  cycles: Record<string, LegacyCycle>
}

// =============================================================================
// Migration Function
// =============================================================================

/**
 * Migrate a v2 JSON file to v0.7.0 format.
 *
 * @param data - Raw parsed JSON from a v2 file
 * @param name - Name for the new plan (defaults to title from data)
 * @returns AirplanState in v0.7.0 format
 */
export function migrateV2ToV07(data: LegacyData, name?: string): AirplanState {
  // Build lookup maps
  const lineToSquadron = new Map<string, string>()
  Object.values(data.lines).forEach(line => {
    lineToSquadron.set(line.ID, line.squadronID)
  })

  // Determine all julian dates present in the data
  const julianDates = collectJulianDates(data)

  // Migrate squadrons (ordered by how they appear in the data)
  const squadronLayout: Squadron[] = Object.values(data.squadrons).map(s => ({
    id: s.ID,
    name: s.name || '',
    callsign: s.cs || '',
    tms: s.tms || '',
    modex: s.modex || ''
  }))

  // Migrate cycles
  const cycles: Record<string, Cycle> = {}
  Object.values(data.cycles).forEach(c => {
    const start = new Date(c._start)
    cycles[c.ID] = {
      id: c.ID,
      start: start.toISOString(),
      end: new Date(c._end).toISOString(),
      julianDate: toJulianDate(start),
      scale: 1.0
    }
  })

  // Migrate sorties to events
  const events: Record<string, Event> = {}
  Object.values(data.sorties).forEach(s => {
    const squadronId = lineToSquadron.get(s.lineID)
    if (!squadronId) {
      console.warn(`Sortie ${s.ID} references unknown line ${s.lineID}`)
      return
    }

    const start = new Date(s._start)
    const end = new Date(s._end)

    events[s.ID] = {
      id: s.ID,
      squadronId,
      start: start.toISOString(),
      end: end.toISOString(),
      connections: {
        before: null,
        after: null
      },
      startType: mapStartEndType(s.startType),
      endType: mapStartEndType(s.endType),
      missionNumber: '', // Will be computed based on cycle/squadron/order
      aircraftCount: 1,  // v2 didn't track this
      missionType: '',   // v2 didn't track this
      note: s.note || '',
      prenote: s.prenote || '',
      postnote: s.postnote || '',
      isAlert: s.isAlert || false,
      markers: []        // v2 didn't have markers
    }
  })

  // Migrate day data
  const days: Record<string, DayData> = {}
  julianDates.forEach(jd => {
    days[jd] = {
      date: fromJulianDate(jd).toISOString().split('T')[0],
      julianDate: jd,
      start: getDateValue(data._start, jd, 8, 0),
      end: getDateValue(data._end, jd, 18, 0),
      title: getStringValue(data.title, jd, 'Airplan Title'),
      subtitle: getStringValue(data.subtitle, jd, ''),
      slap: {
        sunrise: getDateValue(data._sunrise, jd, 6, 46),
        sunset: getDateValue(data._sunset, jd, 19, 29),
        moonrise: getDateValue(data._moonrise, jd, 10, 8),
        moonset: getDateValue(data._moonset, jd, 4, 20),
        moonPhase: getStringValue(data.moonphase, jd, '')
      },
      flightQuarters: getDateValue(data._flightquarters, jd, 11, 30),
      heloQuarters: getDateValue(data._heloquarters, jd, 10, 0),
      variation: getStringValue(data.variation, jd, ''),
      timezone: getStringValue(data.timezone, jd, 'UTC')
    }
  })

  // Determine plan name
  const planName = name ||
    getStringValue(data.title, julianDates[0] || '', 'Untitled Plan')

  const now = new Date().toISOString()

  return {
    version: '0.7.0',
    name: planName,
    squadronLayout,
    days,
    events,
    cycles,
    metadata: {
      created: now,
      modified: now
    }
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Collect all unique julian dates from the legacy data.
 */
function collectJulianDates(data: LegacyData): string[] {
  const dates = new Set<string>()

  // From day-level fields
  const fields = [
    data._start, data._end, data.title, data.subtitle,
    data._sunrise, data._sunset, data._moonrise, data._moonset,
    data.moonphase, data._flightquarters, data._heloquarters,
    data.variation, data.timezone
  ]

  fields.forEach(field => {
    if (field && typeof field === 'object') {
      Object.keys(field).forEach(key => dates.add(key))
    }
  })

  // From sorties
  Object.values(data.sorties).forEach(s => {
    const start = new Date(s._start)
    dates.add(toJulianDate(start))
  })

  // From cycles
  Object.values(data.cycles).forEach(c => {
    const start = new Date(c._start)
    dates.add(toJulianDate(start))
  })

  return Array.from(dates).sort()
}

/**
 * Get a date value from legacy data, handling both single-day and multi-day formats.
 */
function getDateValue(
  field: Record<string, string> | string | undefined,
  julianDate: string,
  defaultHour: number,
  defaultMinute: number
): string {
  if (!field) {
    const date = fromJulianDate(julianDate)
    date.setHours(defaultHour, defaultMinute, 0, 0)
    return date.toISOString()
  }

  if (typeof field === 'string') {
    return new Date(field).toISOString()
  }

  if (field[julianDate]) {
    return new Date(field[julianDate]).toISOString()
  }

  // Default value
  const date = fromJulianDate(julianDate)
  date.setHours(defaultHour, defaultMinute, 0, 0)
  return date.toISOString()
}

/**
 * Get a string value from legacy data, handling both single-day and multi-day formats.
 */
function getStringValue(
  field: Record<string, string> | string | undefined,
  julianDate: string,
  defaultValue: string
): string {
  if (!field) return defaultValue

  if (typeof field === 'string') return field

  return field[julianDate] ?? defaultValue
}

/**
 * Map legacy start/end type strings to our typed enum.
 */
function mapStartEndType(type: string | undefined): StartEndType {
  const typeMap: Record<string, StartEndType> = {
    'pull': 'pull',
    'stuff': 'stuff',
    'hp': 'hp',
    'hpcs': 'hpcs',
    'flyon': 'flyon',
    'flyoff': 'flyoff',
    'sto': 'sto'
  }

  return typeMap[type?.toLowerCase() ?? ''] ?? 'pull'
}

// =============================================================================
// Version Detection
// =============================================================================

/**
 * Detect the version of a JSON file.
 */
export function detectVersion(data: unknown): string {
  if (!data || typeof data !== 'object') {
    return 'unknown'
  }

  const obj = data as Record<string, unknown>

  // Check for v0.7.0 format
  if (obj.version === '0.7.0') {
    return '0.7.0'
  }

  // Check for v2 format (legacy)
  if (
    obj.version === 2 ||
    (obj.squadrons && obj.lines && obj.sorties && obj.cycles)
  ) {
    return 'v2'
  }

  // Check for v1 format (very old, single-day)
  if (
    obj.squadrons && obj.sorties &&
    typeof (obj as LegacyData)._start === 'string'
  ) {
    return 'v1'
  }

  return 'unknown'
}

/**
 * Load and migrate a JSON file to current format.
 */
export function loadAndMigrate(data: unknown, name?: string): AirplanState {
  const version = detectVersion(data)

  switch (version) {
    case '0.7.0':
      return data as AirplanState

    case 'v2':
    case 'v1':
      return migrateV2ToV07(data as LegacyData, name)

    default:
      throw new Error(`Unknown file format (version: ${version})`)
  }
}

// =============================================================================
// Export Functions
// =============================================================================

/**
 * Export state to JSON string.
 */
export function exportToJson(state: AirplanState): string {
  return JSON.stringify(state, null, 2)
}

/**
 * Parse JSON string and migrate if necessary.
 */
export function parseAndMigrate(jsonString: string, name?: string): AirplanState {
  const data = JSON.parse(jsonString)
  return loadAndMigrate(data, name)
}
