import type { EngineResponse, MeetingState, OutcomeResponse } from '../types';
import { pending } from './transitions';

export const lottery = {
  id: 'choose',
  label: 'Fixture lottery',
  description: 'Fixture uncertain tradeoff.',
  technique: 'park',
  outcomes: [
    {
      id: 'good',
      weight: 2,
      effect: { minutes: 2, progress: 20 },
      line: 'Fixture good outcome.',
    },
    {
      id: 'bad',
      weight: 1,
      effect: { minutes: 7, progress: -10 },
      line: 'Fixture bad outcome.',
    },
  ],
} as const satisfies OutcomeResponse;
export const steady = {
  id: 'steady',
  label: 'Fixture steady',
  description: 'Fixture deterministic alternative.',
  technique: 'hear',
  outcomes: [
    {
      id: 'steady',
      weight: 1,
      effect: { minutes: 3, progress: 5 },
      line: 'Fixture steady outcome.',
    },
  ],
} as const satisfies OutcomeResponse;
export const outcomeRules = {
  costWeight: 1.2,
  riskWeight: 0,
  costUnit: 6,
  eventRules: {
    arrivalAttendees: {},
    callbackTargets: {},
    bookingEventIds: [],
  },
} as const;
export function outcomePending(
  responses: readonly EngineResponse[] = [lottery, steady],
  state: Partial<MeetingState<EngineResponse>> = {},
): MeetingState<EngineResponse> {
  const base = pending([]);
  if (base.current === null) throw new Error('Missing fixture presentation');
  return { ...base, ...state, current: { ...base.current, responses } };
}
