# ADR 0008: Lunch presentation and versioned title collections

Status: **Accepted by Harry on October 13, 2026.** Task L01.

Harry approved all recommended resolutions on October 13, 2026: “Accepting all recommended resolutions”. He explicitly confirmed that success must choose an actual cuisine and requested a dedicated AI review for adult workplace humour. This accepts the rule/formula and named criterion changes, not unreviewed final content or tuning. L01 finalizes documentation only; gameplay implementation follows the task sequence.
Affects D09/D14/D17/D18, presentation acceptance and persistence contract.

## Accepted presentation decision

Keep the progress/cost/time HUD and roster. Remove risk displays, release
controls, numeric choice deltas/odds/utilities and related accessibility text.
Response buttons use an authored label ≤24 code points plus description ≤90;
opening/outcome/moment/epilogue lines stay ≤90, role ≤48, title ≤28. Keep 1–3
responses, explicit acknowledgement, beat/input guards, keyboard/touch support,
focus, live regions and reduced motion. A new description field is not permission
to expand the old limits. Review all rendered/substituted strings at 320 px.

All wording, cuisine names, disabled reasons, result explanations and commentary
templates live in content. UI formats approved placeholders only. Engine selects
epilogue/qualifying commentary IDs from authoritative state. Commentary uses
stable priority, per-run shownCommentaryIds and lastCommentaryTurn, minimum three
resolved turns between emissions, maximum three per run; first eligible emission
can follow the third resolution. Same evaluator applies to real/hypothetical
outcomes. It never changes utility, effects or RNG, and never adds a turn.
No timers enter core/store. Factual predicates/templates are validated, including
longest substitutions. Numerical purchase comparisons are deferred until their
assumed prices, rounding and disclosure text receive content review.

Remove risk-tier epilogues and release moments. Use agreement/call-it/expiry/cancel
epilogues with cuisine on success. Moment priority becomes first postponed topic,
then first arrival, then ending fallback, using the narrative log only for this
narrative feature. Keep twelve active title slots and old relative priority slots.
RoomView drops leave and risk/parking-board-specific pulse; reactionsFor maps
joins to enter, progress to nod/sigh, agreement to celebration. Any postponement
visual must be explicitly authored in the later stage task, not an unexplained
Open Risks board.

## Accepted active title mapping

Retain the IDs and predicates of slots 1,2,4,6,7,9,10,11,12; reauthor player copy
where needed, including “Topics postponed” for parked items. Score constants and
thresholds are unchanged pending ordinary approved tuning. Slot replacements:

| Slot | Retired ID       | Proposed new ID / draft name    | Predicate                                    |
| ---- | ---------------- | ------------------------------- | -------------------------------------------- |
| 3    | ship-it-and-pray | lunch-agreed / Lunch Is Settled | ending decision with agreedCuisine recorded  |
| 5    | skeleton-crew    | table-for-six / Table for Six   | agreement with final headcount exactly six   |
| 8    | gary-free-zone   | second-helping / Second Helping | agreement and at least one resolved callback |

Add authoritative resolvedCallbackCount, increment once on callback resolution;
never infer its predicate from narrative logs. These predicates are approved product choices requiring deterministic
reachability cases, not claims of balanced rarity. Slots remain ordered 12,9,10,11,1,2,3,4,5,6,7,8. Since
slot 3 covers any success, fallback “Decision Made” is retained as defensive copy
but is normally unreachable on a valid successful lunch run. Prefer explicit
agreement copy there during content review. No title rewards an unlucky roll.

## Accepted persistence decision

Use `tcbae:v2:titles` for the twelve lunch IDs. Preserve `tcbae:v1:titles` unchanged
as the launch collection. Read both independently with their own catalogs; render
known v1 unlocks under an authored “Launch meeting collection” label outside the
twelve active lunch slots. V1 titles never count toward lunch completion, including
the nine with retained predicates, because scores/rules changed. Never copy old
release/risk awards onto new IDs. This is lossless archival, not a title reset.

No automatic writes to v1, no deletion of unknown legacy data, no dual earning and
no new stored game state. Parse/deduplicate recognized entries for display while
leaving raw v1 bytes untouched. A failed v1 read does not block readable v2 use;
a failed v2 acquisition/read suppresses v2 writes for that store instance, keeping
new unlocks in memory. Corrupt/missing v2 may be replaced as under the current
contract. A failed write never prevents play. Migration is repeatable and needs
no success marker because no copy/delete transaction occurs.

This explicitly departs from the one-key v1 contract while preserving the locked
localStorage/unlocks-only architecture. Alternative: map nine old awards into
lunch for continuity, but that falsely implies they were earned under new rules.
Discarding old unlocks loses player work; retaining twelve obsolete active slots
leaves impossible achievements. No cross-tab synchronization is added.

## Acceptance

L06 covers old-only/new-only/both keys, duplicates/unknown IDs, malformed data,
independent read failures, blocked storage, failed writes, repeated starts and
byte-for-byte preservation of v1. L08/L13 cover reload, legacy rendering separate
from twelve active slots, all title boundaries, authored copy and share image
fit. L09 captures comprehension/uncertainty feedback; L13 retains final export,
device and accessibility gates. Samples and numerical commentary assumptions
still require D18 review. Accepted ADRs remain historical and unchanged.
