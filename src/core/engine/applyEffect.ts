import {
  ZERO,
  MAX_RESPONSE_MINUTES,
  PROGRESS_MAX,
  RISKS_MAX,
  MAX_HEADCOUNT,
  INITIAL_BOOKING_END,
  REDUCED_BOOKING_END,
} from './constants';
import { EngineError } from './errors';
import type { AttendeeId, Effect, MeetingState, EngineState } from './types';
export interface AppliedEffect<S extends EngineState = MeetingState> {
  readonly state: S;
  readonly progressDelta: number;
  readonly risksDelta: number;
  readonly minutesDelta: number;
  readonly personMinutesDelta: number;
}
function validateEffect(effect: Effect): void {
  if (
    !Number.isSafeInteger(effect.minutes) ||
    effect.minutes < ZERO ||
    effect.minutes > MAX_RESPONSE_MINUTES ||
    !Number.isSafeInteger(effect.progress ?? ZERO) ||
    !Number.isSafeInteger(effect.risks ?? ZERO) ||
    (effect.bookingEnd !== undefined &&
      effect.bookingEnd !== INITIAL_BOOKING_END &&
      effect.bookingEnd !== REDUCED_BOOKING_END)
  )
    throw new EngineError('invalid-effect');
}
function presentAfter(
  state: EngineState,
  effect: Effect,
  allowedJoins: readonly AttendeeId[],
): MeetingState['present'] {
  const joins = effect.joins ?? [];
  if (
    joins.some((id) => !allowedJoins.includes(id)) ||
    new Set(joins).size !== joins.length ||
    joins.some(
      (id) =>
        state.present.includes(id) ||
        ('releasedAttendeeIds' in state &&
          state.releasedAttendeeIds.includes(id)),
    ) ||
    state.present.length + joins.length > MAX_HEADCOUNT
  )
    throw new EngineError('invalid-join');
  return [...state.present, ...joins];
}
function effectState<S extends EngineState>(
  state: S,
  effect: Effect,
  allowedJoins: readonly AttendeeId[],
): S {
  const present = presentAfter(state, effect, allowedJoins);
  const minute = state.minute + effect.minutes;
  const personMinutes =
    state.personMinutes + state.present.length * effect.minutes;
  if (!Number.isSafeInteger(minute) || !Number.isSafeInteger(personMinutes))
    throw new EngineError('invalid-effect');
  return {
    ...state,
    ...('nominatedCuisine' in state
      ? { nominatedCuisine: effect.nominateCuisine ?? state.nominatedCuisine }
      : {}),
    minute,
    personMinutes,
    present,
    progress: Math.min(
      PROGRESS_MAX,
      Math.max(ZERO, state.progress + (effect.progress ?? ZERO)),
    ),
    ...('risks' in state
      ? {
          risks: Math.min(
            RISKS_MAX,
            Math.max(ZERO, state.risks + (effect.risks ?? ZERO)),
          ),
        }
      : {}),
    bookingEnd: effect.bookingEnd ?? state.bookingEnd,
    peakHeadcount: Math.max(state.peakHeadcount, present.length),
  };
}
/** Implements Design Doc v2 → Game state model → Resolution and attendance boundaries. */
export function applyEffect<S extends EngineState>(
  state: S,
  effect: Effect,
  allowedJoins: readonly AttendeeId[] = [],
): AppliedEffect<S> {
  validateEffect(effect);
  const next = effectState(state, effect, allowedJoins);
  return {
    state: next,
    progressDelta: next.progress - state.progress,
    risksDelta:
      'risks' in next && 'risks' in state ? next.risks - state.risks : ZERO,
    minutesDelta: next.minute - state.minute,
    personMinutesDelta: next.personMinutes - state.personMinutes,
  };
}
