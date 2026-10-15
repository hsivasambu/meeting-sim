# L03 — Additive response outcome capability

Implemented October 13, 2026 from documentation dependency
`1f7fa8168674154ef8475789e6ff83918a0e763e` (L02b draft PR #18).
The approved capability is defined by ADR 0006 and the technical spec's preview,
RNG and resolution contracts. Final lunch content approval is not a dependency
of L03; every new response here is synthetic fixture data.

## Implementation and migration boundary

`OutcomeResponse` carries authored description and one/two complete weighted
outcomes. `EngineResponse` admits this shape alongside the temporary fixed
launch `Response`. `PresentedEvent<R>` and `MeetingState<R>` default to the
original launch response type so existing content, store, UI, policies and
locked type tests retain their contracts. Outcome fixtures explicitly use the
union. L04 can build on these shared transition primitives; L08 removes the
temporary launch defaults, fixed-response shape and preview overload.

`responseOutcomes` validates count, distinct ASCII kebab IDs, bounded positive
safe-integer weights, description/outcome copy and no shared/nested/conditional
outcomes. `evaluateOutcomes` validates and evaluates every complete effect using
the existing response validator, effect application, clamping, billing and exact
utility calculation. Outcome duration/progress bounds are enforced independently;
launch zero-minute email behavior is preserved. Arrival/callback/booking
permissions remain the launch metadata contract until L04 adds lunch rules.

Outcome previews return serializable exact probabilities, branch utilities and
expected utility, plus numerical expected deltas. No preview samples. The new
public `getResponseOutcomes` and injected `getResponseOutcomesWithRules` return
fully resolved successors via the same finish function as actual resolution.
Both paths compute expected q before sampling and share joins, logs, queues,
park counters and decision-before-expiry behavior. All branches preserve the
same q. One rational quality calculation handles both schemas; cancelling an
equal common denominator preserves the original launch q serialization.

Resolution validates the selected action and all its branches before using the
JSON-array keyed `response-v1` stream. It sorts outcome IDs, rejects uint32
tickets at/above L, selects cumulative weights and records outcomeId plus the
selected authored line. Deterministic responses consume no outcome ticket.
Fixed launch resolutions retain their previous log bytes and results. Neither
draw RNG nor the Node-only Random policy protocol changes.

The public API allowlist adds `getResponseOutcomes`. No live content, scoring
formula, UI, store, policy, dependency, accepted ADR, lockfile or CI change is
included. Risk removal, nomination, invitation permissions, commentary and lunch
score activation remain at their scheduled task boundaries.

## Fixtures and evidence

- Exact keyed hash/PRNG vectors include plain, Unicode and quote/delimiter seeds;
  existing draw vectors and Random policy tests remain intact.
- Cumulative ticket boundaries and deterministic no-ticket tests; a real rejection
  vector uses seed `reject-262791`, turn 0, event `fixture-event`, response `choose`.
  W=65,175 and L=4,294,902,150. Ticket 4,294,932,833 rejects; 691,950,412 accepts.
  Modulo without rejection would select the opposite branch in this fixture.
- Frozen seeded replays `branch-0` and `branch-2` cover expiry and completing
  agreement respectively. At P95/T59, bad ends P85/T66; good ends P100/T61.
  Both have q=0 before rolling. This is a fixture ending, not lunch cuisine logic.
- Branchwise clamp/billing, exact 18/29 middle quality at P20, equal/null quality,
  disabled choices, differing weight denominators and exact utilities whose
  numeric approximations tie; JSON replay and generated frozen inputs.
- Complete joins/booking/callback branches, invalid schemas/actions/effects,
  enumeration with no response RNG calls, public API wiring and legacy equivalence.
  All six existing launch goldens pass unchanged.

Local checks on Node **24.21.0**, pnpm **10.34.6**:

- `pnpm check`: passed; 38 test files / **383 tests**, no skips or failures;
  core **99.58% lines (706/709), 98.24% branches (671/683)**.
- `pnpm sim:ci` within check: 2,000 seeds each for Greedy and Random; every
  transition invariant and complete-run replay passes. Policy summary objects
  exactly match the committed V3 baseline. Greedy 100% wins / median 920 / 11 turns;
  Random 69.6% / 552.5 / 15 turns. Balance remains diagnostic and unmet, as before.
  The source hash changes because outcome protocol bounds were added to constants;
  no live tuning changes.
- `pnpm build` and `pnpm size`: passed, **83,809/122,880 gzip JS bytes**,
  **0/409,600 image/font bytes**.
- `pnpm e2e`: **30 passed**, Pixel 7 Chromium, iPhone 14 WebKit and desktop
  Chromium; preserved shell/probe/meeting-loop behavior and console checks.

Initial fixture assertions were corrected to use the intended P20 unclamped
state for 18/29 quality. No gate threshold or existing assertion was relaxed.
Delivered in [draft PR #19](https://github.com/hsivasambu/meeting-sim/pull/19).
Hosted [quality run](https://github.com/hsivasambu/meeting-sim/actions/runs/38494560088)
passes all active gates on implementation `044561f`. Downloaded artifacts confirm
383 unit tests, 30 browser passes without skips/flakes/errors, matching core
coverage and exact V3 policy summary objects from a clean PR merge checkout.
Hosted JS/image bytes match local results; Vercel preview passes. The
implementation plan records exact revisions and the remaining dependency stack.
Next task: L04.
