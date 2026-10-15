import {
  INITIAL_ATTENDEES,
  ONE,
  TITLE_SCORE_INBOX,
  TITLE_SCORE_EFFICIENT,
  TITLE_RISK_SHIP,
  TITLE_COST_DILIGENCE_PM,
  TITLE_HEADCOUNT_SKELETON,
  MAX_HEADCOUNT,
  TITLE_PARKED_MIN,
  TITLE_QUALITY_FAIR,
} from './constants';
import { qualityAtLeast } from './score';
import { assertEnded } from './errors';
import type {
  EngineState,
  MeetingState,
  LunchState,
  LunchTitleId,
  ScoreBreakdown,
  TitleId,
} from './types';
import { validateLunchState } from './lunchValidation';

type TitleRule = readonly [
  TitleId,
  (state: EngineState, breakdown: ScoreBreakdown) => boolean,
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
  [
    'ship-it-and-pray',
    (s) =>
      s.ending === 'decision' && 'risks' in s && s.risks >= TITLE_RISK_SHIP,
  ],
  [
    'death-by-diligence',
    (s) =>
      s.ending === 'decision' && s.personMinutes >= TITLE_COST_DILIGENCE_PM,
  ],
  [
    'skeleton-crew',
    (s) =>
      s.ending === 'decision' && s.present.length <= TITLE_HEADCOUNT_SKELETON,
  ],
  ['reply-all-royalty', (s) => s.peakHeadcount >= MAX_HEADCOUNT],
  ['parking-lot-attendant', (s) => s.parkedCount >= TITLE_PARKED_MIN],
  [
    'gary-free-zone',
    (s) =>
      'releasedAttendeeIds' in s &&
      s.releasedAttendeeIds.includes('gary') &&
      !s.spokenAttendeeIds.includes('gary'),
  ],
];

/** Implements Design Doc v2 → Titles: all unlocks, in display priority, from counters. */
export function earnedTitles(
  state: MeetingState,
  breakdown: ScoreBreakdown,
): TitleId[] {
  assertEnded(state);
  return titleRules.flatMap(([id, eligible]) =>
    eligible(state, breakdown) ? [id] : [],
  );
}

/** ADR 0008: reuse retained predicates and priority; replace only slots 3/5/8. */
export function earnedLunchTitles(
  state: LunchState,
  breakdown: ScoreBreakdown,
): LunchTitleId[] {
  assertEnded(state);
  validateLunchState(state);
  return titleRules.flatMap<LunchTitleId>(([id, eligible]) => {
    if (id === 'ship-it-and-pray')
      return state.ending === 'decision' ? ['lunch-agreed'] : [];
    if (id === 'skeleton-crew')
      return state.ending === 'decision' &&
        state.present.length === INITIAL_ATTENDEES.length
        ? ['table-for-six']
        : [];
    if (id === 'gary-free-zone')
      return state.ending === 'decision' && state.resolvedCallbackCount >= ONE
        ? ['second-helping']
        : [];
    return eligible(state, breakdown) ? [id] : [];
  });
}
