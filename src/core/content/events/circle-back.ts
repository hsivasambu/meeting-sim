import type { MeetingEvent } from '../../engine/types';

// Approved docs/content-table.md → circle-back.
export const circleBack = {
  id: 'circle-back',
  kind: 'tangent',
  rarity: 'common',
  weight: 1,
  negative: false,
  speaker: 'morgan',
  line: 'Can we circle back to this?',
  responses: [
    {
      id: 'hear',
      label: 'Find the original point',
      technique: 'hear',
      effect: {
        minutes: 6,
        progress: 1,
        risks: 0,
      },
      line: 'We locate the original point. It was a formatting suggestion.',
    },
    {
      id: 'timebox',
      label: 'Close the loop now',
      technique: 'timebox',
      effect: {
        minutes: 2,
        progress: 0,
        risks: 0,
      },
      line: 'The circle is closed. The launch decision is still ahead of us.',
    },
    {
      id: 'park',
      label: 'Circle back later',
      technique: 'park',
      effect: {
        minutes: 1,
        progress: 0,
        risks: 0,
        callback: {
          eventId: 'circle-back-return',
          afterTurns: 2,
        },
      },
      line: 'Added to the parking lot. This circle has a return address.',
    },
  ],
  variants: [
    {
      when: {
        absent: ['morgan'],
      },
      speaker: 'priya',
      line: 'Morgan left a note asking us to circle back. To what, exactly?',
      responses: [
        {
          id: 'hear',
          label: 'Find the original point',
          technique: 'hear',
          effect: {
            minutes: 6,
            progress: 1,
            risks: 0,
          },
          line: 'We locate the original point. It was a formatting suggestion.',
        },
        {
          id: 'timebox',
          label: 'Close the loop now',
          technique: 'timebox',
          effect: {
            minutes: 2,
            progress: 0,
            risks: 0,
          },
          line: 'The circle is closed. The launch decision is still ahead of us.',
        },
        {
          id: 'park',
          label: 'Circle back later',
          technique: 'park',
          effect: {
            minutes: 1,
            progress: 0,
            risks: 0,
            callback: {
              eventId: 'circle-back-return',
              afterTurns: 2,
            },
          },
          line: 'Added to the parking lot. This circle has a return address.',
        },
      ],
    },
  ],
} as const satisfies MeetingEvent;
