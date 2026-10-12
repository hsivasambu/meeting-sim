import type { MeetingEvent } from '../../engine/types';

// Approved docs/content-table.md → pre-read.
export const preRead = {
  id: 'pre-read',
  kind: 'gift',
  rarity: 'rare',
  weight: 1,
  negative: false,
  speaker: 'priya',
  line: 'Everyone actually read the pre-read.',
  responses: [
    {
      id: 'ack',
      label: 'Enjoy the miracle',
      technique: 'ack',
      effect: {
        minutes: 1,
        progress: 20,
        risks: 0,
      },
      line: 'We skip the summary. Nobody asks which document we mean.',
    },
  ],
} as const satisfies MeetingEvent;
