import type { MeetingEvent } from '../../engine/types';

// Approved docs/content-table.md → filler.
export const filler = {
  id: 'filler',
  kind: 'noise',
  rarity: 'common',
  weight: 1,
  negative: false,
  speaker: 'room',
  line: 'Awkward silence.',
  responses: [
    {
      id: 'ack',
      label: 'Wait through the silence',
      technique: 'ack',
      effect: {
        minutes: 2,
        progress: 0,
        risks: 0,
      },
      line: 'Someone caps a marker. Two minutes have passed.',
    },
  ],
} as const satisfies MeetingEvent;
