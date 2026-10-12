import type { EventRules } from '../engine/types';
// Approved relationship metadata only; live dialogue/events remain task 07 work.
export const engineRules = {
  arrivalAttendees: { legal: 'legal', 'vp-joins': 'vp' },
  callbackTargets: {
    'circle-back': 'circle-back-return',
    'support-training': 'support-follow-up',
    'p1-bug': 'p1-follow-up',
  },
  bookingEventIds: ['room-booked'],
} as const satisfies EventRules;
