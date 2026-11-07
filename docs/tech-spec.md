# This Could've Been an Email — Technical Spec

October 13, 2026 · Approved lunch contracts · @Harry

Reconciled October 7, 2026 with Harry’s D01–D12 direction. Revised October 8, 2026 to apply the accepted pre-implementation architecture review (D13–D26). ADRs 0005–0008 were approved by Harry on October 13, 2026 and now supersede the specifically identified launch contracts. This spec is the lunch target; L03–L07 preserve launch behavior during additive preparation and L08 performs activation. Numerical balance remains unverified until simulation.

## How to use this spec

This spec fixes *how* the game is built. The design doc (This Could've Been an Email — Design Doc v2) fixes *what* the game does. An AI coding assistant working on the repo must follow both; together they become the implementation blueprint.

**Order of precedence when sources disagree**

1. An explicit instruction from Harry in the current session.
2. This spec, for stack, architecture, code rules and process.
3. Design Doc v2, for game rules, formulas, content and copy.
4. The assistant's own judgement, stated as an assumption in the PR description.

**Wording.** MUST and MUST NOT are hard rules; a PR that breaks one is rejected. SHOULD is the default; the assistant may depart from it only with a one-line reason in the PR.

**Revision authority.** Harry explicitly authorized the D01–D12 reconciliation and accepted the October 8 architecture review (D13–D26). Neither requires a second approval. `docs/adr/0001-stack.md`, written in task 01a, is the single decision register for D01–D26; there is no separate decisions file. Harry accepted all recommended lunch resolutions, including formula changes and explicit criterion replacements, in ADRs 0005–0008. Those decisions need no repeat approval. Final content still requires L02/L02b and D18 review; later departures follow change control.

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
- `store` is the only browser module that calls state-changing engine functions (`initialState`, `drawEvent`, `resolve`, `callIt`). Only its `start` and `continue` actions call `drawEvent` (D17).
- `ui` reads state through store hooks and dispatches named store actions. It may import types and pure read-only helpers from `core` (such as `previewResponse` for availability), never state-changing functions.
- `stage` reads the store through selectors and MUST NOT dispatch actions. It is purely presentational; every tap and click is handled by `ui`. The roster displays attendees and never offers release.
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
│  │  │  ├─ state.ts          # initialState, permanent attendance
│  │  │  ├─ draw.ts           # drawEvent + fairness guards
│  │  │  ├─ resolve.ts
│  │  │  ├─ value.ts          # internal utility; not exported publicly (D24)
│  │  │  ├─ score.ts          # score, displayCost, formatCost
│  │  │  ├─ titleRules.ts     # title predicates (copy lives in content)
│  │  │  ├─ fixtures/         # small ContentPacks for rule tests and goldens (D13, D21)
│  │  │  └─ index.ts          # the only public export surface; the only engine importer of content
│  │  └─ content/
│  │     ├─ engineRules.ts   # approved relationship metadata, data only
│  │     ├─ storeConfig.ts   # seed byte/hex protocol and versioned persistence key, data only
│  │     ├─ cuisines.ts       # reviewed cuisine IDs and names
│  │     ├─ commentary.ts     # authored conditions/templates, no functions
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
│  │  ├─ components/          # DialogueBox, ChoiceButton, Hud, Roster, TitleGrid
│  │  └─ share/               # renderCard.ts (canvas image), shareText.ts
│  ├─ stage/
│  │  ├─ RoomStage.tsx        # DOM sprite room implementing RoomView (D16)
│  │  ├─ reactions.ts         # reactionsFor(prev, next): the only state → reaction mapping
│  │  └─ stage.css            # sprite positions, steps() idles, reaction keyframes
│  ├─ main.tsx
│  └─ index.css                # Tailwind entry + pixel-art CSS
├─ sim/
│  ├─ policies/                # lookahead, greedy, optimistic, timebox, fastest, park, random
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

The following is the approved lunch target under ADRs 0005–0008. L03–L07 may
prepare additive capabilities while the launch binding and its tests remain
unchanged; L08 switches the public binding and removes all temporary legacy
contracts. This transition is not permission to ship hidden risk/release rules.

**Content source during preparation.** Once L02 replaces `docs/content-table.md`
with the unapproved lunch draft, the unchanged launch transcription tests and
launch content provenance comments use `docs/content-table-launch.md` through
L03–L07. This is the preserved D18-approved launch table, not a second runtime
pack. Keep all launch assertions and fixtures intact.
The launch roster/title assertions also read the preserved
`docs/design-doc-launch.md`, because L01 replaces the normative design document
with the lunch target. Preserve those assertions and the original design text.
Lunch transcription uses
`docs/content-table.md` only after L02b and Harry's final D18 approval; L08
switches the live tests/provenance to that reviewed lunch source. A document
change that affects an active test input must run the active Node 24 checks,
even when it changes no gameplay data. Harry's instruction to address the L02
review authorizes this source-path correction; no rule/formula changes result.

**State shape (locked)**

MeetingState remains plain serializable immutable data. Preserve these field
names/types: seed string; turn/minute/personMinutes/peakHeadcount/parkedCount/
substantiveDrawCount numbers; bookingEnd 45 or 60; progress number; present attendee
IDs; seenEventIds and spokenAttendeeIds arrays; previousDrawWasUncommonNegative
boolean; scheduled eventId/dueTurn array; current PresentedEvent or null;
decisions array; narrative log array; phase running/ended; ending decision/
called-early/time-expired/cancelled or null. Remove risks and releasedAttendeeIds.
Add nominatedCuisine and agreedCuisine (CuisineId or null), resolvedCallbackCount,
shownCommentaryIds (readonly strings) and lastCommentaryTurn (number or null).
These counters, not the narrative log, are authoritative for rules/title selection.

Initial state has turn/minute/progress/personMinutes/parkedCount/
resolvedCallbackCount/substantiveDrawCount zero; bookingEnd 60; the six starting
attendees; peakHeadcount six; both cuisine fields/current/ending/lastCommentaryTurn
null; empty history/queue/decisions/log/commentary IDs; running phase and false
previousDrawWasUncommonNegative. Seed accepts any string. Nomination resolves
before any other event; turn>0 requires a nominated cuisine. Agreement requires
P=100 and sets agreedCuisine equal to the nomination. agreedCuisine is non-null
exactly when ending=decision. Validation rejects P=100 with no nomination.

**Content and supporting contracts (locked)**

- AttendeeId retains priya/dev/sam/morgan/gary/jordan/vp/legal; six starters are
  unchanged. CuisineId values come from the reviewed plain-data catalog; all
  references must be members. No dynamic cuisine generation.
- Condition retains inclusive minMinute/maxMinute and all-present/all-absent ID
  arrays. Remove minRisks/maxRisks. No new cuisine condition is needed initially;
  authored cuisine placeholders suffice. Variants use first matching authored
  order; family when controls draw eligibility, not presentation selection.
- Effect has required integer minutes; optional progress, joins, bookingEnd,
  callback {eventId, afterTurns: 2}, nominateCuisine. No risks or removal effects.
  Only the nomination family may set nominateCuisine. Its three deterministic
  choices reference different cuisines but have equal other effects and finish
  below P=100. No other effect changes that nomination.
- Response retains id, label, technique, requires and disabledReasonKey; adds
  description and outcomes. Remove the old single effect/line. Each outcome is
  {id, weight, effect, line}; one or two entries, distinct ASCII kebab-case IDs,
  positive safe-integer weights, total ≤65,536. One outcome means deterministic.
  Each branch is a complete effect; no common effect is added twice. No nested
  outcomes, conditional effectCases, functions or branch conditions.
- Technique retains hear/timebox/park/owner/email/refocus/ack as internal tags,
  not compulsory player labels. A selected park increments parkedCount once;
  resolving any callback increments resolvedCallbackCount once.
- MeetingEvent retains id/kind/rarity/speaker/line/weight/negative/when/variants/
  responses. PresentedEvent retains the materialized id/kind/rarity/negative/
  speaker/line/responses only, never variants or family conditions. Draw fixes
  speaker and content; nothing reselects it outside drawEvent.
- EventRules carries nominationEventId, approved event/response/attendee arrival
  permissions, designated arrival-family speaker IDs, callbackTargets and
  bookingEventIds. Store each arrival permission as {eventId,responseId,attendeeId}
  to avoid ambiguous compound-key parsing. Arrival speaker exceptions apply only
  to their designated spontaneous family, not unrelated invitation speakers.
- ContentPack contains eventRules, cuisines, 17 events, three callbacks and filler,
  plus authored commentary metadata. Only index.ts imports the live pack; fixture
  packs inject their own IDs and metadata. Catalogs/text stay plain data.
- DecisionRecord keeps turn/eventId/responseId and numeric quality plus exact
  qualityFraction (decimal-string numerator/denominator) or null. Fractions are
  authoritative; BigInt is calculation-only and never stored. No epsilon ties.
- LogEntry retains draw/resolve/join/call-it variants, removes release, and adds
  outcomeId and optional commentaryId to resolve. Resolve line is the sampled
  branch's authored outcome. Logs serve outcomes, factual moments and replay
  traces, never score/title eligibility. Seed is also in state/replay metadata.
- ScoreBreakdown stays outcome/efficiency/decisions/total. TitleId replaces
  ship-it-and-pray, skeleton-crew, gary-free-zone with lunch-agreed, table-for-six,
  second-helping. A separate legacy title ID catalog recognizes all twelve old
  IDs for archival display; it is not accepted by lunch earnedTitles.

**Read-only preview contracts**

Disabled ResponsePreview stays {enabled:false,responseId,reasonKey}, with a
nonempty authored disabledReasonKey for every conditional response. Enabled
preview carries responseId, outcomes (outcomeId, complete effect, exact
probabilityFraction, clamped progressDelta, minutesDelta, personMinutesDelta,
branch utility and utilityFraction), and top-level expectedUtilityFraction,
utility, progressDelta/minutesDelta/personMinutesDelta as numeric expectations.
Remove single effect and risksDelta. Weight each branch after clamping/billing;
never apply an average effect and clamp later. Numeric values serve reports;
exact fractions drive rankings/q. UI displays descriptions and availability,
not numerical preview values or odds, including accessibility labels/tooltips.

DrawCandidate remains a materialized event and normalized probability; a pending
state returns that event with probability 1, ended returns empty, otherwise return
exactly the forced/guarded/weighted/filler distribution without RNG consumption.
ResponseSuccessor contains outcomeId, exact probabilityFraction and a fully
resolved successor MeetingState. getResponseOutcomes requires a running pending
response and returns every branch via the same transition evaluator as resolve,
including pre-roll q, counters, queue, commentary and endings, without sampling.
It must not mutate the input or reveal which branch the run seed will select.
Generic response previews may omit pending context only for numeric fixture effects;
nomination/joins/booking/callbacks and successor enumeration require pending context.

**Public API (index only; locked)**

```typescript
initialState(seed: string): MeetingState
drawEvent(state: MeetingState): MeetingState
resolve(state: MeetingState, responseId: string): MeetingState
callIt(state: MeetingState): MeetingState
score(state: MeetingState): ScoreBreakdown
earnedTitles(state: MeetingState, score: ScoreBreakdown): TitleId[]
displayCost(personMinutes: number): number
formatCost(personMinutes: number): string
previewResponse(state: MeetingState, response: Response): ResponsePreview
getDrawCandidates(state: MeetingState): readonly DrawCandidate[]
getResponseOutcomes(state: MeetingState, responseId: string): readonly ResponseSuccessor[]
```

Remove release, previewRelease and ReleasePreview from the target API and lint
allowlist. value stays internal. ENGINE_LIMITS stays frozen/readonly, backed by
constants: progressMax=100, minHeadcount=6, maxHeadcount=8, decisionOwner=priya,
initialBookingEnd=60, reducedBookingEnd=45, scoreMax=1000 and fillerMinutes=2;
remove risksMax. Policies use engine evaluation/successors instead of computing
effects, eligibility, score or title rules themselves.

**Purity, money and scoring**

Return new states; never mutate inputs, including read-only helpers and pending
redraw. Tests deep-freeze inputs. No classes/Map/Set/Date/functions in state.
applyEffect is the single clamp/billing implementation. Bill full minutes at the
headcount immediately before resolution; dollars are display-only pm×1000/60.
formatCost alone formats whole dollars with thousands separators. Rate changes
cannot alter score. Implement the design's approved 400/300/300 formulas using
OUTCOME_MAX, FAIL_MULTIPLIER, EFFICIENCY_MAX, COST_REF_PM, COST_FLOOR_PM,
DECISIONS_MAX and W_COST; remove risk coefficients. Compare decimal coefficients
and outcome weights as exact rationals, score q before sampling, use null for
unscored/equal-valued choices, zero mean with none, round components then sum.
Title predicates stay in titleRules.ts and player copy in content. Formula changes
beyond the already approved ADR 0007 require Harry's approval.

**Randomness and determinism**

The only fresh entropy is one store crypto.getRandomValues call for the run seed
(16 lowercase hex characters from eight bytes). Math.random is banned. Hash with
original cyrb53 seed 0 over JS UTF-16 code units, low uint32 via >>>0; use existing
mulberry32 wrapping behavior. Retain fixed hash/PRNG vectors and no dependencies.

Draw turn n uses `${seed}:draw:${n}`. Sort random candidates by ASCII ID, weights
65/28/7 by rarity × positive event weight (default 1); with W total, take one
floor(rng()*W) ticket and the first cumulative weight exceeding it. Forced draws
and pending redraws do not consume a random choice.

An uncertain response uses a separate stream hashed from
`JSON.stringify([seed, 'response-v1', turn, current.id, response.id])`.
Sort outcomes by ASCII ID; W is sum of weights and L=floor(2^32/W)*W. Convert each
stream output to floor(r*2^32), reject tickets ≥L, select ticket%W by cumulative
weights. Deterministic responses consume no outcome ticket. Rejection affects
only this local stream. Validate action and requirements before sampling; sample
once per valid resolution. Repeating from identical immutable input is identical.
Preview and branch enumeration never sample. Test rejection and Unicode seeds.

ADR 0003 Random policy RNG remains Node-only SHA-256 over UTF-8
`${seed}:policy:random:${turn}:${counter}`, counter initially zero. First big-endian
uint32 ticket; reject ≥2^32-(2^32%enabledCount), increment counter and retry; choose
modulo enabledCount in authored response order. Policy RNG never consumes engine
RNG. Lookahead enumerates probabilities, never seeded future resolve/draw. Replay
requires rules/content/policy revision, seed and ordered actions; old launch runs
need their old revision. No cross-version seed-equivalence claim.

**Draw and resolution order**

1. Ended state cannot act; pending draw returns equivalent snapshot. Otherwise
   force nomination at turn zero; then due callback; then guarded unseen random
   pool; then filler if eligible. Mark family seen and speaker heard on draw.
2. The first two draws are substantive: nomination then common substantive pool.
   Content provides at least two unrestricted common substantive lunch families
   besides nomination. Broken first-two pool throws, never silently uses filler.
   Never draw adjacent uncommon negative events. Callback is common/non-negative.
3. Resolve validates the current response, computes q over enabled expected
   utilities, selects one branch, bills/applies full progress/nomination effects,
   then joins and booking, counters and callback queue, then advances turn.
   Each parent schedules at most one unique target for pre-advance n+2; no
   collisions/chains/repeats/conditional callbacks. Invalid relationships throw.
4. P=100 with nomination records agreedCuisine and decision, before checking
   minute≥bookingEnd for time-expired. Joins on a completing response share that
   agreement. No progress reset, refund, partial duration or deadline extension.
   Clear resolved current; record sampled outcome and optional commentary ID.
5. callIt retains delivered current for narrative use and ends cancelled if no
   resolution, otherwise called-early. No callback or event runs after ending.
   All one-response events await acknowledgement; no UI timer advances time.
6. Attendance is unique 6–8 and never decreases. Every invitation branch joins
   the same absent person; requires and family guards prevent duplicates. A
   spontaneous family joins on all choices and is unavailable after invitation.
   A player may choose another enabled response when an invitation is unavailable.
7. Commentary is chosen deterministically from authored eligible IDs/fixed
   priority. First eligibility after third resolution; at least three resolutions
   between emissions; maximum three, no repeat ID per run. Update authoritative
   shownCommentaryIds/lastCommentaryTurn, emit narrative ID; no effects/RNG/timers.

**Content validation**

validateContent remains pure, returns path-addressed issues, and runs in Vitest.
All complete packs (including frozen fixture packs) receive structural checks;
explicit synthetic profiles may vary counts/ranges to isolate engine rules. Live
playable packs additionally enforce authored limits and reviewed relationships.
Partial numeric fixtures are not complete packs. No profile bypasses structural
safety or coverage thresholds. L03–L07 preserve old live validation; L08 retires
obsolete launch profiles with explicit replacements, not blanket snapshot updates.

Validate unique IDs/references/file stems, finite integer effects and inclusive
conditions; first-match variant reachability and at least one reachable
presentation/fallback; presence-safe speakers except room/designated door speaker;
all outcome branches and arrival/callback/booking/nomination permissions. Playable
packs have 17 base families, three unique common unconditional callbacks and one
repeatable +2-minute filler. Each event has 1–3 responses, one/two outcomes each;
all branches take 1–10 minutes, progress −10…+25. Filler cannot schedule or join.
Only approved room-booking family can set 45/60, explicitly on every branch.
Callbacks never schedule callbacks. No effects remove people. No risks fields.

Required catalogs include filenames, attendees/roles, cuisines, titles, used/authored
disabled reasons, outcomes/epilogues/moments/commentary and their substitutions.
Event/outcome/description/moment/epilogue lines ≤90 Unicode code points, label ≤24,
title ≤28, role ≤48. No ad hoc UI strings. Validate weights and consistent joins
across invitation branches, always-enabled alternatives, nomination equality,
title/variant reachability, truthful ending placeholders and commentary predicates.
Document/table transcription and L02b editorial review are required in addition
to automated validation; an automated pass cannot prove humour or understanding.

## Presentation

A DOM sprite stage draws the room and nothing else (D16). React draws every word and every button. There is no game engine and no canvas on the play screen, which keeps text crisp and accessible on phones and the bundle small.

**Room stage (D16)**

- Logical resolution 320×240 (4:3). The room is one flattened PNG; the eight characters are absolutely positioned elements drawn from the sprite atlas with `background-position`.
- The stage scales by an integer factor with `image-rendering: pixelated`, so pixels stay crisp.
- Idles use CSS `steps()`. Reactions (`nod`, `sigh`, `enter`) and the celebration are CSS keyframe classes. With `prefers-reduced-motion`, idles stop and reactions become instant state changes.
- The stage container has `role="img"` and an `aria-label` that names who is in the room; sprite elements are `aria-hidden`.
- `stage/RoomStage.tsx` implements the typed `RoomView` vocabulary (`showAttendees`, `react(id, 'nod' | 'sigh' | 'enter')`, `celebrate`). Nothing outside `stage/` touches sprite elements or animation classes.
- Reactions come only from the pure function `reactionsFor(prev, next)` in `stage/reactions.ts`. Default mapping: a join → `enter`; progress up → the speaker nods; progress down → the speaker sighs; ending `decision` with agreedCuisine → celebrate. No departure animation or risk/parking board. Adjust the mapping only in this function.
- No text is drawn in the stage.

**React overlay**

- Screens: Title → Meeting → Results. There is no router; a store-owned `screen: title | meeting | results` picks the screen; it does not extend or reuse the engine’s `running | ended` phase.
- Meeting screen: HUD (progress, clock, cost), current nominated cuisine, passive roster, dialogue box, 1–3 choice buttons and Call it. Buttons show authored action/description and disabled reason, never numerical deltas, odds or utility in visible or accessibility text.
- Dialogue types out at 40 characters a second; a tap completes it. With `prefers-reduced-motion` it appears instantly and nothing shakes.
- Meters animate over 400 ms; the cost counter ticks up to its new value.

**Stage wiring**

- `RoomStage` is an ordinary React component on the Meeting screen. There is no dynamic import, game instance or lifecycle beyond React's. It reads state through narrow selectors and never dispatches.
- Loading: the title screen is plain React and paints first. The room PNG, sprite atlas and font then preload (`img.decode()` and the Font Loading API); the Start button shows "Booking the room…" until they are ready and offers a retry if loading fails.

**Meeting turn flow (D17)**

The store holds `screen: 'title' | 'meeting' | 'results'`, `beat: 'speaking' | 'choosing' | 'outcome'` (Meeting screen only), `game: MeetingState | null`, `unlockedTitles: readonly TitleId[]`, `legacyUnlockedTitles: readonly LegacyTitleId[]`, `assetsReady: boolean`, `assetStatus: 'loading' | 'ready' | 'failed'` and `breakdown: ScoreBreakdown | null`. Assets initially have loading status and are not ready. Results compute breakdown using engine `score`; restart clears breakdown and preserves asset status/readiness and unlocked titles. The actions below are the complete list; `ui` dispatches only these. ADR 0004 loading remains; ADRs 0005/0008 remove release and add separate legacy-title reads. Both collections survive restart.

| Action | Allowed when | Does |
| --- | --- | --- |
| `setAssetStatus(status)` | Title screen | Sets loading/ready/failed status and assetsReady (true only for ready); does not create a seed, draw, change MeetingState or start a run |
| `start` | Title screen, assets ready | Creates the seed, calls `initialState` then `drawEvent`; screen → meeting, beat → speaking |
| `finishTyping` | `speaking` | beat → choosing (also fired when typing completes) |
| `choose(responseId)` | `choosing`, response enabled | Calls `resolve`; beat → outcome. Ignored in any other beat, which guards double taps and key repeats |
| `continue` | `outcome` | If the run ended: computes score and titles, persists unlocks, screen → results. Otherwise calls `drawEvent`; beat → speaking |
| `callIt` | `speaking` or `choosing` | Calls `callIt`, computes score and titles, persists unlocks; screen → results (no outcome beat) |
| `restart` | Results screen or error boundary | screen → title, game → null; unlocked titles are kept |

The UI preload integration reports loading before each attempt, ready only after
all required image/font loads succeed, and failed if any required load fails.
The failed Title state offers Retry, which starts a new preload attempt using the
same action. Loading promises/timers remain outside the store; direct UI `setState`
is not sanctioned. In text-only task 12a there are no required room assets or
custom font, so the Title integration reports ready through the named action after
mount. Task 14b replaces the empty preload with required images/font. Reporting
readiness never starts a run automatically.

- The outcome beat shows the sampled branch `line` of the latest `resolve` log entry, with optional authored commentary as secondary text. One-response events use the same flow; their single button is the acknowledgement.
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
- Progress and ending/cuisine identity never rely on colour alone. Text meets WCAG AA contrast.
- No audio in the MVP.

**Share card**

- `share/renderCard.ts` draws a 1200×627 PNG on an offscreen canvas after `document.fonts.ready`, using the same font and sprite atlas as the game.
- Successful results, epilogues, share text and exported cards must name the actual agreed cuisine. A generic decision heading alone is a test failure; unsuccessful results must not call a nomination an agreement.
- The finished card is always shown on the results screen as an `<img>` (blob URL), so long-press save works where download or file sharing is unavailable. The order of share paths follows the task-02 in-app browser probe results (D26).
- Use `navigator.share` with the file when `navigator.canShare({ files })` is true. Otherwise offer a download plus copy-to-clipboard. If the clipboard is blocked (common in in-app browsers), show the share text in a selectable box.

**Art assets**

- The room is composed on a 16 px grid and exported as one flattened PNG; characters are 16×24 px frames with idle (2 frames), react-positive, react-negative and enter.
- One shared palette of at most 16 colours, saved as `art-src/palette.gpl`.
- All sprites in one atlas no larger than 2048×2048; all deployed image and font bytes total at most 400 KB, including the static OG image and any icons. JSON/JS are accounted separately; exported share cards are generated at runtime, not deployed assets.
- Every asset is listed in `public/LICENSES.md` with source, author and licence before it is committed, including original art. Original human-created assets, CC0 office tilesets and OFL fonts are approved source classes; choose and document a specific source without another permission step. Other licences/sources require review. Keep editable sources and licence texts.

**Persistence**

- localStorage stores unlocked titles only. Read tcbae:v2:titles as the lunch
  collection and tcbae:v1:titles as a separately labelled launch collection.
  Never write/delete v1 or map its awards into lunch unlocks. The twelve active
  slots use only the v2 catalog. Keep separate legacy/current ID types/catalogs.
- Parse/deduplicate recognized entries independently, preserving raw v1 bytes and
  unknown legacy data unchanged. Each storage acquisition/read/write is try/catch.
- A failed v2 read suppresses writes for that store instance; new awards remain in
  memory. Missing/corrupt readable v2 may be replaced. Failed writes never block play.
  A failed v1 read does not prevent readable v2 use. No migration marker or stored
  run is needed: archival is read-only, repeatable and has no copy/delete transaction.
- Store integration reads both collections and writes only new lunch unlocks;
  restart retains both. Test old-only/new-only/both, unknown/duplicate/malformed
  values, independent read failures, blocked storage and failed writes.

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
| Content validation | part of `pnpm test` | 07a | Complete synthetic fixture packs pass structural validation; playable packs pass authored validation; live pack/catalog added in 07b; lunch validation in L05 and activation in L08 |
| Simulation invariants | `pnpm sim:ci` | 08a | No crash, illegal state or nondeterminism, ever |
| Simulation balance | `pnpm sim:ci` | Diagnostic from 09/L11; mandatory once task 10/L12 completes | 2,000 fixed seeds × 7 policies meet every design acceptance criterion; the efficiency-floor deviation is reported as a diagnostic (D25) |
| End-to-end | `pnpm e2e` | Shell smoke 02; meeting loop 12a (lunch replacement L08); full-run paths 12b/L13; share and collection 15/L13 | All specs pass on Pixel 7 (Chromium), iPhone 14 (WebKit) and desktop Chromium, with no console errors |
| Full simulation | `pnpm sim -- --runs 10000` | Before each release | Same criteria at 10,000 runs; efficiency floor calibrated (D25); summary committed to `docs/sim/` |

**Lunch task mapping and editorial evidence.** L01 approval changes the target
contracts, not the currently running gates. L03/L04 add fixture-based outcome/rule
checks alongside legacy tests; L05 adds lunch content validation; L06 storage
failure tests; L07 isolated presentation checks; L08 activates lunch and replaces
only the explicitly obsolete assertions described below. No gate is deactivated.
L10 completes 08b reporting; L11 completes 09/seven policies; L12 completes 10 and
activates mandatory balance. L13 retains separate 11b/12b/13/14a/14b/15 PRs and their
full-run/stage/share checks. L14 retains 16/17 release requirements.

L02/L02b are documentation tasks: require complete content/branch catalogs,
writing-review coverage/change log, factual/length checks and Harry's D18 approval
before L05/L06/L07 consume the table. L09 is the approved separate human lunch
playtest prerequisite for L12 and polished art; it does not complete original
12a V4. AI editorial review cannot substitute for L09 or the five-person release
test. See the design for those approved pass criteria; no statistical humour gate
or new automated threshold is invented.

Do not merge gameplay tuning failures once the balance gate is mandatory.

**What the unit tests MUST cover**

- Six approved lunch score examples and P=99/100, cost floor/reference, null/tied
  quality, close exact utilities, cancel at minute zero and rate-independent score.
- Nomination-only setting, success recording/displaying the actual cuisine, invalid
  P=100/null cuisine, no agreement on failure, deadline equality/overshoot and join
  on a completing response. No release API; unique/nondecreasing attendance 6–8.
- Every branch's eligibility/clamping/billing/queue; expected q before sampling,
  same q on different rolled results, exact RNG vectors and rejection, no RNG
  consumption by preview, enumeration vs resolution, duplicate/stale input guards.
- First-two substantive/negative guards, n+2 callbacks, no chains/collisions,
  early endings, invitation before/after arrival and every reachable new variant.
- Authoritative counters, title thresholds/reachability, cuisine-aware epilogues,
  truthful deduplicated commentary and archival/current persistence failure matrix.
- Engine rules/goldens use fixture packs; only content-validation asserts live tuning.

**Property tests (fast-check, random seeds and valid choices)**

- P stays 0–100; minutes/person-minutes never decrease; attendance stays unique
  6–8 and never decreases. Nomination stays fixed; agreement exactly matches success.
- End within 50 resolutions: at most 17 unique base families + three callbacks +
  30 two-minute fillers; no artificial turn-cap ending. All playable response
  branches take 1–10 minutes. Test exhausted pools and both outcome branches.
- Same revision/seed/actions gives byte-identical state; functions never mutate
  deep-frozen inputs. Scores are integers 0–1,000; success Outcome > failure Outcome.

**Goldens and approved obsolete-criterion replacements**

Keep at least five frozen-fixture recorded runs, covering cancellation, success,
timeout, callback and early Call it; add both seeded response branches and
invitation/cuisine scenarios. Old risk/release goldens remain in Git history, not
as a second shipped engine. L03–L07 preserve legacy tests; L08 explicitly replaces
risk/release state/formula tests, thirteen release-absence scenarios, risk-tier
copy and fixed-response preview obligations with the named checks above and the
[approved replacement matrix](lunch-redesign-plan.md#explicitly-approved-acceptance-replacements).
No wholesale snapshot blessing; explain each changed fixture. Live tuning must
not change frozen goldens. Current sim summaries are live-content regressions.

**End-to-end specs**

- Start → nominate → resolve → results/replay by touch and keyboard. Show the actual
  cuisine on success and no agreement on failure; titles/score/cost/time remain.
- Resolve, invite a new adult, then Call it; cancellation before a resolution is
  separate. No release control or numeric choice-preview leakage, including ARIA.
- Both seeded outcomes, explicit acknowledgement/outcome beats, double-input
  protection, disabled reasons, focus/live regions and 320 px layout/44 px targets.
- Reload preserves separate current/legacy collections and never rewrites v1.
- Share fallback keeps selectable text when clipboard blocked; generated image is
  visible and names the actual cuisine on success. Reduced motion is instant.
- Preserve all unaffected shell/probe checks and console-error rejection.

**Manual release checklist**

- [ ] LinkedIn in-app browsers on iOS and Android load, play and share. ADR 0002's
      earlier Android evidence deferral is not a release pass.
- [ ] Safari iOS, Chrome Android, desktop Chrome/Firefox/Safari.
- [ ] Lighthouse mobile Performance ≥85, Accessibility ≥95.
- [ ] Five-person lunch playtest meets the design's ≥4/5 goal/classification bar,
      records two-second headline/uncertainty observations, duration/replay interest.

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
   getResponseOutcomes, getDrawCandidates, score and earnedTitles.
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
- Event content is transcribed from docs/content-table.md after its D18 approval; unchanged launch tests/provenance use docs/content-table-launch.md during L02–L07. Do not invent event design in code PRs.

## Never

- Add an unapproved direct dependency, CDN script, custom tracker or cookie. The explicit dependency allowlist and page-view Analytics are approved.
- Weaken/skip a test or lower a threshold to go green.
- Edit pnpm-lock.yaml by hand, rewrite an accepted ADR, or edit CI to pass.
- Change a scoring formula without Harry's approval.
- Commit an asset without a LICENSES.md entry, or AI-generated final art.

## Stop and ask when

- A locked choice looks wrong, the docs conflict or are silent on a needed rule,
  a gate can't pass.

## Plan maintenance

Follow docs/implementation-plan.md. Before implementing, identify the current task and any split.
Update that plan after each task with completed work, actual check results, outstanding issues
and the next task. Read docs/content-table.md when it exists; it is created in task 06b.
Stop at the task boundary requested by Harry.

## Lunch redesign handoff

ADRs 0005–0008 were accepted on October 13, 2026; their rules/formulas do not
need repeat approval. The design and tech spec define the lunch target; L03–L07
preserve launch behavior during preparation and L08 performs the live switch.
L02 authors the complete table; L02b performs the dedicated AI adult workplace
humour/writing review before Harry’s D18 content approval. Successful results
must name the actual agreed cuisine. Harry accepted original 12a V4 on October 15, 2026; individual tester reports
remain unsupplied. L09 is the separate lunch playtest prerequisite.

## Review size preference

Harry explicitly accepted keeping PR #4 and larger future PRs on October 11, 2026.
Keep one blueprint task per PR and use understandable commits; a large diff alone
does not require splitting into multiple PRs or asking for approval.
```
