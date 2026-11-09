import { matchesCondition } from './conditions';
import { reasonFor } from './responseValidation';
import { evaluateOutcomes, expectedUtility } from './outcomes';
import { fractionNumber, serializeFraction } from './utilityFraction';
import { ZERO } from './constants';
import type {
  MeetingState,
  Response,
  ResponsePreview,
  UtilityRules,
} from './types';

/** Read-only expected deltas; the UI displays authored descriptions instead. */
export function previewWithRules(
  state: MeetingState,
  response: Response,
  rules: UtilityRules,
): ResponsePreview {
  if (!matchesCondition(state, response.requires)) {
    return {
      enabled: false,
      responseId: response.id,
      reasonKey: reasonFor(response),
    };
  }
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
