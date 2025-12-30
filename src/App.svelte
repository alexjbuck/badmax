<script>
  import { version } from '../package.json'

  // PWA registration will be handled by vite-plugin-pwa
</script>

<main>
  <header>
    <h1>BadMax</h1>
    <span class="version">v{version}</span>
  </header>

  <div class="container">
    <section class="info">
      <h2>Airplan Writer</h2>
      <p>For when you don't have ADMACS (maybe even when you do!)</p>
      <p class="migrating">
        This app is being migrated to Svelte. Check back soon!
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
