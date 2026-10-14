# L02b review — resolution record

October 13, 2026. Harry requested that all concerns in
[Claude's review](L02b-review.md) be addressed before moving on.
The revised table is **lunch-l02b-reviewed-2**. The [writing report](lunch-writing-review-report.md)
retains the original pass and adds an affected-row editorial review and twelve
exact before/after field changes. No effect, weight, technique, ID, condition,
arrival/callback relationship, title predicate or formula is changed.

| Finding                                       | Resolution                                                                                                                                                                                                                                                                                    |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1 — commit, stacked PR and hosted evidence   | Delivery in progress; exact commit, PR and quality-run evidence will be recorded below before completion.                                                                                                                                                                                     |
| Copy 1 — Sam's repeated contrast              | Keep the spice-return opening; rewrite spice-question/hear, menu-return/timebox and spice-return/owner/timebox with concrete actions and different payoffs.                                                                                                                                   |
| Copy 2 — projector choices indistinguishable  | timebox reads on the laptop; park now sets the menu aside and returns to the cuisine without reading it this time. Label, description and outcome distinguish the no-progress postponement. No claim that earlier events never checked a menu. Topic remains big screen; mechanics unchanged. |
| Copy 3 — Pat asked no question                | Pat now asks Where have we got to? All three arrival responses, the saved questions and existing topic make sense together.                                                                                                                                                                   |
| Copy 4 — repeated other-room punchline        | Keep hear's room-discussion ending; Pat's version now makes the next team defer to seniority.                                                                                                                                                                                                 |
| Copy 5 — unclear expensive-discussion line    | State that salaries fund the discussion and it has produced no food. Avoid unsupported comparisons with actual meal prices or claims about external ordering/invoices.                                                                                                                        |
| Copy 6 — action/tradeoff rhythm               | Explicit keep rationale in the writing report: consistent choice descriptions aid comprehension when numeric previews are removed. Variety comes from character and outcome beats without hiding consequences.                                                                                |
| Copy 7 — Alex as paperwork, repeated acquired | Credit Alex's information as a contribution; make the factual arrival moment plain and remove the repeated acquired phrase.                                                                                                                                                                   |
| Documentation — one-off audit                 | Fold complete mechanical comparison, exact report coverage and sequential log replay into lunch-content-checks.py with --review-base. The original check is identified as a one-off; the replacement is reproducible.                                                                         |
| Documentation — historical next-task wording  | Replace recommended L02 → L02b order with completed editorial status and explicit next task L03. Historical execution records remain labelled as past evidence.                                                                                                                               |
| Documentation — CRLF                          | Preserve existing eol=lf policy; write the audit helper with LF and let Git normalize staged documentation. No .gitattributes or CI edits.                                                                                                                                                    |

## Checks and delivery

Local Node 24 `pnpm check`, build/size and all 30 E2E checks pass. The expanded
document audit, formatting and whitespace checks pass. These were run for this
follow-up, separately from Claude's evidence. The implementation plan records
exact results; commit, stacked PR and hosted-run evidence are pending delivery.

## Remaining handoff

No new design issue is introduced. D1 (uncertainty competitiveness) and D2 (expert
paths) remain final D18 content considerations; D3's intentional room tradeoff is
preserved. These are separate from the already accepted ADRs 0005–0008.

Next implementation task is **L03 — engine outcome capability**, additive before
L08 activation. Harry's D18 approval of the complete revised table is still needed
before L05/L06/L07 use its content. L09 human observations and original 12a V4
remain pending. This follow-up stops at L02b.
