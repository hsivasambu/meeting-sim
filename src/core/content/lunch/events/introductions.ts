// Approved docs/content-table.md — lunch-l02b-reviewed-2; L05 injection only until L08.
import type { MeetingEvent, OutcomeResponse } from '../../../engine/types';
export const event = {
  id: 'introductions',
  kind: 'tangent',
  rarity: 'common',
  weight: 1,
  negative: false,
  speaker: 'jordan',
  line: 'Could we say our names first? I know most of you, but I would hate to assume.',
  responses: [
    {
      id: 'hear',
      label: 'Make introductions',
      description:
        'Let everyone introduce themselves. Polite, with a long detour from choosing lunch.',
      technique: 'hear',
      outcomes: [
        {
          id: 'introduced',
          weight: 1,
          effect: {
            minutes: 8,
            progress: 2,
          },
          line: 'Everyone reads the name already printed on their card. Jordan thanks them for sharing.',
        },
      ],
    },
    {
      id: 'timebox',
      label: 'Keep it to names',
      description:
        "Give each person a brief hello. A little courtesy without everyone's career history.",
      technique: 'timebox',
      outcomes: [
        {
          id: 'brief',
          weight: 1,
          effect: {
            minutes: 2,
            progress: 1,
          },
          line: 'Names are exchanged. Most were already in the email that brought us here.',
        },
      ],
    },
    {
      id: 'refocus',
      label: 'Return to the cuisine',
      description:
        'Remind everyone why we are here. Quick movement, with the welcome kept informal.',
      technique: 'refocus',
      outcomes: [
        {
          id: 'returned',
          weight: 1,
          effect: {
            minutes: 1,
            progress: 3,
          },
          line: 'Priya gives everyone a quick welcome and points to {cuisine}. That is why we are here.',
        },
      ],
    },
  ],
} satisfies MeetingEvent<OutcomeResponse>;
