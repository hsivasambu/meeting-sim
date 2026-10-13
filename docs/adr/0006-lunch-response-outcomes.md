# ADR 0006: Authored seeded response outcomes

Status: **Accepted by Harry on October 13, 2026.** Task L01.

Harry approved all recommended resolutions on October 13, 2026: “Accepting all recommended resolutions”. He explicitly confirmed that success must choose an actual cuisine and requested a dedicated AI review for adult workplace humour. This accepts the rule/formula and named criterion changes, not unreviewed final content or tuning. L01 finalizes documentation only; gameplay implementation follows the task sequence.

## Accepted decision

Replace the fixed-response contract (D05/D14/D24) with plain data:

```typescript
interface ResponseOutcome {
  readonly id: string;
  readonly weight: number;
  readonly effect: Effect;
  readonly line: string;
}
// Response retains id, label, technique, requires and disabledReasonKey.
// Add description; replace effect/line with outcomes (one or two entries).
```

One outcome has probability one. Two outcomes have distinct kebab-case ASCII IDs,
positive safe-integer weights with total at most 65,536. Validate every complete
effect independently; shared effects are not added again. No outcome conditions,
effectCases, functions, nested outcomes or new dependencies. Every playable branch
uses the approved progress/duration/arrival/callback bounds. Initial weights need
D18 table approval; neither this ADR nor the user's 80/20 example tunes them.

## Accepted seeded protocol

Leave draw RNG `${seed}:draw:${turn}` and ADR 0003's Node-only policy RNG unchanged.
For a chosen uncertain response, create a new cyrb53-to-uint32/mulberry32 stream
using `JSON.stringify([seed, 'response-v1', turn, current.id, response.id])`.
JSON array serialization disambiguates arbitrary seeds/IDs; string hashing uses
the existing UTF-16 contract. Sort outcomes by ASCII ID. Let W be total weight,
L=floor(2^32/W)*W. Convert each stream result to uint32 via floor(r*2^32), reject
tickets >=L, then select cumulative weights with ticket % W. This is unbiased
over integer tickets and matches exact weight/W expectations. A deterministic
response consumes no outcome ticket. Rejected tickets affect only this local
response stream. Fixture vectors must include a rejection case.

Validate phase, pending event, response and requirements before sampling. Resolution
chooses one branch once and uses the same shared transition evaluator as preview.
Record outcomeId in the resolve log, never as the source of title/score rules.
Repeating resolve from the same immutable state yields byte-identical output;
store beat guards prevent double application. Preview/draw candidates never sample.

## Accepted evaluation and simulation API

Keep disabled previews with authored reasonKey. An enabled ResponsePreview contains
outcomes with exact probabilityFraction (decimal integer numerator/denominator),
effective deltas and utility; top-level expectedUtilityFraction/utility,
expected minutesDelta/personMinutesDelta/progressDelta. Remove the misleading
single effect and risksDelta. Numeric approximations are display/report aids;
comparisons/q use exact fractions. Engine internals evaluate each branch using
applyEffect, clamping before expectation; only index imports live content.

Add read-only `getResponseOutcomes(state, responseId)` returning each branch's
probability and fully resolved successor MeetingState, without seed sampling.
It requires a valid pending response, uses the same transition code as resolve,
including pre-roll q, counters, callbacks and endings, and never mutates input.
Only simulation needs successors; UI needs enabled/description information.
This is an explicit D13 public API/allowlist addition, not exposing internal value.
Policies may enumerate successor branches, not select the seed's future branch.
Public successor data retain serializable exact fractions; no BigInt in state.

## Consequences and alternatives

Two branches limit comprehension and Lookahead cost. Shared mutable RNG would
make UI inspection affect play; reusing draw RNG couples independent systems.
Using resolve to inspect a hypothetical choice would reveal the seed's outcome.
Full Monte Carlo search is unnecessary. Same seed/actions require same rules and
content revision for replay; the redesign does not promise old-seed compatibility.

## Acceptance

L03 tests exact RNG vectors/Unicode and delimiter seeds, both outcome boundaries,
rejection, read-only preview, branch enumeration vs actual resolve, JSON replay,
invalid actions and deep-freeze immutability. L08 E2E verifies duplicate input and
both seeded outcomes. L11 tests policies cannot improve by inspecting future RNG.
Coverage and simulation invariants stay active. ADR 0007 formula changes are
approved in the same acceptance. Implementation evidence remains future work.
