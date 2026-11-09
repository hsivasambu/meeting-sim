import { describe, expect, it } from 'vitest';
import { earnedTitles, score, initialState } from './index';
import { scoreState, qualityRecords } from './fixtures/scores';
import { deepFreeze } from './fixtures/transitions';
import type { MeetingState, TitleId } from './types';

interface TitleBoundary {
  readonly title: TitleId;
  readonly earns: Partial<MeetingState>;
  readonly misses: Partial<MeetingState>;
}
const boundaries = [
  {
    title: 'inbox-zero',
    earns: { personMinutes: 90, decisions: qualityRecords([0.832]) },
    misses: { personMinutes: 90, decisions: qualityRecords([0.831]) },
  },
  {
    title: 'efficient-facilitator',
    earns: { personMinutes: 90, decisions: qualityRecords([0.5]) },
    misses: { personMinutes: 90, decisions: qualityRecords([0.498]) },
  },
  { title: 'lunch-agreed', earns: {}, misses: { ending: 'time-expired' } },
  {
    title: 'death-by-diligence',
    earns: { personMinutes: 270 },
    misses: { personMinutes: 269 },
  },
  {
    title: 'table-for-six',
    earns: {},
    misses: { present: [...initialState('fixture').present, 'vp'] },
  },
  {
    title: 'reply-all-royalty',
    earns: { peakHeadcount: 8 },
    misses: { peakHeadcount: 7 },
  },
  {
    title: 'parking-lot-attendant',
    earns: { parkedCount: 4 },
    misses: { parkedCount: 3 },
  },
  {
    title: 'second-helping',
    earns: { resolvedCallbackCount: 1 },
    misses: { resolvedCallbackCount: 0 },
  },
  {
    title: 'played-it-right',
    earns: { ending: 'time-expired', decisions: qualityRecords([0.85]) },
    misses: { ending: 'time-expired', decisions: qualityRecords([0.8499]) },
  },
  {
    title: 'take-this-offline',
    earns: { ending: 'called-early' },
    misses: { ending: 'time-expired' },
  },
  {
    title: 'calendar-criminal',
    earns: { ending: 'time-expired' },
    misses: { ending: 'called-early' },
  },
  {
    title: 'could-have-been-an-email',
    earns: { ending: 'cancelled' },
    misses: { ending: 'called-early' },
  },
] as const satisfies readonly TitleBoundary[];

describe('Design Doc v2 title predicates', () => {
  it.each(boundaries)(
    '$title unlocks at its boundary and rejects the adjacent case',
    ({ title, earns, misses }) => {
      for (const [overrides, expected] of [
        [earns, true],
        [misses, false],
      ] as const) {
        const state = deepFreeze(scoreState(overrides));
        expect(earnedTitles(state, score(state)).includes(title)).toBe(
          expected,
        );
      }
    },
  );

  it.each([
    'efficient-facilitator',
    'lunch-agreed',
    'death-by-diligence',
    'table-for-six',
    'second-helping',
  ] as const)('%s also requires a decision ending', (title) => {
    const state = scoreState({
      ending: 'called-early',
      progress: 99,
      personMinutes: 270,
      resolvedCallbackCount: 1,
      decisions: qualityRecords([1]),
    });
    expect(
      earnedTitles(state, {
        outcome: 400,
        efficiency: 300,
        decisions: 300,
        total: 1000,
      }),
    ).not.toContain(title);
  });

  it('fairness title needs a scored choice and a failed ending, using unrounded quality', () => {
    for (const decisions of [[], qualityRecords([null])]) {
      const state = scoreState({ ending: 'time-expired', decisions });
      expect(earnedTitles(state, score(state))).not.toContain(
        'played-it-right',
      );
    }
    const won = scoreState({ decisions: qualityRecords([0.9]) });
    expect(earnedTitles(won, score(won))).not.toContain('played-it-right');
    const almost = scoreState({
      ending: 'time-expired',
      decisions: qualityRecords([null, 0.8499]),
    });
    expect(score(almost).decisions).toBe(255);
    expect(earnedTitles(almost, score(almost))).not.toContain(
      'played-it-right',
    );
    const exact = scoreState({
      ending: 'called-early',
      decisions: qualityRecords([null, 0.8, 0.9]),
    });
    expect(earnedTitles(exact, score(exact))).toContain('played-it-right');
  });
});
