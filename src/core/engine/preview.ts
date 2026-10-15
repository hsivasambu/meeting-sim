import { matchesCondition } from './conditions';
import { reasonFor } from './responseValidation';
import { evaluateResponse } from './value';
import { evaluateOutcomes, expectedUtility, hasOutcomes } from './outcomes';
import { fractionNumber, serializeFraction } from './utilityFraction';
import { ZERO } from './constants';
import type {
  EngineState,
  Response,
  ResponsePreview,
  UtilityRules,
  EngineResponse,
  OutcomeResponse,
  OutcomeResponsePreview,
} from './types';
/** Implements Design Doc v2 → Events and responses → How a response is shown. */
export function previewWithRules(
  state: EngineState,
  response: Response,
  rules: UtilityRules,
): ResponsePreview;
export function previewWithRules(
  state: EngineState,
  response: OutcomeResponse,
  rules: UtilityRules,
): OutcomeResponsePreview;
export function previewWithRules(
  state: EngineState,
  response: EngineResponse,
  rules: UtilityRules,
): ResponsePreview | OutcomeResponsePreview;
export function previewWithRules(
  state: EngineState,
  response: EngineResponse,
  rules: UtilityRules,
): ResponsePreview | OutcomeResponsePreview {
  if (!matchesCondition(state, response.requires)) {
    return {
      enabled: false,
      responseId: response.id,
      reasonKey: reasonFor(response),
    };
  }
  if (hasOutcomes(response)) {
    const branches = evaluateOutcomes(state, response, rules);
    const expected = expectedUtility(branches);
    const expectation = (
      field: 'progressDelta' | 'minutesDelta' | 'personMinutesDelta',
    ) =>
      branches.reduce(
        (sum, branch) =>
          sum +
          branch.applied[field] *
            fractionNumber(
              branch.probability.numerator,
              branch.probability.denominator,
            ),
        ZERO,
      );
    return {
      enabled: true,
      responseId: response.id,
      outcomes: branches.map((branch) => ({
        outcomeId: branch.outcome.id,
        effect: branch.outcome.effect,
        probabilityFraction: serializeFraction(branch.probability),
        progressDelta: branch.applied.progressDelta,
        minutesDelta: branch.applied.minutesDelta,
        personMinutesDelta: branch.applied.personMinutesDelta,
        utility: branch.applied.utility,
        utilityFraction: serializeFraction(branch.applied.utilityFraction),
      })),
      expectedUtilityFraction: serializeFraction(expected.exact),
      utility: expected.utility,
      progressDelta: expectation('progressDelta'),
      minutesDelta: expectation('minutesDelta'),
      personMinutesDelta: expectation('personMinutesDelta'),
    };
  }
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
