# This Could've Been an Email — Implementation Plan

Status: D01–D26 remain resolved. Tasks 01–03 complete. Task 03 contracts/RNG and the core coverage gate are verified locally and in hosted CI. Task 02 Android evidence remains explicitly deferred (ADR 0002). Next task: 04. No task 04 gameplay implementation has started.

## Purpose and source of truth

Build the complete Friday Launch Meeting MVP defined by [Design Doc v2](design-doc-v2.md) using the architecture and delivery rules in the [Technical Spec](tech-spec.md). This plan sequences the work; it does not amend either document or authorize exceptions.

Precedence, architecture rules and the gate schedule are defined only in the technical spec (How to use this spec; Testing and quality gates). This plan links to them rather than restating them (D22). Use the technical spec's engine signatures and types, pnpm commands, portrait-based release interaction, meeting turn flow and DOM room stage (D16) where older design examples differ.

The repository is now at `C:\dev\meeting-sim`, outside OneDrive. The three source documents were moved into `docs/` as their only copies (D22, D23). Scaffold-time locked-major availability was verified against official release pages and the npm registry. Hosting, gameplay, assets and balance remain unverified.

Deliver one static, mobile-first game: one-tap start, six initial attendees, one room, 17 base events plus callbacks/absence variants, deterministic choices, four endings, twelve collectible titles, share image/text, and a reproducible seven-policy simulation harness. No accounts, backend, audio, movement, multiplayer, additional scenarios, setup menus, daily mode, practice mode, leaderboards, or AI dialogue.

## Resolved implementation decisions

D01–D26 are settled. [ADR 0001](adr/0001-stack.md) is the single decision register.
The technical spec remains the source of normative rules. Numerical balance is unverified.

## Delivery sequence

Each numbered task is a blueprint task and a candidate PR. Before code, state its source section, touched files, and any rule it strains. If the proposed diff exceeds ~400 changed lines, present a split before implementation, using suffixes such as 03a/03b. This table describes scope boundaries, not permission to exceed the limit. Each split retains relevant tests and its own acceptance evidence.

Create the repository at `C:\dev\meeting-sim` (D23) and move the three documents into `docs/` as their only copies (D22). Keep this plan synchronized with ADRs.

| Task | Deliverable and principal files                                                                                                                                                                                                                                                  | Depends on      | Completion evidence                                                                                                                                                                                                |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 00   | D01–D12 reconciliation recorded in these three documents.                                                                                                                                                                                                                        | —               | Complete.                                                                                                                                                                                                          |
| 00b  | Architecture review revisions (D13–D26) applied to all three documents.                                                                                                                                                                                                          | 00              | Complete, October 8, 2026.                                                                                                                                                                                         |
| 01a  | Repository and document home: create the repo at `C:\dev\meeting-sim`; move the documents into `docs/` as `tech-spec.md`, `design-doc-v2.md` and `implementation-plan.md`; write `docs/adr/0001-stack.md` listing D01–D26; add `CLAUDE.md` (the spec's drop-in) and `AGENTS.md`. | 00b             | Repo outside OneDrive; exactly one copy of each document; ADR 0001 lists every decision; document consistency check passes.                                                                                        |
| 01b  | Tooling scaffold: `.nvmrc` (fnm on Windows), `package.json`, pnpm lock, TS/Vite/Tailwind/ESLint/Prettier configuration, `scripts/checkSize.ts`, minimal React shell.                                                                                                             | 01a             | Locked majors verified; direct dependencies match the allowlist exactly; import-boundary and banned-API lint rules exist and fail on a seeded violation; gates scheduled for 01b are active.                       |
| 02   | Test and CI infrastructure: Vitest + fast-check, Playwright config, `.github/workflows/ci.yml`, shell E2E smoke. LinkedIn capability probe page on a Vercel preview (V1).                                                                                                        | 01b             | CI uses the frozen lockfile and publishes reports; probe results for LinkedIn on iOS and Android recorded in an ADR.                                                                                               |
| 03   | Contracts: `src/core/engine/{types,constants,rng,index}.ts`, condition helpers, `fixtures/` packs, colocated tests.                                                                                                                                                              | 01b             | Types match the spec (D14); only `index.ts` imports content (D13); RNG vectors and per-turn stream tests; exact weighted-selection formula; constants centralized.                                                 |
| 04   | State transitions and shared evaluator: `state.ts`, `resolve.ts`, `applyEffect`, typed errors, log and decision records; core property tests.                                                                                                                                    | 03              | Starting six, legal releases, owner protection, integer person-minutes, booking changes, end priority, clamping, invalid actions and immutability tested on fixture packs; counters authoritative (D15).           |
| 05   | Utility, score and titles: internal `value.ts`, `score.ts` (with `formatCost`), `titleRules.ts`, score fixtures.                                                                                                                                                                 | 04              | Six exact worked examples; rate-independent scores; all boundaries and title predicates verified.                                                                                                                  |
| 06   | Event selection and callback scheduler: `draw.ts`; at least five fixture goldens (D21).                                                                                                                                                                                          | 03, 04          | Weighted eligibility, unseen-family rules, fairness, callbacks, idempotent pending draw and filler fallback tested; goldens cover cancellation, clean success, risky success, timeout, and callback plus absence.  |
| 06b  | Content table `docs/content-table.md`: all 17 families × variants × responses, the 3 callback events, filler and epilogues. Design task; runs in parallel with 03–06.                                                                                                            | 00b             | Every response has technique, requires, minutes, progress, risks, callback, label and line; a hand check shows a sensible player can reach P = 100 in about 10 turns within 60 minutes; Harry's approval recorded. |
| 07a  | Content validator and content index.                                                                                                                                                                                                                                             | 04–06           | `validateContent` rules implemented and tested on valid and invalid fixture packs.                                                                                                                                 |
| 07b… | Live content: `src/core/content/attendees.ts`, `events/*.ts`, `titles.ts`, `copy.ts`, transcribed from the content table in event-group PRs.                                                                                                                                     | 06b, 07a        | Every content-table row implemented; `validateContent` passes on the live pack.                                                                                                                                    |
| 08a  | Minimal simulation runner with Greedy and Random (balance diagnostic only).                                                                                                                                                                                                      | 07b…            | V3 balance smoke reported: win rates against bands, Greedy median turns, P = 100 reachability.                                                                                                                     |
| 11a  | Store: `src/store/gameStore.ts` with the beat machine and complete action list (D17), `persistence.ts`, store tests.                                                                                                                                                             | 07b…            | Action table behaviour tested; double input ignored; restart keeps unlocked titles; failure-safe persistence.                                                                                                      |
| 12a  | Text-only meeting loop: Title, Meeting and Results screens with no art or animation; meeting-loop E2E.                                                                                                                                                                           | 11a             | Start → results playable with touch and keyboard at 320 px; V4 playtest (Harry + two people) recorded; findings fed back into the content table.                                                                   |
| 08b  | Full runner, metrics and CSV: `sim/run.ts`, `sim/report.ts`, seed ranges, argument validation.                                                                                                                                                                                   | 08a             | CLI runs without browser imports; stable CSV schema; reproducible reports.                                                                                                                                         |
| 09   | Remaining policies: `sim/policies/{lookahead,reckless,timebox,fastest,park}.ts`.                                                                                                                                                                                                 | 08b             | Documented tie-breaks, fallbacks and releases; no seed peeking; deterministic for fixed inputs. Split policy families into small PRs.                                                                              |
| 10   | Balance: content and constants tuning, `docs/sim/`, charts, efficiency-floor calibration.                                                                                                                                                                                        | 09, 12a         | Acceptance matrix passes at 2,000 seeds with Greedy spread measured among wins (D20); floor calibrated (D25); core coverage met; before/after results in every tuning PR.                                          |
| 11b  | Store completion: results computation, title unlocking and persistence edge cases, error-boundary recovery.                                                                                                                                                                      | 11a             | All endings reach results; fresh starts clear run data and keep titles.                                                                                                                                            |
| 12b  | Full accessible UI: HUD, roster with release confirm, typing dialogue, meters, keyboard, reduced motion; full-run E2E paths.                                                                                                                                                     | 11b             | In `choosing`, every enabled response shows its preview numbers and every disabled one its content reason; full-run and early-ending E2E pass.                                                                     |
| 13   | Art: `art-src/`, sprite atlas, flattened room PNG, font, `public/LICENSES.md`.                                                                                                                                                                                                   | 01a             | Approved sources, editable originals, 16-colour palette, complete animations, licensed self-hosted font, asset budget met.                                                                                         |
| 14a  | Stage spike with placeholder sprites: `stage/RoomStage.tsx`, `reactions.ts`, `stage.css` (V2).                                                                                                                                                                                   | 12a             | Crisp at 1–3× on a mid-range phone; `reactionsFor` unit-tested on state pairs; JS budget measured.                                                                                                                 |
| 14b  | Final room stage with real art and asset preload.                                                                                                                                                                                                                                | 12b, 13, 14a    | Reactions match state changes; reduced motion stops idles; no text in the stage; budgets pass.                                                                                                                     |
| 15   | Results, collection and share: results components, title grid, `ui/share/{renderCard,shareText}.ts`.                                                                                                                                                                             | 02, 05, 10, 14b | Correct epilogue, title and moment; unlocks persisted; 1200×627 PNG shown as an `<img>`; share paths ordered by V1 results; fallbacks verified.                                                                    |
| 16   | Integration and mobile quality: E2E suite, polish, error recovery, accessibility, performance, five-person playtest.                                                                                                                                                             | 10, 12b–15      | Every gate except the release-only full simulation active and green; playtest pass bar met (Milestone E, step 5).                                                                                                  |
| 17   | Static deployment and launch: `vercel.json`, metadata and OG image, preview and production settings, `docs/release-checklist.md`, blog draft.                                                                                                                                    | 16              | Full 10,000 × 7 simulation, real-device checks, Lighthouse and LinkedIn preview verified; release tag; launch-ready blog with measured results.                                                                    |

Critical path: 00b → 01a/01b → contracts and transitions (03–06) → live content (07) → vertical slice (08a, 11a, 12a) → policies and balance (08b–10) → full browser game (11b–15) → integrated quality → release. The content table (06b) and art (13) run in parallel from the start. Neither polished art nor distribution work should hide a failing balance gate.

## Milestone A — Reproducible foundation (00–03)

**Gate activation:** defined only in the tech spec's schedule table (Testing and quality gates; D10, D25). Each task adds its own gate in the same PR as the capability it checks; never deactivate an active gate.

- Create the repository at `C:\dev\meeting-sim`, outside OneDrive, and move the three documents into `docs/` (D22, D23). On Windows, install Node with fnm, which reads `.nvmrc`.
- Copy the spec's assistant rules into `CLAUDE.md`; `AGENTS.md` contains `Follow CLAUDE.md.`. Preserve the documented precedence and stop conditions.
- Pin Node 24 in `.nvmrc`/engines and pnpm in `packageManager`; generate the lockfile with pnpm. If a locked major cannot be installed or is incompatible, bring evidence to Harry rather than silently substitute.
- Enable all five mandated TS flags. Enforce import direction, engine public exports, no `Math.random`, no core DOM/Date/timer/I/O access, and code-style constraints. Treat the required ESLint JS configuration as tooling, not application JS source.
- Expose the locked scripts: `dev`, `build`, `preview`, `typecheck`, `lint`, `test`, `sim`, `sim:ci`, `e2e`, `size`, `check`. Do not label an unimplemented gate successful.
- Implement the tech spec's Supporting types exactly (D14), the `ContentPack` injection pattern and fixture packs (D13). Counters are authoritative; the log is narrative (D15). Use additive state fields where needed; never rename locked fields.
- Implement/document the spec's cyrb53-to-32-bit conversion and mulberry32 behavior with fixed test vectors. Seed draw turn n from `${seed}:draw:${n}`; implement the spec's exact weighted-selection formula.

Exit: a fresh checkout installs reproducibly; the approved foundational checks run; later tasks have stable contracts and no unresolved setup dependency.

## Milestone B — Complete headless game (04–07, with 06b)

The headless game must be playable to completion before the room stage is built.

1. `initialState` creates P=0, R=0, minute=0, bookingEnd=60, zero person-minutes and the six starting attendees. The store will create the 16-hex-character seed; the core receives it.
2. `drawEvent` sets `current` using eligible unseen events, rarity × event weighting, callbacks, and approved fairness precedence. Repeated draw calls must not reroll an unresolved event. Filler is repeatable and adds two minutes.
3. A shared pure evaluator resolves conditions and effective changes. `resolve` validates the current response, applies one effect with all clamping in `applyEffect`, records the pre-choice valuation/quality and log, clears the pending event as appropriate, schedules callbacks, advances the turn, and checks endings.
4. Success takes precedence when progress and booking expiry occur together. `callIt` distinguishes cancelled from called-early by whether any event resolved. `release` costs no time, records its turn/minute, and follows the approved occupancy/owner rules.
5. The internal `value` considers only legal responses at the actual decision state, including changes after a release. Decision quality is fixed when chosen; later attendance/risk changes cannot rewrite past scores.
6. `score` derives Outcome/Efficiency/Decisions from canonical state. Use 360/90 person-minute reference/floor and Δpm/6 utility cost; round each component, then sum. Display dollars never feed scoring or rate-sensitive title thresholds.
7. Unlock every earned title, select the approved display priority/fallback, and choose a deterministic moment from recorded facts. Do not claim “Gary revisited twice” unless the run log supports it.

Content checklist:

- Noise: `hdmi`, `tv-no-signal`, `room-booked`.
- Tangents: `intros`, `scope-revisit`, `unrelated-q`, `another-meeting`, `circle-back`.
- Substantive: `where-we-stand`, `support-training`, `failing-tests`, `press-date`, `p1-bug`.
- Escalations: `legal`, `vp-joins` (all response paths add their one designated person).
- Gifts: `pre-read`, `aligned`.
- Add callback events and expert-absent variants with explicit family/no-repeat semantics. Releasing an expert must visibly remove useful options without deleting all evidence of the underlying issue.
- Every response includes its technique, label, fixed effect, resulting line and any disabled reason. Transcribe every response from the reviewed content table (task 06b, D18); code PRs do not author new event design.
- Validate unique IDs, event filenames, all references, 1–3 responses, minutes 0–10, progress −10…+25, risks −1…+1, and attendance safety. Validate zero minutes only for email; callbacks always take at least one minute. Enforce dialogue/epilogues/moments ≤90, labels ≤24, collectible titles ≤28 and role titles ≤48 Unicode code points.
- Add reachability/condition checks beyond syntax: callbacks have targets, variants are selectable, no duplicate attendee joins, and no event can strand the player with no legal response.

Exit: complete rules/content, exact score fixtures, deterministic end-to-end headless runs and documented decisions for all mechanics used.

## Milestone B2 — Vertical slice (08a, 11a, 12a)

Get evidence on the riskiest assumptions before building the remaining policies and tuning (D19).

- 08a runs Greedy and Random over the live content with a minimal runner. Report win rates, median score, Greedy median turns and how often P = 100 is reached (V3). Results are diagnostic.
- 11a and 12a build the real store and a deliberately plain, text-only meeting screen. They are the first PRs of tasks 11 and 12, not throwaway work.
- Harry plays several runs, then two other people play without coaching (V4): can they state the goal within 15 seconds and tell a tangent from a substantive issue?
- Findings go back into the content table before tuning starts; record them in the task 12a PR.

Exit: the game is playable end to end in text, and V3 and V4 results are recorded.

## Milestone C — Evidence that the game is balanced (08b–10)

Define policies before tuning. Use identical fixed meeting seeds for comparisons, deterministic tie-breaking, and a separate seeded policy RNG for Random. Policies use only information available under their documented strategy; Lookahead must not peek at the next deterministic draw through the run seed. Specify how its two-turn expected value accounts for conditions, callbacks and release decisions.

Implement the design’s exact policy semantics and fallback/tie-break order. Greedy, Reckless and Lookahead release Gary/Jordan before the first draw and retain experts; other policies never release; none calls it early. Reckless uses zero risk weight. Lookahead maximizes immediate utility plus probability-weighted best next utility without seed peeking. Random uniformly samples enabled responses from its separate policy stream. Do not optimize a policy after seeing evaluation seeds without reporting the change.

Each CSV row includes seed, policy, P, R, T, person-minutes, display C, peak H, scored-decision count, average q, all score components/total, ending and display title. Include release/action traces or replay references for failures. Summaries include win rate, median score, score standard deviation, median turns, event coverage, technique shares and Lookahead fifth-percentile cost, with precise denominators. Preserve configuration/content revision and seed range alongside reports.

| Metric            | Required release result                                                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lookahead         | Wins 85–95%; median score 850–950                                                                                                                                                           |
| Greedy            | Wins 70–85%; median 750–850; score standard deviation ≤120 among successful runs (D20)                                                                                                      |
| Reckless          | Wins 60–80%; median at least 50 below Greedy                                                                                                                                                |
| Always-timebox    | Wins 40–60%; median at least 100 below Greedy                                                                                                                                               |
| Always-fastest    | Wins 30–50%; median at least 100 below Greedy                                                                                                                                               |
| Always-park       | Wins <20%; median <400; applicable single-rule gap ≥100                                                                                                                                     |
| Random            | Wins 20–35%; median <450; no additional Greedy-gap criterion                                                                                                                                |
| Run duration      | Median 9–12 resolved turns across all Greedy runs                                                                                                                                           |
| Event coverage    | Each of 17 base families in ≥5% of Random runs; scenario tests cover variants/callbacks                                                                                                     |
| Technique variety | No technique >40% of Greedy selections having ≥2 enabled responses; exclude acknowledgements/releases                                                                                       |
| Efficiency floor  | 90 person-minutes within 10% of successful Lookahead runs’ nearest-rank fifth-percentile person-minutes; calibrated at the end of task 10 and before release, diagnostic on other PRs (D25) |

Run `pnpm sim:ci` for 2,000 fixed seeds × seven policies, then `pnpm sim -- --runs 10000 --policy all` for the release evidence. Ensure the locked release command without `--policy all` also defaults to all seven. Tune only allowed constants/content with before/after summaries. Do not change formulas, policy definitions, denominators or thresholds merely to make a report pass.

Test suite:

- Six worked examples produce 923, 695, 680, 421, 217 and 0 exactly, including their component values.
- Boundary tests cover P=99/100, R=0/5, cost floor/reference, cancellation, no scored choices, equal utilities, disabled responses, all title thresholds and simultaneous ending triggers.
- Property tests (added in tasks 04–06) deep-freeze inputs, check monotonic minute/person-minutes, bounded P/R, integer scores 0–1000, successful Outcome above failed Outcome, JSON determinism and termination within 50 turns.
- Test draw eligibility and fairness against generated valid states and approved callback edge cases, not only favorable fixtures.
- Golden runs live in task 06 on frozen fixture packs (D21); tuning does not change them. Live-content regressions are tracked by the committed sim summaries.
- Produce blog charts with existing allowed tools or a dependency-free generator; adding a plotting package requires approval. Report results as measured, not as the design targets.

Exit: full content passes approved 2,000-seed gates, the pure core meets coverage, and tuning evidence is reproducible. A failing target is a product decision or tuning task, never a reason to weaken CI.

## Milestone D — Browser game, room and results (11b–15)

Store and UI:

- Use a vanilla Zustand store plus narrow React selectors. Only the store invokes browser-side state-changing engine functions, including draw and Call it. Implement the spec's Meeting turn flow (D17) exactly; its action table is the complete action list. Keep title/loading/presentation screen state separate from the engine's locked `running | ended` phase.
- Generate each fresh seed with one `crypto.getRandomValues` call. No seed/debug controls are shown to players. Prevent duplicate resolution from rapid clicks, keyboard repeats or stale choice handlers.
- Keep pending dialogue and single-response presentation outside core state transitions as approved. Reading, typing, animation and frame rate never advance meeting minutes. Show progress, time, cost, risks, roster and parking-lot information from canonical state.
- Distinguish parked-item count from open risks: parking a tangent can increment a title counter without adding risk. Reflect release restrictions and disabled response reasons immediately.
- Provide Title, Meeting and Results screens without a router. Explain the Friday decision objective immediately; use one Start action and an obvious replay action.
- Use the versioned `tcbae:v1:titles` key only. Validate/deduplicate stored IDs; missing, corrupt or blocked storage never prevents play. Persist all unlocked titles, not only the displayed title.
- Add the top-level error boundary with a new-meeting recovery action. Verify fresh starts clear run data while retaining title unlocks.

Art and stage:

- Source the room through an approved licensed tileset or original art; hand-draw final characters. Commit source/author/licence entries before assets. No generated final art. There are exactly eight characters; no additional attendees are needed.
- Use the shared ≤16-colour palette, 16 px room grid, 16×24 character frames, two-frame idle plus positive/negative reactions and enter/leave animations. Export a single sprite atlas ≤2048×2048 and one flattened room PNG. Validate relative atlas and room-image references in the built preview; public assets keep stable revalidated URLs.
- Render the room at 320×240 logical pixels, scaled by an integer factor with pixelated CSS (D16). All words and input stay in `ui/`; the stage is read-only and implements `RoomView`.
- Preload the room PNG, sprite atlas and font after the title paints. Start shows “Booking the room…” until they are decoded; provide an actionable retry on load failure.
- Unit-test `reactionsFor` on state pairs. In the browser, verify enter/leave/nod/sigh, parking pulses and celebration match state transitions, and that reduced motion stops idles.

Accessibility and presentation:

- Below 640 px, stack HUD/room/dialogue/choices; at wider sizes, use integer stage zoom up to 3× and the specified dialogue overlay. Respect safe-area insets; no horizontal overflow at 320 px.
- Use ≥44×44 targets and ≥16 px mobile dialogue; keyboard 1–3 selects enabled choices and Enter completes typing. Move focus to the first available choice after it appears. Announce each full line once through the hidden live region (D26).
- Type at 40 characters/second with tap-to-complete; animate meters over 400 ms. Reduced motion makes dialogue instant and removes shake/motion; gameplay results stay identical.
- The stage container has `role="img"` and an attendee description; risk/progress include labels, numbers and icons. Check AA contrast for every text/background combination.

Results and sharing:

- Show ending-specific copy, total and component scores, minutes, cost, peak headcount, open risks, factual moment and the twelve-slot collection with locked silhouettes.
- Render a 1200×627 PNG using the local font/atlas after `document.fonts.ready`. Always show the card as an `<img>` for long-press save, and order share paths by the task 02 probe results (D26). Inspect the longest title and moment at actual export size; keep text within the card and preserve sharp sprites.
- Offer download and copy text; use file sharing when `navigator.canShare({ files })` supports it. Handle user cancellation without presenting a game failure. Clipboard rejection/unavailability reveals selectable text; image/download failures retain usable share text.
- Use the production URL in share text and static OG metadata; do not embed seeds or promise that different runs have identical difficulty.

Exit: a complete polished run/replay works with real assets, all four endings and share fallbacks; permanent gates pass on the integrated build.

## Milestone E — Release verification (16–17)

Automated requirements once every gate in the tech spec's schedule is active:

- `pnpm check`: types, zero-warning lint/format, unit/property/golden/content tests and 2,000×7 simulation. Core coverage ≥90% lines and ≥85% branches.
- `pnpm build && pnpm size`: all JS ≤120 KB gzip, shared and lazy chunks included; deployed images plus font ≤400 KB. The 400 KB budget includes the static OG image and icons; generated share images are not deployed bytes.
- `pnpm e2e`: Pixel 7 Chromium, iPhone 14 WebKit and desktop Chromium, with no console errors. Use the built preview, not only the dev server.
- Required E2E paths: first-choice full run to titled results; resolve an event, release someone, then Call it to earn Let's Take This Offline; blocked clipboard fallback; reduced-motion instant dialogue. Calling it before any resolution must separately produce Cancelled.
- Add targeted integration coverage for stage reactions, rapid-input safety, blocked persistence, all endings, keyboard navigation and replay reset. Do not add brittle tests that merely duplicate component implementation.

Release-only requirements:

1. Run 10,000 seeds per policy; commit summaries under `docs/sim/` and retain full CSV/replay artifacts. Calibrate the efficiency floor first (D25). All approved acceptance criteria still pass.
2. Test real LinkedIn in-app browsers on iOS and Android for load/play/share. Playwright mobile emulation does not satisfy this requirement.
3. Check Safari iOS, Chrome Android and desktop Chrome/Firefox/Safari. Record device/browser/date, result and defects. Missing device access is an outstanding release item, not a pass.
4. Run Lighthouse mobile against the preview URL: Performance ≥85 and Accessibility ≥95. Check screen-reader announcements, keyboard focus and reduced motion manually.
5. Playtest with five people: observe comprehension within 15 seconds, tangent-versus-substantive recognition, 2–3-minute run duration and replay interest. If the distinction is unclear, apply the design's “!” fallback and retest comprehension. Pass bar: at least 4 of 5 players state the goal unprompted and classify one tangent and one substantive event correctly.
6. Configure Vercel as a static Vite site (`pnpm build`, `dist`), PR previews and main production deploys. Protect main with required checks and squash merges; no direct pushes. Repository/account access is a setup dependency.
7. Verify actual response headers: immutable fingerprinted `/bundles/` code, revalidated stable public assets/fonts/OG and HTML, the specified CSP, nosniff, referrer and permissions policies. Check that analytics and loading work under that CSP and that no prohibited runtime network requests/cookies appear.
8. Mount Vercel page-view Analytics only; no custom tracking code exists (D26). Verify Open Graph/Twitter tags and 1200×627 static OG image through LinkedIn Post Inspector using the final reachable URL.
9. Prepare the blog with actual simulation charts/results and credited art/process. The “70,000 meetings” claim is usable only after the full seven-policy run. Obtain any needed publishing authorization separately; this plan does not publish anything.
10. Tag `vX.Y.Z` on main only after all automated and manual release evidence passes. Record known limitations and deployment reference; retain the previous deployment for rollback. A rollback does not justify modifying acceptance tests.

## Execution handoff

Start each task by reading the files listed in `CLAUDE.md`. D01–D26 are settled; do not ask Harry to decide them again. Report: task ID, intended behavior, files to touch, estimated diff/split and any unresolved dependencies. Keep one task per branch/PR with a Conventional Commit; list the source section, tests, assumptions and tuning comparison in the PR.

Record progress below by replacing `not started` with `in progress`, `blocked: Dxx`, or `complete: PR/evidence`. “Complete” requires the task's acceptance evidence and the applicable quality gates; documentation planning alone does not validate the game.

| Milestone            | Tasks         | Status                                                  |
| -------------------- | ------------- | ------------------------------------------------------- |
| A — Foundation       | 00–03         | 00, 00b and 01 complete; 02a/b implemented; 02c pending |
| B — Headless game    | 04–07, 06b    | Not started                                             |
| B2 — Vertical slice  | 08a, 11a, 12a | Not started                                             |
| C — Balance evidence | 08b–10        | Not started                                             |
| D — Browser game     | 11b–15        | Not started                                             |
| E — Release          | 16–17         | Not started                                             |

The next action is task 02c: create the Vercel preview using docs/task-02-setup.md and record real iOS/Android LinkedIn evidence in ADR 0002. The next blueprint task is 03 after task 02 acceptance. No later task was implemented.

## Task 01 completion — October 11, 2026

Source sections: technical spec → Repository layout; Project rules for the AI assistant;
Testing and quality gates; Build, CI and deployment. Design → Core loop (shell objective only).

Completed work:

- **01a complete:** initialized Git at `C:\dev\meeting-sim` on `chore/task-01-foundation`;
  moved all three documents to their canonical names; transcribed D01–D26 into ADR 0001;
  removed the duplicate decision table from this plan. Added the spec's CLAUDE.md drop-in,
  explicit instructions to follow/update this plan, and AGENTS.md containing `Follow CLAUDE.md.`.
- **01b complete:** installed Node 24.21.0 with fnm; pinned Node major 24 and pnpm 10.34.6;
  generated pnpm-lock.yaml using Corepack/pnpm. Stable locked packages: TypeScript 6.0.3,
  Vite 8.3.4, React 19.3.0, Zustand 5.0.15, Tailwind 4.3.3 and Vitest/coverage 5.0.3.
  Added strict TS, Vite/Tailwind, ESLint/Prettier, minimal React shell, content-owned copy,
  all locked script names and the deployment-size checker. Fingerprinted output uses `/bundles/`.
- Review split: **01b.1** scaffold/build/scripts and **01b.2** lint enforcement. Generated lockfile
  and document moves are separate from authored code review. No gameplay rules were implemented.
- Added only task 01b's active CI gates now (D25): frozen install, check, build and size.
  Task 02 extends this workflow with test/E2E/report infrastructure; it does not recreate it.

Check results (local Node 24.21.0 / pnpm 10.34.6):

- Document consistency: canonical source documents only; local document links resolve;
  ADR 0001 contains each D01–D26 exactly once; AGENTS.md has the required one-line content;
  CLAUDE.md names the plan/content table and requires progress updates. Passed.
- `pnpm install --frozen-lockfile`: passed, with no lockfile changes. All 24 approved direct
  packages are present and no others; the five mandated TypeScript flags are enabled.
- Seeded ESLint checks: 18 deliberately invalid programs rejected, including import boundaries,
  runtime content imports, stage/store mutation access, core DOM/Date/I/O, Math.random,
  unapproved engine exports, any/casts/non-null assertions/enums/default exports.
  Three legal type/public-helper import examples accepted. Passed.
- `pnpm check`: typecheck and zero-warning lint/format passed. Later gates are excluded by schedule.
- `pnpm build && pnpm size`: passed. All deployed JS totals **68,073 gzip bytes / 122,880**;
  images/fonts total **0 / 409,600 bytes**. No art or font has been added.
- Unit/property/golden/content/simulation/E2E and real-device checks: not activated for task 01;
  not run and not claimed as passed. Their locked script names are reserved for later tasks.

Outstanding issues and handoff:

- No task 01 blocker or new conflict with D01–D26. No accepted decision was reopened.
- fnm was downloaded to ignored `.tools/fnm`; Node is in fnm's user installation directory.
  No permanent PowerShell profile or system Node change was made. Use Node 24 for future checks.
- pnpm blocked esbuild's dependency lifecycle script by default; the build and tsx size checker
  work with the installed platform binaries. No extra lifecycle execution was approved.
- The GitHub workflow is local source only: no remote repository, hosted CI run, PR or deployment
  exists yet. Task 02's preview/probe needs repository/Vercel access and real iOS/Android LinkedIn
  sessions; emulation cannot substitute for the probe.
- docs/content-table.md is intentionally absent until task 06b. The shell uses the existing
  design objective only; no event content was invented.
- **Next task: 02.** Task 01 stops here; no later task is marked complete.

Review note: eslint.config.js exceeds the 300-line SHOULD guideline because it keeps the mandated
per-folder restrictions and resolved-path checks together in the single tool configuration.
The lint review split remains below approximately 400 authored lines; no application file exceeds 300 lines.

## Task 02 result — October 11, 2026

Status: **02a and 02b implemented and locally verified; 02c awaits Vercel setup and
real-device evidence. Task 02 is not fully accepted.** No task 03 work was started.

Sources: technical spec → Testing and quality gates; Build, CI and deployment;
plan task 02; D19/D26 in ADR 0001. No accepted decision was reopened.

Dependency verification:

- Task 01's document consistency and seeded lint checks were previously recorded.
  For this task its frozen-lockfile install, typecheck, lint/format, production build
  and size checks were rerun and passed under fnm Node 24.21.0 / pnpm 10.34.6.
- The 24-package allowlist and lockfile remain unchanged. No extra dependency was added.
- Preserved task 01 as local commit `639be25` before creating `chore/task-02-tests-probe`.

Implemented review splits (each authored code commit under approximately 400 changed lines):

- **02a** (`00497f4`): Vitest/fast-check runner, V8/JUnit reports, deployment-budget tests,
  Playwright configuration and built-shell smoke; pnpm check now includes pnpm test.
  CI caches the pnpm store/browser binaries, installs with the frozen lockfile,
  runs all active gates, and uploads coverage/unit/E2E reports even on failures.
- **02b.1** (`4d6bb24`): approved capability helpers, runtime PNG generation and failure tests.
  Native-share availability, actual success, cancellation and blocked/unavailable APIs
  are recorded separately. No game content, storage, analytics or final art was added.
- **02b.2** (`84b7e2b`): isolated `/probe.html` entry, accessible diagnostic UI, visible
  share image, file/text sharing, clipboard, download and persistent selectable-text fallback;
  browser checks for downloads, absent APIs, blocked clipboard, cancellation and 320 px width.
- **02c handoff:** [Vercel setup and device procedure](task-02-setup.md) and
  [ADR 0002 evidence table](adr/0002-linkedin-capability-probe.md). Harry requested that the
  assistant create GitHub privately and provide Vercel instructions; Vercel was not deployed.

Evidence:

- `pnpm install --frozen-lockfile`: passed; pnpm-lock.yaml unchanged.
- `pnpm check`: typecheck, zero-warning lint/format, and **10 unit/property tests passed**.
  The size-budget helper has 100% line/branch coverage, including exact limits and a
  seeded 25-case fast-check property. Coverage includes all existing core files;
  the core coverage floor activates in task 03, not task 02. Current aggregate coverage
  is 52.56% lines / 71.42% branches; browser-exercised code is not counted in Vitest coverage.
- `pnpm build && pnpm size`: passed; **70,407 / 122,880 gzip JS bytes** across all entries
  and shared/lazy chunks; **0 / 409,600 deployed image/font bytes**. Probe PNGs are generated at runtime.
- `pnpm e2e`: **18 passed** on Pixel 7 Chromium, iPhone 14 WebKit and desktop Chromium.
  Every test rejects browser console errors and uncaught exceptions. No retries or skipped tests.
- Reports exist at `coverage/index.html`, `coverage/coverage-summary.json`,
  `test-results/unit.xml`, `test-results/e2e.json` and `playwright-report/index.html`.
  Fixed Playwright output cleanup to preserve the unit report; reran unit and E2E gates.
  Fixed a redundant variable initialization flagged by ESLint without disabling the rule.
- Simulation, gameplay goldens/content validation and the core coverage floor are not activated
  yet. No simulation/balance or real-device result is claimed.
- Private repository: [hsivasambu/meeting-sim](https://github.com/hsivasambu/meeting-sim).
  Main was initialized from the completed task 01 baseline using a server-side reference;
  no task 02 code was pushed to main. Squash-only merge settings are verified.
- Draft [PR #1](https://github.com/hsivasambu/meeting-sim/pull/1) targets main.
  Hosted [quality run](https://github.com/hsivasambu/meeting-sim/actions/runs/38174153522)
  passed on code commit `0989b78`. Downloaded and verified the published quality-reports artifact: 10 unit tests with zero failures/errors; 18 E2E passes, zero skipped/unexpected/flaky; coverage and Playwright HTML reports present. Artifact size: 361,651 bytes. An initial Vite-config formatting failure was corrected without changing any gate.

Initial outstanding acceptance items (superseded by follow-ups below):

- **02c / V1:** Harry creates the Vercel project, supplies the preview URL/commit, and records
  real iOS/Android LinkedIn outcomes in ADR 0002. All real-device rows remain Not run.
  API checks and mobile browser emulation do not satisfy this requirement.
- GitHub returned HTTP 403 when enabling main-branch protection for this private repository:
  “Upgrade to GitHub Pro or make this repository public to enable this feature.”
  The repository remains private as requested. Required-check/PR-only protection is
  not enforced; account support for that feature must be resolved. No threshold or
  repository visibility was changed to work around the restriction.
- The PR remains draft and unmerged while manual acceptance/protection is outstanding.
  No final sharing-order decision has been made from mocked APIs.
- **Next action: finish task 02c. Next blueprint task: 03 (contracts/RNG), after the task 02
  handoff is accepted.** Stop at task 02; no later task has been implemented.

## Task 02c hosting follow-up — October 11, 2026

- Harry created the Vercel project and supplied the [probe preview](https://meeting-e9pihcccd-hsivasambus-projects.vercel.app/probe.html)
  and [main deployment](https://meeting-qzacf1hfe-hsivasambus-projects.vercel.app).
  Deployed source commit remains unverified.
- Harry reported a LinkedIn redirect to Vercel login. Anonymous verification returned
  HTTP 302 to Vercel SSO. Neither iOS nor Android capability outcomes are established.
  Setup instructions and ADR 0002 now record this blocker.
- Harry explicitly authorized GitHub public visibility. Verified PUBLIC; the earlier
  private-repository protection restriction is resolved. Main requires pull requests
  and the strict `quality` check, including administrators; linear history is required,
  force pushes/deletions are disabled, and only squash merges are allowed.
- Changes are documentation only: setup instructions, pending probe evidence and this
  plan. No application, test, threshold or accepted decision changed.
- Next action: disable Vercel Authentication in the project's Deployment Protection,
  Save, verify anonymous preview access and its source commit, then repeat the probe
  on real iOS and Android LinkedIn browsers. Task 02 awaits manual acceptance;
  PR #1 stays draft and unmerged. Next blueprint task is 03 only after acceptance.

- Follow-up checks: document links, D01–D26 register and assistant-rule consistency passed;
  Prettier formatting and git diff whitespace checks passed. No code gates changed.

## Task 02 closure — October 11, 2026

Status: **Complete and accepted by Harry, with Android evidence explicitly deferred.**

- Harry reports all real-device LinkedIn probe tests passed on iOS and requests closure.
  Model, OS/LinkedIn versions, raw report and exact tested commit were not supplied;
  [ADR 0002](adr/0002-linkedin-capability-probe.md) records user-reported results and limits.
- Harry has no Android device and explicitly directed proceeding with that risk.
  Android is Not tested, not passed. The evidence exception does not change an automated
  gate or the technical spec's two-platform manual release checklist.
- Anonymous preview verification returned HTTP 200, resolving the Vercel login blocker.
  Repository visibility PUBLIC and main protection were verified in the prior follow-up.
- Hosted [quality check](https://github.com/hsivasambu/meeting-sim/actions/runs/38175379739)
  passed on bfd0918; Vercel reported successful deployment for that PR head.
- Later sharing retains the spec's native-PNG-first capability-based order and all
  download/copy/selectable-text and visible-image fallbacks. Verify real Android before release.
- Remaining risk: unverified Android behavior and limited iOS metadata/build attribution.
  No known implementation defect remains; supplement device evidence when available.
- Closure checks: typecheck, zero-warning lint/format and 10 unit/property tests passed;
  build/size passed (70,407 / 122,880 gzip JS bytes; media 0 / 409,600 bytes);
  all 18 E2E checks passed without retries or skips. Documentation checks follow below.
- **Next task: 03 (contracts/RNG).** Task 02 stops here; no task 03 work was started.

- Document consistency, Prettier and whitespace checks passed for the closure update.
  PR #1 is prepared for review with the iOS evidence and Android risk; it remains unmerged.

## Task 03 result — October 11, 2026

Status: **Implemented and locally verified.** Sources: engine contracts/supporting types,
randomness/determinism, design data model and the technical spec's gate schedule.
No accepted decision was reopened; no task 04 logic or live event content was added.

Dependency verification:

- Task 01b complete; frozen-lockfile install passed with Node 24.21.0 / pnpm 10.34.6.
  The 24-package allowlist and five mandated TS flags were reverified; lockfile unchanged.
- Task 02 was merged as main commit 0935a18. PR #1's final quality check passed;
  task 03 starts from that merged baseline on feat/task-03-contracts-rng.
  Harry's accepted iOS-only probe/Android deferral is retained in ADR 0002.

Implemented review splits (every authored code commit under 400 changed lines):

- **03a / 9484a5b:** readonly locked types, supporting unions, centralized gameplay and
  algorithm constants, synthetic ContentPack/state fixtures and public type exports. Fixture callback wiring uses
  the approved support-training → support-follow-up IDs with synthetic copy/effects.
- **03b.1 / cbfb41a:** original cyrb53 over UTF-16 code units with hash seed zero,
  explicit unsigned low-32-bit conversion, mulberry32 and independent seed:draw:turn streams.
  Fixed vectors include empty/ASCII, surrogate pair, combining mark and lone surrogate.
- **03b.2 / 5e7a5d4:** exact ASCII-sorted integer-ticket weighted selection with one RNG
  call. Fixture rarity weights are injected so live tuning cannot rewrite rule tests.
  Tests cover cumulative boundaries, all tickets, invalid inputs and seeded weight properties.
- **03c / d62e846:** inclusive, conjunctive minute/risk/presence/absence conditions; expert-release
  requirement checks, zero boundaries, contradictions, fixture serialization and public
  contract checks. Vitest now enforces core lines >= 90% / branches >= 85% across all
  existing core files. Colocated tests can import only approved Vitest/fast-check libraries;
  production restrictions and content boundaries remain enforced.
- [Contracts/RNG handoff](task-03-contracts.md) documents helper boundaries and vector sources.
  Engine index has no runtime stubs: gameplay API implementations belong to 04–06 and
  the live ContentPack importer belongs to 07. Content-table authorship remains task 06b.

Actual check evidence:

- Frozen install, typecheck and zero-warning ESLint/Prettier passed.
- **57 unit/property tests passed. Core coverage: 90/91 lines (98.90%) and 35/35 branches
  (100%).** Every existing core file is included; type-only files have zero executable
  lines/branches. Overall coverage including browser probe helpers is 78.91% lines /
  85.71% branches; the scheduled floor applies to core, not that overall denominator.
- Coverage negative check: an unimported, uncovered core file caused the active threshold
  check to fail. Removed the temporary file and reran the passing suite. Neither include
  scope nor threshold was reduced. Evidence retained in ignored .tools/task-03-coverage-negative.txt.
- Seeded lint: all original 18 violations rejected, 3 legal examples accepted; 24 direct
  dependencies and five TS flags verified. Additional tests verified approved test imports
  pass while production Vitest, test React and engine/live-content imports fail.
- Build/size passed: **70,407 / 122,880 gzip JS bytes; deployed media 0 / 409,600 bytes**.
- **18 E2E checks passed** on Pixel 7 Chromium, iPhone 14 WebKit and desktop Chromium;
  zero browser errors, no retries/skips. The shell/probe behavior remains intact.
- Reports: coverage/index.html and coverage-summary.json, test-results/unit.xml,
  test-results/e2e.json, playwright-report/index.html. Simulation and gameplay goldens
  are scheduled later and are not claimed as passed.
- A numeric-literal lint failure was fixed by deriving the locked 45/60 booking and
  two-turn callback types from constants, preserving the contract without weakening lint.
  A decimal ticket fixture rounded below the intended boundary; tests now use exact
  binary boundary fractions and ticket midpoints, plus a regression for the original
  rounding case. The specified floor(rng × W) formula was not changed.

Outstanding issues and next task:

- No task 03 blocker or new D01–D26 conflict. Android LinkedIn behavior remains a known
  task 02 risk and must be verified before release; no Android pass is inferred.
- **Next task: 04 — state transitions, shared evaluator and typed engine errors.**
  Stop here; no state transitions, score/title formulas, scheduler, live content or UI loop
  are implemented by task 03.

Hosted task 03 evidence:

- [PR #2](https://github.com/hsivasambu/meeting-sim/pull/2) targets main.
  [Quality CI](https://github.com/hsivasambu/meeting-sim/actions/runs/38177605264) passed
  on commit 37ac38d, including frozen install, all active gates and report publishing.
  Vercel preview status also passed. Downloaded the quality-reports artifact and verified
  57 unit tests with zero failures/errors, 18 E2E passes with zero skips/flaky/unexpected,
  core 90/91 covered lines and 35/35 covered branches, and both HTML reports present.
- PR #2 is ready for review; it remains unmerged. Documentation consistency/format checks
  passed for this evidence update. The final documentation push reruns the same CI gates.
- Task 03 is complete. Next task remains 04; no task 04 implementation was started.
