import { describe, expect, it } from 'vitest';
import { earnedTitles, score, initialState, release, callIt } from './index';
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
  { title: 'ship-it-and-pray', earns: { risks: 3 }, misses: { risks: 2 } },
  {
    title: 'death-by-diligence',
    earns: { personMinutes: 270 },
    misses: { personMinutes: 269 },
  },
  {
    title: 'skeleton-crew',
    earns: { present: ['priya', 'sam', 'dev'] },
    misses: { present: ['priya', 'sam', 'dev', 'gary'] },
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
    title: 'gary-free-zone',
    earns: { releasedAttendeeIds: ['gary'] },
    misses: { releasedAttendeeIds: ['gary'], spokenAttendeeIds: ['gary'] },
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
    'ship-it-and-pray',
    'death-by-diligence',
    'skeleton-crew',
  ] as const)('%s also requires a decision ending', (title) => {
    const state = scoreState({
      ending: 'called-early',
      progress: 99,
      risks: 3,
      personMinutes: 270,
      present: ['priya', 'sam'],
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

  it('Gary must have been released, and a delivered line counts even before resolution', () => {
    const absent = scoreState({ present: ['priya', 'sam'] });
    expect(earnedTitles(absent, score(absent))).not.toContain('gary-free-zone');
    const spoke = scoreState({
      releasedAttendeeIds: ['gary'],
      spokenAttendeeIds: ['gary'],
      current: {
        id: 'fixture',
        kind: 'tangent',
        rarity: 'common',
        negative: false,
        speaker: 'gary',
        line: 'Fixture.',
        responses: [],
      },
    });
    expect(earnedTitles(spoke, score(spoke))).not.toContain('gary-free-zone');
    const cancelled = callIt(
      release(initialState('fixture-title-release'), 'gary'),
    );
    expect(earnedTitles(cancelled, score(cancelled))).toEqual([
      'could-have-been-an-email',
      'gary-free-zone',
    ]);
  });

  it('returns all earned unlocks once in display priority without reading narrative logs', () => {
    const allSuccess = scoreState({
      personMinutes: 270,
      risks: 3,
      present: ['priya', 'sam'],
      peakHeadcount: 8,
      parkedCount: 4,
      releasedAttendeeIds: ['gary'],
    });
    const supplied = {
      outcome: 400,
      efficiency: 300,
      decisions: 300,
      total: 1000,
    };
    expect(earnedTitles(allSuccess, supplied)).toEqual([
      'inbox-zero',
      'efficient-facilitator',
      'ship-it-and-pray',
      'death-by-diligence',
      'skeleton-crew',
      'reply-all-royalty',
      'parking-lot-attendant',
      'gary-free-zone',
    ]);
    for (const ending of [
      'called-early',
      'time-expired',
      'cancelled',
    ] as const) {
      const failed = deepFreeze({
        ...allSuccess,
        ending,
        progress: 84,
        decisions: qualityRecords([0.9]),
      });
      const before = JSON.stringify(failed);
      const titles = earnedTitles(failed, score(failed));
      expect(titles.slice(0, 2)).toEqual(
        ending === 'cancelled'
          ? ['could-have-been-an-email', 'played-it-right']
          : [
              'played-it-right',
              ending === 'called-early'
                ? 'take-this-offline'
                : 'calendar-criminal',
            ],
      );
      expect(new Set(titles).size).toBe(titles.length);
      expect(JSON.stringify(failed)).toBe(before);
    }
    const falseNarrative = scoreState({
      log: [
        { type: 'release', who: 'gary', turn: 0, minute: 0 },
        { type: 'join', who: 'vp', turn: 0, minute: 0 },
      ],
    });
    expect(earnedTitles(falseNarrative, score(falseNarrative))).toEqual([]);
  });

  it('returns no collectible for a result below all predicates', () => {
    const state = scoreState();
    expect(earnedTitles(state, score(state))).toEqual([]);
  });
});
