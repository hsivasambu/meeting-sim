import {
  INITIAL_ATTENDEES,
  ONE,
  TITLE_SCORE_INBOX,
  TITLE_SCORE_EFFICIENT,
  TITLE_COST_DILIGENCE_PM,
  MAX_HEADCOUNT,
  TITLE_PARKED_MIN,
  TITLE_QUALITY_FAIR,
} from './constants';
import { qualityAtLeast } from './score';
import { assertEnded } from './errors';
import type { MeetingState, ScoreBreakdown, TitleId } from './types';
import { validateMeetingState } from './lunchValidation';

type TitleRule = readonly [
  TitleId,
  (state: MeetingState, breakdown: ScoreBreakdown) => boolean,
];

// The design's display priority also gives callers a stable order for all unlocks.
const titleRules: readonly TitleRule[] = [
  ['could-have-been-an-email', (s) => s.ending === 'cancelled'],
  [
    'played-it-right',
    (s) =>
      s.ending !== 'decision' &&
      s.decisions.some((d) => d.qualityFraction !== null) &&
      qualityAtLeast(s, TITLE_QUALITY_FAIR),
  ],
  ['take-this-offline', (s) => s.ending === 'called-early'],
  ['calendar-criminal', (s) => s.ending === 'time-expired'],
  ['inbox-zero', (_s, breakdown) => breakdown.total >= TITLE_SCORE_INBOX],
  [
    'efficient-facilitator',
    (s, breakdown) =>
      s.ending === 'decision' && breakdown.total >= TITLE_SCORE_EFFICIENT,
  ],
  ['lunch-agreed', (s) => s.ending === 'decision'],
  [
    'death-by-diligence',
    (s) =>
      s.ending === 'decision' && s.personMinutes >= TITLE_COST_DILIGENCE_PM,
  ],
  [
    'table-for-six',
    (s) =>
      s.ending === 'decision' && s.present.length === INITIAL_ATTENDEES.length,
  ],
  ['reply-all-royalty', (s) => s.peakHeadcount >= MAX_HEADCOUNT],
  ['parking-lot-attendant', (s) => s.parkedCount >= TITLE_PARKED_MIN],
  [
    'second-helping',
    (s) => s.ending === 'decision' && s.resolvedCallbackCount >= ONE,
  ],
];

/** Implements Design Doc v2 → Titles: all unlocks, in display priority, from counters. */
export function earnedTitles(
  state: MeetingState,
  breakdown: ScoreBreakdown,
): TitleId[] {
  assertEnded(state);
  validateMeetingState(state);
  return titleRules.flatMap(([id, eligible]) =>
    eligible(state, breakdown) ? [id] : [],
  );
}
