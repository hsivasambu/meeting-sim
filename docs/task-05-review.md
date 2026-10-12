# Task 05 review: utility, score and titles

Repo: `C:\dev\meeting-sim`, branch `feat/task-05-score-titles` (local only, not pushed).
Base: `d5144a5` (task 04 head). **Task 05 is entirely uncommitted**: 4 modified files
(`docs/implementation-plan.md`, `constants.ts`, `index.ts`, `utilityFraction.ts`) and 5 new
untracked files (`score.ts`, `titleRules.ts`, `fixtures/scores.ts`, `score.test.ts`,
`titleRules.test.ts`). There is no task 05 PR; task 04's [PR #4](https://github.com/hsivasambu/meeting-sim/pull/4)
is still open. Reviewed the working tree against implementation-plan.md task 05 row (line 35)
and result section (737–803), design-doc-v2.md Scoring (155–205) and Endings/Titles
(207–246), tech-spec.md Engine contracts (259–280, 314–316) and Testing gates (488–499),
and ADR 0001. Review was read-only; nothing in the repo was edited or staged.

## Verdict

**Fix finding 1, then commit and open the PR.** The formulas match the design exactly: all six
worked examples reproduce, component rounding is half-up and exact, efficiency uses integer
person-minutes (360/90), the display rate cannot move a score, and the twelve title
predicates and display priority (12, 9, 10, 11, 1–8) match the design table. One real defect:
decision quality is persisted as a rounded float, so the "exact" unrounded-q comparison for
Played It Right (and the D half-up rounding) can disagree with the true average. I reproduced
a run whose true average q is exactly 0.85 that is denied title 9.

## Gate results

| Gate                                                       | Local (Node 22.18.0, pnpm 10.34.6)                                                      | CI (Node 24)         |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------- |
| `pnpm check` (typecheck, lint + prettier, test + coverage) | Pass. 189/189 tests in 17 files. Core 282/284 lines (99.30%), 210/216 branches (97.22%) | Not run (not pushed) |
| `score.ts`, `titleRules.ts` coverage                       | 100% lines and branches                                                                 | —                    |
| `pnpm e2e`                                                 | Pass. 18/18 on Pixel 7, iPhone 14, desktop Chromium                                     | Not run              |

These match the plan's recorded evidence exactly. The plan says its run used Node 24.21.0;
this laptop's `.tools/fnm` only lists the system Node 22, so I ran on 22 (same as the task 04
review). Node 24 CI is still the authoritative gate and has no task 05 result yet. The
working tree was unchanged after both runs (reports are git-ignored).

## Findings

### 1. Persisted float quality breaks the exact title 9 threshold and D rounding (medium; scoring bug)

`resolve.ts:36-41` computes q exactly in BigInt, then stores it through `fractionNumber` as a
JS number, so repeating fractions are rounded (2/3 → 0.6666666666666666, 11/15 →
0.7333333333333333). `score.ts:20-45` then rebuilds an "exact" fraction from that rounded
decimal with `decimalFraction`, so the comparison is exact against the wrong number. The
design (design-doc-v2.md:188) says title thresholds use the _unrounded_ average q, and
`score.ts:34` documents that intent.

Reproduced through the public API (`initialState` → four `resolve` calls on `pending` fixture
events with live `UTILITY_RULES` → `callIt`), choosing progress 2 of {0,2,3}, 1 of {0,1}
twice, and 11 of {0,11,15}:

- Persisted qualities: `[0.6666666666666666, 1, 1, 0.7333333333333333]`; true average
  (2/3 + 1 + 1 + 11/15) / 4 = **0.85 exactly**.
- Ending `called-early`, so Played It Right should unlock. `earnedTitles` returns only
  `['take-this-offline']`.

The same root cause can push D across a .5 boundary the wrong way (e.g. true q = 1/3 and
7/100 give D = 60.5 → 61, but the stored-decimal sum gives 60.4999… → 60). I inferred that
case from the arithmetic; I did not build a reachable run for it.

Fix: persist q exactly. Utility numerators are small safe integers at the current weights
(denominator 30), so `DecisionRecord` can carry integer `qualityNumerator` /
`qualityDenominator` (keeping `quality: number | null` for display), and `score.ts` reads
those. That keeps "no BigInt state data" and needs a one-line spec change to the
`DecisionRecord` shape (tech-spec.md:213). Add a regression with the four-decision run above.

### 2. Task 05 is uncommitted, unpushed and has no PR, but the plan marks it complete (medium; process)

`git status` shows all task 05 work as working-tree changes on a local branch. The plan edit
(implementation-plan.md:3, 35, 59–61, 287, 293) records task 05 as "Complete" and points
readers at `feat/task-05-score-titles`, which has no commits and does not exist on GitHub.
Plan line 280 asks for one task per branch/PR with a Conventional Commit. Nothing is lost yet,
but the evidence and the code exist only on this laptop. Commit, push and open the PR (on top
of PR #4, or after it merges) so CI on Node 24 produces the hosted evidence the plan says is
missing.

### 3. `score` / `earnedTitles` accept a running meeting (low; contract guard)

`titleRules.ts:25` (`s.ending !== 'decision'`) is true when `ending` is `null`
(`state.ts:33`), so a mid-meeting state with a high average q earns Played It Right, and
`score` happily scores it. The store only calls these after the run ends (tech-spec.md:365,
367), so this is unreachable today, but every other engine action rejects the wrong phase
with a typed `EngineError`. Either throw on `phase !== 'ended'` or test and document that
callers must pass ended states.

### 4. Title predicates are only tested on synthetic states (low; test gap)

`titleRules.test.ts` and `fixtures/scores.ts` build end states by spreading overrides onto
`fixtureState`, and every quality is a short decimal (0.9, 0.85, 0.6, 0.145…). Nothing feeds
`resolve`-produced qualities into `score`/`earnedTitles`, which is exactly why finding 1
slipped through. Tech-spec.md:328 also asks for a constructed reachability test per title;
that can reasonably wait for goldens (task 06) or content (07a), but at least one
`resolve` → `callIt` → `earnedTitles` test belongs here.

## Checks that passed

- Outcome: `400 − min(60R, 200)` on success, `round(1.8P)` on failure; 1.8P never lands on
  .5 for integer P, so float rounding is safe (`score.ts:59-63`).
- Efficiency: `300·min(P,100)·clamp(360−pm, 0, 270) / (100·270)` with integer numerators;
  exact halves (P=15, pm=171 → 31.5 → 32) round up (`score.ts:64-72`).
- Decisions: exact BigInt half-up, nulls skipped, zero scored decisions → 0 (`score.ts:20-55`).
- `displayCost` = pm × 1000 / 60, `formatCost` whole dollars with en-US separators; the
  rate-mock test shows titles and scores unchanged at 2400/hour (`score.test.ts:197`).
- Titles: all twelve predicates read counters, not the log; Gary-Free Zone uses
  `spokenAttendeeIds` so a release after his line is excluded; output order is the design's
  display priority; empty array when nothing is earned (result UI owns "Decision Made").
- Public surface adds only `score`, `displayCost`, `formatCost`, `earnedTitles`
  (`index.ts:49-50`); `decimalFraction` is exported module-internally only.
- New thresholds are centralized in `constants.ts:71-77`.

## Task 04 findings: carried over or fixed?

All six task 04 findings were resolved in `ecede54` before task 05 started; task 05 keeps them.

| Task 04 finding                              | Status at `d5144a5` + task 05 tree                                                                                                                                                                                                                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Float-equality ties in decision quality   | **Fixed.** `utilityFraction.ts` computes exact BigInt utility numerators; `resolve.ts:30-41` compares `best === worst` on BigInts. `publicUtilityRegression.test.ts` pins the reported A/B tie at headcounts 6 and 2 with live weights. (Its float _storage_ of q is the source of task 05 finding 1.) |
| 2. Preview accepts responses resolve rejects | Fixed: shared `responseValidation.ts` runs inside `evaluateResponse`, used by both preview (`preview.ts:23`) and resolve                                                                                                                                                                               |
| 3. Content IDs hard-coded in engine          | Fixed: arrival attendees and booking event IDs come from `eventRules` in `core/content/engineRules.ts`                                                                                                                                                                                                 |
| 4. Spec not updated for new fields/modules   | Fixed: tech-spec.md:101-105 lists the new modules; line 171 documents `releasedAttendeeIds`                                                                                                                                                                                                            |
| 5. Disabled reason engine-generated          | Fixed: `Response.disabledReasonKey` (tech-spec.md:308); preview returns the authored `reasonKey`                                                                                                                                                                                                       |
| 6. Split-as-commits PR pattern               | Resolved by decision: plan line 22 records Harry accepting larger single PRs on October 11                                                                                                                                                                                                             |
| Test gap: narrow property test               | Fixed: `transitions.test.ts` now replays multi-choice actions, releases, joins, bookings and callbacks with bounded quality                                                                                                                                                                            |

## Plan acceptance checklist (task 05 row)

| Criterion                           | Status                                                                                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Internal `value.ts`                 | Met; reused from task 04 unchanged                                                                                                               |
| `score.ts` with `formatCost`        | Met                                                                                                                                              |
| `titleRules.ts`                     | Met; predicates correct except the title 9 exactness bug (finding 1)                                                                             |
| Score fixtures                      | Met (`fixtures/scores.ts`)                                                                                                                       |
| Six exact worked examples           | Met; all components and totals match design-doc-v2.md table                                                                                      |
| Rate-independent scores             | Met; mocked rate test                                                                                                                            |
| All boundaries and title predicates | Mostly met; boundaries P=99/100, R=0–5, cost floor/ref, cancel at 0 covered. Title 9 boundary is only tested with short decimals (findings 1, 4) |
| Hosted evidence                     | Not yet; work is uncommitted (finding 2)                                                                                                         |

## Resolution notes — October 12, 2026

The review above describes the initial uncommitted working tree and is preserved as history.
Finding 1 is fixed with JSON-safe exact numerator/denominator strings in qualityFraction,
retaining numeric quality for display only. Scoring and unrounded title comparisons consume
that fraction. Public-API regressions cover the four-decision exact 0.85 title boundary,
and the reachable 1/3 plus 7/100 average that yields D=60.5 and rounds to 61.
Finding 2 is resolved by commits, the pushed branch and PR #5, stacked on PR #4, with hosted
Node 24 evidence in implementation-plan.md. Finding 3 is fixed with typed not-ended guards
on both result APIs. Finding 4 is addressed by resolution → Call it → score/title tests,
including ties, zero quality, disabled choices and JSON serialization. Full title reachability
with draw/content remains for task 06 goldens and 07a. No formulas or thresholds changed.
