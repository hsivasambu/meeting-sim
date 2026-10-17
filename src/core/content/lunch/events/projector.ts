// Approved docs/content-table.md — lunch-l02b-reviewed-2; L05 injection only until L08.
import type { MeetingEvent, OutcomeResponse } from '../../../engine/types';
export const event = {
  id: 'projector',
  kind: 'noise',
  rarity: 'common',
  weight: 1,
  negative: false,
  speaker: 'dev',
  line: 'The menu is on my laptop. The screen is waiting for a cable none of us brought.',
  responses: [
    {
      id: 'hear',
      label: 'Find the right cable',
      description:
        'Try the big screen. Everyone waits while Dev checks the cupboard.',
      technique: 'hear',
      outcomes: [
        {
          id: 'searched',
          weight: 1,
          effect: {
            minutes: 7,
            progress: 2,
          },
          line: 'Dev finds four cables. The cupboard has prepared for every meeting except this one.',
        },
      ],
    },
    {
      id: 'timebox',
      label: 'Use the laptop',
      description:
        'Read the menu together on the laptop. Less comfortable, less discussion about cables.',
      technique: 'timebox',
      outcomes: [
        {
          id: 'shared',
          weight: 1,
          effect: {
            minutes: 2,
            progress: 3,
          },
          line: 'Dev turns the laptop around. Everyone leans in rather than mentioning the big screen.',
        },
      ],
    },
    {
      id: 'park',
      label: 'Set the menu aside',
      description:
        'Set the menu aside and return to {cuisine}. Fast, with no help from reading it this time.',
      technique: 'park',
      outcomes: [
        {
          id: 'skipped',
          weight: 1,
          effect: {
            minutes: 1,
            progress: 0,
          },
          line: 'Dev closes the menu. Apparently we can discuss {cuisine} without looking at the options.',
        },
      ],
    },
  ],
} satisfies MeetingEvent<OutcomeResponse>;
