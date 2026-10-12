import { describe, expect, it, vi } from 'vitest';
import fc from 'fast-check';
import type * as ConstantTypes from './constants';

const displayProfile = vi.hoisted(() => ({ rate: 1000 }));
vi.mock('./constants', async (importOriginal) => ({
  ...(await importOriginal<typeof ConstantTypes>()),
  get DISPLAY_HOURLY_RATE() {
    return displayProfile.rate;
  },
}));
import { score, displayCost, formatCost, earnedTitles, callIt } from './index';
import { scoreExamples, scoreState, qualityRecords } from './fixtures/scores';
import {
  deepFreeze,
  pending,
  fixtureResponse,
  fixtureUtilityRules,
} from './fixtures/transitions';
import { resolveWithRules } from './resolve';

describe('Design Doc v2 scoring', () => {
  it.each(scoreExamples)(
    '$name matches all components and display title',
    ({ state, expected, title }) => {
      deepFreeze(state);
      expect(score(state)).toEqual(expected);
      expect(earnedTitles(state, expected)[0]).toBe(title);
    },
  );

  it.each([
    [99, 0, 178],
    [100, 0, 400],
    [100, 1, 340],
    [100, 2, 280],
    [100, 3, 220],
    [100, 4, 200],
    [100, 5, 200],
  ])('P=%i R=%i has outcome %i', (progress, risks, outcome) => {
    expect(score(scoreState({ progress, risks })).outcome).toBe(outcome);
  });

  it.each([
    [0, 300],
    [89, 300],
    [90, 300],
    [91, 299],
    [270, 100],
    [359, 1],
    [360, 0],
    [361, 0],
    [552, 0],
  ])('%i person-minutes has efficiency %i', (personMinutes, efficiency) => {
    expect(score(scoreState({ personMinutes })).efficiency).toBe(efficiency);
  });

  it('scales cheap failures by progress so calling early cannot pay', () => {
    const early = scoreState({
      progress: 5,
      personMinutes: 0,
      ending: 'called-early',
      decisions: [],
    });
    expect(score(early)).toEqual({
      outcome: 9,
      efficiency: 15,
      decisions: 0,
      total: 24,
    });
  });

  it('ignores null qualities, includes zero, and uses stored unrounded average', () => {
    expect(score(scoreState({ decisions: [] })).decisions).toBe(0);
    expect(
      score(scoreState({ decisions: qualityRecords([null, null]) })).decisions,
    ).toBe(0);
    expect(
      score(scoreState({ decisions: qualityRecords([0, null, 1, 0.25]) }))
        .decisions,
    ).toBe(125);
  });

  it('rounds nonnegative halves up per component before summing', () => {
    const state = scoreState({
      progress: 15,
      personMinutes: 189,
      decisions: qualityRecords([0.005]),
    });
    expect(score(state)).toEqual({
      outcome: 27,
      efficiency: 29,
      decisions: 2,
      total: 58,
    });
    expect(27 + 28.5 + 1.5).toBe(57);
  });

  it.each([
    [15, 171, 32],
    [41, 225, 62],
    [57, 105, 162],
  ])(
    'rounds exact efficiency halves up at P=%i, pm=%i',
    (progress, personMinutes, expected) => {
      expect(score(scoreState({ progress, personMinutes })).efficiency).toBe(
        expected,
      );
    },
  );

  it.each([
    [0.145, 44],
    [0.285, 86],
    [0.565, 170],
  ])('rounds exact decision halves up at q=%f', (quality, expected) => {
    expect(
      score(scoreState({ decisions: qualityRecords([quality]) })).decisions,
    ).toBe(expected);
    expect(
      score(scoreState({ decisions: qualityRecords([quality, null, quality]) }))
        .decisions,
    ).toBe(expected);
  });

  it('later attendance, risk and narrative changes cannot rewrite past decision quality', () => {
    const resolved = resolveWithRules(
      pending([
        fixtureResponse,
        { ...fixtureResponse, id: 'worse', effect: { minutes: 5 } },
      ]),
      fixtureResponse.id,
      fixtureUtilityRules,
    );
    const ended = callIt(resolved);
    const original = score(ended).decisions;
    expect(original).toBe(300);
    expect(
      score({ ...ended, present: ['priya', 'sam'], risks: 5, log: [] })
        .decisions,
    ).toBe(original);
  });

  it('does not mutate frozen state and is deterministic with bounded integer scores', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 5 }),
        fc.integer({ min: 0, max: 552 }),
        fc.array(fc.option(fc.integer({ min: 0, max: 1000 }), { nil: null }), {
          maxLength: 50,
        }),
        (progress, risks, personMinutes, qualities) => {
          const state = deepFreeze(
            scoreState({
              progress,
              risks,
              personMinutes,
              ending: progress === 100 ? 'decision' : 'time-expired',
              decisions: qualityRecords(
                qualities.map((q) => (q === null ? null : q / 1000)),
              ),
            }),
          );
          const before = JSON.stringify(state);
          const result = score(state);
          expect(score(state)).toEqual(result);
          expect(JSON.stringify(state)).toBe(before);
          for (const component of Object.values(result)) {
            expect(Number.isInteger(component)).toBe(true);
            expect(component).toBeGreaterThanOrEqual(0);
            expect(component).toBeLessThanOrEqual(1000);
          }
          expect(result.total).toBe(
            result.outcome + result.efficiency + result.decisions,
          );
          expect(
            score(scoreState({ progress: 100, risks })).outcome,
          ).toBeGreaterThan(score(scoreState({ progress: 99, risks })).outcome);
        },
      ),
      { seed: 51005, numRuns: 300 },
    );
  });

  it.each([
    [0, 0, '$0'],
    [1, 1000 / 60, '$17'],
    [3, 50, '$50'],
    [90, 1500, '$1,500'],
    [132, 2200, '$2,200'],
    [360, 6000, '$6,000'],
  ])('formats %i person-minutes for display', (pm, dollars, formatted) => {
    expect(displayCost(pm)).toBe(dollars);
    expect(formatCost(pm)).toBe(formatted);
  });

  it('changing only the display rate leaves every score and title unchanged', () => {
    const baseline = scoreExamples.map(({ state }) => ({
      score: score(state),
      titles: earnedTitles(state, score(state)),
    }));
    displayProfile.rate = 2400;
    try {
      expect(displayCost(132)).toBe(5280);
      expect(formatCost(132)).toBe('$5,280');
      expect(
        scoreExamples.map(({ state }) => ({
          score: score(state),
          titles: earnedTitles(state, score(state)),
        })),
      ).toEqual(baseline);
    } finally {
      displayProfile.rate = 1000;
    }
  });
});
