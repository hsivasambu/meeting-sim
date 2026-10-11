import { matchesCondition } from './conditions';
import {
  ONE,
  ZERO,
  PROGRESS_MAX,
  CALLBACK_DELAY,
  CALLBACK_TARGETS,
  ARRIVAL_ATTENDEES,
} from './constants';
import { assertRunning, EngineError } from './errors';
import { evaluateResponse, value } from './value';
import type {
  MeetingState,
  PresentedEvent,
  Response,
  UtilityRules,
} from './types';
function validateContext(event: PresentedEvent, response: Response): void {
  const expected = Object.hasOwn(ARRIVAL_ATTENDEES, event.id)
    ? ARRIVAL_ATTENDEES[event.id]
    : undefined;
  const joins = response.effect.joins ?? [];
  if (
    (expected === undefined && joins.length > ZERO) ||
    (expected !== undefined &&
      (joins.length !== ONE || joins[ZERO] !== expected))
  )
    throw new EngineError('invalid-join');
  if (response.effect.bookingEnd !== undefined && event.id !== 'room-booked')
    throw new EngineError('invalid-effect');
  if (response.effect.minutes === ZERO && response.technique !== 'email')
    throw new EngineError('invalid-effect');
}
function schedule(
  state: MeetingState,
  event: PresentedEvent,
  response: Response,
): MeetingState['scheduled'] {
  const callback = response.effect.callback;
  if (callback === undefined) return [...state.scheduled];
  const dueTurn = state.turn + CALLBACK_DELAY;
  if (
    event.kind === 'callback' ||
    (response.technique !== 'park' && response.technique !== 'email') ||
    CALLBACK_TARGETS[event.id] !== callback.eventId ||
    callback.afterTurns !== CALLBACK_DELAY ||
    state.seenEventIds.includes(callback.eventId) ||
    state.scheduled.some(
      (entry) =>
        entry.eventId === callback.eventId || entry.dueTurn === dueTurn,
    )
  )
    throw new EngineError('invalid-schedule');
  return [...state.scheduled, { eventId: callback.eventId, dueTurn }];
}
function quality(
  state: MeetingState,
  event: PresentedEvent,
  response: Response,
  rules: UtilityRules,
): number | null {
  const utilities = event.responses
    .filter((option) => matchesCondition(state, option.requires))
    .map((option) => value(state, option, rules));
  const worst = Math.min(...utilities),
    best = Math.max(...utilities);
  return best === worst
    ? null
    : (value(state, response, rules) - worst) / (best - worst);
}
function resolutionLog(
  state: MeetingState,
  next: MeetingState,
  event: PresentedEvent,
  response: Response,
): MeetingState['log'] {
  const joins = next.present.filter((id) => !state.present.includes(id));
  return [
    ...state.log,
    {
      type: 'resolve',
      turn: state.turn,
      minute: next.minute,
      eventId: event.id,
      responseId: response.id,
      technique: response.technique,
      line: response.line,
    },
    ...joins.map((who) => ({
      type: 'join' as const,
      turn: state.turn,
      minute: next.minute,
      who,
    })),
  ];
}
function finishResolution(
  state: MeetingState,
  next: MeetingState,
  event: PresentedEvent,
  response: Response,
  rules: UtilityRules,
): MeetingState {
  const ending =
    next.progress >= PROGRESS_MAX
      ? 'decision'
      : next.minute >= next.bookingEnd
        ? 'time-expired'
        : null;
  const decision = {
    turn: state.turn,
    eventId: event.id,
    responseId: response.id,
    quality: quality(state, event, response, rules),
  };
  return {
    ...next,
    turn: state.turn + ONE,
    current: null,
    scheduled: schedule(state, event, response),
    parkedCount:
      state.parkedCount + (response.technique === 'park' ? ONE : ZERO),
    phase: ending === null ? 'running' : 'ended',
    ending,
    decisions: [...state.decisions, decision],
    log: resolutionLog(state, next, event, response),
  };
}
/** Implements Design Doc v2 → Game state model → Resolution and attendance boundaries. */
export function resolveWithRules(
  state: MeetingState,
  responseId: string,
  rules: UtilityRules,
): MeetingState {
  assertRunning(state);
  const event = state.current;
  if (event === null) throw new EngineError('missing-event');
  const responses = event.responses.filter(
    (response) => response.id === responseId,
  );
  const response = responses[ZERO];
  if (responses.length !== ONE || response === undefined)
    throw new EngineError('unknown-response');
  validateContext(event, response);
  const applied = evaluateResponse(state, response, rules);
  return finishResolution(state, applied.state, event, response, rules);
}
