import { fractionNumber } from './utilityFraction';
import { matchesCondition } from './conditions';
import { ONE, ZERO, PROGRESS_MAX, CALLBACK_DELAY } from './constants';
import { assertRunning, EngineError } from './errors';
import { evaluateResponse } from './value';
import type {
  DecisionRecord,
  MeetingState,
  PresentedEvent,
  Response,
  UtilityRules,
} from './types';
function schedule(
  state: MeetingState,
  response: Response,
): MeetingState['scheduled'] {
  const callback = response.effect.callback;
  return callback === undefined
    ? [...state.scheduled]
    : [
        ...state.scheduled,
        { eventId: callback.eventId, dueTurn: state.turn + CALLBACK_DELAY },
      ];
}
function quality(
  state: MeetingState,
  event: PresentedEvent,
  response: Response,
  rules: UtilityRules,
): Pick<DecisionRecord, 'quality' | 'qualityFraction'> {
  const utilities = event.responses
    .filter((option) => matchesCondition(state, option.requires))
    .map((option) => evaluateResponse(state, option, rules).utilityNumerator);
  const first = utilities[ZERO];
  if (first === undefined) throw new EngineError('disabled-response');
  const worst = utilities.reduce((a, b) => (a < b ? a : b), first);
  const best = utilities.reduce((a, b) => (a > b ? a : b), first);
  if (best === worst) return { quality: null, qualityFraction: null };
  const numerator =
    evaluateResponse(state, response, rules).utilityNumerator - worst;
  const denominator = best - worst;
  return {
    quality: fractionNumber(numerator, denominator),
    qualityFraction: {
      numerator: numerator.toString(),
      denominator: denominator.toString(),
    },
  };
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
    ...quality(state, event, response, rules),
  };
  return {
    ...next,
    turn: state.turn + ONE,
    current: null,
    scheduled: schedule(state, response),
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
  const applied = evaluateResponse(state, response, rules);
  return finishResolution(state, applied.state, event, response, rules);
}
