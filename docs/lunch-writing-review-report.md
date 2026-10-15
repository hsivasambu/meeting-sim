# L02b — Lunch writing review report

Date: October 13, 2026 (America/Toronto). Reviewer: Codex, GPT-6-based assistant;
no more specific model identifier is exposed in this session. This is a single AI
editorial pass, not an independent second reviewer or human humour study.

Status: **L02b review and D18 content approved by Harry on October 14, 2026.**
Input: `lunch-l02-draft-2` at commit `55d037e40b215c3286fe873500de67466dbb5f7c`.
Output: **`lunch-l02b-reviewed-2`** (includes the review addendum below), the [complete revised table](content-table.md).
The complete output is pinned at content commit
`7efc2d19a65e5519063f2be653b2f02e438f326f` in
[draft PR #18](https://github.com/hsivasambu/meeting-sim/pull/18); later delivery
notes do not change its table. Followed [the review brief](lunch-writing-review.md),
CLAUDE.md, the implementation plan, design, tech spec, approved redesign and
accepted ADRs 0001–0008. ADRs 0005–0008 remain accepted without repeat approval.

## Harry’s L02b and D18 approval — October 14, 2026

Harry explicitly approved: “Approve L02b and D18”. This accepts the completed
L02b review and the complete table revision `lunch-l02b-reviewed-2`, whose
player-facing content is pinned at `7efc2d19a65e5519063f2be653b2f02e438f326f`
in PR #18. Approval covers the authored copy/catalogs, initial effects/weights,
conditions and relationships, including D1’s present uncertainty tradeoffs and
D2’s two expert-dependent responses per entrant. D3’s intentional room-booking
tradeoff remains unchanged. No values are altered by recording this approval.

These are approved initial content values, not evidence of balance. L11/L12
still measure policy selection and tune under the existing reports, targets and
change-control rules; the illustrative 80/20 is not adopted. The L02b/D18 content
prerequisite for L05/L06/L07 is satisfied; their other dependencies still apply.
This approval does not merge a PR, activate lunch before L08, accept L09 human
evidence or complete original task 12a V4. Earlier pending-approval statements
in dated execution records describe their historical status and are superseded
by this explicit approval.

## Editorial conclusion and voice notes

The draft's strongest material is people protecting status while supposedly
choosing lunch: Gary's unchanged position, Jordan thanking people for reading
name cards, Pat recognising another room once seniority is mentioned. Keep these.
The weakest recurring devices were personified equipment, interchangeable
fact-plus-narrator endings, and Gary supplying jokes in everyone else's scenes.
The revisions favour observable behaviour, short direct requests and character
reactions. Straight dietary checks, instructions and error messages stay clear.
No claim is made that these jokes land with players; L09 must establish that.

| Voice  | Reviewed direction and distinction                                                                                                                              |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Priya  | Ask for the exact decision, redirect politely, protect time. Short personal boundaries distinguish her from the narrator.                                       |
| Dev    | Say what is missing or what was checked. Let practical preparation expose the room's habits; equipment does not speak for Dev.                                  |
| Sam    | Ask plainly for a proper meal or mild option; patience thins after postponement. The need is legitimate and the evasive process is the joke.                    |
| Morgan | Turn tentative sentiment into a confident summary. Retreat through qualifications such as almost and interim; the away-day claim supplies misplaced confidence. |
| Gary   | Own precedent and the last word; concede while denying a changed position. Retain the envelope and soup theory, reduce appearances in other people's scenes.    |
| Jordan | Perform inclusion and organise things nobody requested. Keep the seating chart, proposed membership and circulation offer; useful compromise is still possible. |
| Alex   | Read the wording and ask a precise question. Correct the discussion with restraint; being invited is no guarantee of a better immediate choice.                 |
| Pat    | Offer warm, senior certainty, request context and repeat the suggestion as help. Joining is a cost as well as a possible contribution.                          |
| room   | Describe what happened and occasionally expose the social absurdity. No invented vote totals, speech durations or secret food-price assumptions.                |

## Complete event and branch coverage

Each entry covers its opening(s), every label and description, requirements/reason
context, and each outcome listed below. A slash after a response identifies its
outcome ID; each comma-separated outcome was read separately. All 21 event groups,
22 presentations, 54 choices and 57 outcomes were reviewed, including retained copy.
An unchanged line is an editorial keep, not an omitted review.

| Group             | Presentations reviewed | Every response/outcome reviewed                                    | Decision / keep rationale                                                                                                                                                                                 |
| ----------------- | ---------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| nominate-cuisine  | base                   | italian/nominated, mexican/nominated, thai/nominated               | Keep the six-adult opening and action labels. Three descriptions now vary without implying different value. Priya anticipates objections rather than borrowing Gary.                                      |
| menu-needs        | base                   | hear/checked, invite/helpful, invite/more-questions, park/deferred | Keep Sam's decorative-salad setup and both actual branch explanations. Clarify that Alex stays and raises later cost; park explicitly promises a return.                                                  |
| lunch-window      | base, variant-1        | hear/checked, pat/protected, timebox/bounded                       | Both presentations reviewed. Remove invented calendar action; direct request belongs to Priya. Keep Pat's protection distinct from unanimity and the shorter check incomplete.                            |
| portion-plan      | base                   | owner/individual, hear/discussed, email/sent                       | Keep Jordan's unneeded seating chart and personal-loss ending. Replace Gary cameo with Jordan accepting separate meals. Email still leaves details open.                                                  |
| quick-agreement   | base                   | refocus/momentum, refocus/objections, hear/heard, invite/briefed   | Morgan now treats leaning as broad support and qualifies the summary after hearing concerns. Keep both nod/objection branches and the explicit longer setback warning. Pat still joins deterministically. |
| projector         | base                   | hear/searched, timebox/shared, park/skipped                        | Keep practical cable setup and cupboard-search gag. Replace supervising/negotiated screen endings with people leaning in or returning to lunch. No missing-menu claim.                                    |
| introductions     | base                   | hear/introduced, timebox/brief, refocus/returned                   | Keep name-card reading and thanks-for-sharing: specific performative inclusion. Remove universal familiarity claims. Three choices retain different courtesy/time benefits.                               |
| soup-debate       | base                   | hear/theory, refocus/returned, park/promised                       | Keep all copy: the mug witness is earned absurdity inside Gary's theory, not a constant talking-object device. Refocus leaves classification unresolved; park promises the callback.                      |
| lunch-history     | base                   | hear/history, timebox/relevant, email/requested                    | Keep envelope, appendix and relevant-detail lines: Gary owns the archive. Plain description and conditional email offer add territorial behaviour without scheduling a callback.                          |
| lunch-committee   | base                   | hear/committee, owner/summary, park/aside                          | Keep larger group choosing a smaller group as the one main process-recursion setup. Jordan now offers circulation or keeps a membership list instead of echoing Gary's authority.                         |
| chair-arrangement | base                   | hear/moved, refocus/seated                                         | Away-day confidence grounds Morgan's dubious technique. Keep the circular-conversation outcome and interim-arrangement response: earned visual metaphor and evasive summary.                              |
| spice-question    | base                   | hear/checked, timebox/clear, timebox/unclear, park/deferred        | Keep Sam's request as legitimate information. Both clear/unclear outcomes explain events. Description explicitly cues lost momentum and extra time; park promises a return.                               |
| alex-arrives      | base                   | hear/joined, timebox/joined                                        | Alex asks for exact wording, then tolerates a long history or requests the question directly. Neither ending depends on a prior projector draw; both welcome Alex permanently.                            |
| pat-arrives       | base                   | hear/joined, timebox/joined, park/joined                           | Pat confidently offers to simplify. Full recap outcome no longer claims an attempt to avoid that chosen recap. Short nod stays; postponed questions do not promise an engine callback.                    |
| room-booked       | base                   | hear/confirmed, timebox/shortened, vp/protected                    | Keep conflict and reservation/Pat endings. New earlier-finish line works even past minute 45. Descriptions honestly distinguish keeping an hour from accepting 45; no editorial retuning.                 |
| menu-read         | base                   | ack/used                                                           | Keep all: Dev's actual preparation is a welcome straight setup with one earned office observation. Single acknowledgement remains explicit.                                                               |
| small-concession  | base                   | ack/accepted                                                       | Keep all: Gary saves face over a real concession. His insistence on an unchanged position is a different joke from irrelevant precedent.                                                                  |
| menu-return       | base                   | hear/finished, owner/explained, timebox/read                       | Keep explicit postponed-meal opening and hear/timebox wording. Alex ending now lets Sam express earned impatience. No need is ridiculed; all options address the question.                                |
| soup-return       | base                   | hear/heard, refocus/closed                                         | Keep promised-last-word and three-opening-remarks escalation. Short closure gives Gary acknowledgement without pretending to settle the theory or ordering another return.                                |
| spice-return      | base                   | hear/finished, owner/explained, timebox/read                       | Keep information-versus-encouragement setup, expert detail and shorter wording check. Full check now lets Sam speak instead of personifying a whiteboard.                                                 |
| filler            | base                   | ack/waited                                                         | Replace talking clock with shared avoidance of responsibility. Keep capped-marker outcome: low-key breathing room, no progress or automatic advance implied.                                              |

## Catalog and other copy coverage

All rows in the following groups were read for humour, clarity, facts and limits.
Plain labels and recovery text are deliberately retained: they do not need an
extra joke between the player and the next action. Topic labels are short factual
references, never a new risk meter. Stable identity and legacy names are retained.

| Group                                  | Every reviewed key / ID                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Findings and disposition                                                                                                                                                                                                                                |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cuisine catalog (3)                    | italian, mexican, thai                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Keep Italian/Mexican/Thai: ordinary cuisine names, no stereotypes or mechanical superiority.                                                                                                                                                            |
| Attendees and voice guide (8)          | priya, dev, sam, morgan, gary, jordan, legal, vp                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | All names, roles and voice notes retained; distinct directions above.                                                                                                                                                                                   |
| Disabled reasons (4)                   | alex-present, pat-present, alex-absent, pat-absent                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | All four retained. Present reasons explain duplicate invitations; absent reasons give an available alternative.                                                                                                                                         |
| Title catalog (12)                     | inbox-zero, efficient-facilitator, lunch-agreed, death-by-diligence, table-for-six, reply-all-royalty, parking-lot-attendant, second-helping, played-it-right, take-this-offline, calendar-criminal, could-have-been-an-email                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | All twelve names, flavour lines and predicates reviewed. Revise lunch-agreed and second-helping; retain the other ten, including failure-only judgement and cancellation wording. Legacy names/IDs in the following prose also reviewed and unchanged.  |
| Epilogues and factual moments (4)      | decision, called-early, time-expired, cancelled                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | All four endings reviewed. Success names actual cuisine; simplify its closing wish. Three failures clearly say no agreement.                                                                                                                            |
| Epilogues and factual moments (6)      | menu-needs / park, projector / park, soup-debate / park, lunch-committee / park, spice-question / park, pat-arrives / park                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | All six topic substitutions reviewed; colon grammar works for big screen and Pat's questions as well as preferences.                                                                                                                                    |
| Epilogues and factual moments (6)      | first-postponed, first-arrival, decision-fallback, early-fallback, expiry-fallback, cancel-fallback                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | All six moments retained. Minute is elapsed meeting time; first-postponed/arrival may accompany any ending and make no false agreement claim.                                                                                                           |
| Interface, results and share copy (78) | product-title, objective, premise, start, loading, load-failed, retry, meeting, instructions-action, instructions-cost, instructions-chance, keyboard, show-choices, continue, call-it, call-it-description, roster, room-speaker, room-accessible, progress, minutes, booking, remaining, cost, cost-explanation, considering-empty, considering, headcount, peak-headcount, postponed, results, score, outcome-component, efficiency-component, decisions-component, choices-explanation, actual-explanation, success-result, success-summary, failure-result, failure-nomination, failure-no-nomination, ended-decision, ended-called-early, ended-time-expired, ended-cancelled, fallback-decision-heading, fallback-failure-heading, moment, replay, current-collection, legacy-collection, legacy-explanation, collection-count, locked-title, newly-earned, share, download, copy-text, copied, clipboard-fallback, save-image, share-unavailable, share-failed, share-success, share-early, share-expired, share-cancelled, share-nomination, share-score, share-time, share-cost, share-peak, share-seed, share-revision, replay-caveat, error, error-restart | Every interface/results/share field reviewed, including error/recovery, collection, accessibility and replay caveat. Revise only instructions-action and choices-explanation; keep concise controls and all cuisine-aware success/failure distinctions. |
| Fourth-wall commentary (7)             | agreement-commentary, nearly-there, full-room, topic-returned, expensive-discussion, postponed-again, still-considering                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | All seven predicates and lines reviewed. Revise topic-returned and expensive-discussion; keep cadence-independent factual wording and the other five observations.                                                                                      |

The relationship metadata, family eligibility, topic mappings, draw guards,
transcription conventions and all walkthrough prose were also read for implied
promises. Redesign-package samples were considered as draft examples: their
lettuce leadership, commenting spoon and table requesting a meeting were not
imported. The table's stronger people-based alternatives take precedence.

## Wording change log

The initial pass made these 45 distinct field revisions, with exact input/output wording and reasons.
Repeated descriptions on two branch rows are one field revision applied identically
to both rows. The addendum below follows this initial log in order. Other copy is retained
with the coverage rationale above.

| Address                                               | Field        | Before                                                                                     | After                                                                                       | Reason                                                                                    |
| ----------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| nominate-cuisine/italian                              | Description  | Start with Italian. A clear suggestion starts discussion; it does not settle lunch.        | Start with Italian. We still need to hear what everyone can eat.                            | Give nomination a concrete next step; no promise of agreement.                            |
| nominate-cuisine/mexican                              | Description  | Start with Mexican. A clear suggestion starts discussion; it does not settle lunch.        | Put Mexican forward. Expect opinions before anyone gets lunch.                              | Vary equivalent nominations without implying a mechanical advantage.                      |
| nominate-cuisine/thai                                 | Description  | Start with Thai. A clear suggestion starts discussion; it does not settle lunch.           | Suggest Thai. Choosing a cuisine is the start; getting agreement is the work.               | Keep equal nomination effects legible without repeating a disclaimer.                     |
| nominate-cuisine/italian                              | Outcome line | Italian is on the board. Gary asks whether this is the final version of the board.         | Italian is on the board. Priya leaves space underneath for objections.                      | Give Priya practical anticipation; remove Gary from another person's scene.               |
| nominate-cuisine/mexican                              | Outcome line | Mexican is the suggestion. Nobody has agreed to lunch merely by spelling it correctly.     | Mexican goes on the board under Suggestion. Priya is careful about the heading.             | Replace spelling gag with recognisable care about premature commitment.                   |
| nominate-cuisine/thai                                 | Outcome line | Thai is nominated. Priya underlines it once, before anyone can request a logo.             | Thai is nominated. Priya puts the marker down before this becomes a branding exercise.      | Keep process satire grounded in an observable action.                                     |
| menu-needs/hear                                       | Description  | Find a proper meal for everyone. Reliable reassurance, with a longer discussion.           | Take time to check for a proper meal. A solid answer helps the room move forward.           | Replace abstract reassurance with action, time and benefit.                               |
| menu-needs/invite                                     | Description  | Bring in a menu reader. More future cost; an unclear menu note may mean longer discussion. | Ask Alex to help. Alex stays, raising later costs; an unclear note could slow the check.    | Name the entrant, permanent cost and possible delay without promising superior value.     |
| lunch-window/base                                     | Opening line | We need time to eat {cuisine}, as well as time to explain why we picked it.                | Can we leave time to eat {cuisine}? I would rather not spend the break explaining it.       | Give Priya a direct request and a dry personal boundary.                                  |
| lunch-window/variant-1                                | Opening line | Pat is here. Can we protect a lunch break from whatever Pat just put in the calendar?      | Pat, can you protect the lunch break? Including from invitations marked optional.           | Remove unsupported claim that Pat just made a calendar entry.                             |
| lunch-window/hear                                     | Outcome line | We find a workable lunch window. Gary reserves the right to call it a working lunch.       | We find a workable lunch window. Priya asks everyone to leave it as lunch.                  | Remove Gary cameo; make the office encroachment specific to Priya.                        |
| lunch-window/timebox                                  | Outcome line | We keep the break plan simple. Nobody gets a separate calendar colour for chewing.         | We cover the main timing constraint. The rest will have to fit around eating.               | Avoid childish chewing/calendar gag; keep the narrower check explicit.                    |
| portion-plan/owner                                    | Description  | Keep the cuisine suggestion and let adults choose their dishes. Some useful sorting now.   | Keep {cuisine} on the table and sort out how people choose their own dishes.                | Replace vague useful sorting with the actual proposed arrangement.                        |
| portion-plan/hear                                     | Outcome line | We settle how to choose dishes. Gary's story about a stolen chip is entered in the record. | We settle how to choose dishes. Jordan accepts that separate meals still count as lunch.    | Let Jordan negotiate inclusion; remove unrelated Gary anecdote.                           |
| quick-agreement/base                                  | Opening line | We have a cuisine suggestion. Shall we try agreeing to {cuisine} before it gets cold?      | It sounds like we are leaning toward {cuisine}. Shall I call that broad support?            | Give Morgan the confident-summary habit; remove implication food is already waiting.      |
| quick-agreement/hear                                  | Outcome line | Each concern gets a hearing. Having a turn turns out to be one of the concerns.            | Morgan hears each concern, then adds a carefully placed almost to the summary.              | Show Morgan revising premature certainty; preserve progress without unanimity.            |
| projector/timebox                                     | Outcome line | The laptop becomes the screen. The large screen continues to supervise.                    | Dev turns the laptop around. Everyone leans in rather than mentioning the big screen.       | Replace personified screen with familiar awkward meeting behaviour.                       |
| projector/park                                        | Outcome line | Lunch survives on the laptop. Dev stops negotiating with the large screen.                 | Dev leaves the menu on the laptop. We get back to {cuisine} without the big screen.         | Close the actual distraction without implying a missing menu or future callback.          |
| introductions/base                                    | Opening line | Before lunch, could we go around and say who we are? I know, but it feels inclusive.       | Could we say our names first? I know most of you, but I would hate to assume.               | Make Jordan inclusively overcautious; avoid claiming everyone already knows entrants.     |
| introductions/refocus                                 | Outcome line | Priya welcomes the people she sees every morning, then returns to {cuisine}.               | Priya gives everyone a quick welcome and points to {cuisine}. That is why we are here.      | Remove assumption all present are seen every morning; sharpen Priya's focus.              |
| lunch-history/hear                                    | Description  | Let Gary explain what happened. Slow, with little help separating precedent from lunch.    | Hear the full story. It takes time, and little of the history helps with today's lunch.     | Replace abstract precedent phrasing with plain action and weak benefit.                   |
| lunch-history/email                                   | Outcome line | Gary promises an attachment. The meeting has outsourced its next nine pages.               | Gary offers to send his notes, provided everyone reads them before commenting.              | Add territorial authority rather than another narrator paperwork punchline.               |
| lunch-committee/owner                                 | Outcome line | Priya summarises {cuisine} and the remaining concerns. Jordan asks who approves summaries. | Priya sums up {cuisine} and the concerns. Jordan offers to circulate the summary.           | Jordan performs helpfulness without duplicating Gary's approval/authority habit.          |
| lunch-committee/park                                  | Outcome line | The committee proposal is filed. It has not been assigned a committee.                     | Jordan agrees to postpone forming the committee, but keeps the proposed membership list.    | Replace committee-for-committee recursion with sunk effort and attachment.                |
| chair-arrangement/base                                | Opening line | Could we move the chairs into a circle? The current shape feels quite indecisive.          | A circle would help us reach agreement. I have seen this work at an away day.               | Ground Morgan's confidence in a familiar overgeneralised workplace technique.             |
| chair-arrangement/refocus                             | Description  | Keep everyone seated and return to lunch. Quick focus, without improving the furniture.    | Stay seated and get back to lunch. A little progress without a room rearrangement.          | Keep cost/benefit cue while avoiding filler about improving furniture.                    |
| spice-question/timebox                                | Description  | Look quickly for a mild option. It may reassure Sam, or an unclear note may set us back.   | Scan for a mild option. A clear answer helps; an unclear note may set us back and drag on.  | Explicitly cue both regression and longer discussion, not speed alone.                    |
| alex-arrives/base                                     | Opening line | I heard there was a menu discussion. I have the menu, which seemed a useful qualification. | I brought the menu. I can check the wording, if that would help more than a recap.          | Differentiate Alex's precision from narrator irony; all arrival choices still work.       |
| alex-arrives/hear                                     | Outcome line | Alex joins and gets the full history of a cuisine we have not yet agreed on.               | Alex joins, waits through the full history, then asks which menu item needs checking.       | Show the long recap and expert's restrained correction; no prior-event assumption.        |
| alex-arrives/timebox                                  | Outcome line | Alex joins and opens the {cuisine} menu. Relevant reading makes a quiet entrance.          | Alex joins, opens the {cuisine} menu and asks for the question rather than the background.  | Ground the efficient recap in Alex's voice.                                               |
| pat-arrives/base                                      | Opening line | Mind if I join? I saw lunch in the invitation. Tell me where we are before I help.         | I saw lunch in the invitation. Catch me up; I may be able to simplify this.                 | Give Pat warm, self-assured seniority without a genuine yes/no entry prompt.              |
| pat-arrives/hear                                      | Outcome line | Pat joins and asks for background. Our attempt to avoid a recap gets its own recap.        | Pat joins, hears the full recap and repeats the cuisine suggestion as a helpful new idea.   | Remove false claim a full-recap choice tried to avoid a recap; add status appropriation.  |
| pat-arrives/park                                      | Outcome line | Pat joins and writes down a question. The room contains another person with stationery.    | Pat joins and saves the questions for later. Being here already counts as involvement.      | Clarify postponement without implying a scheduled callback.                               |
| room-booked/timebox                                   | Outcome line | We accept the earlier finish. The room now has a deadline smaller than its ambitions.      | We accept the earlier finish. The next team stays by the door to help us remember.          | Remove whimsical deadline ambitions; true before or after minute 45.                      |
| menu-return/owner                                     | Outcome line | Alex explains the meal options. The deferred question finally earns a full stop.           | Alex explains the meal options. Sam asks why we could not have started with that.           | Replace punctuation personification with earned impatience at a deferred need.            |
| soup-return/refocus                                   | Outcome line | Soup keeps its ambiguous status. The promise is discharged; no sequel is commissioned.     | Gary gets his acknowledgement. The soup question gets no more meeting time.                 | Plain closure and status concession; avoid legalistic discharge/sequel rhythm.            |
| spice-return/hear                                     | Outcome line | We finish checking mild options. Nobody has to defend a preference to a whiteboard.        | We finish checking mild options. Sam says that was the question all along.                  | Let Sam express earned impatience; replace whiteboard personification.                    |
| filler/base                                           | Opening line | Nobody speaks. The clock has no such professional restraint.                               | Nobody speaks. Everyone waits for someone else to take responsibility for the pause.        | Make repeatable silence about familiar social avoidance, not a personified clock.         |
| Title catalog/lunch-agreed                            | Flavour line | The board can stop auditioning headings. {agreedCuisine} survives the final draft.         | Everyone agreed on {agreedCuisine}. You may put the marker down.                            | Make the cuisine agreement explicit and give the success a quiet release.                 |
| Title catalog/second-helping                          | Flavour line | We returned to a postponed topic and still reached {agreedCuisine}. Seconds, anyone?       | A postponed question came back. You dealt with it and still got to {agreedCuisine}.         | Replace broad seconds pun with factual achievement; soup can be closed without agreement. |
| Epilogues and factual moments/decision                | Line         | Everyone present agrees on {agreedCuisine}. Lunch may now proceed without minutes.         | Everyone present agrees on {agreedCuisine}. Please let the next conversation be over lunch. | Replace ambiguous minutes pun with explicit cuisine success and a human wish.             |
| Interface, results and share copy/instructions-action | Copy         | Choose a suggestion, then help the room agree. Time moves when you answer.                 | Suggest a cuisine, then help the room agree. Time moves when you choose a response.         | Clarify the goal and when discussion time advances.                                       |
| Interface, results and share copy/choices-explanation | Copy         | Choices rewards the expected tradeoff when you chose, before any uncertain outcome.        | Choices scores the expected benefit and cost when you chose, before the outcome was known.  | Explain the score without unexplained tradeoff shorthand; no retrospective blame.         |
| Fourth-wall commentary/topic-returned                 | Line         | A postponed topic has returned. The notes were not a witness protection scheme.            | A postponed topic has returned. Writing it down was never going to settle it.               | Replace disproportionate witness-protection image with recognisable avoidance.            |
| Fourth-wall commentary/expensive-discussion           | Line         | You are spending salaries on the discussion. The food has not submitted an invoice.        | The discussion is costing salary time. Nobody has ordered anything through this meeting.    | Avoid claiming food elsewhere has not been invoiced; distinguish salary cost from food.   |

## Constructed sequence reads and uncertainty audit

These are editorial reads using the table's hand-constructed routes, not seeded
engine executions, reader reactions or new statistical evidence.

- **Ten-turn Italian success with soup callback:** read every opening, selected
  description and outcome in order through the Italian epilogue, result, titles,
  moment and share line. Sam's meal check establishes a real need; cable skipping
  and the seating request are tangents; Gary's promise returns once; Morgan's
  qualified summary can precede the terminal agreement surface. P100 supplies the
  agreement, so nonterminal outcomes need not promise unanimity. The first moment
  is the big-screen postponement, not the later soup callback. Quiet practical
  lines provide breathing room around the soup escalation.
- **Thai expiry with Pat arrival:** read the full introductions, soup theory,
  chosen full Pat recap, cable search, earlier booking end and receipt history.
  Pat's new full-recap ending now matches the action actually selected. The
  earlier-finish outcome stays true at late draws too. Result, epilogue and share
  say no agreement; Thai remains only suggested. The factual moment records Pat's
  arrival, never how long Pat spoke.
- **Mexican success with two invitations:** Alex's helpful details are followed
  by Jordan's separate-meal compromise; Pat then joins and Priya directly asks
  Pat to protect lunch. The Pat-present variant assumes no unseen calendar edit.
  Subsequent cost has eight attendees. Read through the summary and Mexican
  agreement/result/share; neither entrant is credited with guaranteeing success.
- **All three callback mini-routes:** menu-return and spice-return honour the
  unresolved needs; soup-return honours the promised last word without claiming
  an earlier theory was heard. Read both Alex-present help choices and their
  disabled alternatives. Every callback closes without promising a further return.
- **All uncertain branches:** read menu-needs/invite/helpful and more-questions,
  quick-agreement/refocus/momentum and objections, spice-question/timebox/clear
  and unclear from their documented decision states. Each label states an action;
  each description names the possible delay. Quick agreement and quick spice
  check explicitly warn of a setback; the Alex invitation explains higher later
  cost and unclear-note delay, while both outcomes admit Alex. Deterministic
  hear alternatives still offer reliable progress with longer discussion.
- **Early end, cancellation and failure titles:** nominate then Call it yields a
  suggestion without agreement; Call it before nomination resolves yields none.
  The high-choice-quality failure title does not blame a bad roll. Filler's
  shared silence can repeat without introducing new facts or demanding a punchline.

Read all success templates with Italian, Mexican and Thai, including defensive
heading, decision moment, epilogue, agreement commentary, result and share.
Each success summary includes the actual `{agreedCuisine}`. Collectible headings
are accompanied by the cuisine result. Failure/cancel text does not reuse the
nomination as an agreement. Roster/name/topic substitutions were checked, including
Pat's questions and the maximum eight-person roster.

## Separate design decisions and later evidence

No new mechanical blocker was discovered in this editorial pass. Preserve these
initial content decisions, now accepted by Harry’s October 14 D18 approval;
they do not reopen any
accepted rule or formula:

- **D1 — uncertain-choice competitiveness:** the documented early-state expected
  utilities favour deterministic alternatives. Keep the two valid clamped-state
  counterexamples; do not claim Greedy never gambles or that uncertainty is always
  a trap. Wording now explains consequences without selling a dominated choice
  as better value. L11/L12 must measure actual selection and tune with required
  reports. No weight, effect or target is changed here.
- **D2 — expert-dependent paths:** preserve both Pat-dependent responses and both
  Alex callback responses for D18 consideration. Useful help depends on a later
  eligible event; inviting Alex does not guarantee a callback benefit.
- **D3 — room booking:** preserve the intentional immediate-utility limitation,
  including the Pat/timebox tie-break. Copy describes the deadline consequence;
  the writing review does not fix it mechanically.

L09 still needs real uncoached observations of the headline, dietary issue versus
tangent, uncertainty downside, duration and flat/repetitive jokes. In particular,
probe Alex's permanent later cost and possible longer check before revealing the
outcome. No human reaction, 320 px rendered fit, policy band, humour score or V4
acceptance is inferred from this review. Original 12a V4 remains pending.

## Verification and handoff

Mechanical preservation was checked against the input commit by parsing both
Markdown documents, comparing row count/order, headers and every cell except
player copy/voice fields. **All table rows and all non-copy fields match.** This
includes IDs, techniques, requirements, speakers, conditions, weights, effects,
joins, callbacks, booking/nomination metadata, title predicates and commentary
priority/predicates. No accepted ADR, source, CI, dependency or runtime data changed.

Document check results are recorded in the [implementation plan](implementation-plan.md).
The existing [content checker](lunch-content-checks.py) checks all cuisine/name/topic
expansions, relationships, hand sums and references. Its `--review-base` option
reproduces the full mechanical comparison, report coverage and sequential change-log
audit against the initial input commit. The original supplemental check was a
one-off; it is now committed as part of that checker. Actual local and hosted
checks are recorded in the implementation plan; unchanged launch tests still read
the preserved launch table.

Harry's final D18 review is the next content handoff, as required by
[the tech spec](tech-spec.md#testing-and-quality-gates) and
[the writing brief](lunch-writing-review.md#exit-criteria-and-evidence).
Review the complete revised table and D1/D2 content decisions together; this AI
report does not grant approval. L05/L06/L07 remain gated on that approval and their
other dependencies. Stop at L02b; no L03 implementation is part of this task.

## Claude review addendum — lunch-l02b-reviewed-2

Harry asked to address [Claude's L02b review](L02b-review.md). This addendum
reviews all affected rows again under the same L02b criteria; mechanics remain
unchanged. The initial log above describes revision 1, and the following twelve
field revisions transform revision 1 into revision 2. Applying both logs in order
reconstructs the final table from the pinned L02 input. No review pass is silently
rewritten to pretend these changes were in the first revision.

| Address                                     | Field        | Before                                                                                     | After                                                                                     | Reason                                                                                    |
| ------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| spice-question/hear/checked                 | Outcome line | We check the mild options. Sam wanted information, not a character assessment.             | We find mild options. Sam asks for the menu to stay open while everyone catches up.       | Vary Sam's information-versus-judgement beat; preserve the completed preference check.    |
| menu-return/timebox/read                    | Outcome line | We read the main options. Sam gets information rather than another promise to investigate. | We read the main options. Sam picks out the meals that were missing from the discussion.  | Give Sam a concrete action instead of another information-versus-promises contrast.       |
| spice-return/owner/explained                | Outcome line | Alex clarifies the mild options. Sam's preference is treated as information, which helps.  | Alex clarifies the mild options. Sam can finally stop asking the same question.           | Pay off the deferred question without repeating the opening's contrast.                   |
| spice-return/timebox/read                   | Outcome line | We read the relevant wording. The conversation gets more specific and less motivational.   | We check the key wording. Sam underlines mild and hands the menu back.                    | Show the narrower check and a restrained reaction; remove motivational repetition.        |
| projector/park/skipped                      | Label        | Skip the big screen                                                                        | Set the menu aside                                                                        | Distinguish abandoning the menu check from reading it on the laptop.                      |
| projector/park/skipped                      | Description  | Skip the big screen and return to the cuisine. Fast, with the menu left on the laptop.     | Set the menu aside and return to {cuisine}. Fast, with no help from reading it this time. | Explicitly abandon this menu check; no claim nobody read the menu on an earlier turn.     |
| projector/park/skipped                      | Outcome line | Dev leaves the menu on the laptop. We get back to {cuisine} without the big screen.        | Dev closes the menu. Apparently we can discuss {cuisine} without looking at the options.  | Give the no-progress postponement a specific consequence and an office beat.              |
| pat-arrives/base                            | Opening line | I saw lunch in the invitation. Catch me up; I may be able to simplify this.                | I saw lunch in the invitation. Where have we got to? I may be able to simplify this.      | Give Pat an actual question so saving the questions matches the opening and topic.        |
| room-booked/vp/protected                    | Outcome line | Pat mentions the original booking. The next team suddenly remembers another room.          | Pat mentions the original booking. The next team decides the hour was always ours.        | Land on deference to seniority rather than repeat the other-room punchline.               |
| Fourth-wall commentary/expensive-discussion | Line         | The discussion is costing salary time. Nobody has ordered anything through this meeting.   | Salaries are paying for this discussion. So far, it has produced no food.                 | Replace unclear ordering claim with a factual contrast; no unknown food-price comparison. |
| menu-needs/invite/helpful                   | Outcome line | Alex joins with useful menu details. For once, additional paperwork earns its chair.       | Alex joins with useful menu details. Someone has brought information to the discussion.   | Credit Alex's contribution without describing the entrant as paperwork.                   |
| Epilogues and factual moments/first-arrival | Line         | {attendee} joined at minute {minute}. The discussion acquired another chair.               | {attendee} joined at minute {minute}. The discussion now has another participant.         | Remove repeated acquired phrasing; keep the moment factual and quiet.                     |

All seven optional copy concerns are addressed: Sam's repeated contrast is kept
only in the spice-return opening among the five flagged lines; projector/park
now skips this menu check while timebox reads it; Pat actually asks a question;
the booking outcomes have distinct punchlines; expensive-discussion makes no
food-price or ordering assumption; Alex is credited as a person; the factual
arrival moment no longer repeats acquired.

**Rhythm decision:** retain the consistent action-then-qualitative-consequence
structure where it helps predict tradeoffs without numeric previews. It is a
reading aid on choice buttons. Vary the outcomes and character beats around it
rather than obscure cost, delay or uncertainty just to vary sentence shape.

Re-read the affected constructed routes: Italian success now explicitly skips
the menu during the projector detour, while the Mexican route still uses the
laptop check; Sam's returned mild-option question retains its information-versus-
encouragement setup but its three outcomes have distinct beats. Read Pat's new
question with each of the three arrival choices, including postponement. Read
room-booked/hear and vp side by side, and commentary after its cost threshold.
First-arrival works for both Alex and Pat and every ending. All changed labels,
descriptions, outcomes and templates stay within their existing limits after
substitution. No human reaction or new engine execution is claimed by these reads.

D1/D2 remain final D18 content decisions; D3 remains the intentional booking
tradeoff. The [resolution record](L02b-review-resolution.md) tracks delivery R1
and the documentation nits. Next implementation task is **L03**; final content
approval was recorded on October 14; L05/L06/L07 retain their other dependencies.
