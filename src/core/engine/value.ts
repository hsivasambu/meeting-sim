import { validateResponse } from './responseValidation';
import { utilityFraction, fractionNumber } from './utilityFraction';
import { applyEffect } from './applyEffect';
import { matchesCondition } from './conditions';
import { EngineError } from './errors';
import type { MeetingState, Response, UtilityRules } from './types';
/** Implements Design Doc v2 → Scoring → Decisions: effective, clamped valuation. */
export function evaluateResponse(
  state: MeetingState,
  response: Response,
  rules: UtilityRules,
) {
  if (!matchesCondition(state, response.requires))
    throw new EngineError('disabled-response');
  validateResponse(state, response, rules);
  const applied = applyEffect(
    state,
    response.effect,
    Object.values(rules.eventRules?.arrivalAttendees ?? {}),
  );
  const exact = utilityFraction(
    applied.progressDelta,
    applied.personMinutesDelta,
    applied.risksDelta,
    rules,
  );
  return {
    ...applied,
    utilityNumerator: exact.numerator,
    utility: fractionNumber(exact.numerator, exact.denominator),
  };
}
/** Implements Design Doc v2 → Scoring → Decisions: disabled options have no utility. */
export function value(
  state: MeetingState,
  response: Response,
  rules: UtilityRules,
): number {
  return evaluateResponse(state, response, rules).utility;
}
