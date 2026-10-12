# Task 07a review resolution — October 12, 2026

Harry requested that the supplied [Claude review](task-07a-review.md) be addressed
and task 07a merged. These notes supersede its initial not-ready verdict; the
original findings remain available. Gameplay, approved content and frozen goldens
are unchanged.

1. **Expert requirements corrected.** Applied the review's base/expert/absence-set
   distinction and documented it in the technical spec. Positive hear/owner work
   removed by an expert's absence requires a non-Priya attendee, which can be Legal
   rather than the speaker. Shared tangent choices and Priya's absence choices are
   allowed. A Node-only content-validation test reads every approved table row:
   all 17 base families, 3 callbacks, 13 variants and filler pass; removing the
   requirements from failing-tests/support-training produces exactly four expert
   errors. All four counterexample patterns in finding 1 are covered by that audit.
   Object-key order does not change the shared-response comparison.
2. **Delivery base corrected.** The pre-squash 06b base `b88a56f` and merged main
   `9ed47b4` have identical trees. Task 07a is committed and rebased onto merged
   main before PR delivery. Hosted Node 24 evidence is recorded in the plan once
   available; merge requires the final head's required checks.
3. **Acceptance restored.** The plan's 07a row retains its original acceptance
   criterion. Actual evidence stays in the status and task sections.
4. **Gate scope made accurate.** Spec prose and the gate row name the synthetic
   and playable profiles and complete packs checked in CI. Partial inline packs
   are scoped engine test inputs; no claim remains that every such input has a
   validation rejection assertion.
5. **Catalog handoff made explicit.** Task 07b requires eventFiles, attendees and
   disabledReasons in the live validation test, plus an exact used/authored reason
   key audit to catch stale copy. Epilogues/titles join as transcribed; task 15
   adds substituted moments. The optional catalog remains useful for small
   isolated fixtures and is not sufficient evidence for live-content completion.
6. **Expected relationships centralized.** Exact MVP expectations are in typed
   engine constants, not repeated in the validator. The content metadata remains
   plain data, and only the public engine index imports it.
7. **Enumeration accelerated without losing cases.** Rosters are computed once;
   minutes/risks are represented at zero, each inclusive minimum and immediately
   after each inclusive maximum. All relevant family, variant and response
   conditions contribute boundaries. A differential test compares the result
   with all legal rosters × 60 minutes × 6 risks for twelve boundary/conjunction
   cases, including shadowing, gaps and unreachable presentations. The full
   validation test file runs in about 0.4 seconds under coverage, versus the
   reviewed 18.7 seconds; timeouts and checks are unchanged.
8. **Small test gaps closed.** Renamed the misleading scheduler case; unknown
   condition keys are rejected and tested. ATTENDEE_IDS uses satisfies, and a
   compile-time exhaustiveness assertion fails if the union gains an omitted ID.

Local Node 24.21.0 / pnpm 10.34.6 evidence: 277 tests in 25 files; core
588/590 lines (99.66%) and 599/607 branches (98.68%); types/lint/format pass;
build/size 70,410/122,880 gzip JS bytes and 0/409,600 image/font bytes;
18 E2E passes across the three required profiles. No dependency, lockfile, CI,
coverage floor, scoring formula or tuning change. See the plan for hosted delivery.
