<script lang="ts">
  import { version } from '../package.json'
  import { airplanState, squadrons, canUndo, canRedo, actions } from '$stores/airplan'
  import { createSquadron } from '$lib/types'

  // Demo: show we can use the stores
  $: planName = $airplanState.name
  $: squadronCount = $squadrons.length

  function addDemoSquadron() {
    actions.addSquadron(createSquadron('VFA-113', 'Stingers', 'F/A-18E', '100'))
  }
</script>

<main>
  <header>
    <h1>BadMax</h1>
    <span class="version">v{version}</span>
    <div class="undo-redo">
      <button onclick={() => actions.undo()} disabled={!$canUndo}>Undo</button>
      <button onclick={() => actions.redo()} disabled={!$canRedo}>Redo</button>
    </div>
  </header>

  <div class="container">
    <section class="info">
      <h2>Airplan Writer</h2>
      <p>For when you don't have ADMACS (maybe even when you do!)</p>

      <div class="demo">
        <p><strong>Plan:</strong> {planName}</p>
        <p><strong>Squadrons:</strong> {squadronCount}</p>
        <button onclick={addDemoSquadron}>Add Demo Squadron</button>

        {#if $squadrons.length > 0}
          <ul class="squadron-list">
            {#each $squadrons as sq (sq.id)}
              <li>
                {sq.name} ({sq.callsign}) - {sq.tms} {sq.modex}
                <button onclick={() => actions.removeSquadron(sq.id)}>Remove</button>
              </li>
            {/each}
          </ul>
        {/if}
      </div>

      <p class="migrating">
        Phase 1: Data model + stores complete. Canvas rendering coming soon!
      </p>
    </section>
  </div>

  <footer>
    <p>
      Credit: <a href="mailto:alexander.j.buck10.mil@us.navy.mil">Alexander "Jarvis" Buck</a>
      and <a href="mailto:sean.m.lavelle6.mil@us.navy.mil">Sean Lavelle</a>
    </p>
    <p>
      Source code on <a href="https://code.il2.dso.mil/tron/products/dod-open-source/digitize/badmax/">Platform One GitLab (IL2)</a>
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
    padding: 1rem 2rem;
    background: #16213e;
    border-bottom: 1px solid #0f3460;
  }

  header h1 {
    margin: 0;
    font-size: 1.5rem;
    color: #e94560;
  }

  .version {
    font-size: 0.75rem;
    color: #666;
  }

  .undo-redo {
    margin-left: auto;
    display: flex;
    gap: 0.5rem;
  }

  .undo-redo button {
    padding: 0.25rem 0.75rem;
    background: #0f3460;
    border: 1px solid #1a1a2e;
    color: #eee;
    border-radius: 4px;
    cursor: pointer;
  }

  .undo-redo button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .undo-redo button:hover:not(:disabled) {
    background: #16213e;
  }

  .container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .info {
    text-align: center;
    max-width: 600px;
  }

  .info h2 {
    color: #e94560;
    margin-bottom: 0.5rem;
  }

  .demo {
    margin: 2rem 0;
    padding: 1rem;
    background: #16213e;
    border-radius: 8px;
    border: 1px solid #0f3460;
    text-align: left;
  }

  .demo button {
    margin-top: 0.5rem;
    padding: 0.5rem 1rem;
    background: #e94560;
    border: none;
    color: white;
    border-radius: 4px;
    cursor: pointer;
  }

  .demo button:hover {
    background: #ff6b6b;
  }

  .squadron-list {
    list-style: none;
    padding: 0;
    margin-top: 1rem;
  }

  .squadron-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: #1a1a2e;
    border-radius: 4px;
    margin-bottom: 0.5rem;
  }

  .squadron-list button {
    margin: 0;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    background: #e94560;
  }

  .migrating {
    margin-top: 2rem;
    padding: 1rem;
    background: #16213e;
    border-radius: 8px;
    border: 1px solid #0f3460;
  }

  footer {
    padding: 1rem 2rem;
    background: #16213e;
    border-top: 1px solid #0f3460;
    text-align: center;
    font-size: 0.875rem;
  }

  footer p {
    margin: 0.25rem 0;
  }

  a {
    color: #e94560;
  }

  a:hover {
    color: #ff6b6b;
  }
</style>
