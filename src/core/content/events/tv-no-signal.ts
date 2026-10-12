import type { MeetingEvent } from '../../engine/types';

// Approved docs/content-table.md → tv-no-signal.
export const tvNoSignal = {
  id: 'tv-no-signal',
  kind: 'noise',
  rarity: 'common',
  weight: 1,
  negative: false,
  speaker: 'morgan',
  line: "The TV just says 'No Signal'.",
  responses: [
    {
      id: 'hear',
      label: 'Try every input',
      technique: 'hear',
      requires: {
        present: ['morgan'],
      },
      disabledReasonKey: 'morgan-absent',
      effect: {
        minutes: 7,
        progress: 2,
        risks: 0,
      },
      line: 'Morgan discovers an input called Hospitality Mode. It is not hospitable.',
    },
    {
      id: 'timebox',
      label: 'Use the whiteboard',
      technique: 'timebox',
      effect: {
        minutes: 2,
        progress: 3,
        risks: 0,
      },
      line: "Friday's decision fits on the whiteboard. The TV contributes nothing.",
    },
    {
      id: 'email',
      label: 'Send the slide link',
      technique: 'email',
      effect: {
        minutes: 0,
        progress: 0,
        risks: 0,
      },
      line: "Everyone has the link. Nobody needs the television's approval.",
    },
  ],
  variants: [
    {
      when: {
        absent: ['morgan'],
      },
      speaker: 'priya',
      line: "Morgan left. The TV is still presenting 'No Signal'.",
      responses: [
        {
          id: 'timebox',
          label: 'Use the whiteboard',
          technique: 'timebox',
          effect: {
            minutes: 2,
            progress: 3,
            risks: 0,
          },
          line: "Friday's decision fits on the whiteboard. The TV contributes nothing.",
        },
        {
          id: 'email',
          label: 'Send the slide link',
          technique: 'email',
          effect: {
            minutes: 0,
            progress: 0,
            risks: 0,
          },
          line: "Everyone has the link. Nobody needs the television's approval.",
        },
      ],
    },
  ],
} as const satisfies MeetingEvent;
