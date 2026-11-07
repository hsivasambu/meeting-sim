// Approved docs/content-table.md — lunch-l02b-reviewed-2; L05 injection only until L08.
import type { MeetingEvent, OutcomeResponse } from '../../../engine/types';
export const event = {
  id: 'room-booked',
  kind: 'noise',
  rarity: 'uncommon',
  weight: 1,
  negative: true,
  speaker: 'room',
  line: 'The next team says this room is theirs from minute 45. Our invitation says 60.',
  responses: [
    {
      id: 'hear',
      label: 'Check the reservation',
      description:
        'Confirm the full booking. Keeps the original hour, at the cost of discussion time.',
      technique: 'hear',
      outcomes: [
        {
          id: 'confirmed',
          weight: 1,
          effect: {
            minutes: 5,
            progress: 0,
            bookingEnd: 60,
          },
          line: 'The original hour is confirmed. The next team looks for another room to discuss rooms.',
        },
      ],
    },
    {
      id: 'timebox',
      label: 'Accept the earlier end',
      description:
        'Accept the shorter booking and keep moving. Quick now, with less time left to agree.',
      technique: 'timebox',
      outcomes: [
        {
          id: 'shortened',
          weight: 1,
          effect: {
            minutes: 1,
            progress: 0,
            bookingEnd: 45,
          },
          line: 'We accept the earlier finish. The next team stays by the door to help us remember.',
        },
      ],
    },
    {
      id: 'vp',
      label: 'Ask Pat to handle it',
      description:
        'Let Pat protect the booking. Quick if Pat is here; the lunch question still waits.',
      technique: 'owner',
      requires: {
        present: ['vp'],
      },
      disabledReasonKey: 'pat-absent',
      outcomes: [
        {
          id: 'protected',
          weight: 1,
          effect: {
            minutes: 1,
            progress: 0,
            bookingEnd: 60,
          },
          line: 'Pat mentions the original booking. The next team decides the hour was always ours.',
        },
      ],
    },
  ],
} satisfies MeetingEvent<OutcomeResponse>;
