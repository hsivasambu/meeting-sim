# This Could've Been an Email — Design Doc v2

Oct 7, 2026 · @Harry

Reconciled October 7, 2026 with Harry’s D01–D12 direction. Revised October 8, 2026 for the accepted architecture review (D13–D26): Greedy spread measured among wins, conditional effect cases removed, a reviewed content table before implementation, and a room drawn without a game engine. These decisions are the implementation baseline; numerical balance targets remain unverified until simulation.

## Summary of changes

v2 keeps the premise, art direction and MVP size from the v1 brief. It rebuilds seven mechanics so that the score is decided by skill, not luck.

| Area | v1 brief | v2 design | Why |
| --- | --- | --- | --- |
| Cost | Time × a fixed headcount | Headcount changes during the meeting (people join, people are released), billed at a deliberately absurd rate | Cost becomes its own lever instead of a copy of time |
| Consequences | Progress only | Open Risks count what was skipped or parked | Shortcuts have a price; the fastest meeting is not always the best one |
| Randomness | Hidden dice on every response | Random events; every response has a fixed effect shown before the player picks | Players can see exactly why they won or lost |
| Scoring | 500-point pass/fail objective; efficiency paid regardless of progress | Efficiency scaled by progress; each decision scored against the best option available | Quitting early can't pay; a rough draw can't erase good play |
| Setup | Meeting type, attendees, duration and rate menus | One tap to start; every play is a fresh random meeting | Meets the 15-second goal; replays differ |
| Clock | Real-time vs. turn-based undefined | Turn-based: time moves only when an event resolves | Reading speed and phone screens don't affect the score |
| Validation | Playtesting | Playtesting plus a headless simulation harness | Balance backed by numbers, and a strong blog hook |

**Design goals**

- A new player understands the goal within 15 seconds.
- A run lasts 2–3 minutes, about 10 turns.
- A good player wins 70–85% of meetings; a random player wins 20–35%.
- A slow, thorough meeting outscores a fast, reckless one.
- Failing is still funny, and a player who chose well but drew a rough meeting gets a title that says so.
- A typical visitor plays 2–3 times, each a different meeting.

## Core loop

The player taps **Start** and is in the room. There are no setup menus. Each turn is one event, and the meeting clock moves only when an event resolves.

**The fixed scenario (MVP)**

- *The Friday Launch Meeting*, held in person in one conference room. "Reach a go/no-go decision on Friday's launch before the hour is up."
- 60-minute booking and 6 starting attendees with absurd job titles, each billed at $1,000/hour. The rate is deliberately ridiculous; Scoring explains why it doesn't affect points.
- A run is about 10 turns. Each event costs 1–10 meeting minutes, and each turn takes 10–15 seconds to read and answer, so a run lasts 2–3 minutes.

**Every play is a new meeting**

- Each run uses a fresh random seed, so replays draw a different sequence of events. There is no daily meeting and no practice mode.
- Shared scores aren't strictly comparable, and that's accepted: the luck of the draw is part of the joke.

**Anytime actions** (cost no meeting time)

- **Release an attendee:** tap a HUD portrait → "Thanks, you can drop off." This lowers the cost per minute. Priya cannot leave, and the final other attendee cannot leave Priya alone. If an event needs an expert who was released, their best responses are unavailable.
- **Call it:** end the meeting now and go to the results card.

&#91;embedded content: turn loop · 4 steps, 1 check, 2 anytime actions\]

The loop repeats until progress reaches 100, the current booking expires (60 minutes, or 45 after an unnegotiated room booking), or the player calls it.

## Game state model

The meeting runs on five variables, all visible on the HUD. Headcount and Open Risks are new in v2. They make cost and quality separate from time.

| Variable | Range | Shown as | Changes when | Why it matters |
| --- | --- | --- | --- | --- |
| Progress (P) | 0–100 | Bar | A response resolves | P = 100 means the team is ready to decide; the meeting ends |
| Minutes elapsed (T) | 0–69; booking ends at 60 or 45 | Countdown clock | A response resolves (+1 to +10 min) | After a response, the meeting ends if T ≥ the current booking end |
| Headcount (H) | 2–8, starts at 6 | Faces at the table | Escalation events add people; the player releases people | Sets how fast cost climbs |
| Cost (C) | $0 and up | Ticking $ counter | Each resolution, by the formula below | Scored relative to a reference meeting |
| Open Risks (R) | 0–5 | Sticky notes on a "parking lot" board | +1 when a substantive issue is parked or dismissed; −1 when one is resolved | Lowers the outcome score and the launch epilogue |

**Cost per resolution**

```latex
\Delta C = H \times \$1{,}000/\text{hr} \times \frac{\Delta T}{60}
```

At the starting headcount, each meeting minute costs $100. The VP joining makes it $117; releasing two people makes it $67. The rate is set high on purpose for absurdity, and scoring uses cost relative to a reference meeting, so the rate never changes a score.

**Resolution and attendance boundaries**

Bill the full response duration at the headcount immediately before resolution. Apply its entire progress/risk effect, then joins and any booking change, then advance the turn. Events never remove attendees; only the anytime release action does. There is no partial response or refund at the deadline. A 10-minute response at minute 59 can end at minute 69; the HUD countdown clamps at zero while results show actual minutes used. Reaching P=100 wins even if that response also expires the booking. Otherwise T ≥ bookingEnd loses. `room-booked` offers a negotiation response that keeps 60 and other responses that set 45; a reduced deadline already passed ends immediately after that resolution. No other event changes the booking, and it can never be extended beyond 60.

Releasing a current speaker does not erase their already-delivered line or reroll the event. Expert responses must explicitly require that expert's presence; their availability and preview are recomputed immediately after release. Absence variants are selected when drawn, not retroactively. Mark a speaker as having spoken on draw, so releasing Gary after his line appears cannot earn Gary-Free Zone. Invalid releases (Priya, absent person, or leaving one person) are refused without changing gameplay state.

**Attendees (fictional)**

Each attendee has one topic tag. Events that touch a topic check whether that person is still in the room.

| Attendee | Title on the name card | Topic tag | Can be released? |
| --- | --- | --- | --- |
| Priya | Chief Decision Enablement Officer | Decision owner | No |
| Dev | Principal Engineer, Velocity & Vibes | Engineering | Yes; engineering events lose their best response |
| Sam | Head of Customer Happiness Escalations | Support | Yes; support events lose their best response |
| Morgan | VP, Synergistic Storytelling | Marketing | Yes; marketing events lose their best response |
| Gary | Senior Strategic Scope Architect | Scope (comic) | Yes; no downside, which players should discover |
| Jordan | Cross-Functional FYI Liaison | FYI (comic) | Yes; no downside |
| The VP | Executive Vice President of Dropping In | Escalation | Yes, subject to the two-person minimum; staying enables keeping the room |
| Legal | Associate General Counsel, Risk Appetite | Escalation | Yes; staying enables clearing press claims |

All “Yes” release permissions are subject to the two-person minimum. The eight listed attendees are the entire roster. Only `legal` and `vp-joins` add attendees, one each; all responses to those arrival events include the join, applied on resolution. Each can join only once per run; released people never rejoin. Arrival dialogue may be attributed to the person at the door before they join. No duplicate IDs or anonymous seats are allowed. `legal` stays eligible without Morgan and uses Priya as its absent-speaker variant.

Part of the skill is noticing that Gary and Jordan are optional. Releasing them early is the cheapest saving in the game.

## Events and responses

Randomness decides which events appear; the player's response decides everything that happens next. Every response has one fixed effect, shown before the player picks. There are no dice on responses.

**How a response is shown**

> **Timebox it** — Progress +3 · 3 min

A substantive issue that gets parked shows its cost too: *Parking lot — 1 min · +1 Open Risk*. Uncertainty comes only from what the meeting throws at the player next.

**Responses are real facilitation techniques**

Naming responses after techniques a PM actually uses links the satire to real TPM skill.

| Technique | Typical effect | Trade-off |
| --- | --- | --- |
| Hear it out | Big progress when the issue is real; resolves a risk | Most time; on a tangent it mostly wastes minutes |
| Timebox it | Steady progress, predictable time | Rarely the best option, rarely a bad one |
| Parking lot | \~1 minute, no progress | +1 Open Risk if the issue was substantive; free if it was noise |
| Name an owner | Good progress quickly | Needs the topic's attendee in the room |
| Take it to email | 0 minutes | +1 Open Risk if substantive; can schedule a callback |
| Bring it back to the decision | Progress if the room is on track | Gives less progress while risks are open |

**Event kinds**

| Kind | What it is | Correct instinct |
| --- | --- | --- |
| Noise | Dead laptops, HDMI adapters, room bookings | Move on fast |
| Tangent | Off-topic but harmless (Gary, Jordan) | Park it or timebox it |
| Substantive | A real launch risk raised by an expert | Hear it out or name an owner |
| Escalation | Someone joins; headcount goes up | Use them or release them |
| Gift (rare) | Something goes surprisingly right | Enjoy it |
| Callback | A parked or emailed item returns | Deal with it this time |

The core skill is telling **substantive** issues from **tangents**. The dialogue writing carries that signal (an expert naming a specific risk vs. a vague "big picture" remark). If playtesters can't tell them apart, add a small "!" over the speaker as a fallback.

**Draw rules**

- Each base event family appears at most once per run. Present/absent variants share its ID and do not create extra draws. There are 17 base families after removing `reply-all`.
- Random candidate weight is rarity weight (common 65, uncommon 28, rare 7) × event `weight` (default 1). These are relative per-event weights, not promises of aggregate rarity percentages. Sort candidates by ASCII ID before selection.
- Apply event conditions, unseen-family filtering and the negative-event guard. A negative event is explicitly tagged `negative: true`; it is not inferred from the player's response.
- The first two draws must be substantive. This deliberately stronger guard guarantees at least two substantive events in the first six draws of any run that lasts that long, without competing with callbacks. At least two common substantive families have no family-level `when` restriction and have expert-absent variants, so releases cannot exhaust this guard. Validate that guarantee; a broken pool is a content error, not permission to substitute filler for these first two draws. Never draw two uncommon negative events consecutively. No fairness promise requires an already-ended run to continue.
- Callbacks are scheduled-only common events, never uncommon negative events. The three parent → target pairs are `circle-back` → `circle-back-return`, `support-training` → `support-follow-up`, and `p1-bug` → `p1-follow-up`. Each parent includes at least one park/email response that schedules its target, in both present and absent variants where applicable. No other event schedules a callback, no callback schedules another, and all callback responses take 1–10 minutes.
- Turn is zero-based: an event drawn at turn n and resolved with a callback schedules it for draw n+2. Exactly one intervening event occurs. Each resolution schedules at most one callback, so due turns cannot collide. A due callback takes precedence over random selection, unless the meeting already ended. Callbacks have no eligibility conditions; an absent-speaker variant uses Priya. Invalid duplicate targets or colliding due turns are programmer/content errors, not silently delayed callbacks.
- Filler (“Awkward silence.”, one acknowledgement, +2 minutes) is repeatable and used only when no base event is eligible and no callback is due. It is common, non-negative, never substantive and never schedules anything.
- One-response events require an explicit acknowledgement button showing the effect; nothing auto-resolves. Reading and animation never consume meeting minutes.

**Randomness and seeds**

Every play gets a fresh random seed, which decides the event draw. With fixed response effects, the draw is the only source of luck.

- The seed is saved in the run log, so a buggy or funny run can be replayed exactly during testing. Players never see it.
- The harness runs fixed seed ranges, so a balance change can be compared run for run.

The guards limit extreme draws; they do not guarantee a win on every seed. Lookahead’s measured target is 85–95% wins.

## Scoring

The score is out of 1,000: Outcome 400 + Efficiency 300 + Decisions 300. Efficiency is scaled by progress, so quitting early can't pay. Each decision is scored against the best option available, so a rough draw can't erase good play.

**Outcome (max 400)**: what the meeting achieved

```latex
O = \begin{cases} 400 - \min(60R,\ 200) & \text{if } P \ge 100 \\ 1.8P & \text{if } P < 100 \end{cases}
```

The risk penalty is capped at 200, so the worst success earns 200, which is more than the best failure (P = 99, 178). Reaching the decision always beats nearly reaching it, and each unresolved risk costs 60.

The 60-point penalty is what puts a slow, thorough meeting above a fast, reckless one (see the examples).

**Efficiency (max 300)**: how cheaply it got there

```latex
E = 300 \times \frac{\min(P,100)}{100} \times \operatorname{clamp}\!\left(\frac{6000 - C}{6000 - 1500},\, 0,\, 1\right)
```

- $6,000 is the reference meeting: the full hour at the starting headcount.
- $1,500 is the floor: about 15 minutes, the fastest realistic decision. The harness confirms this number.
- Cost is compared with the reference rather than counted in dollars, so the absurd $1,000/hour rate (or any rate) never changes a score.
- Multiplying by progress means a player who quits at 5 progress earns at most 15 efficiency points.

**Decisions (max 300)**: how good each choice was, before the dice

Every response has a value, given the meeting's state at that moment, using the utility below:

```latex
u = \Delta P - 1.2 \times \frac{\Delta C}{\$100} - 12 \times \Delta R
```

For each scored decision, quality q = (value of chosen − value of worst) ÷ (value of best − value of worst). D = 300 × the average q. Events where every response has the same value, and anytime actions, are not scored here (releases show up in Efficiency). The weights 1.2 and 12 are starting values for the harness to tune. Use actual clamped ΔP and ΔR, and the full billed person-minutes, from the same evaluator as the preview and resolution. Compare only enabled responses at the state immediately before resolution (after any releases). If fewer than two distinct utility values exist, record an unscored decision. With no scored decisions, average q and D are zero. Persist each scored q; never recompute past decisions using later state. Round O, E and D individually to the nearest integer (nonnegative halves round up), then sum. Title thresholds use the resulting integer total and unrounded average q.

**Where luck comes in**

Responses have no dice, so the only luck is which events a meeting draws. A rough draw can still sink a good player. The Decisions score still rewards them, and title 9 says so on the card. There is no luck index.

**Worked examples**

| Run | P | R | Cost | Avg q | O | E | D | Total | Title |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sharp and careful | 100 | 0 | $2,200 | 0.90 | 400 | 253 | 270 | **923** | Efficient Facilitator |
| Slow and thorough | 100 | 0 | $5,400 | 0.85 | 400 | 40 | 255 | **695** | Death by Diligence |
| Fast and reckless | 100 | 3 | $1,800 | 0.60 | 220 | 280 | 180 | **680** | Ship It and Pray |
| Good play, rough draw | 84 | – | $6,000 | 0.90 | 151 | 0 | 270 | **421** | Played It Right, Lost Anyway |
| Poor play, time expired | 62 | – | $6,000 | 0.35 | 112 | 0 | 105 | **217** | Calendar Criminal |
| Cancelled at minute 0 | 0 | 0 | $0 | – | 0 | 0 | 0 | **0** | This Could've Been an Email |

The v1 example ("objective not completed, 60 minutes, 180 points") couldn't be produced by its own table. In v2, the Calendar Criminal's 217 comes entirely from partial progress and decision quality, as shown above.

## Endings, titles and the results card

There are four endings, 12 collectible titles and one shareable card. Titles drive replays ("what are the other 9?"), and the card is built for a LinkedIn comment.

**Endings**

| Ending | Trigger | Epilogue line (examples) |
| --- | --- | --- |
| Decision reached | P reaches 100 | R = 0: "Friday’s launch goes smoothly. Nobody remembers the meeting. The highest compliment." · R = 1–2: "Friday’s launch goes ahead. A few loose ends become Monday’s problem." · R ≥ 3: "Support learned about the launch from social media." |
| Called it early | Player ends the meeting with P < 100 | "Decision deferred to a follow-up meeting. Invite sent." |
| Time expired | After resolution, P < 100 and T ≥ bookingEnd | "The next team is standing at the glass door." |
| Cancelled | Player calls it before the first event resolves | "This could've been an email. It is now an email." |

**Titles (stored in the browser; shown as a 12-slot grid with locked silhouettes)**

Every title earned unlocks in the grid. Display priority is title numbers 12, 9, 10, 11, 1, 2, 3, 4, 5, 6, 7, 8 (first earned wins): cancellation/failure identity takes precedence over incidental achievements. If no title is earned, show “Decision Made”, a non-collectible results heading; the grid still has exactly twelve slots.

| # | Title | Unlock condition |
| --- | --- | --- |
| 1 | Inbox Zero | Score ≥ 950 |
| 2 | Efficient Facilitator | Decision reached, score ≥ 850 |
| 3 | Ship It and Pray | Decision reached with R ≥ 3 |
| 4 | Death by Diligence | Decision reached, person-minutes ≥ 270 ($4,500 at the display rate) |
| 5 | Skeleton Crew | Decision reached with 3 or fewer attendees left |
| 6 | Reply-All Royalty | Peak headcount reaches 8 |
| 7 | Parking Lot Attendant | 4 or more items parked in one meeting |
| 8 | Gary-Free Zone | Gary released before he speaks |
| 9 | Played It Right, Lost Anyway | At least one scored decision, avg q ≥ 0.85, and no decision reached |
| 10 | Let's Take This Offline | Called it early |
| 11 | Calendar Criminal | Time expired |
| 12 | This Could've Been an Email | Cancelled |

Title 9 is the fairness pressure valve: a player who played well and lost gets a title that says so.

**Results card**

- Title and score out of 1,000.
- Minutes used, final cost at the absurd rate, peak headcount, open risks.
- One factual “moment” from the log: first attendee release, otherwise first parked item, otherwise first arrival, otherwise “No meeting moments. Just an email.” for cancellation or “The meeting ended with a decision.” / “The decision will need another meeting.” according to ending. Break ties by log order; use a ≤90-character content template. Example: *“Gary was released at minute 3.”*
- Two share actions: download a 1200×627 image (LinkedIn's link-preview size) and copy share text. The card image is also shown on screen so it can be saved with a long press where downloads are blocked:

> Efficient Facilitator, 923/1000. Decided in 22 minutes for $2,200 of very important salaries. Gary was released at minute 3. Can you beat it? \[link\]

## Event schema and roster

Events are plain data that a pure TypeScript engine reads. The room stage renders read-only room state; React dispatches named store actions, and only the store calls state-changing engine functions, so the harness can run the same engine with no graphics.

**Data model**

```typescript
type AttendeeId = 'priya' | 'dev' | 'sam' | 'morgan' | 'gary' | 'jordan' | 'vp' | 'legal';
type Rarity = 'common' | 'uncommon' | 'rare';
type EventKind = 'noise' | 'tangent' | 'substantive' | 'escalation' | 'gift' | 'callback';
type Technique = 'hear' | 'timebox' | 'park' | 'owner' | 'email' | 'refocus' | 'ack';

interface Condition {
  minMinute?: number;
  maxMinute?: number;
  present?: AttendeeId[];   // all must still be in the room
  absent?: AttendeeId[];
  minRisks?: number;
  maxRisks?: number;
}

interface Effect {
  progress?: number;        // change in P
  minutes: number;          // change in T (0 only for 'email')
  risks?: number;           // change in R
  joins?: AttendeeId[];
  // Releases are anytime actions only; event effects cannot remove attendees.
  bookingEnd?: 45 | 60;
  callback?: { eventId: string; afterTurns: 2 };
}

interface Response {
  id: string;
  label: string;
  technique: Technique;
  requires?: Condition;     // greyed out with a reason if not met
  disabledReasonKey?: string; // authored, nonempty whenever requires is present
  effect: Effect;           // the response's one fixed effect
  line: string;             // dialogue shown after the choice
}

interface MeetingEvent {
  id: string;
  kind: EventKind;
  rarity: Rarity;
  speaker: AttendeeId | 'room'; // 'room' is a knock/narrator, never billed
  line: string;
  weight?: number;          // positive integer; defaults to 1
  negative?: boolean;       // defaults to false; explicit fairness classification
  variants?: { when: Condition; speaker: AttendeeId | 'room'; line: string; responses: Response[] }[];
  when?: Condition;
  responses: Response[];    // 1 (explicit acknowledgement) to 3
}
```

An event ID is its family ID; variants have no independent event ID. Select the first matching variant in authored order, otherwise the base text/responses. `when` on the family controls draw eligibility; variant conditions only select its presentation/options. Expert-dependent response `requires` conditions apply even if the expert leaves after draw. Each response has one fixed `effect`; there are no conditional effect cases (D24). Risks and minutes cannot change between draw and resolution, so a risk- or time-dependent option is a draw-time variant: for refocus, author a `minRisks: 1` variant whose refocus response gives lower progress. Presence-dependent options use `requires`, which is re-checked after a release. Content contains no functions or random effects. A callback target is its own unique ID and `kind: callback`. All fields and resolved values must pass validation.

**Engine API (pure functions, unit-tested)**

```typescript
initialState(seed: string): MeetingState
drawEvent(state: MeetingState): MeetingState
resolve(state: MeetingState, responseId: string): MeetingState
release(state: MeetingState, who: AttendeeId): MeetingState
callIt(state: MeetingState): MeetingState
score(state: MeetingState): ScoreBreakdown
earnedTitles(state: MeetingState, score: ScoreBreakdown): TitleId[]
displayCost(personMinutes: number): number
formatCost(personMinutes: number): string
previewResponse(state: MeetingState, response: Response): ResponsePreview
getDrawCandidates(state: MeetingState): readonly DrawCandidate[]
```

Exact definitions of these types, `PresentedEvent` and the log live in the tech spec (Engine contracts → Supporting types). `ResponsePreview` is an enabled/disabled discriminated union: disabled carries a content reason key; enabled carries the selected effect, effective progress/risk deltas, elapsed-minute and person-minute deltas, and utility. `DrawCandidate` contains a materialized event and its normalized probability. `getDrawCandidates` is read-only: for a pending event it returns that event with probability 1, for an ended run it returns an empty array, otherwise it returns the same forced/weighted/filler distribution used by `drawEvent`, without consuming randomness. These helpers prevent UI and policies from reimplementing rules. Utility is read from an enabled preview; `value` is internal to the engine.

**Two sample events (starting values)**

A tangent: every option is slightly negative, so the skill is losing as little as possible.

```typescript
{
  id: 'scope-revisit', kind: 'tangent', rarity: 'common', speaker: 'gary',
  line: 'I think we should revisit the entire project scope before we decide.',
  when: { present: ['gary'] },
  responses: [
    { id: 'hear', label: 'Hear it out', technique: 'hear',
      effect: { progress: 4, minutes: 9 }, line: 'Gary shares a 2019 slide deck. One slide was useful.' },
    { id: 'timebox', label: 'Timebox it to 3 min', technique: 'timebox',
      effect: { progress: 3, minutes: 3 }, line: 'Scope confirmed in three minutes. Moving on.' },
    { id: 'park', label: 'Parking lot', technique: 'park',
      effect: { progress: 0, minutes: 1 }, line: 'Noted on the board. Gary nods slowly.' },
  ],
}
```

A substantive issue: parking it is cheap now and expensive at the end.

```typescript
{
  id: 'support-training', kind: 'substantive', rarity: 'common', speaker: 'sam',
  line: "Support hasn't seen the release notes. We'd be taking calls blind on Friday.",
  variants: [{ when: { absent: ['sam'] }, speaker: 'priya',
    line: 'Has anyone told Support? We need a release-notes plan.',
    responses: [
      { id: 'timebox', label: 'Timebox a plan', technique: 'timebox',
        effect: { progress: 8, minutes: 5 }, line: 'A partial plan. Someone still needs to tell Support.' },
      { id: 'park', label: 'Parking lot', technique: 'park',
        effect: { progress: 0, minutes: 1, risks: 1,
          callback: { eventId: 'support-follow-up', afterTurns: 2 } }, line: 'Another sticky note.' },
    ],
  }],
  responses: [
    { id: 'hear', label: 'Hear it out', technique: 'hear', requires: { present: ['sam'] },
      effect: { progress: 18, minutes: 7 }, line: 'Plan agreed: release notes out Wednesday.' },
    { id: 'owner', label: 'Name an owner', technique: 'owner', requires: { present: ['sam'] },
      effect: { progress: 14, minutes: 3 }, line: 'Sam owns it. Done.' },
    { id: 'park', label: 'Parking lot', technique: 'park',
      effect: { progress: 0, minutes: 1, risks: 1,
        callback: { eventId: 'support-follow-up', afterTurns: 2 } }, line: 'Another sticky note. Sam looks worried.' },
  ],
}
```

At the starting headcount, the tangent's values are timebox −0.6, parking lot −1.2 and hear it out −6.8. The support event's values are name an owner 10.4, hear it out 9.6 and parking lot −13.2. If Sam was released earlier, a variant fires instead ("Has anyone told Support?") without the owner option, so releasing the wrong person has a visible cost.

**MVP roster (17 base events + up to 3 callbacks)**

| ID | Kind | Rarity | Speaker | Line |
| --- | --- | --- | --- | --- |
| hdmi | Noise | Common | Dev | "Does anyone have a USB-C to HDMI adapter?" |
| tv-no-signal | Noise | Common | Morgan | "The TV just says 'No Signal'." |
| intros | Tangent | Common | Jordan | "Before we start, can everyone introduce themselves?" |
| scope-revisit | Tangent | Common | Gary | "I think we should revisit the entire project scope…" |
| unrelated-q | Tangent | Common | Jordan | "Actually, I have a completely unrelated question." |
| another-meeting | Tangent | Common | Gary | "I think we need another meeting to discuss this." |
| circle-back | Tangent | Common | Morgan | "Can we circle back to this?" (schedules a callback) |
| where-we-stand | Substantive | Common | Priya | "Okay. Where do we actually stand?" |
| support-training | Substantive | Common | Sam | "Support hasn't seen the release notes." |
| failing-tests | Substantive | Common | Dev | "Two regression tests are still failing." |
| press-date | Substantive | Common | Morgan | "The press release says Thursday." |
| p1-bug | Substantive | Uncommon | Dev | "We just found a P1 in checkout." |
| legal | Escalation | Uncommon | Morgan | "We should probably get Legal involved." (+1 attendee) |
| vp-joins | Escalation | Uncommon | The VP | "Mind if I sit in?" (+1, not before minute 15) |
| room-booked | Noise | Uncommon | (knock) | "We have this room at :45, right?" (booking shrinks unless negotiated) |
| pre-read | Gift | Rare | Priya | "Everyone actually read the pre-read." (+20 progress) |
| aligned | Gift | Rare | Dev | "Honestly? I think we're all aligned." (+15 progress, −1 risk) |

This roster gives each family's opening line only. Full responses, effects, expert requirements, absent-speaker variants, the three callback events and the filler are authored in the content table (`docs/content-table.md`, plan task 06b) and reviewed by Harry before implementation (D18). Code PRs transcribe that table; they do not author new event design.

## Balancing harness

Before launch, scripted players run 10,000 meetings each through the engine with no graphics. The weights and event values are tuned until the targets below are met. This gives evidence for the balance claims and becomes the hook for the blog post.

**Scripted players**

| Player | How it plays | Target win rate | Target median score |
| --- | --- | --- | --- |
| Lookahead | Two-turn lookahead over the known event pool; releases optional attendees | 85–95% | 850–950 (sets the ceiling) |
| Greedy | Picks the highest-value response each turn; releases Gary and Jordan | 70–85% | 750–850 |
| Reckless | Fast progress with no risk penalty: maximize ΔP − 1.2 × Δpm/6; releases Gary and Jordan | 60–80% | At least 50 below Greedy |
| Always-timebox | Timeboxes everything it can | 40–60% | At least 100 below Greedy |
| Always-fastest | Picks the response that uses the fewest minutes | 30–50% | At least 100 below Greedy |
| Always-park | Parks or emails everything | Under 20% | Under 400 |
| Random | Uniform random responses, never releases anyone | 20–35% | Under 450 |

**Acceptance criteria**

- [ ] Always-timebox, Always-fastest and Always-park each have a median score at least 100 below Greedy; Reckless is at least 50 below. Random is governed by its own table targets.
- [ ] Greedy wins 70–85%; Random wins 20–35%.
- [ ] Among Greedy's successful runs, score standard deviation is 120 or less (the event draw can't swing a winning score too far). Overall luck is measured by the win-rate band: the success/failure score cliff alone adds about √(p(1−p)) × the win–loss score gap to an all-runs spread, so an all-runs cap would conflict with the 70–85% win band (D20).
- [ ] Greedy’s median resolved-turn count across all runs is 9–12 (playtesting separately checks 2–3 minutes).
- [ ] Each of the 17 base event families appears in at least 5% of Random runs (all Random runs are the denominator; variants count as the same family). This retention policy keeps Gary/Jordan eligible. Separately require deterministic scenario tests for every absence variant and all three callbacks; callback delivery is 100% when its due turn is reached before the meeting ends. Report per-policy family/variant/callback coverage without imposing impossible Greedy thresholds.
- [ ] Among Greedy decisions with at least two enabled responses, no technique exceeds 40% of selections. Exclude single-choice acknowledgements and releases; include callbacks and tied-value choices if multiple responses are enabled.
- [ ] Lookahead wins 85–95% of seeds, with median score 850–950. There is no separate 99% feasibility or win-rate requirement.
- [ ] The efficiency floor (90 person-minutes, displayed as $1,500) is within 10% of Lookahead’s fifth-percentile person-minutes among successful runs: abs(90 − p05) / p05 ≤ 0.10. Use nearest-rank percentile, sorted ascending at index ceil(0.05 × successfulCount) − 1. Calibrate `COST_FLOOR_PM` to this rule at the end of the tuning task and before each release; on other PRs the deviation is reported as a diagnostic, not enforced (D25).

**Policy and report semantics**

Run all seven players over identical fixed seed ranges; `--policy all` is the default. Win means `ending === 'decision'`. Score medians include every run, not just wins; even-sized medians average the middle pair. Use population score standard deviation. Targets are inclusive except “under”, which is strict. Enforce every table target plus the checklist, at both 2,000 and 10,000 runs per policy after the balance milestone.

Before the first draw, Greedy, Reckless and Lookahead release Gary and Jordan in that order. They retain experts; in this MVP Lookahead's optional attendees means only Gary/Jordan. No policy calls it early. Other policies never release anyone. Common tie-break order is lower minutes, then response ID in ASCII order. Greedy maximizes full utility. Because decision quality is defined by that same utility, Greedy's Decisions score is 300 whenever it has a scored decision, so Greedy-versus-Lookahead comparisons turn on Outcome and Efficiency (D20). Reckless ignores ΔR in utility (the former “park every substantive issue” policy could not reliably build progress, so it is replaced). Author substantive shortcuts that exchange useful progress for risk so this comparison measures recklessness rather than inactivity. Always-timebox chooses a legal timebox, otherwise Greedy. Always-fastest minimizes minutes, then maximizes utility, then response ID. Always-park prefers a legal park, then email, otherwise the fastest response. Random samples enabled responses uniformly from a separate `${seed}:policy:random:${turn}` stream.

Lookahead evaluates each legal response's immediate utility plus the probability-weighted maximum utility at the next draw. Enumerate the same eligible pool/weights/guards as the engine, or the forced callback; do not inspect the next seeded draw. If the first response ends the run, the second-step utility is zero. Break ties using the common order. It never changes a past choice after learning the actual next draw. Benchmark this precise policy before tuning; its target is a hypothesis, not a claim of optimality.

**Outputs**

- `pnpm sim -- --runs 10000 --policy all` writes one CSV row per run (seed, policy, P, R, T, C, peak H, q, score, title).
- Score-distribution and win-rate charts per policy for the blog post.
- Engine unit tests (Vitest) cover formulas, draw conditions, seed determinism and score edge cases (P = 99 vs 100, R = 5, cancel at minute 0).

Blog hook: *"I simulated 70,000 meetings to make sure skill beats luck."*

## Scope, risks and decisions

The MVP is about the same size as v1. The setup menus are cut, and the time saved pays for the harness, Open Risks and the titles grid.

**MVP (v2)**

- One-tap start; a fresh random meeting every play.
- One in-person conference room; 6 attendee sprites plus the VP and Legal (palette swaps are fine), each with an absurd title card.
- The Friday Launch scenario with the 17-event roster and callbacks.
- HUD: progress, clock, cost at $1,000/hour, headcount faces, parking-lot board.
- Each response's fixed effect shown before choosing; tap to release an attendee; Call it.
- Scoring as specified; 4 endings; 12-title grid stored in the browser.
- Results card image + copy-to-clipboard share text.
- Engine + scripted players + CSV output; engine unit tests.
- Deployed on Vercel; tested in the LinkedIn mobile app's in-app browser; blog post.

**Cut from v1's MVP:** meeting-type, attendee-count, duration and hourly-rate menus. There is also no daily meeting and no practice mode.

**Still out of scope:** multiplayer, more scenarios or rooms, player movement, accounts, online leaderboards, AI dialogue. A "Should this meeting exist?" scenario (where cancelling is correct) is the first post-MVP addition.

**Risks**

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Original pixel art takes longer than the code | Slips launch | Use a CC0 office tileset for the room (check its licence); hand-draw only the 8 characters |
| AI-generated art used for final assets | Look-alikes of famous characters infringe whoever made them; purely AI-made images can't be copyrighted in the US and the question is open in Canada; some LinkedIn viewers object | Use AI only for concept sketches; redraw the final sprites; disclose any AI art in the blog post |
| Players can't tell tangents from substantive issues | Decisions feel arbitrary | Playtest the text-only vertical slice early (plan V4), then 5 people before release; fall back to a "!" marker |
| Fixed effects make the game feel solved after a few plays | Fewer replays | Acceptable for a 2–3 play target; the random event draw keeps each run different |
| LinkedIn in-app browser quirks (audio, canvas, clipboard) | Broken first impression for most traffic | Probe real in-app capabilities in the first CI task (plan V1); no audio; share card also shown as an image for long-press save; text-share fallback |
| A game engine is heavy for a dialogue-and-meters game | Bundle size, integration time | Resolved by D16: the room is DOM sprites and CSS with no engine; all text and input stay in React |
| Visual style read as copying a famous franchise | Takedown or bad look on LinkedIn | Original sprites and font; describe it only as "Game Boy-style" |

**Decisions (October 7, 2026)**

- A slow, thorough meeting outscores a fast, reckless one: the risk penalty is 60 per open risk, capped at 200.
- Responses are deterministic: no fallback outcomes, no dice, no luck index.
- Calling it early is always a failure; there is no "good enough" ending.
- Attendees bill at an absurd $1,000/hour and carry comical titles; scoring is unaffected.
- No practice mode or daily meeting; every play is a fresh random meeting.
- The meeting is in person; remote-call gags are replaced with in-room ones.
- D01: eight unique attendees, minimum two present, Reply-All Royalty at peak eight; `reply-all` is removed, leaving 17 base events.
- D02: Lookahead win rate is 85–95% only. D03–D12 are resolved in the rules above and the technical spec; no repeat approval is needed to implement those decisions.
- D13–D26 (October 8, 2026): accepted architecture-review decisions, recorded in ADR 0001, the single decision register. Those that change this document: the room is drawn without a game engine (D16); event content is authored in a reviewed content table (D18); Greedy score spread is measured among successful runs (D20); conditional effect cases are removed and `value` is internal (D24); the efficiency floor is calibrated rather than enforced on every PR (D25).
- At most 17 base resolutions plus three callback resolutions can precede filler-only play. With a 60-minute maximum booking and +2-minute filler, every valid run ends within 50 resolved turns, including zero-minute email paths. This replaces the unjustified 40-turn test without adding a forced ending; the 9–12 median target is unchanged.

Sources for the AI-art risk: [Mayer Brown, Supreme Court denies review in AI authorship case (Mar 2026)](https://www.mayerbrown.com/es/insights/publications/2026/03/supreme-court-denies-review-in-ai-authorship-case) · [MLT Aikins, Authorship in AI-generated works (Canada)](https://www.mltaikins.com/insights/authorship-in-ai-generated-works-who-owns-the-copyright/) · [Music Publishers Canada, Federal Court case on AI and copyright (Jul 2026)](https://www.musicpublishing.ca/news/2026-7-22-music-publishers-canada-intervenes-in-landmark-federal-court-case-on-ai-and-copyright)

