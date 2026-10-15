// Approved docs/content-table.md — lunch-l02b-reviewed-2; L05 injection only until L08.
import type { MeetingEvent, OutcomeResponse } from '../../../engine/types';
export const event = {
  id: 'pat-arrives',
  kind: 'escalation',
  rarity: 'uncommon',
  weight: 1,
  negative: true,
  speaker: 'vp',
  line: 'I saw lunch in the invitation. Where have we got to? I may be able to simplify this.',
  responses: [
    {
      id: 'hear',
      label: 'Give Pat the full recap',
      description:
        'Welcome Pat and recap the discussion. Adds context and another person to later costs.',
      technique: 'hear',
      outcomes: [
        {
          id: 'joined',
          weight: 1,
          effect: {
            minutes: 8,
            progress: 8,
            joins: ['vp'],
          },
          line: 'Pat joins, hears the full recap and repeats the cuisine suggestion as a helpful new idea.',
        },
      ],
    },
    {
      id: 'timebox',
      label: 'Give Pat the short recap',
      description:
        'Welcome Pat with the cuisine and main concern. Quicker, with Pat staying for the rest.',
      technique: 'timebox',
      outcomes: [
        {
          id: 'joined',
          weight: 1,
          effect: {
            minutes: 3,
            progress: 6,
            joins: ['vp'],
          },
          line: 'Pat joins and hears the {cuisine} suggestion. The short version receives a long nod.',
        },
      ],
    },
    {
      id: 'park',
      label: "Save Pat's questions",
      description:
        'Welcome Pat but postpone the questions. Quick now, with another adult staying in the room.',
      technique: 'park',
      outcomes: [
        {
          id: 'joined',
          weight: 1,
          effect: {
            minutes: 1,
            progress: 0,
            joins: ['vp'],
          },
          line: 'Pat joins and saves the questions for later. Being here already counts as involvement.',
        },
      ],
    },
  ],
  when: {
    minMinute: 15,
    absent: ['vp'],
  },
} satisfies MeetingEvent<OutcomeResponse>;
