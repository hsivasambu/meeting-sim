import type { EventRules } from '../engine/types';
// Approved docs/content-table-launch.md → Families and draw eligibility.
export const engineRules = {
  arrivalAttendees: { legal: 'legal', 'vp-joins': 'vp' },
  callbackTargets: {
    'circle-back': 'circle-back-return',
    'support-training': 'support-follow-up',
    'p1-bug': 'p1-follow-up',
  },
  bookingEventIds: ['room-booked'],
} as const satisfies EventRules;
