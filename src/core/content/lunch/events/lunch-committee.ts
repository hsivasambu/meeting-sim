// Approved docs/content-table.md — lunch-l02b-reviewed-2; L05 injection only until L08.
import type { MeetingEvent, OutcomeResponse } from '../../../engine/types';
export const event = {
  id: 'lunch-committee',
  kind: 'tangent',
  rarity: 'common',
  weight: 1,
  negative: false,
  speaker: 'jordan',
  line: 'Would a small lunch committee help? I have a larger group in mind to choose the members.',
  responses: [
    {
      id: 'hear',
      label: 'Discuss a committee',
      description:
        'Explore who would help choose lunch. Long discussion, with little progress on the cuisine.',
      technique: 'hear',
      outcomes: [
        {
          id: 'committee',
          weight: 1,
          effect: {
            minutes: 8,
            progress: 2,
          },
          line: 'The committee needs everyone here. We have discovered the meeting we are already in.',
        },
      ],
    },
    {
      id: 'owner',
      label: 'Give Priya the summary',
      description:
        'Ask Priya to summarise the cuisine and concerns. Useful focus, with a little work now.',
      technique: 'owner',
      outcomes: [
        {
          id: 'summary',
          weight: 1,
          effect: {
            minutes: 3,
            progress: 7,
          },
          line: 'Priya sums up {cuisine} and the concerns. Jordan offers to circulate the summary.',
        },
      ],
    },
    {
      id: 'park',
      label: 'Postpone the committee',
      description:
        'Put the committee aside. Quick, but it contributes nothing to choosing lunch.',
      technique: 'park',
      outcomes: [
        {
          id: 'aside',
          weight: 1,
          effect: {
            minutes: 1,
            progress: 0,
          },
          line: 'Jordan agrees to postpone forming the committee, but keeps the proposed membership list.',
        },
      ],
    },
  ],
} satisfies MeetingEvent<OutcomeResponse>;
