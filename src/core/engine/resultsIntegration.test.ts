import { expect, it } from 'vitest';
import { initialState, callIt, score, earnedTitles } from './index';
import { lunchChoice, lunchState } from './fixtures/lunch';
import { resolveWithRules } from './resolve';
import {
  pending,
  fixtureUtilityRules,
  deepFreeze,
} from './fixtures/transitions';
import { EngineError } from './errors';
import type { MeetingState } from './types';

function decision(
  state: MeetingState,
  chosen: number,
  best: number,
  worst = 0,
): MeetingState {
  return resolveWithRules(
    deepFreeze(
      pending(
        [
          lunchChoice('worst', { minutes: 1, progress: worst }),
          lunchChoice('chosen', { minutes: 1, progress: chosen }),
          lunchChoice('best', { minutes: 1, progress: best }),
        ],
        state,
      ),
    ),
    'chosen',
    fixtureUtilityRules,
  );
}

it('scores resolve-produced thirds and fifteenths at the exact Played It Right boundary', () => {
  let state = lunchState({ seed: 'exact-result-average' });
  for (const [chosen, best] of [
    [10, 15],
    [3, 3],
    [3, 3],
    [11, 15],
  ] as const)
    state = decision(state, chosen, best);
  // An unscored tie must not change the denominator of the average.
  state = decision(state, 0, 0);
  const ended = deepFreeze(callIt(state));
  expect(ended.ending).toBe('called-early');
  expect(ended.decisions.map((d) => d.quality)).toEqual([
    2 / 3,
    1,
    1,
    11 / 15,
    null,
  ]);
  const first = ended.decisions[0]?.qualityFraction;
  if (first === undefined || first === null)
    throw new Error('Missing exact quality');
  expect(BigInt(first.numerator) * 3n).toBe(BigInt(first.denominator) * 2n);
  expect(ended.decisions[4]?.qualityFraction).toBeNull();
  expect(score(ended).decisions).toBe(255);
  expect(earnedTitles(ended, score(ended))).toContain('played-it-right');
  const restored: MeetingState = JSON.parse(JSON.stringify(ended));
  expect(score(restored)).toEqual(score(ended));
  expect(earnedTitles(restored, score(restored))).toEqual(
    earnedTitles(ended, score(ended)),
  );
  // Display approximations are never the authoritative scoring input.
  const changedDisplay = {
    ...ended,
    decisions: ended.decisions.map((d) => ({ ...d, quality: 0 })),
  };
  expect(score(changedDisplay)).toEqual(score(ended));
  expect(earnedTitles(changedDisplay, score(changedDisplay))).toContain(
    'played-it-right',
  );
});

it('does not grant the title below the exact boundary', () => {
  let state = lunchState({ seed: 'below-result-average' });
  for (const [chosen, best] of [
    [10, 15],
    [3, 3],
    [3, 3],
    [10, 15],
  ] as const)
    state = decision(state, chosen, best);
  const ended = callIt(state);
  expect(score(ended).decisions).toBe(250);
  expect(earnedTitles(ended, score(ended))).not.toContain('played-it-right');
});

it('scores an exact zero quality produced by resolve without dropping it from the average', () => {
  let state = decision(lunchState({ seed: 'zero-quality' }), 0, 10);
  state = decision(state, 10, 10);
  expect(score(callIt(state)).decisions).toBe(150);
});

it.each(['initial', 'resolved', 'missing-ending'] as const)(
  'rejects %s state from both result APIs',
  (kind) => {
    const running = decision(
      lunchState({ seed: 'unfinished-results' }),
      10,
      10,
    );
    const state =
      kind === 'initial'
        ? initialState('unfinished')
        : kind === 'resolved'
          ? running
          : { ...running, phase: 'ended' as const };
    for (const action of [
      () => score(state),
      () =>
        earnedTitles(state, {
          outcome: 0,
          efficiency: 0,
          decisions: 300,
          total: 300,
        }),
    ]) {
      try {
        action();
        throw new Error('Result API accepted unfinished meeting');
      } catch (error) {
        expect(error).toBeInstanceOf(EngineError);
        if (!(error instanceof EngineError)) throw error;
        expect(error.code).toBe('not-ended');
      }
    }
  },
);

it('rounds an exact half from resolve-produced thirds and hundredths up', () => {
  let state = decision(lunchState({ seed: 'exact-decision-half' }), 1, 3);
  // 300 × (1/3 + 7/20) / 2 = 102.5 exactly.
  state = decision(state, 7, 20);
  const ended = callIt(state);
  expect(ended.decisions.map((d) => d.quality)).toEqual([1 / 3, 7 / 20]);
  expect(score(ended).decisions).toBe(103);
});
