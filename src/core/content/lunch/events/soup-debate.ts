// Approved docs/content-table.md — lunch-l02b-reviewed-2; L05 injection only until L08.
import type { MeetingEvent, OutcomeResponse } from '../../../engine/types';
export const event = {
  id: 'soup-debate',
  kind: 'tangent',
  rarity: 'common',
  weight: 1,
  negative: false,
  speaker: 'gary',
  line: 'Before we choose lunch, should we agree whether soup counts as a drink?',
  responses: [
    {
      id: 'hear',
      label: 'Hear the soup theory',
      description:
        'Let Gary explain his distinction. Long discussion, with little help choosing a cuisine.',
      technique: 'hear',
      outcomes: [
        {
          id: 'theory',
          weight: 1,
          effect: {
            minutes: 9,
            progress: 2,
          },
          line: 'Gary cites a mug from 2018. Nobody expected the crockery to become a witness.',
        },
      ],
    },
    {
      id: 'refocus',
      label: 'Return to lunch',
      description:
        'Set soup aside and focus on the cuisine. Quick, without settling the theory.',
      technique: 'refocus',
      outcomes: [
        {
          id: 'returned',
          weight: 1,
          effect: {
            minutes: 2,
            progress: 4,
          },
          line: 'Soup remains unclassified. Choosing {cuisine} no longer requires a ruling on liquids.',
        },
      ],
    },
    {
      id: 'park',
      label: 'Promise a last word',
      description:
        'Postpone the theory for now. Gary will return to collect the last word you promised.',
      technique: 'park',
      outcomes: [
        {
          id: 'promised',
          weight: 1,
          effect: {
            minutes: 1,
            progress: 0,
            callback: {
              eventId: 'soup-return',
              afterTurns: 2,
            },
          },
          line: 'Gary writes down his soup question. The promise is now more durable than the lunch plan.',
        },
      ],
    },
  ],
} satisfies MeetingEvent<OutcomeResponse>;
