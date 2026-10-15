// Approved docs/content-table.md — lunch-l02b-reviewed-2; L05 injection only until L08.
import type { LunchTitle } from '../../engine/types';
export const titles = [
  {
    slot: 1,
    id: 'inbox-zero',
    name: 'Inbox Zero',
    predicate: 'total score ≥950',
    flavour:
      'A meeting so efficient someone will ask you to organise another one.',
  },
  {
    slot: 2,
    id: 'efficient-facilitator',
    name: 'Efficient Facilitator',
    predicate: 'ending=decision and score ≥850',
    flavour: 'You kept lunch within sight of the people discussing it.',
  },
  {
    slot: 3,
    id: 'lunch-agreed',
    name: 'Lunch Is Settled',
    predicate: 'ending=decision and agreedCuisine recorded',
    flavour: 'Everyone agreed on {agreedCuisine}. You may put the marker down.',
  },
  {
    slot: 4,
    id: 'death-by-diligence',
    name: 'Death by Diligence',
    predicate: 'ending=decision and personMinutes ≥270',
    flavour:
      'The discussion developed traditions. At last, one of them is eating {agreedCuisine}.',
  },
  {
    slot: 5,
    id: 'table-for-six',
    name: 'Table for Six',
    predicate: 'ending=decision and final headcount=6',
    flavour:
      'The original six agreed on {agreedCuisine}. Nobody had to book an extra chair.',
  },
  {
    slot: 6,
    id: 'reply-all-royalty',
    name: 'Reply-All Royalty',
    predicate: 'peakHeadcount=8',
    flavour: 'Eight adults were involved. Lunch acquired an audience.',
  },
  {
    slot: 7,
    id: 'parking-lot-attendant',
    name: 'Parking Lot Attendant',
    predicate: 'parkedCount ≥4',
    flavour:
      'Several topics were postponed. Your notes have a busier afternoon than you do.',
  },
  {
    slot: 8,
    id: 'second-helping',
    name: 'Second Helping',
    predicate: 'ending=decision and resolvedCallbackCount ≥1',
    flavour:
      'A postponed question came back. You dealt with it and still got to {agreedCuisine}.',
  },
  {
    slot: 9,
    id: 'played-it-right',
    name: 'Played It Right, Lost Anyway',
    predicate: 'scored decision count ≥1 and avg q ≥0.85 and ending≠decision',
    flavour:
      'Sensible choices, no agreement. The room declines to reward your judgement.',
  },
  {
    slot: 10,
    id: 'take-this-offline',
    name: "Let's Take This Offline",
    predicate: 'ending=called-early',
    flavour:
      'You ended the discussion. The invitation for the next one is already being drafted.',
  },
  {
    slot: 11,
    id: 'calendar-criminal',
    name: 'Calendar Criminal',
    predicate: 'ending=time-expired',
    flavour:
      'The booking ended before the discussion did. The next team brought witnesses.',
  },
  {
    slot: 12,
    id: 'could-have-been-an-email',
    name: "This Could've Been an Email",
    predicate: 'ending=cancelled',
    flavour:
      'No discussion was resolved. An email can still have a subject line.',
  },
] satisfies readonly LunchTitle[];
