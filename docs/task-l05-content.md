# L05 — Lunch content transcription and validation

October 15, 2026. Source: `docs/content-table.md`, approved revision
`lunch-l02b-reviewed-2`. D18/L02b approval and original 12a V4 acceptance were
already recorded; neither was requested again.

PR #20 was already merged into main (`e9e6607`) when checked. Its head
`a244764` had two successful hosted quality checks and successful Vercel checks.
L05 starts from that merged main on `feat/task-l05-lunch-content`.

The temporary `src/core/content/lunch/` directory contains the complete approved
plain-data pack: 17 base families, three callbacks, filler, 22 presentations,
54 choices, 57 complete outcome branches, three cuisines, eight attendee cards,
seven arrival permissions, all callback/park relationships, twelve titles,
seven commentary rows and every disabled/interface/result/share/epilogue/moment
copy entry. This isolates preparation until L08 removes the launch binding and
migration scaffolding. No mechanics, tuning values or approved content changed.

`validateLunchContent` and its catalog helper receive the pack/catalog explicitly.
They check branch IDs/weights/counts/effects, nomination equality/membership,
arrival permissions and guards, callback references and no chains, booking/filler,
first-two supply, inclusive condition boundaries, speaker presence, first-match
variant witnesses and enabled fallbacks. Catalog validation expands every cuisine,
attendee, title and topic substitution with the authored display bounds.
Commentary predicates remain authored review metadata: evaluating cadence and
wiring presentation are L07/L08. Title predicates remain in `titleRules.ts`.

The [row-to-test checklist](task-l05-checklist.md) maps all 287 reviewed table rows.
`lunchContent.test.ts` audits exact copy and mechanics against the source and
constructs witnesses for all presentations, requirements and outcomes. It also
executes the three full walkthroughs, three callback mini-routes, all twelve title
slots, exact expected utilities/pre-roll q, invitation/arrival boundaries,
clamping/deadline/join/filler/early-ending cases and 100 immutable deterministic
constructed replays (replaced by full-pack seeded draws during the review fixes). Negative validation cases cover malformed packs and catalogs.
These are correctness witnesses, not statistical balance or human playtest claims.

The live `core/content/index.ts`, engine public binding, launch event files,
launch assertions and preserved launch source documents remain unchanged. Build
and browser checks continue to exercise launch until L08. The stale V4 sentence
in the tech spec's embedded CLAUDE mirror was synchronized with the already
recorded acceptance so the existing document consistency check passes.

Local validation uses Node 24.21.0 / pnpm 10.34.6. The unrelated untracked
`docs/L03-review.md` failed Prettier before the checks; it was preserved outside
the checkout for gates and restored byte-for-byte afterward, excluded from commits.
The initial document audit identified the pre-existing stale CLAUDE mirror above;
its correction changes approval status text only. No gate or threshold was relaxed.

Final results and hosted delivery are recorded in the implementation plan.
L05 stops here. Next task: L06; L07 retains its own prerequisites. No L06 storage,
L07 UI/commentary evaluator, L08 activation, tuning or human acceptance is claimed.

Claude's F1–F7 review findings are addressed in the [resolution record](L05-review-resolution.md); the implementation plan records the fresh verification results.
