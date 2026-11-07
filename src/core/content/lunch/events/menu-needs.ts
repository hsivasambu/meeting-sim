// Approved docs/content-table.md — lunch-l02b-reviewed-2; L05 injection only until L08.
import type { MeetingEvent, OutcomeResponse } from '../../../engine/types';
export const event = {
  id: 'menu-needs',
  kind: 'substantive',
  rarity: 'common',
  weight: 1,
  negative: false,
  speaker: 'sam',
  line: "Can we find a proper vegetarian meal? I'd like lunch, rather than a decorative salad.",
  responses: [
    {
      id: 'hear',
      label: 'Check the meal options',
      description:
        'Take time to check for a proper meal. A solid answer helps the room move forward.',
      technique: 'hear',
      outcomes: [
        {
          id: 'checked',
          weight: 1,
          effect: {
            minutes: 6,
            progress: 18,
          },
          line: 'There are proper meal options. Sam can stop defending the radical idea of eating lunch.',
        },
      ],
    },
    {
      id: 'invite',
      label: 'Ask Alex to join',
      description:
        'Ask Alex to help. Alex stays, raising later costs; an unclear note could slow the check.',
      technique: 'owner',
      requires: {
        absent: ['legal'],
      },
      disabledReasonKey: 'alex-present',
      outcomes: [
        {
          id: 'helpful',
          weight: 3,
          effect: {
            minutes: 4,
            progress: 16,
            joins: ['legal'],
          },
          line: 'Alex joins with useful menu details. Someone has brought information to the discussion.',
        },
        {
          id: 'more-questions',
          weight: 2,
          effect: {
            minutes: 7,
            progress: 4,
            joins: ['legal'],
          },
          line: 'Alex joins and finds an unclear menu note. We spend longer checking it, not guessing.',
        },
      ],
    },
    {
      id: 'park',
      label: 'Return to meals later',
      description: 'Keep moving now. Sam plans to return to the meal question.',
      technique: 'park',
      outcomes: [
        {
          id: 'deferred',
          weight: 1,
          effect: {
            minutes: 1,
            progress: 0,
            callback: {
              eventId: 'menu-return',
              afterTurns: 2,
            },
          },
          line: 'Sam writes down the meal question. Postponing it has not made a salad more filling.',
        },
      ],
    },
  ],
} satisfies MeetingEvent<OutcomeResponse>;
