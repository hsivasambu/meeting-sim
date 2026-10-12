import type { MeetingEvent } from '../../engine/types';

// Approved docs/content-table.md → where-we-stand.
export const whereWeStand = {
  id: 'where-we-stand',
  kind: 'substantive',
  rarity: 'common',
  weight: 1,
  negative: false,
  speaker: 'priya',
  line: 'Okay. Where do we actually stand?',
  responses: [
    {
      id: 'hear',
      label: 'Check the launch gates',
      technique: 'hear',
      requires: {
        present: ['priya'],
      },
      disabledReasonKey: 'priya-absent',
      effect: {
        minutes: 6,
        progress: 18,
        risks: 0,
      },
      line: 'Priya checks the launch gates. We agree what ready actually means.',
    },
    {
      id: 'owner',
      label: 'Assign the decision',
      technique: 'owner',
      requires: {
        present: ['priya'],
      },
      disabledReasonKey: 'priya-absent',
      effect: {
        minutes: 4,
        progress: 16,
        risks: 0,
      },
      line: 'Priya owns the go/no-go checklist. Nobody owns a new slide deck.',
    },
    {
      id: 'refocus',
      label: 'Return to the decision',
      technique: 'refocus',
      effect: {
        minutes: 2,
        progress: 12,
        risks: 0,
      },
      line: 'Friday. Go or no-go. The room remembers why it is here.',
    },
  ],
  variants: [
    {
      when: {
        minRisks: 1,
      },
      speaker: 'priya',
      line: 'Where do we stand? The parking lot still has launch risks in it.',
      responses: [
        {
          id: 'hear',
          label: 'Check the launch gates',
          technique: 'hear',
          requires: {
            present: ['priya'],
          },
          disabledReasonKey: 'priya-absent',
          effect: {
            minutes: 6,
            progress: 18,
            risks: -1,
          },
          line: 'Priya checks the launch gates and closes one unresolved launch risk.',
        },
        {
          id: 'owner',
          label: 'Assign the decision',
          technique: 'owner',
          requires: {
            present: ['priya'],
          },
          disabledReasonKey: 'priya-absent',
          effect: {
            minutes: 4,
            progress: 16,
            risks: 0,
          },
          line: 'Priya owns the checklist. The parked risks still need answers.',
        },
        {
          id: 'refocus',
          label: 'Return to the decision',
          technique: 'refocus',
          effect: {
            minutes: 2,
            progress: 6,
            risks: 0,
          },
          line: 'The question is clearer. The unanswered risks are still unanswered.',
        },
      ],
    },
  ],
} as const satisfies MeetingEvent;
