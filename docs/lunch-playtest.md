# L09 — early lunch playtest record

**Protocol prepared by L02; evidence pending. No lunch playtest has been run.**
L09 depends on the playable L08 lunch cutover, the L02b editorial review and
Harry's D18 content approval. This document is the approved L09 protocol and
blank record, not acceptance of L09 or original 12a.

Authority: [design → Editorial review and playtest evidence](design-doc-v2.md#editorial-review-and-playtest-evidence),
[approved L09 bar](lunch-redesign-plan.md#explicitly-approved-acceptance-replacements),
[implementation sequence](implementation-plan.md#lunch-redesign--approved-sequence),
[technical gates](tech-spec.md#testing-and-quality-gates).
Original [task 12a V4](task-12a-playtest.md) remains pending historical evidence.
The later five-person release test is separate; AI editorial review replaces neither.

## Approved protocol

Harry plays several runs; two other people play uncoached. Use the same identified
lunch build, while recording device/browser differences. Do not explain the goal,
identify good choices or show mechanical tables/numerical choice previews.
Only player-facing qualitative descriptions and normal HUD facts are available.
Record any assistance or prior exposure; do not quietly call coached results uncoached.

1. Show the headline for two seconds, then hide it. Ask, “What are you trying to
   do?” Record the exact answer. All three must state the goal of agreeing on a
   cuisine for lunch. Accept ordinary equivalent phrasing; do not feed them the words.
2. Start play and retain the original 15-second goal question as a separate timed
   observation: “What is the goal here?” Record exposure, actual question time and
   exact words. Note that the earlier headline probe may have primed this answer;
   do not treat it as an independent first-exposure measurement or combine the two.
3. Let the person play without advice. Record run count, wall-clock duration from
   Start to Results, ending, actual agreed cuisine on success, nomination separately
   on failure, seed/actions if available and any interruption. Reading time is part
   of wall-clock duration, never a change to simulated discussion time. Observe
   whether ordinary uninterrupted runs take roughly 2–3 minutes; report real values.
4. When an uncertain choice appears, before its outcome ask, “What would this
   action do, and what could go wrong?” Record the response ID, exact answer and
   any coaching. Each person must explain the intended action and a possible
   downside of at least one uncertain choice without numerical previews. Do not
   teach the tradeoff after seeing the branch and count that as prior comprehension.
   If their natural run offers none, mark that evidence missing and arrange another
   uncoached run; do not manufacture a pass. Both actual branches are useful evidence,
   but L09 does not require a lucky seed to display both to every tester.
   In particular, for menu-needs/invite record whether “an unclear menu note” is
   understood to mean a longer discussion as well as higher cost after Alex joins.
5. After playing ask, “Name one issue that mattered to choosing lunch, and one
   detour that did not.” Record examples and exact words. All three must correctly
   identify one real preference and one irrelevant tangent. Dietary needs are valid
   preference examples; do not mark a preference irrelevant because it slows play.
6. Ask which lines were confusing, funny, flat or repetitive, and whether they
   wanted another run. Capture wording/row IDs and exact reactions, including
   silence or no remembered line. Humour observations are editorial evidence,
   not a new numerical pass threshold. Record replay interest without prompting praise.
7. Log material confusion as a follow-up, fix it through the proper content/UI
   task and approval path, and retest the affected comprehension before accepting
   L09. Record both original failure and retest; never overwrite an inconvenient result.

All-three goal/classification/uncertain-tradeoff comprehension is the approved exit
bar. Duration, replay interest and funny/flat lines are required observations.
Missing observations stay pending. Original V4 is not retroactively completed;
tuning and polished art wait for L09's accepted evidence. No fresh approval of
ADRs 0005–0008 is required to conduct this approved protocol.

## Build and session metadata — fill when observed

| Field                                        | Evidence |
| -------------------------------------------- | -------- |
| Playtest date / local timezone               |          |
| Facilitator / observer                       |          |
| Build URL                                    |          |
| Git revision / rules revision                |          |
| Content revision / D18 approval reference    |          |
| L08 completion / playable build confirmation |          |
| L02b report reference                        |          |
| Device / browser matrix                      |          |
| Seed / ordered action capture method         |          |
| Timing method                                |          |
| Known defects / interruptions                |          |

## Participant acceptance ledger — no findings yet

Use participant labels instead of inventing names. Blank means no evidence.
At execution record pass/fail/pending with a quotation or linked run record.

| Participant        | Prior exposure / coaching | Runs | Two-second goal | 15-second goal observation | Relevant preference / tangent | Uncertain action / downside | Duration / replay | Follow-up / retest | Acceptance |
| ------------------ | ------------------------- | ---- | --------------- | -------------------------- | ----------------------------- | --------------------------- | ----------------- | ------------------ | ---------- |
| Harry              |                           |      |                 |                            |                               |                             |                   |                    |            |
| Uncoached person A |                           |      |                 |                            |                               |                             |                   |                    |            |
| Uncoached person B |                           |      |                 |                            |                               |                             |                   |                    |            |

## Participant interview form — duplicate per person

| Field                                             | Evidence |
| ------------------------------------------------- | -------- |
| Participant label / date                          |          |
| Device / OS / browser / version                   |          |
| Prior exposure / help given                       |          |
| Headline shown / hidden time                      |          |
| Two-second probe: exact answer                    |          |
| Goal comprehension assessment / reason            |          |
| Start time / 15-second question time              |          |
| 15-second probe: exact answer                     |          |
| Relevant preference: exact words / event          |          |
| Tangent: exact words / event                      |          |
| Uncertain event / response / description seen     |          |
| Pre-outcome action prediction: exact words        |          |
| Pre-outcome downside prediction: exact words      |          |
| Actual outcome branch / reaction                  |          |
| Confusing lines: row IDs / exact wording          |          |
| Funny lines: row IDs / exact reaction             |          |
| Flat / repetitive lines: row IDs / exact reaction |          |
| Replay interest: exact words / observed replay    |          |
| Facilitator comments, distinct from quotations    |          |
| Missing evidence / follow-up needed               |          |

## Per-run record — duplicate for every observed run

| Field                                                | Evidence |
| ---------------------------------------------------- | -------- |
| Participant / run number                             |          |
| Build / content revision                             |          |
| Seed / ordered actions if available                  |          |
| Start / Results wall-clock times                     |          |
| Duration / interruptions                             |          |
| Engine minutes / person-minutes / score if available |          |
| Ending                                               |          |
| Nominated cuisine                                    |          |
| Actual agreed cuisine, success only                  |          |
| Failure displayed no agreement? / exact result text  |          |
| Arrival / invitation / callback observations         |          |
| Uncertain choice and sampled branch                  |          |
| Confusion / assistance / row references              |          |
| Funny / flat lines and exact reactions               |          |
| Replay observed / requested                          |          |

## Follow-ups and retests — blank until evidence exists

| Issue ID | Source participant/run | Exact observation / affected row | Material confusion? | Fix task / revision / approval | Retest participant/build | Exact retest result | Disposition |
| -------- | ---------------------- | -------------------------------- | ------------------- | ------------------------------ | ------------------------ | ------------------- | ----------- |
|          |                        |                                  |                     |                                |                          |                     |             |

## L09 acceptance — not assessed

| Criterion                                                          | Evidence / outstanding requirement |
| ------------------------------------------------------------------ | ---------------------------------- |
| Harry several runs + two uncoached participants                    |                                    |
| All three two-second goal answers correct                          |                                    |
| Separate 15-second observation retained for all three              |                                    |
| All three identify preference and tangent correctly                |                                    |
| All three predict an uncertain action and downside without numbers |                                    |
| Wall-clock duration and replay interest observed                   |                                    |
| Funny/flat/confusing lines recorded and handed back                |                                    |
| Material confusion fixed and retested                              |                                    |
| Missing reports remain explicitly pending                          |                                    |
| Acceptance decision / date / authority                             |                                    |
| Resulting content/UI follow-ups / next task                        |                                    |

Prepared forms do not satisfy any evidence field. Do not infer a participant's
answer from a run ending, score, AI review or aggregate comment. Final L09
acceptance belongs in this record and the implementation plan after observation.
