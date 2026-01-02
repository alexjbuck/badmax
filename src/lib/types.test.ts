import { describe, it, expect } from 'vitest'
import {
  createSquadron,
  createEvent,
  createCycle,
  createMarker,
  createEmptyState,
  toJulianDate,
  fromJulianDate,
  getEventDuration,
  formatDuration
} from './types'

describe('Factory Functions', () => {
  describe('createSquadron', () => {
    it('creates a squadron with all fields', () => {
      const sq = createSquadron('VFA-113', 'Stingers', 'F/A-18E', '100')

      expect(sq.name).toBe('VFA-113')
      expect(sq.callsign).toBe('Stingers')
      expect(sq.tms).toBe('F/A-18E')
      expect(sq.modex).toBe('100')
      expect(sq.id).toBeDefined()
      expect(sq.id.length).toBeGreaterThan(0)
    })

    it('creates a squadron with default empty strings', () => {
      const sq = createSquadron('VFA-25')

      expect(sq.name).toBe('VFA-25')
      expect(sq.callsign).toBe('')
      expect(sq.tms).toBe('')
      expect(sq.modex).toBe('')
    })

    it('generates unique IDs', () => {
      const sq1 = createSquadron('VFA-113')
      const sq2 = createSquadron('VFA-113')

      expect(sq1.id).not.toBe(sq2.id)
    })
  })

  describe('createEvent', () => {
    it('creates an event with required fields', () => {
      const start = new Date('2024-01-15T08:00:00Z')
      const end = new Date('2024-01-15T10:00:00Z')
      const event = createEvent('squadron-1', start, end)

      expect(event.squadronId).toBe('squadron-1')
      expect(event.start).toBe(start.toISOString())
      expect(event.end).toBe(end.toISOString())
      expect(event.startType).toBe('pull')
      expect(event.endType).toBe('stuff')
      expect(event.missionNumber).toBe('')
      expect(event.aircraftCount).toBe(1)
      expect(event.markers).toEqual([])
      expect(event.connections.before).toBeNull()
      expect(event.connections.after).toBeNull()
    })

    it('creates an event with custom options', () => {
      const start = new Date('2024-01-15T08:00:00Z')
      const end = new Date('2024-01-15T10:00:00Z')
      const event = createEvent('squadron-1', start, end, {
        missionNumber: '1A3',
        aircraftCount: 4,
        missionType: 'STK',
        isAlert: true,
        alertType: 'standard'
      })

      expect(event.missionNumber).toBe('1A3')
      expect(event.aircraftCount).toBe(4)
      expect(event.missionType).toBe('STK')
      expect(event.isAlert).toBe(true)
      expect(event.alertType).toBe('standard')
    })
  })

  describe('createCycle', () => {
    it('creates a cycle with computed julian date', () => {
      const start = new Date('2024-01-15T08:00:00Z')
      const end = new Date('2024-01-15T10:00:00Z')
      const cycle = createCycle(start, end)

      expect(cycle.start).toBe(start.toISOString())
      expect(cycle.end).toBe(end.toISOString())
      expect(cycle.scale).toBe(1.0)
      expect(cycle.julianDate).toBeDefined()
    })

    it('creates a cycle with custom scale', () => {
      const start = new Date('2024-01-15T08:00:00Z')
      const end = new Date('2024-01-15T10:00:00Z')
      const cycle = createCycle(start, end, 1.5)

      expect(cycle.scale).toBe(1.5)
    })
  })

  describe('createMarker', () => {
    it('creates a marker with default annotations', () => {
      const marker = createMarker('circle-open', {
        mode: 'offset',
        value: 0.5,
        anchor: 'event-start'
      })

      expect(marker.symbol).toBe('circle-open')
      expect(marker.timing.mode).toBe('offset')
      expect(marker.timing.value).toBe(0.5)
      expect(marker.showTime).toBe(false)
      expect(marker.annotations.topLeft).toBe('')
      expect(marker.annotations.middleCenter).toBe('')
    })

    it('creates a marker with custom annotations', () => {
      const marker = createMarker(
        'diamond-closed',
        { mode: 'fixed', value: '2024-01-15T09:00:00Z', anchor: 'absolute' },
        { topCenter: 'TOT', bottomCenter: '0900Z' }
      )

      expect(marker.annotations.topCenter).toBe('TOT')
      expect(marker.annotations.bottomCenter).toBe('0900Z')
      expect(marker.annotations.topLeft).toBe('')
    })
  })

  describe('createEmptyState', () => {
    it('creates an empty state with correct version', () => {
      const state = createEmptyState('Test Plan')

      expect(state.version).toBe('0.7.0')
      expect(state.name).toBe('Test Plan')
      expect(state.squadronLayout).toEqual([])
      expect(state.events).toEqual({})
      expect(state.cycles).toEqual({})
      expect(state.days).toEqual({})
      expect(state.metadata.created).toBeDefined()
      expect(state.metadata.modified).toBeDefined()
    })
  })
})

describe('Julian Date Functions', () => {
  describe('toJulianDate', () => {
    it('converts a date to julian date format', () => {
      const date = new Date('2024-01-15T12:00:00Z')
      const jd = toJulianDate(date)

      expect(jd).toContain(',')
      const [jdn, dayOfYear] = jd.split(',').map(Number)
      expect(jdn).toBeGreaterThan(2400000)
      expect(dayOfYear).toBe(15) // Jan 15 is day 15
    })

    it('produces different values for different dates', () => {
      const date1 = new Date('2024-01-15T12:00:00Z')
      const date2 = new Date('2024-01-16T12:00:00Z')

      expect(toJulianDate(date1)).not.toBe(toJulianDate(date2))
    })
  })

  describe('fromJulianDate', () => {
    it('converts julian date back to Date', () => {
      // Use noon UTC to avoid timezone edge cases
      const original = new Date('2024-01-15T12:00:00Z')
      const jd = toJulianDate(original)
      const recovered = fromJulianDate(jd)

      // Compare just the date parts (using local time since fromJulianDate returns local)
      expect(recovered.getFullYear()).toBe(2024)
      expect(recovered.getMonth()).toBe(0) // January
      expect(recovered.getDate()).toBe(15)
    })

    it('handles various dates correctly', () => {
      const dates = [
        new Date('2024-12-31'),
        new Date('2024-06-15'),
        new Date('2025-01-01'),
        new Date('2020-02-29') // Leap year
      ]

      dates.forEach(original => {
        const jd = toJulianDate(original)
        const recovered = fromJulianDate(jd)

        expect(recovered.getFullYear()).toBe(original.getFullYear())
        expect(recovered.getMonth()).toBe(original.getMonth())
        expect(recovered.getDate()).toBe(original.getDate())
      })
    })
  })
})

describe('Utility Functions', () => {
  describe('getEventDuration', () => {
    it('calculates duration in hours', () => {
      const event = createEvent(
        'sq-1',
        new Date('2024-01-15T08:00:00Z'),
        new Date('2024-01-15T10:30:00Z')
      )

      expect(getEventDuration(event)).toBe(2.5)
    })

    it('handles sub-hour durations', () => {
      const event = createEvent(
        'sq-1',
        new Date('2024-01-15T08:00:00Z'),
        new Date('2024-01-15T08:30:00Z')
      )

      expect(getEventDuration(event)).toBe(0.5)
    })
  })

  describe('formatDuration', () => {
    it('formats duration with one decimal place', () => {
      expect(formatDuration(2.5)).toBe('2.5')
      expect(formatDuration(1.0)).toBe('1.0')
      expect(formatDuration(0.333333)).toBe('0.3')
    })
  })
})
