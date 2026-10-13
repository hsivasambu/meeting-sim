# L02 review — complete lunch content draft

Reviewed October 13, 2026 on Harry's laptop (`C:\dev\meeting-sim`, branch
`feat/task-12a-text-loop`, HEAD `ff67d21`, uncommitted working tree). Read-only:
no files edited, nothing committed, no task status changed.

Standard used: CLAUDE.md, `docs/implementation-plan.md` (L02 row and lunch
sequence rules), `docs/lunch-redesign-plan.md`, `docs/design-doc-v2.md`,
`docs/tech-spec.md` (content validation), ADRs 0005–0008, and earlier approved
content decisions (room-booking trap; one expert-dependent response each for
Legal and the VP, VP at 0 progress).

**Assessment: needs changes.** The draft is complete, internally consistent and
its arithmetic checks out, but replacing `docs/content-table.md` breaks the active
unit gate, the task is marked complete while uncommitted with no PR or CI, and a
handful of copy lines are factually wrong in the situations where they appear.

---

## Blocking findings

### B1. Replacing `docs/content-table.md` breaks four active unit tests

- **Where:** `scripts/contentTableValidation.test.ts:67` and
  `scripts/liveContent.test.ts:36` read `docs/content-table.md` and compare it to
  the live launch pack. L02 overwrote that file with the lunch draft.
- **Consequence:** `pnpm test` (part of `pnpm check`) fails: 2 files, 4 tests
  (`accepts every approved row…`, `still rejects removed requirements…`,
  `transcribes every family…`, `transcribes disabled reasons…`). The failure diffs
  show launch values expected and lunch values found (for example `dev-absent`
  vs `alex-absent`). Full Vitest run: 4 failed, 343 passed.
- **Requirement:** implementation plan, lunch sequence paragraph after the table
  ("Intermediate preparation must preserve all live launch behavior and active
  checks"); CLAUDE.md "Never deactivate an active gate"; L03–L07 are meant to run
  with the launch runtime and its tests green.
- **Why it was missed:** the L02 record says `pnpm check` was not run because this
  was a documentation task, and states no gate changed. The doc is an input to an
  active test, so the claim is unsupported.
- **Suggested correction:** first add a spec/plan line that the launch tests and
  launch transcription comments use `docs/content-table-launch.md` until L08 (see
  B3 on conventions), then repoint the two test sources to that file. The preserved
  launch file differs from the committed table only by a 12-line header note, and
  keeps the same section headings, so this should restore the gate without
  touching any assertion. Alternatively keep the launch table at its old path and
  author the lunch draft in a new file until L08. Either way, run `pnpm check` on
  Node 24 and record the result.

### B2. Marked complete while uncommitted, with no PR or CI (recurring)

- **Where:** `docs/implementation-plan.md:3`, `:48` ("**L02 (authored)**"),
  `:113–172` ("authorship complete; handed to L02b"); README and lunch plan say
  the same.
- **Consequence:** L00, L01 and L02 are all uncommitted on the 12a branch, mixed
  with an edit to `docs/task-12a-playtest.md`. The L02 diff cannot be isolated or
  reviewed on its own, and there is no hosted evidence. This is the same pattern
  flagged in earlier reviews.
- **Requirement:** CLAUDE.md "One blueprint task per PR; branch feat/ fix/ chore/
  docs/"; implementation plan "Each task is one blueprint PR" and "Active … plus
  hosted CI evidence when delivering a PR".
- **Suggested correction:** commit L00/L01 and L02 as separate commits (or
  separate PRs per the one-task rule) on a `docs/` branch off main, open the PR,
  and keep the status as "authored, awaiting PR/CI" until hosted checks pass.

---

## Content defects (should fix before L02b sign-off)

These are factual errors, not taste. Each one is false in a reachable situation.

1. **soup-return/hear refers to a mug that was never mentioned.**
   `docs/content-table.md:377`: "The mug evidence is returned to the kitchen."
   The mug only appears in soup-debate/hear (`:250`), but soup-return is scheduled
   only by soup-debate/park (`:252`), so the player can never have heard about the
   mug. Fix: make the line stand alone (Gary's remarks, not the mug).
2. **alex-arrives/hear refers to the cable cupboard even if the projector event
   never happened.** `:310`: "The cable cupboard is included for completeness."
   Projector is one of 16 random families and may be unseen or still to come. Fix:
   refer to something always true (the nomination, the length of the recap).
3. **"The Pat's questions topic" is ungrammatical.** The first-postponed moment
   (`:480`, "The {topic} topic was postponed…") with topic "Pat's questions"
   (`:476`) renders "The Pat's questions topic was postponed at minute 29." The
   checker substitutes a fixed topic, so it cannot catch this. Fix: reword the
   topic ("Pat's question list") or the template ("{topic} was postponed…").
4. **projector/park says "Leave the slides", but there are no slides.** The
   opening (`:222`) is about showing the menu from a laptop; the label and
   description (`:228`) and its moment topic "slides" (`:472`) talk about slides
   and a presentation the player was never told about. This is the kind of
   unexplained office vocabulary Harry's feedback complained about. Fix: "Skip the
   big screen" or similar.
5. **room-booked can appear after minute 45 and still say the booking starts at 45.** No family condition (`:111`), and the table's own booking witness draws
   it at T46 (`:746`). "The next team says their booking starts at minute 45"
   then describes a deadline that has already passed. Launch had the same
   eligibility, so this is copy only; do not change the mechanic. Fix: phrase it so
   it remains true late ("The next team says this room is theirs from minute 45.").

---

## Design issues to route (not blocking L02; L02b must not change mechanics)

### D1. All three uncertain choices are worse than their reliable alternative

Using ADR 0007's utility, each uncertain response has lower expected utility than
the deterministic hear option at every state I checked (headcount 6–8, clamped
near 100):

| Uncertain choice        | Expected U at the table's state | Reliable hear | q of the gamble |
| ----------------------- | ------------------------------- | ------------- | --------------- |
| quick-agreement/refocus | 5.88                            | 11.6          | 0               |
| spice-question/timebox  | 8.53                            | 11.6          | 73/96           |
| menu-needs/invite       | 4.96                            | 10.8          | 77/150          |

So Greedy never picks any of them and the Choices score always penalises taking
the chance. The brief says uncertain outcomes should make decisive suggestions
"interesting without concealing the possibility of a setback"; here they are
always traps, and Morgan's quick agreement, the headline example, scores q=0.
The table computes these numbers (`:724–729`) but its handoff (`:778–785`) does
not flag the dominance. Weights are draft and tuning belongs to L12, so this is a
decision for Harry, not an L02 defect: either accept "gambles are traps" as
intended (and say so in the D18 handoff), or ask L12 to tune at least one gamble
to be competitive.

### D2. Expert-dependent responses changed from one each to two each

Earlier approved content gave Legal and the VP one response each that needs them,
the VP's at 0 progress. L02 keeps room-booked/vp at P0 (good) but adds
lunch-window/pat (P16) for Pat and two Alex responses (menu-return/owner,
spice-return/owner). The lunch plan does open "table's expert benefits" to content
review, so this may be fine, but it is a departure from an approved decision and
the draft does not call it out. Add one line to the D18 handoff so Harry approves
it knowingly. Side note: Alex is only useful inside callbacks, so inviting Alex
pays off only if a menu or spice question was postponed.

### D3. Room-booking trap preserved (no action)

hear keeps 60 for 5 minutes at P0; timebox ends at 45 for 1 minute; vp keeps 60
for 1 minute at P0 and loses the tie to timebox on ASCII. Same as launch, copy
rewritten in plain language, and the table says not to retune it. Consistent with
the approved decision.

---

## Writing assessment (for L02b; optional unless noted)

**What works.** The register is right for adults: dry, observational, mostly free
of software jargon. The best lines land on procedure, not people: "Gary cites a
mug from 2018. Nobody expected the crockery to become a witness."; "The committee
needs everyone here. We have discovered the meeting we are already in."; "Everyone
reads the name already printed on their card."; "Gary promises an attachment. The
meeting has outsourced its next nine pages." Sam's dietary lines keep the joke on
the meeting, not the preference, as the brief asks. Success copy always names the
agreed cuisine and failure copy never does.

**Repetition and rhythm.**

- All 54 descriptions use the same "Action. Tradeoff." shape, and 17 of them say
  "quick". 55 of 57 outcome lines are "Fact. Wry follow-up." The structure is
  clear but becomes predictable within a run.
- Gary is named in 11 of 57 outcome lines, plus his own four presentations. He
  becomes the punchline for other people's events (nomination, lunch window,
  portion plan, quick agreement), which dilutes Morgan, Dev and Priya.
- On a success results screen, the "Lunch Is Settled", "Death by Diligence" and
  "Second Helping" flavour lines all open "{agreedCuisine} is agreed.", next to an
  epilogue and summary that say the same. The ten-turn route earns slots 3 and 8
  together, so players will see the repeat.

**Voice balance.** Presentations by speaker: Sam 4, Gary 4, Priya 3, Jordan 3,
Morgan 2, Dev 2, Alex 1, Pat 1. Morgan's "makes suggestions sound final" voice
appears clearly only once. Priya and the narrator are hard to tell apart.

**Flat or unclear lines.** alex-arrives/timebox ends "A new approach." with no
joke; pat-arrives/hear has three sentences and ends on "Pat appreciates the
background."; pat-arrives opening promises "a lunch preference" that never
appears; "Gary checks whether a nod needs to be minuted" uses the meeting jargon
the redesign was meant to remove.

**Honest tradeoffs.** Descriptions name the downside for all three gambles, which
meets the brief. menu-needs/invite ("Alex may uncover a question we missed") frames
the bad branch as a discovery; a tester may not read it as a setback. Worth a
specific L09 question.

**Minor.** The commentary ID `lunch-agreed` matches the title ID `lunch-agreed`;
they are separate catalogs, but a distinct ID avoids confusion at transcription.

---

## Documentation consistency

- `docs/implementation-plan.md:5` still says "Current task: 12a … Next blueprint
  task after 12a acceptance: 08b", contradicting line 3 and the lunch sequence.
- The L02 row's ID cell now reads "**L02 (authored)**". The acceptance text itself
  is intact (criteria, not evidence), so no overwrite there, but status belongs in
  the execution record, not the ID column.
- `src/core/content/events/*.ts` and `engineRules.ts` headers say "Approved
  docs/content-table.md → …", and CLAUDE.md:57 / tech-spec.md:766 say event content
  is transcribed from `docs/content-table.md`. During L03–L07 that file is the
  unapproved lunch draft, so these pointers now send a code task to the wrong
  table. Covered by the B1 fix; it needs a spec line, not just a code edit.
- `docs/content-table-launch.md` matches the committed launch table except for a
  12-line header note; no launch rows changed. Good.

---

## Verified (all on this laptop, Node 22.18.0, Python 3.13.7; not CI's Node 24)

- `python docs/lunch-content-checks.py`: pass (17 families, 3 callbacks, filler,
  22 presentations, 54 choices, 57 outcomes, 312 copy cells, 90 relative links).
- I re-derived independently: ADR 0007 utilities and q for all three gambles; the
  ten-turn success, expiry and invitation routes; the slot 1/2 (960 points), slot 4
  and slot 7 title witnesses; booking, deadline-precedence and completing-join
  boundaries; the $9,200 copy bound (552 person-minutes × 1000/60). All match.
- Tech-spec structural rules: 1–3 responses per event, 1–2 branches, 1–10
  minutes, progress −10…+25, only room-booked sets 45/60, consistent joins on
  invitation branches, always-enabled alternatives, equal nominations,
  callback targets unique and non-chaining. All hold.
- Prettier `--check` on the six L02 documents: pass. `git diff --check`: pass.
- Vitest (no coverage), Node 22: `scripts/contentTableValidation.test.ts` and
  `scripts/liveContent.test.ts` fail (4 tests); 343 others pass.

**Not verified:** typecheck, lint, coverage thresholds, `sim:ci`, build/size and
E2E (docs-only change, but `pnpm check` on Node 24 is still owed because of B1);
hosted CI (no PR exists); that the four tests pass at HEAD without the L02 change
(inferred from the failure diffs and earlier green CI, not re-run); rendered 320 px
fit; any human humour or comprehension result.

## Outstanding before L02 can be called complete

1. Restore the active unit gate (B1) with a spec line first, and record a passing
   `pnpm check` on Node 24.
2. Commit L02 separately from L00/L01, open its PR and record hosted CI (B2).
3. Fix the five factual copy defects, or hand them to L02b explicitly by address.
4. Add D1 (dominated gambles) and D2 (expert-response count) to the D18 handoff so
   Harry decides them knowingly.
5. Fix the stale "Current task: 12a" line in the plan.

No other actionable findings.
