// Approved docs/content-table.md — lunch-l02b-reviewed-2.
import type { EventRules } from '../engine/types';
export const engineRules = {
  nominationEventId: 'nominate-cuisine',
  arrivalPermissions: [
    {
      eventId: 'menu-needs',
      responseId: 'invite',
      attendeeId: 'legal',
    },
    {
      eventId: 'quick-agreement',
      responseId: 'invite',
      attendeeId: 'vp',
    },
    {
      eventId: 'alex-arrives',
      responseId: 'hear',
      attendeeId: 'legal',
    },
    {
      eventId: 'alex-arrives',
      responseId: 'timebox',
      attendeeId: 'legal',
    },
    {
      eventId: 'pat-arrives',
      responseId: 'hear',
      attendeeId: 'vp',
    },
    {
      eventId: 'pat-arrives',
      responseId: 'timebox',
      attendeeId: 'vp',
    },
    {
      eventId: 'pat-arrives',
      responseId: 'park',
      attendeeId: 'vp',
    },
  ],
  arrivalAttendees: {
    'alex-arrives': 'legal',
    'pat-arrives': 'vp',
  },
  callbackTargets: {
    'menu-needs': 'menu-return',
    'soup-debate': 'soup-return',
    'spice-question': 'spice-return',
  },
  bookingEventIds: ['room-booked'],
} satisfies EventRules;
