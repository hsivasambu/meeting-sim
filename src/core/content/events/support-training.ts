import type { MeetingEvent } from '../../engine/types';

// Approved docs/content-table-launch.md → support-training.
export const supportTraining = {
  id: 'support-training',
  kind: 'substantive',
  rarity: 'common',
  weight: 1,
  negative: false,
  speaker: 'sam',
  line: "Support hasn't seen the release notes. We'd be taking calls blind on Friday.",
  responses: [
    {
      id: 'hear',
      label: 'Hear it out',
      technique: 'hear',
      requires: {
        present: ['sam'],
      },
      disabledReasonKey: 'sam-absent',
      effect: {
        minutes: 7,
        progress: 18,
        risks: 0,
      },
      line: 'Plan agreed: release notes out Wednesday.',
    },
    {
      id: 'owner',
      label: 'Name an owner',
      technique: 'owner',
      requires: {
        present: ['sam'],
      },
      disabledReasonKey: 'sam-absent',
      effect: {
        minutes: 3,
        progress: 14,
        risks: 0,
      },
      line: 'Sam owns it. Done.',
    },
    {
      id: 'park',
      label: 'Parking lot',
      technique: 'park',
      effect: {
        minutes: 1,
        progress: 0,
        risks: 1,
        callback: {
          eventId: 'support-follow-up',
          afterTurns: 2,
        },
      },
      line: 'Another sticky note. Sam looks worried.',
    },
  ],
  variants: [
    {
      when: {
        absent: ['sam'],
      },
      speaker: 'priya',
      line: 'Has anyone told Support? We need a release-notes plan.',
      responses: [
        {
          id: 'timebox',
          label: 'Timebox a plan',
          technique: 'timebox',
          effect: {
            minutes: 5,
            progress: 8,
            risks: 0,
          },
          line: 'A partial plan. Someone still needs to tell Support.',
        },
        {
          id: 'park',
          label: 'Parking lot',
          technique: 'park',
          effect: {
            minutes: 1,
            progress: 0,
            risks: 1,
            callback: {
              eventId: 'support-follow-up',
              afterTurns: 2,
            },
          },
          line: 'Another sticky note.',
        },
      ],
    },
  ],
} as const satisfies MeetingEvent;
