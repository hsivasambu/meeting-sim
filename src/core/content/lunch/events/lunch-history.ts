// Approved docs/content-table.md — lunch-l02b-reviewed-2; L05 injection only until L08.
import type { MeetingEvent, OutcomeResponse } from '../../../engine/types';
export const event = {
  id: 'lunch-history',
  kind: 'tangent',
  rarity: 'common',
  weight: 1,
  negative: false,
  speaker: 'gary',
  line: 'The last time we chose {cuisine}, things got complicated. I should explain the full context.',
  responses: [
    {
      id: 'hear',
      label: 'Hear the old story',
      description:
        "Hear the full story. It takes time, and little of the history helps with today's lunch.",
      technique: 'hear',
      outcomes: [
        {
          id: 'history',
          weight: 1,
          effect: {
            minutes: 9,
            progress: 3,
          },
          line: 'The historic problem was a missing receipt. Gary still has the envelope.',
        },
      ],
    },
    {
      id: 'timebox',
      label: 'Ask what matters now',
      description:
        "Limit the story to today's choice. Some context, without the archive.",
      technique: 'timebox',
      outcomes: [
        {
          id: 'relevant',
          weight: 1,
          effect: {
            minutes: 3,
            progress: 4,
          },
          line: 'We extract the relevant detail. It fits in a sentence Gary would have put in an appendix.',
        },
      ],
    },
    {
      id: 'email',
      label: 'Request the old notes',
      description:
        'Ask Gary to email the history. Quick now; the story does not help this choice.',
      technique: 'email',
      outcomes: [
        {
          id: 'requested',
          weight: 1,
          effect: {
            minutes: 1,
            progress: 0,
          },
          line: 'Gary offers to send his notes, provided everyone reads them before commenting.',
        },
      ],
    },
  ],
} satisfies MeetingEvent<OutcomeResponse>;
