import {
  BIGINT_ONE,
  BIGINT_ZERO,
  DECIMAL_BASE,
  ONE,
  ZERO,
  UTILITY_RATIO_DIGITS,
} from './constants';
import { EngineError } from './errors';
import type { UtilityRules } from './types';
export interface Fraction {
  readonly numerator: bigint;
  readonly denominator: bigint;
}
/** Exact weighted utilities and q, with no epsilon comparisons. */
export function addFractions(a: Fraction, b: Fraction): Fraction {
  return {
    numerator: a.numerator * b.denominator + b.numerator * a.denominator,
    denominator: a.denominator * b.denominator,
  };
}
export function subtractFractions(a: Fraction, b: Fraction): Fraction {
  return {
    numerator: a.numerator * b.denominator - b.numerator * a.denominator,
    denominator: a.denominator * b.denominator,
  };
}
export function compareFractions(a: Fraction, b: Fraction): number {
  const difference = a.numerator * b.denominator - b.numerator * a.denominator;
  return difference < BIGINT_ZERO
    ? -ONE
    : difference > BIGINT_ZERO
      ? ONE
      : ZERO;
}
export function serializeFraction(value: Fraction) {
  return {
    numerator: value.numerator.toString(),
    denominator: value.denominator.toString(),
  };
}
/** Implements Design Doc v2 → Scoring: exact arithmetic on decimal numeric inputs. */
export function decimalFraction(value: number) {
  if (!Number.isFinite(value)) throw new EngineError('invalid-rules');
  const [coefficient, exponent] = value.toString().split('e');
  if (coefficient === undefined) throw new EngineError('invalid-rules');
  const digits = coefficient.split('.')[ONE]?.length ?? ZERO;
  const integer = BigInt(coefficient.replace('.', ''));
  const shift = Number(exponent ?? ZERO) - digits;
  return shift >= ZERO
    ? {
        numerator: integer * DECIMAL_BASE ** BigInt(shift),
        denominator: BIGINT_ONE,
      }
    : { numerator: integer, denominator: DECIMAL_BASE ** BigInt(-shift) };
}
/** Implements Design Doc v2 → Scoring → Decisions: one rounding at the numeric boundary. */
export function fractionNumber(numerator: bigint, denominator: bigint): number {
  if (numerator === BIGINT_ZERO) return ZERO;
  const sign = numerator < BIGINT_ZERO ? -ONE : ONE;
  const n = (numerator < BIGINT_ZERO ? -numerator : numerator).toString();
  const d = denominator.toString();
  const leadingN = n.slice(ZERO, UTILITY_RATIO_DIGITS),
    leadingD = d.slice(ZERO, UTILITY_RATIO_DIGITS);
  const exponent = n.length - leadingN.length - d.length + leadingD.length;
  const [mantissa, power] = ((sign * Number(leadingN)) / Number(leadingD))
    .toString()
    .split('e');
  if (mantissa === undefined) throw new EngineError('invalid-rules');
  return Number(mantissa + 'e' + (Number(power ?? ZERO) + exponent));
}
/** Implements Design Doc v2 → Scoring → Decisions: exact equality for decimal tuning coefficients. */
export function utilityFraction(
  progress: number,
  personMinutes: number,
  risks: number,
  rules: UtilityRules,
) {
  if (
    !Number.isSafeInteger(progress) ||
    !Number.isSafeInteger(personMinutes) ||
    !Number.isSafeInteger(risks) ||
    rules.costUnit <= ZERO
  )
    throw new EngineError('invalid-rules');
  const cost = decimalFraction(rules.costWeight),
    risk = decimalFraction(rules.riskWeight),
    unit = decimalFraction(rules.costUnit);
  const denominator = cost.denominator * unit.numerator * risk.denominator;
  const numerator =
    BigInt(progress) * denominator -
    cost.numerator *
      unit.denominator *
      BigInt(personMinutes) *
      risk.denominator -
    risk.numerator * BigInt(risks) * cost.denominator * unit.numerator;
  return { numerator, denominator };
}
