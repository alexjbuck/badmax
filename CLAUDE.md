# BadMax - Project Context for Claude

## Critical Constraint: Bandwidth

**This is a Navy application used on ships at sea. Ships have extremely limited bandwidth - sometimes in the 10s of kbps range.**

Our #1 consideration must ALWAYS be required bandwidth:
- Minimize bundle size aggressively
- Modern feel is good, but NOT at the expense of large bundles
- Time to first render must be ASAP
- A static "loading" page that renders instantly is acceptable while the rest of the app loads
- Every kilobyte matters

## Architecture

- **Frontend-only PWA** - No server, all persistence via user downloads/uploads
- **Svelte + Vite** - Chosen for small bundle size
- **Offline-first** - Must work without network after initial load (service worker caching)

## Deployment

- **Padawan** (Platform One static hosting) - GitLab CI via npm.yml pipeline
- **GitHub Pages** - GitHub Actions workflow
- Build outputs to `dist/`
- Supports configurable `BASE_PATH` for different deployment targets

## Development

```bash
npm run dev      # Start dev server
npm run build    # Build to dist/
npm run preview  # Preview production build
npm run lint     # ESLint
npm run test:unit # Vitest
```

## Legacy Code

The original vanilla JS implementation is preserved in `src/legacy/` for reference during migration. This code used global variables and script tags - we're modernizing to ES modules and Svelte components.
