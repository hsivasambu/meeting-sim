# Task 07b review: live content and public draw bindings

Repo: `C:\dev\meeting-sim`, branch `feat/task-07b-live-content` at `b98ff51` (equal to
`origin/main`, so the base is correct this time). All task 07b work is uncommitted.
Real content changes are in four tracked files (`docs/implementation-plan.md`,
`src/core/content/copy.ts`, `content/engineRules.ts` (comment only), `content/index.ts`,
`src/core/engine/index.ts`) plus new files: `content/attendees.ts`, `content/titles.ts`,
21 files in `content/events/` and `scripts/liveContent.test.ts`. About 60 other files show
as modified but have no content diff (finding 7).

Reviewed against the plan's 07b row (implementation-plan.md:39), tech-spec.md (source
tree 113–120, Content validation 321–375, gate table 524), design-doc-v2.md (attendees,
titles, endings), the approved docs/content-table.md, ADR 0001, Harry's 06b decisions and
the 07a review and its resolution. The review was read-only. Nothing in the repo was
edited or staged; `git status` was identical before and after the gate runs.

## Verdict

**Ready to commit and open as a PR, after the plan fixes in findings 1 and 2.** No bugs in
the transcribed content or the public wrappers. Every row matches the approved table,
Harry's 06b decisions are intact, and the live pack passes the full playable validator with
the complete catalog. The remaining findings are process and doc repeats from earlier
reviews and small test gaps.

## The two questions from the 06b/07a reviews

**Did 07b change approved rows to get past the expert-work check? No.** `docs/content-table.md`
has no content change since the 06b approval commit `9ed47b4` (`git diff 9ed47b4 b98ff51`
and the working-tree diff are both empty for it). `scripts/liveContent.test.ts` parses
that table and compares every family row, presentation, variant condition and the full
response arrays (`toEqual`) against the event files, so code and table cannot drift
without failing.

**Was the validator fixed? Yes, in 07a, not 07b.** The narrower rule proposed in the 07a
review landed in PR #9 (`b98ff51`) as `contentValidationExpert.ts`. It checks only the
base presentation of a Dev/Sam/Morgan family that has a speaker-absence variant, and it
accepts any non-Priya requirement (so Legal on press-date passes). 07b does not touch the
validator. The rule is generic, with no live-content special cases. The tech spec
(321–352) records it as "authorized by Harry's request to address the supplied review and
merge the task". That is how Codex read Harry's instruction. Harry never explicitly
confirmed the reworded sentence that defines expert work. If he wants that on record, it
is a one-line confirmation, not a code change.

## Gate results

| Gate         | Local (Node 22.18.0, pnpm 10.34.6)                                                                        | CI (Node 24)            |
| ------------ | --------------------------------------------------------------------------------------------------------- | ----------------------- |
| `pnpm check` | Pass. 295/295 tests in 26 files (18 in `liveContent.test.ts`). Core engine 99.64% lines, 98.65% branches. | Not run (not committed) |
| `pnpm e2e`   | Pass. 18/18 on Pixel 7, iPhone 14 and desktop Chromium.                                                   | Not run                 |

Counts match the plan. The plan's 99.68% lines comes from Node 24.21.0. This laptop's
default Node is 22.18.0 (no Node 24 on PATH), so the small coverage difference is not a
defect. Hosted Node 24 CI is still the authoritative gate.

## Harry's 06b decisions

| Decision                                                   | Live content                                                                                                                                                                                                               |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Room booking: keeping the full hour is an intentional trap | `room-booked.ts`: `hear` "Check the reservation" costs 5 min, P 0, keeps 60. `timebox` costs 1 min and sets 45. Matches table 312–323. The four boundary cases (44/hear, 44/timebox, 46/timebox, 44/vp) are tested.        |
| Legal gets one response that needs them                    | `press-date.ts`: `legal` "Have Legal clear it", hear, requires legal, `legal-absent`, 6 min, P 20, R −1. The absence variant is unchanged. Tested: disabled before join and after release, enabled while Legal is present. |
| VP gets one response, P 0, not tuned for bots              | `room-booked.ts`: `vp` "Let the VP handle it", owner, requires vp, `vp-absent`, 1 min, P 0, keeps 60. ID `vp`, so the `timebox` tie-break still wins for Greedy as the table notes.                                        |

## Findings

### 1. Marked complete before commit, PR and hosted CI (medium; process, repeat of 07a finding 2)

The status line, the 07b row, the progress section and the new task section all say 07b
is complete and the next task is 08a. The work is uncommitted, there is no PR and no hosted
run. The task section is honest that no PR is claimed. The 07a review asked that a task
not be marked complete until the hosted evidence is in. Commit on this branch, open the
PR, record the hosted Node 24 run, then mark it complete.

The evidence paragraph also says "the restricted shell could not launch pnpm; checks used
the installed Node 24 environment" and then reports `pnpm check` and `pnpm e2e` results.
Say which commands actually ran. My `pnpm` runs reproduce the counts, so the results are
real, but the sentence reads as a contradiction.

### 2. The 07b acceptance criterion was overwritten again (medium-low; docs, repeat of 07a finding 3)

implementation-plan.md:39 replaced the acceptance column ("Every content-table row
implemented; `validateContent` passes on the live pack; bind `drawEvent`/`getDrawCandidates`
in `engine/index.ts` and test the public wrappers.") with completion evidence. The 07a
resolution (item 3) restored this practice for 07a: keep the acceptance text and record
evidence in the status lines and task section. Restore the original text. The evidence is
already at lines 3, 298 and the new task section. If the 07a resolution's catalog handoff
(item 5: `eventFiles`, `attendees`, `disabledReasons` and the used/authored reason audit)
was meant to be in this row, add it to the acceptance text. The test already does all of
it.

### 3. Callback and filler metadata are not compared with the table (low; test gap)

The transcription test reads the family table by filtering rows with six cells
(`liveContent.test.ts:101`). The "Scheduled/fallback ID" table (content-table.md:76–81) has
seven cells, so `kind`, `rarity`, `weight` and `negative` for `circle-back-return`,
`support-follow-up`, `p1-follow-up` and `filler` are never checked against it. I checked
them by hand and all four are correct (callback/common/1/false, noise/common/1/false).
Add the seven-column table to the comparison so a later edit cannot drift silently.

### 4. Epilogues are loosely typed and keep their risk tiers in display strings (low; task 15 handoff)

`copy.ts:17–59` types `ending` and `riskCondition` as plain `string`. A misspelled ending
such as `'called_early'` would still type-check, and the test only compares the strings
with the table. The tier bounds (`'R = 1–2'`, `'R = 3–5'`) are numbers inside text.
Task 15 needs numeric bounds to choose a tier, so it would have to parse the text or
author the numbers a second time. Either type `ending` as the non-null
`MeetingState['ending']` union and add `minRisks`/`maxRisks` next to the display string,
or note in the plan that task 15 adds them. This is a data shape choice. The values are
already in the approved table, so it is not a content design change.

### 5. The title test cannot catch swapped IDs and names (low; test gap)

`liveContent.test.ts:452–483` checks that title names follow the design order and that
each ID has a witness state where `earnedTitles` includes it. `inbox-zero` and
`efficient-facilitator` share the same witness and the check is `toContain`, so swapping
those two names in `titles.ts` would still pass. Nothing ties an ID to its design number.
The current mapping is correct by inspection against design-doc-v2 and `titleRules.ts`.
Assert the ID order explicitly (`['inbox-zero', 'efficient-facilitator', …]` matching
titles 1–12), or give each title a witness that earns it and none of its neighbours.

### 6. The callback walkthrough numbers are not asserted (low; test gap)

The table's "Callbacks and expert absence" walkthrough (content-table.md:482–495) gives
exact results for support-follow-up's absence route: hear gives P 16, R 0, T 12, 39
person-minutes. The callback test (`liveContent.test.ts:344–366`) only checks scheduling,
the Priya speaker and that `timebox` clears the schedule. Resolving `hear` and asserting
those numbers would cover the approved walkthrough the same way the ten-turn route is
covered. Also, `getDrawCandidates(callIt(state))` being empty holds for any ended state,
so it does not show that ending before the due draw suppresses the callback. Task 06's
draw tests already cover suppression on fixtures, so this line can go or be renamed.

### 7. Line endings will break `pnpm check` on the next fresh Windows checkout (low; repo hygiene)

`core.autocrlf` is `true` and the repo has no `.gitattributes`. Checkout writes CRLF and
Prettier's default `endOfLine: "lf"` then fails formatting. Codex worked around it by
rewriting about 60 working files to LF. That is why they show as modified with no content
diff (the plan notes this, and the frozen goldens are byte-identical in the index). Those
files add nothing to the commit, but the next clone or `git checkout` brings the failure
back. Fix it in a separate `chore/` PR with `* text=auto eol=lf` in `.gitattributes`
rather than in 07b, since it is repository configuration.

## Checks that passed

- **Transcription.** All 17 families, 3 callbacks, filler, 13 variants and every response
  match the approved table exactly (IDs, labels, techniques, requirements, reason keys,
  effects, callbacks, joins, booking ends, outcome lines). The six disabled reasons, six
  epilogues, results heading and moment fallbacks match the table. The eight attendees and
  twelve title names match the design doc. Event file stems equal event IDs.
- **Validation.** `validateContent` returns no issues for the live pack in the default
  playable profile with the full catalog: file stems, attendees, titles, disabled reasons,
  epilogues and moments. Used reason keys equal authored keys, so no stale copy. The pack
  survives a JSON round trip, so it is plain data.
- **Public wrappers.** `drawEvent`/`getDrawCandidates` in `engine/index.ts` delegate to
  `drawEventWith`/`getDrawCandidatesWith` with the live pack. They are tested against the
  internal functions, for pending idempotence and for ended-state behaviour.
  `engine/index.ts` is still the only importer of live content (lint passes).
- **Behaviour tests on live content.** Every variant is selectable through the public
  candidate API. Releasing an expert during a pending event keeps the delivered
  presentation and disables the right choices with the right reason keys. The approved
  ten-turn route reaches P 100, R 0, minute 38 and 152 person-minutes. Arrivals bill the
  old headcount and cannot re-enter. Exhausted content falls back to two-minute filler
  until time expires.
- **Rules.** Content files are plain `as const satisfies MeetingEvent` data with no
  functions or computed values. Live tuning numbers are asserted only in the
  content-validation script, as guardrail 9 allows. Engine internals, rules, scoring,
  fixtures and goldens are unchanged. There is no new dependency, lockfile edit, CI change
  or threshold change. Bundle size is unchanged because the shell does not import the
  engine yet.

## Plan acceptance checklist (07b row)

| Criterion                                                        | Status                                                    |
| ---------------------------------------------------------------- | --------------------------------------------------------- |
| Every content-table row implemented                              | Met. Callback/filler metadata checked by hand (finding 3) |
| `validateContent` passes on the live pack                        | Met, with the full catalog and the reason-key audit       |
| `drawEvent`/`getDrawCandidates` bound and public wrappers tested | Met                                                       |
| Acceptance text kept; delivered as one PR with hosted CI         | Not yet (findings 1 and 2)                                |
