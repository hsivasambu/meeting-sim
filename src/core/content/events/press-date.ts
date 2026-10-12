import type { MeetingEvent } from '../../engine/types';

// Approved docs/content-table.md → press-date.
export const pressDate = {
  id: 'press-date',
  kind: 'substantive',
  rarity: 'common',
  weight: 1,
  negative: false,
  speaker: 'morgan',
  line: 'The press release says Thursday.',
  responses: [
    {
      id: 'legal',
      label: 'Have Legal clear it',
      technique: 'hear',
      requires: {
        present: ['legal'],
      },
      disabledReasonKey: 'legal-absent',
      effect: {
        minutes: 6,
        progress: 20,
        risks: -1,
      },
      line: 'Legal clears the release and the date. Friday is now legally Friday.',
    },
    {
      id: 'owner',
      label: 'Own the correction',
      technique: 'owner',
      requires: {
        present: ['morgan'],
      },
      disabledReasonKey: 'morgan-absent',
      effect: {
        minutes: 4,
        progress: 16,
        risks: 0,
      },
      line: 'Morgan owns the correction and confirms the press list will get it.',
    },
    {
      id: 'email',
      label: 'Email a correction',
      technique: 'email',
      effect: {
        minutes: 0,
        progress: 10,
        risks: 1,
      },
      line: 'A correction is sent. Nobody confirms which draft the press will use.',
    },
  ],
  variants: [
    {
      when: {
        absent: ['morgan'],
      },
      speaker: 'priya',
      line: "Morgan's press draft says Thursday. Our launch checklist says Friday.",
      responses: [
        {
          id: 'timebox',
          label: 'Check the draft dates',
          technique: 'timebox',
          effect: {
            minutes: 6,
            progress: 8,
            risks: 0,
          },
          line: 'We mark Friday on the draft. Marketing still needs to confirm the send.',
        },
        {
          id: 'email',
          label: 'Email a correction',
          technique: 'email',
          effect: {
            minutes: 0,
            progress: 6,
            risks: 1,
          },
          line: 'The correction leaves the room. Confirmation does not come back.',
        },
        {
          id: 'park',
          label: 'Park the mismatch',
          technique: 'park',
          effect: {
            minutes: 1,
            progress: 0,
            risks: 1,
          },
          line: 'Two launch dates remain in circulation. What could go wrong?',
        },
      ],
    },
  ],
} as const satisfies MeetingEvent;
