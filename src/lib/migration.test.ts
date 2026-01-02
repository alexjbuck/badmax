import { describe, it, expect } from 'vitest'
import {
  migrateV2ToV07,
  detectVersion,
  loadAndMigrate,
  exportToJson,
  parseAndMigrate
} from './migration'
import { createEmptyState, createSquadron } from './types'

// Sample v2 legacy data (based on actual legacy format)
const sampleV2Data = {
  version: 2,
  title: { '2460324,15': 'Test Airplan' },
  subtitle: { '2460324,15': 'CVN-XX' },
  _start: { '2460324,15': '2024-01-15T08:00:00.000Z' },
  _end: { '2460324,15': '2024-01-15T18:00:00.000Z' },
  _sunrise: { '2460324,15': '2024-01-15T06:45:00.000Z' },
  _sunset: { '2460324,15': '2024-01-15T17:30:00.000Z' },
  _moonrise: { '2460324,15': '2024-01-15T10:00:00.000Z' },
  _moonset: { '2460324,15': '2024-01-15T22:00:00.000Z' },
  moonphase: { '2460324,15': '75%' },
  _flightquarters: { '2460324,15': '2024-01-15T07:30:00.000Z' },
  _heloquarters: { '2460324,15': '2024-01-15T07:00:00.000Z' },
  variation: { '2460324,15': '10E' },
  squadrons: {
    'sq-1': {
      ID: 'sq-1',
      name: 'VFA-113',
      cs: 'Stingers',
      tms: 'F/A-18E',
      modex: '100'
    },
    'sq-2': {
      ID: 'sq-2',
      name: 'VFA-25',
      cs: 'Fist of the Fleet',
      tms: 'F/A-18E',
      modex: '200'
    }
  },
  lines: {
    'line-1': { ID: 'line-1', squadronID: 'sq-1' },
    'line-2': { ID: 'line-2', squadronID: 'sq-2' }
  },
  sorties: {
    'sortie-1': {
      ID: 'sortie-1',
      lineID: 'line-1',
      _start: '2024-01-15T09:00:00.000Z',
      _end: '2024-01-15T11:00:00.000Z',
      startType: 'pull',
      endType: 'stuff',
      note: 'Test sortie',
      prenote: 'PRE',
      postnote: 'POST',
      isAlert: false
    },
    'sortie-2': {
      ID: 'sortie-2',
      lineID: 'line-2',
      _start: '2024-01-15T10:00:00.000Z',
      _end: '2024-01-15T12:30:00.000Z',
      startType: 'hp',
      endType: 'hp',
      note: 'Hot pit',
      isAlert: false
    }
  },
  cycles: {
    'cycle-1': {
      ID: 'cycle-1',
      _start: '2024-01-15T08:00:00.000Z',
      _end: '2024-01-15T10:00:00.000Z'
    },
    'cycle-2': {
      ID: 'cycle-2',
      _start: '2024-01-15T10:30:00.000Z',
      _end: '2024-01-15T12:30:00.000Z'
    }
  }
}

describe('Version Detection', () => {
  it('detects v0.7.0 format', () => {
    const state = createEmptyState('Test')
    expect(detectVersion(state)).toBe('0.7.0')
  })

  it('detects v2 format', () => {
    expect(detectVersion(sampleV2Data)).toBe('v2')
  })

  it('detects v2 format without explicit version', () => {
    const { version, ...dataWithoutVersion } = sampleV2Data
    expect(detectVersion(dataWithoutVersion)).toBe('v2')
  })

  it('returns unknown for invalid data', () => {
    expect(detectVersion(null)).toBe('unknown')
    expect(detectVersion({})).toBe('unknown')
    expect(detectVersion('string')).toBe('unknown')
  })
})

describe('migrateV2ToV07', () => {
  it('migrates squadrons correctly', () => {
    const result = migrateV2ToV07(sampleV2Data)

    expect(result.squadronLayout).toHaveLength(2)

    const vfa113 = result.squadronLayout.find(s => s.name === 'VFA-113')
    expect(vfa113).toBeDefined()
    expect(vfa113?.callsign).toBe('Stingers')
    expect(vfa113?.tms).toBe('F/A-18E')
    expect(vfa113?.modex).toBe('100')
  })

  it('migrates sorties to events correctly', () => {
    const result = migrateV2ToV07(sampleV2Data)

    expect(Object.keys(result.events)).toHaveLength(2)

    const event1 = result.events['sortie-1']
    expect(event1).toBeDefined()
    expect(event1.squadronId).toBe('sq-1')
    expect(event1.note).toBe('Test sortie')
    expect(event1.prenote).toBe('PRE')
    expect(event1.postnote).toBe('POST')
    expect(event1.startType).toBe('pull')
    expect(event1.endType).toBe('stuff')
    expect(event1.markers).toEqual([])
  })

  it('migrates cycles correctly', () => {
    const result = migrateV2ToV07(sampleV2Data)

    expect(Object.keys(result.cycles)).toHaveLength(2)

    const cycle1 = result.cycles['cycle-1']
    expect(cycle1).toBeDefined()
    expect(new Date(cycle1.start).toISOString()).toBe('2024-01-15T08:00:00.000Z')
    expect(cycle1.scale).toBe(1.0)
  })

  it('migrates day data correctly', () => {
    const result = migrateV2ToV07(sampleV2Data)

    expect(Object.keys(result.days).length).toBeGreaterThan(0)

    const dayKeys = Object.keys(result.days)
    const dayData = result.days[dayKeys[0]]

    expect(dayData.title).toBe('Test Airplan')
    expect(dayData.subtitle).toBe('CVN-XX')
    expect(dayData.slap.moonPhase).toBe('75%')
    expect(dayData.variation).toBe('10E')
  })

  it('sets version to 0.7.0', () => {
    const result = migrateV2ToV07(sampleV2Data)
    expect(result.version).toBe('0.7.0')
  })

  it('preserves original IDs', () => {
    const result = migrateV2ToV07(sampleV2Data)

    expect(result.squadronLayout[0].id).toBe('sq-1')
    expect(result.events['sortie-1']).toBeDefined()
    expect(result.cycles['cycle-1']).toBeDefined()
  })

  it('uses provided name over title', () => {
    const result = migrateV2ToV07(sampleV2Data, 'Custom Name')
    expect(result.name).toBe('Custom Name')
  })

  it('handles start/end types correctly', () => {
    const result = migrateV2ToV07(sampleV2Data)

    const event2 = result.events['sortie-2']
    expect(event2.startType).toBe('hp')
    expect(event2.endType).toBe('hp')
  })
})

describe('loadAndMigrate', () => {
  it('passes through v0.7.0 data unchanged', () => {
    const state = createEmptyState('Test')
    state.squadronLayout.push(createSquadron('VFA-113'))

    const result = loadAndMigrate(state)

    expect(result.version).toBe('0.7.0')
    expect(result.name).toBe('Test')
    expect(result.squadronLayout).toHaveLength(1)
  })

  it('migrates v2 data', () => {
    const result = loadAndMigrate(sampleV2Data)

    expect(result.version).toBe('0.7.0')
    expect(result.squadronLayout).toHaveLength(2)
  })

  it('throws for unknown format', () => {
    expect(() => loadAndMigrate({ foo: 'bar' })).toThrow('Unknown file format')
  })
})

describe('Export/Parse Functions', () => {
  it('exports state to JSON', () => {
    const state = createEmptyState('Test')
    const json = exportToJson(state)

    expect(typeof json).toBe('string')
    const parsed = JSON.parse(json)
    expect(parsed.version).toBe('0.7.0')
    expect(parsed.name).toBe('Test')
  })

  it('parses and migrates JSON string', () => {
    const json = JSON.stringify(sampleV2Data)
    const result = parseAndMigrate(json)

    expect(result.version).toBe('0.7.0')
    expect(result.squadronLayout).toHaveLength(2)
  })

  it('handles custom name in parseAndMigrate', () => {
    const json = JSON.stringify(sampleV2Data)
    const result = parseAndMigrate(json, 'My Plan')

    expect(result.name).toBe('My Plan')
  })
})

describe('Edge Cases', () => {
  it('handles missing optional fields', () => {
    const minimalV2 = {
      version: 2,
      title: {},
      subtitle: {},
      _start: {},
      _end: {},
      _sunrise: {},
      _sunset: {},
      _moonrise: {},
      _moonset: {},
      moonphase: {},
      _flightquarters: {},
      _heloquarters: {},
      variation: {},
      squadrons: {},
      lines: {},
      sorties: {},
      cycles: {}
    }

    const result = migrateV2ToV07(minimalV2)

    expect(result.version).toBe('0.7.0')
    expect(result.squadronLayout).toHaveLength(0)
    expect(Object.keys(result.events)).toHaveLength(0)
  })

  it('handles sorties with missing line reference gracefully', () => {
    const dataWithOrphanSortie = {
      ...sampleV2Data,
      sorties: {
        'orphan': {
          ID: 'orphan',
          lineID: 'non-existent-line',
          _start: '2024-01-15T09:00:00.000Z',
          _end: '2024-01-15T11:00:00.000Z',
          startType: 'pull',
          endType: 'stuff',
          note: ''
        }
      }
    }

    // Should not throw, just skip the orphan sortie
    const result = migrateV2ToV07(dataWithOrphanSortie)
    expect(Object.keys(result.events)).toHaveLength(0)
  })

  it('handles unknown start/end types', () => {
    const dataWithUnknownType = {
      ...sampleV2Data,
      sorties: {
        'sortie-1': {
          ...sampleV2Data.sorties['sortie-1'],
          startType: 'unknown-type',
          endType: 'another-unknown'
        }
      }
    }

    const result = migrateV2ToV07(dataWithUnknownType)
    const event = result.events['sortie-1']

    // Should default to 'pull' for unknown types
    expect(event.startType).toBe('pull')
    expect(event.endType).toBe('pull')
  })
})
