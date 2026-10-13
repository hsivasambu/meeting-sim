import type { MeetingEvent } from '../../engine/types';

// Approved docs/content-table-launch.md → vp-joins.
export const vpJoins = {
  id: 'vp-joins',
  kind: 'escalation',
  rarity: 'uncommon',
  weight: 1,
  negative: true,
  when: {
    minMinute: 15,
  },
  speaker: 'vp',
  line: 'Mind if I sit in?',
  responses: [
    {
      id: 'hear',
      label: 'Give the full recap',
      technique: 'hear',
      effect: {
        minutes: 8,
        progress: 8,
        risks: 0,
        joins: ['vp'],
      },
      line: 'The VP joins. We recap the recap so the recap has executive visibility.',
    },
    {
      id: 'timebox',
      label: 'Give a decision brief',
      technique: 'timebox',
      effect: {
        minutes: 3,
        progress: 5,
        risks: 0,
        joins: ['vp'],
      },
      line: 'The VP joins, hears the decision brief and asks for the launch gate.',
    },
    {
      id: 'park',
      label: 'Save questions for later',
      technique: 'park',
      effect: {
        minutes: 1,
        progress: 0,
        risks: 0,
        joins: ['vp'],
      },
      line: 'The VP joins. Their questions join the parking lot.',
    },
  ],
} as const satisfies MeetingEvent;
