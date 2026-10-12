# Task 04 review: state transitions and shared evaluator

Repo: `C:\dev\meeting-sim`, branch `feat/task-04-transitions` at `4be55fc`
([PR #4](https://github.com/hsivasambu/meeting-sim/pull/4), open, not draft, no reviews yet).
Range reviewed: `e6773a1..4be55fc` (7 commits, 18 files, +1233/−5).
Sources checked: implementation-plan.md task 04 row (line 34) and result section (503–586),
tech-spec.md Engine contracts / Turn order and endings / Content-evaluation contract / gates,
design-doc-v2.md Game state model (lines 72–95), Draw rules (140–143), Decisions (182–188),
task-04-transitions.md, ADR 0001. Review was read-only; nothing in the repo was edited.

## Verdict

**Fix finding 1 before merge; the rest can follow.** The transition rules are a close match to
the spec: pre-join full-duration billing, decision-before-expiry, room-booked deadline paths,
n+2 callback scheduling with chain/repeat/collision guards, owner and two-person release
refusals, no re-entry, and frozen-input purity all behave as written. One real defect: decision
quality treats mathematically tied responses as different because utility is compared with
exact floating-point equality, so tied choices get scored 0 or 1 instead of being unscored.

## Gate results

| Gate                                                       | Local (Node 22.18.0, pnpm 10.34.6)                                              | CI (Node 24)                         |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------ |
| `pnpm check` (typecheck, lint + prettier, test + coverage) | Pass. 108/108 tests in 12 files. `src/core/engine` 99.42% lines / 100% branches | Pass                                 |
| `pnpm e2e`                                                 | Pass. 18/18 on Pixel 7, iPhone 14, desktop Chromium                             | Pass                                 |
| Head commit `4be55fc`                                      | —                                                                               | `quality` pass; Vercel preview ready |

Local runs printed `Unsupported engine: wanted node >=24 <25`; CI on Node 24 is the
authoritative pass. Results match the plan's evidence (108 tests, 188/189 core lines, 141/141
branches). The working tree was clean before and after.

## Findings

### 1. Tied responses are scored because utility uses float equality (high; scoring bug)

`src/core/engine/value.ts:16-19` computes `ΔP − (1.2 × Δpm) / 6 − 12 × ΔR` in floating point,
and `src/core/engine/resolve.ts:71-75` treats the decision as unscored only when
`best === worst`. Design (design-doc-v2.md:188) says "If fewer than two distinct utility values
exist, record an unscored decision". Because 1.2 is not exact in binary, responses with equal
utility often compare unequal.

Reproduced against the real engine (public `resolve`/`previewResponse`, live `UTILITY_RULES`):

- Starting six, response A `{ minutes: 1, progress: 0 }` vs B `{ minutes: 6, progress: 6 }`.
  Both are exactly −1.2, but evaluate to −1.2 and −1.1999999999999993.
- Released down to Priya + Dev, A `{ minutes: 1 }` vs B `{ minutes: 6, progress: 2 }`.
  Both are −0.4; the engine records `quality: 0` for A and `quality: 1` for B.

A brute-force sweep over headcounts 2–8, minutes 0–10, progress −10..25 and risks −1..1 found
1,666 tied pairs that the engine scores. Each one swings that decision's q by the full 0↔1 and
moves D (300 × average q), the total score and the Played It Right threshold. It will also
break Greedy's "lower minutes, then ID" tie-break in task 08 if that reuses this utility.

The tests miss it because every quality test injects `fixtureUtilityRules`
(`fixtures/transitions.ts:8-12`: weights 2/3/4, which are exact in binary), and the property
test only ever builds one-response events, so quality is always null.

Fix: compare in exact units. For example, score with `utility × costUnit × 5`
(= 30ΔP − 6Δpm − 360ΔR at the current weights) when the weights allow it, or keep floats
but treat `best − worst` below a small epsilon (e.g. 1e-9) as equal and snap q to 0/1 at the
ends. Add a regression using the live `UTILITY_RULES` with the A/B pairs above, and give the
property test multi-response events so quality is exercised.

### 2. Preview accepts responses that resolve rejects (low; contract gap)

`resolve.ts:18-39` (`validateContext`) rejects zero-minute non-email effects, `bookingEnd`
outside `room-booked`, and joins outside the arrival events, but `preview.ts:11-33` never
runs those checks. Reproduced: a `{ technique: 'ack', minutes: 0 }` response and a
`{ bookingEnd: 45 }` response on a non-`room-booked` event both preview as `enabled: true`,
then `resolve` throws `invalid-effect`. The spec (tech-spec.md:288) wants preview and
resolution to share one evaluator so UI and policies never disagree with the engine.
Content validation (task 07a) should make this unreachable on valid packs, so it is low, but
the fix is cheap: `previewResponse` only receives the response, so either move the
event-independent checks (zero minutes require email) into `applyEffect`, or add an
event-aware preview path that the store uses.

### 3. Content IDs are hard-coded in the engine (low; D13 / constants rule)

`constants.ts:66-72` maps event IDs (`circle-back`, `support-training`, `p1-bug`, `legal`,
`vp-joins`), `resolve.ts:31` hard-codes `'room-booked'`, and `applyEffect.ts:38` repeats
`'legal'`/`'vp'` instead of reading `ARRIVAL_ATTENDEES`. The spec does name these families
(tech-spec.md:279-281), so this is defensible, but it means fixture packs must reuse live IDs
to exercise these paths. At minimum, move `'room-booked'` into a constant and derive the join
allowlist in `applyEffect.ts:38` from `ARRIVAL_ATTENDEES` so there is one list.

### 4. Spec not updated for the new state field and modules (low; docs)

`releasedAttendeeIds` (`types.ts:162`) is a new locked-state field, and `applyEffect.ts`,
`preview.ts` and `errors.ts` are new engine modules. The spec allows adding fields, but the
state shape (tech-spec.md:153-175) and repository layout (tech-spec.md:95-106) don't list
them, and the spec asks for a document change when a task needs something the documents don't
state (tech-spec.md:444). Task 03's review asked the same for `weighted.ts`/`conditions.ts`;
that hasn't been done either. One small spec PR could cover all five.

### 5. Disabled reason is engine-generated, not content-authored (low; design gap to track)

`preview.ts:20` always returns `requirements-not-met`. The design (design-doc-v2.md:322) says a
disabled preview "carries a content reason key", and the spec (tech-spec.md:302) says disabled
reasons are authored in content. With one generic key, the UI can't say "needs Sam" vs
"needs Dev" without re-deriving it from `requires`, which the spec forbids. The task 04 handoff
acknowledges this; it should be resolved (e.g. an optional `disabledReasonKey` on `Response`)
before task 07a's validator is written.

### 6. Same single-PR split pattern as task 03 (process; for Harry to judge)

PR #4 is +1233/−5 (about 1,100 lines excluding docs), delivered as 04a/04b/04c.1/04c.2 commits
each under 400 lines. I found no record of the split being proposed before implementation
(plan line 22). This repeats task 03 finding 6; if Harry accepts "split = commits in one PR",
it would be worth writing that reading into the plan so it stops being flagged.

## Test gaps

- **Decision quality never uses live weights** (see finding 1). Add at least one test through
  public `resolve` with `UTILITY_RULES`. The design's worked utilities (design-doc-v2.md:372:
  timebox −0.6, park −1.2, hear −6.8; owner 10.4, hear 9.6, park −13.2) would make a good
  fixture, as long as they're framed as formula checks rather than live tuning.
- **Property test is narrow** (`transitions.test.ts:14-89`): single-response events only
  (quality always null), only ever releases `gary` (so the owner and two-person refusals
  never appear there), and no joins, booking changes or callbacks. It also checks preview vs
  result for progress, risks and person-minutes but not `minutesDelta` (line 74-78).
- `callIt` leaves `current` set on the ended state (`state.ts:58-66`). Nothing reads it, but
  no test pins whether an ended state should keep a pending event; task 06's
  `getDrawCandidates` must return `[]` for ended runs regardless.

## Task 03 findings: carried over or fixed?

All five code/doc findings were fixed in PR #3 (`b30803c`, merged as `e6773a1`) before task 04
started, and task 04 kept them:

| Task 03 finding                               | Status on `4be55fc`                                                                                                     |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1. Rarity weights not validated               | Fixed: `weighted.ts:4-11` rejects non-integer or < 1 weights                                                            |
| 2. Duplicate IDs accepted                     | Fixed: `weighted.ts:20-24` throws; test at `weighted.test.ts:153`                                                       |
| 3. Absent-Sam fixture lacks a scheduling park | Fixed: variant uses `absentSupportResponses` (`fixtures/packs.ts:61`)                                                   |
| 4. Missing design-section TSDoc               | Fixed for task 03 exports (`rng.ts:24,42,48,63`, `conditions.ts:4`, `weighted.ts:13`); task 04 exports all carry it too |
| 5. Stale plan status/handoff                  | Fixed: plan lines 210-217 now show 00–03 complete and point at 05                                                       |
| 6. Split as commits in one PR                 | Not addressed; repeated in task 04 (finding 6)                                                                          |
| Note: spec layout for new files               | Not addressed; now five files (finding 4)                                                                               |

## Plan acceptance checklist (task 04 row)

| Criterion                        | Status                                                                    |
| -------------------------------- | ------------------------------------------------------------------------- |
| Starting six                     | Met (`state.ts:11-35`, `state.test.ts:6`)                                 |
| Legal releases, owner protection | Met; refusals return a fresh snapshot                                     |
| Integer person-minutes           | Met; pre-join headcount × full minutes, safe-integer guarded              |
| Booking changes                  | Met; 45/60 only, room-booked paths explicit, already-passed deadline ends |
| End priority                     | Met; decision before time-expired                                         |
| Clamping                         | Met; single `applyEffect`, effective deltas returned                      |
| Invalid actions                  | Met; typed `EngineError` codes                                            |
| Immutability on fixture packs    | Met; deep-frozen inputs in fixed and property tests                       |
| Counters authoritative (D15)     | Met; `releasedAttendeeIds`, `parkedCount`, turn-based Call it             |
| Log and decision records         | Met, except quality on ties (finding 1)                                   |
| Core property tests              | Partly; see test gaps                                                     |

## Resolution log (the review above describes the pre-fix revision)

The review findings were addressed on PR #4: exact decimal utility equality/normalization,
shared preview/resolve context validation, injected content-owned relationship metadata,
authored disabled reason keys, and synchronized state/schema/module documentation. Public
regressions cover both reported headcounts. Multi-response/action properties now include
releases, joins, booking changes, callbacks, all preview deltas and bounded quality.
The original property checks remain. Call it retaining current is pinned by a unit test;
ended draw-candidate behavior is an explicit task 06 requirement.
Harry explicitly accepted keeping PR #4 and larger future PRs, resolving the process finding.
The implementation plan records actual check evidence and the remaining Android release risk.
