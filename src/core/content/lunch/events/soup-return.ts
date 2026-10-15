// Approved docs/content-table.md — lunch-l02b-reviewed-2; L05 injection only until L08.
import type { MeetingEvent, OutcomeResponse } from '../../../engine/types';
export const event = {
  id: 'soup-return',
  kind: 'callback',
  rarity: 'common',
  weight: 1,
  negative: false,
  speaker: 'gary',
  line: 'You promised me a last word on soup. I have reduced it to three opening remarks.',
  responses: [
    {
      id: 'hear',
      label: 'Hear the last word',
      description:
        'Honour the promised discussion. Takes time and does little for choosing a cuisine.',
      technique: 'hear',
      outcomes: [
        {
          id: 'heard',
          weight: 1,
          effect: {
            minutes: 6,
            progress: 1,
          },
          line: 'Gary finishes his soup remarks. The lunch discussion is permitted to resume.',
        },
      ],
    },
    {
      id: 'refocus',
      label: 'Close the soup debate',
      description:
        'Acknowledge Gary and close the tangent. Quick focus, with the soup theory unresolved.',
      technique: 'refocus',
      outcomes: [
        {
          id: 'closed',
          weight: 1,
          effect: {
            minutes: 1,
            progress: 4,
          },
          line: 'Gary gets his acknowledgement. The soup question gets no more meeting time.',
        },
      ],
    },
  ],
} satisfies MeetingEvent<OutcomeResponse>;
