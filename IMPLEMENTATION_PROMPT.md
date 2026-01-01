# BadMax Svelte Migration - Implementation Prompt

## Project Context

You are implementing a complete migration of **BadMax**, a military flight plan visualization and editing tool, from vanilla JavaScript to Svelte + Vite + TypeScript.

**Current State:**
- Version: 0.6.9
- Tech Stack: Vanilla JS, Konva.js for canvas rendering, ES6 classes
- Data Model: MVC pattern with circular parent references, Proxy-based multi-day support
- Location: `/home/user/badmax/`
- Branch: `claude/review-data-model-OfHcj`

**Target State:**
- Version: 0.7.0
- Tech Stack: Svelte + Vite + TypeScript
- Data Model: Modernized, immutable state, no circular references
- Bundle Size: <500kb gzipped (critical - users on ships with limited bandwidth)

## Essential Reading

**MUST READ FIRST:**
1. `/home/user/badmax/MIGRATION_PLAN.md` - Complete 8-phase migration plan
2. `/home/user/badmax/src/app/Model.js` - Current data model
3. `/home/user/badmax/src/app/Sortie.js`, `Squadron.js`, `Cycle.js` - Current entities
4. `/home/user/badmax/README.md` - Project overview

## Critical Terminology (READ THIS CAREFULLY)

The aviation terminology is specific and important:

- **Event** = timeline bar / "line on the airplan" (e.g., "1A3 4 STK")
  - Represents one or more aircraft flying together
  - Has: missionNumber, aircraftCount, missionType, start/end, connections
  - Example: "1A3 4 STK" = Cycle 1, Squadron A, Event #3, 4 aircraft, Strike mission

- **Marker** = point-in-time symbol on an event (AAR, refueling, crew swap, etc.)
  - Has: symbol type, timing mode, 3x3 text annotation grid
  - Examples: refueling requirement (circle), crew swap (diamond), TOT waypoint

- **Squadron** = military unit (e.g., VFA-113)
  - Has: name, callsign, TMS (Type/Model/Series), modex (base aircraft serial #)

- **Cycle** = launch/recovery cycle on aircraft carrier
  - Has: start/end times, can be scaled independently (non-linear time view)

**DO NOT confuse:**
- Old code uses "Sortie" for what we now call "Event"
- Old code didn't have what we now call "Marker" (new feature)

## Implementation Instructions

### Phase-by-Phase Approach

Work through the migration plan sequentially:

**Phase 0: Project Setup** (START HERE)
1. Initialize fresh Vite + Svelte + TypeScript project
2. Configure for minimal bundle size (tree-shaking, code splitting)
3. Set up development tooling (ESLint, Prettier, Vitest, Cypress)
4. Add instant-loading skeleton UI (<100ms initial render)

**Phase 1: Data Model**
1. Implement TypeScript interfaces from MIGRATION_PLAN.md
2. Create Svelte stores with undo/redo support
3. Implement migration function from v2 JSON to v0.7.0
4. Write unit tests for migration

**Phase 2-8:** Follow MIGRATION_PLAN.md sequentially

### Key Requirements

**Bundle Size (CRITICAL):**
- Target: <500kb gzipped initial bundle
- Users are on ships with terrible bandwidth
- Minimize dependencies ruthlessly
- Use dynamic imports for non-critical features
- Show loading state instantly (minimal bootstrap bundle)

**Offline Capability:**
- Embed SLAP calculations (sunrise/sunset/moon phase)
- No external API calls for core functionality
- Works completely offline after initial load

**Data Migration:**
- One-time backward compatibility with v2 JSON files
- Must successfully load all old files
- Test with actual v2 files from `/home/user/badmax/` if available

**Visual Layout (STRICT REQUIREMENT):**
- Maintain exact layout from current app
- Letter size, landscape PDF export
- One page per day
- Specific positioning: top-left env data, top-center title, top-right times
- Squadron rows evenly split, cycle boundaries on timeline
- Launch/land counts at cycle boundaries

**Aviation Domain Logic:**
- Event numbering: `{cycle}{squadron-letter}{number}` (e.g., "1A3")
- Day/night sortie counting: multiply event aircraftCount
- Alert events: different rendering (dashed lines, "A30"/"A60"/"TTLR" labels)
- Cycle boundary counts: launches on right, landings on left

### TypeScript Types (Core)

```typescript
interface Event {
  id: string;
  squadronId: string;
  start: Date;
  end: Date;
  connections: {
    before: string | null;
    after: string | null;
  };
  startType: StartEndType;
  endType: StartEndType;
  missionNumber: string; // "1A3"
  aircraftCount: number; // 4
  missionType: string; // "STK", "PTNK", "BFM"
  note: string;
  prenote: string;
  postnote: string;
  isAlert: boolean;
  alertType?: 'standard' | 'TTLR';
  markers: Marker[];
}

interface Marker {
  id: string;
  symbol: MarkerSymbol;
  timing: MarkerTiming;
  showTime: boolean;
  annotations: MarkerAnnotations;
}

// See MIGRATION_PLAN.md for complete type definitions
```

### Workflow Examples

**Creating an Event (Graphical):**
1. User clicks + drags on timeline
2. Show start/end times while dragging
3. Snap to existing event ends or cycle boundaries
4. Auto-format vertical layout (avoid overlaps)
5. Open edit modal to fill in mission details

**Creating an Event (Table):**
1. Table view shows all events
2. "New" / "Add Before" / "Add After" buttons
3. Modal with all fields
4. Save and render on timeline

**Connecting Events:**
- Snap end-to-start when dragging
- Visual connection indicator
- Drag one → whole chain moves rigidly
- Keyboard modifiers: move just connection (none), move right side (Shift), move left side (Ctrl)

**Markers with Timing Modes:**
- Offset: "2.0 hours after event start" or "-0.5 hours before cycle end"
- Relative: "50% through event duration"
- Fixed: "1630Z" (absolute time)
- If event moves and fixed marker falls outside range → warn user

### Testing Requirements

**Unit Tests (Vitest):**
- Data model functions
- SLAP calculations (sunrise/sunset accuracy)
- Migration function (v2 → v0.7.0)
- State management (undo/redo)
- Event connection logic
- Marker timing calculations

**E2E Tests (Cypress):**
- Create new plan (requires name input)
- Add squadron from browser storage or new
- Create event (graphical drag, table add)
- Edit event (modal)
- Connect events (snap, drag chain)
- Add/edit/scale cycle
- Export to PDF (exact visual match)
- Save/load from IndexedDB (auto-save)
- Import old v2 JSON file (migration)

### Canvas Rendering

**Library Selection:**
- Evaluate: Svelte Canvas, Konva, raw Canvas API
- Prioritize: bundle size, Svelte integration, drag/drop support
- Decision criteria: <50kb for canvas library

**Rendering Requirements:**
- Strict layout (see MIGRATION_PLAN.md section 4.2)
- Event bars with start/end type symbols
- Markers as symbols on bars
- Marker annotations (3x3 text grid)
- Mission info title: "1A3 4 STK"
- Alert events: dashed lines
- Connected events: visual indicators
- Cycle boundaries: vertical lines with launch/land counts
- Non-linear time scaling (per-cycle scale factor)

### Squadron Management

**Browser Storage (IndexedDB):**
- Store individual squadrons
- Store squadron layouts (ordered lists)
- Auto-parse squadrons from any imported plan
- Prepackaged templates:
  - **CVW**: F/A-18 100, F/A-18 200, F/A-18 300, F/A-18 400, E/A-18G 500, E-2D 600, MH-60S 610, MH-60R 700
  - (Squadron name and callsign left blank in templates)

**Layout Management:**
- Add/remove/edit/reorder squadrons
- Export/import layouts as JSON
- When removing squadron → confirm → cascade delete all events
- One layout per plan, same for all days in plan

### SLAP Calculations

**Requirements:**
- Embed calculations (no external APIs)
- Input: date + location (lat/lon) OR manual input
- Support moving platform: start location + end location → interpolate
- Output: sunrise, sunset, moonrise, moonset, moon phase
- Timezone handling
- Validate accuracy (compare with Naval Observatory data if possible)

**Library Options:**
- Research: suncalc, astronomia
- Evaluate bundle size
- Implement if no suitable library <10kb

### Auto-Save & Storage

**IndexedDB Schema:**
- `plans` store: {id, name, state: AirplanState, modified}
- `squadrons` store: {id, name, callsign, tms, modex}
- `squadronLayouts` store: {id, name, squadrons: Squadron[]}

**Auto-Save Logic:**
- Debounce 1-2 seconds after state change
- Save entire AirplanState as JSON
- Show "Saving..." / "Saved" indicator

**Startup Flow:**
1. Show plan picker (list from IndexedDB)
2. Options: Load existing, Load from file, New plan
3. New plan requires name input
4. Load → auto-save enabled

### Version Management

**Release Process:**
- Current: 0.6.9
- Target: 0.7.0
- Evaluate: Changesets vs manual tag-based releases
- GitHub Actions: tag push → build → deploy
- Version in package.json is source of truth

**Migration Banner (Old App):**
- Add to current 0.6.9 deployment before release
- Message: "BadMax is upgrading soon! Reach out with questions."
- Link to migration guide

### Development Workflow

**Iterative Approach:**
1. Set up project structure
2. Implement data model + migration
3. Basic rendering (static visualization)
4. Add interactions (drag, edit, connect)
5. Polish UI/UX
6. Optimize bundle size
7. Write tests
8. Deploy

**Communication:**
- Ask clarifying questions as needed
- Show progress with screenshots/videos of UI
- Highlight any deviations from plan with rationale
- Flag bundle size issues early

**Git Workflow:**
- Branch: `claude/review-data-model-OfHcj` (already created)
- Commit frequently with clear messages
- Push after each major milestone
- Create PR when Phase 0-2 complete for review

## Success Criteria

- [ ] All old v2 JSON files load successfully
- [ ] Bundle size <500kb gzipped
- [ ] Loading state appears in <100ms
- [ ] Visual parity with old app (exact layout)
- [ ] All workflows documented in MIGRATION_PLAN.md work
- [ ] 90%+ code coverage on business logic (unit tests)
- [ ] All E2E tests pass
- [ ] Auto-save to IndexedDB works reliably
- [ ] PDF export matches screen visualization exactly
- [ ] Undo/redo works for all state changes
- [ ] No console errors or warnings
- [ ] Lighthouse score: >90 Performance, 100 Accessibility

## Common Pitfalls to Avoid

1. **Don't over-engineer:** Keep it simple, only implement what's in the plan
2. **Don't add features:** Stick to the spec, ask before adding anything new
3. **Don't ignore bundle size:** Check after every dependency added
4. **Don't skip tests:** Write tests as you go, not at the end
5. **Don't break migration:** All old files must load
6. **Don't change terminology:** Event = timeline bar, Marker = symbol
7. **Don't use circular references:** Use ID lookups only
8. **Don't skip validation:** Validate all user inputs
9. **Don't forget offline:** No external API calls for core features
10. **Don't rush rendering:** Canvas performance is critical with 100+ events

## Questions to Ask Before Starting

- [ ] Do you understand the Event vs Marker terminology?
- [ ] Do you understand the current data model structure?
- [ ] Have you read the MIGRATION_PLAN.md completely?
- [ ] Do you know the critical bundle size constraint?
- [ ] Do you understand the aviation domain (cycles, squadrons, events)?
- [ ] Are you clear on the testing requirements?

## Getting Started

```bash
# 1. Ensure you're on the correct branch
git checkout claude/review-data-model-OfHcj

# 2. Read the migration plan
cat /home/user/badmax/MIGRATION_PLAN.md

# 3. Understand current data model
cat /home/user/badmax/src/app/Model.js
cat /home/user/badmax/src/app/Sortie.js
cat /home/user/badmax/src/app/Squadron.js

# 4. Initialize new Svelte project (Phase 0.1)
# Choose directory structure - options:
# Option A: Create /home/user/badmax-new/ (clean slate)
# Option B: Create /home/user/badmax/app/ (alongside old code)
# Recommend: Ask user for preference

# 5. Start with Phase 0: Project Setup
npm create vite@latest badmax-svelte -- --template svelte-ts
cd badmax-svelte
npm install
```

## Resources

**Documentation:**
- Svelte: https://svelte.dev/docs
- Vite: https://vitejs.dev/guide/
- TypeScript: https://www.typescriptlang.org/docs/
- Vitest: https://vitest.dev/
- Cypress: https://www.cypress.io/

**Canvas Libraries:**
- Konva: https://konvajs.org/ (~80kb)
- Svelte Canvas: Research lightweight options
- Raw Canvas API: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API

**Storage:**
- IndexedDB: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- idb library: https://github.com/jakearchibald/idb (~1.5kb)

**PDF:**
- jsPDF: https://github.com/parallax/jsPDF
- Alternatives: PDFKit, pdfmake (compare bundle sizes)

## Your Task

Implement the BadMax Svelte migration following the MIGRATION_PLAN.md. Start with Phase 0 (Project Setup) and work sequentially through the phases. Ask clarifying questions as needed, show progress regularly, and prioritize bundle size and offline capability throughout.

Good luck! 🚀
