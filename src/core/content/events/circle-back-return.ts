import type { MeetingEvent } from '../../engine/types';

// Approved docs/content-table.md → circle-back-return.
export const circleBackReturn = {
  id: 'circle-back-return',
  kind: 'callback',
  rarity: 'common',
  weight: 1,
  negative: false,
  speaker: 'morgan',
  line: 'We circled back. I still want to discuss the slide formatting.',
  responses: [
    {
      id: 'hear',
      label: 'Review the formatting',
      technique: 'hear',
      effect: {
        minutes: 6,
        progress: 1,
        risks: 0,
      },
      line: 'The headings are now consistent. Friday is no closer.',
    },
    {
      id: 'timebox',
      label: 'Close the format note',
      technique: 'timebox',
      effect: {
        minutes: 1,
        progress: 0,
        risks: 0,
      },
      line: 'We close the formatting note. No second circle is scheduled.',
    },
  ],
  variants: [
    {
      when: {
        absent: ['morgan'],
      },
      speaker: 'priya',
      line: "Morgan's formatting note is back. The launch still has the same deadline.",
      responses: [
        {
          id: 'hear',
          label: 'Review the formatting',
          technique: 'hear',
          effect: {
            minutes: 6,
            progress: 1,
            risks: 0,
          },
          line: 'The headings are now consistent. Friday is no closer.',
        },
        {
          id: 'timebox',
          label: 'Close the format note',
          technique: 'timebox',
          effect: {
            minutes: 1,
            progress: 0,
            risks: 0,
          },
          line: 'We close the formatting note. No second circle is scheduled.',
        },
      ],
    },
  ],
} as const satisfies MeetingEvent;
