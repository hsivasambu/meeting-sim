# This Could've Been an Email — Implementation Plan

Status: D01–D26 remain resolved. Tasks 01–05 implemented and verified with all active local and hosted Node 24 gates. Task 06 complete with review fixes and local/hosted Node 24 evidence in PR #7. Dependency PRs #4 and #5 are merged into main. Task 06b complete: content table authored, locally verified and approved by Harry on October 12, 2026 (D18); Claude review addressed; PR #8 has passing hosted Node 24 evidence. Task 02 Android evidence remains deferred (ADR 0002). Task 07a complete: Claude review addressed in PR #9 with passing hosted Node 24 evidence. Approved synthetic/playable validation distinction recorded in the tech spec. Next implementation task: 07b.

## Purpose and source of truth

Build the complete Friday Launch Meeting MVP defined by [Design Doc v2](design-doc-v2.md) using the architecture and delivery rules in the [Technical Spec](tech-spec.md). This plan sequences the work; it does not amend either document or authorize exceptions.

Precedence, architecture rules and the gate schedule are defined only in the technical spec (How to use this spec; Testing and quality gates). This plan links to them rather than restating them (D22). Use the technical spec's engine signatures and types, pnpm commands, portrait-based release interaction, meeting turn flow and DOM room stage (D16) where older design examples differ.

The repository is now at `C:\dev\meeting-sim`, outside OneDrive. The three source documents were moved into `docs/` as their only copies (D22, D23). Scaffold-time locked-major availability was verified against official release pages and the npm registry. Hosting, gameplay, assets and balance remain unverified.

Deliver one static, mobile-first game: one-tap start, six initial attendees, one room, 17 base events plus callbacks/absence variants, deterministic choices, four endings, twelve collectible titles, share image/text, and a reproducible seven-policy simulation harness. No accounts, backend, audio, movement, multiplayer, additional scenarios, setup menus, daily mode, practice mode, leaderboards, or AI dialogue.

## Resolved implementation decisions

D01–D26 are settled. [ADR 0001](adr/0001-stack.md) is the single decision register.
The technical spec remains the source of normative rules. Numerical balance is unverified.

## Delivery sequence

Each numbered task is a blueprint task and a candidate PR. Before code, state its source section, touched files, and any rule it strains. Harry explicitly accepted keeping PR #4 and larger future PRs on October 11, 2026. A large diff may use one PR with understandable commits; size alone does not require multiple PRs or approval. Optional task splits retain relevant tests and acceptance evidence.

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
| 07a  | Content validator and content index.                                                                                                                                                                                                                                             | 04–06           | `validateContent` rules implemented and tested on valid and invalid fixture packs; speaker present at draw unless room/arrival speaker.                                                                            |
| 07b… | Live content: `src/core/content/attendees.ts`, `events/*.ts`, `titles.ts`, `copy.ts`, transcribed from the content table in event-group PRs.                                                                                                                                     | 06b, 07a        | Every content-table row implemented; `validateContent` passes on the live pack; bind `drawEvent`/`getDrawCandidates` in `engine/index.ts` and test the public wrappers.                                            |
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

## Plain-language task guide and easy checks

This explains the same tasks above; it does not change their scope, dependencies or
acceptance rules. **Now** means the check is available on the reviewed task 07a branch;
**Later** means wait until that task is implemented. Tasks 00–07a (including their splits)
are implemented. Tasks 04–06b are merged into main via PRs #4, #5, #7 and #8;
task 07a is delivered in [PR #9](https://github.com/hsivasambu/meeting-sim/pull/9)
with hosted Node 24 evidence. Its content checks are available on main after merge.

The browser currently shows the title/objective and the separate sharing probe. The
first playable meeting is task **12a**. Tasks 03–07a work under the hood, so their easiest
checks are automated tests. A simple check is a useful spot check, not a substitute for
the technical spec's full gates or release checklist. Android LinkedIn testing is still
unverified under the accepted task 02 deferral.

| Task | ELI5: what this gives you                                                                                 | An easy check you can do                                                                                                                                                                                                                                         |
| ---- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 00   | Agree on the game's rules so everyone is building the same game.                                          | **Now — read:** Open ADR 0001 and find decisions D01–D12; they should match the design/spec. No button to test.                                                                                                                                                  |
| 00b  | Agree on which part of the program is responsible for each job.                                           | **Now — read:** Find D13–D26 in ADR 0001. For example, the room draws things while the store handles player actions. No visual game feature yet.                                                                                                                 |
| 01a  | Put the project, instructions and checklist in one tidy home.                                             | **Now — inspect:** In C:\dev\meeting-sim, check that docs contains the three main documents and root AGENTS.md says “Follow CLAUDE.md.”                                                                                                                          |
| 01b  | Set up the tools that build the app and catch coding mistakes.                                            | **Now — terminal:** Run Check and Build/Size below. All should pass; the browser shell shows the Friday launch objective.                                                                                                                                        |
| 02   | Add automatic checks and a small page that tests sharing inside LinkedIn.                                 | **Now — browser:** Use the [probe procedure](task-02-setup.md): the image should appear, and share/copy/save actions should work or clearly report their fallback. iOS passed by Harry's report; Android is not verified.                                        |
| 03   | Give the game a common vocabulary and repeatable “shuffle,” like using the same numbered deck twice.      | **Now — terminal:** Run Tests below. Look for rng.test.ts, weighted.test.ts and conditions.test.ts passing. They check repeatable shuffling, correct odds and who qualifies for an option.                                                                       |
| 04   | Make each choice update the meeting correctly, without changing the old state behind your back.           | **Now — terminal:** Run Tests. Look for state.test.ts, evaluation.test.ts, resolve.test.ts and transitions.test.ts passing. They cover owner protection, costs, expert departures and winning at the deadline. There is no player interface for these rules yet. |
| 05   | Turn the finished meeting into a score and earned badges.                                                 | **Now — terminal:** Run Tests and inspect the six scoring examples against the design's worked-example table. The score shown in the browser arrives with later UI tasks.                                                                                        |
| 06   | Pick the next meeting topic, remember used topics and bring parked issues back on time.                   | **Now — terminal:** Run Tests; draw/callback tests and the six saved example runs should pass. Browser topic flow arrives in 12a.                                                                                                                                |
| 06b  | Write the script: every topic, choice, consequence and ending.                                            | **Now — read:** Open docs/content-table.md. Read one topic with its expert present and absent, then follow its choices and consequences. Harry approved the table on October 12, 2026; Claude review addressed; PR #8 has passing hosted Node 24 evidence.       |
| 07a  | Build a proofreader that rejects broken game data.                                                        | **Now — terminal:** Run Tests; content-validation checks pass for valid packs and reject the deliberately broken fixtures. No new screen to test.                                                                                                                |
| 07b… | Put the approved script into the game, a small group of topics at a time.                                 | **Later — compare:** Pick one implemented family and compare every variant/choice to its approved content-table row. Run Tests to check the data. Repeat for each 07b content split.                                                                             |
| 08a  | Let two simple robot players try the real game to find big problems early.                                | **Later — report:** Ask for the Greedy/Random simulation summary. Both should reach endings without crashes; win rates are evidence at this point, not a promise that balance is finished.                                                                       |
| 11a  | Add the traffic controller that accepts clicks and moves the meeting from dialogue to choices to results. | **Later — terminal:** Run Tests and look for the store/action checks passing, especially double-click handling and restarting. The screen that uses it arrives in 12a.                                                                                           |
| 12a  | Make the first playable version, using plain text before adding art.                                      | **Later — browser:** Start a meeting, choose an option, release Gary, and Call it. You should reach results. Try a full meeting and keyboard controls too.                                                                                                       |
| 08b  | Make robot runs repeatable and save their results in a spreadsheet-friendly file.                         | **Later — report:** Repeat a small simulation with the same settings/seed range; compare the outputs. The saved CSV should have the same columns and results.                                                                                                    |
| 09   | Add five more robot strategies so the game is tested by different kinds of players.                       | **Later — report:** Run the all-policy simulation and confirm all seven named policies appear. Repeating a policy with the same inputs should repeat its results.                                                                                                |
| 10   | Tune the game so sensible choices help, careless choices hurt, and luck still matters.                    | **Later — report:** Read the 2,000-seed, seven-policy acceptance report; its required bands should pass. Play several runs as a feel check; one lucky win does not prove balance.                                                                                |
| 11b  | Finish the controller so endings, restarts and saved badges work reliably.                                | **Later — browser, when screens are connected:** Earn a badge, restart, then reload. The run should reset and the badge should remain. Automated tests also cover blocked/corrupt storage.                                                                       |
| 12b  | Make the full controls clear and usable on phones, keyboards and reduced-motion settings.                 | **Later — browser:** At 320 px width, check for no sideways scrolling; use Tab/1–3/Enter. Options show their effects and disabled reasons. Reduced motion makes dialogue appear immediately.                                                                     |
| 13   | Create the room, people and lettering, with permission to use every asset.                                | **Later — inspect:** Review the art files and public/LICENSES.md; every asset needs a source/licence entry. Run Build/Size for the media budget. In-game art is connected in 14b.                                                                                |
| 14a  | Try a simple pretend room to check that it stays sharp and smooth on a phone.                             | **Later — browser on a real phone:** Check the placeholder room at its supported sizes. People should stay crisp and react to joins/releases/progress/risk changes. Record the phone and result.                                                                 |
| 14b  | Replace the pretend room with the final artwork and load it reliably.                                     | **Later — browser:** Start a run on a phone, watch reactions, and enable reduced motion. The room should stay sharp, idle animation should stop, and no images should be missing.                                                                                |
| 15   | Finish the results card, badge collection and ways to share the result.                                   | **Later — browser:** Finish a run; check score/title/ending, share or save the PNG, and copy the text. The image stays visible for long-press save. Reload to check saved badges.                                                                                |
| 16   | Check the whole game together so it works for real people on real devices.                                | **Later — playtest:** Have someone play without coaching: can they explain the goal and identify a tangent? Also check keyboard, mobile layout and the recorded accessibility/performance results. The full five-person pass bar still applies.                  |
| 17   | Put the checked game at its public address and prepare it for launch.                                     | **Later — browser:** Open the final address while logged out, finish a run, and use LinkedIn Post Inspector to check the link preview. Verify the release checklist has the full simulation, real-device and performance evidence.                               |

### Copy-and-run checks available now

Open PowerShell in C:\dev\meeting-sim. These commands use this machine's installed
Node 24 and pinned pnpm. If using another machine, follow README's fnm setup first.

Check — catches type/style errors and runs all unit/property tests with coverage:

```powershell
& '.tools/fnm/fnm.exe' exec --using 24 cmd /c corepack pnpm check
```

Tests — the simplest under-the-hood check for tasks 03–05. All tests should pass;
at this update there are 196 tests. It prints each test file and writes a readable
coverage report to coverage/index.html. A green test run is evidence for the tested
rules; it does not mean the unfinished game features exist.

```powershell
& '.tools/fnm/fnm.exe' exec --using 24 cmd /c corepack pnpm test
```

Build/Size, then browser smoke checks — verifies the deployed build and existing
shell/probe in all three browser profiles (18 checks at this update):

```powershell
& '.tools/fnm/fnm.exe' exec --using 24 cmd /c corepack pnpm build
& '.tools/fnm/fnm.exe' exec --using 24 cmd /c corepack pnpm size
& '.tools/fnm/fnm.exe' exec --using 24 cmd /c corepack pnpm e2e
```

The technical spec remains the only definition of required thresholds and when each
gate activates. Future task checks in this guide are examples, not results already obtained. After each task,
update the Now/Later labels, branch note and expected check counts along with the main status.

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
- Task 07b acceptance includes committed live-content scenario tests using `getDrawCandidates`: the table's ten-turn route with arrivals released/retained, all 13 constructed variant scenarios, the four updated room-booked boundaries, and Legal/VP enabled and disabled choices before joining and after release (including release during pending dialogue). These content tests carry transcription/reachability evidence; engine rule tests and goldens continue to use frozen fixture packs.
- Task 07b's live validation test must supply `eventFiles`, `attendees` and `disabledReasons`; assert that authored reason keys match the keys used by responses to catch stale copy. Include epilogues/titles when their data is transcribed, and substituted moment catalogs with task 15. An omitted catalog is not live-content gate evidence.
- Task 07b transcribes the table's approved fixed no-moment copy and “Decision Made” heading into `core/content/copy.ts`. Task 15 authors and reviews the remaining dynamic release/park/arrival templates there, with ≤90-code-point substituted lines and the design's moment priority; no generated UI copy.
- Validate unique IDs, event filenames, all references, 1–3 responses, minutes 0–10, progress −10…+25, risks −1…+1, and attendance safety. Validate zero minutes only for email; callbacks always take at least one minute. Enforce dialogue/epilogues/moments ≤90, labels ≤24, collectible titles ≤28 and role titles ≤48 Unicode code points.
- Add reachability/condition checks beyond syntax: callbacks have targets, variants are selectable, no duplicate attendee joins, and no event can strand the player with no legal response.

Exit: complete rules/content, exact score fixtures, deterministic end-to-end headless runs and documented decisions for all mechanics used.

## Milestone B2 — Vertical slice (08a, 11a, 12a)

Get evidence on the riskiest assumptions before building the remaining policies and tuning (D19).

- 08a runs Greedy and Random over the live content with a minimal runner. Report win rates, median score, Greedy median turns and how often P = 100 is reached (V3). Results are diagnostic.
- Carry task 06b's intentional room-booking trap into the report: Greedy accepts :45 even with the VP present (`timebox` precedes `vp` in the tied ASCII comparison); Random may use the VP to keep 60. Later Reckless has the same immediate comparison. Verify Lookahead in task 09: its next-step term is zero after an ending, so impending expiry can alter that comparison. Preserve the approved response IDs/effects; do not treat the trap as a formula defect or silently retune it to satisfy balance targets.
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

| Milestone            | Tasks         | Status                                                                                                                                                                                                                                                                                                            |
| -------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A — Foundation       | 00–03         | 00–03 complete: [PR #3](https://github.com/hsivasambu/meeting-sim/pull/3); Android deferred (ADR 0002)                                                                                                                                                                                                            |
| B — Headless game    | 04–07, 06b    | 04–06 complete: PRs #4–#5 merged, [PR #7](https://github.com/hsivasambu/meeting-sim/pull/7) with hosted Node 24 evidence; 06b complete with Harry's approval; Claude review addressed in PR #8 with hosted Node 24 evidence; 07a complete with review fixes and hosted Node 24 evidence in PR #9; 07b not started |
| B2 — Vertical slice  | 08a, 11a, 12a | Not started                                                                                                                                                                                                                                                                                                       |
| C — Balance evidence | 08b–10        | Not started                                                                                                                                                                                                                                                                                                       |
| D — Browser game     | 11b–15        | Not started                                                                                                                                                                                                                                                                                                       |
| E — Release          | 16–17         | Not started                                                                                                                                                                                                                                                                                                       |

Task 06 is complete with local and hosted Node 24 evidence in PR #7. Tasks 01–05 are implemented and merged, including PRs #4 and #5. Task 06b's content table is authored, locally verified and approved by Harry; Claude review addressed; PR #8 has passing hosted Node 24 evidence. Task 07a complete: Claude review addressed in PR #9 with passing hosted Node 24 evidence. Approved synthetic/playable validation distinction recorded in the tech spec. Next implementation task: 07b. Android evidence remains deferred (ADR 0002).

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

## Task 03 review fixes — October 11, 2026

- Validate every rarity weight as a positive safe integer, including unused rarities,
  before consuming RNG. Fractional, zero, negative and non-finite weights are rejected;
  unsafe products/totals remain rejected. Fixture-weight injection is retained.
- Reject duplicate pool IDs before consuming RNG; replace the prior duplicate-acceptance
  assertion with identical-object, distinct-object and nonadjacent duplicate regressions.
- Add the required park callback to support-training's absent-Sam fixture presentation
  and verify every presentation can schedule the approved support-follow-up callback.
- Add one-line TSDoc naming the relevant design section to all six exported helpers.
- Synchronize the milestone table and execution handoff with completed tasks 01–03 and
  next task 04. Historical evidence remains chronological; Android remains a release risk.
- PR #3 will contain task 03 plus these fixes because PR #2 is still unmerged and #3 did
  not previously exist. Merge #3 after all active checks pass; close #2 as superseded.
- Local checks passed: 66 unit/property tests, core lines 98/99 (98.99%) and branches
  39/39 (100%), typecheck, zero-warning lint/format, build/size (70,407 / 122,880 gzip
  JS bytes; media 0 / 409,600) and 18 E2E passes without retries/skips/browser errors.
  Original seeded lint/allowlist/TS checks and document consistency passed; all six
  required TSDoc comments were verified. Thresholds and dependencies are unchanged.
- Delivery: [PR #3](https://github.com/hsivasambu/meeting-sim/pull/3) supersedes PR #2;
  Harry authorized its squash merge after passing checks.
  Task 03 is complete; next task 04. No task 04 code was added.

- Hosted fix [quality run](https://github.com/hsivasambu/meeting-sim/actions/runs/38178689878)
  passed on b30803c, including frozen install, types, lint, all tests/coverage, build/size,
  all three E2E profiles and report publishing. The final evidence-only commit reruns
  the same gates before the authorized merge. PR #3 is the delivery/merge record for task 03;
  PR #2 is superseded. Next task remains 04. Deferred Android validation is still a release risk.

## Task 04 result — October 11, 2026

Status: **Implemented and locally verified.** Sources: technical spec Engine contracts,
Turn order and endings, Content/evaluation contract and activated gate schedule; design
Game state model, Core loop/Anytime actions, Draw rules and Scoring/Decisions.
No D01–D26 decision was reopened and no task 05 or 06 functionality was implemented.

Dependencies and scope:

- Task 03 is merged on main as e6773a1 (PR #3), including all five review fixes.
  Frozen-lockfile installation passed under Node 24.21.0 / pnpm 10.34.6; packages,
  lockfile, five strict TS flags and the 90% lines / 85% branches gate remain unchanged.
- Public index now exposes initialState, release, callIt, resolve and previewResponse
  with locked signatures. EngineError and its code union are type exports; internal
  helpers and tunable utility rules stay out of the runtime public surface.
- Additive releasedAttendeeIds tracks releases authoritatively, preventing re-entry
  without reading narrative logs. Existing state fields were retained.
- Engine state actions and materialized-response evaluation need no live content lookup;
  they import no content. ContentPack-based pool lookup/materialization stays in task 06,
  and the live pack remains task 07. No stub pack or fabricated live event was added.

Review splits, each authored code commit below 400 changed lines:

- **04a / f273eb0 (266 lines):** starting state, owner/minimum-safe release, counter-based
  Call it endings, typed programmer errors, authoritative release tracking and frozen fixtures/tests.
- **04b / 7eb7a14 (296 lines):** single applyEffect clamp implementation, pre-join integer
  billing, attendance/booking effects, effective utility and read-only previews. Internal
  rules tests inject synthetic utility weights rather than asserting live tuning.
- **04c.1 / 7474f7c (167 lines):** atomic resolution, enabled-response decision quality,
  fixed prior qualities, full-effect deadline crossing, decision-before-expiry priority,
  callback n+2 scheduling/repeat/collision guards and public wrappers.
- **04c.2 / 74bf417 (358 lines):** resolution edge cases and seeded valid-action properties.
  Test files remain below 300 lines; engine helpers carry design-section TSDoc.

Verification evidence:

- Typecheck, zero-warning ESLint/Prettier and **108 unit/property tests passed**.
  Core coverage: **188/189 lines (99.47%)**, **141/141 branches (100%)** across all existing
  core files. Only the prior unreachable weighted-ticket guard is uncovered.
- fast-check seed 41004: 150 generated seed/action sequences, up to 35 steps, each replayed.
  Frozen-input nonmutation, preview/result agreement, P/R bounds, unique legal headcounts,
  nondecreasing clocks and integer cost pass. This is transition evidence; full draw runs,
  50-turn termination, goldens and simulation remain scheduled later.
- Fixed fixtures cover refusals/new snapshots, pending-speaker release, disabled experts,
  zero-minute email, independent park count, short booking already expired, full billing
  past deadlines, simultaneous success/expiry, designated joins, no re-entry, persisted
  quality, callback repeats/collisions/illegal contexts, ended actions and malformed effects.
- Preview does not log, increment turns or schedule callbacks. Resolution records narrative
  resolve/join entries at the post-effect minute; quality uses pre-resolution state. Log
  contents never determine action legality, counters or endings.
- Build/size passed: **70,407 / 122,880 gzip JS bytes**, deployed images/fonts **0 / 409,600**.
- **18 E2E checks passed** across Pixel 7 Chromium, iPhone 14 WebKit and desktop Chromium,
  no browser errors, retries or skips. Existing shell/probe behavior remains intact.
- Original 18 seeded lint violations rejected; 3 legal imports accepted; 24-package allowlist
  and all five TS flags verified. Document consistency and whitespace checks passed.
- Reports: coverage/coverage-summary.json and index.html, test-results/unit.xml and
  e2e.json, playwright-report/index.html. No threshold, test or dependency was weakened.

Outstanding issues and next task:

- No task 04 blocker remains after the review hardening below. Disabled responses now return
  authored content reason keys; their display text belongs in future content/UI.
- Task 02 Android LinkedIn behavior remains unverified with Harry's accepted deferral;
  verify before release. No Android success is inferred.
- **Next task: 05 — utility, score and titles, with exact worked-example fixtures.**
  Internal utility evaluation already exists because task 04 decision records require it;
  task 05 adds score/title APIs. Draw distribution, fairness and scheduler consumption remain
  task 06. Stop here; no later task code was added.

- Final task 04 review added maximum-ten-minute effect validation, callback minimum-one-minute
  enforcement and explicit room-booked deadline-path checks, with regressions. Reran all
  active local gates: 108 unit/property and 18 E2E passes, core 188/189 lines and 141/141 branches.
  [PR #4](https://github.com/hsivasambu/meeting-sim/pull/4) contains task 04; it is unmerged.

Hosted task 04 evidence:

- [Quality run](https://github.com/hsivasambu/meeting-sim/actions/runs/38179958251) passed
  on code commit 28684c8, including every active gate and report publishing. Downloaded
  artifact confirms 108 unit passes with zero failures/errors, 18 E2E passes with zero
  skipped/flaky/unexpected, core 188/189 lines and 141/141 branches, both HTML reports present.
- [PR #4](https://github.com/hsivasambu/meeting-sim/pull/4) is ready for review and remains
  unmerged. Document consistency/format/whitespace checks passed for this evidence update;
  the final documentation-only head reruns the same active checks.
- Task 04 complete; next task 05. No known task 04 defect remains and no task 05 work started.

## Plan readability update — October 11, 2026

- Added an ELI5 explanation and an easy check for all 26 delivery-sequence entries,
  preserving their task IDs, order, scope, dependencies and acceptance rules.
- Now/Later labels distinguish implemented checks from future features; task 04's
  unmerged branch requirement and the first playable meeting in 12a are explicit.
- Added copy-and-run Node 24 commands with expected current test counts. Android's
  accepted deferral is retained. No application code, dependency or gate was changed.
- Documentation checks: task-guide completeness, unchanged technical delivery table,
  linked local files, assistant rules and D01–D26 register; Prettier and whitespace.
  Next implementation task remains 05; no later task was implemented.

## Task 04 review hardening — October 11, 2026

Sources: [full review](task-04-review.md), Design Decisions/equal utilities, preview/evaluation
contracts and authored reasons. Task 03 findings 1–5 remain fixed; its pending module-layout
note is now incorporated into the technical spec. Next task remains 05; no scoring/title or
other later feature was added.

- **Tie bug fixed:** decimal coefficients are represented as exact integer fractions.
  Compare/normalize common-denominator utility numerators; convert only public outputs
  to numbers. No scoring formula, threshold or broad tolerance changed. Public regressions
  cover the actual reported six- and two-person cases. Injected decimal profiles test all
  legal headcounts, both choices and genuine near-ties. Future tuning must keep an equivalent
  mathematical-tie regression when the current public profile changes.
- **Preview agreement fixed:** the evaluator shares responseValidation across preview,
  utility and resolution. Invalid durations/techniques, booking/arrival/callback contexts
  and duplicate/colliding callback schedules no longer preview as enabled.
- **Content ownership fixed:** approved relationship IDs are plain data in content/engineRules.
  Only the public index imports that data; internal profiles inject EventRules. ContentPack
  stores eventRules. Renamed fixture IDs exercise arrivals/bookings/callbacks without changing
  engine code. The join allowlist is derived from supplied arrival metadata.
- **Authored reasons fixed:** Response.disabledReasonKey is required when requires exists;
  disabled previews return the content key. Sam/Dev keys remain distinct; missing/empty keys
  produce a programmer/content error. No UI rules are duplicated.
- **Spec synchronized:** releasedAttendeeIds, EventRules/ContentPack metadata, response reasons,
  precision behavior and modules from both tasks 03–04 are documented. Added state/error,
  preview, effect, weighted/condition and new shared-validation/numeric module layout entries.
- **PR size preference resolved:** Harry explicitly instructed keeping #4 and accepting larger
  future PRs. CLAUDE, the spec and plan now record that size alone does not require splitting
  or approval. Historical commit splits remain evidence, not an unapproved general exception.
- **Property gaps addressed:** new multi-choice properties vary releases (including owner),
  arrivals, booking changes, callbacks and binary/decimal profiles; all preview deltas,
  bounded quality, attendance/range/cost invariants and replay are checked. The original
  broader clamp/property test is retained. A unit regression pins pending-event retention
  after Call it; ended actions remain forbidden and task 06 has the empty-candidate requirement.
- Local Node 24 check currently passes **129 unit/property tests**. Existing 90% core lines /
  85% branches thresholds are unchanged. Final local evidence is below; hosted checks follow.
- The external review is preserved as historical findings, with resolution notes appended.
  Task 02 Android evidence remains explicitly deferred and must be obtained before release.

Final local review evidence:

- Node 24 typecheck, zero-warning lint/format and 129 unit/property tests passed. Core coverage
  is **229/231 lines (99.13%)** and **188/194 branches (96.91%)**. Build/size
  passed at 70,407 / 122,880 gzip JS bytes and deployed media 0 / 409,600. All 18 E2E cases
  passed without retries/skips/console errors on the three required profiles.
- The original 18 seeded architecture violations remain rejected, three approved imports
  pass, and the 24-package allowlist / five TS flags / unchanged lockfile were verified.
- Larger future PRs are accepted by Harry; PR #4 remains the task 04 delivery. All review
  findings have code/doc resolutions, no known task 04 blocker remains, and task 05 is next.

Hosted review evidence:

- [Quality run](https://github.com/hsivasambu/meeting-sim/actions/runs/38192799070) passed
  on review-fix code commit ecede54. Downloaded reports confirm **129 unit tests, zero failures/errors**,
  **18 browser passes, zero skipped/flaky/unexpected**, core **229/231 lines, 188/194 branches**
  and both coverage/browser HTML reports. Build/size and Vercel checks passed.
- PR #4 is updated and ready for review, still unmerged. The final evidence-only commit reruns
  the same active gates. All review findings are resolved, with the accepted PR-size preference
  recorded. No task 04 blocker remains; Android LinkedIn testing remains an accepted release risk.
- **Task 04 complete. Next task: 05. Stop here; no task 05 work started.**

## Task 05 initial local result — October 11, 2026

Historical status: **Initial local implementation; superseded by the review fixes and hosted delivery below** on `feat/task-05-score-titles`.
Sources: Design Doc v2 Scoring (including all six worked examples) and Endings/Titles;
Technical Spec Engine contracts, Money without floating-point drift, Scoring module
and Testing and quality gates. D01–D26 and all formulas/tuning values remain unchanged.

Dependencies and implementation:

- Task 04 is present at starting head `d5144a5`, with its transition/evaluation modules,
  persisted decision qualities, counters and recorded hosted evidence. The clean local
  dependency baseline passed typecheck, lint/format and all 129 prior tests.
  Task 04's unmerged PR is not a missing code dependency on this branch.
- Added `score.ts`: Outcome/Efficiency/Decisions, integer component rounding followed
  by summation, `displayCost` and the sole `formatCost` formatter. Scoring reads
  integer person-minutes and persisted qualities, never display dollars or narrative logs.
- Reused task 04's internal `value` and shared evaluator unchanged. Exposed its existing
  decimal-fraction helper internally so decision scoring and unrounded title-quality
  comparisons use exact decimal arithmetic. No numeric tolerance, BigInt state data,
  new public helper, or retrospective revaluation of decisions was introduced.
- Efficiency multiplies integer numerators before dividing; decision rounding uses
  exact fractions. Regressions pin half-up rounding at P=15/pm=171 (32 efficiency)
  and q=0.145 (44 Decisions), including repeated qualities and null records.
- Added `titleRules.ts`: all twelve predicates from authoritative counters and the supplied
  integer score; returns every earned ID once in priority 12,9,10,11,1,2,3,4,5,6,7,8.
  When no collectible is earned, the API returns an empty array; future result UI owns the non-collectible
  heading. Gary's delivered-line counter prevents an after-speaking release from earning
  Gary-Free Zone. Names/copy, result UI and persistence remain their scheduled tasks.
- Added `fixtures/scores.ts`, `score.test.ts` and `titleRules.test.ts` (60 new tests).
  Public index adds only the locked score/title/cost APIs; all numbers are centralized.
  No content table exists yet (task 06b); no event design or live title copy was invented.

Final verification (Node 24.21.0 / pinned pnpm 10.34.6):

- `pnpm check`: zero type errors, ESLint errors/warnings or format failures;
  **189 tests in 17 files passed**. All six exact component/total examples and display
  title priorities pass. Coverage includes null/zero qualities, P=99/100, R=0–5,
  cost floor/reference/overrun, cancellation at minute zero, cheap early exits,
  component rounding, every title threshold, required endings and counter/log separation.
- Static-import display-rate mock changes only 1000/hour to 2400/hour: dollars change,
  while all worked-example scores and title lists stay identical.
- Seeded fast-check **51005 / 300 cases** covers integer scores in 0–1000, component
  sums, deterministic frozen-input reads and success Outcome above every failed Outcome.
  The pre-existing transition, exact-utility and metadata regressions also remain green.
- Core coverage across all 22 existing files: **282/284 lines (99.30%)** and
  **210/216 branches (97.22%)**, above the unchanged 90%/85% gates.
  New `score.ts` and `titleRules.ts`: **100% lines and branches**.
- `pnpm build` and `pnpm size` pass: **70,407/122,880 gzip JS bytes**;
  deployed images/fonts **0/409,600 bytes**.
- `pnpm e2e`: **18 passed**, Pixel 7 Chromium, iPhone 14 WebKit and desktop Chromium,
  with browser error checks enabled, no skips or retries. These verify the existing
  shell/probe; a playable meeting and score display remain scheduled for later tasks.
- Architecture verification: 18 seeded violations rejected, 3 legal imports accepted,
  all 24 direct packages allowlisted and all five strict TS flags retained.
  Document links, D01–D26 register, assistant rules, formatting and whitespace pass.
- Evidence: `test-results/unit.xml`, `coverage/coverage-summary.json`,
  `coverage/index.html`, `test-results/e2e.json`, `playwright-report/index.html`.
  These are local reports; no hosted task 05 CI result is claimed. No tests,
  thresholds, CI gates, dependencies, lockfile or scoring formula were weakened.

Outstanding issues and next task:

- No task 05 blocker remains. Android LinkedIn behavior retains the accepted task 02
  deferral; efficiency-floor calibration remains diagnostic until task 10/release.
- **Next task: 06 — event selection, fairness guards, callback scheduler and five
  frozen-fixture goldens**, depending on completed tasks 03 and 04. Content table
  task 06b remains separate and not started. Stop here; no task 06 code was added.

## Task 05 review fixes and delivery — October 12, 2026

Source: [full Claude review](task-05-review.md), provided during verification, plus the pasted
findings. The full review is preserved with resolution notes.
Dependency code is present from task 04 at d5144a5. PR #4 remains open, so this task's
PR targets feat/task-04-transitions and can merge to main after its dependency does.
No task 04 merge or task 06 implementation is included.

- Fixed precision loss at resolution: DecisionRecord adds required qualityFraction with
  exact integer numerator/denominator stored as decimal strings (null for ties). Numeric
  quality remains a display approximation. Scoring/title thresholds consume exact fractions;
  there is no rounded fallback or retrospective recomputation. JSON serialization and replay
  are preserved; no BigInt value enters state. The additive contract is in the technical spec.
- score and earnedTitles reject running meetings and null endings with EngineError("not-ended").
  A previously running-state score test now ends through Call it before computing results;
  its original quality and stability assertions remain intact.
- Added seven public-API integration cases, including resolve-produced qualities 2/3, 1, 1,
  11/15. Their exact average is 0.85, Decisions is 255, and the early ending earns Played It
  Right. Tests include ties, disabled choices, below-boundary/zero qualities, JSON round-trip,
  display-approximation independence and both result API lifecycle guards. A reachable q=1/3
  then q=7/100 case pins exact Decisions half-up rounding: 60.5 rounds to 61.
- Node 24.21.0 / pnpm 10.34.6: pnpm check passes **195 tests in 18 files**, zero type/lint/format
  errors. All six design examples, twelve title rules and display-rate independence remain green.
  Core coverage: **289/291 lines (99.31%)**, **216/222 branches (97.30%)**; unchanged 90%/85% gates.
- Build/size pass: **70,407/122,880 gzip JS bytes**, images/fonts **0/409,600**. All **18 E2E**
  cases pass across the three required profiles with zero retries/skips/browser errors.
- Architecture probes reject 18 seeded violations and accept three legal imports. The 24-package
  allowlist, five strict flags, unchanged dependency/lockfile, docs and whitespace checks pass.
- Commit/PR and hosted evidence are recorded below; the earlier local-only “complete” claim is superseded.
  Formulas, tuning values, thresholds and existing tests were not weakened. Android LinkedIn
  testing remains the accepted release risk. Next task is 06 after task 05 delivery; stop here.

Hosted delivery evidence:

- Implementation and fixes committed as **7ff113e**, pushed to feat/task-05-score-titles.
  [PR #5](https://github.com/hsivasambu/meeting-sim/pull/5) is open and attached to this task,
  based on PR #4's branch. Retarget to main after dependency #4 merges; neither PR was merged here.
- [Node 24 quality run](https://github.com/hsivasambu/meeting-sim/actions/runs/38256899285)
  passed every active gate. Downloaded reports verify **195 unit tests, zero failures/errors**,
  **18 E2E passes, zero skipped/flaky/unexpected**, core **289/291 lines, 216/222 branches**,
  and both coverage/browser HTML reports. No Node 22 result is substituted for hosted Node 24.
- **Task 05 complete and ready for review.** This evidence-only commit reruns the same checks.
  No known task 05 defect remains. Android LinkedIn testing is still deferred until release.
  **Next task: 06.** No task 06 or 06b implementation started; stop here.

Full review follow-up:

- Read docs/task-05-review.md after Harry supplied it. Its additional inferred D-rounding
  case now has a reachable public-API regression (P=1, then clamped deltas -1/+6/+99).
  Full constructed reachability for every title remains for task 06 goldens / 07a content;
  task 05 covers every predicate and resolution-to-results precision/lifecycle cases.
- The 195-test hosted report above is historical evidence for 7ff113e. Updated head adds
  one regression, for 196 tests; final verification follows. Thresholds remain unchanged.

- Final full-review local check on Node 24: **196/196 tests**, typecheck/lint/format pass;
  core coverage remains 289/291 lines and 216/222 branches. Production code did not change
  after the previous build/size/18-browser passes; hosted gates rerun on the added test/review.

Final full-review hosted evidence:

- [Node 24 quality run](https://github.com/hsivasambu/meeting-sim/actions/runs/38257638976)
  passed on **0d53952**, including the exact D-half regression and preserved full review.
  Downloaded reports verify **196 unit passes, zero failures/errors**, **18 browser passes,
  zero skipped/flaky/unexpected**, core **289/291 lines (99.31%), 216/222 branches (97.30%)**,
  and both HTML reports. Build/size also passed with the unchanged budgets.
- This final documentation-only evidence update passes formatting, links/decision-register and
  whitespace checks. PR #5 remains open, stacked on PR #4. **Task 05 complete; next task 06**.
  No further implementation is included.

## Task 06 local implementation — October 12, 2026

Task **06 locally implemented; remote delivery pending** on `feat/task-06-draw`, based on main after the task 04/05 merges.
Tasks **03 and 04** are present and verified: contracts/RNG/weights/conditions and
transitions/evaluation/scheduling are implemented; their existing tests pass unchanged.
Task 05 score APIs are also available for the recorded run outputs. Dependency PRs #4
and #5 are confirmed merged; their tree matches this task's tested baseline.

- Added injected event draw and read-only candidate distribution, sharing weighted
  preparation, eligibility, fairness, callbacks and ordered presentation variants.
- Draw-time counters, fixed pending dialogue, filler fallback and typed pool/schedule
  failures are covered. Resolution's existing n+2 scheduling is preserved.
- Five committed fixture JSON goldens record full action lists, final state and score
  for cancellation, clean success, risky success, timeout, and callback plus absence.
- Generated complete runs verify determinism, legal releases, billing, bounds and
  ≤50 turns. The all-email path delivers all three fixture callbacks and exhausts all
  17 base families before filler timeout at turn 49. Early endings suppress callbacks.
- **Node 24.21.0 / pnpm 10.34.6:** `pnpm check` passes **221 tests / 21 files**, with
  zero type/lint/format errors. Core **337/339 lines (99.41%)**, **274/280 branches
  (97.86%)**; draw **41/41 lines, 58/58 branches**. Thresholds remain 90%/85%.
- `pnpm build && pnpm size` passes: **70,407/122,880 gzip JS bytes** and **0/409,600
  image/font bytes**. `pnpm e2e` passes **18 tests** on the three required profiles.
- See [task 06 handoff](task-06-draw.md) for implementation scope, fixture outcomes,
  command evidence and staged live API binding. Content validation and simulation are
  not yet active; no claim about live-content balance or playability is made.
- No known task 06 issue remains. Live-pack public draw wrappers bind in task 07 after
  approved content exists, as in the existing task 03 handoff. Android LinkedIn evidence
  is still the accepted ADR 0002 release risk. Dependency PRs #4 and #5 are merged.

**After task 06 delivery, next task: 06b — author and obtain Harry's approval for `docs/content-table.md`.**
Task 07a's engine dependencies are now complete. No task 06b/07 work started; stop here.

Task 06 delivery status before user authorization (historical):

- Implementation is committed locally as **03e4d7f**, with one task 06 commit rebased onto
  the identical merged main baseline. Local working tree is clean after documentation commits.
- Remote push and PR creation were rejected by automatic approval review because exporting
  the private repository changes to GitHub needs explicit user authorization for that
  destination. No task 06 branch was pushed and no task 06 PR or hosted run was created.
  The prepared PR description is retained locally; approval is needed only for remote delivery.
- Implementation and every currently activated local check are complete. Hosted evidence is
  outstanding until remote delivery is authorized. No task 06b work was started.

## Task 06 review fixes — October 12, 2026

Read [the supplied review](task-06-review.md); its initial findings are preserved with
resolution notes appended. Remote delivery is still pending authorization; the status
and milestone table now distinguish local implementation from completed PR/hosted CI.
Tasks 03/04 remain complete, and PRs #4/#5 are already merged.

- Schedule validation now rejects due turns beyond `turn + 1` and requires one metadata
  parent present in the pack and recorded in authoritative `seenEventIds`. Far-future,
  orphan, ambiguous and missing-parent regressions cover both draw and candidate APIs.
- Filler no longer enters `seenEventIds`, following tech-spec.md's base-family/callback
  definition. The timeout golden changes only that list; all effects, log and score
  remain identical. The spec, tests and thresholds were not relaxed.
- Added a sixth frozen JSON golden with mixed rarities and weights, a minute/absence-gated
  family, two uncommon negatives separated by the fairness guard, release during dialogue,
  an absence presentation on the next event, and Call it with progress. Seed
  `golden-mixed-77` yields the recorded score **477**. The five original outcomes remain.
- Generated runs now include family conditions, Sam/Priya absence presentations, expert
  requirements, releases during pending dialogue and generated early Call it. Every case
  still checks deterministic replay, fairness, preview-enabled choices, cost at the current
  headcount and termination. The all-email property retains all 17 families/3 callbacks
  and its exact turn-49 timeout.
- Expanded tests initially exceeded the unchanged five-second timeout. The fixture freeze
  helper now caches only graphs whose descendants it already froze, and unchanged pending
  states are not compared twice. No case count, assertion about a release, timeout, coverage
  threshold or gate was reduced.
- Restored the original acceptance criteria in task rows 05/06 and fixed the stale execution
  handoff. Task 07a explicitly includes speaker-presence validation; task 07b explicitly
  includes public draw/candidate binding and wrapper tests. No task 07 implementation added.

Review-fix evidence on **Node 24.21.0 / pnpm 10.34.6**:

- `pnpm check`: **226 tests in 21 files**, including **six goldens**; type/lint/format pass.
- Core coverage: **346/348 lines (99.43%)**, **284/290 branches (97.93%)**;
  draw **47/47 lines, 67/67 branches**. Existing 90%/85% floors unchanged.
- `pnpm build && pnpm size`: **70,407/122,880 gzip JS bytes**, **0/409,600 image/font bytes**.
- `pnpm e2e`: **18 passes** on the three required profiles, no retries/skips/browser errors.
- The review's Node 22 passes are supplemental evidence from Claude, not a hosted Node 24
  result. This task's recorded local gates use the installed Node 24 runtime.

**Task 06 local fixes verified; remote PR and hosted Node 24 evidence outstanding.**
Push/PR approval is the only remaining delivery input. Next blueprint task after delivery:
**06b**. No subsequent task work was started.

## Task 06 hosted delivery — October 12, 2026

Harry explicitly authorized push, PR creation and merge. The earlier local-only delivery
blocker is resolved. `feat/task-06-draw` was pushed and [PR #7](https://github.com/hsivasambu/meeting-sim/pull/7)
opened against main, including the supplied review and all review fixes.

- [Hosted Node 24 quality run](https://github.com/hsivasambu/meeting-sim/actions/runs/38286583589)
  passed on **b221c9f**: frozen install, check, build/size, browser checks and report upload.
- Downloaded reports verify **226 unit/property/golden passes, zero failures/errors**;
  **18 E2E passes, zero skipped/flaky/unexpected**, with coverage/browser HTML reports.
- Hosted core coverage matches local: **346/348 lines (99.43%)**, **284/290 branches
  (97.93%)**. All original budgets, assertions and gates remain unchanged.
- This evidence update changes documentation only and passes formatting, document
  consistency and whitespace checks. Required hosted checks rerun on the final PR head
  before the user-authorized squash merge; no required check is bypassed.

**Task 06 complete and delivered via PR #7. Next task: 06b.**
Dependencies 03/04 remain complete, and no subsequent task implementation was started.
Android LinkedIn validation remains the accepted ADR 0002 release risk.

## Task 06b completion and local verification — October 12, 2026

**Task 06b complete: authored, verified locally and approved by Harry (D18).**
Its sole dependency, **00b**, is complete: the accepted October 8 architecture
review is recorded in ADR 0001 and incorporated in the design and technical spec.
Tasks 03–06 are also present, allowing engine-backed checking of the hand examples;
they are not additional dependencies for this design task.

- Created [the content table](content-table.md): all **17 base families**, **13
  ordered variants**, **3 scheduled-only callbacks**, repeatable filler, **30
  response sets / 78 authored response rows**, four disabled reason keys and
  six epilogue lines spanning the four endings and three success risk tiers.
  Shared response sets explicitly expand into complete arrays when transcribed.
- Preserved the sample scope/support effects, fixed first-two substantive
  availability, explicit negative flags, the three existing callback pairs,
  mandatory arrival joins, no reentry and all room booking paths. No rules,
  formulas, ADRs, dependencies, runtime code, tests or thresholds were changed.
- A temporary Markdown audit checked family IDs/counts, unique response IDs,
  1–3 choices, numeric ranges, zero-minute email restrictions, always-enabled
  fallbacks, authored reason keys, callback relationships, joins and booking
  paths. Maximum label **24/24** and line **84/90 Unicode code points**.
  Two initially overlong labels were shortened; the limits were unchanged.
- Constructed engine checks on the table's temporary injected pack confirm the
  no-gift route reaches **P = 100, R = 0 in 10 resolutions / 38 minutes**:
  **152 person-minutes** when arrivals are released, **173** when retained.
  Draw candidates and actual draws were used with separately constructed seeds
  per step; this is feasibility evidence, not a fixed-seed simulation or balance
  measurement. The temporary audit was removed after verification.
- Engine checks also passed **960 attendance/risk/minute candidate scenarios**,
  all three callback deliveries with absent experts, release during delivered
  dialogue and four booking boundaries. The table includes constructed scenarios
  for every absence/risk variant for later transcription tests.
- At Harry's request all currently activated local checks were run, although the
  spec permits document-only consistency checks for this task. On **Node 24.21.0 /
  pnpm 10.34.6**, `pnpm check` passes: types, zero lint/format errors and **226
  unit/property/golden tests in 21 files**, including the existing six goldens.
  Core coverage is **346/348 lines (99.43%)**, **284/290 branches (97.93%)**,
  above the unchanged 90%/85% thresholds. `pnpm build` and `pnpm size` pass:
  **70,408/122,880 gzip JS bytes**, **0/409,600 image/font bytes**. `pnpm e2e`
  passes **18 tests** on Pixel 7 Chromium, iPhone 14 WebKit and desktop Chromium.
  Local pnpm required execution outside the sandbox after filesystem EPERM;
  no package or test configuration was altered to resolve that environment issue.
- Document source/link consistency, formatting and `git diff --check` pass.
  These are local results; no hosted task 06b run or PR is claimed. Content
  validation (07a) and simulation (08a onward) are not activated or reported green.

**Approval recorded October 12, 2026:** Harry explicitly said, “Table is approved.
Wrap up this task before I get Claude to review.” No content revisions were requested.
All task 06b content acceptance criteria were complete at this initial approval.
At that point Claude's review was still pending;
no remote delivery or hosted task 06b checks are claimed. Final approval-recording
edits change documentation status only and pass formatting, link consistency and
whitespace checks; the full local gate evidence above remains applicable.

Next implementation task: **07a — content validator and index**; task 07b later
transcribes the approved table. No task 07 work started. Android LinkedIn evidence
remains deferred under ADR 0002. The subsequent review resolution is recorded below.

## Task 06b Claude review resolution — October 12, 2026

Read [the supplied review](task-06b-review-20261012T190907-6e3d.md), including its
recorded directions for the reservation trap and arrival benefits. Harry's current
instruction, “Review, address and implement Claude's review,” authorizes applying
those specified revisions to the previously approved table and the two attendee
descriptions. The initial approval remains recorded separately; no extra scoring
rule, ADR exception or unrelated content change is inferred.

- Moved task 06b onto **docs/task-06b-content-table**, based on **origin/main
  c63516e**, preserving the task 06 baseline and the existing document work.
  Committed as **5f4c8e0** and delivered in [PR #8](https://github.com/hsivasambu/meeting-sim/pull/8).
  Hosted verification evidence is recorded below.
- Replaced press-present / hear with **legal** (hear, 6 minutes, +20 P, -1 R),
  requiring Legal; retained Morgan's owner option and the email fallback. Replaced
  room-booked / park with **vp** (owner, 1 minute, 0 P/R, booking end 60), requiring
  the VP. Added reason copy for both before arrival and after release. The design
  attendee rows now say what retaining each arrival enables. No fourth choices.
- Kept hear's five-minute reservation trap and timebox's one-minute :45 response.
  The VP option deliberately ties timebox's utility; **timebox precedes vp** in
  ASCII order, correcting the review's wording while preserving its intended
  Greedy result. Lookahead's ending-sensitive next-step term is documented in the
  08a/09 handoff instead of claiming every utility policy always accepts :45.
- Set stand-clear / hear's authored risk delta to zero; stand-risk remains -1.
  The effective result is unchanged because the base is only drawn at R = 0.
  The VP's legitimate parked questions remain tagged park; room booking no longer
  increments the parking counter or supplies a parked-item moment.
- Added committed-test acceptance requirements to task 07b's content checklist:
  ten-turn routes, all 13 variants, four revised room boundaries and both arrivals'
  conditional choices. Engine rule tests/goldens remain fixture-only. Task 07b owns
  fixed results copy; task 15 owns reviewed dynamic moment templates and length
  tests. The original row-37 task 06b acceptance text is unchanged.
- Clarified “no permitted release” and “Legal joins at T = 15”; Legal has no
  minute-15 gate. The VP's gate remains unchanged.
- Rechecked the revised table with a temporary injected pack: **17 families,
  3 callbacks, 13 variants, 30 response sets / 78 rows, 6 reason keys**; copy maxima
  **24/24 labels and 84/90 lines**. Both ten-turn routes still reach **100 P,
  0 R in 38 minutes**, with **152/173 person-minutes**. New expert enable/disable
  and pending-release checks, all four updated booking boundaries and **960
  attendance/risk/minute candidate checks** passed. This remains constructed
  feasibility evidence, not simulated balance; reproducible live tests land in 07b.

Review-fix checks on **Node 24.21.0 / pnpm 10.34.6**:

- `pnpm check`: **226 tests / 21 files**, all types, lint and format checks pass.
  Core coverage remains **346/348 lines (99.43%)**, **284/290 branches (97.93%)**;
  unchanged 90%/85% thresholds.
- `pnpm build` / `pnpm size`: **70,408/122,880 gzip JS bytes** and **0/409,600
  image/font bytes**, all budgets pass.
- `pnpm e2e`: **18 passes** on the three required browser profiles.
- Document links resolve, `git diff --check` passes and the original 06b acceptance
  row matches origin/main after whitespace normalization. No gate was weakened.

Hosted [Node 24 quality run](https://github.com/hsivasambu/meeting-sim/actions/runs/38296846168)
passes on **5f4c8e0**: frozen install, check, build/size, all browser tests and report
upload. Downloaded reports verify **226 unit tests, zero failures/errors** and
core **346/348 lines (99.43%)**, **284/290 branches (97.93%)**; the hosted browser
log records **18 passes**. No test, threshold or required check was bypassed.
The final evidence-only documentation commit receives its own required hosted run.

**Task 06b content and Claude review fixes are complete and delivered via PR #8.**
The PR remains open for review; no merge is performed by this task.
Next blueprint task remains **07a**; no task 07 implementation started.

## Task 07a dependency audit and specification blocker — October 12, 2026 (historical; resolved below)

Task **07a remains incomplete**. Dependencies 04–06 are complete: the current
history contains task 04 (`686f5a8`), task 05 (`d3906e8`) and task 06
(`c63516e`), with their implementation and tests present. The evidence above
records their passing local/hosted gates. Task 06b approval is also recorded.

Before implementation, the required content-validation gate exposed a conflict:
the technical spec requires every fixture pack to pass validation, including
1–3 responses, progress −10…+25 and risks −1…+1. The frozen `goldenPack` and
`mixedGoldenPack` in `src/core/engine/fixtures/goldens.ts` instead contain
4–5 responses, progress +50/+100 and risks +2. D21 freezes these fixtures;
the technical spec says goldens change only when engine behaviour changes.
Task 07a changes validation, not those engine behaviours.

Following CLAUDE.md's instruction to stop when documents conflict, implementation
is paused pending Harry's decision. Proposed resolution for review: distinguish
synthetic engine-rule packs from playable content packs, retaining structural
validation for all packs and authored layout/tuning limits for playable packs.
This proposal is **not approved or implemented**. No tests, thresholds, fixtures,
CI configuration or accepted ADRs have been changed.

Checks for this audit: document consistency and plan formatting only. Task 07a
implementation gates have not run or passed. The default shell reports Node 22;
the installed Node 24 runtime needs to be selected for implementation verification.
Next task remains **07a**, after the validation scope is explicitly resolved;
task 07b has not started.

## Task 07a initial local evidence — October 12, 2026 (superseded by review fixes below)

Task **07a is complete locally** on `feat/task-07a-content-validation`. Dependencies
04–06 were verified in the current history and source tree as recorded above;
their existing regression tests and frozen goldens pass unchanged.

Harry approved the documented distinction between synthetic engine-rule packs
and playable content packs in this chat on October 12. The technical spec's
Content validation section records the scope: structural safety for both,
authored layout/tuning/expert/MVP relationship constraints for playable packs.
The earlier blocker is resolved. No accepted ADR, existing fixture/golden, test,
threshold, CI workflow, lockfile, scoring formula or gameplay tuning was weakened
or changed.

- Added pure `validateContent(pack, options)` returning path-addressed issues,
  with small helper/type modules and centralized validation constants. Checks
  include namespace uniqueness, references and file stems, condition/effect
  safety, zero-minute emails, callback parentage/delay/chains, reachable schedulers,
  designated arrivals and booking paths, fallback options, expert requirements,
  first-two substantive availability, filler and Unicode copy limits.
- Enumerated all legal rosters, running integer minutes and risks to check speaker
  presence and constructed first-match variant reachability. Tests also assert
  actual draw-API absence and overlapping-variant witnesses. Shared fixture,
  golden and complete generated-run packs pass structural validation; intentionally
  broken cases are rejected. New validation tests preserve frozen inputs.
- Added `core/content/index.ts` for existing relationship metadata and routed
  the sole engine content importer through it. Live events, attendee/title copy,
  complete catalogs and public draw binding remain task 07b; no fabricated live
  pack or dialogue has been added. Catalog support checks future attendee roles,
  collectible titles, disabled reasons and moment/epilogue copy when supplied.
- **Node 24.21.0 / pnpm 10.34.6:** `pnpm check` passes **272 tests in 22 files**,
  including the new content-validation gate. Types, lint and format pass with zero
  errors/warnings. Core coverage is **550/552 lines (99.64%)** and
  **563/570 branches (98.77%)**, above the unchanged 90%/85% floors.
- `pnpm build` and `pnpm size` pass: **70,410/122,880 gzip JS bytes**;
  images/fonts **0/409,600 bytes**. `pnpm e2e` passes **18 tests** across
  Pixel 7 Chromium, iPhone 14 WebKit and desktop Chromium, with no console errors.
  Document links/decision-register consistency and diff whitespace checks pass.
- Checks use the installed Node 24 environment with access to the existing
  dependency tree. Restricted-shell dependency-type errors were resolved by that
  environment, without dependency or configuration changes. No hosted task 07a
  CI or PR delivery is claimed. Simulation is not activated until task 08a.

No known task 07a defect remains. Android LinkedIn evidence is still deferred
under ADR 0002. Next task: **07b — transcribe the approved live content table,
provide the complete live pack/catalog, validate it and bind/test public draw
wrappers**. Task 07b has not started; stop at task 07a.

## Task 07a Claude review fixes and delivery — October 12, 2026

Harry authorized addressing [the supplied review](task-07a-review.md) and merging
task 07a. [Resolution notes](task-07a-review-resolution.md) address all eight
findings. The initial 272-test evidence above is historical.

The expert validator now follows the review's base/expert/absence-set distinction
and accepts every approved content-table row without changing content. Removing
the requirements from the four failing-tests/support-training expert responses
still fails validation. All four reported counterexample patterns have regression
coverage. The spec and gate scope are consistent; the plan's original acceptance
text is restored, with explicit live-catalog and stale-reason-key checks for 07b.
Expected MVP relationships are centralized, condition keys are checked, and the
attendee registry has a compile-time exhaustiveness test. Boundary representatives
are proved equivalent to exhaustive enumeration; no state cases or tests were
dropped to obtain the roughly 0.4-second validation test time under coverage.

**Local Node 24.21.0 / pnpm 10.34.6:** `pnpm check` passes **277 tests in 25 files**;
types, lint and formatting pass. Core coverage is **588/590 lines (99.66%)** and
**599/607 branches (98.68%)**, above unchanged 90%/85% floors. Build/size pass at
**70,410/122,880 gzip JS bytes**, **0/409,600 image/font bytes**. All **18 E2E**
checks pass across Pixel 7 Chromium, iPhone 14 WebKit and desktop Chromium.
Document consistency and diff whitespace checks pass. No dependency, lockfile,
CI, scoring, tuning, approved content or frozen golden change.

Delivery uses merged task 06b main (`9ed47b4`), whose tree matches the former
pre-squash base (`b88a56f`). Hosted Node 24 evidence and the final merge are pending;
task 07a delivery is not yet complete. Next task after delivery: **07b**, with
the complete live pack/catalog and public draw bindings; 07b has not started.

## Task 07a hosted delivery — October 12, 2026

Task **07a implementation and review fixes are complete**, delivered via
[PR #9](https://github.com/hsivasambu/meeting-sim/pull/9), based on merged 06b main.
All eight supplied review concerns are addressed in the resolution notes above.

[Hosted Node 24 quality run](https://github.com/hsivasambu/meeting-sim/actions/runs/38302537612)
passed on `f2b7aa1`. Downloaded reports confirm **277 tests**, zero unit failures
or errors; **18 E2E passes**, zero skipped/flaky/unexpected; core **588/590 lines
(99.66%)** and **599/607 branches (98.68%)**. Logs confirm Node **24.21.0**, passing
build/size (**70,410/122,880 gzip JS bytes**, **0/409,600 asset bytes**), and every
activated gate. Vercel's PR preview also reports success. The earlier hosted
delivery blocker is resolved; this evidence-only documentation commit receives
its own required quality run before Harry's authorized squash merge.

No task 07a defect remains; no test, threshold, content, tuning, frozen golden or
CI rule was weakened. Task 02's Android release evidence remains deferred under
ADR 0002. Next blueprint task: **07b**, with its explicit complete live catalog,
approved-table transcription and public draw-wrapper acceptance. Stop here;
no task 07b implementation has started.
