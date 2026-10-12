import { expect, it } from 'vitest';
import { ENGINE_LIMITS } from './index';
import {
  DECISION_OWNER,
  PROGRESS_MAX,
  RISKS_MAX,
  MIN_HEADCOUNT,
  MAX_HEADCOUNT,
  INITIAL_BOOKING_END,
  REDUCED_BOOKING_END,
  FILLER_MINUTES,
  OUTCOME_MAX,
  EFFICIENCY_MAX,
  DECISIONS_MAX,
} from './constants';

it('exposes frozen observations backed by the canonical engine constants', () => {
  expect(ENGINE_LIMITS).toEqual({
    progressMax: PROGRESS_MAX,
    risksMax: RISKS_MAX,
    minHeadcount: MIN_HEADCOUNT,
    maxHeadcount: MAX_HEADCOUNT,
    decisionOwner: DECISION_OWNER,
    initialBookingEnd: INITIAL_BOOKING_END,
    reducedBookingEnd: REDUCED_BOOKING_END,
    scoreMax: OUTCOME_MAX + EFFICIENCY_MAX + DECISIONS_MAX,
    fillerMinutes: FILLER_MINUTES,
  });
  expect(Object.isFrozen(ENGINE_LIMITS)).toBe(true);
  expect(Reflect.set(ENGINE_LIMITS, 'progressMax', -1)).toBe(false);
  expect(ENGINE_LIMITS.progressMax).toBe(PROGRESS_MAX);
});
