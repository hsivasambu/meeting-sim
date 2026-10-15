// Approved docs/content-table.md — lunch-l02b-reviewed-2; L05 injection only until L08.
import type { MeetingEvent, OutcomeResponse } from '../../../engine/types';
export const event = {
  id: 'spice-return',
  kind: 'callback',
  rarity: 'common',
  weight: 1,
  negative: false,
  speaker: 'sam',
  line: 'The mild option question is back. I still need an answer, rather than encouragement.',
  responses: [
    {
      id: 'hear',
      label: 'Finish the spice check',
      description:
        'Settle the deferred preference. Reliable reassurance takes a longer discussion.',
      technique: 'hear',
      outcomes: [
        {
          id: 'finished',
          weight: 1,
          effect: {
            minutes: 6,
            progress: 18,
          },
          line: 'We finish checking mild options. Sam says that was the question all along.',
        },
      ],
    },
    {
      id: 'owner',
      label: 'Ask Alex for the detail',
      description:
        "Use Alex's menu reading to answer. Efficient, if Alex is already in the room.",
      technique: 'owner',
      requires: {
        present: ['legal'],
      },
      disabledReasonKey: 'alex-absent',
      outcomes: [
        {
          id: 'explained',
          weight: 1,
          effect: {
            minutes: 3,
            progress: 16,
          },
          line: 'Alex clarifies the mild options. Sam can finally stop asking the same question.',
        },
      ],
    },
    {
      id: 'timebox',
      label: 'Check the key wording',
      description:
        'Read the key wording together. Quicker than the full check, with less detail settled.',
      technique: 'timebox',
      outcomes: [
        {
          id: 'read',
          weight: 1,
          effect: {
            minutes: 3,
            progress: 10,
          },
          line: 'We check the key wording. Sam underlines mild and hands the menu back.',
        },
      ],
    },
  ],
} satisfies MeetingEvent<OutcomeResponse>;
