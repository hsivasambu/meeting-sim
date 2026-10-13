import type { MeetingEvent } from '../../engine/types';

// Approved docs/content-table-launch.md → p1-follow-up.
export const p1FollowUp = {
  id: 'p1-follow-up',
  kind: 'callback',
  rarity: 'common',
  weight: 1,
  negative: false,
  speaker: 'dev',
  line: 'The parked checkout P1 is back. Customers will not use the parking lot.',
  responses: [
    {
      id: 'hear',
      label: "Finish Dev's triage",
      technique: 'hear',
      requires: {
        present: ['dev'],
      },
      disabledReasonKey: 'dev-absent',
      effect: {
        minutes: 9,
        progress: 20,
        risks: -1,
      },
      line: 'Dev finishes triage. The fix and rollback close the checkout risk.',
    },
    {
      id: 'owner',
      label: 'Own fix verification',
      technique: 'owner',
      requires: {
        present: ['dev'],
      },
      disabledReasonKey: 'dev-absent',
      effect: {
        minutes: 5,
        progress: 16,
        risks: -1,
      },
      line: 'Dev owns verification. Checkout finally leaves the parking lot.',
    },
    {
      id: 'timebox',
      label: 'Keep the guardrail',
      technique: 'timebox',
      effect: {
        minutes: 3,
        progress: 10,
        risks: 0,
      },
      line: 'The guardrail stays. So does the unresolved checkout risk.',
    },
  ],
  variants: [
    {
      when: {
        absent: ['dev'],
      },
      speaker: 'priya',
      line: 'The checkout P1 is still open. We released the person with the diagnosis.',
      responses: [
        {
          id: 'hear',
          label: 'Finish the incident plan',
          technique: 'hear',
          effect: {
            minutes: 10,
            progress: 10,
            risks: -1,
          },
          line: 'The written incident plan closes one risk, slowly and without Dev.',
        },
        {
          id: 'timebox',
          label: 'Keep the guardrail',
          technique: 'timebox',
          effect: {
            minutes: 4,
            progress: 6,
            risks: 0,
          },
          line: 'We keep the secondhand guardrail. Checkout still needs verification.',
        },
      ],
    },
  ],
} as const satisfies MeetingEvent;
