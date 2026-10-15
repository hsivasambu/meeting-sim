# Lunch meeting — complete content draft

Task **L02** · October 13, 2026 · Revision **lunch-l02-draft-2**.
**Authored draft, not D18 approved. L02b writing review is next.**

Sources: [design](design-doc-v2.md), [technical spec](tech-spec.md),
[approved redesign](lunch-redesign-plan.md), accepted ADRs
[0005](adr/0005-lunch-agreement-and-attendance.md),
[0006](adr/0006-lunch-response-outcomes.md),
[0007](adr/0007-lunch-score-and-policies.md),
[0008](adr/0008-lunch-presentation-and-unlocks.md).
Rules/formulas are accepted; these words, initial effects and weights need
[L02b](lunch-writing-review.md) and Harry's final D18 approval.
The illustrative 80/20 is not tuning. No runtime content is implemented here.

The [preserved launch table](content-table-launch.md) is the historical approved
source for unchanged launch behavior during L03–L07. Its old approval does not
approve this lunch draft. Original [12a V4](task-12a-playtest.md) was accepted by Harry on October 15, 2026;
the separate [L09 record](lunch-playtest.md) contains no observed evidence yet.

## Transcription and review conventions

Family IDs are future file stems. Presentation IDs are review references, not
new event IDs. Each presentation references the complete response set named after
its family. First matching ordered variant wins, otherwise base; a fixed delivered
presentation never changes. There are no starter-absence variants: nobody leaves.
The sole variant changes wording when Pat is present, not effects or choice count.

Response IDs are local to their set; outcome IDs are local to a response.
Review address is family/presentation or family/response/outcome.
Response order is table order. Repeated response cells on two branches are one
response, not two buttons. Each branch is a complete effect: do not stack rows.
Deterministic outcome weight is 1; two weights are relative positive tickets,
not a player-visible probability. Event weights start at 1; rarity multipliers
remain 65/28/7. Initial event/outcome weights and effects are draft content.

`—` means omitted field. Min is required full billed minutes; P is signed progress
delta (explicit zero allowed). Join is one attendee ID; End is absolute bookingEnd,
not added time. Nom is nominateCuisine. CB is callback event ID with afterTurns: 2,
due at pre-resolution turn n+2. Conditions are conjunctive; present/absent are the
schema's all-present/all-absent arrays. No branch conditions, shared effects,
departures, risk effects or callback chains. Park increments parkedCount once per
selected response; callback resolution increments resolvedCallbackCount once.

Bill Min × pre-response headcount, clamp P to 0–100, apply joins/booking, check
agreement before expiry. Nonterminal lines describe movement or a local concern,
never unanimous cuisine agreement. A modest line can accompany a completing
response; the success surface then states all present agree. An ending cancels
later delivery. No new win guarantee or turn cap. See the source spec for rules.

Labels ≤24; roles ≤48; titles ≤28; opening/description/outcome/moment/epilogue lines
≤90 Unicode code points. Disabled reasons/commentary and individual interface/share
lines also stay ≤90. Substitutions are authored: {cuisine} is the nominated display
name during play; {agreedCuisine} is the actual agreed name on success only.
{attendee} is a catalog name; {topic} is a relationship-table topic.
Numeric display facts use engine/formatCost; they never become choice previews.
Labels/descriptions/reasons contain no numeric effect deltas, odds or utility.

## Cuisine catalog

| ID      | Name    |
| ------- | ------- |
| italian | Italian |
| mexican | Mexican |
| thai    | Thai    |

Only nominate-cuisine sets Nom. Its three effects differ only in cuisine ID;
later responses never swap cuisines. Failed runs keep agreedCuisine null.

## Attendees and voice guide

Stable IDs preserve asset identity; roles are plain name-card descriptions.
These are voice intentions for L02b, not human humour findings.

| ID     | Name   | Role                            | Starts present | Voice / comic friction                                                                          |
| ------ | ------ | ------------------------------- | -------------- | ----------------------------------------------------------------------------------------------- |
| priya  | Priya  | Trying to get everyone to lunch | yes            | Calm, specific, politely interrupts; names the decision instead of performing authority.        |
| dev    | Dev    | Checks before committing        | yes            | Literal, practical, notices missing information; equipment is a distraction, not a personality. |
| sam    | Sam    | Wants a proper meal             | yes            | Direct, patient until brushed off; real needs expose other people's empty helpfulness.          |
| morgan | Morgan | Makes suggestions sound final   | yes            | Confident social shorthand; treats a few nods as momentum, then has to hear objections.         |
| gary   | Gary   | Has some historical context     | yes            | Solemn ownership of irrelevant precedent; talks as though silence requested his expertise.      |
| jordan | Jordan | Would like everyone included    | yes            | Earnest, over-organises simple courtesies; makes useful compromises once given a boundary.      |
| legal  | Alex   | Actually reads the menu         | no             | Quiet precision, restrained corrections; brings information, not an automatic solution.         |
| vp     | Pat    | Senior enough to interrupt      | no             | Warm confidence, wants a recap; assumes a preference becomes simpler once they repeat it.       |

room is a narrator, not a ninth person or billed seat. Door speaker exceptions
apply only to legal at alex-arrives and vp at pat-arrives.

## Families and draw eligibility

17 unseen base families. Nomination is forced at draw 0. Draw 1 uses unrestricted
common substantive menu-needs, lunch-window, portion-plan or quick-agreement.
Later draws retain the guard against adjacent uncommon negative events.

| ID                | Kind        | Rarity   | Weight | Negative | Family when               |
| ----------------- | ----------- | -------- | ------ | -------- | ------------------------- |
| nominate-cuisine  | substantive | common   | 1      | false    | —                         |
| menu-needs        | substantive | common   | 1      | false    | —                         |
| lunch-window      | substantive | common   | 1      | false    | —                         |
| portion-plan      | substantive | common   | 1      | false    | —                         |
| quick-agreement   | substantive | common   | 1      | false    | —                         |
| projector         | noise       | common   | 1      | false    | —                         |
| introductions     | tangent     | common   | 1      | false    | —                         |
| soup-debate       | tangent     | common   | 1      | false    | —                         |
| lunch-history     | tangent     | common   | 1      | false    | —                         |
| lunch-committee   | tangent     | common   | 1      | false    | —                         |
| chair-arrangement | noise       | common   | 1      | false    | —                         |
| spice-question    | substantive | uncommon | 1      | true     | —                         |
| alex-arrives      | escalation  | uncommon | 1      | true     | absent: legal             |
| pat-arrives       | escalation  | uncommon | 1      | true     | minMinute: 15; absent: vp |
| room-booked       | noise       | uncommon | 1      | true     | —                         |
| menu-read         | gift        | rare     | 1      | false    | —                         |
| small-concession  | gift        | rare     | 1      | false    | —                         |

Negative flags mark interruption/setback families for the draw guard; they do not
mean a dietary need is bad. Callback/filler never enter the random pool.

| ID           | Kind     | Rarity | Weight | Negative | Family when | Source                       |
| ------------ | -------- | ------ | ------ | -------- | ----------- | ---------------------------- |
| menu-return  | callback | common | 1      | false    | —           | menu-needs                   |
| soup-return  | callback | common | 1      | false    | —           | soup-debate                  |
| spice-return | callback | common | 1      | false    | —           | spice-question               |
| filler       | noise    | common | 1      | false    | —           | exhausted eligible pool only |

## Relationship metadata

nominationEventId = nominate-cuisine; bookingEventIds = [room-booked].
This is the entire arrivalPermissions list. Every branch joins the named person;
no other response joins. Spontaneous families become ineligible after invitation.
Invitations disable after arrival, with other choices available. Invitations
discuss the entrant's contribution, never pretend it happened before entry.

| Event ID        | Response ID | Attendee ID | Requires / family guard          | Door speaker |
| --------------- | ----------- | ----------- | -------------------------------- | ------------ |
| menu-needs      | invite      | legal       | response absent: legal           | —            |
| quick-agreement | invite      | vp          | response absent: vp              | —            |
| alex-arrives    | hear        | legal       | family absent: legal             | legal        |
| alex-arrives    | timebox     | legal       | family absent: legal             | legal        |
| pat-arrives     | hear        | vp          | family absent: vp; minMinute: 15 | vp           |
| pat-arrives     | timebox     | vp          | family absent: vp; minMinute: 15 | vp           |
| pat-arrives     | park        | vp          | family absent: vp; minMinute: 15 | vp           |

| Parent         | Target       | Scheduling responses | Topic            |
| -------------- | ------------ | -------------------- | ---------------- |
| menu-needs     | menu-return  | park                 | meal options     |
| soup-debate    | soup-return  | park                 | soup debate      |
| spice-question | spice-return | park                 | spice preference |

Only those park responses schedule. Targets are unconditional/common/non-negative,
never schedule anything, and state that discussion was deferred. Returning copy
does not imply a settled issue mysteriously became unsafe.

## Presentations and complete response branches

### nominate-cuisine

| Presentation | Variant when | Speaker | Opening line                                                    | Response set     |
| ------------ | ------------ | ------- | --------------------------------------------------------------- | ---------------- |
| base         | —            | priya   | Six adults. One lunch. Which cuisine should we try to agree on? | nominate-cuisine |

| Response | Label           | Description                                                                         | Technique | Requires | Reason key | Outcome   | Weight | Min | P   | CB  | Join | End | Nom     | Outcome line                                                                           |
| -------- | --------------- | ----------------------------------------------------------------------------------- | --------- | -------- | ---------- | --------- | ------ | --- | --- | --- | ---- | --- | ------- | -------------------------------------------------------------------------------------- |
| italian  | Suggest Italian | Start with Italian. A clear suggestion starts discussion; it does not settle lunch. | refocus   | —        | —          | nominated | 1      | 2   | 8   | —   | —    | —   | italian | Italian is on the board. Gary asks whether this is the final version of the board.     |
| mexican  | Suggest Mexican | Start with Mexican. A clear suggestion starts discussion; it does not settle lunch. | refocus   | —        | —          | nominated | 1      | 2   | 8   | —   | —    | —   | mexican | Mexican is the suggestion. Nobody has agreed to lunch merely by spelling it correctly. |
| thai     | Suggest Thai    | Start with Thai. A clear suggestion starts discussion; it does not settle lunch.    | refocus   | —        | —          | nominated | 1      | 2   | 8   | —   | —    | —   | thai    | Thai is nominated. Priya underlines it once, before anyone can request a logo.         |

### menu-needs

| Presentation | Variant when | Speaker | Opening line                                                                          | Response set |
| ------------ | ------------ | ------- | ------------------------------------------------------------------------------------- | ------------ |
| base         | —            | sam     | Can we find a proper vegetarian meal? I'd like lunch, rather than a decorative salad. | menu-needs   |

| Response | Label                  | Description                                                                                | Technique | Requires      | Reason key   | Outcome        | Weight | Min | P   | CB          | Join  | End | Nom | Outcome line                                                                            |
| -------- | ---------------------- | ------------------------------------------------------------------------------------------ | --------- | ------------- | ------------ | -------------- | ------ | --- | --- | ----------- | ----- | --- | --- | --------------------------------------------------------------------------------------- |
| hear     | Check the meal options | Find a proper meal for everyone. Reliable reassurance, with a longer discussion.           | hear      | —             | —            | checked        | 1      | 6   | 18  | —           | —     | —   | —   | There are proper meal options. Sam can stop defending the radical idea of eating lunch. |
| invite   | Ask Alex to join       | Bring in a menu reader. More future cost; an unclear menu note may mean longer discussion. | owner     | absent: legal | alex-present | helpful        | 3      | 4   | 16  | —           | legal | —   | —   | Alex joins with useful menu details. For once, additional paperwork earns its chair.    |
| invite   | Ask Alex to join       | Bring in a menu reader. More future cost; an unclear menu note may mean longer discussion. | owner     | absent: legal | alex-present | more-questions | 2      | 7   | 4   | —           | legal | —   | —   | Alex joins and finds an unclear menu note. We spend longer checking it, not guessing.   |
| park     | Return to meals later  | Keep moving now. Sam plans to return to the meal question.                                 | park      | —             | —            | deferred       | 1      | 1   | 0   | menu-return | —     | —   | —   | Sam writes down the meal question. Postponing it has not made a salad more filling.     |

### lunch-window

| Presentation | Variant when | Speaker | Opening line                                                                          | Response set |
| ------------ | ------------ | ------- | ------------------------------------------------------------------------------------- | ------------ |
| base         | —            | priya   | We need time to eat {cuisine}, as well as time to explain why we picked it.           | lunch-window |
| variant-1    | present: vp  | priya   | Pat is here. Can we protect a lunch break from whatever Pat just put in the calendar? | lunch-window |

| Response | Label                    | Description                                                                        | Technique | Requires    | Reason key | Outcome   | Weight | Min | P   | CB  | Join | End | Nom | Outcome line                                                                         |
| -------- | ------------------------ | ---------------------------------------------------------------------------------- | --------- | ----------- | ---------- | --------- | ------ | --- | --- | --- | ---- | --- | --- | ------------------------------------------------------------------------------------ |
| hear     | Check everyone's break   | Hear the timing constraints. Takes longer, but gives people a workable lunch plan. | hear      | —           | —          | checked   | 1      | 6   | 18  | —   | —    | —   | —   | We find a workable lunch window. Gary reserves the right to call it a working lunch. |
| pat      | Ask Pat to protect lunch | Ask the senior colleague to protect the break. Quick help, if Pat is already here. | owner     | present: vp | pat-absent | protected | 1      | 3   | 16  | —   | —    | —   | —   | Pat protects the lunch break from other meetings. This meeting remains an exception. |
| timebox  | Keep lunch simple        | Limit timing talk to the main constraint. Quicker, with less detail settled.       | timebox   | —           | —          | bounded   | 1      | 3   | 11  | —   | —    | —   | —   | We keep the break plan simple. Nobody gets a separate calendar colour for chewing.   |

### portion-plan

| Presentation | Variant when | Speaker | Opening line                                                                            | Response set |
| ------------ | ------------ | ------- | --------------------------------------------------------------------------------------- | ------------ |
| base         | —            | jordan  | Could we each choose our own meal within {cuisine}? I have made a seating chart anyway. | portion-plan |

| Response | Label                 | Description                                                                              | Technique | Requires | Reason key | Outcome    | Weight | Min | P   | CB  | Join | End | Nom | Outcome line                                                                               |
| -------- | --------------------- | ---------------------------------------------------------------------------------------- | --------- | -------- | ---------- | ---------- | ------ | --- | --- | --- | ---- | --- | --- | ------------------------------------------------------------------------------------------ |
| owner    | Let people pick meals | Keep the cuisine suggestion and let adults choose their dishes. Some useful sorting now. | owner     | —        | —          | individual | 1      | 4   | 18  | —   | —    | —   | —   | Personal meal choices stay personal. Jordan files the seating chart under personal loss.   |
| hear     | Hear the sharing plan | Discuss sharing versus separate meals. Thorough, but everyone will have an example.      | hear      | —        | —          | discussed  | 1      | 7   | 20  | —   | —    | —   | —   | We settle how to choose dishes. Gary's story about a stolen chip is entered in the record. |
| email    | Send the suggestion   | Email the suggestion and move on. Quick clarity, with meal details still to discuss.     | email     | —        | —          | sent       | 1      | 2   | 7   | —   | —    | —   | —   | The {cuisine} suggestion is emailed. Everyone nearby checks a separate inbox.              |

### quick-agreement

| Presentation | Variant when | Speaker | Opening line                                                                          | Response set    |
| ------------ | ------------ | ------- | ------------------------------------------------------------------------------------- | --------------- |
| base         | —            | morgan  | We have a cuisine suggestion. Shall we try agreeing to {cuisine} before it gets cold? | quick-agreement |

| Response | Label                 | Description                                                                              | Technique | Requires   | Reason key  | Outcome    | Weight | Min | P   | CB  | Join | End | Nom | Outcome line                                                                               |
| -------- | --------------------- | ---------------------------------------------------------------------------------------- | --------- | ---------- | ----------- | ---------- | ------ | --- | --- | --- | ---- | --- | --- | ------------------------------------------------------------------------------------------ |
| refocus  | Try a quick agreement | Ask for a quick yes. It may build momentum, or reopen objections and take longer.        | refocus   | —          | —           | momentum   | 3      | 3   | 23  | —   | —    | —   | —   | Several heads nod toward {cuisine}. Morgan starts a summary before the nods have finished. |
| refocus  | Try a quick agreement | Ask for a quick yes. It may build momentum, or reopen objections and take longer.        | refocus   | —          | —           | objections | 2      | 7   | -6  | —   | —    | —   | —   | The quick ask reopens objections. Morgan's summary was more confident than the room.       |
| hear     | Hear each concern     | Give everyone a turn on the suggestion. Slower, but concerns get a proper hearing.       | hear      | —          | —           | heard      | 1      | 7   | 20  | —   | —    | —   | —   | Each concern gets a hearing. Having a turn turns out to be one of the concerns.            |
| invite   | Bring Pat up to speed | Invite Pat to hear the suggestion. Useful support, with another adult staying afterward. | owner     | absent: vp | pat-present | briefed    | 1      | 4   | 12  | —   | vp   | —   | —   | Pat joins and hears the {cuisine} suggestion. The recap now has senior attendance.         |

### projector

| Presentation | Variant when | Speaker | Opening line                                                                    | Response set |
| ------------ | ------------ | ------- | ------------------------------------------------------------------------------- | ------------ |
| base         | —            | dev     | The menu is on my laptop. The screen is waiting for a cable none of us brought. | projector    |

| Response | Label                | Description                                                                            | Technique | Requires | Reason key | Outcome  | Weight | Min | P   | CB  | Join | End | Nom | Outcome line                                                                        |
| -------- | -------------------- | -------------------------------------------------------------------------------------- | --------- | -------- | ---------- | -------- | ------ | --- | --- | --- | ---- | --- | --- | ----------------------------------------------------------------------------------- |
| hear     | Find the right cable | Try the big screen. Everyone waits while Dev checks the cupboard.                      | hear      | —        | —          | searched | 1      | 7   | 2   | —   | —    | —   | —   | Dev finds four cables. The cupboard has prepared for every meeting except this one. |
| timebox  | Use the laptop       | Read the menu together on the laptop. Less comfortable, less discussion about cables.  | timebox   | —        | —          | shared   | 1      | 2   | 3   | —   | —    | —   | —   | The laptop becomes the screen. The large screen continues to supervise.             |
| park     | Skip the big screen  | Skip the big screen and return to the cuisine. Fast, with the menu left on the laptop. | park      | —        | —          | skipped  | 1      | 1   | 0   | —   | —    | —   | —   | Lunch survives on the laptop. Dev stops negotiating with the large screen.          |

### introductions

| Presentation | Variant when | Speaker | Opening line                                                                         | Response set  |
| ------------ | ------------ | ------- | ------------------------------------------------------------------------------------ | ------------- |
| base         | —            | jordan  | Before lunch, could we go around and say who we are? I know, but it feels inclusive. | introductions |

| Response | Label                 | Description                                                                          | Technique | Requires | Reason key | Outcome    | Weight | Min | P   | CB  | Join | End | Nom | Outcome line                                                                           |
| -------- | --------------------- | ------------------------------------------------------------------------------------ | --------- | -------- | ---------- | ---------- | ------ | --- | --- | --- | ---- | --- | --- | -------------------------------------------------------------------------------------- |
| hear     | Make introductions    | Let everyone introduce themselves. Polite, with a long detour from choosing lunch.   | hear      | —        | —          | introduced | 1      | 8   | 2   | —   | —    | —   | —   | Everyone reads the name already printed on their card. Jordan thanks them for sharing. |
| timebox  | Keep it to names      | Give each person a brief hello. A little courtesy without everyone's career history. | timebox   | —        | —          | brief      | 1      | 2   | 1   | —   | —    | —   | —   | Names are exchanged. Most were already in the email that brought us here.              |
| refocus  | Return to the cuisine | Remind everyone why we are here. Quick movement, with the welcome kept informal.     | refocus   | —        | —          | returned   | 1      | 1   | 3   | —   | —    | —   | —   | Priya welcomes the people she sees every morning, then returns to {cuisine}.           |

### soup-debate

| Presentation | Variant when | Speaker | Opening line                                                            | Response set |
| ------------ | ------------ | ------- | ----------------------------------------------------------------------- | ------------ |
| base         | —            | gary    | Before we choose lunch, should we agree whether soup counts as a drink? | soup-debate  |

| Response | Label                | Description                                                                             | Technique | Requires | Reason key | Outcome  | Weight | Min | P   | CB          | Join | End | Nom | Outcome line                                                                             |
| -------- | -------------------- | --------------------------------------------------------------------------------------- | --------- | -------- | ---------- | -------- | ------ | --- | --- | ----------- | ---- | --- | --- | ---------------------------------------------------------------------------------------- |
| hear     | Hear the soup theory | Let Gary explain his distinction. Long discussion, with little help choosing a cuisine. | hear      | —        | —          | theory   | 1      | 9   | 2   | —           | —    | —   | —   | Gary cites a mug from 2018. Nobody expected the crockery to become a witness.            |
| refocus  | Return to lunch      | Set soup aside and focus on the cuisine. Quick, without settling the theory.            | refocus   | —        | —          | returned | 1      | 2   | 4   | —           | —    | —   | —   | Soup remains unclassified. Choosing {cuisine} no longer requires a ruling on liquids.    |
| park     | Promise a last word  | Postpone the theory for now. Gary will return to collect the last word you promised.    | park      | —        | —          | promised | 1      | 1   | 0   | soup-return | —    | —   | —   | Gary writes down his soup question. The promise is now more durable than the lunch plan. |

### lunch-history

| Presentation | Variant when | Speaker | Opening line                                                                                 | Response set  |
| ------------ | ------------ | ------- | -------------------------------------------------------------------------------------------- | ------------- |
| base         | —            | gary    | The last time we chose {cuisine}, things got complicated. I should explain the full context. | lunch-history |

| Response | Label                 | Description                                                                             | Technique | Requires | Reason key | Outcome   | Weight | Min | P   | CB  | Join | End | Nom | Outcome line                                                                              |
| -------- | --------------------- | --------------------------------------------------------------------------------------- | --------- | -------- | ---------- | --------- | ------ | --- | --- | --- | ---- | --- | --- | ----------------------------------------------------------------------------------------- |
| hear     | Hear the old story    | Let Gary explain what happened. Slow, with little help separating precedent from lunch. | hear      | —        | —          | history   | 1      | 9   | 3   | —   | —    | —   | —   | The historic problem was a missing receipt. Gary still has the envelope.                  |
| timebox  | Ask what matters now  | Limit the story to today's choice. Some context, without the archive.                   | timebox   | —        | —          | relevant  | 1      | 3   | 4   | —   | —    | —   | —   | We extract the relevant detail. It fits in a sentence Gary would have put in an appendix. |
| email    | Request the old notes | Ask Gary to email the history. Quick now; the story does not help this choice.          | email     | —        | —          | requested | 1      | 1   | 0   | —   | —    | —   | —   | Gary promises an attachment. The meeting has outsourced its next nine pages.              |

### lunch-committee

| Presentation | Variant when | Speaker | Opening line                                                                             | Response set    |
| ------------ | ------------ | ------- | ---------------------------------------------------------------------------------------- | --------------- |
| base         | —            | jordan  | Would a small lunch committee help? I have a larger group in mind to choose the members. | lunch-committee |

| Response | Label                  | Description                                                                                | Technique | Requires | Reason key | Outcome   | Weight | Min | P   | CB  | Join | End | Nom | Outcome line                                                                               |
| -------- | ---------------------- | ------------------------------------------------------------------------------------------ | --------- | -------- | ---------- | --------- | ------ | --- | --- | --- | ---- | --- | --- | ------------------------------------------------------------------------------------------ |
| hear     | Discuss a committee    | Explore who would help choose lunch. Long discussion, with little progress on the cuisine. | hear      | —        | —          | committee | 1      | 8   | 2   | —   | —    | —   | —   | The committee needs everyone here. We have discovered the meeting we are already in.       |
| owner    | Give Priya the summary | Ask Priya to summarise the cuisine and concerns. Useful focus, with a little work now.     | owner     | —        | —          | summary   | 1      | 3   | 7   | —   | —    | —   | —   | Priya summarises {cuisine} and the remaining concerns. Jordan asks who approves summaries. |
| park     | Postpone the committee | Put the committee aside. Quick, but it contributes nothing to choosing lunch.              | park      | —        | —          | aside     | 1      | 1   | 0   | —   | —    | —   | —   | The committee proposal is filed. It has not been assigned a committee.                     |

### chair-arrangement

| Presentation | Variant when | Speaker | Opening line                                                                      | Response set      |
| ------------ | ------------ | ------- | --------------------------------------------------------------------------------- | ----------------- |
| base         | —            | morgan  | Could we move the chairs into a circle? The current shape feels quite indecisive. | chair-arrangement |

| Response | Label                | Description                                                                             | Technique | Requires | Reason key | Outcome | Weight | Min | P   | CB  | Join | End | Nom | Outcome line                                                                           |
| -------- | -------------------- | --------------------------------------------------------------------------------------- | --------- | -------- | ---------- | ------- | ------ | --- | --- | --- | ---- | --- | --- | -------------------------------------------------------------------------------------- |
| hear     | Rearrange the chairs | Make the room feel collaborative. Takes time without settling a lunch preference.       | hear      | —        | —          | moved   | 1      | 6   | 1   | —   | —    | —   | —   | The chairs form a circle. The conversation had achieved this shape without assistance. |
| refocus  | Keep the seats       | Keep everyone seated and return to lunch. Quick focus, without improving the furniture. | refocus   | —        | —          | seated  | 1      | 1   | 3   | —   | —    | —   | —   | We continue from the existing chairs. Morgan calls it an interim arrangement.          |

### spice-question

| Presentation | Variant when | Speaker | Opening line                                                                         | Response set   |
| ------------ | ------------ | ------- | ------------------------------------------------------------------------------------ | -------------- |
| base         | —            | sam     | I'd consider {cuisine}, but I'd like a mild option. Can we check rather than assume? | spice-question |

| Response | Label                  | Description                                                                               | Technique | Requires | Reason key | Outcome  | Weight | Min | P   | CB           | Join | End | Nom | Outcome line                                                                         |
| -------- | ---------------------- | ----------------------------------------------------------------------------------------- | --------- | -------- | ---------- | -------- | ------ | --- | --- | ------------ | ---- | --- | --- | ------------------------------------------------------------------------------------ |
| hear     | Check mild options     | Read the options properly. A reliable answer takes time and respects the preference.      | hear      | —        | —          | checked  | 1      | 7   | 20  | —            | —    | —   | —   | We check the mild options. Sam wanted information, not a character assessment.       |
| timebox  | Try a quick menu check | Look quickly for a mild option. It may reassure Sam, or an unclear note may set us back.  | timebox   | —        | —          | clear    | 2      | 3   | 22  | —            | —    | —   | —   | The quick check finds a clear mild option. Sam can stop negotiating with adjectives. |
| timebox  | Try a quick menu check | Look quickly for a mild option. It may reassure Sam, or an unclear note may set us back.  | timebox   | —        | —          | unclear  | 1      | 6   | -4  | —            | —    | —   | —   | The menu note is unclear. Sam is less convinced, and we spend longer reading it.     |
| park     | Check spice later      | Move on now and return to the mild option question. The preference still needs attention. | park      | —        | —          | deferred | 1      | 1   | 0   | spice-return | —    | —   | —   | Sam notes the mild option question. Calling it later has not answered it.            |

### alex-arrives

| Presentation | Variant when | Speaker | Opening line                                                                               | Response set |
| ------------ | ------------ | ------- | ------------------------------------------------------------------------------------------ | ------------ |
| base         | —            | legal   | I heard there was a menu discussion. I have the menu, which seemed a useful qualification. | alex-arrives |

| Response | Label                  | Description                                                                       | Technique | Requires | Reason key | Outcome | Weight | Min | P   | CB  | Join  | End | Nom | Outcome line                                                                      |
| -------- | ---------------------- | --------------------------------------------------------------------------------- | --------- | -------- | ---------- | ------- | ------ | --- | --- | --- | ----- | --- | --- | --------------------------------------------------------------------------------- |
| hear     | Give Alex the history  | Welcome Alex and explain the discussion fully. Useful context, with a long recap. | hear      | —        | —          | joined  | 1      | 8   | 10  | —   | legal | —   | —   | Alex joins and gets the full history of a cuisine we have not yet agreed on.      |
| timebox  | Give Alex the question | Welcome Alex with the cuisine and question. A short recap; Alex stays afterward.  | timebox   | —        | —          | joined  | 1      | 3   | 8   | —   | legal | —   | —   | Alex joins and opens the {cuisine} menu. Relevant reading makes a quiet entrance. |

### pat-arrives

| Presentation | Variant when | Speaker | Opening line                                                                       | Response set |
| ------------ | ------------ | ------- | ---------------------------------------------------------------------------------- | ------------ |
| base         | —            | vp      | Mind if I join? I saw lunch in the invitation. Tell me where we are before I help. | pat-arrives  |

| Response | Label                    | Description                                                                                | Technique | Requires | Reason key | Outcome | Weight | Min | P   | CB  | Join | End | Nom | Outcome line                                                                            |
| -------- | ------------------------ | ------------------------------------------------------------------------------------------ | --------- | -------- | ---------- | ------- | ------ | --- | --- | --- | ---- | --- | --- | --------------------------------------------------------------------------------------- |
| hear     | Give Pat the full recap  | Welcome Pat and recap the discussion. Adds context and another person to later costs.      | hear      | —        | —          | joined  | 1      | 8   | 8   | —   | vp   | —   | —   | Pat joins and asks for background. Our attempt to avoid a recap gets its own recap.     |
| timebox  | Give Pat the short recap | Welcome Pat with the cuisine and main concern. Quicker, with Pat staying for the rest.     | timebox   | —        | —          | joined  | 1      | 3   | 6   | —   | vp   | —   | —   | Pat joins and hears the {cuisine} suggestion. The short version receives a long nod.    |
| park     | Save Pat's questions     | Welcome Pat but postpone the questions. Quick now, with another adult staying in the room. | park      | —        | —          | joined  | 1      | 1   | 0   | —   | vp   | —   | —   | Pat joins and writes down a question. The room contains another person with stationery. |

### room-booked

| Presentation | Variant when | Speaker | Opening line                                                                   | Response set |
| ------------ | ------------ | ------- | ------------------------------------------------------------------------------ | ------------ |
| base         | —            | room    | The next team says this room is theirs from minute 45. Our invitation says 60. | room-booked  |

| Response | Label                  | Description                                                                          | Technique | Requires    | Reason key | Outcome   | Weight | Min | P   | CB  | Join | End | Nom | Outcome line                                                                           |
| -------- | ---------------------- | ------------------------------------------------------------------------------------ | --------- | ----------- | ---------- | --------- | ------ | --- | --- | --- | ---- | --- | --- | -------------------------------------------------------------------------------------- |
| hear     | Check the reservation  | Confirm the full booking. Keeps the original hour, at the cost of discussion time.   | hear      | —           | —          | confirmed | 1      | 5   | 0   | —   | —    | 60  | —   | The original hour is confirmed. The next team looks for another room to discuss rooms. |
| timebox  | Accept the earlier end | Accept the shorter booking and keep moving. Quick now, with less time left to agree. | timebox   | —           | —          | shortened | 1      | 1   | 0   | —   | —    | 45  | —   | We accept the earlier finish. The room now has a deadline smaller than its ambitions.  |
| vp       | Ask Pat to handle it   | Let Pat protect the booking. Quick if Pat is here; the lunch question still waits.   | owner     | present: vp | pat-absent | protected | 1      | 1   | 0   | —   | —    | 60  | —   | Pat mentions the original booking. The next team suddenly remembers another room.      |

### menu-read

| Presentation | Variant when | Speaker | Opening line                                                                      | Response set |
| ------------ | ------------ | ------- | --------------------------------------------------------------------------------- | ------------ |
| base         | —            | dev     | I read the menu before coming. It has actual answers to several of our questions. | menu-read    |

| Response | Label                | Description                                                                           | Technique | Requires | Reason key | Outcome | Weight | Min | P   | CB  | Join | End | Nom | Outcome line                                                                               |
| -------- | -------------------- | ------------------------------------------------------------------------------------- | --------- | -------- | ---------- | ------- | ------ | --- | --- | --- | ---- | --- | --- | ------------------------------------------------------------------------------------------ |
| ack      | Use the useful notes | Accept the relevant information and move on. A brief, reliable step toward agreement. | ack       | —        | —          | used    | 1      | 1   | 20  | —   | —    | —   | —   | Dev's notes clarify the {cuisine} options. Preparation has made an unscheduled appearance. |

### small-concession

| Presentation | Variant when | Speaker | Opening line                                                                            | Response set     |
| ------------ | ------------ | ------- | --------------------------------------------------------------------------------------- | ---------------- |
| base         | —            | gary    | I could go along with {cuisine}. You don't need to record that as a change of position. | small-concession |

| Response | Label                 | Description                                                                       | Technique | Requires | Reason key | Outcome  | Weight | Min | P   | CB  | Join | End | Nom | Outcome line                                                                             |
| -------- | --------------------- | --------------------------------------------------------------------------------- | --------- | -------- | ---------- | -------- | ------ | --- | --- | --- | ---- | --- | --- | ---------------------------------------------------------------------------------------- |
| ack      | Accept the concession | Let Gary soften his position without a speech. A short, reliable bit of progress. | ack       | —        | —          | accepted | 1      | 1   | 18  | —   | —    | —   | —   | Gary moves toward {cuisine}. The record will show he was already standing quite near it. |

### menu-return

| Presentation | Variant when | Speaker | Opening line                                                                            | Response set |
| ------------ | ------------ | ------- | --------------------------------------------------------------------------------------- | ------------ |
| base         | —            | sam     | We postponed the meal options. Can we finish that question instead of postponing lunch? | menu-return  |

| Response | Label                 | Description                                                                         | Technique | Requires       | Reason key  | Outcome   | Weight | Min | P   | CB  | Join | End | Nom | Outcome line                                                                               |
| -------- | --------------------- | ----------------------------------------------------------------------------------- | --------- | -------------- | ----------- | --------- | ------ | --- | --- | --- | ---- | --- | --- | ------------------------------------------------------------------------------------------ |
| hear     | Finish the menu check | Settle the deferred meal question. Reliable progress, with a longer check.          | hear      | —              | —           | finished  | 1      | 6   | 18  | —   | —    | —   | —   | We finish the meal check. Sam thanks everyone for establishing that lunch includes food.   |
| owner    | Use Alex's menu notes | Ask Alex to explain the options. Efficient help if the menu reader is already here. | owner     | present: legal | alex-absent | explained | 1      | 3   | 16  | —   | —    | —   | —   | Alex explains the meal options. The deferred question finally earns a full stop.           |
| timebox  | Read the main options | Check the main options together. Quicker, with less reassurance than a full review. | timebox   | —              | —           | read      | 1      | 3   | 10  | —   | —    | —   | —   | We read the main options. Sam gets information rather than another promise to investigate. |

### soup-return

| Presentation | Variant when | Speaker | Opening line                                                                     | Response set |
| ------------ | ------------ | ------- | -------------------------------------------------------------------------------- | ------------ |
| base         | —            | gary    | You promised me a last word on soup. I have reduced it to three opening remarks. | soup-return  |

| Response | Label                 | Description                                                                           | Technique | Requires | Reason key | Outcome | Weight | Min | P   | CB  | Join | End | Nom | Outcome line                                                                           |
| -------- | --------------------- | ------------------------------------------------------------------------------------- | --------- | -------- | ---------- | ------- | ------ | --- | --- | --- | ---- | --- | --- | -------------------------------------------------------------------------------------- |
| hear     | Hear the last word    | Honour the promised discussion. Takes time and does little for choosing a cuisine.    | hear      | —        | —          | heard   | 1      | 6   | 1   | —   | —    | —   | —   | Gary finishes his soup remarks. The lunch discussion is permitted to resume.           |
| refocus  | Close the soup debate | Acknowledge Gary and close the tangent. Quick focus, with the soup theory unresolved. | refocus   | —        | —          | closed  | 1      | 1   | 4   | —   | —    | —   | —   | Soup keeps its ambiguous status. The promise is discharged; no sequel is commissioned. |

### spice-return

| Presentation | Variant when | Speaker | Opening line                                                                         | Response set |
| ------------ | ------------ | ------- | ------------------------------------------------------------------------------------ | ------------ |
| base         | —            | sam     | The mild option question is back. I still need an answer, rather than encouragement. | spice-return |

| Response | Label                   | Description                                                                           | Technique | Requires       | Reason key  | Outcome   | Weight | Min | P   | CB  | Join | End | Nom | Outcome line                                                                              |
| -------- | ----------------------- | ------------------------------------------------------------------------------------- | --------- | -------------- | ----------- | --------- | ------ | --- | --- | --- | ---- | --- | --- | ----------------------------------------------------------------------------------------- |
| hear     | Finish the spice check  | Settle the deferred preference. Reliable reassurance takes a longer discussion.       | hear      | —              | —           | finished  | 1      | 6   | 18  | —   | —    | —   | —   | We finish checking mild options. Nobody has to defend a preference to a whiteboard.       |
| owner    | Ask Alex for the detail | Use Alex's menu reading to answer. Efficient, if Alex is already in the room.         | owner     | present: legal | alex-absent | explained | 1      | 3   | 16  | —   | —    | —   | —   | Alex clarifies the mild options. Sam's preference is treated as information, which helps. |
| timebox  | Check the key wording   | Read the key wording together. Quicker than the full check, with less detail settled. | timebox   | —              | —           | read      | 1      | 3   | 10  | —   | —    | —   | —   | We read the relevant wording. The conversation gets more specific and less motivational.  |

### filler

| Presentation | Variant when | Speaker | Opening line                                                 | Response set |
| ------------ | ------------ | ------- | ------------------------------------------------------------ | ------------ |
| base         | —            | room    | Nobody speaks. The clock has no such professional restraint. | filler       |

| Response | Label                  | Description                                                                             | Technique | Requires | Reason key | Outcome | Weight | Min | P   | CB  | Join | End | Nom | Outcome line                                                                   |
| -------- | ---------------------- | --------------------------------------------------------------------------------------- | --------- | -------- | ---------- | ------- | ------ | --- | --- | --- | ---- | --- | --- | ------------------------------------------------------------------------------ |
| ack      | Wait through the pause | Let the silence pass. Discussion time still passes, without moving the cuisine forward. | ack       | —        | —          | waited  | 1      | 2   | 0   | —   | —    | —   | —   | Someone caps a marker. The room has spent another pause considering {cuisine}. |

## Disabled reasons

These are all used reason keys, with no unused starter-absence keys. A disabled
invitation is not a refusal to let someone leave; the entrant is already present.

| Key          | Copy                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| alex-present | Alex is already here. Use the menu discussion rather than inviting Alex twice. |
| pat-present  | Pat is already here. A second invitation would only encourage a second recap.  |
| alex-absent  | Alex has not joined. You can still check the menu together.                    |
| pat-absent   | Pat has not joined. Choose an option the people here can carry out.            |

## Title catalog

All predicates and IDs below are accepted, not new tuning. Names and flavour lines
are draft copy. Display priority remains slots 12,9,10,11,1,2,3,4,5,6,7,8; unlock
all earned, display first in that order. Use unrounded average q; no scored q
means slot 9 cannot unlock. Score thresholds use rounded component total.
Every successful title appears beside the cuisine result; a title alone is not
the success summary. Flavour lines below make no success claim on failure titles.

| Slot | ID                       | Name                         | Exact predicate                                              | Flavour line                                                                         |
| ---- | ------------------------ | ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| 1    | inbox-zero               | Inbox Zero                   | total score ≥950                                             | A meeting so efficient someone will ask you to organise another one.                 |
| 2    | efficient-facilitator    | Efficient Facilitator        | ending=decision and score ≥850                               | You kept lunch within sight of the people discussing it.                             |
| 3    | lunch-agreed             | Lunch Is Settled             | ending=decision and agreedCuisine recorded                   | The board can stop auditioning headings. {agreedCuisine} survives the final draft.   |
| 4    | death-by-diligence       | Death by Diligence           | ending=decision and personMinutes ≥270                       | The discussion developed traditions. At last, one of them is eating {agreedCuisine}. |
| 5    | table-for-six            | Table for Six                | ending=decision and final headcount=6                        | The original six agreed on {agreedCuisine}. Nobody had to book an extra chair.       |
| 6    | reply-all-royalty        | Reply-All Royalty            | peakHeadcount=8                                              | Eight adults were involved. Lunch acquired an audience.                              |
| 7    | parking-lot-attendant    | Parking Lot Attendant        | parkedCount ≥4                                               | Several topics were postponed. Your notes have a busier afternoon than you do.       |
| 8    | second-helping           | Second Helping               | ending=decision and resolvedCallbackCount ≥1                 | We returned to a postponed topic and still reached {agreedCuisine}. Seconds, anyone? |
| 9    | played-it-right          | Played It Right, Lost Anyway | scored decision count ≥1 and avg q ≥0.85 and ending≠decision | Sensible choices, no agreement. The room declines to reward your judgement.          |
| 10   | take-this-offline        | Let's Take This Offline      | ending=called-early                                          | You ended the discussion. The invitation for the next one is already being drafted.  |
| 11   | calendar-criminal        | Calendar Criminal            | ending=time-expired                                          | The booking ended before the discussion did. The next team brought witnesses.        |
| 12   | could-have-been-an-email | This Could've Been an Email  | ending=cancelled                                             | No discussion was resolved. An email can still have a subject line.                  |

Fallback heading is noncollectible and ending-specific in the copy catalog below.
Slot 3 covers every valid success. Store only lunch awards in tcbae:v2:titles;
preserve raw tcbae:v1:titles separately, with no automatic earning/remapping.

For legacy display retain names from the historical launch catalog. Its complete
IDs are inbox-zero, efficient-facilitator, ship-it-and-pray, death-by-diligence,
skeleton-crew, reply-all-royalty, parking-lot-attendant, gary-free-zone,
played-it-right, take-this-offline, calendar-criminal, could-have-been-an-email.
The three retired names are Ship It and Pray, Skeleton Crew, Gary-Free Zone.
The other nine names match the retained names above. Legacy awards never count
toward the twelve lunch slots; no legacy predicate is evaluated during lunch.

## Epilogues and factual moments

Exactly one epilogue by ending, no risk tiers. Success uses agreedCuisine, never
the nomination as a substitute. A cancelled run has no resolved nomination; an
unresolved first presentation is not an agreement or an earned lunch decision.

| Key          | Ending       | Line                                                                                |
| ------------ | ------------ | ----------------------------------------------------------------------------------- |
| decision     | decision     | Everyone present agrees on {agreedCuisine}. Lunch may now proceed without minutes.  |
| called-early | called-early | No agreement. The discussion ends; the lunch suggestion remains a suggestion.       |
| time-expired | time-expired | No agreement. The next team gets the room and inherits none of our lunch expertise. |
| cancelled    | cancelled    | No agreement. This could have been an email. There is still time to make it one.    |

Moment priority: first postponed topic in resolve-log order, else first join,
else ending fallback. These are narrative summaries only, never rule inputs.
For any selected park response, obtain topic from the catalog below; for join,
attendee/minute are the recorded post-response join facts. No speaker speech-time
claim. Minute is elapsed discussion time, not wall-clock play duration.

| Event / park response  | Topic            |
| ---------------------- | ---------------- |
| menu-needs / park      | meal options     |
| projector / park       | big screen       |
| soup-debate / park     | soup debate      |
| lunch-committee / park | lunch committee  |
| spice-question / park  | spice preference |
| pat-arrives / park     | Pat's questions  |

| Key               | Use                        | Line                                                                                |
| ----------------- | -------------------------- | ----------------------------------------------------------------------------------- |
| first-postponed   | first selected park        | Postponed at minute {minute}: {topic}. The notes will remember.                     |
| first-arrival     | first join, if no park     | {attendee} joined at minute {minute}. The discussion acquired another chair.        |
| decision-fallback | decision, no park/join     | The room agreed on {agreedCuisine}. Nobody needed a follow-up to identify lunch.    |
| early-fallback    | called-early, no park/join | The discussion stopped before agreement. The suggestion is still only a suggestion. |
| expiry-fallback   | time-expired, no park/join | No cuisine was agreed before the booking ended. The next team would like its room.  |
| cancel-fallback   | cancelled                  | No discussion resolved. No cuisine agreed. Just an available email subject.         |

The short topic labels support log moments, not a new visible risk/topic meter.
Slot 7 is the existing park-action count; topics may be acknowledged without
scheduling a return. soup-return itself never increments parkedCount.

## Interface, results and share copy

Catalog entries below are complete authored text units for later UI transcription;
long explanations use separate lines, not an automatic limit increase. Text-only
L07 can use these without art. Runtime labels removed by the redesign must not be
carried forward from launch. Placeholder formatting is UI-only, using engine facts.

| Key                       | Copy                                                                                     |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| product-title             | This Could've Been an Email                                                              |
| objective                 | Agree on a cuisine for lunch.                                                            |
| premise                   | Six adults. One lunch. Apparently this needs a meeting.                                  |
| start                     | Start                                                                                    |
| loading                   | Booking the room…                                                                        |
| load-failed               | The room did not load. Lunch is not being delayed for a dramatic entrance.               |
| retry                     | Retry                                                                                    |
| meeting                   | The lunch meeting                                                                        |
| instructions-action       | Choose a suggestion, then help the room agree. Time moves when you answer.               |
| instructions-cost         | Everyone stays. Extra colleagues make later discussion more expensive.                   |
| instructions-chance       | Some choices can turn out differently. Their descriptions explain the possible setback.  |
| keyboard                  | Enter: show choices or continue. 1–3: choose a response.                                 |
| show-choices              | Show choices                                                                             |
| continue                  | Continue                                                                                 |
| call-it                   | Call it                                                                                  |
| call-it-description       | End the discussion without agreement.                                                    |
| roster                    | In the room                                                                              |
| room-speaker              | The room                                                                                 |
| room-accessible           | In the lunch meeting: {roster}.                                                          |
| progress                  | Agreement progress                                                                       |
| minutes                   | Minutes discussed                                                                        |
| booking                   | Booking ends at minute                                                                   |
| remaining                 | Minutes remaining                                                                        |
| cost                      | Discussion cost                                                                          |
| cost-explanation          | Salary time spent discussing lunch, not the price of food.                               |
| considering-empty         | No cuisine suggested yet                                                                 |
| considering               | Considering: {cuisine}                                                                   |
| headcount                 | Adults present                                                                           |
| peak-headcount            | Most adults present                                                                      |
| postponed                 | Topics postponed                                                                         |
| results                   | Results                                                                                  |
| score                     | Score                                                                                    |
| outcome-component         | Agreement                                                                                |
| efficiency-component      | Cost efficiency                                                                          |
| decisions-component       | Choices                                                                                  |
| choices-explanation       | Choices rewards the expected tradeoff when you chose, before any uncertain outcome.      |
| actual-explanation        | Agreement and cost reflect what actually happened. A setback need not mean a bad choice. |
| success-result            | Agreed: {agreedCuisine}                                                                  |
| success-summary           | Everyone present agreed on {agreedCuisine}.                                              |
| failure-result            | No agreement                                                                             |
| failure-nomination        | Suggested: {cuisine}. Not agreed.                                                        |
| failure-no-nomination     | No cuisine was nominated.                                                                |
| ended-decision            | Agreed: {agreedCuisine}                                                                  |
| ended-called-early        | Discussion ended early. No agreement.                                                    |
| ended-time-expired        | Booking expired. No agreement.                                                           |
| ended-cancelled           | Meeting cancelled. No agreement.                                                         |
| fallback-decision-heading | Agreed: {agreedCuisine}                                                                  |
| fallback-failure-heading  | No agreement                                                                             |
| moment                    | Meeting moment                                                                           |
| replay                    | Play again                                                                               |
| current-collection        | Lunch collection                                                                         |
| legacy-collection         | Launch meeting collection                                                                |
| legacy-explanation        | Awards from the original launch meeting. They do not fill the lunch collection.          |
| collection-count          | {unlocked} of 12 lunch titles                                                            |
| locked-title              | Not yet earned                                                                           |
| newly-earned              | New title earned: {title}                                                                |
| share                     | Share result                                                                             |
| download                  | Download image                                                                           |
| copy-text                 | Copy text                                                                                |
| copied                    | Text copied                                                                              |
| clipboard-fallback        | Copy the text below. The clipboard has declined the invitation.                          |
| save-image                | Press and hold the image to save it.                                                     |
| share-unavailable         | File sharing is unavailable here. You can save the image or copy the text.               |
| share-failed              | Sharing did not finish. You can still save the image or copy the text.                   |
| share-success             | We agreed on {agreedCuisine} in This Could've Been an Email.                             |
| share-early               | No lunch agreement. I ended the discussion in This Could've Been an Email.               |
| share-expired             | No lunch agreement. The room booking expired in This Could've Been an Email.             |
| share-cancelled           | No lunch agreement. I cancelled the meeting in This Could've Been an Email.              |
| share-nomination          | Suggested: {cuisine}. Not agreed.                                                        |
| share-score               | Score: {score}/1000                                                                      |
| share-time                | Discussion: {minute} minutes                                                             |
| share-cost                | Salary cost: {cost}                                                                      |
| share-peak                | Peak attendance: {headcount} adults                                                      |
| share-seed                | Seed: {seed}                                                                             |
| share-revision            | Rules/content: {revision}                                                                |
| replay-caveat             | Replay needs the same revision, seed and actions. Seeds may differ in difficulty.        |
| error                     | The meeting hit a problem. Start a new meeting to try again.                             |
| error-restart             | Start a new meeting                                                                      |

Results show earned heading + cuisine result + ending-specific epilogue, score
components, actual time/cost/peak headcount, factual moment and collections.
Share/card composition uses the ending's share line, score/time/cost/peak and
optional failure nomination. A successful card always includes success-result
and share-success; neither is replaced by the collectible name. Failure card
always includes failure-result, never success text. Cancellation uses
failure-no-nomination. Share cancellation by the operating system is not an error.
No fake probability, invented preference votes, food price or equal-difficulty claim.

The room-accessible template expands the roster in catalog order with comma-space
separators. Maximum roster text is Priya, Dev, Sam, Morgan, Gary, Jordan, Alex, Pat,
in catalog order.
For bounded copy checks use minute=69, headcount=8, score=1000, unlocked=12,
title=Played It Right, Lost Anyway, cost=$9,200 and a 16-character seed.
69 conservatively allows a full last response past the original 60-minute booking;
personMinutes ≤552 at eight adults, so the display bound is $9,200.
Use literal revision lunch-l02-draft-2 for draft examples. Future longer revision
labels need their own copy check; never truncate cuisine identity.

## Fourth-wall commentary

Nonnumeric only; no pizza/printer price assumptions. Eligibility predicates below
are exact comparisons on post-resolution authoritative state. Lowest priority
number wins among eligible, unseen IDs. Apply the approved global cadence first:
first after third resolution, at least three resolutions between, maximum three
per run, no duplicate ID. Secondary text only; no effects, turns, RNG or timers.
Success commentary uses the actual agreement. Other commentary avoids agreement
claims and remains true after success/expiry if its predicate still matches.

| ID                   | Priority | Predicate                                     | Line                                                                                |
| -------------------- | -------- | --------------------------------------------- | ----------------------------------------------------------------------------------- |
| agreement-commentary | 10       | ending=decision and agreedCuisine non-null    | {agreedCuisine} is agreed. You may now close the meeting about having lunch.        |
| nearly-there         | 20       | phase=running and progress ≥80                | A decision is getting close. Resist the urge to schedule its announcement.          |
| full-room            | 30       | present.length=8                              | Every available chair is occupied. Lunch has achieved excellent attendance.         |
| topic-returned       | 40       | resolvedCallbackCount ≥1                      | A postponed topic has returned. The notes were not a witness protection scheme.     |
| expensive-discussion | 50       | personMinutes ≥180                            | You are spending salaries on the discussion. The food has not submitted an invoice. |
| postponed-again      | 60       | parkedCount ≥2                                | More than one topic has been postponed. The email is beginning to write itself.     |
| still-considering    | 70       | phase=running and progress ≤30 and minute ≥15 | Lunch is still under discussion. This is the part the title warned you about.       |

No fallback commentary: if none qualifies, show none. Do not count reading time
or claim any person spoke for a measured duration. Commentary predicates do not
add new event Condition fields; they are the approved commentary metadata.

## Constructed walkthroughs and reachability

These are hand-constructed legal draws/branches, not engine executions, observed
humour, seeded replay evidence or balance statistics. Positive tickets make the
shown draws possible; first-two and negative guards still apply. H billed is
before resolution, H after includes joins. P clamps independently on every row.
CB due numbers refer to draw turn, not minutes or number of Continue taps.
No walkthrough releases anyone. Later L05 tests must use engine evaluation.

### Success with a callback, no rare gifts

Italian nominated; six stay throughout. Soup is parked at turn 5, due at 7 after
one intervening draw. The returning tangent gets its last word and closes.

| Turn | Family            | Response | Outcome    | H billed | P after | T after | pm total |
| ---- | ----------------- | -------- | ---------- | -------- | ------- | ------- | -------- |
| 0    | nominate-cuisine  | italian  | nominated  | 6        | 8       | 2       | 12       |
| 1    | menu-needs        | hear     | checked    | 6        | 26      | 8       | 48       |
| 2    | projector         | park     | skipped    | 6        | 26      | 9       | 54       |
| 3    | portion-plan      | owner    | individual | 6        | 44      | 13      | 78       |
| 4    | spice-question    | hear     | checked    | 6        | 64      | 20      | 120      |
| 5    | soup-debate       | park     | promised   | 6        | 64      | 21      | 126      |
| 6    | chair-arrangement | refocus  | seated     | 6        | 67      | 22      | 132      |
| 7    | soup-return       | refocus  | closed     | 6        | 71      | 23      | 138      |
| 8    | lunch-window      | timebox  | bounded    | 6        | 82      | 26      | 156      |
| 9    | quick-agreement   | hear     | heard      | 6        | 100     | 33      | 198      |

Result: decision, nominatedCuisine=italian, agreedCuisine=italian, bookingEnd=60,
resolvedCallbackCount=1, parkedCount=2, peakHeadcount=6. Display “Agreed: Italian”
and the Italian success epilogue. Slots 3/5/8 qualify. First moment is big screen at
minute 9, ahead of the later soup postponement. Commentary follows cadence;
it must not obscure the final cuisine result.

### Failure with an arrival and shortened booking

Thai is a nomination throughout, never an agreement. Pat's doorway family is
eligible after minute 15; it is separated from room-booked by a common event.

| Turn | Family           | Response | Outcome    | H billed | P after | T after | pm total |
| ---- | ---------------- | -------- | ---------- | -------- | ------- | ------- | -------- |
| 0    | nominate-cuisine | thai     | nominated  | 6        | 8       | 2       | 12       |
| 1    | portion-plan     | email    | sent       | 6        | 15      | 4       | 24       |
| 2    | introductions    | hear     | introduced | 6        | 17      | 12      | 72       |
| 3    | soup-debate      | hear     | theory     | 6        | 19      | 21      | 126      |
| 4    | pat-arrives      | hear     | joined     | 6        | 27      | 29      | 174      |
| 5    | projector        | hear     | searched   | 7        | 29      | 36      | 223      |
| 6    | room-booked      | timebox  | shortened  | 7        | 29      | 37      | 230      |
| 7    | lunch-history    | hear     | history    | 7        | 32      | 46      | 293      |

Result: time-expired at bookingEnd=45; agreedCuisine=null, P=32, H/peak=7.
Bill all nine final minutes, not only time remaining. Display “No agreement” and
“Suggested: Thai. Not agreed.” Share-expired must not become share-success.
First moment is Pat joined at minute 29. The nomination never selects an epilogue.

### Invitations, higher subsequent cost and a second presentation

Mexican nomination; explicitly choose helpful branch of the Alex invitation.
Both invite outcomes admit Alex; this route does not assume favourable branches
are guaranteed. Invitation to Pat is legal before Pat's spontaneous time gate.

| Turn | Family            | Response | Outcome    | H billed | P after | T after | pm total |
| ---- | ----------------- | -------- | ---------- | -------- | ------- | ------- | -------- |
| 0    | nominate-cuisine  | mexican  | nominated  | 6        | 8       | 2       | 12       |
| 1    | menu-needs        | invite   | helpful    | 6        | 24      | 6       | 36       |
| 2    | portion-plan      | owner    | individual | 7        | 42      | 10      | 64       |
| 3    | quick-agreement   | invite   | briefed    | 7        | 54      | 14      | 92       |
| 4    | lunch-window      | pat      | protected  | 8        | 70      | 17      | 116      |
| 5    | projector         | timebox  | shared     | 8        | 73      | 19      | 132      |
| 6    | spice-question    | hear     | checked    | 8        | 93      | 26      | 188      |
| 7    | chair-arrangement | refocus  | seated     | 8        | 96      | 27      | 196      |
| 8    | lunch-committee   | owner    | summary    | 8        | 100     | 30      | 220      |

Result: decision, Agreed: Mexican, H/peak=8. Slots 3/6 qualify. lunch-window uses
variant-1 at draw 4 and the same response set. alex-arrives/pat-arrives are now
ineligible; invitations are disabled with alex-present/pat-present in hypothetical
pending presentations. Initial arrival minutes are charged to six then seven;
later responses cost eight. First moment is Alex joined at minute 6.

### Every callback due at n+2

Each row below is a separate constructed fresh route. Ending by Call it at the
intervening event suppresses its due callback; acknowledgement never draws twice.

| Parent / target               | Ordered resolutions                                                                                      | Due draw | Final P | T   | pm  |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- | -------- | ------- | --- | --- |
| menu-needs / menu-return      | nominate-cuisine/thai; menu-needs/park; introductions/timebox; menu-return/hear                          | 3        | 27      | 11  | 66  |
| soup-debate / soup-return     | nominate-cuisine/thai; portion-plan/email; soup-debate/park; introductions/timebox; soup-return/refocus  | 4        | 20      | 8   | 48  |
| spice-question / spice-return | nominate-cuisine/thai; portion-plan/email; spice-question/park; introductions/timebox; spice-return/hear | 4        | 34      | 13  | 78  |

For each callback with an Alex response, repeat with Alex already present by
invitation or doorway arrival before parking the parent. Its owner option enables;
without Alex it disables and hear/timebox stay enabled. Callback openings still
refer to postponement. No callback has a presence/minute draw condition or sequel.

### Both branches and deterministic alternatives

| Scenario                | Constructed decision state                            | Branch results                                          | Deterministic alternative |
| ----------------------- | ----------------------------------------------------- | ------------------------------------------------------- | ------------------------- |
| menu-needs/invite       | After nomination: P8, T2, pm12, H6; Alex absent       | helpful: P24,T6,pm36,H7; more-questions: P12,T9,pm54,H7 | hear: P26,T8,pm48,H6      |
| quick-agreement/refocus | After nomination: P8,T2,pm12,H6; Pat absent           | momentum: P31,T5,pm30; objections: P2,T9,pm54           | hear: P28,T9,pm54         |
| spice-question/timebox  | After nomination + portion-plan/email: P15,T4,pm24,H6 | clear: P37,T7,pm42; unclear: P11,T10,pm60               | hear: P35,T11,pm66        |

The two quick-agreement branches have identical pre-roll q. At that state their
expected utility is 5.88; hear is 11.6 and invite is 7.2, so refocus q=0 on either
branch. Menu invite U=4.96 versus hear=10.8 and park=−1.2; q=77/150 before either
branch. Spice timebox U=128/15 versus hear=58/5 and park=−6/5; q=73/96 before
either branch. These exact arithmetic checks illustrate the approved formula,
not a tuning endorsement or numerical player preview.

### Coverage and boundary witnesses for later engine tests

| Group                  | Constructed witness / expected relationship                                                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| All base presentations | Resolve nomination, then a common substantive before non-substantive families; leave requested family unseen, respect prior-negative guard and any family condition. Six starters always present. |
| lunch-window/base      | Before Pat arrives, unseen lunch-window; pat response disabled.                                                                                                                                   |
| lunch-window/variant-1 | Invite Pat through quick-agreement first, leave lunch-window unseen; pat response enabled.                                                                                                        |
| Alex invitation states | menu-needs/invite before Alex joins; after doorway arrival it disables. Test both branches before joining; both join once.                                                                        |
| Pat invitation states  | quick-agreement/invite before Pat joins; after doorway arrival it disables. Invitation has no minMinute gate.                                                                                     |
| Alex doorway           | Alex absent after first two draws; every response joins. After menu invitation family is ineligible.                                                                                              |
| Pat doorway            | Pat absent and T≥15 after first two; T14 ineligible, T15 eligible. Every response joins. Invitation suppresses family.                                                                            |
| Present-dependent help | menu-return/owner and spice-return/owner absent/present Alex; lunch-window/pat and room-booked/vp absent/present Pat.                                                                             |
| Nomination equality    | Each of Italian/Mexican/Thai gives P8,T2,pm12,H6, q=null. Only cuisine identity differs.                                                                                                          |
| Cancel                 | Call it before first resolution: cancelled, P0,T0,pm0, both cuisines null; no nomination or agreement result.                                                                                     |
| Early end              | Nominate then Call it: called-early, P8,T2,pm12, nominated cuisine only; no callback delivery afterward.                                                                                          |
| Booking                | At T44, room-booked/timebox finishes T45 and expires; T46→47 also expires. hear at T44 keeps 60 and finishes T49. Pat/vp at T44 keeps 60 and finishes T45. All have ΔP0.                          |
| Completing join        | Fixture P92 with nominated cuisine, Alex absent: alex-arrives/timebox adds 8, bills old H, records agreement including Alex before expiry.                                                        |
| Deadline precedence    | Fixture P82,T59,H6, nominated cuisine: portion-plan/owner finishes P100,T63,pm+24, decision; no prorating. P81 gives P99 and expiry instead.                                                      |
| Branch clamping        | At P0 quick-agreement/objections loses 0 effective P; at P95 momentum gains 5. Compute each branch utility separately; never clamp average effect.                                                |
| Filler                 | Eligible pool exhausted and queue empty: filler/ack +2 minutes, ΔP0, no join/schedule/booking. Repeats until expiry. At most 17+3+ceil(60/2)=50 resolutions.                                      |

Fixture witnesses deliberately name hypothetical valid decision states to test
rules, not claim a natural seed reaches them. Constructed complete routes above
use draft rows; seeded reachability/coverage are L05/L08/L10/L11 work.

Title witnesses: the ten-turn success qualifies slots 3/5/8. Insert lunch-history/
hear and introductions/hear before its later substantive choices to reach agreement
at T50, pm300, qualifying slot 4. For high score choose nomination, menu-needs/hear,
menu-read/ack, small-concession/ack, portion-plan/owner, spice-question/hear:
P100,T21,pm126, all scored q=1, O400/E260/D300=960, qualifying slots 1/2.
The two gifts are rare but positive-weight; no frequency claim. The invitation
success qualifies slot 6. For slot 7, resolve nomination/thai, portion-plan/email, projector/park,
lunch-committee/park, soup-debate/park, menu-needs/park, soup-return/refocus,
menu-return/timebox. The callbacks are due at draws 6 and 7; final P29,T12,pm72,
parkedCount=4. This witnesses slot 7 without a callback collision. Choose menu-needs/hear
after nomination, then Call it: scored q=1, no agreement, so slots 9/10 qualify.
The failure witnesses slot 11; pre-resolution cancel witnesses slot 12. Every
slot has a legal construction; none establishes balanced rarity or human enjoyment.

## Review decisions and editorial follow-ups

[Claude's L02 review](L02-review.md) identified two content decisions for the
final D18 handoff. They remain open; this correction changes no effect, weight,
technique, availability condition, arrival/callback relationship or title predicate.

- **D1 — uncertain choices are dominated at the documented early states.** At those
  decision states, menu-needs/invite U=4.96 versus hear=10.8;
  quick-agreement/refocus U=5.88 versus hear=11.6 (q=0);
  spice-question/timebox U=128/15 versus hear=58/5. The review's universal claim
  that Greedy never takes a gamble is false at some valid clamped boundaries:
  at P94,H6,Alex absent, menu-needs/invite U=−26/25 beats hear and park (both −6/5),
  so invite has q=1. At P99,H7,Pat present, quick-agreement/refocus U=−206/25
  beats hear (−44/5); the Pat invitation is disabled, so refocus has q=1.
  These document-state witnesses are not seeded frequency results. Before final
  D18 approval Harry must consider whether uncertainty is competitive at enough
  useful stages, or request L12 tuning with before/after reports and unchanged
  formulas/targets. Do not approve an “always traps” premise these numbers refute.
  L02b must not settle this by editing weights/effects; L11/L12 measure policy
  selection across actual runs. The three early-state utilities/q above stay valid.
- **D2 — expert-dependent paths expand from one each to two each.** Pat retains
  room-booked/vp at P0 and additionally enables lunch-window/pat at P16. Alex
  enables menu-return/owner and spice-return/owner; those benefits require a
  previously deferred meal/spice question. Inviting Alex does not guarantee a
  future useful callback. The approved lunch plan opens expert benefits to
  content review, but this expansion still needs explicit consideration in
  Harry's D18 approval. L02b must preserve the draft paths and flag the decision.
- **D3 — room-booking trap remains intentional.** No mechanical correction is
  requested: hear buys the original hour with discussion time; timebox accepts
  45 cheaply; vp keeps 60 at P0 and loses the ASCII tie-break to timebox.

The five factual defects are corrected: soup-return no longer assumes the mug
story was heard; Alex's recap no longer assumes a cable event occurred; postponed
moments use a colon template that fits all topic names; projector choices/topics
describe the menu screen; room-booked uses wording true before or after minute 45.
The checker expands every authored cuisine/name/topic substitution, rather than
only one longest topic. Commentary ID agreement-commentary is distinct from the
lunch-agreed title ID. Draft revision 2 records these corrections.

Specific L02b follow-ups from Claude's optional writing assessment: vary the
repeated action/tradeoff and fact/wry-follow-up rhythm while retaining clarity;
reduce Gary's use as other speakers' punchline; distinguish Priya's voice from
the narrator and give Morgan more of the confident-summary habit. Focused edits
here remove the unexplained “minuted” wording, Pat's unfulfilled preference
promise, two flat arrival endings and three identical title-flavour openings.
They do not constitute the scheduled full writing review. Inspect remaining
repetition across every row in L02b and record keep/change reasons there.
L09 must specifically probe whether the Alex invitation's description predicts
longer discussion and higher subsequent cost, before the outcome is shown.

## L02 checks, issues and handoff

Document-check results are recorded in the [implementation plan](implementation-plan.md).
The reproducible checker is [lunch-content-checks.py](lunch-content-checks.py).
It reads documentation only; it does not validate or bind a runtime pack.
Formatting and reference checks accompany it. Full rendered 320 px fitting,
engine fixtures, replay and statistical tuning remain at their scheduled tasks.

Outstanding review issues: L02b must assess every opening, label, description,
outcome, catalog and constructed run for voice, clarity, humour, repetition and
honest tradeoffs. Initial weights/effects are unapproved hypotheses; this draft
makes no policy-band, 9–12 median-turn or technique-share claim. Preserve the
intentional room-booking tradeoff: hear pays more now to keep 60; timebox keeps
less time cheaply; vp ties timebox utility and timebox wins the existing ASCII
tie-break. Do not retune that behavior in an editorial pass. Dietary copy describes
finding suitable options, not medical/dietary safety certification.

Handoff to L02b: all 21 headings are review groups; each presentation and each
family/response/outcome address is in scope, plus every catalog key and template.
Use [the dedicated review brief](lunch-writing-review.md), record coverage and
before/after reasons in its scheduled report, preserve mechanical columns, and
flag design issues separately. The AI writing review has not been performed here.
After that review Harry gives final D18 approval. No content transcription,
gameplay, L02b report, human acceptance or runtime activation belongs to L02.
Original task 12a's V4 remains pending in its separate historical record.
