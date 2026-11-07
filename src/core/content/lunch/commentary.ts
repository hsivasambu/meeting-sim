// Approved docs/content-table.md — lunch-l02b-reviewed-2; L05 injection only until L08.
import type { LunchCommentary } from '../../engine/types';
export const commentary = [
  {
    id: 'agreement-commentary',
    priority: 10,
    predicate: 'ending=decision and agreedCuisine non-null',
    line: '{agreedCuisine} is agreed. You may now close the meeting about having lunch.',
  },
  {
    id: 'nearly-there',
    priority: 20,
    predicate: 'phase=running and progress ≥80',
    line: 'A decision is getting close. Resist the urge to schedule its announcement.',
  },
  {
    id: 'full-room',
    priority: 30,
    predicate: 'present.length=8',
    line: 'Every available chair is occupied. Lunch has achieved excellent attendance.',
  },
  {
    id: 'topic-returned',
    priority: 40,
    predicate: 'resolvedCallbackCount ≥1',
    line: 'A postponed topic has returned. Writing it down was never going to settle it.',
  },
  {
    id: 'expensive-discussion',
    priority: 50,
    predicate: 'personMinutes ≥180',
    line: 'Salaries are paying for this discussion. So far, it has produced no food.',
  },
  {
    id: 'postponed-again',
    priority: 60,
    predicate: 'parkedCount ≥2',
    line: 'More than one topic has been postponed. The email is beginning to write itself.',
  },
  {
    id: 'still-considering',
    priority: 70,
    predicate: 'phase=running and progress ≤30 and minute ≥15',
    line: 'Lunch is still under discussion. This is the part the title warned you about.',
  },
] satisfies readonly LunchCommentary[];
