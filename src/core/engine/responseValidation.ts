import { ZERO, ONE, CALLBACK_DELAY } from './constants';
import { EngineError } from './errors';
import { validateLunchResponse, validateNomination } from './lunchValidation';
import type {
  EngineState,
  EngineResponse,
  PresentedEvent,
  Response,
  UtilityRules,
} from './types';
/** Implements Design Doc v2 → Event schema and roster → Data model: authored disabled reasons. */
export function reasonFor(response: EngineResponse): string {
  const key = response.disabledReasonKey;
  if (typeof key !== 'string' || !key.trim())
    throw new EngineError('invalid-response');
  return key;
}
function validateEvent(
  event: PresentedEvent<EngineResponse>,
  response: Response,
  rules: UtilityRules,
): void {
  const metadata = rules.eventRules;
  if (rules.profile === 'lunch') {
    if (event.id === rules.eventRules.nominationEventId)
      validateNomination(event);
    if (
      (response.effect.bookingEnd !== undefined) !==
      metadata?.bookingEventIds.includes(event.id)
    )
      throw new EngineError('invalid-effect');
    return;
  }
  const expected =
    metadata !== undefined && Object.hasOwn(metadata.arrivalAttendees, event.id)
      ? metadata.arrivalAttendees[event.id]
      : undefined;
  const joins = response.effect.joins ?? [];
  if (
    (expected === undefined && joins.length > ZERO) ||
    (expected !== undefined &&
      (joins.length !== ONE || joins[ZERO] !== expected))
  )
    throw new EngineError('invalid-join');
  if (
    (response.effect.bookingEnd !== undefined) !==
    (metadata?.bookingEventIds.includes(event.id) ?? false)
  )
    throw new EngineError('invalid-effect');
}
function validateCallback(
  state: EngineState,
  event: PresentedEvent<EngineResponse>,
  response: Response,
  rules: UtilityRules,
): void {
  const callback = response.effect.callback;
  if (
    callback !== undefined &&
    (event.kind === 'callback' ||
      (response.technique !== 'park' && response.technique !== 'email') ||
      rules.eventRules?.callbackTargets[event.id] !== callback.eventId ||
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
/** Implements Design Doc v2 → Game state model → Resolution and attendance boundaries: shared preview/resolve validation. */
export function validateResponse(
  state: EngineState,
  response: Response,
  rules: UtilityRules,
): void {
  if ('nominatedCuisine' in state !== (rules.profile === 'lunch'))
    throw new EngineError('invalid-rules');
  if (
    rules.profile !== 'lunch' &&
    response.effect.nominateCuisine !== undefined
  )
    throw new EngineError('invalid-effect');
  if (response.requires !== undefined) reasonFor(response);
  if (rules.profile === 'lunch') validateLunchResponse(state, response, rules);
  const event = state.current;
  if (
    response.effect.minutes === ZERO &&
    (response.technique !== 'email' || event?.kind === 'callback')
  )
    throw new EngineError('invalid-effect');
  if (event === null) {
    if (
      response.effect.bookingEnd !== undefined ||
      (response.effect.joins?.length ?? ZERO) > ZERO ||
      response.effect.callback !== undefined
    )
      throw new EngineError('missing-event');
    return;
  }
  validateEvent(event, response, rules);
  validateCallback(state, event, response, rules);
}
