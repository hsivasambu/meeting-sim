import { ZERO, CALLBACK_DELAY } from './constants';
import { EngineError } from './errors';
import { validateLunchResponse, validateNomination } from './lunchValidation';
import type { Effect, MeetingState, Response, UtilityRules } from './types';

/** A conditional response has an authored reason. */
export function reasonFor(response: Response): string {
  const key = response.disabledReasonKey;
  if (typeof key !== 'string' || !key.trim())
    throw new EngineError('invalid-response');
  return key;
}

/** Preview, resolution and successor enumeration use the same validation. */
export function validateResponse(
  state: MeetingState,
  response: Response,
  effect: Effect,
  rules: UtilityRules,
): void {
  validateLunchResponse(state, response, effect, rules);
  const event = state.current;
  if (event === null) {
    if (
      effect.bookingEnd !== undefined ||
      (effect.joins?.length ?? ZERO) > ZERO ||
      effect.callback !== undefined
    )
      throw new EngineError('missing-event');
    return;
  }
  if (event.id === rules.eventRules.nominationEventId)
    validateNomination(event);
  const callback = effect.callback;
  if (
    callback !== undefined &&
    (event.kind === 'callback' ||
      response.technique !== 'park' ||
      rules.eventRules.callbackTargets[event.id] !== callback.eventId ||
      callback.afterTurns !== CALLBACK_DELAY ||
      state.seenEventIds.includes(callback.eventId) ||
      state.scheduled.some(
        (entry) =>
          entry.eventId === callback.eventId ||
          entry.dueTurn === state.turn + CALLBACK_DELAY,
      ))
  )
    throw new EngineError('invalid-schedule');
}
