# Task 07b review resolution

Source: [Claude review](task-07b-review.md). Harry authorized implementing its
recommendations in this chat. The approved content table and the task 07a expert
validator/spec wording are unchanged; this request does not need another design
decision. No separate verbatim approval of that older sentence is claimed.

1. **Delivery status:** corrected the status, milestone and task section to keep
   07b current until its commit, PR and hosted Node 24 evidence exist. Local
   execution explicitly selected Node 24.21.0 through PATH in elevated PowerShell
   and ran `pnpm check`, `pnpm build`, `pnpm size` and `pnpm e2e`. The review's
   Node 22 results are independent evidence from its default PATH.
2. **Acceptance criterion:** restored the 07b acceptance text and added its full
   catalog/used-versus-authored reason audit. Results belong in the progress and
   evidence sections, without replacing the acceptance criterion.
3. **Callback/filler metadata:** the transcription test now compares all four
   seven-column scheduled/fallback rows, including kind, rarity, weight, negative,
   conditions and callback source relationships.
4. **Epilogue data:** endings use `NonNullable<MeetingState['ending']>`. Decision
   tiers also carry the approved numeric min/max risks beside the unchanged
   display conditions and copy. Tests cover all legal risks with exactly one
   matching tier. Runtime selection remains task 15.
5. **Title mapping:** asserted IDs in design-number order alongside the existing
   ordered name comparison and constructed witnesses. Swapped names/IDs now fail.
6. **Callback walkthrough:** added the exact support absence route: P=16, R=0,
   T=12, 39 person-minutes, with 27 billed for the final response. A distinct
   pre-due ending case keeps the scheduled item, refuses another draw and never
   records its presentation. Removed the weaker ended-at-due assertion from the
   three scheduling cases; fixture rule tests remain unchanged.
7. **Windows line endings:** prepared in a separate `chore/windows-line-endings`
   branch/worktree with `* text=auto eol=lf`, as requested. Its fresh Windows
   checkout and hosted checks are recorded in that PR and its own plan entry.

No gameplay, approved row, validator, scoring formula, dependency, lockfile,
CI workflow, frozen fixture/golden or threshold change is included in 07b.
Task 08a has not started. PR and hosted evidence are recorded in the plan after
the runs finish; this file is a resolution record, not a claim of pending passes.
