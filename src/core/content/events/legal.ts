import type { MeetingEvent } from '../../engine/types';

// Approved docs/content-table.md → legal.
export const legal = {
  id: 'legal',
  kind: 'escalation',
  rarity: 'uncommon',
  weight: 1,
  negative: true,
  speaker: 'morgan',
  line: 'We should probably get Legal involved.',
  responses: [
    {
      id: 'hear',
      label: 'Explain the whole launch',
      technique: 'hear',
      effect: {
        minutes: 8,
        progress: 8,
        risks: 0,
        joins: ['legal'],
      },
      line: 'Legal joins and receives the full history, including the adapter search.',
    },
    {
      id: 'timebox',
      label: "Define Legal's remit",
      technique: 'timebox',
      effect: {
        minutes: 4,
        progress: 6,
        risks: 0,
        joins: ['legal'],
      },
      line: 'Legal joins with a focused launch checklist and a reason to stay.',
    },
    {
      id: 'email',
      label: 'Send Legal the brief',
      technique: 'email',
      effect: {
        minutes: 0,
        progress: 0,
        risks: 0,
        joins: ['legal'],
      },
      line: 'Legal joins with the brief in their inbox. The review is still ahead.',
    },
  ],
  variants: [
    {
      when: {
        absent: ['morgan'],
      },
      speaker: 'priya',
      line: 'Morgan left, but the launch still needs Legal in the room.',
      responses: [
        {
          id: 'hear',
          label: 'Explain the whole launch',
          technique: 'hear',
          effect: {
            minutes: 8,
            progress: 8,
            risks: 0,
            joins: ['legal'],
          },
          line: 'Legal joins and receives the full history, including the adapter search.',
        },
        {
          id: 'timebox',
          label: "Define Legal's remit",
          technique: 'timebox',
          effect: {
            minutes: 4,
            progress: 6,
            risks: 0,
            joins: ['legal'],
          },
          line: 'Legal joins with a focused launch checklist and a reason to stay.',
        },
        {
          id: 'email',
          label: 'Send Legal the brief',
          technique: 'email',
          effect: {
            minutes: 0,
            progress: 0,
            risks: 0,
            joins: ['legal'],
          },
          line: 'Legal joins with the brief in their inbox. The review is still ahead.',
        },
      ],
    },
  ],
} as const satisfies MeetingEvent;
