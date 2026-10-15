// Approved docs/content-table.md — lunch-l02b-reviewed-2; L05 injection only until L08.
import type { MeetingEvent, OutcomeResponse } from '../../../engine/types';
export const event = {
  id: 'menu-return',
  kind: 'callback',
  rarity: 'common',
  weight: 1,
  negative: false,
  speaker: 'sam',
  line: 'We postponed the meal options. Can we finish that question instead of postponing lunch?',
  responses: [
    {
      id: 'hear',
      label: 'Finish the menu check',
      description:
        'Settle the deferred meal question. Reliable progress, with a longer check.',
      technique: 'hear',
      outcomes: [
        {
          id: 'finished',
          weight: 1,
          effect: {
            minutes: 6,
            progress: 18,
          },
          line: 'We finish the meal check. Sam thanks everyone for establishing that lunch includes food.',
        },
      ],
    },
    {
      id: 'owner',
      label: "Use Alex's menu notes",
      description:
        'Ask Alex to explain the options. Efficient help if the menu reader is already here.',
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
          line: 'Alex explains the meal options. Sam asks why we could not have started with that.',
        },
      ],
    },
    {
      id: 'timebox',
      label: 'Read the main options',
      description:
        'Check the main options together. Quicker, with less reassurance than a full review.',
      technique: 'timebox',
      outcomes: [
        {
          id: 'read',
          weight: 1,
          effect: {
            minutes: 3,
            progress: 10,
          },
          line: 'We read the main options. Sam picks out the meals that were missing from the discussion.',
        },
      ],
    },
  ],
} satisfies MeetingEvent<OutcomeResponse>;
