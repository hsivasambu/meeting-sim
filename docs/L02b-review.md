# L02b review — lunch writing pass

Reviewed October 13, 2026 on Harry's laptop (`C:\dev\meeting-sim`, branch
`docs/task-l02b-lunch-writing`, base `55d037e` = PR #17 head, uncommitted working
tree: `docs/content-table.md`, `docs/implementation-plan.md`,
`docs/lunch-content-checks.py`, `docs/lunch-writing-review.md` modified;
`docs/lunch-writing-review-report.md` new). Read-only: no files edited, nothing
committed, no task status changed.

Standard used: CLAUDE.md, `docs/implementation-plan.md` (L02b row and lunch
sequence), `docs/lunch-writing-review.md` (the L02b brief and exit criteria),
`docs/tech-spec.md`, ADRs 0005–0008 (accepted, not reopened), the prior
[L02 review](L02-review.md) and its resolution record.

**Assessment: ready for Harry's D18 content review; delivery evidence missing.**
The editorial pass is complete, honest about its limits, and mechanically clean:
I independently confirmed zero non-copy cells changed and all 45 change-log
entries match the actual diff. `pnpm check` passes on Node 24. The only required
item is the usual delivery step (commit, PR, hosted CI). A handful of optional
copy improvements are listed below; none blocks D18, and Harry can take or leave
them during approval.

---

## Prior L02 findings — status

| L02 finding                                      | Status now                                                                                                                                                                                                                                                         |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| B1 broken content-table tests                    | **Fixed** (in L02 resolution). Launch tests read `docs/content-table-launch.md` via a spec/CLAUDE convention. My Node 24 `pnpm check` run: 36 files / 347 tests pass, including `contentTableValidation` and `liveContent`.                                        |
| B2 uncommitted L00–L02, no PR/CI                 | **Fixed for L01/L02**: commits `c03e961` (PR #16) and `d2b4d88`/`55d037e` (PR #17), both open and stacked on #15. **Recurs for L02b**: this work is uncommitted with no PR (see R1), though the plan now honestly says "complete locally" rather than "delivered". |
| Copy 1 soup-return mug                           | Fixed: soup-return/hear is "Gary finishes his soup remarks…" (`content-table.md:377`).                                                                                                                                                                             |
| Copy 2 Alex recap assumes projector              | Fixed: alex-arrives/hear no longer mentions the cupboard (`:310`).                                                                                                                                                                                                 |
| Copy 3 "The Pat's questions topic"               | Fixed: "Postponed at minute {minute}: {topic}." and the checker now expands every topic.                                                                                                                                                                           |
| Copy 4 unexplained slides                        | Fixed: "Skip the big screen", topic "big screen".                                                                                                                                                                                                                  |
| Copy 5 room booking after minute 45              | Fixed: "this room is theirs from minute 45" (`:329`); timebox outcome now also reads true late.                                                                                                                                                                    |
| D1 gamble competitiveness / D2 expert paths      | Carried into the D18 handoff in both the table and report, without changing weights or availability. Correctly not reopened.                                                                                                                                       |
| Writing notes (rhythm, Gary, voices, flat lines) | Addressed in L02b; see assessment below.                                                                                                                                                                                                                           |

---

## Required before L02b can be called delivered

### R1. Commit, open the L02b PR and record hosted CI

- **Where:** whole working tree; `docs/implementation-plan.md:120–167` says
  "AI editorial work complete locally" and "No … hosted CI … is claimed".
- **Consequence:** Harry would be approving a D18 table that exists only on one
  laptop's working tree. The approved revision (`lunch-l02b-reviewed-1`) must be
  pinned to a commit that L05/L06/L07 can transcribe from.
- **Requirement:** CLAUDE.md "One blueprint task per PR"; implementation plan
  "Active … plus hosted CI evidence when delivering a PR".
- **Fix:** commit on `docs/task-l02b-lunch-writing`, open a PR stacked on #17,
  record the hosted quality run and the commit hash in the plan. The status text
  is already honest, so this is a delivery step, not a misstatement.

No other blocking findings.

---

## Verification of Codex's claims

| Claim                                                   | My check                                                                                                                                                                                                                                | Result                                                                                                      |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Mechanics unchanged; 287 rows, identical non-copy cells | Own parser over `git show HEAD:docs/content-table.md` vs working tree, comparing every table row by section/header/cell, treating only Opening line, Label, Description, Outcome line, Copy, Flavour line, Line, Name and Voice as copy | **Confirmed**: 287 = 287 rows, 0 non-copy cells changed, 47 copy cells changed                              |
| 45 field revisions cover the 47 changed cells           | Own parse of the report's change log: every Before is in the old table and absent from the new; every After is in the new                                                                                                               | **Confirmed**: 45/45 match; the two extra cells are the duplicated uncertain-branch descriptions            |
| Non-table prose changes are status/handoff only         | `git diff -U0` excluding table rows                                                                                                                                                                                                     | **Confirmed**: revision line, header status, D18 handoff paragraphs                                         |
| `python docs/lunch-content-checks.py` passes            | Ran it (Python 3.13.7)                                                                                                                                                                                                                  | **Pass**: 312 copy cells, 392 substitutions, 105 references, two clamped counterexamples                    |
| Checker change does not relax a rule                    | Read the diff: revision substitution now reads the table's own revision; the report is added to the link check                                                                                                                          | **Confirmed**                                                                                               |
| Gameplay gates "not rerun or claimed"                   | Ran `pnpm check` myself on Node 24.21.0 / pnpm 10.34.6 (typecheck, ESLint, Prettier `--check .`, Vitest with coverage, `sim:ci`)                                                                                                        | **Pass**: 347/347 tests, core engine 99.64% lines, Prettier clean incl. the new report, sim invariants PASS |
| `git diff --check`                                      | Ran it                                                                                                                                                                                                                                  | **Pass**                                                                                                    |

Codex did not run `pnpm check`; that was defensible for a docs task now that the
launch tests read the archived table, and my run confirms nothing broke.

---

## Content assessment

**What improved.** The pass hits the main L02 writing notes. Gary in outcome lines
fell from 10 to 8 and he no longer supplies the joke in Priya's, Jordan's or
Morgan's scenes. Morgan's voice is now consistent across both of their events:
"Shall I call that broad support?" right after one nomination, the
"carefully placed almost", and the away-day circle. That's the strongest voice
fix. Personified equipment (clock, screen, whiteboard, full stop) is gone, and
replacements land on recognisable behaviour: "Everyone leans in rather than
mentioning the big screen"; "Everyone waits for someone else to take
responsibility for the pause"; Jordan keeping "the proposed membership list".
Two factual risks I hadn't flagged were caught too: the Pat variant no longer
invents a calendar entry, and pat-arrives/hear no longer says a full recap tried
to avoid a recap. Success surfaces all name `{agreedCuisine}`; failures never call
the nomination an agreement. Uncertain descriptions now say plainly that the bad
branch sets you back and takes longer.

**Coverage.** All 21 groups, 22 presentations, 54 choices, 57 outcomes and every
catalog key have an entry with a keep/change reason. The brief's exit criteria
are met: exact input revision and commit, reviewer named, constructed reads of
success/failure/callback/arrival/both branches, D1–D3 kept separate, no claimed
human reaction.

### Optional copy improvements (non-blocking; Harry's call at D18)

1. **Sam's "information, not X" contrast now appears five times.**
   `content-table.md:297` "Sam wanted information, not a character assessment.";
   `:367` "information rather than another promise to investigate"; `:384` "an
   answer, rather than encouragement"; `:389` "treated as information, which
   helps"; `:390` "less motivational". A spice park → spice-return run shows the
   setup and the payoff back to back. This is the same repeated-punchline pattern
   the brief asks to revise or justify, and the report doesn't mention it.
   Suggest keeping one (the spice-return opening is the best) and giving the
   others a different beat, e.g. spice-return/owner "Alex clarifies the mild
   options. Sam stops needing to ask twice."
2. **projector timebox and park now read almost the same.** `:227` "Use the laptop
   / Read the menu together on the laptop" vs `:228` "Skip the big screen / … with
   the menu left on the laptop". Both outcomes are laptop-and-move-on. A player
   can't tell why one gives progress and the other postpones a topic. The park
   outcome also just restates its description. Suggest making park clearly about
   dropping the menu altogether ("Forget the screen and the menu; go back to
   {cuisine}. Fast, but nobody has looked at the options.") and give it a beat.
3. **"Save Pat's questions" when Pat asked none.** `:323`. Pat's opening is "Catch
   me up; I may be able to simplify this." Suggest "Save Pat's recap for later" or
   giving Pat a question in the opening. The topic label "Pat's questions" would
   follow.
4. **room-booked hear and vp share one punchline.** `:333`/`:335` outcomes both end
   with the next team finding another room ("…another room to discuss rooms" /
   "suddenly remembers another room"). Only one shows per run, but replays will
   notice. The Pat version could land on seniority instead (e.g. "The next team
   decides the hour was always ours.").
5. **expensive-discussion second sentence is unclear.** `:614` "Nobody has ordered
   anything through this meeting." reads as a non sequitur. The old food-invoice
   line was wrong on facts; the new one is safe but flat. Something like "So far,
   the most expensive part of lunch is talking about it." keeps it factual.
6. **Rhythm (carry-over).** "Quick" in descriptions fell from 19 to 16, and every
   description is still "Action. Tradeoff." That shape is doing the work of the
   removed numeric previews, so keeping it is fair; the report should say so in
   one line rather than leave the L02 note silently retained.
7. **Minor.** menu-needs/invite/helpful "additional paperwork earns its chair"
   calls Alex paperwork, though Alex's voice note is "actually reads the menu".
   "acquired" appears in both first-arrival and the Reply-All Royalty flavour.

### Design issues (route, don't change in L02b)

None new. D1 (gambles vs reliable alternatives), D2 (two expert paths each) and
D3 (room-booking trap) are correctly preserved for Harry's D18 decision. I accept
the L02 resolution's correction that my L02 D1 table was only checked states, not
universal dominance.

### Documentation nits (optional)

- The "supplemental parsed report coverage/change-log audit" in the plan and
  report isn't in the repo, so nobody else can re-run it. Fold it into
  `lunch-content-checks.py` or say it was a one-off. (I re-derived it
  independently; the result holds.)
- `docs/implementation-plan.md:84–85` still carries "recommended user-facing
  order is L02 → L02b so the creative direction is reviewed early", which is now
  historical.
- `docs/lunch-content-checks.py` is CRLF in the working copy; `.gitattributes`
  (`eol=lf`) normalises it on commit, so there's no effect.

---

## Checks actually run (this review)

- `pnpm check` on Node 24.21.0 / pnpm 10.34.6: **pass** (typecheck; ESLint
  `--max-warnings 0`; Prettier `--check .`; Vitest 36 files / 347 tests with
  coverage, core engine 99.18% stmts / 98.66% branches / 99.64% lines; `sim:ci`
  invariants PASS).
- `python docs/lunch-content-checks.py`: **pass** (all seven PASS lines).
- Independent table comparison (HEAD vs working tree): **287 rows, 0 non-copy
  changes, 47 copy cells**.
- Independent change-log audit: **45/45 entries match old/new text**.
- `git diff --check`: **pass**.
- `gh pr list`: #15, #16, #17 open and stacked; no L02b PR.

**Not run:** `pnpm build`/`size`/`e2e` (docs-only; unaffected inputs); hosted CI
(no PR); rendered 320 px fit; any human humour or comprehension test (L09).

## Outstanding requirements

1. **R1:** commit L02b, open its PR stacked on #17, record hosted CI and the
   commit hash for `lunch-l02b-reviewed-1`.
2. Harry's D18 approval of the revised table, including D1/D2, before
   L05/L06/L07 consume it. Optional copy items 1–7 can be folded in at that point;
   any change to a reviewed row should get a short L02b addendum.
3. Unchanged: L09 uncoached playtest and original 12a V4 remain pending.
