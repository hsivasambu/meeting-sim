# Task 06 — Event draw and callback scheduler

Implements Design Doc v2 → Events and responses → Draw rules and Event schema;
Technical Spec → Engine contracts → Randomness, Turn order and endings, and D21 goldens.
Dependencies 03 and 04 are complete in the starting task 05 branch: readonly contracts,
per-turn RNG, weighted tickets, conditions, immutable transitions, response validation
and callback scheduling at resolution are already present. Task 05 supplies score output.

## Implementation

`drawEventWith(content, state, rarityWeights)` and
`getDrawCandidatesWith(content, state, rarityWeights)` share the eligible pool,
ordered variant selection and weighted candidate preparation. Default rarity weights
come from constants; rule tests inject synthetic weights. Only random base selection
uses the per-turn seeded ticket; callback/filler singleton pools have probability one.
The candidate helper consumes no RNG, and pending lookup returns the delivered event.

Draw filters unseen base families, family conditions, the opening substantive guard
and consecutive uncommon negative events. A due callback takes priority; callbacks
cannot enter the random pool. Broken opening availability throws `invalid-pool`,
while later exhaustion selects repeatable filler. Speakers, families, substantive
count and the previous-negative flag are recorded on draw. Room is never recorded as
an attendee. Filler is excluded from seenEventIds, which records base families/callbacks only. Pending draw returns an equivalent new snapshot, including after release.
Ended draws throw `ended`; ended candidate lookup returns an empty array even if Call it
retained a current event for narrative inspection.

Resolution's existing n+2 scheduler remains the only scheduling writer. Draw validates
duplicate targets, colliding turns, past/invalid or more-than-one-turn-ahead due turns, orphan/ambiguous parents, previously delivered targets,
missing/duplicate definitions and invalid callback kind/rarity/conditions. Violations
throw `invalid-schedule`. Delivery removes only the reached due entry. First matching
absence variants apply to callback dialogue as to base dialogue. No rule reads the log.

Live `drawEvent` / `getDrawCandidates` wrappers bind in engine/index.ts when task 07
provides the live pack, following the existing task 03 staged API handoff. Task 06
provides the complete injected implementations; it does not invent live content or
export a fixture pack as gameplay. Task 06b must author and obtain approval for content.

## Recorded runs and verification

Six JSON runs in `tests/golden/` contain seed, complete ordered actions, expected full
final state and score. The runner uses a deep-frozen synthetic pack, frozen inputs and
exact JSON comparison. Outcomes: cancellation 0; clean success 1000; risky success 800;
timeout 0; callback plus absent Sam 739; mixed fairness/pending release/Call it 477. These are fixture outcomes, not balance claims.
Goldens are committed records; ordinary test execution never regenerates them.

Full-run properties use 100 generated cases per property and fixed fast-check seeds.
They verify deterministic replay with choices/releases, candidate/draw agreement,
fairness, callback delivery, bounded progress/risks, integer billing and termination.
The dedicated all-email path exhausts 17 base families and all three renamed callback
pairs, exercises every callback's absence variant, then repeats +2-minute filler to
minute 61 / turn 49. Early decision, deadline and Call it suppress future callbacks.
Focused tests also cover ASCII probabilities, authored first-match precedence, fixed
pending dialogue, authoritative counters, eligibility boundaries and malformed queues.

Initial local evidence before review fixes (October 12, 2026; Node 24.21.0, pnpm 10.34.6):

- `pnpm check`: zero type/lint/format errors; **221 tests / 21 files** pass.
- Core coverage: **337/339 lines (99.41%)**, **274/280 branches (97.86%)**.
  `draw.ts`: **41/41 lines, 58/58 branches**. Existing 90%/85% floors unchanged.
- `pnpm build` and `pnpm size`: **70,407/122,880 gzip JS bytes**;
  images/fonts **0/409,600 bytes**.
- `pnpm e2e`: **18 passes** across Pixel 7 Chromium, iPhone 14 WebKit and desktop
  Chromium; no console errors, failed, skipped or flaky tests.
- The sandbox's default Node 22/package environment produced unchanged dependency-type
  failures; rerunning with the installed Node 24/pnpm environment passed. No dependency,
  lockfile, CI, formula, tuning, test or threshold changes were used to resolve this.

Simulation/content validation gates activate at 08a/07a and were not reported as run.
Android LinkedIn evidence remains deferred under ADR 0002. No known task 06 defect remains.
After remote delivery and hosted Node 24 evidence, next task: **06b**, the reviewed content table; task **07a** can then validate packs using
these completed engine capabilities. Stop at task 06.

## Review fixes and current evidence — October 12, 2026

The initial 221-test evidence above is historical. The supplied review is preserved in
[task-06-review.md](task-06-review.md), with resolution notes. Task 06 is locally implemented;
remote PR and hosted Node 24 evidence remain pending push authorization.

Callbacks now require a unique existing base parent marked seen, and dueTurn must be the
current turn or the following turn. These are consequences of the existing n+2 scheduler,
not new gameplay rules. Filler is excluded from the authoritative seen-family/callback list.
Only the timeout golden's seen IDs change. A sixth mixed fixture golden pins weighted
selection, fairness, a gated family, pending release, next-event absence and an early call.
Generated full runs add conditions, absence variants, pending releases and early calls.

Node 24.21.0 / pnpm 10.34.6: `pnpm check` passes **226 tests in 21 files**; core coverage
**346/348 lines (99.43%)**, **284/290 branches (97.93%)**; draw **47/47 lines, 67/67 branches**.
Build/size and all **18 E2E** checks pass with the original budgets. Test helper caching
removes repeated deep-freeze traversal; the 100-case properties and five-second timeout,
all required assertions, coverage floors and CI configuration are unchanged.

Task 07a/07b acceptance text now includes speaker validation and public API binding/tests.
Task 06 remote delivery must finish before marking the delivery complete; next task is 06b.

## Hosted delivery — October 12, 2026

User authorization now covers push, PR creation and merge. [PR #7](https://github.com/hsivasambu/meeting-sim/pull/7)
delivers task 06 against main. [Node 24 CI](https://github.com/hsivasambu/meeting-sim/actions/runs/38286583589)
passed on b221c9f. Downloaded reports confirm 226 unit/property/golden passes, zero failures;
18 E2E passes, zero skipped/flaky/unexpected; core 346/348 lines and 284/290 branches,
plus both HTML reports. Build/size and every active check passed unchanged.

The earlier delivery blocker is resolved. Required checks rerun after this documentation
update before the authorized squash merge. Task 06 is complete; next task is 06b.
