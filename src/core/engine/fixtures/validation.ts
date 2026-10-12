import type { ContentPack, MeetingEvent, Response } from '../types';
import { fixturePack } from './packs';

const ack: Response = {
  id: 'ack',
  label: 'Acknowledge',
  technique: 'ack',
  effect: { minutes: 2 },
  line: 'Fixture acknowledgement.',
};
const issue = (id: string): MeetingEvent => ({
  id,
  kind: 'substantive',
  rarity: 'common',
  speaker: 'room',
  line: 'Fixture issue.',
  responses: [ack],
});
const parent = (id: string, target: string): MeetingEvent => ({
  ...issue(id),
  responses: [
    {
      id: 'park',
      label: 'Park for later',
      technique: 'park',
      effect: { minutes: 1, callback: { eventId: target, afterTurns: 2 } },
      line: 'Fixture deferred.',
    },
  ],
});
// Authored-limit fixture, intentionally unrelated to the approved live dialogue/tuning.
export const validationPack: ContentPack = {
  eventRules: {
    arrivalAttendees: { legal: 'legal', 'vp-joins': 'vp' },
    callbackTargets: {
      'circle-back': 'circle-back-return',
      'support-training': 'support-follow-up',
      'p1-bug': 'p1-follow-up',
    },
    bookingEventIds: ['room-booked'],
  },
  events: [
    parent('circle-back', 'circle-back-return'),
    parent('support-training', 'support-follow-up'),
    parent('p1-bug', 'p1-follow-up'),
    {
      ...issue('legal'),
      kind: 'escalation',
      speaker: 'legal',
      responses: [{ ...ack, effect: { minutes: 2, joins: ['legal'] } }],
    },
    {
      ...issue('vp-joins'),
      kind: 'escalation',
      speaker: 'vp',
      responses: [{ ...ack, effect: { minutes: 2, joins: ['vp'] } }],
    },
    {
      ...issue('room-booked'),
      kind: 'noise',
      responses: [{ ...ack, effect: { minutes: 2, bookingEnd: 45 } }],
    },
  ],
  callbacks: ['circle-back-return', 'support-follow-up', 'p1-follow-up'].map(
    (id) => ({ ...issue(id), kind: 'callback' }),
  ),
  filler: fixturePack.filler,
};
