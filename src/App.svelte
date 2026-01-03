<script lang="ts">
  import { version } from '../package.json'
  import { airplanState, squadrons, events, cycles, canUndo, canRedo, actions } from '$stores/airplan'
  import { createSquadron, createEvent, createCycle, type DayData } from '$lib/types'
  import Timeline from '$components/Timeline.svelte'

  // Demo: show we can use the stores
  $: planName = $airplanState.name
  $: squadronCount = $squadrons.length

  // Demo day data
  const demoDayData: DayData = {
    date: new Date().toISOString().split('T')[0],
    julianDate: '2460000,1',
    start: new Date(new Date().setHours(6, 0, 0, 0)).toISOString(),
    end: new Date(new Date().setHours(20, 0, 0, 0)).toISOString(),
    title: 'Airplan Title',
    subtitle: 'CVN-XX',
    slap: {
      sunrise: new Date(new Date().setHours(6, 45, 0, 0)).toISOString(),
      sunset: new Date(new Date().setHours(18, 30, 0, 0)).toISOString(),
      moonrise: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
      moonset: new Date(new Date().setHours(22, 0, 0, 0)).toISOString(),
      moonPhase: '75%'
    },
    flightQuarters: new Date(new Date().setHours(7, 30, 0, 0)).toISOString(),
    heloQuarters: new Date(new Date().setHours(7, 0, 0, 0)).toISOString(),
    variation: '10E',
    timezone: 'UTC'
  }

  function addDemoData() {
    // Add squadrons
    const sq1 = createSquadron('VFA-113', 'Stingers', 'F/A-18E', '100')
    const sq2 = createSquadron('VFA-25', 'Fist', 'F/A-18E', '200')
    const sq3 = createSquadron('VAQ-141', 'Shadowhawks', 'EA-18G', '500')

    actions.addSquadron(sq1)
    actions.addSquadron(sq2)
    actions.addSquadron(sq3)

    // Add cycles
    const today = new Date()
    const cycle1Start = new Date(today.setHours(8, 0, 0, 0))
    const cycle1End = new Date(new Date(cycle1Start).setHours(10, 0, 0, 0))
    const cycle2Start = new Date(new Date(cycle1End).setHours(10, 30, 0, 0))
    const cycle2End = new Date(new Date(cycle2Start).setHours(12, 30, 0, 0))
    const cycle3Start = new Date(new Date(cycle2End).setHours(14, 0, 0, 0))
    const cycle3End = new Date(new Date(cycle3Start).setHours(16, 0, 0, 0))

    actions.addCycle(createCycle(cycle1Start, cycle1End))
    actions.addCycle(createCycle(cycle2Start, cycle2End))
    actions.addCycle(createCycle(cycle3Start, cycle3End))

    // Add events
    actions.addEvent(createEvent(sq1.id, cycle1Start, new Date(cycle1Start.getTime() + 2 * 60 * 60 * 1000), {
      missionNumber: '1A1',
      aircraftCount: 4,
      missionType: 'STK'
    }))

    actions.addEvent(createEvent(sq1.id, cycle2Start, new Date(cycle2Start.getTime() + 1.5 * 60 * 60 * 1000), {
      missionNumber: '2A1',
      aircraftCount: 2,
      missionType: 'DCA'
    }))

    actions.addEvent(createEvent(sq2.id, cycle1Start, new Date(cycle1Start.getTime() + 1.5 * 60 * 60 * 1000), {
      missionNumber: '1B1',
      aircraftCount: 4,
      missionType: 'PTNK'
    }))

    actions.addEvent(createEvent(sq2.id, cycle3Start, new Date(cycle3Start.getTime() + 2 * 60 * 60 * 1000), {
      missionNumber: '3B1',
      aircraftCount: 2,
      missionType: 'BFM'
    }))

    actions.addEvent(createEvent(sq3.id, cycle2Start, new Date(cycle2Start.getTime() + 2 * 60 * 60 * 1000), {
      missionNumber: '2C1',
      aircraftCount: 2,
      missionType: 'SEAD',
      isAlert: false
    }))

    // Add an alert event
    actions.addEvent(createEvent(sq3.id, cycle1Start, new Date(cycle1Start.getTime() + 0.5 * 60 * 60 * 1000), {
      missionNumber: 'A30',
      aircraftCount: 2,
      missionType: 'ALERT',
      isAlert: true
    }))
  }

  function clearAll() {
    actions.newPlan('Untitled Plan')
  }
</script>

<main>
  <header>
    <h1>BadMax</h1>
    <span class="version">v{version}</span>
    <div class="controls">
      <button onclick={() => actions.undo()} disabled={!$canUndo}>Undo</button>
      <button onclick={() => actions.redo()} disabled={!$canRedo}>Redo</button>
      <button onclick={addDemoData} class="primary">Add Demo Data</button>
      <button onclick={clearAll}>Clear All</button>
    </div>
  </header>

  <div class="content">
    <div class="timeline-wrapper">
      <Timeline
        squadrons={$squadrons}
        events={$events}
        cycles={$cycles}
        dayData={demoDayData}
        width={900}
        height={400}
      />
    </div>

    <div class="sidebar">
      <h3>Plan: {planName}</h3>
      <p><strong>Squadrons:</strong> {squadronCount}</p>
      <p><strong>Events:</strong> {$events.length}</p>
      <p><strong>Cycles:</strong> {$cycles.length}</p>

      {#if $squadrons.length > 0}
        <h4>Squadron Layout</h4>
        <ul class="squadron-list">
          {#each $squadrons as sq (sq.id)}
            <li>
              <span class="sq-name">{sq.name}</span>
              <span class="sq-detail">{sq.tms} {sq.modex}</span>
              <button onclick={() => actions.removeSquadron(sq.id)}>×</button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>

  <footer>
    <p>
      Credit: <a href="mailto:alexander.j.buck10.mil@us.navy.mil">Alexander "Jarvis" Buck</a>
      and <a href="mailto:sean.m.lavelle6.mil@us.navy.mil">Sean Lavelle</a>
    </p>
  </footer>
</main>

<style>
  main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: system-ui, -apple-system, sans-serif;
    background: #1a1a2e;
    color: #eee;
  }

  header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1.5rem;
    background: #16213e;
    border-bottom: 1px solid #0f3460;
  }

  header h1 {
    margin: 0;
    font-size: 1.25rem;
    color: #e94560;
  }

  .version {
    font-size: 0.75rem;
    color: #666;
  }

  .controls {
    margin-left: auto;
    display: flex;
    gap: 0.5rem;
  }

  button {
    padding: 0.35rem 0.75rem;
    background: #0f3460;
    border: 1px solid #1a1a2e;
    color: #eee;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  button:hover:not(:disabled) {
    background: #16213e;
  }

  button.primary {
    background: #e94560;
  }

  button.primary:hover:not(:disabled) {
    background: #ff6b6b;
  }

  .content {
    flex: 1;
    display: flex;
    gap: 1rem;
    padding: 1rem;
    overflow: auto;
  }

  .timeline-wrapper {
    flex: 1;
    min-width: 0;
  }

  .sidebar {
    width: 220px;
    flex-shrink: 0;
    background: #16213e;
    border-radius: 8px;
    padding: 1rem;
  }

  .sidebar h3 {
    margin: 0 0 0.5rem 0;
    color: #e94560;
    font-size: 1rem;
  }

  .sidebar h4 {
    margin: 1rem 0 0.5rem 0;
    font-size: 0.85rem;
    color: #888;
  }

  .sidebar p {
    margin: 0.25rem 0;
    font-size: 0.85rem;
  }

  .squadron-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .squadron-list li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0.5rem;
    background: #1a1a2e;
    border-radius: 4px;
    margin-bottom: 0.35rem;
    font-size: 0.8rem;
  }

  .sq-name {
    font-weight: 500;
    color: #e94560;
  }

  .sq-detail {
    color: #666;
    flex: 1;
  }

  .squadron-list button {
    padding: 0.15rem 0.4rem;
    font-size: 0.75rem;
    background: transparent;
    border: 1px solid #e94560;
    color: #e94560;
  }

  .squadron-list button:hover {
    background: #e94560;
    color: white;
  }

  footer {
    padding: 0.75rem 1.5rem;
    background: #16213e;
    border-top: 1px solid #0f3460;
    text-align: center;
    font-size: 0.8rem;
  }

  footer p {
    margin: 0;
  }

  a {
    color: #e94560;
  }

  a:hover {
    color: #ff6b6b;
  }
</style>
