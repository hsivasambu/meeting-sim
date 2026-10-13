# Lunch redesign — approved plan

Tasks **L00/L01** · October 13, 2026 · **Approved; planning finalized.**

Harry approved all recommended resolutions on October 13, 2026: “Accepting all recommended resolutions”. He explicitly confirmed that success must choose an actual cuisine and requested a dedicated AI review for adult workplace humour. This accepts the rule/formula and named criterion changes, not unreviewed final content or tuning. L01 finalizes documentation only; gameplay implementation follows the task sequence.

The implementation sequence and statuses are owned by [the implementation plan](implementation-plan.md#lunch-redesign--approved-sequence).
The reconciled [design](design-doc-v2.md) and [technical spec](tech-spec.md) now
define the lunch target. Runtime code still implements the launch baseline until
the scheduled L08 activation. Samples and final content weights remain subject
to L02 authorship, L02b writing review and Harry’s D18 content approval.

## Brief

**Six adults. Agree on a cuisine for lunch.** Keep the title _This Could've Been
an Email_, one room, one-tap start and a short turn-based run. The player turns
ordinary preferences into agreement while colleagues make lunch unnecessarily
difficult. Progress measures agreement, time measures discussion, and cost measures
the salaries spent discussing lunch. Nobody can be sent away.

Write for adults: dry observation, office politics, petty status games and
recognisable personalities, with occasional earned absurdity. Adult-level humour
means sophistication and timing, not a requirement for explicit jokes or swearing.
Avoid a children’s-cartoon voice and repetitive cute whimsy. The dedicated
[L02b writing review](lunch-writing-review.md) checks the entire table before
content approval and transcription.

Aim editorially for roughly 70% familiar office humour and 30% absurdity. Each
interaction must make sense without corporate or software vocabulary. Preferences
are legitimate; the joke is excessive procedure, not someone's dietary needs.
Labels describe an action; a short description explains its likely tradeoff.
Occasional uncertain outcomes make decisive suggestions interesting without
concealing the possibility of a setback. Most choices remain deterministic.

Non-goals: ordering or paying for food, restaurants/maps/prices fetched online,
individual votes or hunger meters, dietary safety simulation, multiplayer,
generated dialogue, a new stack, a second permanent game mode, polished art before
playtesting, arbitrary punishments, or a redesign of all score weights at once.
There is no guarantee that every seed can be won; every valid run can end.

Evidence: Harry reports that the text-only concept/mechanics make sense but events
are jargon-heavy and responses terse/technical. This is aggregate feedback only:
no tester identities, answers, timings, devices or completed V4 criteria were
provided. [Original V4](task-12a-playtest.md) remains pending. L09 collects new
lunch evidence; it does not retroactively pass task 12a.

## Decision and conflict register

Harry accepted every recommended resolution below on October 13, 2026, including
formula changes and the explicit acceptance replacements. Final sample copy and
probabilities still require content review.
This is a change audit, not a replacement for ADR 0001's D01–D26 register.

| Change                       | Existing decision/contract affected                                                                                         | Accepted resolution and material alternative                                                                                                                                                                                                                                                     | Approval                                       |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| Lunch objective              | Design fixed Friday scenario, 15-second goal, D18 approved table                                                            | Record a nominated cuisine and explicit agreement at P=100; first event nominates it. Two-second objective headline, retain timed 15-second comprehension measurement too. Alternative: anonymous agreement meter is simpler but never answers what lunch is.                                    | ADR 0005; new D18 content review               |
| No release                   | D01 two-person minimum; D07 releases; D13 public API; D14 state/types; D17 action list; accepted ADR 0004 release preview   | Remove release API/action/controls/history and release-only variants/tests; attendance 6–8, permanent joins. Preserve ADR 0004 loading contract. Alternative: hide release but keep it callable leaves an unsupported rule.                                                                      | ADR 0005                                       |
| No Open Risks                | Design state/effects/conditions, Outcome and utility, risk epilogues, D08/D09, locked state and ENGINE_LIMITS from ADR 0003 | Remove the entire mechanic, including conditions, constants, preview fields, HUD, stage reactions, sim columns and risk titles. Keep callback queue and parkedCount as separate concepts. Alternative: keep hidden risk is unexplained punishment; keep unscored risk is unnecessary complexity. | ADRs 0005/0007/0008; explicit formula approval |
| Uncertain responses          | Design fixed effects/no response dice; D05/D14/D24 supporting schema; exact utility contract                                | At most two authored weighted outcomes on selected responses, using a separate seeded stream; exact expected utility before the draw. No conditional effectCases, mutable RNG or arbitrary penalties.                                                                                            | ADRs 0006/0007                                 |
| No numerical choice previews | Design fixed-effect choice UI; plan 12b acceptance; ResponsePreview                                                         | Keep engine evaluation for rules/sim; show action + qualitative description, never effect deltas/probabilities/utilities on buttons, tooltips or accessibility labels. HUD retains progress/cost/time. Alternative: numeric odds only still conflicts with the requested presentation direction. | ADRs 0006/0008                                 |
| More descriptive writing     | D18 table transcription, labels ≤24, lines ≤90                                                                              | Retain existing limits and add description ≤90 Unicode code points; outcomes remain ≤90. Review full substituted strings. No automatic relaxation of mobile limits.                                                                                                                              | ADR 0008 and content review                    |
| Real cuisine recorded        | No cuisine field or nomination draw rule; D06 first-two distribution                                                        | Force a substantive nomination at draw 0, one of 17 base families; draw 1 remains common substantive. Nomination does not mean success. No extra setup screen. Alternative: random initial cuisine reduces agency; switching cuisines adds unnecessary state.                                    | ADR 0005                                       |
| More ways to arrive          | D01 eight named people; D05/D07; only legal/vp-joins, all paths join; table's expert benefits                               | Keep eight stable internal attendee IDs, reauthor names/roles, retain a spontaneous arrival family and allow invitations in approved response paths. Each potential entrant absent-guarded; no duplicate joins.                                                                                  | ADR 0005; review new relationship table        |
| Callbacks without risks      | D06 three exact parent IDs and n+2 schedule, D15 counters                                                                   | Keep three authored parent/target pairs, unique targets, no chains, n+2 precedence, common/no conditions. Replace launch parents with lunch issues. Settled or postponed issues may return only when copy signals this.                                                                          | ADR 0005; content review                       |
| Scoring and fairness         | D08 utility; D20 Decisions=300 for Greedy; six score examples; slow thorough > fast reckless goal                           | Keep 400/300/300 structure and partial-progress scaling, remove risk terms; expected utility drives q. Withdraw universal slow-over-fast assertion: speed with real agreement is good. Measure quality before luck, actual Outcome/Efficiency after luck.                                        | ADR 0007; Harry's formula approval             |
| Seven sim policies           | Release policies and Reckless ignore-risk formula now collapse into Greedy                                                  | Replace Reckless with Optimistic (best branch utility); all policies keep attendees. Lookahead enumerates response branches then next event probabilities without seeds. Keep other targets initially.                                                                                           | ADR 0007; explicit criterion substitution      |
| Titles and unlocks           | D09 twelve slots/priority; risk/release predicates; v1 key and TitleId                                                      | Retire three incompatible titles; nine retain semantics. Keep old awards as a separate legacy collection; new 12-slot lunch collection uses a v2 key, no free remapping.                                                                                                                         | ADR 0008                                       |
| Commentary                   | D15 narrative log, authored copy, no speech-duration counter                                                                | Deterministic predicate/priority selection with cooldown and per-run deduplication; factual claims use exact state or disclosed comparison assumptions. No fictional elapsed speech metrics.                                                                                                     | ADR 0008                                       |
| Acceptance changes           | D03 absence coverage; D06 proof; D09 risk epilogues; D19 V4; D21 goldens; 12b release/preview E2E                           | Named replacement matrix below; retain strengths of active gates and original evidence. L09 is approved as the new prerequisite for tuning while original 12a stays pending.                                                                                                                     | ADRs 0005–0008; L01 process approval           |

Preserved: D02 target, D04 imports, D10/D25 gate discipline, D11 stack/dependency
allowlist, D12 hosting, D13 injection principle, D15 authoritative counters,
D16 DOM stage, D18 review-first content, D20 spread denominator, D21 fixture
isolation, D22 document ownership, D23 workspace, D24 internal value/formatCost,
D26 accessibility/sharing. ADR 0002's Android deferral remains outstanding for
release. ADR 0003's Random policy stream and ADR 0004's asset lifecycle remain.
Only the explicit contract departures listed here are approved.

## Concrete gameplay model

### Cuisine, agreement and endings

The nomination event offers three reviewed cuisine names (draft: Italian,
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

### Scoring and policy consequences

[ADR 0007](adr/0007-lunch-score-and-policies.md) records the approved formulas.
Progress determines completion/partial credit. Cost efficiency uses actual
person-minutes; time enters through billing, utility and the deadline. There is
no separate fourth time score or risk replacement. Keep display dollars outside
the formula and the 1,000-point ceiling.

Decision quality compares expected utility at the decision state. A sensible
choice can roll badly without receiving worse q. Conversely, a lucky poor choice
does not earn retrospective decision credit. “Played It Right, Lost Anyway” stays
reachable. Result copy explains that Choices rewards the expected tradeoff while
agreement and cost reflect actual outcomes; do not call a specific low roll a
player mistake or disclose a fake probability after the fact.

Costs rise when optional adults can no longer be dismissed. The 90-person-minute
floor is therefore a hypothesis; retain the ≤10% calibration rule and calibrate
at tuning, with before/after reports. Removing risk penalties may raise successful
scores; response uncertainty may increase win-only spread and alter policy gaps.
Measure these separately. Do not promise present win bands are feasible. If tuning
cannot meet them, propose a reasoned target change before acceptance, not a quiet
threshold edit. Report observed branch frequencies as diagnostics, with fixtures
for both branches rather than flaky statistical unit assertions.

### Titles, storage and commentary

[ADR 0008](adr/0008-lunch-presentation-and-unlocks.md) contains the exact approved
12-slot catalog and migration. Do not overwrite the old key or reinterpret an
old release achievement as a lunch achievement. Storage remains unlocks only;
there are no stored runs to migrate. The old branch/revision preserves historical
seed replay; the lunch engine does not pretend to replay old release actions.

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

## Explicitly approved acceptance replacements

No gate disappears. Technical spec remains the only gate schedule. At this checkout
types/lint, coverage/unit/property/golden/content, simulation invariants, build/size
and shell/probe/meeting-loop E2E are active. Only Greedy and Random exist today;
seven-policy balance is later, not a current seven-policy pass. The historical
12a report shows unmet diagnostic win bands; this planning task reran no gameplay
checks and makes no current pass claim.

| Obsolete criterion                                                    | Proposed replacement and evidence                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Release owner/minimum/refusal; release after dialogue; 2–8 attendance | No release API/action/controls; attendance 6–8 and never decreases; invitation before/after arrival, duplicate/maximum rejection; immutable pending presentation and disabled invitation refreshed by engine.                                                                                                        |
| R range/effects/utility, risk-tier epilogues, risky-success example   | No risk field/effect/condition/UI/sim/title references in live lunch paths; exact new score examples and expected-value fixtures; branch-specific outcome lines plus success/failure epilogues. Historical docs are not deleted.                                                                                     |
| All 13 release-absence variants and expert-loss routes                | Constructed coverage for every new reachable cuisine/presence/minute variant, every invitation state and both uncertain branches, plus all three callbacks. Generic absent conditions remain for not-yet-arrived people.                                                                                             |
| Two unrestricted substantive families with absence variants           | Forced substantive nomination plus at least two unrestricted common substantive lunch families for the second draw; all six starters retained. Broken first-two pool remains a content error.                                                                                                                        |
| Exactly launch arrival/parent metadata; fixed response effects        | Approved lunch relationship matrix; every branch validated, positive bounded weights, no repeated joins/targets/chains, always-enabled fallback, exact seeded vectors.                                                                                                                                               |
| Zero minutes allowed only for email                                   | Every lunch branch 1–10 minutes; retain exhausted-pool +2 filler and ≤50-resolution proof.                                                                                                                                                                                                                           |
| Numerical response previews in task 12b                               | Authored action + qualitative description; no numerical effect/odds/utility leakage including accessible names; overall P/cost/time still visible and correct. Touch, focus and keyboard assertions retained.                                                                                                        |
| Release then Call it E2E                                              | Resolve, admit a new adult through an invitation, then Call it; cancellation tested separately. Check unchanged beat/input guards and persisted unlock behavior.                                                                                                                                                     |
| Six v1 score examples; risky-success and callback-absence goldens     | Explain changed fixtures in engine-rule PR; retain cancellation, success, timeout, callback and early-ending coverage; add two seeded branch replays and invitation/cuisine cases. Preserve old goldens in Git history, do not run an obsolete production engine just to keep them green. No mass snapshot blessing. |
| Reckless risk-free utility and its gap                                | Rename policy Optimistic; maximize best-case branch utility, evaluate over identical seeds; retain its old 60–80% win band and ≥50-point deficit as the approved criterion substitution. All other numbers remain.                                                                                                   |
| Original 12a V4 prerequisite for tuning                               | Preserve pending 12a; L09 is the approved separate lunch predecessor. The original V4 is not complete or retroactively replaced with lunch evidence.                                                                                                                                                                 |
| Five-person release classification wording                            | Same ≥4/5 bar: state lunch goal unprompted and classify one real preference issue and one irrelevant tangent correctly; retain 15-second observation, run duration and replay observations. Add two-second headline comprehension observation and uncertain-choice tradeoff questions.                               |

Keep: core coverage ≥90% lines/85% branches, no crashes/illegal states/nondeterminism,
score integers 0–1,000, success Outcome > any failure Outcome, money rate independence,
frozen-input immutability, no duplicate resolution, exactly three browser profiles,
320 px layout/44 px controls, ≤120 KB gzip JS/≤400 KB assets, all existing unaffected
probe/accessibility checks. Keep D03 ≥5% Random family coverage, callbacks delivered
100% when due is reached, D20 Greedy successful-score SD ≤120, median 9–12 turns,
technique share ≤40%, all remaining policy bands/score gaps and D25 calibration.
No blanket permission to lower any of these is requested.

Approved L09 exit bar: all three participants can state “agree on a cuisine”
after viewing the headline for two seconds, and can name one relevant preference
and one tangent after playing. Retain the original 15-second question as a
separate observation. Each must explain the intended action and possible downside
of at least one uncertain choice without seeing numbers. Record flat/unfunny
lines as editorial issues; fix material confusion and retest it before accepting
L09. These are approved future criteria, not findings about the original testers.
The five-person release test remains a separate later requirement.

## Document ownership and remaining content work

Completed in L01:

- ADRs 0005–0008 record Harry's acceptance and scope; accepted historical ADRs
  0001–0004 remain unchanged.
- Design now owns the approved lunch premise, cuisine agreement, permanent
  attendance, outcomes, scores/examples, title predicates and policy targets.
- Technical spec now owns target state/API/RNG, validation, presentation,
  archival storage and gate mapping; stack/architecture and numeric gate
  thresholds remain unchanged. Temporary launch compatibility ends at L08.
- CLAUDE.md and its technical-spec mirror point to the approved contracts and
  L02b review. The implementation plan records L01 complete and L02 next.
- Original V4 and launch table remain clearly identified historical evidence /
  current runtime transcription source, not approved lunch content.

Remaining work is scheduled, not a reason to reopen accepted resolutions:

- L02 authors all 17 families, three callbacks, filler, cuisine names, variants,
  branch IDs/weights/effects, arrival/booking/callback relationships, titles,
  epilogues, disabled reasons and commentary in the content table. Preserve the
  launch source in Git history when replacing it. Create the lunch playtest record.
- L02b gives an AI the dedicated adult workplace writing review, with complete
  coverage and old/new wording reasons. Harry approves the revised full table
  before L05/L06/L07 consume it. Exact samples/weights remain unapproved today.
- L05/L08 validate/transcribe/activate the approved data; L10/L11 document lunch
  CSV/replay/policy revisions and distinguish historical launch metrics.
- L09 records real observations and fixes; it never invents old tester reports.
- L13/L14 complete cuisine-aware results/share/stage copy and layout, licenses,
  device checks and export evidence. Keep the original nonobsolete obligations.

## Draft tone samples — require review

These demonstrate writing, not approved table rows, probabilities or tuned effects.
Labels and descriptions are separate content fields. “Intended tradeoff” is for
reviewers, never a numeric player preview. All complete rows/weights come in L02.

**Nomination — Priya:** “Six adults. One lunch. Which cuisine should we try to agree on?”

| Label           | Description                                                                    | Outcome line                                                           | Intended tradeoff                                                 |
| --------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Suggest Italian | Put Italian on the table. The table immediately requests a meeting.            | Italian is the suggestion. Agreement has not yet entered the building. | Same modest deterministic progress/time as the other nominations. |
| Suggest Mexican | Try Mexican. Give everyone something specific to have an opinion about.        | Mexican is on the board. Gary asks who approved the board.             | Mechanically equal nomination.                                    |
| Suggest Thai    | Suggest Thai. We can discuss lunch instead of discussing how to discuss lunch. | Thai is nominated. The word nominated has made this feel official.     | Mechanically equal nomination.                                    |

**A real preference — Sam:** “Can we pick somewhere with a vegetarian meal that isn't a side salad?”

| Label                | Description                                                                       | Outcome line                                                             | Intended tradeoff                                                                             |
| -------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Check the menu       | Take a moment to find a proper meal for everyone. Nobody should lunch on garnish. | A real meal exists. The lettuce is relieved of its leadership duties.    | More time, reliable substantial agreement progress.                                           |
| Ask the menu expert  | Bring Alex in to help. One more opinion, but at least this one has read the menu. | Alex joins with a menu. The meeting finally contains relevant paperwork. | Invite a remaining entrant, useful progress, higher future cost; disabled if already present. |
| Ask after lunch talk | Move on for now. Sam will bring this back before anyone agrees.                   | Sam writes it down. This question has booked a return visit.             | Small immediate time, little progress, scheduled callback; no hidden risk.                    |

**Decisive suggestion — Morgan:** “We have a cuisine. Shall we try actually agreeing to it?”

| Label                 | Description                                                          | Possible outcome lines                                                                                                              | Intended tradeoff                                                                                  |
| --------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Try a quick agreement | Try for a quick yes. Someone may request a second round of opinions. | “Several heads nod. Gary checks whether nodding is binding.” / “Gary requests more opinions. The original opinions look exhausted.” | Usually useful progress; other branch takes longer and makes less progress. Exact weights pending. |
| Hear each concern     | Give everyone a turn. Slower, but fewer surprises.                   | Everyone gets a turn. Even the person whose concern was having a turn.                                                              | Deterministic time/progress alternative.                                                           |

**Tangent — Gary:** “Before lunch, should we agree whether soup is a beverage?”

| Label               | Description                                                                | Outcome line                                                    | Intended tradeoff                        |
| ------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------- |
| Give soup the floor | Hear Gary out. This may take longer than eating the soup.                  | Gary presents both sides. The spoon has declined to comment.    | Lots of time, little agreement progress. |
| Return to lunch     | Remind Gary we're choosing a cuisine. Soup can resolve its identity later. | The soup question is set aside. Lunch is briefly visible again. | Short, reliable refocus.                 |
| Revisit soup later  | Promise one last soup discussion. Gary will remember that promise.         | Gary writes “SOUP” on a note. The note looks patient.           | Quick now, one scheduled callback later. |

**Callback — Gary:** “The soup question is back. It has brought no new information.”
Response: **Close the soup debate** — “Acknowledge the mystery and return to lunch.”
Outcome: “Soup remains mysterious. The meeting is allowed to continue.”
This callback never schedules another callback. The example's recurrence exists
independently of any risk counter.

## Next task and implementation boundary

**L02 → L02b → final D18 approval.** The [complete L02 draft](content-table.md)
is authored; current status is owned by the implementation plan. L01 recorded
Harry’s approval and reconciled the normative rules. Next run **L02b: adult workplace
comedy and writing review**, using the [review brief](lunch-writing-review.md),
before Harry approves the final table for L05/L06/L07. The first engine code
chunk is L03; it remains an additive fixture-tested capability before L08.

No repeat rule/formula approval is needed for the accepted resolutions. New rule
changes, new tuning/content not yet reviewed, or lowered thresholds still use the
existing change-control process. This task stops after finalizing documentation;
no gameplay, runtime content, CI, dependencies or deployment has changed.
