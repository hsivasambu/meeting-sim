// Approved docs/content-table.md — lunch-l02b-reviewed-2; L05 injection only until L08.
import type { MeetingEvent, OutcomeResponse } from '../../../engine/types';
export const event = {
  id: 'menu-read',
  kind: 'gift',
  rarity: 'rare',
  weight: 1,
  negative: false,
  speaker: 'dev',
  line: 'I read the menu before coming. It has actual answers to several of our questions.',
  responses: [
    {
      id: 'ack',
      label: 'Use the useful notes',
      description:
        'Accept the relevant information and move on. A brief, reliable step toward agreement.',
      technique: 'ack',
      outcomes: [
        {
          id: 'used',
          weight: 1,
          effect: {
            minutes: 1,
            progress: 20,
          },
          line: "Dev's notes clarify the {cuisine} options. Preparation has made an unscheduled appearance.",
        },
      ],
    },
  ],
} satisfies MeetingEvent<OutcomeResponse>;
