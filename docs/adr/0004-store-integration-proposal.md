# ADR 0004: Store loading and release preview (proposed)

Status: **Accepted by Harry on October 12, 2026.**
Task: 11a review resolution. Recorded October 12, 2026.
Review: [task 11a review](../task-11a-review.md), findings 1, 2 and 5.

The complete D17 action list has no way to report asset loading. The HUD must
show release refusal reasons while eligibility remains exclusively in the engine.
These are API gaps, not changes to release rules, event content or scoring.

Harry approved this exact proposal in the review-resolution chat: “Approve ADR
0004 as proposed.” It authorizes the technical-spec additions and implementation
below within task 11a; it does not authorize merging PR #12 or the 11a PR.

## Approved technical-spec changes

1. In **Meeting turn flow (D17)**, add `assetStatus: 'loading' | 'ready' | 'failed'`
   and `breakdown: ScoreBreakdown | null` to the store shape. Retain `assetsReady`
   for the existing start guard; only the loading action synchronizes it to
   `assetStatus === 'ready'`. Results compute breakdown using engine `score`;
   restart clears breakdown and preserves asset status and unlocked titles.

   Add this eighth row to the complete action table:

   | Action                   | Allowed when | Does                                                                                                                                     |
   | ------------------------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
   | `setAssetStatus(status)` | Title screen | Sets loading/ready/failed status and assetsReady (true only for ready); does not create a seed, draw, change MeetingState or start a run |

   The UI preload integration reports loading before each attempt, ready only
   when every required image/font is ready, and failed when any required load
   fails. The failed title state offers Retry, which starts a new preload attempt.
   Loading promises and timers stay outside the store. The UI uses this named
   action; direct UI `setState` is not sanctioned. During text-only task 12a
   there are no required room assets or custom font, so the Title integration
   reports ready through this action after mount. Task 14b replaces that empty
   preload with the required images/font. No start happens automatically.

2. In **Engine API**, add pure read-only
   `previewRelease(state: MeetingState, who: AttendeeId): ReleasePreview`, where:

   ```typescript
   type ReleasePreview =
     | { readonly enabled: true }
     | {
         readonly enabled: false;
         readonly reasonKey:
           'release-owner' | 'release-absent' | 'release-minimum';
       };
   ```

   Like release, preview requires a running meeting and throws the existing
   `EngineError('ended')` otherwise. Checks use existing constants and the same
   ordered owner → absent → minimum predicates as release. Both functions share
   the internal evaluator so they cannot diverge. A refused release still changes
   no gameplay state. Export the function/type through the public engine index
   and add the function name to the lint API allowlist; callers remain outside
   engine internals. UI reads this preview before showing confirm/reason and
   refreshes it from the current state. It never derives release eligibility.

   Put the following reason copy in `core/content/copy.ts`, separate from the
   response-disabled reason catalog so its existing used/authored audit remains
   meaningful:

   | Key             | Proposed copy                               |
   | --------------- | ------------------------------------------- |
   | release-owner   | Priya must stay to own the launch decision. |
   | release-absent  | This attendee has already left the room.    |
   | release-minimum | One other attendee must stay with Priya.    |

3. In **Repository layout**, list `core/content/storeConfig.ts` as plain browser
   protocol data (seed byte count/hex formatting and the versioned persistence
   key). This documents the existing location; it does not change content design.

## Validation after approval

Implement the loading action with title/screen guards, failure/retry tests and
production-path readiness tests that do not call `setState`. Add fixture-based
preview/release agreement tests for owner, absent, minimum, allowed and ended
states, including immutability. Test content reason lookup without changing the
response-disabled audit. Run every active Node 24 check and hosted CI before
marking 11a complete. Keep all thresholds and event/scoring rules unchanged.

The technical spec is the normative home for the approved contracts. Implement
and verify them there before closing task 11a.
