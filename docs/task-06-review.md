# Task 06 review: event draw and callback scheduler

Repo: `C:\dev\meeting-sim`, branch `feat/task-06-draw` (local only, no upstream).
Commits: `03e4d7f` (implementation) and `ac9e46d` (plan/evidence docs), on top of `d3906e8`
(main with PRs #4 and #5 merged). Working tree clean. Reviewed against implementation-plan.md
task 06 row (original acceptance text, line 36 before `ac9e46d`) and Milestone B test suite
(209–214), design-doc-v2.md Draw rules (135–144) and Engine API (311–323), tech-spec.md
Engine contracts (157–313), Randomness (287–291), Turn order (295–301) and Testing gates
(480–507), ADR 0001, and `docs/task-06-draw.md`. Review was read-only; nothing in the repo was
edited or staged. One throwaway probe script ran from outside the repo.

## Verdict

**The engine code is correct against the design; push it and open the PR (finding 1).** Draw
order, filtering, guards, callback precedence and the read-only candidate helper all match the
draw rules, and every check below passes. There is no blocking defect. The remaining findings
are a loose schedule validator, a small spec deviation that the goldens would freeze, a public
API handoff that is easy to lose, and goldens and property tests that are weaker than they
look.

## Gate results

| Gate                                                       | Local (Node 22.18.0, pnpm 10.34.6)                                                               | CI (Node 24)         |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------- |
| `pnpm check` (typecheck, lint + prettier, test + coverage) | Pass. 221/221 tests in 21 files. `src/core/engine` 99.36% lines, 97.78% branches; `draw.ts` 100% | Not run (not pushed) |
| Five goldens (`scripts/golden.test.ts`)                    | Pass                                                                                             | —                    |
| `pnpm e2e`                                                 | Pass. 18/18 on Pixel 7, iPhone 14, desktop Chromium                                              | Not run              |

Test counts match the recorded evidence. The handoff says the default Node 22 environment
"produced unchanged dependency-type failures"; on this laptop Node 22.18.0 passed typecheck,
lint and tests cleanly, so that note may describe a different sandbox. Node 24 CI is still the
authoritative gate and has no task 06 result. The tree was unchanged after both runs.

## Findings

### 1. Task 06 is not pushed and has no PR or hosted CI, but the plan marks it complete (medium; process)

`git branch -vv` shows `feat/task-06-draw` with no upstream. The plan's own delivery note
(implementation-plan.md:906–915) says the push and PR were blocked pending your authorization,
while row 36, the status line (line 3) and the milestone table (line 287) already say
"Complete". Line 280 asks for one task per branch/PR, and line 282 says "Complete" requires
the applicable quality gates, which include hosted Node 24 CI. This is the same situation as
task 05 finding 2. Authorize the push, open the PR against main, and record the hosted run.

### 2. Schedule validation accepts impossible due turns and orphan callbacks (low; contract guard)

`draw.ts:48-56` rejects duplicates, collisions, past turns, non-integers and already-seen
targets, but accepts any future `dueTurn`. Resolution writes `dueTurn = n + 2` and then
advances `turn` to n + 1 (tech-spec.md:300), so at draw time every legal entry has
`dueTurn ∈ {turn, turn + 1}`. Reproduced with `goldenPack` from `initialState('x')`:
`{ eventId: 'alpha-return', dueTurn: 5 }`, `40` and `1000000` are all accepted. The entry
survives the draw, and its parent `alpha` was never drawn. The handoff says draw validates
"past/invalid turns", and the spec says collisions are programmer errors, not silently
delayed callbacks. In practice a corrupted entry is silently delayed or never delivered.

Fix: also throw `invalid-schedule` when `dueTurn > state.turn + 1`, or when the parent for the
target (the inverse of `eventRules.callbackTargets`) is not in `seenEventIds`. Add both cases
to the `it.each` at `draw.test.ts:332`.

### 3. Filler is recorded in `seenEventIds`, unlike the spec's definition (low; spec deviation)

`draw.ts:139-141` appends every drawn ID, so the first filler adds `'filler'`. The timeout
golden freezes this (`seenEventIds: ["beta","alpha","filler"]`). tech-spec.md:173 defines
the counter as "base-family and callback IDs marked on draw". Nothing reads it wrongly today
(`poolFor` never filters filler by it). However, the counters are authoritative for every
rule (line 252), and the 08a/09 sim reports family coverage per run, so a phantom `filler`
family is easy to miscount. Decide now, before goldens multiply: either skip filler in
`seenEventIds` (and update the timeout golden in this PR), or change spec line 173 to say
filler is included.

### 4. The public draw API is deferred, and the deferral lives only in task notes (low; handoff)

tech-spec.md:258, 267 and 290 list `drawEvent` and `getDrawCandidates` as public engine
exports; design-doc-v2.md:311–323 does the same. Task 06 ships only the injected
`drawEventWith` / `getDrawCandidatesWith` and leaves a comment in `index.ts:2-3`. Deferring
until a live pack exists is consistent with D13 and the task 03 handoff. But the plan rows
for 07a and 07b do not mention binding these exports, and the store (12a) and Lookahead (08a)
both depend on them. Add "bind `drawEvent`/`getDrawCandidates` in `index.ts`" to the 07b
acceptance text. Also add "speaker present at draw unless room/arrival speaker"
(tech-spec.md:330) to 07a, because `draw.ts` intentionally does not enforce it. A released
Gary voicing a variant-less event would otherwise be marked spoken and cost Gary-Free Zone.

### 5. Goldens use a two-event, all-common pack, so they pin little of the draw logic (low–medium; test gap)

`fixtures/goldens.ts` has exactly two families (`alpha`, `beta`), both common, unconditioned
and substantive, plus one callback and filler. Every golden random draw is therefore a 50/50
pick between those two (verified with `getDrawCandidatesWith`: `alpha:0.5 beta:0.5`). The
goldens never exercise rarity weighting, the opening substantive filter against other kinds,
the uncommon-negative guard, a family `when`, or a release while an event is pending. The five
outcomes required by tech-spec.md:507 are covered, so the acceptance criterion is met. D21
makes goldens the engine regression record, though, and a change to ticket ordering or
weights would at most swap alpha and beta. Add one more golden on a richer frozen pack (mixed
rarities, an uncommon negative, a `when`-gated family, release mid-event, then Call it with
progress), or extend the existing pack before these JSON files become costly to change.

### 6. Generated full runs cover a narrower state space than the plan asks (low; test gap)

The generated pack in `drawRuns.test.ts:23-95` has no family `when` conditions and no
base-event variants. Every non-substantive family is spoken by `room`, releases happen only
between events (never while one is pending), and Call it never appears in a generated run.
implementation-plan.md:213 asks to "test draw eligibility and fairness against generated
valid states ... not only favorable fixtures". The focused unit tests in `draw.test.ts` cover
each of these individually. The property run is what would catch interactions, such as a
release mid-event changing the next draw's variant, or the opening guard with conditioned
families. Add conditioned families, attendee speakers with absence variants, pending-state
releases and a random Call it to the generator.

### 7. Plan row 06 lost its acceptance criteria, and line 293 is stale (low; docs)

`ac9e46d` replaced the task 06 acceptance column (line 36) with completion status, as
happened to row 05 earlier. Line 282 says to record progress in the milestone table, not by
overwriting the criteria. Line 293 still says "The next blueprint task is 06 ... No task 06
implementation has started", which contradicts line 3 and the completion section. Restore
both rows' acceptance text and update line 293.

## Checks that passed

- Callback precedence: a due callback is forced before random filtering and the opening guard,
  never after an ending, and uses no RNG (`draw.ts:83-84`, `draw.test.ts:298`). Delivery
  removes only the due entry (`draw.ts:150`).
- Pool filter matches the design order: no callback kinds, unseen families, family `when`,
  first two substantive, then no uncommon negative after an uncommon negative
  (`draw.ts:86-93`). Callbacks and filler reset the negative flag, which is correct for
  "consecutive".
- Opening exhaustion throws `invalid-pool` instead of drawing filler; later exhaustion draws
  repeatable filler (`draw.ts:94-96`).
- Weighted selection reuses task 03's exact one-ticket formula on the `${seed}:draw:${turn}`
  stream. Candidates share `weightedEvents`, so probabilities and the draw agree. The ASCII
  sort makes results independent of pack order (`weighted.ts`, `draw.test.ts:142`).
- Variants are chosen first-match at draw and stay fixed through a later release
  (`draw.ts:24-40`, `draw.test.ts:206`).
- Draw-time counters: seen family, heard speaker (room excluded), substantive count and the
  negative flag; no duplicates (`draw.test.ts:231`). No rule reads the log.
- A pending draw returns an equal new snapshot with no RNG use. An ended draw throws `ended`.
  Ended candidate lookup returns `[]` even when Call it kept `current` (tech-spec.md:311).
- Termination: the all-email path reaches 17 families plus 3 callbacks plus filler to turn 49,
  within the 50-turn bound in tech-spec.md:500.
- Goldens are deep-frozen, use exact JSON comparison of full final state (including log), and
  are never regenerated by the test run.

## Task 05 findings: carried over or fixed?

All four task 05 findings were resolved before task 06 (task-05-review.md resolution notes,
merged as PR #5). Task 06 keeps them. Goldens record `qualityFraction` strings and the
callback golden's D component (99) comes from the exact fractions.

## Plan acceptance checklist (task 06 row, original text)

| Criterion                                                                        | Status                                                          |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Weighted eligibility tested                                                      | Met                                                             |
| Unseen-family rules tested                                                       | Met                                                             |
| Fairness (first two substantive, no consecutive uncommon negative) tested        | Met; generated coverage narrower than plan line 213 (finding 6) |
| Callbacks (n+2, precedence, absence variants, early endings) tested              | Met; future/orphan schedule entries not rejected (finding 2)    |
| Idempotent pending draw tested                                                   | Met                                                             |
| Filler fallback tested                                                           | Met                                                             |
| Goldens: cancellation, clean success, risky success, timeout, callback + absence | Met (0, 1000, 800, 0, 739); weak pack (finding 5)               |
| Hosted evidence                                                                  | Not yet; branch not pushed (finding 1)                          |

## Resolution notes — October 12, 2026

The findings above describe the initial local task 06 commits and are retained as history.

1. Delivery status: not yet resolved. Push and PR require explicit user authorization under
   the automatic approval review. No push/PR/hosted CI was attempted in this follow-up.
   The plan now says locally implemented, remote delivery pending, rather than complete.
2. Schedule guard: fixed. Both APIs reject future due turns beyond turn+1 and missing,
   orphan or ambiguous parents based on metadata and counters, without reading narrative logs.
   The reproduced due turns 5, 40 and 1,000,000 are regression cases.
3. Filler counter: fixed to the existing spec. Filler remains repeatable but is never marked
   seen. Only the timeout golden's seen-ID list changes, with its score/effects/log retained.
4. Public API handoff: explicit in task 07b acceptance, including wrapper tests; speaker
   presence validation is explicit in task 07a. No live content or placeholder binding added.
5. Golden gap: added mixed-fairness-early.json on a separate frozen mixed pack. It exercises
   rarity/event weights, substantive filtering, two uncommon negatives, the negative guard,
   a min-minute/absence condition, release during dialogue, next-draw absence and Call it.
   Seed golden-mixed-77 records full state/actions and score 477. Five original cases remain.
6. Generated-run gap: added family conditions, attendee speakers with absence variants,
   expert response requirements, pending releases and generated Call it. Billing is checked
   after release; only enabled previews are chosen; replay and bounds remain enforced.
7. Plan: restored original task 05/06 acceptance criteria and corrected current status,
   milestone and stale execution handoff text. Historical task 05 evidence is preserved.

Node 24.21.0 / pnpm 10.34.6 local evidence: pnpm check passes 226 tests (21 files), including
six recorded goldens; typecheck/lint/format pass. Core coverage is 346/348 lines (99.43%)
and 284/290 branches (97.93%); draw is 100%. Build/size pass (70,407 gzip JS bytes), and
18 E2E pass across the required profiles. The expanded properties initially timed out;
fixture deep-freeze caching and avoiding duplicate comparisons resolved it without reducing
100-case workloads, assertions, the five-second timeout, thresholds or gates.

Claude's initial Node 22 passes and the sandbox-specific Node 22 type failures can both be
true in their respective environments. The follow-up uses installed Node 24 explicitly;
no local result is presented as hosted CI. Next step: approve remote delivery, then record
hosted Node 24 evidence. Next blueprint task after task 06 delivery: 06b.
