# BadMax Svelte Migration Plan

## Overview
Migrate BadMax from vanilla JS/Konva to Svelte/Vite with TypeScript, modernizing the data model and improving the user experience while maintaining core functionality.

**Version**: 0.6.9 → 0.7.0

## Core Principles
1. **Bundle size first** - Users on ships with limited bandwidth
2. **Offline capable** - Full SLAP calculation embedded, no external dependencies
3. **Type safety** - TypeScript throughout
4. **Testable** - Unit tests for business logic, E2E with Cypress
5. **One-time backward compatibility** - Load old .json files, migrate to new format

---

## Phase 0: Project Setup

### 0.1 Svelte/Vite Scaffold
- [ ] Initialize Vite + Svelte + TypeScript project
- [ ] Configure Vite for optimal bundle size (tree-shaking, code splitting)
- [ ] Set up path aliases (@/lib, @/components, etc.)
- [ ] Configure build for offline PWA
- [ ] Add loading state that appears instantly (minimal bundle)

### 0.2 Development Tooling
- [ ] ESLint + Prettier for Svelte
- [ ] Vitest for unit tests
- [ ] Cypress for E2E tests
- [ ] GitHub Actions CI/CD
- [ ] Version management (evaluate changesets vs manual tag-based)

### 0.3 Dependencies
Minimize dependencies, prioritize bundle size:
- [ ] Evaluate canvas libraries (Svelte-native preferred)
  - Consider: svelte-canvas, konva (if necessary), or raw Canvas API
- [ ] IndexedDB wrapper (idb - 1.5kb gzipped)
- [ ] PDF generation (jsPDF or similar)
- [ ] SLAP calculation library (research or implement)

---

## Phase 1: New Data Model & Core Types

### 1.1 TypeScript Interfaces

#### Core Entities
```typescript
// Remove circular parent references
// Use ID lookups instead

interface Squadron {
  id: string; // UUID
  name: string;
  callsign: string;
  tms: string; // Type/Model/Series
  modex: string; // Base aircraft serial number
}

interface Sortie {
  id: string;
  squadronId: string;
  start: Date;
  end: Date;
  connections: {
    before: string | null; // sortieId
    after: string | null;  // sortieId
  };
  startType: EventType;
  endType: EventType;
  note: string;
  prenote: string;
  postnote: string;
  isAlert: boolean;
  alertType?: 'standard' | 'TTLR'; // TTLR = Tanker at Last Recovery
  events: Event[];
}

interface Event {
  id: string;
  type: EventType;
  timing: EventTiming;
  symbol: EventSymbol;
  showTime: boolean;
  annotations: EventAnnotations; // 3x3 grid of text
}

type EventType = 'pull' | 'stuff' | 'hp' | 'hpcs' | 'flyon' | 'flyoff' | 'sto' | 'custom';

type EventSymbol =
  | 'circle-open' | 'circle-closed'     // Refueling
  | 'diamond-open' | 'diamond-closed'   // On-deck crew swap/refuel
  | 'chevron-down'                      // Landing without fuel/swap
  | 'tick-left' | 'tick-right'          // Fly on/off
  | 'bar-vertical'                      // Pull/stuff
  | 'custom';

interface EventTiming {
  mode: 'offset' | 'relative' | 'fixed';
  // offset: +/- hours from sortie start/end or cycle start/end
  // relative: percentage through sortie or cycle
  // fixed: absolute time
  value: number; // hours for offset, percentage for relative, timestamp for fixed
  anchor: 'sortie-start' | 'sortie-end' | 'cycle-start' | 'cycle-end' | 'absolute';
  cycleId?: string; // if anchored to cycle
}

interface EventAnnotations {
  topLeft: string;
  topCenter: string;
  topRight: string;
  middleLeft: string;
  middleCenter: string;
  middleRight: string;
  bottomLeft: string;
  bottomCenter: string;
  bottomRight: string;
}

interface Cycle {
  id: string;
  start: Date;
  end: Date;
  julianDate: string; // "2460000,1" for filtering
  scale: number; // 1.0 = normal, >1 = expanded (not-to-scale)
}

interface DayData {
  date: Date;
  julianDate: string;
  start: Date;  // Timeline start
  end: Date;    // Timeline end
  slap: SLAPData;
  flightQuarters: Date;
  heloQuarters: Date;
  variation: string;
  timezone: string;
}

interface SLAPData {
  sunrise: Date;
  sunset: Date;
  moonrise: Date;
  moonset: Date;
  moonPhase: string;
  location?: {
    start?: {lat: number; lon: number};
    end?: {lat: number; lon: number};
  };
  // If location provided, calculate; otherwise manual input
}
```

#### Application State
```typescript
interface AirplanState {
  version: string; // "0.7.0"
  name: string; // Plan name
  squadronLayout: Squadron[]; // Ordered list
  days: Map<string, DayData>; // keyed by julianDate
  sorties: Map<string, Sortie>;
  cycles: Map<string, Cycle>;
  metadata: {
    created: Date;
    modified: Date;
    author?: string;
  };
}
```

### 1.2 State Management
- [ ] Implement Svelte stores with undo/redo support
- [ ] Store history as immutable state snapshots
- [ ] Limit history depth (e.g., 50 actions)
- [ ] Actions: `do()`, `undo()`, `redo()`, `clearHistory()`

### 1.3 Migration Function
- [ ] Read old v2 JSON format
- [ ] Convert to new data model
  - Map `Squadron` → `Squadron` (no changes)
  - Map `Line` → deleted (connections in Sortie)
  - Map `Sortie` → `Sortie` (add connections, events separate)
  - Convert Proxy-based multi-day to `Map<julianDate, DayData>`
- [ ] Save as v0.7.0 format
- [ ] Unit tests for migration

---

## Phase 2: Storage Layer

### 2.1 Browser Storage (IndexedDB)
- [ ] Schema design:
  - `plans` object store: {id, name, state: AirplanState, modified}
  - `squadrons` object store: {id, ...Squadron}
  - `squadronLayouts` object store: {id, name, squadrons: Squadron[]}
- [ ] Auto-save on state change (debounced 1-2 seconds)
- [ ] Load plan picker on startup
- [ ] New plan wizard (requires name input)

### 2.2 File Import/Export
- [ ] Export to JSON (new format)
- [ ] Import from JSON (new format)
- [ ] Import from JSON (old v2 format → migrate)
- [ ] Export to PDF (via jsPDF)
- [ ] Browser file API integration

### 2.3 Squadron Management
- [ ] CRUD operations for squadrons in browser storage
- [ ] Parse squadrons from imported plans/layouts
- [ ] Export/import squadron layouts
- [ ] Prepackaged templates:
  - **CVW**: F/A-18 100, F/A-18 200, F/A-18 300, F/A-18 400, E/A-18G 500, E-2D 600, MH-60S 610, MH-60R 700
  - **ESG**: (define with user)
- [ ] When removing squadron from layout, confirm and cascade delete sorties

---

## Phase 3: SLAP Calculation

### 3.1 Research & Implementation
- [ ] Research libraries (e.g., suncalc, astronomia)
- [ ] Implement or integrate sunrise/sunset/moon calculations
- [ ] Support single location OR start/end for interpolation
- [ ] Handle timezone conversions
- [ ] Validate accuracy (compare with Naval Observatory data)

### 3.2 UI for SLAP Input
- [ ] Toggle: manual vs location-derived
- [ ] If location: lat/lon input, optional start/end
- [ ] If manual: date/time pickers for each value
- [ ] Save preference per day

---

## Phase 4: Canvas Rendering & Timeline

### 4.1 Canvas Library Selection
- [ ] Evaluate options (Svelte Canvas, Konva, raw Canvas)
- [ ] PoC: Render simple timeline with sorties
- [ ] Performance test with 100+ sorties

### 4.2 Layout System
Strict layout matching current app:
```
┌─────────────────────────────────────────────────────────────┐
│ Environmental Data  │     Title + Date      │   Times       │
├─────────────────────┴───────────────────────┴───────────────┤
│                   Timeline Header (cycles)                  │
├─────────────────────────────────────────────────────────────┤
│ Squad │                                              │ D/N  │
│ Block │              Sortie Visualization            │Count │
│       │                                              │      │
├───────┼──────────────────────────────────────────────┼──────┤
│ (repeat for each squadron)                                  │
├─────────────────────────────────────────────────────────────┤
│              Cycle Boundary Launch/Land Counts              │
└─────────────────────────────────────────────────────────────┘
```

- [ ] Implement responsive layout calculations
- [ ] Squadron rows: dynamic height, evenly split
- [ ] Auto-layout sorties on horizontal tracks (avoid overlaps)
- [ ] Manual positioning mode (disable auto-layout)

### 4.3 Sortie Rendering
- [ ] Draw sortie bars with start/end types
- [ ] Render events as symbols on sortie bar
- [ ] Render event annotations (3x3 text grid)
- [ ] Render event numbers (e.g., "1A2")
- [ ] Handle alert sorties (dashed, "A30", "A60", or "TTLR")
- [ ] Render duration as decimal hours (X.Y) with correct rounding
- [ ] Visual indicators for connected sorties

### 4.4 Cycle Rendering
- [ ] Draw cycle boundaries on timeline
- [ ] Non-linear scaling support (per-cycle scale factor)
- [ ] Launch/land counts at boundaries
  - Left of boundary: landings from previous cycle
  - Right of boundary: launches for current cycle

### 4.5 Day/Night Logic
- [ ] Compute day sorties (start after sunrise, end before sunset)
- [ ] Compute night sorties (all others)
- [ ] Display aggregate counts per squadron

---

## Phase 5: Interactions & Workflows

### 5.1 Sortie Creation (Graphical)
- [ ] Click + drag on timeline to create sortie
- [ ] Display start/end times while dragging
- [ ] Snap to existing sortie ends
- [ ] Snap to cycle starts/ends
- [ ] Auto-format vertical layout (optional setting)
- [ ] Open edit modal on creation

### 5.2 Sortie Creation (Table)
- [ ] Table view of all sorties
- [ ] "New" / "Add Before" / "Add After" buttons
- [ ] Edit modal for details

### 5.3 Sortie Editing
- [ ] Modal with all fields:
  - Squadron (dropdown)
  - Start/end (date/time picker or cycle-tied)
  - Start/end types (dropdown)
  - Notes (prenote, note, postnote)
  - Alert toggle + type
  - Events list (add/remove/edit)
- [ ] Drag sortie on timeline to move
- [ ] Resize sortie to adjust duration

### 5.4 Sortie Connections
- [ ] Connect sorties by snapping
- [ ] Visual connection indicator (line or color)
- [ ] Drag connected sortie → whole chain moves
- [ ] Click connection point → modify connection
  - Keyboard modifiers:
    - No modifier: move just this connection
    - Shift: move everything to the right
    - Ctrl: move everything to the left

### 5.5 Event Management
- [ ] Add event to sortie
- [ ] Edit event timing/symbol/annotations
- [ ] Template system for common events
- [ ] Handle fixed-time events when sortie moves
  - If event time outside sortie range: warn + ask for new time or delete

### 5.6 Cycle Management
- [ ] Add cycle (start/end times)
- [ ] Edit cycle times
- [ ] Delete cycle (nullify sortie references)
- [ ] Scale cycle (non-linear time view)
  - Modal for scale factor
  - Keyboard shortcut mode (Ctrl+drag?)

### 5.7 Squadron Layout
- [ ] Reorder squadrons (drag & drop)
- [ ] Add squadron (from browser storage or new)
- [ ] Edit squadron details
- [ ] Remove squadron (confirm + cascade delete)

### 5.8 Multi-Day Navigation
- [ ] Date picker in header
- [ ] Left/right arrows to move by day
- [ ] Add new day
- [ ] Delete day
- [ ] Copy/paste sorties between days
- [ ] Copy entire day

---

## Phase 6: PDF Export

### 6.1 PDF Generation
- [ ] Integrate jsPDF or similar
- [ ] Render exact visualization to PDF
- [ ] Letter size, landscape
- [ ] One page per day
- [ ] Subset selection (export only certain days)

### 6.2 Print Preview
- [ ] Visual feedback of what will print
- [ ] Page breaks between days

---

## Phase 7: Polish & Testing

### 7.1 Keyboard Shortcuts
(Revisit after UI is built)
- [ ] Define shortcut map
- [ ] Implement shortcut system
- [ ] Visual shortcut guide (? key)

### 7.2 Loading States
- [ ] Instant-loading skeleton UI
- [ ] Progress indicators for file load
- [ ] Error states with retry

### 7.3 Unit Tests
- [ ] Data model functions
- [ ] SLAP calculations
- [ ] Migration function
- [ ] State management (undo/redo)
- [ ] Sortie connection logic
- [ ] Event timing calculations

### 7.4 E2E Tests (Cypress)
- [ ] Create new plan
- [ ] Add squadron
- [ ] Create sortie (graphical)
- [ ] Edit sortie
- [ ] Connect sorties
- [ ] Add cycle
- [ ] Export to PDF
- [ ] Save/load from browser
- [ ] Import old JSON file

### 7.5 Bundle Size Optimization
- [ ] Code splitting by route
- [ ] Tree-shake unused code
- [ ] Minimize dependencies
- [ ] Analyze bundle (vite-bundle-visualizer)
- [ ] Target: <500kb initial bundle (gzipped)

---

## Phase 8: Deployment & Migration

### 8.1 Version Management
- [ ] Decide: Changesets vs manual tags
- [ ] Update version in package.json
- [ ] Tag-based release workflow in GitHub Actions
- [ ] Auto-deploy on tag push

### 8.2 Migration Banner
- [ ] Add banner to old app (0.6.9)
- [ ] Message: "BadMax is upgrading soon! Reach out with questions."
- [ ] Link to migration guide

### 8.3 Documentation
- [ ] User guide for new features
- [ ] Migration guide (how to import old files)
- [ ] Developer documentation
- [ ] Keyboard shortcut reference

### 8.4 Release
- [ ] Deploy 0.7.0 to production
- [ ] Monitor for issues
- [ ] Collect user feedback

---

## Open Questions
1. **SLAP library**: Which library or implement from scratch?
2. **Canvas library**: Final decision after PoC
3. **Version management**: Changesets or manual?
4. **ESG template**: Define squadron list

---

## Success Criteria
- [ ] All old JSON files load successfully
- [ ] Bundle size <500kb (gzipped)
- [ ] Loading state appears in <100ms
- [ ] 90%+ code coverage on business logic
- [ ] All E2E tests pass
- [ ] Visual parity with old app
- [ ] User feedback: "faster and easier to use"

---

## Timeline Estimate
- **Phase 0**: 1 week (setup)
- **Phase 1**: 1-2 weeks (data model)
- **Phase 2**: 1 week (storage)
- **Phase 3**: 1 week (SLAP)
- **Phase 4**: 2-3 weeks (rendering)
- **Phase 5**: 2-3 weeks (interactions)
- **Phase 6**: 1 week (PDF)
- **Phase 7**: 2 weeks (testing/polish)
- **Phase 8**: 1 week (deployment)

**Total**: ~12-15 weeks (3-4 months)
