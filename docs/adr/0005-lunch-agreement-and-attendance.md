# ADR 0005: Lunch agreement and permanent attendance

Status: **Accepted by Harry on October 13, 2026.** Task L01.

Harry approved all recommended resolutions on October 13, 2026: “Accepting all recommended resolutions”. He explicitly confirmed that success must choose an actual cuisine and requested a dedicated AI review for adult workplace humour. This accepts the rule/formula and named criterion changes, not unreviewed final content or tuning. L01 finalizes documentation only; gameplay implementation follows the task sequence.

## Context

The requested lunch premise conflicts with D01/D05–D07, D13/D14/D17 and the
approved launch content. Removing risk/release only from the UI would leave
unexplained rules. The complete rationale and change audit are in the
[review package](../lunch-redesign-plan.md).

## Accepted decision

Adopt that package's concrete cuisine, attendance, callback and ending model:

- Force a substantive cuisine nomination first, within the 17-family budget;
  retain a substantive second draw, all other fairness guards and fixed presentations.
- Add nullable nominatedCuisine/agreedCuisine IDs with authored cuisine catalog.
  Only nomination sets the former; P=100 sets the latter and ends in agreement.
  No silent cuisine change, separate votes or alternative completion trigger.
- Remove risks, releasedAttendeeIds, risk effect/condition/preview fields,
  release log variant, release/previewRelease public APIs and store release action.
  Remove risk/minimum-release limits from ENGINE_LIMITS; replace attendance bounds
  with 6–8. Preserve remaining locked field names and ending values.
- Keep six starters/eight total named identities, no departures. Author named
  invitations and spontaneous arrivals; validate permissions per event/response,
  absent requirements and fallbacks. All branches of an invitation join the same
  person. Arrival costs apply from the following response, as under D07.
- Retain three unique, reviewed parent/target pairs, n+2 scheduling and no chains.
  Remove their association with risk; retain parkedCount as an action counter.
- Preserve Call it, 60/45 booking and decision-before-expiry precedence. Tighten
  all playable response durations to 1–10; filler remains +2. Preserve ≤50-turn
  termination without a forced turn cap.

Add `Effect.nominateCuisine?: CuisineId`, allowed only on the forced nomination
family, whose three deterministic responses name distinct catalog entries and
otherwise have equal effects. Its progress must remain below 100. Every legal
resolution after nomination preserves that ID. Add a cuisine equality condition
only if reviewed content needs cuisine-specific variants; generic authored
`{cuisine}` templates suffice initially and avoid an unnecessary condition rule.
Add `ContentPack` cuisine catalog and nomination-family metadata so fixture packs
inject their own IDs. Draw precedence is ended/pending event, forced nomination
at turn zero, due callback, guarded random pool, filler. New valid-run invariants
require nomination after turn zero and agreedCuisine exactly when ending=decision.

This explicitly replaces locked contracts rather than claiming field deletion is
an additive change. It partially supersedes ADR 0004's release-preview addition;
its asset loading contract remains. D13 injection/store boundaries remain intact.
The accepted original ADRs must not be edited.

## Alternatives and consequences

An anonymous progress-only lunch decision is simpler but cannot display the agreed
cuisine. A changing shortlist or individual votes adds complexity without serving
the two-second objective. Hidden risks/releases retain incoherent state. Permanent
attendance makes invitations consequential and increases costs: balance must be
remeasured, not compensated with a silent score change.

## Implementation acceptance

L01 updates normative documents before code. L04/L08 test nomination cancellation,
no false agreement at P=99/null cuisine, terminal P=100 agreement, simultaneous
expiry/join, absence guards, all new variants and three callbacks, no departures,
filler exhaustion, immutable inputs and ≤50 resolutions. The matching criterion replacements in the review package are approved. Existing active gates and
coverage/bundle limits remain; acceptance here is not implementation evidence.
