# This Could've Been an Email — Design Doc v2

October 13, 2026 · Approved lunch redesign · @Harry

Harry accepted all recommended resolutions in ADRs 0005–0008 and confirmed that
success must choose an actual cuisine. This is the current normative game design;
the earlier Friday Launch rules remain in Git history and historical task records.
The technical spec owns architecture and gates; the implementation plan owns task
order/status. This documentation reconciliation implements no gameplay changes.

## Premise and writing direction

Six adults must agree on a cuisine for lunch. The objective should read in two
seconds. Start goes straight to the room and a cuisine nomination; no setup menu.
A run aims for 2–3 minutes/about ten turns. Reading speed never affects game time.
Keep progress, time and absurd salary cost visible; remove release and Open Risks.

Write adult workplace humour: dry observation, passive aggression, petty status,
misplaced confidence, performance of helpfulness and unnecessary process. Use
clear everyday language, different character voices and an earned comic escalation.
Roughly 70% relatable office humour and 30% absurdity is editorial direction, not
a quota. Adult means sophisticated observation, not mandatory profanity or sexual
content. Avoid a children's-cartoon tone, constant cute whimsy, generic filler
jokes and jargon-dependent punchlines. Ordinary preferences are legitimate; the
joke is how difficult the adults make agreeing. Every interaction has a comic
purpose; a straight setup need not itself be a punchline. See L02b's writing brief.

## Core loop and game state

### Cuisine, agreement and endings

The nomination event offers three reviewed cuisine names (draft, not yet final: Italian,
Mexican, Thai), with equivalent deterministic mechanical effects and unscored
quality when tied. It is a substantive event and counts toward the first-two
guard. `nominatedCuisine: CuisineId | null` starts null. Only nomination sets it;
later copy references it through authored placeholders. Other event draws require
nomination to have resolved. No cuisine is mechanically better and no outcome
silently swaps it. There are no per-person preference vectors or vote counts.

Progress represents the room's aggregate movement toward accepting the nomination,
not a count of voters. P=100 with a nomination means **all present adults agree**.
`agreedCuisine: CuisineId | null` is set to the nomination only at that terminal
transition. Show “Considering: Thai” during play and “Agreed: Thai” on success;
failed results say “No agreement” and may show the nomination separately.
Every success summary, epilogue and later share export must name the actual
agreed cuisine. A generic “Decision Made” alone fails acceptance. Failure and
cancellation remain possible and must never pretend the nomination was agreed.
Engine validation rejects P=100 without nomination rather than declaring victory.

Keep 60-minute booking, existing 45-minute room-booking possibility, Call it and
four endings. A completing response wins even at/over deadline; bill full duration
at pre-response headcount, apply progress and joins/booking, then check agreement
before expiry. A joining adult shares the resulting group agreement; no new vote
or progress reset. Response copy must not claim unanimity on a nonterminal branch.
Call it before the nomination resolves is cancellation, after any resolution is
called-early. Retain the intentional room-deadline tradeoff, rewritten in plain
lunch language; do not silently fix its immediate-utility limitation.

### Attendance, callbacks and termination

Six starting adults stay. Preserve the eight IDs for asset identity; plain-language
name cards replace technical job titles. Two people can join, once each, up to eight.
Replace the one-event-to-one-arrival map with approved event/response-to-attendee
permissions, validated against content. A spontaneous arrival event requires its
attendee absent and joins on every response; invitation responses also require
absence and have an always-enabled alternative. Every branch of an invitation
joins the same person: uncertainty is about agreement, not whether someone exists.
Once invited, the matching spontaneous family is ineligible. No anonymous ninth
seat, duplicate joins, removal effects or re-entry history.

Keep 17 base families including nomination, three unique scheduled callbacks, one
repeatable +2-minute filler. First two draws are substantive, no adjacent uncommon
negative events, unseen base IDs, fixed PresentedEvent, explicit acknowledgements,
and existing booking limits stay. Replace the exact parent IDs through the reviewed
table. A branch may schedule its parent's single target for n+2; none schedules
more than one. No callback chains, repeat targets or conditions; an ending cancels
delivery. Returning discussion consumes minutes even without an Open Risks meter.
`parkedCount` counts park actions once per response, not each outcome; keep it for
titles, label it “Topics postponed” only where useful, not a new risk meter.

All lunch response branches take 1–10 minutes (approved tightening: no zero-minute
email shortcuts); progress remains −10…+25. Limited base/callback counts plus
two-minute filler preserve the existing conservative bound: at most
17 + 3 + ceil(60/2) = 50 resolutions, often fewer. No response reduces elapsed
time, extends booking past 60 or reopens an ended run. This is a termination proof,
not a forced turn-cap rule. Validate each branch, depleted pools and early expiry.

### Uncertainty, preview and reproducibility

See [ADR 0006](adr/0006-lunch-response-outcomes.md) for the precise approved
schema/RNG/API. One deterministic outcome is the default; selected responses have
two positive integer weights, one complete effect and authored outcome line each.
No stacking shared and branch effects. Branch duration may differ; each line must
explain what actually happened. The request's 80/20 example is not a tuning value.
L02 drafts initial weights for L02b/D18 review; L09 checks whether the wording predicts the
sort of downside fairly before L12 tunes anything substantially.

Preview never samples. Expected values clamp each branch against the current
state before weighting, including integer pre-response-headcount billing. The
actual resolve samples once on a separate keyed response stream; refresh, preview,
simulation inspection and reading speed cannot change it. Replay records need
rules/content revision, seed and ordered actions; a seed alone does not promise
identical play across redesign versions. Outcome ID in narrative logs explains
the actual result; score and titles never derive rules by reading those logs.

## Scoring

Keep Outcome 400 + Efficiency 300 + Decisions 300, component rounding then sum.
For a valid lunch state, agreement requires P=100 and recorded cuisine.

```text
O = 400 if agreement, otherwise 1.8 * P
E = 300 * min(P,100)/100 * clamp((360 - pm)/(360 - COST_FLOOR_PM), 0, 1)
u(branch) = effectiveDeltaP - W_COST * (billedDeltaPersonMinutes / 6)
U(response) = sum(weight(branch)/sumWeights * u(branch))
q = (U(chosen) - minEnabledU)/(maxEnabledU - minEnabledU)
D = 300 * mean(scored q)
```

Remove risk penalty/cap and W_RISK, not merely set them to zero. Initial W_COST
remains 1.2, floor remains 90 pending normal D25 calibration. Use existing exact
decimal rational arithmetic extended to weights; clamp each branch first, not
the average effect. Disabled responses excluded; fewer than two distinct values
means q=null; no scored decisions means D=0. Record q before sampling. No past q
is recomputed. Dollars and commentary comparisons never enter scoring.

Time affects the deadline, full-duration person-minute cost and utility; no
separate time component is added. Outcome/Efficiency use realized state. The
rule promises success Outcome exceeds failure Outcome, not every successful
total exceeding every failure total. It no longer claims slow thorough play must
beat fast play that actually reaches agreement.

Exact score fixtures (pm derived from the old dollar examples):

| Case                           | P   | pm  | mean q | O   | E   | D   | Total |
| ------------------------------ | --- | --- | ------ | --- | --- | --- | ----- |
| Efficient agreement            | 100 | 132 | .90    | 400 | 253 | 270 | 923   |
| Slow agreement                 | 100 | 324 | .85    | 400 | 40  | 255 | 695   |
| Fast agreement, weaker choices | 100 | 108 | .60    | 400 | 280 | 180 | 860   |
| Good choices, no agreement     | 84  | 360 | .90    | 151 | 0   | 270 | 421   |
| Expired                        | 62  | 360 | .35    | 112 | 0   | 105 | 217   |
| Cancelled                      | 0   | 0   | none   | 0   | 0   | 0   | 0     |

Also test P=99/100, cost bounds, equal/close utilities, clamped branches, disabled
choices and same q with different sampled outcomes. These replace the old risky
success arithmetic explicitly, not through unreviewed snapshot updates.

## Simulation policy definitions

No policy releases attendees or calls it early. Common tie-break: lower expected
minutes then ASCII response ID. Comparisons use exact expected values, not floats.

| Policy                         | Definition                                                                                                                                                                                                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Greedy                         | Maximum U; D=300 when it has scored choices, regardless of realized branch.                                                                                                                                                                                          |
| Optimistic (replaces Reckless) | Maximum single-branch utility of each response, ignoring probability. Common tie-break. Distinguishable from Greedy on fixture lotteries.                                                                                                                            |
| Always-timebox                 | First apply common tie-break among enabled timebox responses; otherwise Greedy.                                                                                                                                                                                      |
| Always-fastest                 | Minimum expected minutes, then maximum U, then ASCII ID.                                                                                                                                                                                                             |
| Always-park                    | Prefer park, then email, tie by common order; otherwise Always-fastest.                                                                                                                                                                                              |
| Random                         | Uniform enabled responses in authored order, unchanged ADR 0003 stream.                                                                                                                                                                                              |
| Lookahead                      | Maximize U(r) + sum over its branches p(b) * nextBest(b). nextBest=0 for ended successors; otherwise enumerate getDrawCandidates, then probability-weighted max U of enabled next responses. Never call seeded resolve/draw to predict the future. Common tie-break. |

Chance nodes include joins, clamping, callback queue and booking changes, not
only mean progress. Use engine outcomes API so sim computes policy ranking, not
game effects/scoring. Benchmark two-turn expansion before tuning. Simulation
rows replace R with nominated/agreed cuisine, branch counts and rules/content
revision; retain P/T/pm/cost/q/score/end/title, event/variant/callback coverage and
ordered replay actions. Report both expected choice quality and realized results.

## Fourth-wall commentary

Commentary belongs in authored content data and appears as a secondary line
after resolution, never an extra turn or modal. Use deterministic conditions,
fixed priority, no repeat ID per run, at least three resolutions between lines
and at most three lines per run (approved cadence). Engine-owned
selection returns content IDs/facts; UI formats authored templates. No cosmetic
selection consumes event/outcome randomness. Endings remain legible and immediate.

Initially favour nonnumeric observations tied to state: “A decision has almost
been made. Management has been notified.” near agreement; an email joke after
postponement. Do not ship “Gary has been talking for 11 minutes”: minute is meeting
time, not his speech time. A pizza/printer comparison needs a content-owned assumed
price, visible “at an assumed $X each” wording, integer rounding rule and threshold
tests. Defer these comparisons until the assumptions/copy are approved; no market
price research or new counters are necessary for the first slice.


## Results, titles and collections

Four endings remain: decision, called-early, time-expired, cancelled. Success
requires P=100 and a recorded agreedCuisine equal to nominatedCuisine. All success
summaries, epilogues and share outputs name that cuisine through authored content,
for example “Agreed: Thai”. A generic “Decision Made” alone is never sufficient.
Failure/cancellation say no agreement; a nomination may be shown separately.
Do not manufacture a chosen cuisine on an unsuccessful ending.

Show score and components, actual minutes, cost, peak headcount and the cuisine
result. No Open Risks. The factual moment is first postponed topic, else first
arrival, else an ending-specific fallback, in log order. Logs are narrative only;
all score/title predicates use authoritative counters. Epilogues depend on ending,
not a hidden risk tier. Result copy explains that choice quality measures expected
tradeoffs while agreement/cost reflect what actually happened.

Twelve active collectible slots remain. Names below are editorial working labels;
IDs/predicates are accepted. L02b reviews final copy before Harry's D18 approval.

| # | Title | Unlock condition |
| --- | --- | --- |
| 1 | Inbox Zero | Score ≥ 950 |
| 2 | Efficient Facilitator | Agreement reached, score ≥ 850 |
| 3 | Lunch Is Settled | Agreement with agreedCuisine recorded |
| 4 | Death by Diligence | Agreement reached, person-minutes ≥ 270 ($4,500 at the display rate) |
| 5 | Table for Six | Agreement with final headcount exactly six |
| 6 | Reply-All Royalty | Peak headcount reaches 8 |
| 7 | Parking Lot Attendant | 4 or more items parked in one meeting |
| 8 | Second Helping | Agreement and resolvedCallbackCount ≥ 1 |
| 9 | Played It Right, Lost Anyway | At least one scored decision, avg q ≥ 0.85, and no agreement reached |
| 10 | Let's Take This Offline | Called it early |
| 11 | Calendar Criminal | Time expired |
| 12 | This Could've Been an Email | Cancelled |


Title priority remains 12,9,10,11,1,2,3,4,5,6,7,8. Unlock every earned title;
show the first earned by that order. Preserve a defensive noncollectible heading,
but even a fallback success must include the cuisine. Slot 3 covers every valid
success. Average q is unrounded for predicates; total score is rounded components.
Slots 3/5/8 use lunch-agreed/table-for-six/second-helping respectively. All other
IDs and predicates remain. No title punishes an unlucky response outcome.

Store lunch unlocks under tcbae:v2:titles. Preserve the entire old tcbae:v1:titles
value unchanged and display recognized old awards as a separate launch collection;
none unlocks a lunch slot automatically, including the nine retained IDs. There
are no stored runs to migrate. Technical spec owns failure-safe read/write rules.

The share card remains 1200×627, always shown as an image for long-press save,
with native file share where supported, download, copy text and selectable-text
fallback. Include the actual agreed cuisine on success and never imply different
seeds have identical difficulty. Formatting and all copy remain content-authored.

## Balance targets and report semantics

**Scripted players**

| Player | How it plays | Target win rate | Target median score |
| --- | --- | --- | --- |
| Lookahead | Two-turn expectation over response branches and next events | 85–95% | 850–950 (sets the ceiling) |
| Greedy | Picks maximum expected utility | 70–85% | 750–850 |
| Optimistic | Picks maximum best-branch utility, ignoring probability | 60–80% | At least 50 below Greedy |
| Always-timebox | Timeboxes everything it can | 40–60% | At least 100 below Greedy |
| Always-fastest | Picks the response with lowest expected minutes | 30–50% | At least 100 below Greedy |
| Always-park | Parks or emails everything | Under 20% | Under 400 |
| Random | Uniform enabled responses; all attendees retained | 20–35% | Under 450 |

**Acceptance criteria**

- [ ] Always-timebox, Always-fastest and Always-park each have a median score at least 100 below Greedy; Optimistic is at least 50 below. Random is governed by its own table targets.
- [ ] Greedy wins 70–85%; Random wins 20–35%.
- [ ] Among Greedy's successful runs, score standard deviation is 120 or less (the event draw can't swing a winning score too far). Overall luck is measured by the win-rate band: the success/failure score cliff alone adds about √(p(1−p)) × the win–loss score gap to an all-runs spread, so an all-runs cap would conflict with the 70–85% win band (D20).
- [ ] Greedy’s median resolved-turn count across all runs is 9–12 (playtesting separately checks 2–3 minutes).
- [ ] Each of the 17 base event families appears in at least 5% of Random runs (all Random runs are the denominator; variants count as the same family). Separately require deterministic scenario tests for every reachable variant, invitation state, outcome branch and all three callbacks; callback delivery is 100% when its due turn is reached before the meeting ends. Report per-policy family/variant/callback coverage without imposing impossible Greedy thresholds.
- [ ] Among Greedy decisions with at least two enabled responses, no technique exceeds 40% of selections. Exclude single-choice acknowledgements; include callbacks and tied-value choices if multiple responses are enabled.
- [ ] Lookahead wins 85–95% of seeds, with median score 850–950. There is no separate 99% feasibility or win-rate requirement.
- [ ] The efficiency floor (90 person-minutes, displayed as $1,500) is within 10% of Lookahead’s fifth-percentile person-minutes among successful runs: abs(90 − p05) / p05 ≤ 0.10. Use nearest-rank percentile, sorted ascending at index ceil(0.05 × successfulCount) − 1. Calibrate `COST_FLOOR_PM` to this rule at the end of the tuning task and before each release; on other PRs the deviation is reported as a diagnostic, not enforced (D25).


Run identical fixed seed ranges for every policy. Win means ending=decision with
valid agreedCuisine; no policy calls it early. Medians include all runs and average
the middle pair when even; use population standard deviation. Win-only spread uses
only Greedy successes. Inclusive targets except strict “under”. --policy all is the
default. The seven-policy 2,000-run and release 10,000-run criteria remain unchanged;
the tech spec alone defines when they activate. Zero successful runs cannot pass
win bands or support a fifth-percentile calibration: report that metric unavailable.

The replacement of Reckless with Optimistic and its inherited target is explicitly
approved in ADR 0007. Targets are hypotheses until measured; unmet targets need
real tuning or a separately approved decision, never silent threshold relaxation.
Report response branch frequencies, actual outcomes and expected q separately.
Retain seed/action replay references and rules/content/policy revision. Old seed
replays require the old revision; seed alone is not cross-version compatibility.

## Editorial review and playtest evidence

L02 authors the entire data table. L02b is a dedicated AI adult-workplace-comedy
review, using [the review brief](lunch-writing-review.md): inspect every event,
response/outcome, callback, name, title, ending and commentary line for humour,
voice, readability and honest tradeoffs; log before/after changes and preserve
mechanical columns. Harry approves the revised table before transcription.
No sample in a planning document or AI review is human playtest evidence.

For L09, Harry plays several runs and two other people play uncoached. All three
must state “agree on a cuisine” after the two-second headline exposure, classify
one relevant preference and one tangent, and explain an uncertain choice's action
and possible downside without numbers. Retain the 15-second question separately;
record exact words, build/device/browser, approximate run count and confusing/flat
lines. Fix material confusion and retest before tuning or polished art. Observe
2–3-minute duration and replay interest. Original 12a V4 remains pending historical
evidence; Harry approved L09 as a separate new predecessor, not a retroactive pass.

The later five-person release test retains ≥4/5 stating the goal unprompted and
classifying one real preference and one tangent, plus duration/replay observations.
Add the two-second headline and uncertain-choice questions. All technical/manual
release checks remain in the technical spec; AI writing review replaces none.

## Scope and remaining decisions

One one-tap scenario, one DOM room, six initial/eight maximum adults, 17 base
families including nomination, three scheduled callbacks, one filler; four endings,
twelve lunch awards plus legacy collection; seeded pure engine and seven policies.
Keep the existing licensed human-created/CC0 art and OFL font requirements, no
AI-generated final art, page-view-only analytics and static hosting. No accounts,
backend, audio, movement, multiplayer, generated dialogue, online leaderboard,
daily/practice modes, setup menus or ordering service. No additional meters/votes.

ADRs 0005–0008 approve the changes to the D01–D26 baseline; accepted historical
ADRs are not rewritten. Exact cuisine names, final wording, full table weights and
initial effects still await L02/L02b and D18 approval; the illustrative 80/20 is
not approved tuning. No further approval is needed for the already accepted
formula/rule/criterion decisions. Task sequence/status belong to the implementation
plan. Runtime still uses launch content until L08; this document is the approved
lunch target, not a claim of shipped gameplay.
