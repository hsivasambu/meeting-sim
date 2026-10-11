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
  const applied = applyEffect(state, response.effect);
  return {
    ...applied,
    utility:
      applied.progressDelta -
      (rules.costWeight * applied.personMinutesDelta) / rules.costUnit -
      rules.riskWeight * applied.risksDelta,
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
