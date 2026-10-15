# ADR 0007: Risk-free scoring and expected choice quality

Status: **Accepted by Harry on October 13, 2026.** Task L01.

Harry approved all recommended resolutions on October 13, 2026: “Accepting all recommended resolutions”. He explicitly confirmed that success must choose an actual cuisine and requested a dedicated AI review for adult workplace humour. This accepts the rule/formula and named criterion changes, not unreviewed final content or tuning. L01 finalizes documentation only; gameplay implementation follows the task sequence.
October 13, 2026. Task L01. Affects D08/D20 and design balance semantics.

## Accepted formulas

Keep Outcome 400 + Efficiency 300 + Decisions 300, component rounding then sum.
For a valid lunch state, agreement requires P=100 and recorded cuisine.

```text
O = 400 if agreement, otherwise 1.8 * P
E = 300 * min(P,100)/100 * clamp((360 - pm)/(360 - COST_FLOOR_PM), 0, 1)
u(branch) = effectiveDeltaP - W_COST * (billedDeltaPersonMinutes / 6)
U(response) = sum(weight(branch)/sumWeights * u(branch))
q = (U(chosen) - minEnabledU)/(maxEnabledU - minEnabledU)
D = 300 * mean(scored q)
```

Remove risk penalty/cap and W_RISK, not merely set them to zero. Initial W_COST
remains 1.2, floor remains 90 pending normal D25 calibration. Use existing exact
decimal rational arithmetic extended to weights; clamp each branch first, not
the average effect. Disabled responses excluded; fewer than two distinct values
means q=null; no scored decisions means D=0. Record q before sampling. No past q
is recomputed. Dollars and commentary comparisons never enter scoring.

Time affects the deadline, full-duration person-minute cost and utility; no
separate time component is added. Outcome/Efficiency use realized state. The
rule promises success Outcome exceeds failure Outcome, not every successful
total exceeding every failure total. It no longer claims slow thorough play must
beat fast play that actually reaches agreement.

Replacement exact score fixtures (pm derived from the old dollar examples):

| Case                           | P   | pm  | mean q | O   | E   | D   | Total |
| ------------------------------ | --- | --- | ------ | --- | --- | --- | ----- |
| Efficient agreement            | 100 | 132 | .90    | 400 | 253 | 270 | 923   |
| Slow agreement                 | 100 | 324 | .85    | 400 | 40  | 255 | 695   |
| Fast agreement, weaker choices | 100 | 108 | .60    | 400 | 280 | 180 | 860   |
| Good choices, no agreement     | 84  | 360 | .90    | 151 | 0   | 270 | 421   |
| Expired                        | 62  | 360 | .35    | 112 | 0   | 105 | 217   |
| Cancelled                      | 0   | 0   | none   | 0   | 0   | 0   | 0     |

Also test P=99/100, cost bounds, equal/close utilities, clamped branches, disabled
choices and same q with different sampled outcomes. These replace the old risky
success arithmetic explicitly, not through unreviewed snapshot updates.

## Accepted seven policies

No policy releases attendees or calls it early. Common tie-break: lower expected
minutes then ASCII response ID. Comparisons use exact expected values, not floats.

| Policy                         | Definition                                                                                                                                                                                                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Greedy                         | Maximum U; D=300 when it has scored choices, regardless of realized branch.                                                                                                                                                                                          |
| Optimistic (replaces Reckless) | Maximum single-branch utility of each response, ignoring probability. Common tie-break. Distinguishable from Greedy on fixture lotteries.                                                                                                                            |
| Always-timebox                 | First apply common tie-break among enabled timebox responses; otherwise Greedy.                                                                                                                                                                                      |
| Always-fastest                 | Minimum expected minutes, then maximum U, then ASCII ID.                                                                                                                                                                                                             |
| Always-park                    | Prefer park, then email, tie by common order; otherwise Always-fastest.                                                                                                                                                                                              |
| Random                         | Uniform enabled responses in authored order, unchanged ADR 0003 stream.                                                                                                                                                                                              |
| Lookahead                      | Maximize U(r) + sum over its branches p(b) * nextBest(b). nextBest=0 for ended successors; otherwise enumerate getDrawCandidates, then probability-weighted max U of enabled next responses. Never call seeded resolve/draw to predict the future. Common tie-break. |

Chance nodes include joins, clamping, callback queue and booking changes, not
only mean progress. Use engine outcomes API so sim computes policy ranking, not
game effects/scoring. Benchmark two-turn expansion before tuning. Simulation
rows replace R with nominated/agreed cuisine, branch counts and rules/content
revision; retain P/T/pm/cost/q/score/end/title, event/variant/callback coverage and
ordered replay actions. Report both expected choice quality and realized results.

## Acceptance and alternatives

Retain existing target numbers/denominators initially, applying the former
Reckless 60–80% win band and ≥50-point Greedy median deficit to Optimistic as an
explicit approved criterion replacement. Retain all other policy bands, score
gaps, 9–12 turns, 40% technique cap, 120 win-only spread, 5% Random family coverage
and D25 fifth-percentile calibration. These are hypotheses, not measured results.
If evidence shows an incoherent target, request a separate approval with unchanged
before/after reports; this ADR grants no general target relaxation.

Deleting Decisions would be a much larger score redesign; scoring realized
utility would punish bad luck. Keeping Reckless unchanged produces identical
choices to Greedy and an impossible score-gap test. A variance penalty adds a
new opaque preference; it is not proposed. L11 verifies policies with adversarial
fixtures and L12 retains mandatory balance activation at completion of task 10.
All existing active safety gates remain. Accepting this ADR does not approve
unreviewed tuning values or claim lunch is balanced.
