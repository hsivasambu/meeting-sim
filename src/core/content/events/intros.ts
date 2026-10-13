import type { MeetingEvent } from '../../engine/types';

// Approved docs/content-table-launch.md → intros.
export const intros = {
  id: 'intros',
  kind: 'tangent',
  rarity: 'common',
  weight: 1,
  negative: false,
  when: {
    present: ['jordan'],
  },
  speaker: 'jordan',
  line: 'Before we start, can everyone introduce themselves?',
  responses: [
    {
      id: 'hear',
      label: 'Full introductions',
      technique: 'hear',
      effect: {
        minutes: 8,
        progress: 2,
        risks: 0,
      },
      line: 'Everyone reads the title already printed on their name card.',
    },
    {
      id: 'timebox',
      label: 'Names and roles only',
      technique: 'timebox',
      effect: {
        minutes: 2,
        progress: 1,
        risks: 0,
      },
      line: 'Six names. Six roles. One decision still waiting.',
    },
    {
      id: 'park',
      label: 'Use the name cards',
      technique: 'park',
      effect: {
        minutes: 1,
        progress: 0,
        risks: 0,
      },
      line: 'Jordan checks the name cards. The information was there all along.',
    },
  ],
} as const satisfies MeetingEvent;
