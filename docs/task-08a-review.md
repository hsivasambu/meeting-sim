# Task 08a review: minimal Greedy/Random simulation runner and V3 smoke

Repo: `C:\dev\meeting-sim`, branch `feat/task-08a-simulation` at `846340b`, which is the
tip of `feat/task-07b-live-content` (PR #10, still **open**). All task 08a work is
uncommitted: five modified files (`.github/workflows/ci.yml`, `docs/implementation-plan.md`,
`package.json`, `tsconfig.json`, `vite.config.ts`) and two new folders (`sim/` with eight
files, `docs/sim/` with the V3 report and JSON).

Reviewed against the plan's 08a row and Milestone B2 (implementation-plan.md:40, 177–187),
tech-spec.md (source tree 135–138, seeded randomness 286–290, gate table 516–528, scripts
580–583), design-doc-v2.md (Balancing harness 398–437), ADR 0001, Harry's 06b decisions
and the 07b review. The review was read-only. Nothing in the repo was edited or staged;
`git status` was identical before and after the gate runs.

## Verdict

**The runner and policies are correct; no bugs found. Ready to commit and open as a PR
after the process fixes in findings 1–3.** The policies use only the public engine API,
Greedy and Random follow the design semantics, the invariant gate is real (frozen inputs,
per-transition checks, full-state replay) and `pnpm sim:ci` reproduces the committed V3
numbers exactly. The three recurring issues from the 07a/07b reviews all repeat here.
Findings 4 and 5 are conventions settled in code that the docs should own. Finding 7 is a
balance result Harry should see before the V4 playtest.

## Gate results

| Gate          | Local (Node 22.18.0, pnpm 10.34.6)                                                                 | CI (Node 24)            |
| ------------- | -------------------------------------------------------------------------------------------------- | ----------------------- |
| `pnpm check`  | Pass. 304/304 tests in 28 files (7 new in `sim/`). Core engine 99.64% lines, 98.65% branches.      | Not run (not committed) |
| `pnpm sim:ci` | Pass (inside `check`). About 7 s. Output equals `docs/sim/task-08a-v3.json` except the `revision`. | Not run                 |
| `pnpm e2e`    | Pass. 18/18 on Pixel 7, iPhone 14 and desktop Chromium.                                            | Not run                 |

Counts match the plan. The coverage difference against the plan's 99.68%/98.68% is the
Node 22 vs 24 difference already noted in the 07b review. There is still no Node 24 on
this laptop's PATH (`.tools/fnm` has no installed versions), so hosted CI remains the
authoritative Node 24 gate.

## Harry's 06b decisions

`git diff --exit-code -- src/core` is clean, so no content, rule or scoring changed.

| Decision                                      | 08a result                                                                                                                                                            |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Room booking: keeping the full hour is a trap | Kept. `room-booked` responses unchanged. Random picks `hear` 547 times; Greedy never does.                                                                            |
| Legal gets one response that needs them       | Unchanged (`press-date.ts`).                                                                                                                                          |
| VP gets one response, P 0, not tuned for bots | Unchanged. Greedy never picks `vp`: it ties `timebox` on utility and minutes and loses the ASCII tie-break, as the content table predicted. A fixture test pins this. |

## Findings

### 1. Marked complete again before commit, PR and hosted CI (medium; process, third repeat)

The status line, the 08a row, the B2 progress row, the closing paragraph and the new task
section all say 08a is complete and the next task is 11a. Nothing is committed, there is no
PR and no hosted run. The task section is honest that hosted evidence is not claimed, but
"complete" still goes out in four places. This is the same finding as 07a finding 2 and
07b finding 1.

Two things make it more than wording this time:

- **The branch is stacked on unmerged work.** 08a sits on `feat/task-07b-live-content`,
  and PR #10 is still open. The plan says 07b is complete "in PR #10", which reads as
  merged. Either merge #10 first and rebase 08a onto `main`, or open the 08a PR against
  the 07b branch and say so in the plan.
- **The committed evidence points at the wrong revision.** `docs/sim/task-08a-v3.json`
  records `revision: 846340b` with `workingTreeDirty: true`. That commit does not contain
  the runner, so nobody can reproduce the report from it (the markdown admits this). After
  committing, rerun `pnpm sim:ci` on the clean tree and replace the JSON so it carries the
  08a commit and `workingTreeDirty: false`.

Commit, open the PR, record the hosted Node 24 run and the regenerated report, then mark
08a complete.

### 2. The 08a acceptance criterion was overwritten again (medium-low; docs, third repeat)

implementation-plan.md:40 replaced "V3 balance smoke reported: win rates against bands,
Greedy median turns, P = 100 reachability." with completion evidence. The 07a resolution
and the 07b review both asked that the acceptance column keep its text and evidence go in
the status lines and the task section. The 07b status line in this same file even says
"Acceptance criteria are preserved". Restore the original text. The evidence is already
at lines 3, 293, 298 and in the new task section.

### 3. The line-ending fix is still not in the branch (low; repo hygiene, repeat of 07b finding 7)

PR #11 (`chore/windows-line-endings`, adds `.gitattributes`) is open and not merged, and
08a does not include it. Git warns "LF will be replaced by CRLF" on all five modified
files, and the eight new `sim/` files will hit the same Prettier failure on the next
fresh Windows checkout. Merge #11 before #10 and 08a, then rebase, so 08a lands with the
fix rather than relying on hand-converted working files.

### 4. The Random policy stream is a new convention settled only in code (medium-low; guardrail 10)

The design names the stream (`${seed}:policy:random:${turn}`) but not how it turns into
numbers. The tech spec's seeded-randomness section (286–290) defines exactly one way to
build a stream: cyrb53 into mulberry32 in `rng.ts`, keyed by a string like
`${seed}:draw:${n}`. 08a instead uses Node SHA-256 with a counter and rejection sampling
(`sim/policies.ts:41–54`) and records the choice as an "implementation assumption" in
`docs/sim/task-08a-v3.md`.

The implementation is sound: uniform, reproducible, independent of the draw stream, and
pinned by fixed vectors including a rejection case. But CLAUDE.md guardrail 10 says a rule
the docs do not state goes into the docs first, not into code or a report. The stated
reason ("avoids exposing engine RNG internals through the locked public API") is a real
trade-off, and it is Harry's call. Propose one line in the tech spec under Seeded
randomness, either:

- **Keep SHA-256** (recommended, already built and tested): "Policy streams are sim-only
  and use SHA-256 over the stream key with a counter and uint32 rejection sampling; they
  never use the engine RNG." Or
- **Reuse `rng.ts`**: export a stream factory from the engine index and use
  `floor(rng() × count)` like the draw.

Task 09's Lookahead and later 10,000-run reports depend on this, so it is worth settling
before 09.

### 5. The invariants hard-code rule numbers that live in `constants.ts` (low-medium; rules)

`sim/invariants.ts` writes the limits as literals: progress 100, risks 5, headcount 2–8,
owner `'priya'`, booking ends 45/60 and score 1000. All of these already exist in
`src/core/engine/constants.ts` (`PROGRESS_MAX`, `RISKS_MAX`, `MIN_HEADCOUNT`,
`MAX_HEADCOUNT`, `DECISION_OWNER`, `INITIAL_BOOKING_END`, `REDUCED_BOOKING_END`, and the
score maxima). CLAUDE.md says numbers live in `constants.ts` or content. The practical
risk is task 10: if tuning changes a booking end or a cap, `sim:ci` either fails on a
legal state or keeps checking the old limit, with no test pointing at the cause.

The ESLint boundary only lets `sim/` import `engine/index.ts`, which does not export the
constants. Fix it by re-exporting the needed constants (read-only, `as const`) from the
engine index. That widens the public API, so propose it in the PR description first, in
the same note as finding 4.

### 6. `MAX_RESOLVED_TURNS = 50` has no recorded derivation (low)

`sim/settings.ts:4` sets the "natural" turn bound to 50, and crossing it fails the gate.
Nothing in the docs or the report explains why 50 is natural for this content. If it
comes from at most 20 substantive families plus two-minute filler for the rest of 60
minutes, write that down in the report or a comment, because a later zero-minute response
or a longer booking would make the bound wrong and turn a legal run into a gate failure.

### 7. Balance: the game is much easier than every target (for Harry; not a code defect)

| Metric                | Greedy | Random | Target                       |
| --------------------- | ------ | ------ | ---------------------------- |
| Win rate              | 100%   | 69.6%  | Greedy 70–85%; Random 20–35% |
| Median score          | 920    | 552.5  | Greedy 750–850; Random < 450 |
| Median resolved turns | 11     | 15     | Greedy 9–12 (met)            |

Uniformly random play wins seven meetings in ten, and Greedy never loses even though it
gives up the last 15 minutes on every one of its 1,098 room-booking draws. At this tuning
the full-hour trap costs nothing, so it is not yet a trap. 08a correctly reports this as
diagnostic and changes no thresholds or content.

The plan's order runs 11a and 12a (the V4 playtest with Harry and two people) before
tuning in 08b–10. The playtest will therefore be on content that a coin-flipping player
usually wins. That is a valid choice if V4 is about feel and readability, but Harry
should decide it knowingly. Options: playtest as planned and expect "too easy" feedback,
or do a small tuning pass first (it would need its own task and the `sim:ci` before/after
summary).

### 8. Test gaps in the harness (low)

- `sim/` is not in the coverage `include` (`vite.config.ts:31–35`), so nothing reports
  which harness branches ran. `run.ts` is untested: the `--` handling, the `--runs` and
  `--policy` errors and the report write. 08b owns the full CLI, so at least add the
  argument errors there.
- Policy semantics (Random never releases, nobody calls it early, Greedy releases Gary
  then Jordan before the first draw) are asserted only in the 100-seed property test,
  not in the 4,000 `sim:ci` runs. Adding them to `runMeeting`'s final checks is a few
  lines and makes the gate cover them on every seed.
- `run.ts` calls `git` and reads `src/core/engine/constants.ts` relative to the working
  directory, so `pnpm sim` fails outside a git checkout or from another folder. Fine for
  CI; worth a clear error message in 08b.

### 9. Report and layout wording (low)

- `docs/sim/task-08a-v3.md` says "all passing gates used the installed Node 24 runtime"
  and "Sandbox-blocked tool access was retried with approved access". The second sentence
  is tool noise; drop it. For the first, say how Node 24 was run, since this laptop has
  none on PATH (same point as the second half of 07b finding 1).
- The tech spec's source tree (135–138) puts policies in `sim/policies/` (one file per
  policy) and the report in `sim/report.ts`. 08a uses a single `sim/policies.ts` and
  `sim/summary.ts`. That is fine for two policies, but task 09 adds five more; either
  move to the spec layout then, or update the tree in the same PR.

## Checks that passed

- **Policies use only the public API.** Greedy ranks by `previewResponse(...).utility`,
  then preview minutes, then ASCII ID, exactly as the design states. No utility, clamp or
  eligibility is recomputed in `sim/`. Random filters by `preview.enabled` and samples
  uniformly. Neither calls it early; only Greedy releases, Gary then Jordan, before the
  first draw. Experts and arrivals are retained.
- **Invariant gate.** Every engine input is recursively frozen (ESM is strict, so a
  mutation throws). Every transition is checked for integer, bounded, monotone counters,
  legal attendance, owner present, no rejoin, no repeated family, booking limits,
  phase/ending consistency and final score bounds. Every run is replayed and compared
  as a whole state, logs and decisions included. Failures name the seed and policy. A
  test proves each invariant rejects a bad state.
- **Medians and denominators.** All-run medians, middle-pair averaging for even counts,
  win means `ending === 'decision'`. Matches the design's report semantics.
- **Reproducibility.** My `pnpm sim:ci` run produced the committed JSON byte for byte
  apart from `revision`, including the content/constants hash.
- **Rules and layering.** `sim/` imports the engine only through `engine/index.ts`; the
  lint boundary keeps browser code from importing `sim/`. Reading `log` for the booking
  counts is a sim trace, which guardrail 4 allows. No new dependency, lockfile edit,
  threshold change or test weakening. The CI change only renames the artifact step, and
  `pnpm check` now runs `sim:ci` as the gate table (tech-spec.md:525) requires from 08a.
- **Scope.** No 08b CSV, no 09 policies, no tuning and no UI work.

## Plan acceptance checklist (08a row)

| Criterion                                       | Status                           |
| ----------------------------------------------- | -------------------------------- |
| Win rates reported against bands                | Met (both above band; finding 7) |
| Greedy median turns reported                    | Met (11, inside 9–12)            |
| P = 100 reachability reported                   | Met (Greedy 100%, Random 69.6%)  |
| Simulation invariants gate active in `check`/CI | Met locally; hosted run pending  |
| Acceptance text kept; one PR with hosted CI     | Not yet (findings 1 and 2)       |
