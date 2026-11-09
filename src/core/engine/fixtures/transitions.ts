import type { MeetingState, PresentedEvent, Response } from '../types';
import { lunchState, lunchChoice, lunchRules } from './lunch';
export const fixtureUtilityRules = {
  ...lunchRules,
  costWeight: 2,
  costUnit: 4,
};
const deeplyFrozenInputs = new WeakSet<object>();
/** Supports Design Doc v2 → Game state model immutability checks with frozen fixtures. */
export function deepFreeze<T>(input: T): T {
  if (
    input !== null &&
    typeof input === 'object' &&
    !deeplyFrozenInputs.has(input)
  ) {
    Object.freeze(input);
    for (const child of Object.values(input)) deepFreeze(child);
    // Cache only after visiting descendants: a caller's shallow freeze is not enough.
    deeplyFrozenInputs.add(input);
  }
  return input;
}
/** Supports Design Doc v2 → Events and responses with synthetic pending dialogue. */
export function pending(
  responses: readonly Response[],
  state: Partial<MeetingState> = {},
  event: Partial<PresentedEvent> = {},
): MeetingState {
  return {
    ...lunchState({ turn: 0 }),
    ...state,
    current: {
      id: 'fixture-event',
      kind: 'substantive',
      rarity: 'common',
      negative: false,
      speaker: 'sam',
      line: 'Fixture pending.',
      responses,
      ...event,
    },
  };
}
export const fixtureResponse = lunchChoice(
  'choose',
  { minutes: 3, progress: 20 },
  'owner',
);
