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
an attendee. Pending draw returns an equivalent new snapshot, including after release.
Ended draws throw `ended`; ended candidate lookup returns an empty array even if Call it
retained a current event for narrative inspection.

Resolution's existing n+2 scheduler remains the only scheduling writer. Draw validates
duplicate targets, colliding turns, past/invalid turns, previously delivered targets,
missing/duplicate definitions and invalid callback kind/rarity/conditions. Violations
throw `invalid-schedule`. Delivery removes only the reached due entry. First matching
absence variants apply to callback dialogue as to base dialogue. No rule reads the log.

Live `drawEvent` / `getDrawCandidates` wrappers bind in engine/index.ts when task 07
provides the live pack, following the existing task 03 staged API handoff. Task 06
provides the complete injected implementations; it does not invent live content or
export a fixture pack as gameplay. Task 06b must author and obtain approval for content.

## Recorded runs and verification

Five JSON runs in `tests/golden/` contain seed, complete ordered actions, expected full
final state and score. The runner uses a deep-frozen synthetic pack, frozen inputs and
exact JSON comparison. Outcomes: cancellation 0; clean success 1000; risky success 800;
timeout 0; callback plus absent Sam 739. These are fixture outcomes, not balance claims.
Goldens are committed records; ordinary test execution never regenerates them.

Full-run properties use 100 generated cases per property and fixed fast-check seeds.
They verify deterministic replay with choices/releases, candidate/draw agreement,
fairness, callback delivery, bounded progress/risks, integer billing and termination.
The dedicated all-email path exhausts 17 base families and all three renamed callback
pairs, exercises every callback's absence variant, then repeats +2-minute filler to
minute 61 / turn 49. Early decision, deadline and Call it suppress future callbacks.
Focused tests also cover ASCII probabilities, authored first-match precedence, fixed
pending dialogue, authoritative counters, eligibility boundaries and malformed queues.

Local evidence (October 12, 2026; Node 24.21.0, pnpm 10.34.6):

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
Next task: **06b**, the reviewed content table; task **07a** can then validate packs using
these completed engine capabilities. Stop at task 06.
