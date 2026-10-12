import type { MeetingEvent } from '../../engine/types';

// Approved docs/content-table.md → another-meeting.
export const anotherMeeting = {
  id: 'another-meeting',
  kind: 'tangent',
  rarity: 'common',
  weight: 1,
  negative: false,
  when: {
    present: ['gary'],
  },
  speaker: 'gary',
  line: 'I think we need another meeting to discuss this.',
  responses: [
    {
      id: 'hear',
      label: 'Discuss the agenda',
      technique: 'hear',
      effect: {
        minutes: 8,
        progress: 2,
        risks: 0,
      },
      line: 'We have drafted an agenda for discussing this agenda.',
    },
    {
      id: 'timebox',
      label: 'Decide the next step',
      technique: 'timebox',
      effect: {
        minutes: 3,
        progress: 3,
        risks: 0,
      },
      line: 'The next step is to finish the meeting we are already in.',
    },
    {
      id: 'park',
      label: 'Park the invitation',
      technique: 'park',
      effect: {
        minutes: 1,
        progress: 0,
        risks: 0,
      },
      line: "Gary's proposed meeting becomes a sticky note instead.",
    },
  ],
} as const satisfies MeetingEvent;
