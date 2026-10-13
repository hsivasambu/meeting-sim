import type { MeetingEvent } from '../../engine/types';

// Approved docs/content-table-launch.md → support-follow-up.
export const supportFollowUp = {
  id: 'support-follow-up',
  kind: 'callback',
  rarity: 'common',
  weight: 1,
  negative: false,
  speaker: 'sam',
  line: 'That parked release-notes plan? Support still needs it before Friday.',
  responses: [
    {
      id: 'owner',
      label: 'Give Sam the follow-up',
      technique: 'owner',
      requires: {
        present: ['sam'],
      },
      disabledReasonKey: 'sam-absent',
      effect: {
        minutes: 4,
        progress: 14,
        risks: -1,
      },
      line: 'Sam owns the briefing and closes the release-notes risk.',
    },
    {
      id: 'hear',
      label: 'Review the briefing',
      technique: 'hear',
      requires: {
        present: ['sam'],
      },
      disabledReasonKey: 'sam-absent',
      effect: {
        minutes: 8,
        progress: 18,
        risks: -1,
      },
      line: 'Sam walks us through the briefing. Support will not learn from social media.',
    },
    {
      id: 'timebox',
      label: 'Draft a minimal briefing',
      technique: 'timebox',
      effect: {
        minutes: 5,
        progress: 8,
        risks: 0,
      },
      line: 'A draft exists. Getting it to Support is still an open risk.',
    },
  ],
  variants: [
    {
      when: {
        absent: ['sam'],
      },
      speaker: 'priya',
      line: "Support's parked release-notes plan is back. Sam isn't here to own it.",
      responses: [
        {
          id: 'hear',
          label: 'Finish the written plan',
          technique: 'hear',
          effect: {
            minutes: 9,
            progress: 10,
            risks: -1,
          },
          line: "We finish the written plan and close one risk without Sam's shortcut.",
        },
        {
          id: 'timebox',
          label: 'Draft a minimal briefing',
          technique: 'timebox',
          effect: {
            minutes: 5,
            progress: 8,
            risks: 0,
          },
          line: 'A draft exists. Getting it to Support is still an open risk.',
        },
      ],
    },
  ],
} as const satisfies MeetingEvent;
