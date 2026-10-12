import type { ContentPack, Response, UtilityRules } from '../types';

const choices = [
  {
    id: 'clean',
    label: 'Fixture clean',
    technique: 'owner',
    effect: { minutes: 3, progress: 50 },
    line: 'Fixture clean result.',
  },
  {
    id: 'risky',
    label: 'Fixture risky',
    technique: 'timebox',
    effect: { minutes: 1, progress: 50, risks: 2 },
    line: 'Fixture risky result.',
  },
  {
    id: 'email',
    label: 'Fixture email',
    technique: 'email',
    effect: { minutes: 0 },
    line: 'Fixture email result.',
  },
  {
    id: 'slow',
    label: 'Fixture slow',
    technique: 'hear',
    effect: { minutes: 10 },
    line: 'Fixture slow result.',
  },
] as const satisfies readonly Response[];
const firstChoices = [
  ...choices,
  {
    id: 'park',
    label: 'Fixture park',
    technique: 'park',
    effect: {
      minutes: 1,
      risks: 1,
      callback: { eventId: 'alpha-return', afterTurns: 2 },
    },
    line: 'Fixture callback scheduled.',
  },
] as const satisfies readonly Response[];

/** Frozen synthetic content for D21 recorded runs, independent of live event design. */
export const goldenPack = {
  eventRules: {
    arrivalAttendees: {},
    bookingEventIds: [],
    callbackTargets: { alpha: 'alpha-return' },
  },
  events: [
    {
      id: 'alpha',
      kind: 'substantive',
      rarity: 'common',
      speaker: 'sam',
      line: 'Fixture alpha with expert.',
      responses: firstChoices,
      variants: [
        {
          when: { absent: ['sam'] },
          speaker: 'priya',
          line: 'Fixture alpha without expert.',
          responses: firstChoices,
        },
      ],
    },
    {
      id: 'beta',
      kind: 'substantive',
      rarity: 'common',
      speaker: 'priya',
      line: 'Fixture beta.',
      responses: choices,
    },
  ],
  callbacks: [
    {
      id: 'alpha-return',
      kind: 'callback',
      rarity: 'common',
      speaker: 'sam',
      line: 'Fixture expert callback.',
      responses: [
        {
          id: 'finish',
          label: 'Fixture finish',
          technique: 'ack',
          effect: { minutes: 4, progress: 100 },
          line: 'Fixture callback resolved.',
        },
      ],
      variants: [
        {
          when: { absent: ['sam'] },
          speaker: 'priya',
          line: 'Fixture callback without expert.',
          responses: [
            {
              id: 'finish',
              label: 'Fixture absent finish',
              technique: 'ack',
              effect: { minutes: 4, progress: 100 },
              line: 'Fixture absent callback resolved.',
            },
          ],
        },
      ],
    },
  ],
  filler: {
    id: 'filler',
    kind: 'noise',
    rarity: 'common',
    speaker: 'room',
    line: 'Fixture silence.',
    responses: [
      {
        id: 'ack',
        label: 'Fixture acknowledge',
        technique: 'ack',
        effect: { minutes: 2 },
        line: 'Fixture silence acknowledged.',
      },
    ],
  },
} as const satisfies ContentPack;
export const goldenWeights = { common: 5, uncommon: 3, rare: 2 } as const;
export const goldenUtilityRules = {
  costWeight: 2,
  riskWeight: 3,
  costUnit: 4,
  eventRules: goldenPack.eventRules,
} as const satisfies UtilityRules;
