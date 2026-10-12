import { expect, it } from 'vitest';
import { initialState, resolve, callIt, score, earnedTitles } from './index';
import { pending, fixtureResponse, deepFreeze } from './fixtures/transitions';
import { EngineError } from './errors';
import type { MeetingState } from './types';

function decision(
  state: MeetingState,
  chosen: number,
  best: number,
): MeetingState {
  return resolve(
    deepFreeze(
      pending(
        [
          {
            ...fixtureResponse,
            id: 'worst',
            effect: { minutes: 1, progress: 0 },
          },
          {
            ...fixtureResponse,
            id: 'chosen',
            effect: { minutes: 1, progress: chosen },
          },
          {
            ...fixtureResponse,
            id: 'best',
            effect: { minutes: 1, progress: best },
          },
          {
            ...fixtureResponse,
            id: 'disabled',
            requires: { present: ['vp'] },
            disabledReasonKey: 'fixture-needs-vp',
            effect: { minutes: 1, progress: 100 },
          },
        ],
        state,
      ),
    ),
    'chosen',
  );
}

it('scores resolve-produced thirds and fifteenths at the exact Played It Right boundary', () => {
  let state = initialState('exact-result-average');
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
  let state = initialState('below-result-average');
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
  let state = decision(initialState('zero-quality'), 0, 10);
  state = decision(state, 10, 10);
  expect(score(callIt(state)).decisions).toBe(150);
});

it.each(['initial', 'resolved', 'missing-ending'] as const)(
  'rejects %s state from both result APIs',
  (kind) => {
    const running = decision(initialState('unfinished-results'), 10, 10);
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
