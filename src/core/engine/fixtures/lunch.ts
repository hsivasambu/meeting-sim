import type {
  Effect,
  LunchContentPack,
  LunchState,
  LunchUtilityRules,
  MeetingEvent,
  OutcomeResponse,
  Technique,
} from '../types';
import { initialLunchState } from '../state';

/** Synthetic rules only: deliberately unrelated to the unapproved lunch table. */
export function lunchChoice(
  id: string,
  effect: Effect,
  technique: Technique = 'hear',
): OutcomeResponse {
  return {
    id,
    label: 'Fixture choice',
    description: 'Fixture description.',
    technique,
    outcomes: [{ id: 'done', weight: 1, effect, line: 'Fixture outcome.' }],
  };
}
export const nomination: MeetingEvent<OutcomeResponse> = {
  id: 'fixture-nomination',
  kind: 'substantive',
  rarity: 'common',
  speaker: 'priya',
  line: 'Fixture nomination.',
  responses: ['fixture-a', 'fixture-b', 'fixture-c'].map((id) =>
    lunchChoice(id, { minutes: 1, progress: 5, nominateCuisine: id }),
  ),
};
export const invite: OutcomeResponse = {
  ...lunchChoice('invite', { minutes: 2, progress: 10, joins: ['vp'] }),
  requires: { absent: ['vp'] },
  disabledReasonKey: 'fixture-present',
  outcomes: [
    {
      id: 'bad',
      weight: 1,
      effect: { minutes: 3, progress: -5, joins: ['vp'] },
      line: 'Fixture setback.',
    },
    {
      id: 'good',
      weight: 3,
      effect: { minutes: 2, progress: 10, joins: ['vp'] },
      line: 'Fixture advance.',
    },
  ],
};
export const lottery: OutcomeResponse = {
  ...lunchChoice('lottery', { minutes: 1 }),
  outcomes: [
    {
      id: 'bad',
      weight: 1,
      effect: { minutes: 6, progress: -10 },
      line: 'Fixture setback.',
    },
    {
      id: 'good',
      weight: 1,
      effect: { minutes: 1, progress: 10 },
      line: 'Fixture advance.',
    },
  ],
};
const substantive: MeetingEvent<OutcomeResponse> = {
  id: 'fixture-discussion',
  kind: 'substantive',
  rarity: 'common',
  speaker: 'priya',
  line: 'Fixture discussion.',
  responses: [
    lunchChoice('advance', { minutes: 2, progress: 25 }),
    lunchChoice('wait', { minutes: 1 }),
    invite,
  ],
  variants: [
    {
      when: { present: ['vp'] },
      speaker: 'vp',
      line: 'Fixture invited speaker.',
      responses: [
        lunchChoice('advance', { minutes: 2, progress: 25 }),
        lunchChoice('wait', { minutes: 1 }),
      ],
    },
  ],
};
const callbackTargets = {
  'fixture-parent-a': 'fixture-return-a',
  'fixture-parent-b': 'fixture-return-b',
  'fixture-parent-c': 'fixture-return-c',
} as const;
const parents = Object.entries(callbackTargets).map(
  ([id, eventId]): MeetingEvent<OutcomeResponse> => ({
    id,
    kind: 'tangent',
    rarity: 'common',
    speaker: 'room',
    line: 'Fixture parent.',
    responses: [
      lunchChoice(
        'park',
        { minutes: 1, callback: { eventId, afterTurns: 2 } },
        'park',
      ),
      lunchChoice('advance', { minutes: 2, progress: 25 }),
    ],
  }),
);
const arrivals: readonly MeetingEvent<OutcomeResponse>[] = [
  {
    id: 'fixture-vp',
    kind: 'escalation',
    rarity: 'rare',
    speaker: 'vp',
    line: 'Fixture arrival.',
    when: { absent: ['vp'] },
    responses: [lunchChoice('ack', { minutes: 1, joins: ['vp'] })],
  },
  {
    id: 'fixture-legal',
    kind: 'escalation',
    rarity: 'rare',
    speaker: 'legal',
    line: 'Fixture arrival.',
    when: { absent: ['legal'] },
    responses: [lunchChoice('ack', { minutes: 1, joins: ['legal'] })],
  },
];
export const lunchPack: LunchContentPack = {
  cuisines: [
    { id: 'fixture-a', name: 'Fixture A' },
    { id: 'fixture-b', name: 'Fixture B' },
    { id: 'fixture-c', name: 'Fixture C' },
  ],
  eventRules: {
    nominationEventId: nomination.id,
    arrivalPermissions: [
      { eventId: substantive.id, responseId: 'invite', attendeeId: 'vp' },
      { eventId: 'fixture-vp', responseId: 'ack', attendeeId: 'vp' },
      { eventId: 'fixture-legal', responseId: 'ack', attendeeId: 'legal' },
    ],
    arrivalAttendees: { 'fixture-vp': 'vp', 'fixture-legal': 'legal' },
    callbackTargets,
    bookingEventIds: ['fixture-booking'],
  },
  events: [
    nomination,
    substantive,
    {
      ...substantive,
      id: 'fixture-discussion-two',
      responses: substantive.responses.slice(0, 2),
    },
    ...parents,
    ...arrivals,
    {
      id: 'fixture-booking',
      kind: 'noise',
      rarity: 'uncommon',
      negative: true,
      speaker: 'room',
      line: 'Fixture booking.',
      responses: [
        lunchChoice('short', { minutes: 1, bookingEnd: 45 }),
        lunchChoice('long', { minutes: 2, bookingEnd: 60 }),
      ],
    },
    ...Array.from({ length: 8 }, (_, i): MeetingEvent<OutcomeResponse> => ({
      id: 'fixture-noise-' + i,
      kind: 'noise',
      rarity: 'uncommon',
      negative: true,
      speaker: 'room',
      line: 'Fixture noise.',
      responses: [lunchChoice('wait', { minutes: 1 }), lottery],
    })),
  ],
  callbacks: Object.values(callbackTargets).map((id) => ({
    id,
    kind: 'callback',
    rarity: 'common',
    speaker: 'room',
    line: 'Fixture callback.',
    responses: [lunchChoice('ack', { minutes: 1 })],
  })),
  filler: {
    id: 'fixture-filler',
    kind: 'noise',
    rarity: 'common',
    speaker: 'room',
    line: 'Fixture filler.',
    responses: [lunchChoice('ack', { minutes: 2 })],
  },
};
export const lunchRules: LunchUtilityRules = {
  profile: 'lunch',
  costWeight: 1.2,
  costUnit: 6,
  cuisines: lunchPack.cuisines,
  eventRules: lunchPack.eventRules,
};
export function lunchState(overrides: Partial<LunchState> = {}): LunchState {
  return {
    ...initialLunchState('fixture-lunch'),
    turn: 2,
    substantiveDrawCount: 2,
    nominatedCuisine: 'fixture-a',
    ...overrides,
  };
}
export function lunchPending(
  responses: readonly OutcomeResponse[],
  overrides: Partial<LunchState> = {},
): LunchState {
  return lunchState({
    ...overrides,
    current: {
      id: 'fixture-numeric',
      kind: 'substantive',
      rarity: 'common',
      negative: false,
      speaker: 'priya',
      line: 'Fixture numeric.',
      responses,
    },
  });
}
