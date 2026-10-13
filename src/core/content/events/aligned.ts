import type { MeetingEvent } from '../../engine/types';

// Approved docs/content-table-launch.md → aligned.
export const aligned = {
  id: 'aligned',
  kind: 'gift',
  rarity: 'rare',
  weight: 1,
  negative: false,
  speaker: 'dev',
  line: "Honestly? I think we're all aligned.",
  responses: [
    {
      id: 'ack',
      label: 'Record the agreement',
      technique: 'ack',
      effect: {
        minutes: 1,
        progress: 15,
        risks: -1,
      },
      line: 'Agreement recorded. One loose end is finally tied up.',
    },
  ],
  variants: [
    {
      when: {
        absent: ['dev'],
      },
      speaker: 'priya',
      line: "Dev's notes match our checklist. Honestly, I think we're all aligned.",
      responses: [
        {
          id: 'ack',
          label: 'Record the agreement',
          technique: 'ack',
          effect: {
            minutes: 1,
            progress: 15,
            risks: -1,
          },
          line: 'Agreement recorded. One loose end is finally tied up.',
        },
      ],
    },
  ],
} as const satisfies MeetingEvent;
