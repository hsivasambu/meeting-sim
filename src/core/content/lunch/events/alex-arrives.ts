// Approved docs/content-table.md — lunch-l02b-reviewed-2; L05 injection only until L08.
import type { MeetingEvent, OutcomeResponse } from '../../../engine/types';
export const event = {
  id: 'alex-arrives',
  kind: 'escalation',
  rarity: 'uncommon',
  weight: 1,
  negative: true,
  speaker: 'legal',
  line: 'I brought the menu. I can check the wording, if that would help more than a recap.',
  responses: [
    {
      id: 'hear',
      label: 'Give Alex the history',
      description:
        'Welcome Alex and explain the discussion fully. Useful context, with a long recap.',
      technique: 'hear',
      outcomes: [
        {
          id: 'joined',
          weight: 1,
          effect: {
            minutes: 8,
            progress: 10,
            joins: ['legal'],
          },
          line: 'Alex joins, waits through the full history, then asks which menu item needs checking.',
        },
      ],
    },
    {
      id: 'timebox',
      label: 'Give Alex the question',
      description:
        'Welcome Alex with the cuisine and question. A short recap; Alex stays afterward.',
      technique: 'timebox',
      outcomes: [
        {
          id: 'joined',
          weight: 1,
          effect: {
            minutes: 3,
            progress: 8,
            joins: ['legal'],
          },
          line: 'Alex joins, opens the {cuisine} menu and asks for the question rather than the background.',
        },
      ],
    },
  ],
  when: {
    absent: ['legal'],
  },
} satisfies MeetingEvent<OutcomeResponse>;
