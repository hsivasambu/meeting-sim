import type { MeetingEvent } from '../../engine/types';

// Approved docs/content-table.md → room-booked.
export const roomBooked = {
  id: 'room-booked',
  kind: 'noise',
  rarity: 'uncommon',
  weight: 1,
  negative: true,
  speaker: 'room',
  line: 'We have this room at :45, right?',
  responses: [
    {
      id: 'hear',
      label: 'Check the reservation',
      technique: 'hear',
      effect: {
        minutes: 5,
        progress: 0,
        risks: 0,
        bookingEnd: 60,
      },
      line: 'The reservation says an hour. The next team finds another room.',
    },
    {
      id: 'timebox',
      label: 'Agree to leave at :45',
      technique: 'timebox',
      effect: {
        minutes: 1,
        progress: 0,
        risks: 0,
        bookingEnd: 45,
      },
      line: 'We agree to leave at :45. The clock has become more persuasive.',
    },
    {
      id: 'vp',
      label: 'Let the VP handle it',
      technique: 'owner',
      requires: {
        present: ['vp'],
      },
      disabledReasonKey: 'vp-absent',
      effect: {
        minutes: 1,
        progress: 0,
        risks: 0,
        bookingEnd: 60,
      },
      line: 'The VP mentions their calendar. The next team finds another room.',
    },
  ],
} as const satisfies MeetingEvent;
