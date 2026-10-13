# Friday Launch Meeting — Content table

**L01 handoff, October 13, 2026:** This is the approved historical launch table
and remains the source for the current launch runtime during L03–L07 preparation.
It is not the lunch transcription source. Harry has accepted the lunch rules;
**L02 is next:** author the complete lunch draft, then run the dedicated
[L02b adult workplace writing review](lunch-writing-review.md) and obtain D18
approval of the revised full table before lunch transcription. This note changes
no table row or human acceptance result.

Task 06b · October 12, 2026 · **Approved by Harry (D18).**

This is the approved transcription source for task 07b, authored from
[Design Doc v2](design-doc-v2.md) (Events and responses; Event schema and roster;
Endings, titles and the results card). Architecture and validation follow
[the technical spec](tech-spec.md) (Engine contracts; Content validation).
Dependency 00b is complete: [ADR 0001](adr/0001-stack.md) records accepted D01–D26.
No live event data is implemented by this task. Harry's approval is recorded below
for task 07b's transcription of these rows. Balance remains a hypothesis until tasks
08a–10; the hand walkthrough below proves one legal route, not a win-rate target.

## How to transcribe

The family table supplies `id`, `kind`, `rarity`, `weight`, `negative` and `when`.
Each presentation table supplies the base or ordered variants, `speaker`, `line`
and a response-set reference. Each referenced set below is the complete response
array for that presentation; shared sets are copied as data, never resolved at
runtime. Presentation/set names are documentation references, not extra event IDs.

Conditions use the schema's field names. `—` means no condition, no reason key,
no callback, no joins or no booking change, according to its column. P and R are
fixed authored deltas, including explicit zeroes; min is the full billed duration.
All callbacks have `afterTurns: 2`. `Join` and `End` are effect fields; End is an
absolute booking end, not extra minutes. Every family uses weight 1 initially.
No row releases an attendee. No response has conditional effects.

Select the first matching variant in the listed order, otherwise the base. The
`where-we-stand` risk variant lowers refocus's fixed progress and enables hear's
risk reduction. Its owner is
Priya, who cannot be released, so it needs no absence variant. All other variants
are single speaker-absence conditions and cannot overlap within their family.
Release after draw keeps the selected presentation; response requirements are
rechecked. A fallback remains enabled in every presentation.

Expert work explicitly requires the expert, even in the base presentation. Arrival
choices arrange the incoming person's participation; they do not claim to have
obtained their expert advice before joining. Gifts are collective acknowledgements,
not expert work, and remain available after the speaker leaves. These choices
implement the existing arrival and pending-presentation rules.

## Families and draw eligibility

The 17 base rows retain the design roster's kinds and rarities. Common noise and
tangents are non-negative; the three uncommon launch/escalation threats and the
room deadline are explicitly negative for the consecutive-negative draw guard.
The guard applies to the event, regardless of which response the player chooses.

| ID               | Kind        | Rarity   | Weight | Negative | Family when     |
| ---------------- | ----------- | -------- | ------ | -------- | --------------- |
| hdmi             | noise       | common   | 1      | false    | —               |
| tv-no-signal     | noise       | common   | 1      | false    | —               |
| intros           | tangent     | common   | 1      | false    | present: jordan |
| scope-revisit    | tangent     | common   | 1      | false    | present: gary   |
| unrelated-q      | tangent     | common   | 1      | false    | present: jordan |
| another-meeting  | tangent     | common   | 1      | false    | present: gary   |
| circle-back      | tangent     | common   | 1      | false    | —               |
| where-we-stand   | substantive | common   | 1      | false    | —               |
| support-training | substantive | common   | 1      | false    | —               |
| failing-tests    | substantive | common   | 1      | false    | —               |
| press-date       | substantive | common   | 1      | false    | —               |
| p1-bug           | substantive | uncommon | 1      | true     | —               |
| legal            | escalation  | uncommon | 1      | true     | —               |
| vp-joins         | escalation  | uncommon | 1      | true     | minMinute: 15   |
| room-booked      | noise       | uncommon | 1      | true     | —               |
| pre-read         | gift        | rare     | 1      | false    | —               |
| aligned          | gift        | rare     | 1      | false    | —               |

Arrival eligibility also applies the engine's existing no-reentry rule: `legal`
joins only `legal`, and `vp-joins` only `vp`; already-present or released arrivals
are ineligible. Neither needs a family-level absence condition. Gary/Jordan gates
remove harmless tangents without removing any substantive family. Four common
substantive families are unrestricted, exceeding the first-two guarantee.

| Scheduled/fallback ID | Kind     | Rarity | Weight | Negative | Family when | Source                       |
| --------------------- | -------- | ------ | ------ | -------- | ----------- | ---------------------------- |
| circle-back-return    | callback | common | 1      | false    | —           | circle-back                  |
| support-follow-up     | callback | common | 1      | false    | —           | support-training             |
| p1-follow-up          | callback | common | 1      | false    | —           | p1-bug                       |
| filler                | noise    | common | 1      | false    | —           | exhausted eligible pool only |

Relationship metadata for task 07: `arrivalAttendees` maps legal → legal and
vp-joins → vp; `callbackTargets` maps exactly the three source/target pairs above;
`bookingEventIds` contains only room-booked. Callbacks never enter the random pool,
have no family conditions and never schedule another event. Filler is repeatable.

## Presentations and responses

All response tables use these columns: ID, label, technique, requires, reason key,
minutes, progress delta, risk delta, callback target, joins, booking end, outcome
line. Disabled reason copy is listed after the events.

### hdmi

| Presentation | Variant when | Speaker | Opening line                                                    | Response set |
| ------------ | ------------ | ------- | --------------------------------------------------------------- | ------------ |
| base         | —            | dev     | Does anyone have a USB-C to HDMI adapter?                       | hdmi-present |
| variant 1    | absent: dev  | priya   | Dev left. Does anyone know which cable makes the slides appear? | hdmi-absent  |

| Set          | ID      | Label              | Technique | Requires     | Reason key | Min | P   | R   | Callback | Join | End | Outcome line                                                  |
| ------------ | ------- | ------------------ | --------- | ------------ | ---------- | --- | --- | --- | -------- | ---- | --- | ------------------------------------------------------------- |
| hdmi-present | hear    | Find the adapter   | hear      | present: dev | dev-absent | 6   | 2   | 0   | —        | —    | —   | Dev finds four adapters. None have the same ends.             |
| hdmi-present | timebox | Give it one minute | timebox   | —            | —          | 1   | 0   | 0   | —        | —    | —   | One minute later, the laptop becomes the presentation screen. |
| hdmi-present | park    | Skip the slides    | park      | —            | —          | 1   | 0   | 0   | —        | —    | —   | The decision survives without a gradient background.          |
| hdmi-absent  | timebox | Give it one minute | timebox   | —            | —          | 2   | 0   | 0   | —        | —    | —   | The cable remains a mystery. We gather around the laptop.     |
| hdmi-absent  | park    | Skip the slides    | park      | —            | —          | 1   | 0   | 0   | —        | —    | —   | The decision survives without a gradient background.          |

### tv-no-signal

| Presentation | Variant when   | Speaker | Opening line                                         | Response set |
| ------------ | -------------- | ------- | ---------------------------------------------------- | ------------ |
| base         | —              | morgan  | The TV just says 'No Signal'.                        | tv-present   |
| variant 1    | absent: morgan | priya   | Morgan left. The TV is still presenting 'No Signal'. | tv-absent    |

| Set        | ID      | Label               | Technique | Requires        | Reason key    | Min | P   | R   | Callback | Join | End | Outcome line                                                             |
| ---------- | ------- | ------------------- | --------- | --------------- | ------------- | --- | --- | --- | -------- | ---- | --- | ------------------------------------------------------------------------ |
| tv-present | hear    | Try every input     | hear      | present: morgan | morgan-absent | 7   | 2   | 0   | —        | —    | —   | Morgan discovers an input called Hospitality Mode. It is not hospitable. |
| tv-present | timebox | Use the whiteboard  | timebox   | —               | —             | 2   | 3   | 0   | —        | —    | —   | Friday's decision fits on the whiteboard. The TV contributes nothing.    |
| tv-present | email   | Send the slide link | email     | —               | —             | 0   | 0   | 0   | —        | —    | —   | Everyone has the link. Nobody needs the television's approval.           |
| tv-absent  | timebox | Use the whiteboard  | timebox   | —               | —             | 2   | 3   | 0   | —        | —    | —   | Friday's decision fits on the whiteboard. The TV contributes nothing.    |
| tv-absent  | email   | Send the slide link | email     | —               | —             | 0   | 0   | 0   | —        | —    | —   | Everyone has the link. Nobody needs the television's approval.           |

### intros

| Presentation | Variant when | Speaker | Opening line                                        | Response set |
| ------------ | ------------ | ------- | --------------------------------------------------- | ------------ |
| base         | —            | jordan  | Before we start, can everyone introduce themselves? | intros       |

| Set    | ID      | Label                | Technique | Requires | Reason key | Min | P   | R   | Callback | Join | End | Outcome line                                                       |
| ------ | ------- | -------------------- | --------- | -------- | ---------- | --- | --- | --- | -------- | ---- | --- | ------------------------------------------------------------------ |
| intros | hear    | Full introductions   | hear      | —        | —          | 8   | 2   | 0   | —        | —    | —   | Everyone reads the title already printed on their name card.       |
| intros | timebox | Names and roles only | timebox   | —        | —          | 2   | 1   | 0   | —        | —    | —   | Six names. Six roles. One decision still waiting.                  |
| intros | park    | Use the name cards   | park      | —        | —          | 1   | 0   | 0   | —        | —    | —   | Jordan checks the name cards. The information was there all along. |

### scope-revisit

| Presentation | Variant when | Speaker | Opening line                                                         | Response set  |
| ------------ | ------------ | ------- | -------------------------------------------------------------------- | ------------- |
| base         | —            | gary    | I think we should revisit the entire project scope before we decide. | scope-revisit |

The sample's effects and copy are retained.

| Set           | ID      | Label               | Technique | Requires | Reason key | Min | P   | R   | Callback | Join | End | Outcome line                                         |
| ------------- | ------- | ------------------- | --------- | -------- | ---------- | --- | --- | --- | -------- | ---- | --- | ---------------------------------------------------- |
| scope-revisit | hear    | Hear it out         | hear      | —        | —          | 9   | 4   | 0   | —        | —    | —   | Gary shares a 2019 slide deck. One slide was useful. |
| scope-revisit | timebox | Timebox it to 3 min | timebox   | —        | —          | 3   | 3   | 0   | —        | —    | —   | Scope confirmed in three minutes. Moving on.         |
| scope-revisit | park    | Parking lot         | park      | —        | —          | 1   | 0   | 0   | —        | —    | —   | Noted on the board. Gary nods slowly.                |

### unrelated-q

| Presentation | Variant when | Speaker | Opening line                                      | Response set |
| ------------ | ------------ | ------- | ------------------------------------------------- | ------------ |
| base         | —            | jordan  | Actually, I have a completely unrelated question. | unrelated-q  |

| Set         | ID      | Label             | Technique | Requires | Reason key | Min | P   | R   | Callback | Join | End | Outcome line                                                          |
| ----------- | ------- | ----------------- | --------- | -------- | ---------- | --- | --- | --- | -------- | ---- | --- | --------------------------------------------------------------------- |
| unrelated-q | hear    | Hear the question | hear      | —        | —          | 7   | 1   | 0   | —        | —    | —   | The question is about the office toaster. Friday remains unaddressed. |
| unrelated-q | timebox | One sentence only | timebox   | —        | —          | 2   | 0   | 0   | —        | —    | —   | The sentence has three semicolons. We stop there.                     |
| unrelated-q | email   | Take it to email  | email     | —        | —          | 0   | 0   | 0   | —        | —    | —   | The toaster gets its own thread. Nobody subscribes.                   |

### another-meeting

| Presentation | Variant when | Speaker | Opening line                                     | Response set    |
| ------------ | ------------ | ------- | ------------------------------------------------ | --------------- |
| base         | —            | gary    | I think we need another meeting to discuss this. | another-meeting |

| Set             | ID      | Label                | Technique | Requires | Reason key | Min | P   | R   | Callback | Join | End | Outcome line                                              |
| --------------- | ------- | -------------------- | --------- | -------- | ---------- | --- | --- | --- | -------- | ---- | --- | --------------------------------------------------------- |
| another-meeting | hear    | Discuss the agenda   | hear      | —        | —          | 8   | 2   | 0   | —        | —    | —   | We have drafted an agenda for discussing this agenda.     |
| another-meeting | timebox | Decide the next step | timebox   | —        | —          | 3   | 3   | 0   | —        | —    | —   | The next step is to finish the meeting we are already in. |
| another-meeting | park    | Park the invitation  | park      | —        | —          | 1   | 0   | 0   | —        | —    | —   | Gary's proposed meeting becomes a sticky note instead.    |

### circle-back

| Presentation | Variant when   | Speaker | Opening line                                                   | Response set |
| ------------ | -------------- | ------- | -------------------------------------------------------------- | ------------ |
| base         | —              | morgan  | Can we circle back to this?                                    | circle-back  |
| variant 1    | absent: morgan | priya   | Morgan left a note asking us to circle back. To what, exactly? | circle-back  |

This is a vague tangent, so postponing adds no launch risk. Its callback is still
real meeting work. Both presentations share the complete set below.

| Set         | ID      | Label                   | Technique | Requires | Reason key | Min | P   | R   | Callback           | Join | End | Outcome line                                                    |
| ----------- | ------- | ----------------------- | --------- | -------- | ---------- | --- | --- | --- | ------------------ | ---- | --- | --------------------------------------------------------------- |
| circle-back | hear    | Find the original point | hear      | —        | —          | 6   | 1   | 0   | —                  | —    | —   | We locate the original point. It was a formatting suggestion.   |
| circle-back | timebox | Close the loop now      | timebox   | —        | —          | 2   | 0   | 0   | —                  | —    | —   | The circle is closed. The launch decision is still ahead of us. |
| circle-back | park    | Circle back later       | park      | —        | —          | 1   | 0   | 0   | circle-back-return | —    | —   | Added to the parking lot. This circle has a return address.     |

### where-we-stand

| Presentation | Variant when | Speaker | Opening line                                                     | Response set |
| ------------ | ------------ | ------- | ---------------------------------------------------------------- | ------------ |
| base         | —            | priya   | Okay. Where do we actually stand?                                | stand-clear  |
| variant 1    | minRisks: 1  | priya   | Where do we stand? The parking lot still has launch risks in it. | stand-risk   |

| Set         | ID      | Label                  | Technique | Requires       | Reason key   | Min | P   | R   | Callback | Join | End | Outcome line                                                         |
| ----------- | ------- | ---------------------- | --------- | -------------- | ------------ | --- | --- | --- | -------- | ---- | --- | -------------------------------------------------------------------- |
| stand-clear | hear    | Check the launch gates | hear      | present: priya | priya-absent | 6   | 18  | 0   | —        | —    | —   | Priya checks the launch gates. We agree what ready actually means.   |
| stand-clear | owner   | Assign the decision    | owner     | present: priya | priya-absent | 4   | 16  | 0   | —        | —    | —   | Priya owns the go/no-go checklist. Nobody owns a new slide deck.     |
| stand-clear | refocus | Return to the decision | refocus   | —              | —            | 2   | 12  | 0   | —        | —    | —   | Friday. Go or no-go. The room remembers why it is here.              |
| stand-risk  | hear    | Check the launch gates | hear      | present: priya | priya-absent | 6   | 18  | -1  | —        | —    | —   | Priya checks the launch gates and closes one unresolved launch risk. |
| stand-risk  | owner   | Assign the decision    | owner     | present: priya | priya-absent | 4   | 16  | 0   | —        | —    | —   | Priya owns the checklist. The parked risks still need answers.       |
| stand-risk  | refocus | Return to the decision | refocus   | —              | —            | 2   | 6   | 0   | —        | —    | —   | The question is clearer. The unanswered risks are still unanswered.  |

### support-training

| Presentation | Variant when | Speaker | Opening line                                                                 | Response set    |
| ------------ | ------------ | ------- | ---------------------------------------------------------------------------- | --------------- |
| base         | —            | sam     | Support hasn't seen the release notes. We'd be taking calls blind on Friday. | support-present |
| variant 1    | absent: sam  | priya   | Has anyone told Support? We need a release-notes plan.                       | support-absent  |

The sample's effects and copy are retained; authored disabled reasons complete its
schema. Sam's absence removes the fast expert path, never the substantive family.

| Set             | ID      | Label          | Technique | Requires     | Reason key | Min | P   | R   | Callback          | Join | End | Outcome line                                         |
| --------------- | ------- | -------------- | --------- | ------------ | ---------- | --- | --- | --- | ----------------- | ---- | --- | ---------------------------------------------------- |
| support-present | hear    | Hear it out    | hear      | present: sam | sam-absent | 7   | 18  | 0   | —                 | —    | —   | Plan agreed: release notes out Wednesday.            |
| support-present | owner   | Name an owner  | owner     | present: sam | sam-absent | 3   | 14  | 0   | —                 | —    | —   | Sam owns it. Done.                                   |
| support-present | park    | Parking lot    | park      | —            | —          | 1   | 0   | 1   | support-follow-up | —    | —   | Another sticky note. Sam looks worried.              |
| support-absent  | timebox | Timebox a plan | timebox   | —            | —          | 5   | 8   | 0   | —                 | —    | —   | A partial plan. Someone still needs to tell Support. |
| support-absent  | park    | Parking lot    | park      | —            | —          | 1   | 0   | 1   | support-follow-up | —    | —   | Another sticky note.                                 |

### failing-tests

| Presentation | Variant when | Speaker | Opening line                                               | Response set  |
| ------------ | ------------ | ------- | ---------------------------------------------------------- | ------------- |
| base         | —            | dev     | Two regression tests are still failing.                    | tests-present |
| variant 1    | absent: dev  | priya   | Dev left two red regression tests on the launch checklist. | tests-absent  |

| Set           | ID      | Label                 | Technique | Requires     | Reason key | Min | P   | R   | Callback | Join | End | Outcome line                                                             |
| ------------- | ------- | --------------------- | --------- | ------------ | ---------- | --- | --- | --- | -------- | ---- | --- | ------------------------------------------------------------------------ |
| tests-present | hear    | Inspect both failures | hear      | present: dev | dev-absent | 8   | 22  | -1  | —        | —    | —   | Dev finds the regression and agrees the fix and verification steps.      |
| tests-present | owner   | Own the fix and rerun | owner     | present: dev | dev-absent | 5   | 18  | 0   | —        | —    | —   | Dev owns the fix and rerun before Friday. The checklist gets a name.     |
| tests-present | timebox | Accept a workaround   | timebox   | —            | —          | 3   | 18  | 1   | —        | —    | —   | The workaround unblocks launch. The regression is still real.            |
| tests-absent  | hear    | Audit the test notes  | hear      | —            | —          | 8   | 10  | -1  | —        | —    | —   | We close one documented risk. The fix still needs engineering follow-up. |
| tests-absent  | timebox | Accept a workaround   | timebox   | —            | —          | 3   | 12  | 1   | —        | —    | —   | Without Dev, the workaround rests on assumptions nobody can verify.      |
| tests-absent  | park    | Park the failures     | park      | —            | —          | 1   | 0   | 1   | —        | —    | —   | Two red tests become one unresolved launch risk.                         |

### press-date

| Presentation | Variant when   | Speaker | Opening line                                                          | Response set  |
| ------------ | -------------- | ------- | --------------------------------------------------------------------- | ------------- |
| base         | —              | morgan  | The press release says Thursday.                                      | press-present |
| variant 1    | absent: morgan | priya   | Morgan's press draft says Thursday. Our launch checklist says Friday. | press-absent  |

| Set           | ID      | Label                 | Technique | Requires        | Reason key    | Min | P   | R   | Callback | Join | End | Outcome line                                                            |
| ------------- | ------- | --------------------- | --------- | --------------- | ------------- | --- | --- | --- | -------- | ---- | --- | ----------------------------------------------------------------------- |
| press-present | legal   | Have Legal clear it   | hear      | present: legal  | legal-absent  | 6   | 20  | -1  | —        | —    | —   | Legal clears the release and the date. Friday is now legally Friday.    |
| press-present | owner   | Own the correction    | owner     | present: morgan | morgan-absent | 4   | 16  | 0   | —        | —    | —   | Morgan owns the correction and confirms the press list will get it.     |
| press-present | email   | Email a correction    | email     | —               | —             | 0   | 10  | 1   | —        | —    | —   | A correction is sent. Nobody confirms which draft the press will use.   |
| press-absent  | timebox | Check the draft dates | timebox   | —               | —             | 6   | 8   | 0   | —        | —    | —   | We mark Friday on the draft. Marketing still needs to confirm the send. |
| press-absent  | email   | Email a correction    | email     | —               | —             | 0   | 6   | 1   | —        | —    | —   | The correction leaves the room. Confirmation does not come back.        |
| press-absent  | park    | Park the mismatch     | park      | —               | —             | 1   | 0   | 1   | —        | —    | —   | Two launch dates remain in circulation. What could go wrong?            |

### p1-bug

| Presentation | Variant when | Speaker | Opening line                                                               | Response set |
| ------------ | ------------ | ------- | -------------------------------------------------------------------------- | ------------ |
| base         | —            | dev     | We just found a P1 in checkout.                                            | p1-present   |
| variant 1    | absent: dev  | priya   | Engineering flagged a P1 in checkout. Dev is no longer here to explain it. | p1-absent    |

| Set        | ID      | Label                   | Technique | Requires     | Reason key | Min | P   | R   | Callback     | Join | End | Outcome line                                                                  |
| ---------- | ------- | ----------------------- | --------- | ------------ | ---------- | --- | --- | --- | ------------ | ---- | --- | ----------------------------------------------------------------------------- |
| p1-present | hear    | Triage with Dev         | hear      | present: dev | dev-absent | 8   | 20  | -1  | —            | —    | —   | Dev isolates the checkout failure. Fix, rollback and verification are agreed. |
| p1-present | timebox | Launch with a guardrail | timebox   | —            | —          | 3   | 16  | 1   | —            | —    | —   | A guardrail is agreed quickly. Checkout still has an unresolved failure.      |
| p1-present | park    | Park the P1             | park      | —            | —          | 1   | 0   | 1   | p1-follow-up | —    | —   | The P1 enters the parking lot. It will not stay politely parked.              |
| p1-absent  | hear    | Read the incident notes | hear      | —            | —          | 9   | 10  | -1  | —            | —    | —   | The notes settle one known risk. We still lack Dev's full diagnosis.          |
| p1-absent  | timebox | Launch with a guardrail | timebox   | —            | —          | 5   | 10  | 1   | —            | —    | —   | The guardrail is based on secondhand details. Checkout remains a risk.        |
| p1-absent  | park    | Park the P1             | park      | —            | —          | 1   | 0   | 1   | p1-follow-up | —    | —   | The P1 enters the parking lot. It will not stay politely parked.              |

### legal

| Presentation | Variant when   | Speaker | Opening line                                               | Response set  |
| ------------ | -------------- | ------- | ---------------------------------------------------------- | ------------- |
| base         | —              | morgan  | We should probably get Legal involved.                     | legal-arrival |
| variant 1    | absent: morgan | priya   | Morgan left, but the launch still needs Legal in the room. | legal-arrival |

Every choice admits Legal once. No choice supplies a completed legal review;
these are facilitation choices about defining the incoming person's remit.

| Set           | ID      | Label                    | Technique | Requires | Reason key | Min | P   | R   | Callback | Join  | End | Outcome line                                                             |
| ------------- | ------- | ------------------------ | --------- | -------- | ---------- | --- | --- | --- | -------- | ----- | --- | ------------------------------------------------------------------------ |
| legal-arrival | hear    | Explain the whole launch | hear      | —        | —          | 8   | 8   | 0   | —        | legal | —   | Legal joins and receives the full history, including the adapter search. |
| legal-arrival | timebox | Define Legal's remit     | timebox   | —        | —          | 4   | 6   | 0   | —        | legal | —   | Legal joins with a focused launch checklist and a reason to stay.        |
| legal-arrival | email   | Send Legal the brief     | email     | —        | —          | 0   | 0   | 0   | —        | legal | —   | Legal joins with the brief in their inbox. The review is still ahead.    |

### vp-joins

| Presentation | Variant when | Speaker | Opening line      | Response set |
| ------------ | ------------ | ------- | ----------------- | ------------ |
| base         | —            | vp      | Mind if I sit in? | vp-arrival   |

The VP is the designated arrival speaker and can speak at the door before joining.
Every response joins the VP; none of them means refusing entry.

| Set        | ID      | Label                    | Technique | Requires | Reason key | Min | P   | R   | Callback | Join | End | Outcome line                                                            |
| ---------- | ------- | ------------------------ | --------- | -------- | ---------- | --- | --- | --- | -------- | ---- | --- | ----------------------------------------------------------------------- |
| vp-arrival | hear    | Give the full recap      | hear      | —        | —          | 8   | 8   | 0   | —        | vp   | —   | The VP joins. We recap the recap so the recap has executive visibility. |
| vp-arrival | timebox | Give a decision brief    | timebox   | —        | —          | 3   | 5   | 0   | —        | vp   | —   | The VP joins, hears the decision brief and asks for the launch gate.    |
| vp-arrival | park    | Save questions for later | park      | —        | —          | 1   | 0   | 0   | —        | vp   | —   | The VP joins. Their questions join the parking lot.                     |

### room-booked

| Presentation | Variant when | Speaker | Opening line                     | Response set |
| ------------ | ------------ | ------- | -------------------------------- | ------------ |
| base         | —            | room    | We have this room at :45, right? | room-booked  |

The knock is a narrator, not another billed attendee. Every response explicitly
sets 45 or keeps 60. Negotiation never extends the original hour.

| Set         | ID      | Label                 | Technique | Requires    | Reason key | Min | P   | R   | Callback | Join | End | Outcome line                                                      |
| ----------- | ------- | --------------------- | --------- | ----------- | ---------- | --- | --- | --- | -------- | ---- | --- | ----------------------------------------------------------------- |
| room-booked | hear    | Check the reservation | hear      | —           | —          | 5   | 0   | 0   | —        | —    | 60  | The reservation says an hour. The next team finds another room.   |
| room-booked | timebox | Agree to leave at :45 | timebox   | —           | —          | 1   | 0   | 0   | —        | —    | 45  | We agree to leave at :45. The clock has become more persuasive.   |
| room-booked | vp      | Let the VP handle it  | owner     | present: vp | vp-absent  | 1   | 0   | 0   | —        | —    | 60  | The VP mentions their calendar. The next team finds another room. |

The reservation trap is intentional: without the VP, keeping the hour via hear is
the costliest, lowest-scored choice because immediate utility does not value the
booking end; the player pays for those extra minutes in decision quality.
With the VP present, vp keeps 60 at the same one-minute utility as timebox.
The tie-break selects timebox (`timebox` precedes `vp` in ASCII order), so the VP
option helps human players without changing Greedy's choice. Keep P = 0 and ID vp;
do not retune this deliberate trade-off merely to make simulation targets pass.

### pre-read

| Presentation | Variant when | Speaker | Opening line                         | Response set |
| ------------ | ------------ | ------- | ------------------------------------ | ------------ |
| base         | —            | priya   | Everyone actually read the pre-read. | pre-read     |

| Set      | ID  | Label             | Technique | Requires | Reason key | Min | P   | R   | Callback | Join | End | Outcome line                                             |
| -------- | --- | ----------------- | --------- | -------- | ---------- | --- | --- | --- | -------- | ---- | --- | -------------------------------------------------------- |
| pre-read | ack | Enjoy the miracle | ack       | —        | —          | 1   | 20  | 0   | —        | —    | —   | We skip the summary. Nobody asks which document we mean. |

### aligned

| Presentation | Variant when | Speaker | Opening line                                                          | Response set |
| ------------ | ------------ | ------- | --------------------------------------------------------------------- | ------------ |
| base         | —            | dev     | Honestly? I think we're all aligned.                                  | aligned      |
| variant 1    | absent: dev  | priya   | Dev's notes match our checklist. Honestly, I think we're all aligned. | aligned      |

| Set     | ID  | Label                | Technique | Requires | Reason key | Min | P   | R   | Callback | Join | End | Outcome line                                          |
| ------- | --- | -------------------- | --------- | -------- | ---------- | --- | --- | --- | -------- | ---- | --- | ----------------------------------------------------- |
| aligned | ack | Record the agreement | ack       | —        | —          | 1   | 15  | -1  | —        | —    | —   | Agreement recorded. One loose end is finally tied up. |

### circle-back-return

| Presentation | Variant when   | Speaker | Opening line                                                              | Response set  |
| ------------ | -------------- | ------- | ------------------------------------------------------------------------- | ------------- |
| base         | —              | morgan  | We circled back. I still want to discuss the slide formatting.            | circle-return |
| variant 1    | absent: morgan | priya   | Morgan's formatting note is back. The launch still has the same deadline. | circle-return |

| Set           | ID      | Label                 | Technique | Requires | Reason key | Min | P   | R   | Callback | Join | End | Outcome line                                                 |
| ------------- | ------- | --------------------- | --------- | -------- | ---------- | --- | --- | --- | -------- | ---- | --- | ------------------------------------------------------------ |
| circle-return | hear    | Review the formatting | hear      | —        | —          | 6   | 1   | 0   | —        | —    | —   | The headings are now consistent. Friday is no closer.        |
| circle-return | timebox | Close the format note | timebox   | —        | —          | 1   | 0   | 0   | —        | —    | —   | We close the formatting note. No second circle is scheduled. |

### support-follow-up

| Presentation | Variant when | Speaker | Opening line                                                           | Response set           |
| ------------ | ------------ | ------- | ---------------------------------------------------------------------- | ---------------------- |
| base         | —            | sam     | That parked release-notes plan? Support still needs it before Friday.  | support-return-present |
| variant 1    | absent: sam  | priya   | Support's parked release-notes plan is back. Sam isn't here to own it. | support-return-absent  |

| Set                    | ID      | Label                    | Technique | Requires     | Reason key | Min | P   | R   | Callback | Join | End | Outcome line                                                                 |
| ---------------------- | ------- | ------------------------ | --------- | ------------ | ---------- | --- | --- | --- | -------- | ---- | --- | ---------------------------------------------------------------------------- |
| support-return-present | owner   | Give Sam the follow-up   | owner     | present: sam | sam-absent | 4   | 14  | -1  | —        | —    | —   | Sam owns the briefing and closes the release-notes risk.                     |
| support-return-present | hear    | Review the briefing      | hear      | present: sam | sam-absent | 8   | 18  | -1  | —        | —    | —   | Sam walks us through the briefing. Support will not learn from social media. |
| support-return-present | timebox | Draft a minimal briefing | timebox   | —            | —          | 5   | 8   | 0   | —        | —    | —   | A draft exists. Getting it to Support is still an open risk.                 |
| support-return-absent  | hear    | Finish the written plan  | hear      | —            | —          | 9   | 10  | -1  | —        | —    | —   | We finish the written plan and close one risk without Sam's shortcut.        |
| support-return-absent  | timebox | Draft a minimal briefing | timebox   | —            | —          | 5   | 8   | 0   | —        | —    | —   | A draft exists. Getting it to Support is still an open risk.                 |

### p1-follow-up

| Presentation | Variant when | Speaker | Opening line                                                              | Response set      |
| ------------ | ------------ | ------- | ------------------------------------------------------------------------- | ----------------- |
| base         | —            | dev     | The parked checkout P1 is back. Customers will not use the parking lot.   | p1-return-present |
| variant 1    | absent: dev  | priya   | The checkout P1 is still open. We released the person with the diagnosis. | p1-return-absent  |

| Set               | ID      | Label                    | Technique | Requires     | Reason key | Min | P   | R   | Callback | Join | End | Outcome line                                                         |
| ----------------- | ------- | ------------------------ | --------- | ------------ | ---------- | --- | --- | --- | -------- | ---- | --- | -------------------------------------------------------------------- |
| p1-return-present | hear    | Finish Dev's triage      | hear      | present: dev | dev-absent | 9   | 20  | -1  | —        | —    | —   | Dev finishes triage. The fix and rollback close the checkout risk.   |
| p1-return-present | owner   | Own fix verification     | owner     | present: dev | dev-absent | 5   | 16  | -1  | —        | —    | —   | Dev owns verification. Checkout finally leaves the parking lot.      |
| p1-return-present | timebox | Keep the guardrail       | timebox   | —            | —          | 3   | 10  | 0   | —        | —    | —   | The guardrail stays. So does the unresolved checkout risk.           |
| p1-return-absent  | hear    | Finish the incident plan | hear      | —            | —          | 10  | 10  | -1  | —        | —    | —   | The written incident plan closes one risk, slowly and without Dev.   |
| p1-return-absent  | timebox | Keep the guardrail       | timebox   | —            | —          | 4   | 6   | 0   | —        | —    | —   | We keep the secondhand guardrail. Checkout still needs verification. |

### filler

| Presentation | Variant when | Speaker | Opening line     | Response set |
| ------------ | ------------ | ------- | ---------------- | ------------ |
| base         | —            | room    | Awkward silence. | filler       |

| Set    | ID  | Label                    | Technique | Requires | Reason key | Min | P   | R   | Callback | Join | End | Outcome line                                    |
| ------ | --- | ------------------------ | --------- | -------- | ---------- | --- | --- | --- | -------- | ---- | --- | ----------------------------------------------- |
| filler | ack | Wait through the silence | ack       | —        | —          | 2   | 0   | 0   | —        | —    | —   | Someone caps a marker. Two minutes have passed. |

## Disabled reasons

Every conditional response refers to an authored nonempty key. Priya's key is
included for schema completeness; no permitted release can make it visible.

| Key           | Copy                                                           |
| ------------- | -------------------------------------------------------------- |
| dev-absent    | Dev has left. Engineering expertise is no longer in the room.  |
| sam-absent    | Sam has left. Support expertise is no longer in the room.      |
| morgan-absent | Morgan has left. Marketing expertise is no longer in the room. |
| priya-absent  | Priya must be present to own the launch decision.              |
| legal-absent  | Legal isn't in the room. Nobody can clear the claims.          |
| vp-absent     | The VP isn't in the room. Nobody here outranks the next team.  |

## Epilogues

The four endings use six lines because a decision has three risk tiers. These
retain the design's example copy as the approved final copy. Tier selection uses
the final authoritative risk counter, never the log.

| Key                 | Ending       | Risk condition | Line                                                                                 |
| ------------------- | ------------ | -------------- | ------------------------------------------------------------------------------------ |
| decision-clean      | decision     | R = 0          | Friday's launch goes smoothly. Nobody remembers the meeting. The highest compliment. |
| decision-loose-ends | decision     | R = 1–2        | Friday's launch goes ahead. A few loose ends become Monday's problem.                |
| decision-risky      | decision     | R = 3–5        | Support learned about the launch from social media.                                  |
| called-early        | called-early | any            | Decision deferred to a follow-up meeting. Invite sent.                               |
| time-expired        | time-expired | any            | The next team is standing at the glass door.                                         |
| cancelled           | cancelled    | any            | This could've been an email. It is now an email.                                     |

## Results heading and moments copy handoff

For task 07b's `core/content/copy.ts`, the design's exact fixed copy is approved:
fallback heading “Decision Made”; cancellation without a moment “No meeting
moments. Just an email.”; decision without a moment “The meeting ended with a
decision.”; other endings without a moment “The decision will need another
meeting.” These are separate from the ending epilogues.

Task 15 must author the dynamic release, parked-item and arrival moment templates
in `core/content/copy.ts`, each at most 90 Unicode code points after substitution,
with no ad hoc UI strings. The design's release example (“Gary was released at
minute 3.”) establishes the wording for release moments. Parking/arrival templates
still need authorship and review in task 15; this task does not invent their copy.
Use the design's first-release → first-park → first-arrival priority and log order,
and test longest attendee names and elapsed-minute values before shipping.

## Hand walkthroughs and review evidence

These are constructed possible draws, not seeded simulations or claims of median
behaviour. All weighted candidate choices have positive probability; uncommon
negative events are separated by common draws. Effects and billing follow the
existing engine; no new rule is introduced. The normal example uses no rare gifts.

### A careful ten-turn decision

Release Gary and Jordan before drawing; H = 4, with Priya, Dev, Sam and Morgan
retained. The first two draws are unrestricted common substantive families. Use
the base presentations; risk remains zero throughout. Legal joins at T = 15;
its four minutes bill the old H = 4. The VP joins after minute 15; release each
new arrival immediately after its response, returning H to 4 at no meeting cost.

| Draw turn | Family / response        | Delta P | Min | H billed | P after | T after | R after | Total person-minutes |
| --------- | ------------------------ | ------- | --- | -------- | ------- | ------- | ------- | -------------------- |
| 0         | where-we-stand / hear    | 18      | 6   | 4        | 18      | 6       | 0       | 24                   |
| 1         | support-training / owner | 14      | 3   | 4        | 32      | 9       | 0       | 36                   |
| 2         | hdmi / park              | 0       | 1   | 4        | 32      | 10      | 0       | 40                   |
| 3         | failing-tests / owner    | 18      | 5   | 4        | 50      | 15      | 0       | 60                   |
| 4         | legal / timebox          | 6       | 4   | 4        | 56      | 19      | 0       | 76                   |
| 5         | press-date / owner       | 16      | 4   | 4        | 72      | 23      | 0       | 92                   |
| 6         | p1-bug / hear            | 20      | 8   | 4        | 92      | 31      | 0       | 124                  |
| 7         | circle-back / timebox    | 0       | 2   | 4        | 92      | 33      | 0       | 132                  |
| 8         | vp-joins / timebox       | 5       | 3   | 4        | 97      | 36      | 0       | 144                  |
| 9         | tv-no-signal / timebox   | 3       | 2   | 4        | 100     | 38      | 0       | 152                  |

Result: **decision, P = 100, R = 0, T = 38 < 60, 152 person-minutes**. The choices
mix hear, owner, park and timebox. Releasing arrivals is optional for feasibility:
retaining both still gives the same P/R/T, with 173 person-minutes and peak H = 6.
The review's Legal and VP responses do not alter this constructed route: it still
chooses press-date / owner and never draws room-booked. Keeping Legal now also
enables an alternative on press-date; immediate release is no longer a free
improvement in every possible subsequent draw.
This checks the requested approximate ten-turn route within the hour. It does not
establish Greedy/Random bands, title reachability or technique frequencies.

### Callbacks and expert absence

From a fresh H = 4 state (Gary/Jordan released), park support-training at turn 0:
P = 0, R = 1, T = 1, callback due at draw 2. Resolve where-we-stand / refocus at
turn 1 using the risk presentation: P = 6, R = 1, T = 3. Release Sam. Draw 2 is
support-follow-up's absence presentation; hear gives P = 16, R = 0, T = 12.
It costs 9 × 3 = 27 person-minutes, rather than the expert owner path's 4 × 4 = 16.
The preceding resolutions cost 4 + 8, so the absence route totals 39 person-minutes.

For p1-bug, first resolve where-we-stand and support-training, then park p1-bug
at turn 2; its callback is due at draw 4 after exactly one intervening event.
Release Dev before that due draw to select p1-follow-up's absence presentation.
For circle-back, park it after the first two substantive draws; draw n+2 delivers
circle-back-return, with Priya speaking if Morgan was released. All three targets
have always-enabled options, no callback chains and no zero-minute responses.
Ending before the due draw suppresses the callback under the existing rules.

For release during dialogue, draw support-training with Sam present, then release
Sam: the delivered line stays; hear/owner now return sam-absent, while park remains
available and schedules the same target. The same requirement pattern protects
Dev's engineering options and Morgan's marketing options. Selecting an absence
variant never reintroduces an unavailable expert response.

### Constructed variant coverage for later transcription tests

Each scenario starts before its family has been seen. For substantive families,
the first-two guard permits their draw immediately; for other families first
resolve two different substantive events without ending. Candidate lookup, not
seed guessing, can establish eligibility in task 07 tests.

| Variant                | Constructed pre-draw condition                                                       |
| ---------------------- | ------------------------------------------------------------------------------------ |
| hdmi / 1               | Release Dev; draw hdmi after the first two substantive events.                       |
| tv-no-signal / 1       | Release Morgan; draw tv-no-signal after the first two.                               |
| circle-back / 1        | Release Morgan; draw circle-back after the first two.                                |
| where-we-stand / 1     | Park support-training first; draw where-we-stand at turn 1 with R = 1.               |
| support-training / 1   | Release Sam before the first draw; support remains eligible.                         |
| failing-tests / 1      | Release Dev before the first draw; failing-tests remains eligible.                   |
| press-date / 1         | Release Morgan before the first draw; press-date remains eligible.                   |
| p1-bug / 1             | Release Dev; p1-bug remains a substantive candidate, including in the first two.     |
| legal / 1              | Release Morgan; legal is eligible after the first two and joins Legal on any choice. |
| aligned / 1            | Release Dev; draw aligned after the first two.                                       |
| circle-back-return / 1 | Park circle-back, release Morgan and reach its due turn without ending.              |
| support-follow-up / 1  | Park support-training, release Sam and reach its due turn without ending.            |
| p1-follow-up / 1       | Park p1-bug, release Dev and reach its due turn without ending.                      |

For the new conditional responses, keep Morgan present and join Legal before
press-date: legal is enabled. Before Legal joins or after Legal is released,
that response is disabled with legal-absent; owner and email retain their existing
requirements and effects. Drawing press-date while Morgan is absent still uses
the unchanged press-absent set.

Join the VP before room-booked: vp is enabled and keeps 60. Before the VP joins
or after the VP is released, it is disabled with vp-absent; hear and timebox stay
enabled. Release either arrival during its later pending event to verify the
delivered presentation remains fixed while the conditional choice is disabled.

The four booking boundary cases for committed task 07b tests are: at minute 44,
hear keeps 60 and remains running at 49; timebox sets 45 and expires at 45; at
minute 46, timebox expires at 47 after the full response; at minute 44 with the
VP present, vp keeps 60 and remains running at 45. Filler explicitly acknowledges +2
minutes and eventually expires an exhausted run, without adding a forced turn cap.

## Approval and handoff

**Harry approved this table on October 12, 2026:** “Table is approved. Wrap up
this task before I get Claude to review.” No content revisions were requested.
Task 06b's authorship, local verification and D18 approval criteria are complete.
The subsequent [Claude review](task-06b-review-20261012T190907-6e3d.md) and Harry's
instruction to “Review, address and implement Claude's review” authorize the
specified review revisions: Legal's press clearance, the VP's room intervention,
the intentional reservation trap and the clarity/handoff fixes. This records the
current authorization for those revisions separately from the initial approval.

The next blueprint task is **07a**, the content validator and index.
Task 07b then transcribes this table and binds the live draw/candidate wrappers.
No task 07 implementation belongs in this task. Statistical balance, release
device evidence and final UI copy outside this table remain with their scheduled
tasks; the existing design remains the source for roster and collectible titles.

For task 08a, report the reservation trap as an intentional diagnostic. Greedy and
Reckless accept :45 with or without the VP because of utility and the tie-break;
Random may choose either deadline. Do not assume every Lookahead choice is fixed:
the design's next-step term becomes zero when a choice ends the run, so imminent
expiry can change its comparison. Confirm that policy with the actual task 09
implementation rather than changing the scoring formula or these response IDs.

## Task 12a — V4 feedback handoff

The text-only loop and automated meeting-loop checks are implemented. Harry
agreed on October 12, 2026 to play and arrange two uncoached testers. Actual goal
comprehension, issue classification and confusing-line observations are pending
in [the V4 record](task-12a-playtest.md). No human findings or event-content
revisions are claimed yet. Record reported findings here before task 10 tuning;
retain the existing approval process for any resulting event-design changes.
