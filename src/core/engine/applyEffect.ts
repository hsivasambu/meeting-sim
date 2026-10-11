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
import type { Effect, MeetingState } from './types';
export interface AppliedEffect {
  readonly state: MeetingState;
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
  state: MeetingState,
  effect: Effect,
): MeetingState['present'] {
  const joins = effect.joins ?? [];
  if (
    joins.some((id) => id !== 'legal' && id !== 'vp') ||
    new Set(joins).size !== joins.length ||
    joins.some(
      (id) =>
        state.present.includes(id) || state.releasedAttendeeIds.includes(id),
    ) ||
    state.present.length + joins.length > MAX_HEADCOUNT
  )
    throw new EngineError('invalid-join');
  return [...state.present, ...joins];
}
function effectState(state: MeetingState, effect: Effect): MeetingState {
  const present = presentAfter(state, effect);
  const minute = state.minute + effect.minutes;
  const personMinutes =
    state.personMinutes + state.present.length * effect.minutes;
  if (!Number.isSafeInteger(minute) || !Number.isSafeInteger(personMinutes))
    throw new EngineError('invalid-effect');
  return {
    ...state,
    minute,
    personMinutes,
    present,
    progress: Math.min(
      PROGRESS_MAX,
      Math.max(ZERO, state.progress + (effect.progress ?? ZERO)),
    ),
    risks: Math.min(
      RISKS_MAX,
      Math.max(ZERO, state.risks + (effect.risks ?? ZERO)),
    ),
    bookingEnd: effect.bookingEnd ?? state.bookingEnd,
    peakHeadcount: Math.max(state.peakHeadcount, present.length),
  };
}
/** Implements Design Doc v2 → Game state model → Resolution and attendance boundaries. */
export function applyEffect(
  state: MeetingState,
  effect: Effect,
): AppliedEffect {
  validateEffect(effect);
  const next = effectState(state, effect);
  return {
    state: next,
    progressDelta: next.progress - state.progress,
    risksDelta: next.risks - state.risks,
    minutesDelta: next.minute - state.minute,
    personMinutesDelta: next.personMinutes - state.personMinutes,
  };
}
