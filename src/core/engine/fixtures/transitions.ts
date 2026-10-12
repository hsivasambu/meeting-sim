import type {
  MeetingState,
  PresentedEvent,
  Response,
  UtilityRules,
} from '../types';
import { fixtureState, fixturePack } from './packs';
export const fixtureUtilityRules = {
  costWeight: 2,
  riskWeight: 3,
  costUnit: 4,
  eventRules: {
    ...fixturePack.eventRules,
    arrivalAttendees: { legal: 'legal', 'vp-joins': 'vp' },
    bookingEventIds: ['room-booked'],
  },
} as const satisfies UtilityRules;
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
    ...fixtureState,
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
export const fixtureResponse: Response = {
  id: 'choose',
  disabledReasonKey: 'fixture-unavailable',
  label: 'Fixture choose',
  technique: 'owner',
  effect: { minutes: 3, progress: 20, risks: -1 },
  line: 'Fixture result.',
};
