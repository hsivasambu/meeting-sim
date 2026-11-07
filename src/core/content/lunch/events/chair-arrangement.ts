// Approved docs/content-table.md — lunch-l02b-reviewed-2; L05 injection only until L08.
import type { MeetingEvent, OutcomeResponse } from '../../../engine/types';
export const event = {
  id: 'chair-arrangement',
  kind: 'noise',
  rarity: 'common',
  weight: 1,
  negative: false,
  speaker: 'morgan',
  line: 'A circle would help us reach agreement. I have seen this work at an away day.',
  responses: [
    {
      id: 'hear',
      label: 'Rearrange the chairs',
      description:
        'Make the room feel collaborative. Takes time without settling a lunch preference.',
      technique: 'hear',
      outcomes: [
        {
          id: 'moved',
          weight: 1,
          effect: {
            minutes: 6,
            progress: 1,
          },
          line: 'The chairs form a circle. The conversation had achieved this shape without assistance.',
        },
      ],
    },
    {
      id: 'refocus',
      label: 'Keep the seats',
      description:
        'Stay seated and get back to lunch. A little progress without a room rearrangement.',
      technique: 'refocus',
      outcomes: [
        {
          id: 'seated',
          weight: 1,
          effect: {
            minutes: 1,
            progress: 3,
          },
          line: 'We continue from the existing chairs. Morgan calls it an interim arrangement.',
        },
      ],
    },
  ],
} satisfies MeetingEvent<OutcomeResponse>;
