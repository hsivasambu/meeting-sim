import type { ContentPack, MeetingState, Response } from '../types';

const expertResponses = [
  {
    id: 'expert',
    label: 'Fixture expert',
    technique: 'owner',
    requires: { present: ['sam'] },
    effect: { minutes: 3, progress: 11 },
    line: 'Fixture resolved.',
  },
  {
    id: 'park',
    label: 'Fixture park',
    technique: 'park',
    effect: {
      minutes: 2,
      risks: 1,
      callback: { eventId: 'support-follow-up', afterTurns: 2 },
    },
    line: 'Fixture parked.',
  },
] as const satisfies readonly Response[];
const absentSupportResponses = [
  {
    id: 'park',
    label: 'Fixture park without expert',
    technique: 'park',
    effect: {
      minutes: 2,
      risks: 1,
      callback: { eventId: 'support-follow-up', afterTurns: 2 },
    },
    line: 'Fixture parked without expert.',
  },
] as const satisfies readonly Response[];
const ackResponses = [
  {
    id: 'ack',
    label: 'Fixture acknowledge',
    technique: 'ack',
    effect: { minutes: 2 },
    line: 'Fixture acknowledged.',
  },
] as const satisfies readonly Response[];
// Synthetic fixture copy and weights are intentionally unrelated to live content.
export const fixturePack = {
  events: [
    {
      id: 'support-training',
      kind: 'substantive',
      rarity: 'common',
      speaker: 'sam',
      line: 'Fixture alpha.',
      responses: expertResponses,
      variants: [
        {
          when: { absent: ['sam'] },
          speaker: 'priya',
          line: 'Fixture alpha without Sam.',
          responses: absentSupportResponses,
        },
      ],
    },
    {
      id: 'fixture-beta',
      kind: 'substantive',
      rarity: 'common',
      speaker: 'dev',
      line: 'Fixture beta.',
      responses: ackResponses,
      variants: [
        {
          when: { absent: ['dev'] },
          speaker: 'priya',
          line: 'Fixture beta without Dev.',
          responses: ackResponses,
        },
      ],
    },
    {
      id: 'fixture-gamma',
      kind: 'tangent',
      rarity: 'uncommon',
      negative: true,
      weight: 2,
      speaker: 'gary',
      line: 'Fixture gamma.',
      when: { present: ['gary'] },
      responses: ackResponses,
    },
  ],
  callbacks: [
    {
      id: 'support-follow-up',
      kind: 'callback',
      rarity: 'common',
      speaker: 'priya',
      line: 'Fixture callback.',
      responses: ackResponses,
    },
  ],
  filler: {
    id: 'filler',
    kind: 'noise',
    rarity: 'common',
    speaker: 'room',
    line: 'Fixture filler.',
    responses: ackResponses,
  },
} as const satisfies ContentPack;

export const fixtureState = {
  seed: 'fixture-seed',
  turn: 0,
  minute: 0,
  bookingEnd: 60,
  progress: 0,
  risks: 0,
  personMinutes: 0,
  present: ['priya', 'dev', 'sam', 'morgan', 'gary', 'jordan'],
  peakHeadcount: 6,
  seenEventIds: [],
  spokenAttendeeIds: [],
  parkedCount: 0,
  substantiveDrawCount: 0,
  previousDrawWasUncommonNegative: false,
  scheduled: [],
  current: null,
  decisions: [],
  log: [],
  phase: 'running',
  ending: null,
} as const satisfies MeetingState;
