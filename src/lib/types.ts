/**
 * BadMax Data Model Types
 *
 * Terminology:
 * - Event = timeline bar / "line on the airplan" (e.g., "1A3 4 STK")
 * - Marker = point-in-time symbol on an event (AAR, refueling, crew swap, etc.)
 * - Squadron = military unit (e.g., VFA-113)
 * - Cycle = launch/recovery cycle on aircraft carrier
 */

// =============================================================================
// Core Entity Types
// =============================================================================

export interface Squadron {
  id: string
  name: string      // e.g., "VFA-113"
  callsign: string  // e.g., "Stingers"
  tms: string       // Type/Model/Series, e.g., "F/A-18E"
  modex: string     // Base aircraft serial number, e.g., "100"
}

/**
 * Event = the timeline bar / "line on the airplan" (e.g., "1A3 4 STK")
 * Represents one or more aircraft flying together.
 *
 * Note: In legacy code, this was called "Sortie"
 */
export interface Event {
  id: string
  squadronId: string
  start: string     // ISO 8601 date string
  end: string       // ISO 8601 date string
  connections: {
    before: string | null  // eventId of connected event before
    after: string | null   // eventId of connected event after
  }
  startType: StartEndType
  endType: StartEndType
  missionNumber: string   // e.g., "1A3" (cycle + squadron letter + number)
  aircraftCount: number   // How many aircraft (e.g., 4)
  missionType: string     // e.g., "STK", "PTNK", "BFM", "DCA"
  note: string
  prenote: string
  postnote: string
  isAlert: boolean
  alertType?: AlertType
  markers: Marker[]
}

/**
 * Marker = point-in-time symbol on an event (AAR, TOT, refueling, etc.)
 */
export interface Marker {
  id: string
  symbol: MarkerSymbol
  timing: MarkerTiming
  showTime: boolean
  annotations: MarkerAnnotations
}

export interface Cycle {
  id: string
  start: string     // ISO 8601 date string
  end: string       // ISO 8601 date string
  julianDate: string  // "2460000,1" for filtering by day
  scale: number       // 1.0 = normal, >1 = expanded (not-to-scale)
}

export interface DayData {
  date: string        // ISO 8601 date string (date only)
  julianDate: string  // "2460000,1"
  start: string       // Timeline start (ISO 8601)
  end: string         // Timeline end (ISO 8601)
  title: string
  subtitle: string
  slap: SLAPData
  flightQuarters: string  // ISO 8601
  heloQuarters: string    // ISO 8601
  variation: string       // e.g., "10E" for magnetic variation
  timezone: string        // e.g., "UTC-5"
}

export interface SLAPData {
  sunrise: string     // ISO 8601
  sunset: string      // ISO 8601
  moonrise: string    // ISO 8601
  moonset: string     // ISO 8601
  moonPhase: string   // e.g., "75%"
  location?: {
    start?: LatLon
    end?: LatLon
  }
}

export interface LatLon {
  lat: number
  lon: number
}

// =============================================================================
// Enum Types
// =============================================================================

export type StartEndType =
  | 'pull'    // Standard takeoff
  | 'stuff'   // Standard landing
  | 'hp'      // Hot pit refuel
  | 'hpcs'    // Hot pit with crew swap
  | 'flyon'   // Fly on (arrive from another location)
  | 'flyoff'  // Fly off (depart to another location)
  | 'sto'     // Short takeoff
  | 'custom'

export type AlertType = 'standard' | 'TTLR'  // TTLR = Tanker at Last Recovery

export type MarkerSymbol =
  | 'circle-open'      // Refueling requirement (unfilled)
  | 'circle-closed'    // Refueling requirement (filled)
  | 'diamond-open'     // On-deck crew swap/refuel (unfilled)
  | 'diamond-closed'   // On-deck crew swap/refuel (filled)
  | 'chevron-down'     // Landing without fuel/swap
  | 'tick-left'        // Fly on
  | 'tick-right'       // Fly off
  | 'bar-vertical'     // Pull/stuff
  | 'custom'

export interface MarkerTiming {
  mode: 'offset' | 'relative' | 'fixed'
  /**
   * offset: +/- hours from anchor
   * relative: percentage (0-100) through event or cycle
   * fixed: timestamp (ISO 8601)
   */
  value: number | string
  anchor: 'event-start' | 'event-end' | 'cycle-start' | 'cycle-end' | 'absolute'
  cycleId?: string  // if anchored to cycle
}

export interface MarkerAnnotations {
  topLeft: string
  topCenter: string
  topRight: string
  middleLeft: string
  middleCenter: string
  middleRight: string
  bottomLeft: string
  bottomCenter: string
  bottomRight: string
}

// =============================================================================
// Application State
// =============================================================================

export interface AirplanState {
  version: string  // "0.7.0"
  name: string     // Plan name
  squadronLayout: Squadron[]  // Ordered list
  days: Record<string, DayData>  // keyed by julianDate
  events: Record<string, Event>  // keyed by id
  cycles: Record<string, Cycle>  // keyed by id
  metadata: {
    created: string   // ISO 8601
    modified: string  // ISO 8601
    author?: string
  }
}

// =============================================================================
// Factory Functions
// =============================================================================

export function createSquadron(
  name: string,
  callsign: string = '',
  tms: string = '',
  modex: string = ''
): Squadron {
  return {
    id: crypto.randomUUID(),
    name,
    callsign,
    tms,
    modex
  }
}

export function createEvent(
  squadronId: string,
  start: Date,
  end: Date,
  options: Partial<Omit<Event, 'id' | 'squadronId' | 'start' | 'end'>> = {}
): Event {
  return {
    id: crypto.randomUUID(),
    squadronId,
    start: start.toISOString(),
    end: end.toISOString(),
    connections: { before: null, after: null },
    startType: 'pull',
    endType: 'stuff',
    missionNumber: '',
    aircraftCount: 1,
    missionType: '',
    note: '',
    prenote: '',
    postnote: '',
    isAlert: false,
    markers: [],
    ...options
  }
}

export function createCycle(
  start: Date,
  end: Date,
  scale: number = 1.0
): Cycle {
  return {
    id: crypto.randomUUID(),
    start: start.toISOString(),
    end: end.toISOString(),
    julianDate: toJulianDate(start),
    scale
  }
}

export function createMarker(
  symbol: MarkerSymbol,
  timing: MarkerTiming,
  annotations: Partial<MarkerAnnotations> = {}
): Marker {
  return {
    id: crypto.randomUUID(),
    symbol,
    timing,
    showTime: false,
    annotations: {
      topLeft: '',
      topCenter: '',
      topRight: '',
      middleLeft: '',
      middleCenter: '',
      middleRight: '',
      bottomLeft: '',
      bottomCenter: '',
      bottomRight: '',
      ...annotations
    }
  }
}

export function createEmptyState(name: string): AirplanState {
  const now = new Date()
  return {
    version: '0.7.0',
    name,
    squadronLayout: [],
    days: {},
    events: {},
    cycles: {},
    metadata: {
      created: now.toISOString(),
      modified: now.toISOString()
    }
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Convert a Date to Julian Date string format used for keying days.
 * Returns format like "2460000,1" where the second part is a day counter.
 */
export function toJulianDate(date: Date): string {
  // Julian Day Number calculation
  const a = Math.floor((14 - (date.getMonth() + 1)) / 12)
  const y = date.getFullYear() + 4800 - a
  const m = (date.getMonth() + 1) + 12 * a - 3
  const jdn = date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y +
              Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045

  // Day of year as second component
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)) + 1

  return `${jdn},${dayOfYear}`
}

/**
 * Convert a Julian Date string back to a Date object.
 */
export function fromJulianDate(julianDate: string): Date {
  const [jdn] = julianDate.split(',').map(Number)

  // Convert JDN to Gregorian calendar
  const l = jdn + 68569
  const n = Math.floor(4 * l / 146097)
  const l2 = l - Math.floor((146097 * n + 3) / 4)
  const i = Math.floor(4000 * (l2 + 1) / 1461001)
  const l3 = l2 - Math.floor(1461 * i / 4) + 31
  const j = Math.floor(80 * l3 / 2447)
  const day = l3 - Math.floor(2447 * j / 80)
  const l4 = Math.floor(j / 11)
  const month = j + 2 - 12 * l4
  const year = 100 * (n - 49) + i + l4

  return new Date(year, month - 1, day)
}

/**
 * Calculate event duration in hours.
 */
export function getEventDuration(event: Event): number {
  const start = new Date(event.start)
  const end = new Date(event.end)
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60)
}

/**
 * Format duration as decimal hours (e.g., "1.5")
 */
export function formatDuration(hours: number): string {
  return hours.toFixed(1)
}
