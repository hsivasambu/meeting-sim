# Task 11a review: store, beat machine and persistence

Repo: `C:\dev\meeting-sim`, branch `feat/task-11a-store` at `f9a372c`, which is the tip of
`feat/task-08a-simulation` (PR #12, still **open**). The branch is not pushed. All task 11a
work is uncommitted: two modified files (`docs/implementation-plan.md`, `vite.config.ts`)
and three new source files plus two test files (`src/store/gameStore.ts`,
`src/store/persistence.ts`, `src/core/content/storeConfig.ts`, `src/store/*.test.ts`).

Reviewed against the plan's 11a/11b rows and Milestone D store bullets
(implementation-plan.md:41, 46, 226–234), tech-spec.md (architecture 63–69, repository
layout 121–123, seed 163 and 295, turn order rule 7 at 310, Meeting turn flow D17 411–428,
Persistence 460–463, React/error boundary 482–486, gate table 527–537), design-doc-v2.md
(Endings, titles and the results card 207–250), ADR 0001 and Harry's 06b decisions. The
review was read-only. Nothing in the repo was edited or staged; `git status` was identical
before and after the gate runs.

## Verdict

**The store is small, correct against the D17 table and well guarded; no behavioural bugs
found in what it does.** Every action checks its screen and beat, only `start` and
`continue` draw, disabled or unknown responses are ignored before `resolve`, a refused
release leaves the snapshot untouched, final outcomes wait for `continue`, Call it skips the
outcome beat, and restart keeps unlocks. Persistence is genuinely failure-safe.

Two gaps will block task 12a and need a doc decision first (findings 1 and 2: how
`assetsReady` becomes true, and how the HUD learns why a release is refused). The process
issues repeat for the fourth time (findings 3 and 4). The line-ending fix is now merged.

## Gate results

| Gate          | Local (Node 22.18.0, pnpm 10.34.6)                                                                                   | CI (Node 24)            |
| ------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `pnpm check`  | Pass (exit 0). 326/326 tests in 31 files; 20 new (11 store, 9 persistence). `src/store` 97.91% lines, 100% branches. | Not run (not committed) |
| `pnpm sim:ci` | Pass (inside `check`). Greedy 100% / 920 / 11 turns, Random 69.6% / 552.5 / 15, identical to 08a.                    | Not run                 |
| `pnpm e2e`    | Pass. 18/18 on Pixel 7, iPhone 14 and desktop Chromium (shell and probe specs only).                                 | Not run                 |

Counts match the plan's execution record. The only uncovered store line is the
`useGameStore` hook (gameStore.ts:122). The plan records Node 24.21.0; this laptop still
has only Node 22.18.0 on PATH, so I could not reproduce a Node 24 run. Hosted CI remains
the authoritative Node 24 gate.

## Harry's 06b decisions

`git diff --exit-code HEAD -- src/core` is clean apart from the new untracked
`storeConfig.ts`, so no event, rule or scoring changed. The room-booking full-hour trap,
the single Legal response and the single VP response at 0 progress all still hold.

## Findings

### 1. Nothing sanctioned can make `assetsReady` true (high; blocks 12a; convention left to code)

D17 makes `start` legal only when assets are ready and says the action table is the
complete list that `ui` dispatches. The store starts with `assetsReady: false`
(gameStore.ts:74) and has no action that changes it, so the exported singleton
`gameStore` can never start a meeting. The tests work around this with
`store.setState({ assetsReady: true })` (gameStore.test.ts:70) or the `createGameStore`
option, neither of which production code has a documented right to use.

The plan record defers it: "the later preload integration can update the store's readiness
field". That is the recurring pattern of a convention settled in code without a tech-spec
line first (CLAUDE.md guardrail 10). It also matters immediately, because 12a is text-only
with no art, so someone has to decide what "ready" means there. A boolean also cannot
express the spec's "offers a retry if loading fails" (tech-spec.md:409).

Fix: propose the doc change before 12a. Options are a store-owned loading action added to
the D17 table (for example `assetsLoaded` / `assetsFailed`, with a `loading | ready | failed`
field), or a written rule that a named preload module (not `ui`) may set the field. Also
state what 12a does with no assets. Harry should approve because it edits the "complete
list".

### 2. The HUD has no sanctioned way to know why a release is refused (medium; blocks 12a/12b)

D17 says a refused release "changes nothing and the HUD shows why", and the turn-flow
notes say portraits that cannot be released "show the reason instead" before any tap
(tech-spec.md:421, 426). Plan 12b requires release restrictions to be reflected
immediately. Guardrail 1 forbids `ui` from computing eligibility.

Neither the store nor the engine exposes the reason. `release` returns `{ ...state }` on
refusal (state.ts:44) and the public index (index.ts) has no read-only release check.
The store correctly discards refusals, but that also discards the only signal. 12a's
playtest step "release Gary" will need this.

Fix: add a doc line and a pure read-only engine export (for example
`releaseBlock(state, who)` returning `null | 'owner' | 'absent' | 'minimum'`, with reason
copy in content), mirroring how `previewResponse` serves disabled choices. This belongs in
the engine, so it is probably its own small change before 12a rather than part of 11a.

### 3. Marked complete again before commit, PR and hosted CI (medium; process, fourth repeat)

The status line, the 11a row, the B2 progress row, the plain-language guide ("Tasks 00–08a
and 11a ... are implemented", 11a check switched to **Now**), the closing paragraph and the
new task section all say 11a is complete and the next task is 12a. Nothing is committed,
the branch is not pushed, there is no PR and no hosted run. The task section is honest that
evidence is local, but "complete" goes out in six places. Same as 07a finding 2, 07b
finding 1 and 08a finding 1.

**The branch is stacked on unmerged work again.** `git log origin/main..HEAD` shows the
three 08a commits (`c29eef0`, `ac4c4a0`, `f9a372c`) from open PR #12. The plan says 08a "is
not a dependency of 11a", so a PR from this branch would carry the whole 08a diff. Either
wait for #12 to merge and rebase onto `origin/main`, or open 11a explicitly as stacked on
#12 and say so in the PR.

Fix: say "implemented locally; PR and hosted CI pending" until the PR exists and CI is
green, then flip to complete.

### 4. Acceptance criteria overwritten with evidence (low; process, repeat)

The 11a row's acceptance column (implementation-plan.md:41) was replaced with "Complete
October 12, 2026: ... all activated local Node 24 checks pass". The original criteria
("Action table behaviour tested; double input ignored; restart keeps unlocked titles;
failure-safe persistence") are gone from the table. The 07b resolution recorded that
acceptance criteria are preserved; this undoes that for 11a. Restore the original text and
keep the status in the progress table and the execution record.

### 5. Store shape and file layout extended without a doc line (low; convention in code)

The plan record says "No task split or new rule was needed", but two small things were
decided in code:

- `breakdown: ScoreBreakdown | null` is a sixth store field. D17 lists exactly `screen`,
  `beat`, `game`, `unlockedTitles` and `assetsReady` (tech-spec.md:413). Keeping the
  computed score is sensible; add it to the D17 sentence.
- `src/core/content/storeConfig.ts` is not in the repository layout (tech-spec.md:114–121).
  `probeSettings` in `probeCopy.ts` is a precedent for non-text settings in content, so this
  is not a layering break, but add the file to the layout or fold the values into an
  existing module.

### 6. Most of 11b's scope is now done in 11a (low; plan hygiene)

11b is "results computation, title unlocking and persistence edge cases, error-boundary
recovery" with acceptance "All endings reach results; fresh starts clear run data and keep
titles". 11a's tests already cover all four endings reaching results, replay keeping titles,
corrupt/blocked storage and restart from any screen. The record notes this, but the 11b row
is unchanged. Before 11b starts, note in the plan what genuinely remains (the error-boundary
component itself, reload-persists-titles in a browser) so 11b is not re-done or skipped.

### 7. A blocked read followed by a working write erases stored unlocks (low; edge case)

If `getItem` throws or returns corrupt JSON at load, `unlockedTitles` starts empty, and the
first results screen writes only this session's titles, overwriting what was stored
(gameStore.ts:55–61, persistence.ts:30–43). Corrupt data being replaced is fine; a
transient read failure losing real unlocks is not. Low likelihood, since storage is usually
blocked for both calls. Cheap guard: skip the write when the initial read threw (as opposed
to returning `null`). Unknown IDs (for example from a future version) are also dropped on
the next write; acceptable for v1, but worth one sentence in Persistence.

## Test gaps

1. **No store run against the real draw.** Every store test mocks `drawEvent` to return one
   fixed presentation (gameStore.test.ts:9–18). `continue` → real `drawEvent` with
   callbacks, fillers, absence variants and joins is never exercised through the store until
   12a's E2E. Add one integration test that plays fixed seeds with the real engine, picking
   the first enabled response, and asserts it reaches `results` within 50 turns. It asserts
   reachability, not tuning, so guardrail 9 is respected.
2. **Seed is checked only on the first start.** Assert that a replay after `restart` calls
   `getRandomValues` exactly once more and produces a fresh 16-hex seed.
3. **Stale choice handlers.** The plan asks to prevent duplicate resolution from "stale
   choice handlers" (implementation-plan.md:229). Response IDs repeat across events
   (`timebox` 26 times, `hear` 25), so a stale `choose('timebox')` that lands in the next
   event's `choosing` beat would resolve that event. The beat guard covers taps and key
   repeats within one event; across events this is a UI concern for 12a (bind handlers to the
   presented event, ignore `event.repeat` on Enter so a held Enter cannot `continue` and then
   `finishTyping` the next line). Record it as a 12a test requirement.
4. **`useGameStore` is uncovered** (gameStore.ts:122). Fine to leave to 12a, as the record
   says.

## Checked and fine

- `start` guards title + ready, calls entropy once with 8 bytes and builds 16 lowercase hex
  characters (matches tech-spec.md:163, 295).
- `choose` uses `previewResponse(...).enabled` from the engine instead of re-deriving
  eligibility; repeated and out-of-beat calls return the same snapshot (tested by reference).
- `release` and `callIt` are limited to `speaking`/`choosing`; release in either beat keeps
  the delivered presentation and disables the expert response afterwards.
- Endings: `cancelled`, `called-early`, `decision` and `time-expired` are all tested; final
  outcomes persist only after `continue`.
- Persistence uses only `tcbae:v1:titles`, validates IDs against the title catalog,
  deduplicates, and catches storage acquisition, read, parse and write failures.
- Lint boundaries: the store imports only `core` and `store`; no `as`, `!`, enums or default
  exports. Coverage thresholds are unchanged (`src/core/**` 90/85); adding `src/store` to
  `include` only reports it.
- PR #11 (line endings) is merged into `origin/main` (`2163036`), so that recurring finding
  is resolved. Local `main` is stale at `b98ff51`; `git fetch` before rebasing.

## Suggested order for Codex

1. Restore the 11a acceptance text and change "complete" to "implemented locally" (findings
   3, 4).
2. Propose the tech-spec lines for asset readiness, release refusal reasons and the
   `breakdown` field for Harry's approval (findings 1, 2, 5).
3. Add the real-engine store run and the replay-seed assertion (test gaps 1, 2).
4. Commit, rebase onto `origin/main` once #12 merges (or open as stacked), open the PR and
   record hosted Node 24 CI.
