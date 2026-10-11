import { matchesCondition } from './conditions';
import { REQUIREMENTS_REASON_KEY } from './constants';
import { evaluateResponse } from './value';
import type {
  MeetingState,
  Response,
  ResponsePreview,
  UtilityRules,
} from './types';
/** Implements Design Doc v2 → Events and responses → How a response is shown. */
export function previewWithRules(
  state: MeetingState,
  response: Response,
  rules: UtilityRules,
): ResponsePreview {
  if (!matchesCondition(state, response.requires))
    return {
      enabled: false,
      responseId: response.id,
      reasonKey: REQUIREMENTS_REASON_KEY,
    };
  const applied = evaluateResponse(state, response, rules);
  return {
    enabled: true,
    responseId: response.id,
    effect: response.effect,
    progressDelta: applied.progressDelta,
    risksDelta: applied.risksDelta,
    minutesDelta: applied.minutesDelta,
    personMinutesDelta: applied.personMinutesDelta,
    utility: applied.utility,
  };
}
