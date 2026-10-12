# Task 08a — V3 balance smoke

Recorded October 12, 2026, using Node 24.21.0 and pnpm 10.34.6.
Sources: Design Doc v2 → Balancing harness; Technical Spec → Seeded randomness,
layer rules and Testing and quality gates; Implementation Plan → Milestone B2.

Task 07b is merged into main: approved live content, structural/authored
validation, every transcribed row and the public draw/candidate/preview wrappers
are present. Its review fixes and hosted Node 24 evidence are recorded in the plan.
Dependencies #11 (line endings) and #10 (07b) are merged, in that order, with
passing hosted checks. Task 08a's clean implementation revision and regenerated
content/constants fingerprint will be recorded after committing and rebasing onto
main. The [preliminary JSON report](task-08a-v3.json) currently records the original
working tree and is awaiting replacement; it is not committed-source evidence.
Core rule values and content are unchanged. Review adds only the approved frozen
readonly observation export and its contract test (ADR 0003).

Run `pnpm sim:ci` to reproduce 2,000 identical fixed seeds, `v3:0` through
`v3:1999`, per policy. `pnpm sim -- --runs 2000` uses the same default policies.
For 08a, `all` means the two implemented policies, Greedy and Random. The remaining
five policies belong to task 09; expanded metrics and CSV belong to 08b.

| Metric                          | Greedy        | Random        | Diagnostic target                                    |
| ------------------------------- | ------------- | ------------- | ---------------------------------------------------- |
| Wins / all runs                 | 2,000 / 2,000 | 1,392 / 2,000 | Win means `ending === 'decision'`                    |
| Win rate                        | 100%          | 69.6%         | Greedy 70–85%; Random 20–35% — both above band       |
| P = 100 / all runs              | 2,000 / 2,000 | 1,392 / 2,000 | Reachability demonstrated                            |
| Median score, all runs          | 920           | 552.5         | Greedy 750–850; Random under 450 — both above target |
| Median resolved turns, all runs | 11            | 15            | Greedy 9–12 — within band                            |

Even-sized medians average the middle pair. Successful runs alone are not the
denominator for these metrics. The current content is easier than the target
bands, including for Random; this is a tuning finding, not a passing balance claim.
Task 08a enforces invariants only. Balance becomes mandatory after task 10.
No effects, scoring formulas, targets, tests or coverage thresholds were changed.

Greedy releases Gary, then Jordan before the first draw, retains experts and all
arrivals, and maximizes the utility returned by `previewResponse`. Ties use lower
preview minutes, then ASCII response ID. Random releases nobody and samples only
enabled responses uniformly. Neither policy calls it early or inspects future draws.

Harry approved this convention on October 12, 2026 (ADR 0003), and the technical
spec now defines it. The separate Random policy stream uses Node's SHA-256
over `${seed}:policy:random:${turn}` plus a counter, takes unsigned 32-bit tickets
and rejects tickets above the largest complete multiple of the enabled-option
count before modulo selection. This gives uniform sampling without modulo bias;
the spec fixes the UTF-8 encoding, counter suffix and big-endian ticket extraction.
It preserves the locked engine cyrb53/mulberry32 draw stream and avoids exposing
engine RNG internals through the locked public API. Fixed vectors, including a
rejection case, protect reproducibility.

The intentional reservation trap remains intact. Greedy chose `timebox` on all
1,098 room-booking encounters, with zero `hear` or `vp` selections. Random chose
`hear` 547 times, `timebox` 570 times and `vp` 111 times. A constructed fixture
verifies that Greedy chooses `timebox` even when the VP is present and available:
the one-minute options have tied utility, so ASCII order chooses `timebox`.
These are response counts among booking encounters, not percentages of all runs.
Confirm Lookahead's ending-sensitive next-step comparison in task 09.

All 4,000 reported meetings were run twice: 8,000 executions with zero crash,
state-invariant, mutation or replay failures. State inputs are recursively frozen
before engine mutations. The harness checks integer/bounded counters, legal
attendance, owner retention, no rejoining/repeated families, monotone time/cost,
booking limits, phase/end consistency, final score bounds and the natural
resolution bound, derived as at most 17 unique base families + 3 callbacks +
`ceil(60 / 2)` fillers = 50. Unique events are conservatively treated as zero-minute;
actual positive time can only reduce the available filler count. The bound uses
live pack counts and shared booking/filler constants, so it follows those sources.
Crossing it fails; it never creates a forced ending. Every run also checks policy
release identity/order/before-first-draw and prohibits Call it.
Replay compares the entire final state, including logs and decisions. Errors include
the seed and policy for reproduction. The assertion function deliberately keeps
related checks together for auditing despite exceeding the 40-line suggestion.

Original local activated gates (before review; final verification pending):

- `pnpm check`: types and lint/format pass; 304 tests across 28 files pass;
  live content validation and fixture goldens pass; `pnpm sim:ci` invariants pass.
- Aggregate core coverage: 617/619 lines (99.68%) and 599/607 branches (98.68%),
  above the unchanged 90%/85% thresholds across all existing core files.
- `pnpm build && pnpm size`: pass; JS 70,410/122,880 gzip bytes;
  deployed images/fonts 0/409,600 bytes. Simulation is outside the browser bundle.
- `pnpm e2e`: 18/18 pass on Pixel 7 Chromium, iPhone 14 WebKit and desktop
  Chromium, including 320 px/reduced-motion shell and sharing probe checks.

The first test run exposed two malformed new fixtures (a zero-minute non-email
response and a booking effect on an unrelated event ID). The fixtures were
corrected to follow existing engine contracts; no engine validation was relaxed.
Node 22 was the shell default. The original Node 24 checks explicitly invoked
`C:/Users/hsiva/AppData/Roaming/fnm/node-versions/v24.21.0/installation/node.exe`
with pnpm 10.34.6 from the Corepack cache and prepended that Node installation to
PATH for child processes. Hosted checks use `.nvmrc` and the pinned package manager.

Hosted task 08a verification is pending; no real-device gameplay evidence is
claimed. Android LinkedIn evidence remains deferred under ADR 0002. Next action:
finish 08a committed/hosted delivery; next blueprint task then is **11a**, the store
and beat machine. V4 remains before tuning and will assess comprehension and
interaction with the current easy content; no balance adjustment is included.
Minimal `policies.ts`/`summary.ts` migrate to `policies/`/`report.ts` in 08b/09.
