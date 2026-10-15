import {
  BIGINT_ZERO,
  BIGINT_ONE,
  ZERO,
  ONE,
  MAX_RESPONSE_OUTCOMES,
  MAX_OUTCOME_WEIGHT,
  LINE_CODE_POINTS,
  MIN_CONTENT_PROGRESS,
  MAX_CONTENT_PROGRESS,
} from './constants';
import { EngineError } from './errors';
import { matchesCondition } from './conditions';
import { reasonFor } from './responseValidation';
import { evaluateResponse } from './value';
import { addFractions, fractionNumber } from './utilityFraction';
import type {
  EngineResponse,
  MeetingState,
  OutcomeResponse,
  ResponseOutcome,
  UtilityRules,
} from './types';

/** Temporary migration discriminator; legacy launch effects stay unchanged until L08. */
export function hasOutcomes(
  response: EngineResponse,
): response is OutcomeResponse {
  return 'outcomes' in response;
}
/** ADR 0006: reject mixed/shared effects and validate the complete schema. */
export function responseOutcomes(
  response: EngineResponse,
): readonly ResponseOutcome[] {
  if (!hasOutcomes(response))
    return [
      {
        id: response.id,
        weight: ONE,
        effect: response.effect,
        line: response.line,
      },
    ];
  const outcomes = response.outcomes;
  if (
    'effect' in response ||
    'line' in response ||
    'effectCases' in response ||
    typeof response.description !== 'string' ||
    !response.description.trim() ||
    [...response.description].length > LINE_CODE_POINTS ||
    !Array.isArray(outcomes) ||
    outcomes.length < ONE ||
    outcomes.length > MAX_RESPONSE_OUTCOMES ||
    new Set(outcomes.map((outcome) => outcome.id)).size !== outcomes.length ||
    outcomes.some(
      (outcome) =>
        Object.keys(outcome).some(
          (key) => !['id', 'weight', 'effect', 'line'].includes(key),
        ) ||
        !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(outcome.id) ||
        !Number.isSafeInteger(outcome.weight) ||
        outcome.weight < ONE ||
        typeof outcome.line !== 'string' ||
        !outcome.line.trim() ||
        [...outcome.line].length > LINE_CODE_POINTS,
    ) ||
    outcomes.reduce((sum, outcome) => sum + outcome.weight, ZERO) >
      MAX_OUTCOME_WEIGHT
  )
    throw new EngineError('invalid-response');
  return [...outcomes].sort((a, b) =>
    a.id < b.id ? -ONE : a.id > b.id ? ONE : ZERO,
  );
}
/** Every branch uses the same validation, clamping and full-duration billing. No sampling. */
export function evaluateOutcomes<R extends EngineResponse>(
  state: MeetingState<R>,
  response: EngineResponse,
  rules: UtilityRules,
) {
  if (response.requires !== undefined) reasonFor(response);
  if (!matchesCondition(state, response.requires))
    throw new EngineError('disabled-response');
  const outcomes = responseOutcomes(response);
  const total = outcomes.reduce((sum, outcome) => sum + outcome.weight, ZERO);
  return outcomes.map((outcome) => {
    if (
      hasOutcomes(response) &&
      (outcome.effect.minutes < ONE ||
        (outcome.effect.progress ?? ZERO) < MIN_CONTENT_PROGRESS ||
        (outcome.effect.progress ?? ZERO) > MAX_CONTENT_PROGRESS)
    )
      throw new EngineError('invalid-effect');
    const applied = evaluateResponse(
      state,
      {
        id: response.id,
        label: response.label,
        technique: response.technique,
        ...(response.requires === undefined
          ? {}
          : { requires: response.requires }),
        ...(response.disabledReasonKey === undefined
          ? {}
          : { disabledReasonKey: response.disabledReasonKey }),
        effect: outcome.effect,
        line: outcome.line,
      },
      rules,
    );
    return {
      outcome,
      probability: {
        numerator: BigInt(outcome.weight),
        denominator: BigInt(total),
      },
      applied,
    };
  });
}
/** Weight after clamping; numeric approximations never determine q. */
export function expectedUtility(branches: ReturnType<typeof evaluateOutcomes>) {
  const exact = branches.reduce(
    (sum, branch) =>
      addFractions(sum, {
        numerator:
          branch.applied.utilityFraction.numerator *
          branch.probability.numerator,
        denominator:
          branch.applied.utilityFraction.denominator *
          branch.probability.denominator,
      }),
    { numerator: BIGINT_ZERO, denominator: BIGINT_ONE },
  );
  return { exact, utility: fractionNumber(exact.numerator, exact.denominator) };
}
