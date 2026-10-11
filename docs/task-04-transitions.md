# Task 04 state/evaluator handoff

The public engine index exports initialState(seed), release(state, who), callIt(state),
resolve(state, responseId) and previewResponse(state, response) with the locked signatures.
The injected internal evaluator/resolve rules let fixture tests remain independent of live tuning.
EngineError is thrown for programmer/content mistakes; its code/type is available as a type
export without expanding the locked runtime API. All state-changing calls reject ended state.

releasedAttendeeIds is additive authoritative state; initialize it empty in new fixtures.
Release records turn/minute, costs no time, keeps delivered current dialogue and heard-speaker
counters, and returns a fresh equivalent snapshot when refused. Call it uses resolved turn
count, never narrative logs, to distinguish cancellation from an early call.

applyEffect owns all progress/risk clamping and returns the effective deltas. It bills the
full duration at pre-effect headcount, then joins/booking changes, and retains actual minutes
past the deadline. Preview uses this evaluator without logging, turn advancement or scheduling.
The opaque requirements-not-met key denotes a failed requires condition; future content owns
its display copy. Internal value on a disabled response is an EngineError.

Resolution rechecks requirements after releases, values only enabled responses at the current
state, records null for one/equal-valued choices, and preserves every earlier quality. It then
records effects/joins and advances the turn, with decision ahead of time-expired. Narrative
resolve/join entries use the resulting minute; they are never an input to rules.
Effects allow at most ten minutes; zero minutes require email and are forbidden for callbacks.
Every room-booked path explicitly supplies its 45/60-minute deadline.
Callbacks schedule from the old turn at n+2, with approved parent/target/technique checks and
no repeated target or due-turn collision. They are not consumed here: draw/fairness/callback
consumption belong to task 06. Ended meetings cannot resolve more events.

State/materialized-response modules need no live content import. Pool lookup and live-pack
binding remain in their scheduled tasks. Draw, score, titles, store, UI loop and simulation
are not provided by task 04. Next task: 05. Android release validation remains outstanding
under the explicit task 02 evidence deferral.
