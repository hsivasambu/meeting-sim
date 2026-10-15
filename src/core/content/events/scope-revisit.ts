import type { MeetingEvent } from '../../engine/types';

// Approved docs/content-table-launch.md → scope-revisit.
export const scopeRevisit = {
  id: 'scope-revisit',
  kind: 'tangent',
  rarity: 'common',
  weight: 1,
  negative: false,
  when: {
    present: ['gary'],
  },
  speaker: 'gary',
  line: 'I think we should revisit the entire project scope before we decide.',
  responses: [
    {
      id: 'hear',
      label: 'Hear it out',
      technique: 'hear',
      effect: {
        minutes: 9,
        progress: 4,
        risks: 0,
      },
      line: 'Gary shares a 2019 slide deck. One slide was useful.',
    },
    {
      id: 'timebox',
      label: 'Timebox it to 3 min',
      technique: 'timebox',
      effect: {
        minutes: 3,
        progress: 3,
        risks: 0,
      },
      line: 'Scope confirmed in three minutes. Moving on.',
    },
    {
      id: 'park',
      label: 'Parking lot',
      technique: 'park',
      effect: {
        minutes: 1,
        progress: 0,
        risks: 0,
      },
      line: 'Noted on the board. Gary nods slowly.',
    },
  ],
} as const satisfies MeetingEvent;
