# BadMax Improvement Recommendations

This document outlines recommended improvements for the BadMax airplan writer application, organized by category and priority.

---

## 1. Architecture & Code Quality

### High Priority

- **Introduce a build system**: The project has no bundler/build tool. Consider adding Vite or esbuild for:
  - Module bundling and tree-shaking
  - Minification for production
  - Source maps for debugging
  - Hot module replacement during development
  - Environment variable management

- **Convert to ES modules**: Currently uses global script loading via `<script>` tags. Migrating to ES modules would:
  - Enable proper dependency management
  - Allow tree-shaking of unused code
  - Improve code organization with explicit imports/exports
  - Make the codebase easier to reason about

- **Extract repeated Proxy pattern**: `Model.js:10-23` and `Model.js:108-120` duplicate the same Proxy creation pattern. Extract to a factory function:
  ```javascript
  createDateProxy(defaultValue) {
    return new Proxy({}, {
      get: (obj, key) => key in obj ? obj[key] : defaultValue(key)
    })
  }
  ```

- **Reduce View.js complexity**: At 1,407 lines, `View.js` handles too many responsibilities. Split into:
  - `MenuView.js` - Menu rendering and bindings
  - `ModalView.js` - Modal dialog management
  - `StageView.js` - Konva canvas rendering
  - `ListView.js` - Sortie/cycle list panel

- **Remove prototype pollution**: `utils.js` extends native `Date` and `Konva.Node` prototypes. This is risky:
  - Could conflict with future browser/library updates
  - Makes debugging harder
  - Consider utility functions or wrapper classes instead

### Medium Priority

- **Consistent error handling**: No try/catch blocks around JSON parsing (`Controller.js:81`), file operations, or canvas rendering. Add error boundaries and user-friendly error messages.

- **Type safety with JSDoc or TypeScript**: Add type annotations to catch bugs early:
  ```javascript
  /**
   * @param {string} lineID
   * @param {Date} start
   * @param {Date} end
   * @returns {Sortie}
   */
  addSortie(lineID, start, end, ...) { }
  ```

- **Eliminate magic numbers**: Hardcoded values scattered throughout:
  - `Controller.js:29-30`: `defaultSortieLength = 90`, `defaultCycleLength = 75`
  - `View.js:16-23`: Various pixel dimensions
  - Extract to a configuration object

- **Remove commented-out code**: Multiple files contain dead code:
  - `Model.js:34-37`, `Model.js:246-251`, `Model.js:333-352`
  - `View.js:8-12`, `View.js:28`, `View.js:33`
  - Either delete or document why it's preserved

---

## 2. Build System & Developer Experience

### High Priority

- **Add package manager lockfile**: No `package-lock.json` or `yarn.lock`. Add one to ensure reproducible builds.

- **Fix package.json repository URL**: Currently points to wrong repo:
  ```json
  "repository": {
    "url": "https://github.com/npm/cli.git"  // Wrong!
  }
  ```
  Should be: `https://github.com/alexjbuck/badmax.git`

- **Add npm scripts**: Currently no scripts defined. Add:
  ```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src/",
    "test": "vitest"
  }
  ```

- **Add linting**: No ESLint configuration. Add `.eslintrc.js` with rules for:
  - Unused variables
  - Consistent formatting
  - No implicit globals
  - Semicolon enforcement

### Medium Priority

- **Add pre-commit hooks**: Use husky + lint-staged to:
  - Run linter before commits
  - Format code with Prettier
  - Prevent commits with errors

- **Add .editorconfig**: Ensure consistent formatting across editors

- **Modernize dependencies**: Bootstrap 4.0.0 is outdated (current is 5.x). Consider upgrading or switching to a lighter CSS framework like Tailwind.

---

## 3. Testing

### High Priority

- **Add unit tests**: Zero test coverage currently. Prioritize testing:
  - `Model.js` - Core data operations
  - `utils.js` - Date formatting functions
  - `Sortie.js`, `Cycle.js` - Entity classes
  - Julian date calculations (critical for aviation)

- **Test data serialization**: The JSON save/load cycle is critical. Test:
  - Round-trip serialization (save then load produces identical state)
  - Version migration (`Model.js:90-107`)
  - Edge cases (empty airplan, max sorties, etc.)

### Medium Priority

- **Add integration tests**: Test user workflows:
  - Create squadron → add line → add sortie → save → reload
  - Date shifting functionality
  - PDF export (verify file is generated)

- **Visual regression tests**: Canvas rendering is complex. Use tools like Percy or Chromatic to catch visual regressions.

---

## 4. Performance

### High Priority

- **Optimize full redraws**: `onAirplanChanged()` triggers complete redraws of stage, lists, and rebinds all events. Consider:
  - Diff-based updates (only redraw changed elements)
  - Debounce rapid changes
  - Virtual DOM or observable patterns for selective updates

- **Lazy load libraries**: `jspdf` and `fileSaver` are only needed for export. Load them on-demand:
  ```javascript
  async handleExportFile() {
    const jspdf = await import('jspdf')
    // ...
  }
  ```

- **Optimize event binding**: Currently unbinds and rebinds all events on every change (`View.js:905-911`). Use event delegation instead:
  ```javascript
  // Instead of binding to each .highlight element
  stage.on('click', '.highlight', handler)
  ```

### Medium Priority

- **Reduce DOM queries**: Heavy jQuery usage with repeated selectors. Cache DOM references:
  ```javascript
  // Current (repeated queries)
  $('#start').val(...)
  $('#end').val(...)

  // Better (cached)
  const $form = {
    start: $('#start'),
    end: $('#end')
  }
  ```

- **Web Workers for calculations**: Sun/moon calculations and date shifts could run in a Web Worker to avoid blocking the UI.

---

## 5. Security

### High Priority

- **Sanitize user input**: HTML is built via string concatenation throughout `View.js`:
  ```javascript
  html += "<option value='"+sqdrn.ID+"'>"+sqdrn.name+"</option>"
  ```
  Squadron names from loaded files could contain XSS payloads. Use DOM APIs or template literals with proper escaping.

- **Validate loaded JSON**: `handleLoadFile` parses JSON without validation (`Controller.js:81-83`). Malformed files could crash the app or inject unexpected data. Add schema validation.

- **Sanitize file names**: Exported filenames use date strings (`Controller.js:89`, `Controller.js:100`). Ensure they're safe for all filesystems.

### Medium Priority

- **Content Security Policy**: Add CSP headers to restrict script sources and prevent XSS.

- **Subresource Integrity**: Add SRI hashes for self-hosted libraries to detect tampering.

---

## 6. Accessibility

### High Priority

- **Add keyboard navigation**: Canvas elements are only clickable with mouse. Add:
  - Tab navigation between elements
  - Enter/Space to activate
  - Arrow keys for timeline navigation

- **Screen reader support**: Canvas is invisible to screen readers. Add:
  - `aria-label` for interactive elements
  - A text-based alternative view
  - Live regions for status updates

- **Color contrast**: Verify color choices meet WCAG AA standards (4.5:1 for text)

### Medium Priority

- **Focus management**: When modals open/close, focus should move appropriately

- **Reduce motion**: Respect `prefers-reduced-motion` for animations

- **Form labels**: Some inputs lack proper label associations (`View.js:768-769`)

---

## 7. User Experience

### High Priority

- **Undo/Redo**: No way to undo mistakes. Implement command pattern:
  ```javascript
  class Command {
    execute() { }
    undo() { }
  }
  const undoStack = []
  const redoStack = []
  ```

- **Autosave**: Users can lose work if browser crashes. Add:
  - Periodic autosave to localStorage
  - Recovery prompt on page load
  - Visual indicator of unsaved changes

- **Confirmation dialogs**: Destructive actions (reset, delete squadron) execute immediately. Add confirmation for:
  - Reset ("Burn it Down")
  - Delete squadron with sorties
  - Close with unsaved changes

### Medium Priority

- **Drag and drop**: Allow reordering and time-adjusting sorties via drag on canvas

- **Copy/paste sorties**: Duplicate sorties within or across lines

- **Bulk operations**: Select multiple sorties for batch delete/edit

- **Search/filter**: Find sorties by callsign, time, or note

- **Print stylesheet**: Optimize CSS for printing directly from browser

---

## 8. PWA & Offline

### High Priority

- **Cache versioning**: `service-worker.js` uses `BadMaxCache_v2`. Implement proper cache invalidation strategy:
  - Hash-based filenames for cache busting
  - Automatic cleanup of old caches

- **Offline indicator**: No visual feedback when offline. Add a banner or icon showing connection status.

- **Background sync**: Queue save operations when offline, sync when reconnected

### Medium Priority

- **Update prompt**: Notify users when new version is available, prompt to refresh

- **Pre-cache critical assets**: Ensure app works immediately after install without network

---

## 9. Data Management

### High Priority

- **Data backup/export formats**: Only JSON supported. Consider:
  - CSV export for spreadsheet import
  - iCal/ICS for calendar integration
  - Human-readable text summary

- **Cloud sync option**: Allow optional sync to cloud storage (OneDrive, Google Drive) for backup and cross-device access

- **Import from other formats**: Parse existing airplan formats (Excel templates, etc.)

### Medium Priority

- **Data validation on load**: Validate loaded airplans have required fields and valid data ranges

- **Migration path**: Document upgrade path between versions, test migrations

- **Templates**: Allow saving/loading airplan templates (squadron configurations without sorties)

---

## 10. Documentation

### High Priority

- **Code documentation**: Many functions lack JSDoc comments. Prioritize:
  - Public API methods
  - Complex algorithms (Julian date conversion, time calculations)
  - Configuration options

- **Architecture diagram**: Document the MVC relationship and data flow

- **Contributing guide**: Add CONTRIBUTING.md with:
  - Development setup
  - Code style guidelines
  - PR process

### Medium Priority

- **User manual**: Expand help modal into full documentation:
  - Keyboard shortcuts
  - Tips for common workflows
  - Troubleshooting

- **API documentation**: If exposing for integration, document the data model schema

- **Changelog**: Add CHANGELOG.md to track version history

---

## 11. Feature Ideas (Lower Priority)

- **Multi-day view**: Show week or range view instead of single day
- **Weather overlay**: Integration with weather data APIs
- **Crew scheduling**: Track pilot assignments per sortie
- **Fuel planning**: Calculate fuel requirements based on sortie duration
- **Conflict detection**: Highlight overlapping sorties or scheduling conflicts
- **Real-time collaboration**: Multiple users editing same airplan (requires backend)
- **Mobile-optimized editing**: Current UI is desktop-focused
- **Dark mode**: Add theme toggle for night operations
- **Location-aware sun times**: Auto-populate sunrise/sunset based on GPS or entered coordinates
- **Sortie statistics**: Dashboard showing total flight hours, sorties by type, etc.

---

## Implementation Priority

### Phase 1 (Foundation)
1. Add build system (Vite)
2. Convert to ES modules
3. Fix package.json issues
4. Add linting
5. Add basic unit tests

### Phase 2 (Stability)
1. Add error handling
2. Input validation & sanitization
3. Autosave to localStorage
4. Undo/redo functionality

### Phase 3 (Polish)
1. Accessibility improvements
2. Performance optimizations
3. PWA enhancements
4. UX improvements (drag/drop, confirmation dialogs)

### Phase 4 (Features)
1. Additional export formats
2. Templates
3. Cloud sync
4. Advanced features

---

*Generated: 2025-12-28*
