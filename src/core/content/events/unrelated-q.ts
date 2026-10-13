import type { MeetingEvent } from '../../engine/types';

// Approved docs/content-table-launch.md → unrelated-q.
export const unrelatedQ = {
  id: 'unrelated-q',
  kind: 'tangent',
  rarity: 'common',
  weight: 1,
  negative: false,
  when: {
    present: ['jordan'],
  },
  speaker: 'jordan',
  line: 'Actually, I have a completely unrelated question.',
  responses: [
    {
      id: 'hear',
      label: 'Hear the question',
      technique: 'hear',
      effect: {
        minutes: 7,
        progress: 1,
        risks: 0,
      },
      line: 'The question is about the office toaster. Friday remains unaddressed.',
    },
    {
      id: 'timebox',
      label: 'One sentence only',
      technique: 'timebox',
      effect: {
        minutes: 2,
        progress: 0,
        risks: 0,
      },
      line: 'The sentence has three semicolons. We stop there.',
    },
    {
      id: 'email',
      label: 'Take it to email',
      technique: 'email',
      effect: {
        minutes: 0,
        progress: 0,
        risks: 0,
      },
      line: 'The toaster gets its own thread. Nobody subscribes.',
    },
  ],
} as const satisfies MeetingEvent;
