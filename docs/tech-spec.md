# This Could've Been an Email — Technical Spec

Oct 8, 2026 · @Harry

Reconciled October 7, 2026 with Harry’s D01–D12 direction. Revised October 8, 2026 to apply the accepted pre-implementation architecture review (D13–D26). These decisions are the implementation baseline; numerical balance targets remain unverified until simulation.

## How to use this spec

This spec fixes *how* the game is built. The design doc (This Could've Been an Email — Design Doc v2) fixes *what* the game does. An AI coding assistant working on the repo must follow both; together they become the implementation blueprint.

**Order of precedence when sources disagree**

1. An explicit instruction from Harry in the current session.
2. This spec, for stack, architecture, code rules and process.
3. Design Doc v2, for game rules, formulas, content and copy.
4. The assistant's own judgement, stated as an assumption in the PR description.

**Wording.** MUST and MUST NOT are hard rules; a PR that breaks one is rejected. SHOULD is the default; the assistant may depart from it only with a one-line reason in the PR.

**Revision authority.** Harry explicitly authorized the D01–D12 reconciliation and accepted the October 8 architecture review (D13–D26). Neither requires a second approval. `docs/adr/0001-stack.md`, written in task 01a, is the single decision register for D01–D26; there is no separate decisions file. Later departures follow change control.

**Single source of truth (D22).** This spec is the only home for precedence, architecture rules and the gate activation schedule. The design doc owns game rules, formulas, content and copy; the implementation plan owns task order, task IDs and status. Other documents and `CLAUDE.md` link to these sections instead of restating them.

**Change control.** Every item marked *locked* changes only through an Architecture Decision Record in `docs/adr/` that Harry approves. Tuning numbers (event effects, utility weights, score constants) are content, not architecture: they change through a normal PR with simulation results attached.

## Locked tech stack

The stack is locked at the major-version level: a static Vite + React 19 site. The room is drawn with DOM sprite elements and CSS; there is no game engine (D16). Exact versions are pinned by `pnpm-lock.yaml` at scaffold time. Upgrades within a locked major go through a normal PR with all gates green; a new major needs an ADR.

| Layer | Locked choice | Major | Why | Not allowed |
| --- | --- | --- | --- | --- |
| Runtime (dev, CI, sim) | Node.js, pinned in `.nvmrc` and `engines` | 24 LTS | Supported with security fixes until April 2028 | Odd-numbered (non-LTS) releases |
| Package manager | pnpm via Corepack, pinned in `packageManager` | — | One strict lockfile | npm or Yarn lockfiles |
| Language | TypeScript, `strict` on | 6.x | Last JavaScript-based compiler; stable with Vite 8 | `.js` source files; TypeScript 7 until an ADR |
| Build and dev server | Vite | 8.x | Fast reloads; static output | Webpack, Next.js, any server rendering |
| UI shell | React + react-dom | 19.x | All text and input as accessible DOM: menus, HUD, dialogue, choices, results | Class components except the single error boundary; other UI frameworks |
| Room stage | DOM sprite elements + CSS animation (no library) | — | One fixed room with 8 sprites needs no engine; one rendering model and a smaller bundle (D16) | Game engines (Phaser or others); canvas or WebGL rendering of the room; canvas drawing except the share image |
| State | Zustand (vanilla store + React hook) | 5.x | One small store: narrow selectors for React, plain `subscribe` for non-React code | Redux, MobX, React Context as a store |
| Styling | Tailwind CSS via its Vite plugin | 4.x | Small utility CSS for the overlay | CSS-in-JS runtimes; component libraries |
| Unit and property tests | Vitest + fast-check | Vitest 5.x | Native Vite integration; property tests for engine invariants | Jest |
| End-to-end tests | Playwright | Latest at scaffold | Mobile Chromium and WebKit viewports | Cypress |
| Lint and format | ESLint flat config + typescript-eslint + Prettier | Latest at scaffold | Enforces the rules in this spec | A second linter or formatter |
| Simulation CLI | tsx | Latest at scaffold | Runs the TypeScript engine directly in Node | ts-node |
| Hosting | Vercel, Hobby plan, static files only | — | Free; a preview URL for every PR | Serverless or edge functions |
| CI | GitHub Actions | — | Runs every activated gate on every PR; see D10 | — |
| Analytics | Vercel Web Analytics, page views only | — | Hobby includes 50,000 events a month; custom events need Pro | Google Analytics, cookies, anything that needs a consent banner |
| Persistence | `localStorage`, unlocked titles only | — | No backend in the MVP | Cookies, IndexedDB, any server storage |
| Font | One OFL-licensed pixel font, self-hosted, licence file committed | — | Crisp text, no third-party requests | Loading fonts from a CDN at runtime |
| Art pipeline | Aseprite: one sprite atlas (PNG + JSON) and one flattened room PNG | — | Plain image files; no map loader (D16) | AI-generated final art; Tiled or other tilemap pipelines; assets without a licence file |

**Dependency allowlist.** Runtime dependencies are exactly `react`, `react-dom`, `zustand` and `@vercel/analytics`. Approved direct dev packages are `typescript`, `vite`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`, `vitest`, `@vitest/coverage-v8`, `fast-check`, `@playwright/test`, `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`, `prettier`, `tsx`, `@types/node`, `@types/react`, and `@types/react-dom`. Match coverage-provider and Vitest versions; use Node 24 and React 19 type packages. Corepack/pnpm are pinned setup tools, not runtime dependencies. Transitive packages are resolved by the lockfile, not individually approved. Adding a direct dependency outside this list requires an ADR. Verify compatible stable releases at scaffold; an unavailable locked major requires an explicit decision, not a silent substitution.

Source links for scaffold-time verification (the version annotations below are inherited planning claims, not installation evidence): [Vite blog](https://vite.dev/blog.html) (Vite 8, March 2026) · [Vitest blog](https://vitest.dev/blog/) (Vitest 5, September 2026) · [Node.js lifecycle](https://endoflife.date/nodejs) · [TypeScript 6 release](https://www.i-programmer.info/news/167-javascript/18757-typescript-6-released.html) · [Vercel Web Analytics pricing](https://vercel.com/docs/analytics/limits-and-pricing)

## Architecture

The code is split into five layers; runtime imports form an acyclic graph. Only the engine's public index imports content data (D13); content imports only engine types, which are erased at compilation. The engine and content form a pure core that runs the same in the browser, in Vitest and in the simulation CLI.

&#91;embedded content: module layers · arrows = allowed imports\]

**Layer rules (locked; enforced by ESLint `no-restricted-imports` per folder)**

- `core/engine` MUST NOT import anything outside `core/`, and MUST NOT touch `window`, `document`, `Date`, `Math.random`, timers or I/O.
- `core/content` may import other content modules and only `import type` from `core/engine/types.ts`; it MUST NOT import engine runtime values or the engine barrel. External callers use `core/engine/index.ts`; internal modules use direct imports. Enforce both folder boundaries and type-only imports so no runtime cycle exists.
- Content injection (D13): inside `core/engine`, only `index.ts` imports `core/content`. It binds the live `ContentPack` and exports the public API with the signatures below. Every other engine module takes the pack as an explicit first argument (for example `drawEventWith(content, state)`). Rule tests and goldens use small packs from `core/engine/fixtures/`; only content-validation tests, the sim and E2E use the live pack.
- `store` is the only browser module that calls state-changing engine functions (`initialState`, `drawEvent`, `resolve`, `release`, `callIt`). Only its `start` and `continue` actions call `drawEvent` (D17).
- `ui` reads state through store hooks and dispatches named store actions. It may import types and pure read-only helpers from `core` (such as `previewResponse` for showing effects), never state-changing functions.
- `stage` reads the store through selectors and MUST NOT dispatch actions. It is purely presentational; every tap and click is handled by `ui`. The design doc's "tap a face to release" is done by tapping that person's portrait in the HUD roster.
- `sim` imports `core` directly and runs in Node only; it is never bundled into the site.

## Repository layout

One repository with a single `package.json` (no monorepo). Folder names match the architecture layers. Unit tests sit next to the file they test as `*.test.ts`.

```text
meeting-sim/                   # at C:\dev\meeting-sim, outside OneDrive (D23)
├─ .github/workflows/ci.yml
├─ docs/
│  ├─ adr/                    # 0001-stack.md (decision register D01–D26), 0002-..., one decision per file
│  ├─ design-doc-v2.md        # the only copy (moved, not copied; D22)
│  ├─ tech-spec.md            # the only copy
│  ├─ implementation-plan.md  # the only copy
│  ├─ content-table.md        # reviewed event content (task 06b)
│  └─ sim/                    # committed simulation summaries
├─ art-src/                   # .aseprite sources and palette (never deployed)
├─ public/
│  ├─ assets/sprites/         # Aseprite PNG + JSON atlas
│  ├─ assets/room/            # one flattened room PNG
│  ├─ fonts/                  # pixel font + its OFL.txt
│  └─ LICENSES.md             # every third-party asset: source, author, licence
├─ scripts/
│  └─ checkSize.ts            # gzip budget check (no extra dependency)
├─ src/
│  ├─ core/
│  │  ├─ engine/
│  │  │  ├─ types.ts          # MeetingState, PresentedEvent, LogEntry, ContentPack, ...
│  │  │  ├─ constants.ts      # every tunable number, in one place
│  │  │  ├─ rng.ts            # seed hashing + PRNG streams
│  │  │  ├─ weighted.ts       # validated weighted tickets
│  │  │  ├─ conditions.ts     # inclusive serializable conditions
│  │  │  ├─ errors.ts         # typed programmer errors
│  │  │  ├─ applyEffect.ts    # single clamp/billing implementation
│  │  │  ├─ preview.ts        # read-only response previews
│  │  │  ├─ responseValidation.ts # shared context validation
│  │  │  ├─ utilityFraction.ts # exact decimal utility comparison
│  │  │  ├─ state.ts          # initialState, release
│  │  │  ├─ draw.ts           # drawEvent + fairness guards
│  │  │  ├─ resolve.ts
│  │  │  ├─ value.ts          # internal utility; not exported publicly (D24)
│  │  │  ├─ score.ts          # score, displayCost, formatCost
│  │  │  ├─ titleRules.ts     # title predicates (copy lives in content)
│  │  │  ├─ fixtures/         # small ContentPacks for rule tests and goldens (D13, D21)
│  │  │  └─ index.ts          # the only public export surface; the only engine importer of content
│  │  └─ content/
│  │     ├─ engineRules.ts   # approved relationship metadata, data only
│  │     ├─ attendees.ts
│  │     ├─ events/           # one file per event, named by event id
│  │     ├─ titles.ts         # title names and copy
│  │     ├─ copy.ts           # epilogues and all player-facing strings
│  │     └─ index.ts          # exports the live ContentPack
│  ├─ store/
│  │  ├─ gameStore.ts         # screen, beat, game, unlockedTitles; named actions (D17)
│  │  └─ persistence.ts       # localStorage, versioned key, try/catch
│  ├─ ui/
│  │  ├─ App.tsx
│  │  ├─ screens/             # TitleScreen, MeetingScreen, ResultsScreen
│  │  ├─ components/          # DialogueBox, ChoiceButton, Hud, Roster, ParkingLot, TitleGrid
│  │  └─ share/               # renderCard.ts (canvas image), shareText.ts
│  ├─ stage/
│  │  ├─ RoomStage.tsx        # DOM sprite room implementing RoomView (D16)
│  │  ├─ reactions.ts         # reactionsFor(prev, next): the only state → reaction mapping
│  │  └─ stage.css            # sprite positions, steps() idles, reaction keyframes
│  ├─ main.tsx
│  └─ index.css                # Tailwind entry + pixel-art CSS
├─ sim/
│  ├─ policies/                # lookahead, greedy, reckless, timebox, fastest, park, random
│  ├─ run.ts                   # CLI entry
│  └─ report.ts                # CSV + pass/fail against the acceptance targets
├─ tests/
│  ├─ e2e/                     # Playwright specs
│  └─ golden/                  # fixture-pack seed + actions → expected final state, as JSON (D21)
├─ CLAUDE.md                  # project rules (last section)
├─ AGENTS.md                  # one line: "Follow CLAUDE.md."
└─ package.json, pnpm-lock.yaml, tsconfig.json, vite.config.ts,
   eslint.config.js, playwright.config.ts, .nvmrc, .prettierrc
```

**Naming**

- React components: `PascalCase.tsx`.
- Other modules: `camelCase.ts`.
- Event, attendee and title ids: `kebab-case`, and each event file is named after its id (`events/scope-revisit.ts`).
- Constants: `SCREAMING_SNAKE_CASE`, all in `core/engine/constants.ts`.

## Engine contracts

The engine is a set of pure functions over one plain, serialisable state object. Given the same seed and the same choices, it MUST produce a byte-identical final state on every machine.

**State shape (locked; fields may be added, not renamed)**

```typescript
interface MeetingState {
  readonly seed: string;                 // any string; the store creates 16 hex chars per run (D24)
  readonly turn: number;
  readonly minute: number;               // T
  readonly bookingEnd: number;           // 60, or 45 after 'room-booked'
  readonly progress: number;             // P, clamped 0–100
  readonly risks: number;                // R, clamped 0–5
  readonly personMinutes: number;        // integer; cost is derived from it
  readonly present: readonly AttendeeId[];
  readonly releasedAttendeeIds: readonly AttendeeId[]; // authoritative no-reentry history
  readonly peakHeadcount: number;
  readonly seenEventIds: readonly string[]; // base-family and callback IDs marked on draw
  readonly spokenAttendeeIds: readonly AttendeeId[];
  readonly parkedCount: number;             // park actions, independent of risks
  readonly substantiveDrawCount: number;
  readonly previousDrawWasUncommonNegative: boolean;
  readonly scheduled: readonly { eventId: string; dueTurn: number }[];
  readonly current: PresentedEvent | null; // materialized at draw (D14)
  readonly decisions: readonly DecisionRecord[];  // feeds the Decisions score and the "moment"
  readonly log: readonly LogEntry[];
  readonly phase: 'running' | 'ended';
  readonly ending: 'decision' | 'called-early' | 'time-expired' | 'cancelled' | null;
}
```

**Supporting types (locked; D14)**

```typescript
// What the player sees. Materialized at draw from the base event or its first matching
// variant; never carries `variants` or the family `when`.
interface PresentedEvent {
  readonly id: string;                   // family ID, callback ID or 'filler'
  readonly kind: EventKind;
  readonly rarity: Rarity;
  readonly negative: boolean;
  readonly speaker: AttendeeId | 'room';
  readonly line: string;
  readonly responses: readonly Response[];
}

type LogEntry =                          // narrative only (D15)
  | { readonly type: 'draw'; readonly turn: number; readonly minute: number; readonly eventId: string; readonly speaker: AttendeeId | 'room' }
  | { readonly type: 'resolve'; readonly turn: number; readonly minute: number; readonly eventId: string; readonly responseId: string; readonly technique: Technique; readonly line: string }
  | { readonly type: 'release'; readonly turn: number; readonly minute: number; readonly who: AttendeeId }
  | { readonly type: 'join'; readonly turn: number; readonly minute: number; readonly who: AttendeeId }
  | { readonly type: 'call-it'; readonly turn: number; readonly minute: number };

interface DecisionRecord {               // scoring data only
  readonly turn: number;
  readonly eventId: string;
  readonly responseId: string;
  readonly quality: number | null;       // display approximation; null = unscored
  readonly qualityFraction: { readonly numerator: string; readonly denominator: string } | null; // authoritative exact q
}

type ResponsePreview =
  | { readonly enabled: false; readonly responseId: string; readonly reasonKey: string }
  | { readonly enabled: true; readonly responseId: string; readonly effect: Effect;
      readonly progressDelta: number; readonly risksDelta: number;   // effective, after clamping
      readonly minutesDelta: number; readonly personMinutesDelta: number;
      readonly utility: number };

interface DrawCandidate { readonly event: PresentedEvent; readonly probability: number }

interface ScoreBreakdown {
  readonly outcome: number; readonly efficiency: number;
  readonly decisions: number; readonly total: number;
}

type TitleId =
  | 'inbox-zero' | 'efficient-facilitator' | 'ship-it-and-pray' | 'death-by-diligence'
  | 'skeleton-crew' | 'reply-all-royalty' | 'parking-lot-attendant' | 'gary-free-zone'
  | 'played-it-right' | 'take-this-offline' | 'calendar-criminal' | 'could-have-been-an-email';

interface EventRules {
  readonly arrivalAttendees: Readonly<Record<string, AttendeeId>>;
  readonly callbackTargets: Readonly<Record<string, string>>;
  readonly bookingEventIds: readonly string[];
}

interface ContentPack {                  // fields may be added when an engine rule needs them
  readonly eventRules: EventRules;             // content-owned relationship metadata
  readonly events: readonly MeetingEvent[];     // the 17 base families
  readonly callbacks: readonly MeetingEvent[];  // scheduled-only targets
  readonly filler: MeetingEvent;
}
```

**Result precision and lifecycle.** Resolution stores exact utility-difference numerator/denominator integers as decimal strings in `qualityFraction` (null for ties). Numeric `quality` is for display; scoring and unrounded title comparisons consume the fraction, never the approximation. BigInt is calculation-only and state remains JSON-serialisable. `score` and `earnedTitles` reject running meetings or a null ending with `EngineError("not-ended")`.

**Counters and log (D15).** The counters `releasedAttendeeIds`, `parkedCount`, `peakHeadcount`, `spokenAttendeeIds`, `seenEventIds`, `substantiveDrawCount` and `previousDrawWasUncommonNegative` are authoritative for every rule and title. `log` is narrative only: the results moment, the outcome line and sim traces. No rule reads the log. `decisions` is scoring data only.

**Public API (`core/engine/index.ts`)**

```typescript
initialState(seed: string): MeetingState
drawEvent(state: MeetingState): MeetingState          // sets `current`
resolve(state: MeetingState, responseId: string): MeetingState
release(state: MeetingState, who: AttendeeId): MeetingState
callIt(state: MeetingState): MeetingState
score(state: MeetingState): ScoreBreakdown            // { outcome, efficiency, decisions, total }
earnedTitles(state: MeetingState, score: ScoreBreakdown): TitleId[]
displayCost(personMinutes: number): number            // dollars at the display rate
formatCost(personMinutes: number): string             // whole dollars, e.g. "$2,200"
previewResponse(state: MeetingState, response: Response): ResponsePreview
getDrawCandidates(state: MeetingState): readonly DrawCandidate[] // no RNG consumption
```

`value` is internal to the engine (`value.ts`); callers read utility from an enabled `previewResponse` (D24). `formatCost` is the only cost formatter used by the HUD, results card, share card and share text.

**Purity and immutability**

- Every state-changing function returns a new state and MUST NOT mutate its input; read-only helpers return their documented values. Refused releases and already-pending draws return an equivalent new snapshot. Tests deep-freeze inputs to prove it.
- State holds only plain data: no classes, `Map`, `Set`, `Date` or functions, so it can be logged, snapshotted and compared as JSON.
- All clamping happens in one helper, `applyEffect`, never inline.

**Money without floating-point drift**

- Cost is stored as integer person-minutes (headcount × minutes). Dollars are derived only for display: `displayCost(pm) = pm × 1000 / 60`.
- Score constants use the same unit: the $6,000 reference meeting is 360 person-minutes and the $1,500 floor is 90. The utility term ΔC/$100 becomes Δpm / 6.
- Changing the display rate MUST NOT change any score; a test asserts this.
- `formatCost` rounds `displayCost` to whole dollars with thousands separators (D24).

**Randomness and determinism**

- The only source of fresh randomness is `crypto.getRandomValues`, called once in the store to create the run seed. `Math.random` is banned everywhere (lint rule).
- Implement cyrb53 with hash seed 0 over JavaScript UTF-16 code units, take its low 32 bits with `>>> 0`, and initialize mulberry32 with that value. Both live in `rng.ts` without dependencies; commit fixed string/hash/PRNG test vectors. Numeric seeds must not depend on platform encoding or locale.
- The draw stream for turn *n* is seeded from `` `${seed}:draw:${n}` ``, so the draw on one turn never depends on how many numbers earlier turns used.
- Weighted selection uses positive integer rarity weights 65/28/7 × event weight (default 1); these are per-candidate relative weights. Selection is exact: sort eligible candidates by ASCII ID, let W be the sum of their weights, take r = floor(rng() × W) with one call to the turn's stream, and pick the first candidate whose cumulative weight exceeds r. Follow the design’s draw rules exactly, including ASCII ID ordering, first two substantive draws, negative-event filtering and scheduled-only callbacks. Add a pure read-only candidate-distribution helper to the public engine exports for Lookahead; it returns candidates/probabilities without consuming or revealing the draw RNG.
- If no event is eligible after the first two substantive draws, a filler event ("Awkward silence." +2 min, repeatable) is drawn so a run can never stall. An impossible first-two substantive pool is a content error; valid content must provide two unrestricted common substantive families with absence variants.

**Turn order and endings**

1. `drawEvent` → player picks → `resolve` applies the effect, logs the decision, and advances `turn`.
2. After each `resolve`: P ≥ 100 ends with `decision`; otherwise `minute ≥ bookingEnd` ends with `time-expired`.
3. `callIt` ends with `cancelled` if no event has resolved yet, otherwise `called-early`.
4. `release` costs no time. Refuse Priya, an absent attendee, or any release from headcount two; return unchanged gameplay values. Successful releases record turn and minute. All attendance is unique, capped at eight; `legal`/`vp-joins` are the only joins, and released people never rejoin.
5. Use the design’s full-duration, pre-resolution-headcount billing and full-effect deadline rules. Apply progress/risks, then joins/booking change, advance turn, and check decision before expiry. Pending dialogue stays fixed after a release; re-evaluate response requirements and costs. An invalid/disabled response is an `EngineError`.
6. `turn` is the number of resolved events. Scheduling at turn n records dueTurn=n+2 before advancing. Only three designated base parents may schedule one unique common callback each; no chains, repeats, conditions or collisions. Due callbacks run before random draws, but never after an ending. Content validation proves these restrictions; unexpected collisions throw `EngineError`.
7. Mark families seen and speakers heard on draw, not resolution. Repeated `drawEvent` with `current` set returns an equivalent snapshot and never consumes another random choice. Store screen and beat state are separate from engine phase (see Meeting turn flow; D17). All one-response events wait for explicit acknowledgement.

**Content/evaluation contract**

Use the design document's expanded serializable schema: optional positive `weight`, explicit `negative`, `speaker: AttendeeId | 'room'`, ordered absent-speaker `variants`, `Condition.maxRisks` and optional `bookingEnd: 45 | 60`. Conditional `effectCases` are removed (D24): risk- or minute-dependent options are draw-time variants, because risks and minutes cannot change between draw and resolution; presence-dependent options use `requires`. Base IDs are family IDs; variants never add draws. Remove `leaves` from MVP effects; release is the sole removal action. All expert-best responses require that expert, including the base variant, so release during dialogue cannot retain expert benefits.

Implement the pure read-only `previewResponse` and `getDrawCandidates` contracts defined under Supporting types and export their types through the engine index. UI and policies use them rather than duplicate rules. `applyEffect` is the single clamp implementation used by preview and resolution. Preview must not log, advance turns, schedule callbacks or mutate state. Decision-quality evaluation (the internal `value`) compares effective/clamped deltas of enabled responses immediately before resolution; one/equal-valued choices are unscored. Calling the internal `value` on a disabled response is a programmer error. Store null quality for unscored records; average q and D are zero when none are scored.

**Task 04 precision and response metadata.** Utility uses the approved formula unchanged. Convert finite numeric tuning coefficients from their shortest decimal representation to exact rational coefficients, and compare common-denominator integer utility numerators for equality and decision quality. Convert to numbers only for public utility/quality results; no BigInt enters MeetingState or ResponsePreview. There is no broad epsilon that turns genuinely different utilities into ties. Tests cover the reported current public profile, multi-response decimal ties, and genuinely close alternatives.

Response adds optional `disabledReasonKey: string`, required and nonempty whenever `requires` is present. Return that authored key for a disabled preview; UI/content own its text. Missing authored metadata is a programmer/content error. Shared responseValidation runs in the evaluator for both preview and resolution. Generic effect-only previews may have no current event; joins, booking changes and callbacks require pending context. Resolution additionally requires running phase and a unique current response ID. Call it retains the delivered current event for narrative inspection; ended meetings cannot take further actions and task 06 candidate lookup must return an empty list.

EventRules are plain content-owned relationship metadata. Only engine/index imports the live metadata and forwards it through the internal evaluation profile; fixture profiles inject their own metadata, including renamed IDs. ContentPack carries eventRules for future pool lookup/validation. Generic numeric fixture profiles may omit it only when they have no context-dependent effect. Validate that pack metadata refers to its actual families/targets, conditional responses have authored reason keys, and callback relationships are legal in task 07a. This adds no live dialogue or event design before the reviewed content table.

**Scoring module**

- `score.ts` implements the design doc formulas exactly, reading every constant from `constants.ts` under the design doc's names: `OUTCOME_MAX`, `RISK_PENALTY` (60), `RISK_PENALTY_CAP` (200), `FAIL_MULTIPLIER` (1.8), `EFFICIENCY_MAX`, `COST_REF_PM` (360), `COST_FLOOR_PM` (90), `DECISIONS_MAX`, `W_COST` (1.2), `W_RISK` (12).
- Each component is rounded to an integer, then summed. The six worked examples in the design doc are unit tests and MUST pass exactly.
- Title predicates live in `core/engine/titleRules.ts`; title names and copy live in `core/content/titles.ts` (D24).

**Content validation**

`validateContent()` runs as a Vitest test on every CI run and fails the build if any rule breaks:

- Event IDs are unique within the event namespace and match file names; attendee/title IDs are unique within their own namespaces; response IDs are unique within each presentation. Reusing `legal` as an attendee and event ID, or `park` in different events, is valid. Every callback and attendee reference exists.
- Each event has 1–3 responses; effects stay in range (minutes 0–10, progress −10 to +25, risks −1 to +1).
- Player-facing text fits the mobile layout: event/response/moment/epilogue lines ≤ 90 Unicode code points, response labels ≤ 24, collectible titles ≤ 28. Job titles have a separate ≤48 limit and wrap to up to three lines on phones. Required labels/disabled reasons are authored in content, never generated ad hoc in UI.
- No effect removes attendees. Only the two arrival families join their designated attendee; every response joins exactly that person. Enforce unique joins and no re-entry.
- Validate every variant, zero minutes only for email, at least one always-enabled response per presentation, expert requirements, guaranteed first-two substantive availability, and the three explicit callback-parent pairs. Each parent must have a reachable scheduling response. Callback responses take at least one minute. Only `room-booked` may set `bookingEnd`; all its effect paths explicitly keep 60 or set 45.
- Speakers must be present at draw through eligibility or variants, except the room narrator and the designated VP/Legal arrival speaker. An expert's absence must never remove a substantive family entirely. Variants must remain disjoint or have tested first-match precedence.
- Collectible title priority/fallback, moment order, threshold rounding and risk-tier epilogues follow the design. Every title and variant has a constructed reachability test; these are separate from statistical event coverage.

## Presentation

A DOM sprite stage draws the room and nothing else (D16). React draws every word and every button. There is no game engine and no canvas on the play screen, which keeps text crisp and accessible on phones and the bundle small.

**Room stage (D16)**

- Logical resolution 320×240 (4:3). The room is one flattened PNG; the eight characters are absolutely positioned elements drawn from the sprite atlas with `background-position`.
- The stage scales by an integer factor with `image-rendering: pixelated`, so pixels stay crisp.
- Idles use CSS `steps()`. Reactions (`nod`, `sigh`, `enter`, `leave`), the parking-lot pulse and the celebration are CSS keyframe classes. With `prefers-reduced-motion`, idles stop and reactions become instant state changes.
- The stage container has `role="img"` and an `aria-label` that names who is in the room; sprite elements are `aria-hidden`.
- `stage/RoomStage.tsx` implements the typed `RoomView` vocabulary (`showAttendees`, `react(id, 'nod' | 'sigh' | 'leave' | 'enter')`, `pulseParkingLot`, `celebrate`). Nothing outside `stage/` touches sprite elements or animation classes.
- Reactions come only from the pure function `reactionsFor(prev, next)` in `stage/reactions.ts`. Default mapping: a join → `enter`; a release → `leave`; progress up → the speaker nods; risks up → the room sighs; `parkedCount` up → parking-lot pulse; ending `decision` → celebrate. Adjust the mapping only in this function.
- No text is drawn in the stage.

**React overlay**

- Screens: Title → Meeting → Results. There is no router; a store-owned `screen: title | meeting | results` picks the screen; it does not extend or reuse the engine’s `running | ended` phase.
- Meeting screen: HUD (progress, clock, cost, open risks), roster of portraits (tap to release), dialogue box, 1–3 choice buttons, and a Call it button.
- Dialogue types out at 40 characters a second; a tap completes it. With `prefers-reduced-motion` it appears instantly and nothing shakes.
- Meters animate over 400 ms; the cost counter ticks up to its new value.

**Stage wiring**

- `RoomStage` is an ordinary React component on the Meeting screen. There is no dynamic import, game instance or lifecycle beyond React's. It reads state through narrow selectors and never dispatches.
- Loading: the title screen is plain React and paints first. The room PNG, sprite atlas and font then preload (`img.decode()` and the Font Loading API); the Start button shows "Booking the room…" until they are ready and offers a retry if loading fails.

**Meeting turn flow (D17)**

The store holds `screen: 'title' | 'meeting' | 'results'`, `beat: 'speaking' | 'choosing' | 'outcome'` (Meeting screen only), `game: MeetingState | null`, `unlockedTitles: readonly TitleId[]` and `assetsReady: boolean`. The actions below are the complete list; `ui` dispatches only these.

| Action | Allowed when | Does |
| --- | --- | --- |
| `start` | Title screen, assets ready | Creates the seed, calls `initialState` then `drawEvent`; screen → meeting, beat → speaking |
| `finishTyping` | `speaking` | beat → choosing (also fired when typing completes) |
| `choose(responseId)` | `choosing`, response enabled | Calls `resolve`; beat → outcome. Ignored in any other beat, which guards double taps and key repeats |
| `continue` | `outcome` | If the run ended: computes score and titles, persists unlocks, screen → results. Otherwise calls `drawEvent`; beat → speaking |
| `release(who)` | `speaking` or `choosing` | Calls `release`; a refused release changes nothing and the HUD shows why |
| `callIt` | `speaking` or `choosing` | Calls `callIt`, computes score and titles, persists unlocks; screen → results (no outcome beat) |
| `restart` | Results screen or error boundary | screen → title, game → null; unlocked titles are kept |

- The outcome beat shows the `line` of the latest `resolve` log entry. One-response events use the same flow; their single button is the acknowledgement.
- Releasing: tapping a portrait shows one confirm button, "Thanks, you can drop off.", plus Cancel. Portraits that cannot be released (Priya, the last other attendee) show the reason instead.
- Typing progress, meter tweening and cost ticking are component-local state, never stored.
- Keys: 1–3 choose in `choosing`; Enter runs `finishTyping` in `speaking` and `continue` in `outcome`.

**Responsive layout**

| Viewport | Layout |
| --- | --- |
| Under 640 px wide (phones, LinkedIn in-app browser) | Portrait stack: HUD on top, room stage at full width, dialogue and choices below it |
| 640 px and wider | Room stage centred at an integer zoom (up to 3×, 960 px wide); dialogue box overlays the bottom of the stage |

- Respect `env(safe-area-inset-*)` on notched phones; no horizontal scroll at 320 px wide.
- Touch targets are at least 44×44 CSS px; dialogue text is at least 16 px on phones.

**Accessibility**

- Choices are real `<button>` elements; keys 1–3 pick a choice, Enter skips the typing effect.
- Focus moves to the first choice when choices appear. A visually hidden `aria-live="polite"` region receives each full line once; the visibly typed text is `aria-hidden` (D26).
- Risk and progress never rely on colour alone (icons and numbers too). Text meets WCAG AA contrast.
- No audio in the MVP.

**Share card**

- `share/renderCard.ts` draws a 1200×627 PNG on an offscreen canvas after `document.fonts.ready`, using the same font and sprite atlas as the game.
- The finished card is always shown on the results screen as an `<img>` (blob URL), so long-press save works where download or file sharing is unavailable. The order of share paths follows the task-02 in-app browser probe results (D26).
- Use `navigator.share` with the file when `navigator.canShare({ files })` is true. Otherwise offer a download plus copy-to-clipboard. If the clipboard is blocked (common in in-app browsers), show the share text in a selectable box.

**Art assets**

- The room is composed on a 16 px grid and exported as one flattened PNG; characters are 16×24 px frames with idle (2 frames), react-positive, react-negative, enter and leave.
- One shared palette of at most 16 colours, saved as `art-src/palette.gpl`.
- All sprites in one atlas no larger than 2048×2048; all deployed image and font bytes total at most 400 KB, including the static OG image and any icons. JSON/JS are accounted separately; exported share cards are generated at runtime, not deployed assets.
- Every asset is listed in `public/LICENSES.md` with source, author and licence before it is committed, including original art. Original human-created assets, CC0 office tilesets and OFL fonts are approved source classes; choose and document a specific source without another permission step. Other licences/sources require review. Keep editable sources and licence texts.

**Persistence**

- One `localStorage` key, `tcbae:v1:titles`, holding an array of unlocked title ids.
- Every read and write is wrapped in try/catch. A missing, blocked or corrupt value means "no titles yet", never an error screen.

## Project rules for the AI assistant

These rules apply to every change, whoever writes it. The last section repeats the most important ones as a drop-in `CLAUDE.md`.

**TypeScript**

- `tsconfig` MUST enable `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride` and `verbatimModuleSyntax`.
- No `any`, no non-null `!`, and no `as` casts except `as const`. Tests may cast fixtures.
- Use string-literal unions, not TypeScript `enum`s.
- Named exports only. Default exports are allowed only where a tool requires them (Vite, Playwright and ESLint configs).
- Functions SHOULD stay under 40 lines and files under 300 lines.

**Code content**

- No application magic numbers outside `core/engine/constants.ts` and `core/content/`. Tool configuration, test fixtures and illustrative documentation values are exempt.
- Player-facing text lives only in `core/content/` (event files and `copy.ts`), never inline in components or the stage.
- Comments explain *why*, not *what*. Every exported engine function has a one-line TSDoc that names the design doc section it implements.
- The engine throws `EngineError` only for programmer mistakes (an unknown response id, an action after the meeting ended). A top-level React error boundary offers "Start a new meeting" and never shows a stack trace.

**React**

- Function components and hooks, except one minimal class component for the top-level React error boundary (no additional dependency). Read the store through narrow selectors.
- No `useEffect` for values that can be derived during render.
- Style with Tailwind classes. Inline `style` only for dynamic values such as meter widths.

**Dependencies, assets and network**

- Only the packages in the allowlist under Locked tech stack. A new package, CDN script or third-party embed needs an ADR first.
- No asset is committed without a `LICENSES.md` entry. No AI-generated final art.
- At runtime the site makes no network calls except loading its own files and the Vercel Analytics script. It collects no personal data and sets no cookies.

**Approved browser capabilities**

DOM/events/focus, canvas 2D for share export, CSS animation, `crypto.getRandomValues`, localStorage, `matchMedia`, ResizeObserver, requestAnimationFrame/presentation timers, Font Loading API, image decoding, Blob/File/object URLs and anchor download, Web Share (`share`/`canShare`) and Clipboard `writeText` are approved. Feature-detect optional APIs and keep image-download/selectable-text fallbacks. No clipboard reads, additional permissions, sensors or new network services are implied. Native-share cancellation is not an error screen. Fresh entropy is used only for the run seed; presentation timing never affects core state.

**Workflow**

- One blueprint task per PR, on a branch named `feat/…`, `fix/…`, `chore/…` or `docs/…`, with Conventional Commit messages.
- Before writing code, state the task, the files it will touch, and any rule it might strain.
- Add or update tests in the same PR, and run `pnpm check` with the D10 activation schedule before calling implementation work done. Documentation-only work uses document consistency checks.
- A PR that changes tuning numbers includes the before/after simulation summary.

**Never**

- Edit `pnpm-lock.yaml` by hand, rewrite an accepted ADR, or change the CI workflow to make a gate pass.
- Weaken, skip or delete a test, or lower an acceptance threshold, to make a build green. Propose the change in the PR instead.
- Change a scoring formula (as opposed to a constant) without Harry's approval.
- Use `Math.random`, `Date.now()` or timers inside `core/`.

**Stop and ask Harry when**

- A locked choice looks wrong for the task.
- The design doc is ambiguous or contradicts this spec.
- A task needs a dependency outside the explicit allowlist, an asset outside approved source classes, or a browser capability outside the approved list above.
- A gate can't pass without lowering a threshold.
- Harry accepted keeping PR #4 and larger future PRs on October 11, 2026. Use understandable commits; size alone does not require multiple PRs or approval.
- A task needs a rule or convention the documents do not state; propose the document change in the PR before coding it.

## Testing and quality gates

**Gate activation (D10, D25).** This table is the only definition of the gate schedule; the implementation plan and `CLAUDE.md` link here. Task IDs refer to the implementation plan. Each gate is added to CI by the task named in its row, in the same PR as the capability it checks; CI does not scaffold gates that do not exist yet, and nothing is reported green that did not run. Once active, a gate is never disabled. Documentation-only work runs document consistency checks instead. `pnpm check` runs whichever of typecheck, lint, test and sim:ci are active. Task 16 cannot begin until every gate below except the release-only full simulation is active.

| Gate | Command | Active from task | Pass rule |
| --- | --- | --- | --- |
| Types | `pnpm typecheck` | 01b | Zero errors |
| Lint and format | `pnpm lint` | 01b | Zero errors and zero warnings |
| Bundle budget | `pnpm build && pnpm size` | 01b | All JS, including lazy chunks, ≤ 120 KB gzip; deployed images + font ≤ 400 KB |
| Unit, property, golden | `pnpm test` | 02 (runner); coverage rule from 03 | All pass; `core/` coverage ≥ 90% lines and ≥ 85% branches across every existing core file |
| Content validation | part of `pnpm test` | 07a | `validateContent` passes for every pack, fixture and live |
| Simulation invariants | `pnpm sim:ci` | 08a | No crash, illegal state or nondeterminism, ever |
| Simulation balance | `pnpm sim:ci` | Diagnostic from 09; mandatory once task 10 completes | 2,000 fixed seeds × 7 policies meet every design acceptance criterion; the efficiency-floor deviation is reported as a diagnostic (D25) |
| End-to-end | `pnpm e2e` | Shell smoke 02; meeting loop 12a; full-run paths 12b; share and collection 15 | All specs pass on Pixel 7 (Chromium), iPhone 14 (WebKit) and desktop Chromium, with no console errors |
| Full simulation | `pnpm sim -- --runs 10000` | Before each release | Same criteria at 10,000 runs; efficiency floor calibrated (D25); summary committed to `docs/sim/` |

Do not merge gameplay tuning failures once the balance gate is mandatory.

**What the unit tests MUST cover**

- Every formula in `score.ts`, including the six worked examples from the design doc and the edges P = 99 vs. 100, R = 5 and a cancel at minute 0.
- Changing the display rate leaves every score unchanged.
- `release` refuses the decision owner and the last other attendee; `callIt` picks `cancelled` vs. `called-early` correctly.
- Fairness guards: first two draws are substantive (hence two in the first six if reached); never two uncommon negative events in a row. Test callback due turns, early endings and absence variants as specified in the design.
- Engine rule tests use fixture content packs (D13, D21); only content-validation tests assert live tuning values.

**Property tests (fast-check, random seeds and random valid choices)**

- P stays in 0–100, R in 0–5, and minutes and person-minutes never decrease.
- Every run ends within 50 resolved turns: at most 17 unique base families + 3 unique callbacks + 30 two-minute fillers. No artificial turn-cap ending. Test zero-minute emails and exhausted pools explicitly.
- The same seed and choices give an identical final state.
- Scores are integers from 0 to 1,000; a success's Outcome score is always above any failure's.
- Engine functions never mutate a deep-frozen input.

**Golden runs**

At least five recorded runs in `tests/golden/` on frozen fixture content packs (D21): seed + full ordered action list, including releases and Call it → expected final state and score. Cover cancellation, clean success, risky success, timeout, and callback plus absence variant. Because goldens never use live content, tuning PRs do not change them; a golden changes only when engine behaviour changes, in a PR that explains why. The simulation summary is the regression record for live content.

**End-to-end specs**

- Start → play a full meeting by always picking the first choice → results card shows a title and a score.
- Resolve at least one event, release an attendee, then call it early → "Let's Take This Offline" ending.
- Share falls back to the selectable text box when the clipboard is blocked.
- With reduced motion on, dialogue appears instantly.

**Manual release checklist**

- [ ] LinkedIn in-app browser on iOS and Android: loads, plays, shares.
- [ ] Safari iOS, Chrome Android, and desktop Chrome, Firefox and Safari.
- [ ] Lighthouse mobile on the preview URL: Performance ≥ 85, Accessibility ≥ 95.
- [ ] Five-person playtest: can each player tell tangents from substantive issues?

## Build, CI and deployment

GitHub Actions runs every active gate on every PR, per the Gate activation table; Vercel builds a preview for every PR and deploys production when `main` changes. There is no server code.

**Package scripts (locked names)**

| Script | Does |
| --- | --- |
| `dev` | Vite dev server |
| `build` | Type-check, then `vite build` to `dist/` |
| `preview` | Serve `dist/` locally |
| `typecheck` | `tsc --noEmit` |
| `lint` | ESLint + `prettier --check` |
| `test` | `vitest run --coverage` |
| `sim` / `sim:ci` | `tsx sim/run.ts` with full or CI-sized runs |
| `e2e` | Playwright against `preview` |
| `size` | `scripts/checkSize.ts`: gzips `dist/` with `node:zlib` and checks the budgets (no extra dependency) |
| `check` | The active subset of `typecheck`, `lint`, `test` and `sim:ci` (see Gate activation) |

**CI workflow (`.github/workflows/ci.yml`)**

1. Trigger on pull requests and pushes to `main`.
2. Set up Node from `.nvmrc`, enable Corepack, `pnpm install --frozen-lockfile` (cached).
3. Run `pnpm check`, then `pnpm build && pnpm size`, then `pnpm e2e` (Playwright browsers cached).
4. Upload the simulation summary and Playwright report as artifacts.

`main` is protected: all checks required, squash merges only, no direct pushes.

**Vercel**

- Framework preset Vite, build command `pnpm build`, output `dist`.
- `vercel.json` sets headers:
  - Vite-emitted fingerprinted JS/CSS use `build.assetsDir: 'bundles'`; `/bundles/(.*)` gets `Cache-Control: public, max-age=31536000, immutable`.
  - HTML, `/assets/(.*)` (public atlas and room images), `/fonts/(.*)`, and `/og.png` get `Cache-Control: no-cache`. These stable public URLs revalidate on reuse; do not label them immutable. This avoids a custom hashing/manifest/reference-rewrite pipeline. Keep atlas and room image paths relative and verify them in the built preview.
  - Use Vercel-supported route patterns in the actual configuration and inspect response headers, not only the JSON file.
  - Content Security Policy: `default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; font-src 'self'`. `'unsafe-inline'` for styles is needed only for dynamic meter widths and sprite positions.
  - `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
- The custom domain is not decided yet; it doesn't affect anything in this spec.

Caching implementation references: [Vite generated asset directory](https://vite.dev/config/build-options.html#build-assetsdir), [Vite public assets](https://vite.dev/guide/assets.html#the-public-directory), and [Vercel project configuration](https://vercel.com/docs/project-configuration). Public files retain their names; only fingerprinted build output receives immutable caching.

**Link previews (this is how most people will arrive)**

- `index.html` carries Open Graph and Twitter tags: title, one-line description, and a static 1200×627 `og:image` of the room.
- Before launch, check the URL in LinkedIn's Post Inspector and confirm the image and title show.

**Analytics**

- Mount `<Analytics />` from `@vercel/analytics/react`. It counts page views only; the script is served from the site's own origin, so the CSP above allows it.
- There is no custom event tracking and no tracking wrapper in the MVP (D26). Adding custom events needs an ADR, because they require Vercel Pro.
- The Hobby plan includes 50,000 events a month; if a LinkedIn post goes viral, collection pauses but the game keeps working.

**Releases**

A release is a `vX.Y.Z` tag on `main` after the manual release checklist under Testing and quality gates passes. Before 1.0, minor versions may change gameplay.

## Definition of done and rules file

A blueprint task is done only when every box below is true. The rules file goes in the repo root as `CLAUDE.md`, with `AGENTS.md` pointing to it, so any coding assistant loads it at the start of every session.

**Definition of done (every task)**

- [ ] Behaviour matches the design doc section named in the PR.
- [ ] Every gate activated for this task under D10 is green; after full activation this means `pnpm check`, `pnpm build && pnpm size` and `pnpm e2e`. Documentation-only work reports document checks, not unrun game tests.
- [ ] New behaviour has tests; no test or threshold was weakened.
- [ ] No dependency outside the allowlist without an ADR; no new asset without a `LICENSES.md` entry.
- [ ] Player-facing text is in `core/content/` and within the length limits.
- [ ] Works at 320 px wide, with touch, keyboard and reduced motion.
- [ ] PR description lists the task, files touched, assumptions, and the simulation diff if tuning numbers changed.

**Drop-in `CLAUDE.md`**

```markdown
# This Could've Been an Email — rules for coding assistants

Read before any task: docs/tech-spec.md (how), docs/design-doc-v2.md (what),
docs/implementation-plan.md (task order, IDs, status), docs/content-table.md and docs/adr/.
Precedence, architecture rules and the gate schedule are defined only in docs/tech-spec.md.

## Stack (locked — changes need an ADR in docs/adr/)
Node 24 LTS · pnpm · TypeScript 6 strict · Vite 8 · React 19 · Zustand 5
Tailwind 4 · Vitest 5 + fast-check · Playwright · ESLint + Prettier · tsx · Vercel (static)
Runtime deps are ONLY: react, react-dom, zustand, @vercel/analytics.
The room is DOM sprites + CSS. No game engine.

## Architecture
- src/core (engine + content) is pure TS: no DOM, React, Date, timers, Math.random.
- store/ is the only browser caller of state-changing engine functions.
- ui/ (React) owns all text and input. stage/ only draws the room and never dispatches.
- sim/ runs in Node only and is never bundled.

## Guardrails
1. Game rules live only in src/core/engine. ui/, store/, stage/ and sim/ never compute
   eligibility, effects, clamping, utility, score or titles; they call previewResponse,
   getDrawCandidates, score and earnedTitles.
2. The store is the only writer of MeetingState. Only the store actions `start` and
   `continue` call drawEvent. ui/ dispatches named actions; stage/ never dispatches.
3. Only src/core/engine/index.ts imports live content. Engine internals take a ContentPack
   argument. Rule tests and goldens use fixture packs, never live content.
4. State counters are authoritative for rules and titles. `log` is narrative only (results
   moment, outcome line, sim traces). No rule reads the log.
5. `current` is a PresentedEvent. Read speaker, line and responses from it; never
   re-select variants outside drawEvent.
6. Typing, tweening and sprite animation state live in the component that renders them.
   Nothing time-based enters the store or the engine.
7. Content files are plain data checked with `satisfies`: no functions, no computed values.
   Numbers live in content or constants.ts; player-facing text lives only in content.
8. The room is reached only through RoomView; reactions come only from reactionsFor(prev, next).
9. Tuned numbers are asserted only by content-validation tests and the sim report. Engine
   unit tests and goldens never depend on live tuning values.
10. If a task needs a rule the docs do not state, stop and propose the doc change in the PR
    description first. Never settle a convention in code alone.

## Code
- No any, no !, no `as` (except `as const`), no enums, named exports only.
- Numbers live in core/engine/constants.ts or core/content/; player text lives in core/content/. Tooling configuration values are exempt.
- Money is integer person-minutes; dollars are display-only, formatted only by formatCost.
- Engine functions are pure and return new state; never mutate input.

## Workflow
- One blueprint task per PR; Conventional Commits; branch feat/ fix/ chore/ docs/.
- First reply on a task: the task ID, files to touch, risks to the rules.
- Run the gates active for this task (tech spec → Testing and quality gates) before saying done; document-only tasks run consistency checks. Add tests with every behaviour change. Never deactivate an active gate.
- Tuning PRs include the before/after `pnpm sim:ci` summary.
- Event content is transcribed from docs/content-table.md; do not invent event design in code PRs.

## Never
- Add an unapproved direct dependency, CDN script, custom tracker or cookie. The explicit dependency allowlist and page-view Analytics are approved.
- Weaken/skip a test or lower a threshold to go green.
- Edit pnpm-lock.yaml by hand, rewrite an accepted ADR, or edit CI to pass.
- Change a scoring formula without Harry's approval.
- Commit an asset without a LICENSES.md entry, or AI-generated final art.

## Stop and ask when
- A locked choice looks wrong, the docs conflict or are silent on a needed rule,
  a gate can't pass.
```
