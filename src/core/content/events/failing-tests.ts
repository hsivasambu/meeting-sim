import type { MeetingEvent } from '../../engine/types';

// Approved docs/content-table-launch.md → failing-tests.
export const failingTests = {
  id: 'failing-tests',
  kind: 'substantive',
  rarity: 'common',
  weight: 1,
  negative: false,
  speaker: 'dev',
  line: 'Two regression tests are still failing.',
  responses: [
    {
      id: 'hear',
      label: 'Inspect both failures',
      technique: 'hear',
      requires: {
        present: ['dev'],
      },
      disabledReasonKey: 'dev-absent',
      effect: {
        minutes: 8,
        progress: 22,
        risks: -1,
      },
      line: 'Dev finds the regression and agrees the fix and verification steps.',
    },
    {
      id: 'owner',
      label: 'Own the fix and rerun',
      technique: 'owner',
      requires: {
        present: ['dev'],
      },
      disabledReasonKey: 'dev-absent',
      effect: {
        minutes: 5,
        progress: 18,
        risks: 0,
      },
      line: 'Dev owns the fix and rerun before Friday. The checklist gets a name.',
    },
    {
      id: 'timebox',
      label: 'Accept a workaround',
      technique: 'timebox',
      effect: {
        minutes: 3,
        progress: 18,
        risks: 1,
      },
      line: 'The workaround unblocks launch. The regression is still real.',
    },
  ],
  variants: [
    {
      when: {
        absent: ['dev'],
      },
      speaker: 'priya',
      line: 'Dev left two red regression tests on the launch checklist.',
      responses: [
        {
          id: 'hear',
          label: 'Audit the test notes',
          technique: 'hear',
          effect: {
            minutes: 8,
            progress: 10,
            risks: -1,
          },
          line: 'We close one documented risk. The fix still needs engineering follow-up.',
        },
        {
          id: 'timebox',
          label: 'Accept a workaround',
          technique: 'timebox',
          effect: {
            minutes: 3,
            progress: 12,
            risks: 1,
          },
          line: 'Without Dev, the workaround rests on assumptions nobody can verify.',
        },
        {
          id: 'park',
          label: 'Park the failures',
          technique: 'park',
          effect: {
            minutes: 1,
            progress: 0,
            risks: 1,
          },
          line: 'Two red tests become one unresolved launch risk.',
        },
      ],
    },
  ],
} as const satisfies MeetingEvent;
