// Approved docs/content-table.md — lunch-l02b-reviewed-2; L05 injection only until L08.
import type { MeetingEvent, OutcomeResponse } from '../../../engine/types';
export const event = {
  id: 'small-concession',
  kind: 'gift',
  rarity: 'rare',
  weight: 1,
  negative: false,
  speaker: 'gary',
  line: "I could go along with {cuisine}. You don't need to record that as a change of position.",
  responses: [
    {
      id: 'ack',
      label: 'Accept the concession',
      description:
        'Let Gary soften his position without a speech. A short, reliable bit of progress.',
      technique: 'ack',
      outcomes: [
        {
          id: 'accepted',
          weight: 1,
          effect: {
            minutes: 1,
            progress: 18,
          },
          line: 'Gary moves toward {cuisine}. The record will show he was already standing quite near it.',
        },
      ],
    },
  ],
} satisfies MeetingEvent<OutcomeResponse>;
