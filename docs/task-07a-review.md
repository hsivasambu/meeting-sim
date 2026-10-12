# Task 07a review: content validator and content index

Repo: `C:\dev\meeting-sim`, branch `feat/task-07a-content-validation` at `b88a56f`. All task
07a work is uncommitted: five modified files (`docs/implementation-plan.md`,
`docs/tech-spec.md`, `src/core/engine/constants.ts`, `drawRuns.test.ts`, `engine/index.ts`)
and six new ones (`src/core/content/index.ts`, `contentValidation.ts`,
`contentValidationHelpers.ts`, `contentValidationTypes.ts`, `contentValidation.test.ts`,
`fixtures/validation.ts`). Reviewed against the plan's 07a row (implementation-plan.md:38),
tech-spec.md (Engine contracts 155–320, Content validation 321–366, gate table 510–519),
design-doc-v2.md (draw rules 136–143, schema 250–310, release rules 47 and 78), the approved
docs/content-table.md, ADR 0001 and Harry's 06b decisions. The review was read-only. Nothing in
the repo was edited or staged. One throwaway audit script ran from outside the repo; the
working tree was identical before and after.

## Verdict

**Not ready to merge. The validator rejects the content table Harry approved (finding 1).**
I transcribed every row of `docs/content-table.md` into a `ContentPack` and ran
`validateContent` in the default (playable) profile, with the table's disabled-reason copy
as the catalog. Every rule passes except `expert-requirement`, which raises 13 errors. One
of them is the Legal response on `press-date` that Harry asked for in the 06b decisions. As
written, task 07b cannot turn the content gate green without changing approved content,
which CLAUDE.md forbids. Everything else is in good shape. The structural rules match the
spec, the tests cover the negative cases well, and the gates pass. The other findings are a
process repeat from 06b, doc consistency, and test gaps.

## Gate results

| Gate                                             | Local (Node 22.18.0, pnpm 10.34.6)                                                                                                    | CI (Node 24)            |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `pnpm check` (typecheck, lint + prettier, tests) | Pass. 272/272 tests in 22 files. `src/core/engine` 99.61% lines, 98.75% branches (`contentValidation.ts` 96% lines, 93.87% branches). | Not run (not committed) |
| `pnpm e2e`                                       | Pass. 18/18 on Pixel 7, iPhone 14, desktop Chromium                                                                                   | Not run                 |

Test and E2E counts match the plan. The plan records 99.64% lines and 98.77% branches on Node
24.21.0. My run used this laptop's default Node 22.18.0 (pnpm warns about the `.nvmrc` 24
engine), so the small coverage difference is not a defect. Hosted Node 24 CI remains the
authoritative gate. `contentValidation.test.ts` alone takes 18.7 s of the 20 s test run
(finding 7).

## Findings

### 1. The expert-requirement rule fails the approved content table (high; blocks 07b)

`contentValidation.ts:285–294` flags any `hear`/`owner` response with positive progress whose
`requires.present` does not include the presentation's speaker. The exceptions are the
`room` narrator, arrival events and gifts. The approved table breaks that heuristic in three
deliberate ways:

| Pattern in the approved table                                                   | Flagged paths                                                                                                               |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Tangents voiced by non-experts (Jordan, Gary) whose `hear` gives small progress | `intros[0].hear`, `scope-revisit[0].hear` (the design's own sample event), `unrelated-q[0].hear`, `another-meeting[0].hear` |
| Morgan's vague tangent and its callback share one set with the absence variant  | `circle-back[0].hear`, `circle-back[1].hear`, `circle-back-return[0].hear`, `circle-back-return[1].hear`                    |
| Absence variants voiced by Priya, where the work is done without the expert     | `failing-tests[1].hear`, `p1-bug[1].hear`, `support-follow-up[1].hear`, `p1-follow-up[1].hear`                              |
| Expert work that needs someone other than the speaker (Harry's 06b decision 2)  | `press-date[0].legal`. Speaker Morgan, `requires: { present: [legal] }`, P 20                                               |

The table states the intended rule at content-table.md:35–41: expert work requires the
expert, and gifts and arrivals are exempt. It never says that every positive hear/owner
response is expert work, and it gives the Priya absence variants unrestricted hear responses
on purpose. The new spec sentence at tech-spec.md:345–346 ("expert hear/owner work with
positive progress must require the presentation's expert") was written in this task. The
plan records Harry's approval for the synthetic/playable split only, not for this
definition. CLAUDE.md rule 10 says a convention must not be settled in code alone, and the
docs now contradict each other.

The unit tests did not catch this because every `validationPack` event is voiced by `room`
(fixtures/validation.ts:15), which exempts all of them. The only positive test
(contentValidation.test.ts:488–528) uses one hand-built expert event.

Recommended fix (I prototyped it against the table): limit the check to the **base**
presentation of a family whose speaker is an expert (dev, sam, morgan) **and** that has an
`absent: [speaker]` variant. In that presentation, a positive hear/owner response that does
not appear unchanged in the absence variant's set must require at least one attendee other
than Priya. On the approved table this gives zero issues. Removing `requires` from
`failing-tests` and `support-training` gives four issues (both hear and owner on each), which
are exactly the expert responses. Reword tech-spec.md:345–346 to match, and add regression
cases for all four patterns above. Harry should confirm the reworded sentence, because it
defines what counts as expert work.

### 2. The work is uncommitted on a branch main no longer contains (medium; process, repeat of 06b finding 1)

PR #8 was squash-merged as `9ed47b4` at 19:19 UTC. This branch sits on `b88a56f`, which is
the pre-squash 06b history and not an ancestor of `origin/main`. The trees are identical
(`git diff b88a56f origin/main` is empty), so the changes apply cleanly. Recreate
`feat/task-07a-content-validation` from `origin/main`, commit, open the PR and record the
hosted Node 24 run, as for tasks 06 and 06b. The plan says "complete locally" and does not
claim a PR, which is accurate. It should not be marked complete until the fix for finding 1
and the hosted evidence are in.

### 3. The plan's 07a acceptance criteria were overwritten (medium-low; docs, repeat of task 06 finding 7)

implementation-plan.md:38 replaced the acceptance column ("`validateContent` rules
implemented and tested on valid and invalid fixture packs; speaker present at draw unless
room/arrival speaker") with completion evidence. The 06b review confirmed the agreed
practice: keep the acceptance text and record evidence in the status lines and the task
section. Restore the original criterion. The evidence already appears at lines 3, 296 and
1106–1180.

### 4. The spec now promises rejection tests that do not exist (medium-low; test gap and docs)

tech-spec.md:348–350 says partial or deliberately malformed packs are negative fixtures and
"the validation tests assert rejection". Many such packs are built inline in tests:
`draw.test.ts` (`pack([])`, the `second-parent` pack at line 301 that has no scheduling
response, and the other `pack(...)` calls) and `drawRuns.test.ts:304` (`modified`). None of
them is passed to `validateContent`. The gate row at tech-spec.md:516 still says
"`validateContent` passes for every pack, fixture and live", which no longer matches the
profile wording above it. Either add one test that runs the synthetic profile on each inline
pack and asserts pass or rejection, or narrow both sentences to the packs actually checked
(`fixturePack`, `goldenPack`, `mixedGoldenPack`, the `drawRuns` run packs and
`validationPack`). Update the gate row to name the profiles either way.

### 5. The playable gate passes without its catalog (low; 07b handoff)

`validateCatalog` returns early when no catalog is given, and every catalog section is
optional. A live-pack test that forgets the catalog would skip file-stem identity,
disabled-reason copy, attendee job titles, collectible titles and results copy, and still
pass. tech-spec.md:340–341 hands this to 07b/15. Make it concrete in 07b's acceptance text:
the live test supplies `eventFiles`, `attendees` and `disabledReasons`, with titles and
moments added in task 15. Also consider flagging catalog reason keys that no response uses,
so stale copy cannot pile up.

### 6. MVP relationships are hard-coded in the engine (low; maintainability)

`contentValidation.ts:138–159` repeats the three callback pairs, both arrivals and
`room-booked` as string literals. `content/engineRules.ts` already holds the same data. The
playable check then compares the pack against a second copy of its own metadata. Lint stops
engine internals from importing content, so a cleaner approach is for the live-pack test in
07b to assert `pack.eventRules` equals the design's three pairs, or to move the expected
relationships into `constants.ts` next to `MVP_ARRIVAL_COUNT`. This does not block. The
spec's approved scope paragraph does ask for "exact MVP relationship checks".

### 7. Content validation now dominates test time (low; performance)

`validatePresentations` enumerates 128 rosters × 60 minutes × 6 risk levels for every event
and rebuilds `rosters()` each time. One run over the full approved table took 331 ms. The
45 validation tests call it about 60 times, so the file takes 18.7 s of a 20 s suite. That is
well under Vitest's per-test timeout, but it slows every local run. Memoize `rosters()` at
module level and skip states once all three problem rules have fired. Enumerating only the
minutes and risks that some condition in the event references would remove most of the cost.

### 8. Small test issues (low; tests)

- contentValidation.test.ts:178–182: the case named "expert requirement" asserts
  `callback-scheduler`. It only fails because it removes the callback from `circle-back`.
  Rename it or drop it, since 488–528 covers the real rule.
- Condition keys are validated only when they are numbers. A misspelled key such as
  `minRisk` passes silently because `matchesCondition` ignores it. `satisfies` catches this
  in live content, so a test is enough.
- `ATTENDEE_IDS` (constants.ts:76) has no `satisfies readonly AttendeeId[]` and no
  exhaustiveness check against the `AttendeeId` union. A ninth attendee would be silently
  left out of roster enumeration.

## Checks that passed

Audit of the approved table, with every row transcribed by a throwaway script and validated
in the playable profile using the table's six disabled-reason keys:

- No issues apart from finding 1: unique IDs, attendee references, 1–3 responses, effect
  ranges, copy limits, zero-minute email only, always-enabled fallbacks, disabled-reason keys
  and copy, joins, booking paths, callback pairs and park/email schedulers, filler shape, the
  first-two guarantee, and speaker presence and variant reachability across all rosters,
  minutes and risks.
- Harry's 06b decisions are respected apart from finding 1. `room-booked` passes with its
  three paths (45/60/60, VP option P 0, ID `vp`). The validator does not touch tuning, and
  `legal-absent` and `vp-absent` resolve against the catalog.

Code and docs:

- `validateContent` is pure. It does no I/O, uses no Date or randomness, and does not mutate
  its input (deep-frozen inputs are tested). It returns path-addressed issues as the spec
  requires.
- The synthetic profile relaxes only response count, effect ranges, copy length, expert work
  and MVP relationships. Structural rules apply to both profiles. Frozen goldens are
  unchanged and pass the synthetic profile, and the test asserts that they fail the playable
  one.
- The callback rules match design-doc-v2.md:141–143: three explicit pairs, common and
  non-negative targets with no `when`, no chains, `afterTurns: 2`, park/email schedulers that
  are reachable in every state, and callback responses of at least one minute.
- The first-two check counts common, unrestricted, non-arrival substantive families. That
  matches the draw pool in `draw.ts:101–111`, which needs two unseen substantive families.
- The variant witness test drives the real `getDrawCandidatesWith`, so first-match precedence
  is proved against the engine and not a copy of it.
- `content/index.ts` re-exports only `engineRules`, `engine/index.ts` remains the sole content
  importer (lint passes), and no live dialogue or tuning was added.
- No new dependency, no CI change, no lockfile edit, no threshold change, no scoring change.

## Plan acceptance checklist (07a row)

| Criterion                                                          | Status                                                                              |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `validateContent` rules implemented                                | Met, except the expert rule rejects approved content (finding 1)                    |
| Tested on valid and invalid fixture packs                          | Met for `validationPack` variants; inline engine test packs not covered (finding 4) |
| Speaker present at draw unless room/arrival speaker                | Met. Every roster × minute × risk state is checked                                  |
| Content index added                                                | Met (re-exports relationship metadata only)                                         |
| Acceptance text preserved; delivered as one task PR with hosted CI | Not yet (findings 2 and 3)                                                          |
