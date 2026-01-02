/**
 * Airplan State Store
 *
 * Provides reactive state management for the airplan with undo/redo support.
 * Uses Svelte's writable store pattern with immutable state updates.
 */

import { writable, derived, get } from 'svelte/store'
import type {
  AirplanState,
  Squadron,
  Event,
  Cycle,
  DayData
} from '$lib/types'
import { createEmptyState, toJulianDate } from '$lib/types'

// =============================================================================
// History Management
// =============================================================================

interface HistoryEntry {
  state: AirplanState
  description: string
  timestamp: number
}

const MAX_HISTORY = 50

function createHistoryStore() {
  const { subscribe, set, update } = writable<{
    past: HistoryEntry[]
    present: AirplanState
    future: HistoryEntry[]
  }>({
    past: [],
    present: createEmptyState('Untitled Plan'),
    future: []
  })

  return {
    subscribe,

    /**
     * Initialize with a new state (clears history)
     */
    init(state: AirplanState) {
      set({
        past: [],
        present: state,
        future: []
      })
    },

    /**
     * Apply a state change and push to history
     */
    push(newState: AirplanState, description: string) {
      update(h => {
        const entry: HistoryEntry = {
          state: h.present,
          description,
          timestamp: Date.now()
        }

        // Limit history size
        const past = [entry, ...h.past].slice(0, MAX_HISTORY)

        return {
          past,
          present: {
            ...newState,
            metadata: {
              ...newState.metadata,
              modified: new Date().toISOString()
            }
          },
          future: []  // Clear redo stack on new change
        }
      })
    },

    /**
     * Undo the last change
     */
    undo() {
      update(h => {
        if (h.past.length === 0) return h

        const [previous, ...rest] = h.past
        const futureEntry: HistoryEntry = {
          state: h.present,
          description: 'Undo',
          timestamp: Date.now()
        }

        return {
          past: rest,
          present: previous.state,
          future: [futureEntry, ...h.future].slice(0, MAX_HISTORY)
        }
      })
    },

    /**
     * Redo the last undone change
     */
    redo() {
      update(h => {
        if (h.future.length === 0) return h

        const [next, ...rest] = h.future
        const pastEntry: HistoryEntry = {
          state: h.present,
          description: 'Redo',
          timestamp: Date.now()
        }

        return {
          past: [pastEntry, ...h.past].slice(0, MAX_HISTORY),
          present: next.state,
          future: rest
        }
      })
    },

    /**
     * Clear all history
     */
    clearHistory() {
      update(h => ({
        past: [],
        present: h.present,
        future: []
      }))
    }
  }
}

// =============================================================================
// Main Store
// =============================================================================

export const historyStore = createHistoryStore()

// Derived store for just the current state
export const airplanState = derived(
  historyStore,
  $h => $h.present
)

// Derived stores for specific parts of state
export const squadrons = derived(
  airplanState,
  $state => $state.squadronLayout
)

export const events = derived(
  airplanState,
  $state => Object.values($state.events)
)

export const cycles = derived(
  airplanState,
  $state => Object.values($state.cycles).sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  )
)

export const days = derived(
  airplanState,
  $state => Object.values($state.days).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
)

// Undo/redo availability
export const canUndo = derived(historyStore, $h => $h.past.length > 0)
export const canRedo = derived(historyStore, $h => $h.future.length > 0)

// =============================================================================
// Actions
// =============================================================================

function getCurrentState(): AirplanState {
  return get(airplanState)
}

export const actions = {
  // ---------------------------------------------------------------------------
  // Plan Management
  // ---------------------------------------------------------------------------

  newPlan(name: string) {
    historyStore.init(createEmptyState(name))
  },

  loadPlan(state: AirplanState) {
    historyStore.init(state)
  },

  renamePlan(name: string) {
    const state = getCurrentState()
    historyStore.push({ ...state, name }, `Rename plan to "${name}"`)
  },

  // ---------------------------------------------------------------------------
  // Squadron Management
  // ---------------------------------------------------------------------------

  addSquadron(squadron: Squadron) {
    const state = getCurrentState()
    historyStore.push(
      {
        ...state,
        squadronLayout: [...state.squadronLayout, squadron]
      },
      `Add squadron "${squadron.name}"`
    )
  },

  updateSquadron(id: string, updates: Partial<Squadron>) {
    const state = getCurrentState()
    const idx = state.squadronLayout.findIndex(s => s.id === id)
    if (idx === -1) return

    const newLayout = [...state.squadronLayout]
    newLayout[idx] = { ...newLayout[idx], ...updates }

    historyStore.push(
      { ...state, squadronLayout: newLayout },
      `Update squadron "${newLayout[idx].name}"`
    )
  },

  removeSquadron(id: string) {
    const state = getCurrentState()
    const squadron = state.squadronLayout.find(s => s.id === id)
    if (!squadron) return

    // Remove squadron and all its events
    const newEvents = { ...state.events }
    Object.keys(newEvents).forEach(eventId => {
      if (newEvents[eventId].squadronId === id) {
        delete newEvents[eventId]
      }
    })

    historyStore.push(
      {
        ...state,
        squadronLayout: state.squadronLayout.filter(s => s.id !== id),
        events: newEvents
      },
      `Remove squadron "${squadron.name}"`
    )
  },

  reorderSquadrons(newOrder: Squadron[]) {
    const state = getCurrentState()
    historyStore.push(
      { ...state, squadronLayout: newOrder },
      'Reorder squadrons'
    )
  },

  // ---------------------------------------------------------------------------
  // Event Management
  // ---------------------------------------------------------------------------

  addEvent(event: Event) {
    const state = getCurrentState()
    historyStore.push(
      {
        ...state,
        events: { ...state.events, [event.id]: event }
      },
      `Add event "${event.missionNumber || 'new'}"`
    )
  },

  updateEvent(id: string, updates: Partial<Event>) {
    const state = getCurrentState()
    const event = state.events[id]
    if (!event) return

    historyStore.push(
      {
        ...state,
        events: {
          ...state.events,
          [id]: { ...event, ...updates }
        }
      },
      `Update event "${event.missionNumber || id}"`
    )
  },

  removeEvent(id: string) {
    const state = getCurrentState()
    const event = state.events[id]
    if (!event) return

    // Remove event and update connections
    const newEvents = { ...state.events }
    delete newEvents[id]

    // Update any events that were connected to this one
    Object.values(newEvents).forEach(e => {
      if (e.connections.before === id) {
        newEvents[e.id] = {
          ...e,
          connections: { ...e.connections, before: null }
        }
      }
      if (e.connections.after === id) {
        newEvents[e.id] = {
          ...e,
          connections: { ...e.connections, after: null }
        }
      }
    })

    historyStore.push(
      { ...state, events: newEvents },
      `Remove event "${event.missionNumber || id}"`
    )
  },

  connectEvents(fromId: string, toId: string) {
    const state = getCurrentState()
    const fromEvent = state.events[fromId]
    const toEvent = state.events[toId]
    if (!fromEvent || !toEvent) return

    historyStore.push(
      {
        ...state,
        events: {
          ...state.events,
          [fromId]: {
            ...fromEvent,
            connections: { ...fromEvent.connections, after: toId }
          },
          [toId]: {
            ...toEvent,
            connections: { ...toEvent.connections, before: fromId }
          }
        }
      },
      `Connect events "${fromEvent.missionNumber}" → "${toEvent.missionNumber}"`
    )
  },

  disconnectEvents(fromId: string, toId: string) {
    const state = getCurrentState()
    const fromEvent = state.events[fromId]
    const toEvent = state.events[toId]
    if (!fromEvent || !toEvent) return

    historyStore.push(
      {
        ...state,
        events: {
          ...state.events,
          [fromId]: {
            ...fromEvent,
            connections: { ...fromEvent.connections, after: null }
          },
          [toId]: {
            ...toEvent,
            connections: { ...toEvent.connections, before: null }
          }
        }
      },
      `Disconnect events "${fromEvent.missionNumber}" → "${toEvent.missionNumber}"`
    )
  },

  // ---------------------------------------------------------------------------
  // Cycle Management
  // ---------------------------------------------------------------------------

  addCycle(cycle: Cycle) {
    const state = getCurrentState()
    historyStore.push(
      {
        ...state,
        cycles: { ...state.cycles, [cycle.id]: cycle }
      },
      'Add cycle'
    )
  },

  updateCycle(id: string, updates: Partial<Cycle>) {
    const state = getCurrentState()
    const cycle = state.cycles[id]
    if (!cycle) return

    historyStore.push(
      {
        ...state,
        cycles: {
          ...state.cycles,
          [id]: { ...cycle, ...updates }
        }
      },
      'Update cycle'
    )
  },

  removeCycle(id: string) {
    const state = getCurrentState()
    if (!state.cycles[id]) return

    const newCycles = { ...state.cycles }
    delete newCycles[id]

    historyStore.push(
      { ...state, cycles: newCycles },
      'Remove cycle'
    )
  },

  // ---------------------------------------------------------------------------
  // Day Management
  // ---------------------------------------------------------------------------

  addDay(dayData: DayData) {
    const state = getCurrentState()
    historyStore.push(
      {
        ...state,
        days: { ...state.days, [dayData.julianDate]: dayData }
      },
      `Add day ${dayData.date}`
    )
  },

  updateDay(julianDate: string, updates: Partial<DayData>) {
    const state = getCurrentState()
    const day = state.days[julianDate]
    if (!day) return

    historyStore.push(
      {
        ...state,
        days: {
          ...state.days,
          [julianDate]: { ...day, ...updates }
        }
      },
      `Update day ${day.date}`
    )
  },

  removeDay(julianDate: string) {
    const state = getCurrentState()
    if (!state.days[julianDate]) return

    const newDays = { ...state.days }
    delete newDays[julianDate]

    // Also remove cycles and events for that day
    const newCycles = { ...state.cycles }
    const newEvents = { ...state.events }

    Object.values(newCycles).forEach(c => {
      if (c.julianDate === julianDate) {
        delete newCycles[c.id]
      }
    })

    Object.values(newEvents).forEach(e => {
      const eventJd = toJulianDate(new Date(e.start))
      if (eventJd === julianDate) {
        delete newEvents[e.id]
      }
    })

    historyStore.push(
      { ...state, days: newDays, cycles: newCycles, events: newEvents },
      `Remove day ${julianDate}`
    )
  },

  // ---------------------------------------------------------------------------
  // Undo/Redo
  // ---------------------------------------------------------------------------

  undo() {
    historyStore.undo()
  },

  redo() {
    historyStore.redo()
  }
}

// =============================================================================
// Selectors (derived values)
// =============================================================================

/**
 * Get events for a specific squadron
 */
export function getEventsBySquadron(squadronId: string) {
  return derived(events, $events =>
    $events.filter(e => e.squadronId === squadronId)
  )
}

/**
 * Get events for a specific day
 */
export function getEventsByDay(julianDate: string) {
  return derived(events, $events =>
    $events.filter(e => toJulianDate(new Date(e.start)) === julianDate)
  )
}

/**
 * Get cycles for a specific day
 */
export function getCyclesByDay(julianDate: string) {
  return derived(cycles, $cycles =>
    $cycles.filter(c => c.julianDate === julianDate)
  )
}

/**
 * Calculate squadron letter based on position in layout
 */
export function getSquadronLetter(squadronId: string) {
  return derived(squadrons, $squadrons => {
    const idx = $squadrons.findIndex(s => s.id === squadronId)
    return idx >= 0 ? String.fromCharCode(65 + idx) : '?'
  })
}
