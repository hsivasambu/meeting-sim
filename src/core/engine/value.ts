import { validateResponse } from './responseValidation';
import { utilityFraction, fractionNumber } from './utilityFraction';
import { applyEffect } from './applyEffect';
import type { MeetingState, Effect, Response, UtilityRules } from './types';

/** Evaluate a complete branch using effective clamped deltas and full billing. */
export function evaluateResponse(
  state: MeetingState,
  response: Response,
  effect: Effect,
  rules: UtilityRules,
) {
  validateResponse(state, response, effect, rules);
  const allowedJoins = rules.eventRules.arrivalPermissions
    .filter(
      ({ eventId, responseId }) =>
        eventId === state.current?.id && responseId === response.id,
    )
    .map(({ attendeeId }) => attendeeId);
  const applied = applyEffect(state, effect, allowedJoins);
  const exact = utilityFraction(
    applied.progressDelta,
    applied.personMinutesDelta,
    rules,
  );
  return {
    ...applied,
    utilityFraction: exact,
    utility: fractionNumber(exact.numerator, exact.denominator),
  };
}
