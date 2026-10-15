import type { MeetingEvent } from '../../engine/types';

// Approved docs/content-table-launch.md → p1-bug.
export const p1Bug = {
  id: 'p1-bug',
  kind: 'substantive',
  rarity: 'uncommon',
  weight: 1,
  negative: true,
  speaker: 'dev',
  line: 'We just found a P1 in checkout.',
  responses: [
    {
      id: 'hear',
      label: 'Triage with Dev',
      technique: 'hear',
      requires: {
        present: ['dev'],
      },
      disabledReasonKey: 'dev-absent',
      effect: {
        minutes: 8,
        progress: 20,
        risks: -1,
      },
      line: 'Dev isolates the checkout failure. Fix, rollback and verification are agreed.',
    },
    {
      id: 'timebox',
      label: 'Launch with a guardrail',
      technique: 'timebox',
      effect: {
        minutes: 3,
        progress: 16,
        risks: 1,
      },
      line: 'A guardrail is agreed quickly. Checkout still has an unresolved failure.',
    },
    {
      id: 'park',
      label: 'Park the P1',
      technique: 'park',
      effect: {
        minutes: 1,
        progress: 0,
        risks: 1,
        callback: {
          eventId: 'p1-follow-up',
          afterTurns: 2,
        },
      },
      line: 'The P1 enters the parking lot. It will not stay politely parked.',
    },
  ],
  variants: [
    {
      when: {
        absent: ['dev'],
      },
      speaker: 'priya',
      line: 'Engineering flagged a P1 in checkout. Dev is no longer here to explain it.',
      responses: [
        {
          id: 'hear',
          label: 'Read the incident notes',
          technique: 'hear',
          effect: {
            minutes: 9,
            progress: 10,
            risks: -1,
          },
          line: "The notes settle one known risk. We still lack Dev's full diagnosis.",
        },
        {
          id: 'timebox',
          label: 'Launch with a guardrail',
          technique: 'timebox',
          effect: {
            minutes: 5,
            progress: 10,
            risks: 1,
          },
          line: 'The guardrail is based on secondhand details. Checkout remains a risk.',
        },
        {
          id: 'park',
          label: 'Park the P1',
          technique: 'park',
          effect: {
            minutes: 1,
            progress: 0,
            risks: 1,
            callback: {
              eventId: 'p1-follow-up',
              afterTurns: 2,
            },
          },
          line: 'The P1 enters the parking lot. It will not stay politely parked.',
        },
      ],
    },
  ],
} as const satisfies MeetingEvent;
