import type {
  MeetingState,
  PresentedEvent,
  Response,
  UtilityRules,
} from '../types';
import { fixtureState } from './packs';
export const fixtureUtilityRules = {
  costWeight: 2,
  riskWeight: 3,
  costUnit: 4,
} as const satisfies UtilityRules;
/** Supports Design Doc v2 → Game state model immutability checks with frozen fixtures. */
export function deepFreeze<T>(input: T): T {
  if (input !== null && typeof input === 'object') {
    Object.freeze(input);
    for (const child of Object.values(input)) deepFreeze(child);
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
  label: 'Fixture choose',
  technique: 'owner',
  effect: { minutes: 3, progress: 20, risks: -1 },
  line: 'Fixture result.',
};
