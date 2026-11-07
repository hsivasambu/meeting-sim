// Approved docs/content-table.md — lunch-l02b-reviewed-2; L05 injection only until L08.
import type { MeetingEvent, OutcomeResponse } from '../../../engine/types';
export const event = {
  id: 'filler',
  kind: 'noise',
  rarity: 'common',
  weight: 1,
  negative: false,
  speaker: 'room',
  line: 'Nobody speaks. Everyone waits for someone else to take responsibility for the pause.',
  responses: [
    {
      id: 'ack',
      label: 'Wait through the pause',
      description:
        'Let the silence pass. Discussion time still passes, without moving the cuisine forward.',
      technique: 'ack',
      outcomes: [
        {
          id: 'waited',
          weight: 1,
          effect: {
            minutes: 2,
            progress: 0,
          },
          line: 'Someone caps a marker. The room has spent another pause considering {cuisine}.',
        },
      ],
    },
  ],
} satisfies MeetingEvent<OutcomeResponse>;
