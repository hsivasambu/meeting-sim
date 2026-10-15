# L04 — Fixture-injected lunch rules and scoring

October 14, 2026. Dependency: L03 PR #19, head
`77348a8f96ebde741d34d945494961ed5662e4c3`.

The previous PRs have passing hosted checks, but the stack begins with draft
12a PR #15, whose V4 human evidence is still pending. L03's recorded merge
sequence requires dependency merges and rerunning gates. No PR was merged.
Harry's concurrent D18 documentation update is preserved separately; it does
not complete V4 or merge the stack. Following the requested fallback, this PR
implements only L04.

## Implementation

The existing draw, effect application, validation, evaluation, resolution,
scoring and title predicate code now accepts a temporary fixture-injected lunch
profile. There is no second transition engine and no live content import outside
the existing public index. Lunch helpers are internal; the public binding,
launch UI/store, limits, content, policies and six launch goldens are unchanged.

Lunch state contains cuisine IDs, resolved callback and commentary bookkeeping,
with no risk or released-attendee fields. Nomination is forced before other
events, offers three equal deterministic choices, and is unscored. Later
responses preserve that cuisine; agreement records it before checking expiry.
Invalid P100/no-cuisine states are rejected. Lunch utility omits the risk term
and successful Outcome is 400; the approved efficiency/decision formulas share
the existing exact arithmetic and component rounding.

Every invitation outcome is checked against event/response/person permissions.
Spontaneous arrivals are suppressed once their person is present. All joins use
pre-response billing and permanent attendance. The shared callback evaluator
retains n+2 scheduling and its collision/chain guards; resolvedCallbackCount
increments once per callback resolution and parkedCount once per park choice.
Lunch title evaluation reuses the retained predicates and priority, replacing
only slots 3/5/8 with lunch-agreed/table-for-six/second-helping.

`fixtures/lunch.ts` is synthetic and does not transcribe the lunch table. It has
17 base families, three callbacks, two arrivals, an invitation, first-match
variants, booking and filler. Thirty rule/property tests and seven new goldens
cover all nominations, the six approved score examples (including cancellation),
deadline equality/overshoot, both branches, exact pre-roll q=51/86, headcounts,
callback delivery, all new title predicates and immutable JSON replay. One hundred
generated seed/action cases check the <=50 bound. A separate exhaustion witness
resolves all 17 families and three callbacks and reaches minute 60 on turn 40
through two-minute filler, without a turn-cap ending.

## Golden evidence

All files are under `tests/golden/lunch/`; original goldens are preserved.
Actions and full final states, exact fractions, scores and title IDs are pinned.

| Route                | Ending       | Turns | Cuisine   | Adults | Callbacks | Score |
| -------------------- | ------------ | ----- | --------- | ------ | --------- | ----- |
| cancelled            | cancelled    | 0     | none      | 6      | 0         | 0     |
| agreement            | decision     | 6     | fixture-a | 6      | 0         | 1000  |
| timeout              | time-expired | 33    | none      | 8      | 3         | 203   |
| callback-early       | called-early | 6     | none      | 6      | 1         | 99    |
| invitation-agreement | decision     | 6     | fixture-b | 7      | 0         | 955   |
| rolled-setback       | time-expired | 3     | none      | 6      | 0         | 586   |
| rolled-agreement     | decision     | 3     | fixture-a | 6      | 0         | 878   |

The last two start from an explicit P95/minute59 numeric boundary fixture;
they are not full playable runs. Their sampled results differ while both store
exact q=51/86 and Decisions=178. Their input person-minutes are intentionally
synthetic. No live balance claim follows from these scores.

## Verification

Local Node **24.21.0**, pnpm **10.34.6**, frozen install:

- `pnpm check`: pass; **420 tests in 40 files**; core **824/835 lines (98.68%)**
  and **872/897 branches (97.21%)**, all coverage thresholds pass.
- `sim:ci`: 2,000 seeds each Greedy/Random; every transition invariant and replay
  passes. Summary objects exactly match launch V3: Greedy 100% wins / median
  920 / 11 turns; Random 69.6% / 552.5 / 15. Hash remains
  `1bd0e3bb54dbd7e9bee2d83b22d2329439eb6fe9404eb9fb6addd9825ff011f5`.
  Existing balance failures remain diagnostic until L12, as scheduled.
- `pnpm build` and `pnpm size`: pass; **84,675 / 122,880 gzip JS bytes**,
  **0 / 409,600 image/font bytes**.
- `pnpm e2e`: **30 passed**, Pixel 7 Chromium, iPhone 14 WebKit and desktop
  Chromium, including launch keyboard/touch/320px/console checks.
- Formatting and whitespace checks pass for the PR files. The pre-existing
  untracked `docs/L03-review.md` has formatting differences; it was held in
  ignored `.tools` only during `pnpm check`, then restored byte-for-byte. It is
  not part of this PR. No tracked gate or test was excluded or weakened.

## Boundaries and next task

Fraction serialization remains the existing decimal-string, potentially
unreduced representation. The L03 optional reduction suggestion is not needed
for correctness: goldens pin it and arithmetic tests compare rational values
exactly. No canonicalization contract or new formula is introduced.

L05 owns reviewed content transcription, structural/playable validation and
constructed content witnesses. Authored commentary selection remains part of
later content integration/activation; L04 initializes and preserves its state
fields without inventing catalog entries or copy. L06/L07 prepare persistence
and presentation. L08 must remove the temporary launch/lunch state and utility
profiles, draw overloads, lunch helper names, launch risk/release code/types and
old binding, along with the L03 migration contracts already listed in the plan.

**L04 complete locally. Next blueprint task: L05**, with its documented
dependencies. The draft PR remains stacked on L03; retarget/rebase and rerun
active gates after the dependency stack merges. Hosted delivery is recorded
after creation. No later task or live activation is included.
