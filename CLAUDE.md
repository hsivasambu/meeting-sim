# This Could've Been an Email — rules for coding assistants

Read before any task: docs/tech-spec.md (how), docs/design-doc-v2.md (what),
docs/implementation-plan.md (task order, IDs, status), docs/content-table.md and docs/adr/.
Precedence, architecture rules and the gate schedule are defined only in docs/tech-spec.md.

## Stack (locked — changes need an ADR in docs/adr/)

Node 24 LTS · pnpm · TypeScript 6 strict · Vite 8 · React 19 · Zustand 5
Tailwind 4 · Vitest 5 + fast-check · Playwright · ESLint + Prettier · tsx · Vercel (static)
Runtime deps are ONLY: react, react-dom, zustand, @vercel/analytics.
The room is DOM sprites + CSS. No game engine.

## Architecture

- src/core (engine + content) is pure TS: no DOM, React, Date, timers, Math.random.
- store/ is the only browser caller of state-changing engine functions.
- ui/ (React) owns all text and input. stage/ only draws the room and never dispatches.
- sim/ runs in Node only and is never bundled.

## Guardrails

1. Game rules live only in src/core/engine. ui/, store/, stage/ and sim/ never compute
   eligibility, effects, clamping, utility, score or titles; they call previewResponse,
   getDrawCandidates, score and earnedTitles.
2. The store is the only writer of MeetingState. Only the store actions `start` and
   `continue` call drawEvent. ui/ dispatches named actions; stage/ never dispatches.
3. Only src/core/engine/index.ts imports live content. Engine internals take a ContentPack
   argument. Rule tests and goldens use fixture packs, never live content.
4. State counters are authoritative for rules and titles. `log` is narrative only (results
   moment, outcome line, sim traces). No rule reads the log.
5. `current` is a PresentedEvent. Read speaker, line and responses from it; never
   re-select variants outside drawEvent.
6. Typing, tweening and sprite animation state live in the component that renders them.
   Nothing time-based enters the store or the engine.
7. Content files are plain data checked with `satisfies`: no functions, no computed values.
   Numbers live in content or constants.ts; player-facing text lives only in content.
8. The room is reached only through RoomView; reactions come only from reactionsFor(prev, next).
9. Tuned numbers are asserted only by content-validation tests and the sim report. Engine
   unit tests and goldens never depend on live tuning values.
10. If a task needs a rule the docs do not state, stop and propose the doc change in the PR
    description first. Never settle a convention in code alone.

## Code

- No any, no !, no `as` (except `as const`), no enums, named exports only.
- Numbers live in core/engine/constants.ts or core/content/; player text lives in core/content/. Tooling configuration values are exempt.
- Money is integer person-minutes; dollars are display-only, formatted only by formatCost.
- Engine functions are pure and return new state; never mutate input.

## Workflow

- One blueprint task per PR; Conventional Commits; branch feat/ fix/ chore/ docs/.
- First reply on a task: the task ID, files to touch, risks to the rules.
- Run the gates active for this task (tech spec → Testing and quality gates) before saying done; document-only tasks run consistency checks. Add tests with every behaviour change. Never deactivate an active gate.
- Tuning PRs include the before/after `pnpm sim:ci` summary.
- Event content is transcribed from docs/content-table.md; do not invent event design in code PRs.

## Never

- Add an unapproved direct dependency, CDN script, custom tracker or cookie. The explicit dependency allowlist and page-view Analytics are approved.
- Weaken/skip a test or lower a threshold to go green.
- Edit pnpm-lock.yaml by hand, rewrite an accepted ADR, or edit CI to pass.
- Change a scoring formula without Harry's approval.
- Commit an asset without a LICENSES.md entry, or AI-generated final art.

## Stop and ask when

- A locked choice looks wrong, the docs conflict or are silent on a needed rule,
  a gate can't pass.

## Plan maintenance

Follow docs/implementation-plan.md. Before implementing, identify the current task and any split.
Update that plan after each task with completed work, actual check results, outstanding issues
and the next task. Read docs/content-table.md when it exists; it is created in task 06b.
Stop at the task boundary requested by Harry.

## Review size preference

Harry explicitly accepted keeping PR #4 and larger future PRs on October 11, 2026.
Keep one blueprint task per PR and use understandable commits; a large diff alone
does not require splitting into multiple PRs or asking for approval.
