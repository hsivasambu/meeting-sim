import {
  ZERO,
  BIGINT_ONE,
  BIGINT_ZERO,
  PROGRESS_MAX,
  OUTCOME_MAX,
  RISK_PENALTY,
  RISK_PENALTY_CAP,
  FAIL_MULTIPLIER,
  EFFICIENCY_MAX,
  COST_REF_PM,
  COST_FLOOR_PM,
  DECISIONS_MAX,
  DISPLAY_HOURLY_RATE,
  MINUTES_PER_HOUR,
} from './constants';
import type { MeetingState, ScoreBreakdown } from './types';
import { decimalFraction } from './utilityFraction';
import { assertEnded } from './errors';

function qualityFraction(state: MeetingState) {
  let numerator = BIGINT_ZERO,
    denominator = BIGINT_ONE,
    count = BIGINT_ZERO;
  for (const { qualityFraction } of state.decisions) {
    if (qualityFraction === null) continue;
    const value = {
      numerator: BigInt(qualityFraction.numerator),
      denominator: BigInt(qualityFraction.denominator),
    };
    numerator = numerator * value.denominator + value.numerator * denominator;
    denominator *= value.denominator;
    count += BIGINT_ONE;
  }
  return { numerator, denominator: denominator * (count || BIGINT_ONE) };
}

/** Implements Design Doc v2 → Titles: compare unrounded average quality exactly. */
export function qualityAtLeast(
  state: MeetingState,
  threshold: number,
): boolean {
  const average = qualityFraction(state),
    minimum = decimalFraction(threshold);
  return (
    average.numerator * minimum.denominator >=
    minimum.numerator * average.denominator
  );
}

function decisionScore(state: MeetingState): number {
  const average = qualityFraction(state),
    maximum = decimalFraction(DECISIONS_MAX);
  const numerator = average.numerator * maximum.numerator;
  const denominator = average.denominator * maximum.denominator;
  // Integer division rounds exact nonnegative halves up without an epsilon.
  const twice = BIGINT_ONE + BIGINT_ONE;
  return Number((twice * numerator + denominator) / (twice * denominator));
}

/** Implements Design Doc v2 → Scoring: round each component before summing. */
export function score(state: MeetingState): ScoreBreakdown {
  assertEnded(state);
  const outcome = Math.round(
    state.progress >= PROGRESS_MAX
      ? OUTCOME_MAX - Math.min(RISK_PENALTY * state.risks, RISK_PENALTY_CAP)
      : FAIL_MULTIPLIER * state.progress,
  );
  const costRange = COST_REF_PM - COST_FLOOR_PM;
  const costSaved = Math.min(
    costRange,
    Math.max(ZERO, COST_REF_PM - state.personMinutes),
  );
  const efficiency = Math.round(
    (EFFICIENCY_MAX * (Math.min(state.progress, PROGRESS_MAX) * costSaved)) /
      (PROGRESS_MAX * costRange),
  );
  const decisions = decisionScore(state);
  return {
    outcome,
    efficiency,
    decisions,
    total: outcome + efficiency + decisions,
  };
}

/** Implements Design Doc v2 → Game state model: dollars are derived display data only. */
export function displayCost(personMinutes: number): number {
  return (personMinutes * DISPLAY_HOURLY_RATE) / MINUTES_PER_HOUR;
}

/** Implements Design Doc v2 → Results card: whole dollars with thousands separators. */
export function formatCost(personMinutes: number): string {
  return '$' + Math.round(displayCost(personMinutes)).toLocaleString('en-US');
}
