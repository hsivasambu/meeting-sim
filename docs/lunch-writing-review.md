# L02b — Adult workplace comedy and writing review

Status: **Performed on October 13; L02b and D18 approved by Harry on October 14, 2026.**
See the [full review report](lunch-writing-review-report.md) and revised table
`lunch-l02b-reviewed-2`. The remaining text preserves the review brief.
Depends on the complete L02 draft content table. This brief defines the editorial
task for an AI reviewer; Harry's L02b instruction started the completed pass.
Task order and completion status live in [the implementation plan](implementation-plan.md).

## Purpose and voice

Make the game funny for adults who have sat through a pointless meeting, including
people who have never worked in software or project management. Use recognisable
status games, passive aggression, misplaced confidence, territorial behaviour,
performative helpfulness, petty compromises and weary self-awareness. Let people
sound like different adults with competing habits, not interchangeable joke dispensers.

The humour can be dry, sharp, sarcastic and mildly cynical. Adult-level means
observational sophistication and comic timing; it does not require sexual jokes,
profanity or shock. Avoid a children's-cartoon voice, constant cute objects talking,
generic motivational banter, and jargon standing in for a punchline. Absurdity
works best when a familiar office situation earns the escalation. Treat roughly
70% relatable office humour / 30% absurdity as direction, not a count or quota.

Preferences and dietary needs are real constraints; the comedy comes from how
unnecessarily difficult these adults make choosing lunch. Every interaction needs
a recognisable comic intention, but not every sentence needs a punchline. A clear
setup or straight response can make the next line funnier. Outcome text must also
explain what happened. Clarity and honest tradeoff cues take precedence over a gag.

## Inputs and scope

Read CLAUDE.md, the approved design/technical spec, implementation plan, ADRs
0005–0008 and the entire L02 draft in `docs/content-table.md`. Review opening lines,
choice labels/descriptions, every deterministic and uncertain outcome, callbacks,
filler, names/roles, disabled reasons, nomination/cuisine references, endings,
titles, results/share copy and fourth-wall commentary. Include the sample copy
from the redesign package as draft material, not a standard to preserve.

Edit authored documentation only. Do not change effects, probabilities, techniques,
conditions, IDs, arrival/callback relationships, title predicates, score formulas,
copy-length limits or implementation code. If an honest, funny description cannot
fit a mechanic, file a separate design issue with an example; do not secretly
change the mechanic to make the sentence work.

## Review method and deliverables

1. Read the full table once for voice, character differences, pacing and repeated
   joke structures. Identify a short voice guide for each attendee.
2. Review every event and response set by ID. Mark unclear action/tradeoff cues,
   weak jokes, jargon, childish phrasing, repetition and misleading branch promises.
   Note lines worth keeping as well as edits.
3. Suggest or apply a focused rewrite in the draft table. Log old/new text and
   the editorial reason in `docs/lunch-writing-review-report.md` (created by L02b).
   Distinguish a weak gag from a comprehension or factual correctness blocker.
4. Read constructed full-run sequences, including a callback, an arrival, both
   uncertain outcomes, success and failure. Check escalation and breathing room;
   do not turn every line into the same “committee for the committee” joke.
5. Audit cuisine text. A successful ending, result summary and later share text
   must name the actual agreed cuisine, using the authored placeholder. A generic
   “Decision Made” heading alone does not satisfy the success contract. A failed
   run must not describe its nomination as an agreement.
6. Check all existing length limits by Unicode code points, including substituted
   cuisine/attendee names. Review whether a new player can predict the kind of
   downside from an uncertain choice without numeric previews.
7. Deliver the revised table, complete coverage checklist, character/voice notes,
   change log and unresolved issues to Harry for final D18 content approval.

## Exit criteria and evidence

- Every authored event/response/copy group has a reviewed entry; no sample-only pass.
- No unexplained PM/software vocabulary; each interaction has a clear comic purpose.
- Labels describe actions and descriptions convey likely tradeoffs. Both uncertain
  branches are plausible consequences of the wording, not arbitrary punishment.
- Voices suit adults in an office. Humour is specific, varied and readable aloud;
  flat lines/repeated punchlines have been revised or explicitly justified.
- All success surfaces name the chosen cuisine; factual commentary matches state
  or documented comparison assumptions. No invented speech-time claims.
- Mechanical table columns are unchanged by the writing pass; proposed design
  issues are tracked separately. Character limits, links and document checks pass.
- Report identifies the exact reviewed revision, reviewer/model if known, coverage,
  findings, revisions and unresolved issues. Do not fabricate reader reactions.
- Harry approves the revised complete table before L05/L06/L07 consume it.

An AI writing review is an editorial gate, not evidence that humans found the game
funny or understandable. The uncoached L09 playtest and later five-person test
remain mandatory. Later material copy revisions repeat this review for affected
rows and return to content approval; previously reviewed text is not a blanket pass.

## Ready-to-use reviewer request

> Start task L02b. Follow CLAUDE.md and docs/lunch-writing-review.md. Review the
> entire L02 lunch content table as an adult workplace comedy editor. Focus on
> humour, distinct character voices, clear actions and honest tradeoff descriptions.
> Use dry, recognisable office satire with occasional earned absurdity; avoid
> childish whimsy and jargon-dependent jokes. Preserve all mechanics and limits.
> Revise the draft table, produce the full review report and coverage/change log,
> and flag design issues separately. Ensure every success names the actual agreed
> cuisine. Stop at the editorial task boundary for Harry's content review.
