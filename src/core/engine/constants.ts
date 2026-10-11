import type { AttendeeId, Rarity } from './types';

export const ZERO = 0;
export const ONE = 1;
export const INITIAL_BOOKING_END = 60;
export const REDUCED_BOOKING_END = 45;
export const PROGRESS_MAX = 100;
export const RISKS_MAX = 5;
export const MIN_HEADCOUNT = 2;
export const MAX_HEADCOUNT = 8;
export const DECISION_OWNER: AttendeeId = 'priya';
export const INITIAL_ATTENDEES = [
  'priya',
  'dev',
  'sam',
  'morgan',
  'gary',
  'jordan',
] as const satisfies readonly AttendeeId[];
export const FIRST_SUBSTANTIVE_DRAWS = 2;
export const CALLBACK_DELAY = 2;
export const FILLER_MINUTES = 2;
export const DEFAULT_EVENT_WEIGHT = 1;
export const RARITY_WEIGHTS = {
  common: 65,
  uncommon: 28,
  rare: 7,
} as const satisfies Record<Rarity, number>;
export const OUTCOME_MAX = 400;
export const RISK_PENALTY = 60;
export const RISK_PENALTY_CAP = 200;
export const FAIL_MULTIPLIER = 1.8;
export const EFFICIENCY_MAX = 300;
export const COST_REF_PM = 360;
export const COST_FLOOR_PM = 90;
export const DECISIONS_MAX = 300;
export const W_COST = 1.2;
export const W_RISK = 12;
export const UTILITY_COST_PM = 6;
export const DISPLAY_HOURLY_RATE = 1000;
export const MINUTES_PER_HOUR = 60;
// Algorithm coefficients, not game tuning. cyrb53 hash seed is always zero.
export const HASH_INITIAL_LOW = 0xdeadbeef;
export const HASH_INITIAL_HIGH = 0x41c6ce57;
export const HASH_MIX_LOW = 2654435761;
export const HASH_MIX_HIGH = 1597334677;
export const HASH_FINAL_LOW = 2246822507;
export const HASH_FINAL_HIGH = 3266489909;
export const HASH_SHIFT_LOW = 16;
export const HASH_SHIFT_HIGH = 13;
export const HASH_HIGH_MASK = 2097151;
export const UINT32_RANGE = 4294967296;
export const PRNG_INCREMENT = 0x6d2b79f5;
export const PRNG_SHIFT_FIRST = 15;
export const PRNG_SHIFT_SECOND = 7;
export const PRNG_SHIFT_FINAL = 14;
export const PRNG_OR_FIRST = 1;
export const PRNG_OR_SECOND = 61;

export const UTILITY_RULES = {
  costWeight: W_COST,
  riskWeight: W_RISK,
  costUnit: UTILITY_COST_PM,
} as const;
export const REQUIREMENTS_REASON_KEY = 'requirements-not-met';
export const CALLBACK_TARGETS: Readonly<Partial<Record<string, string>>> = {
  'circle-back': 'circle-back-return',
  'support-training': 'support-follow-up',
  'p1-bug': 'p1-follow-up',
};
export const ARRIVAL_ATTENDEES: Readonly<Partial<Record<string, AttendeeId>>> =
  { legal: 'legal', 'vp-joins': 'vp' };
