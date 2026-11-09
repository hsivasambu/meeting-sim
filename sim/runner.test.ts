import { expect, it } from 'vitest';
import fc from 'fast-check';
import { initialState } from '../src/core/engine/index';
import { assertPolicy, assertReplay, assertState } from './invariants';
import { verifiedMeeting } from './runner';
import { median, summarize } from './summary';

it('replays arbitrary seeds with legal terminating live runs under both policies', () => {
  fc.assert(
    fc.property(fc.string(), (seed) => {
      for (const policy of ['greedy', 'random'] as const) {
        const state = verifiedMeeting(seed, policy);
        expect(state.phase).toBe('ended');
        expect(state.present.length).toBeGreaterThanOrEqual(6);
        expect(state.nominatedCuisine).not.toBeNull();
        expect(state.log.filter((entry) => entry.type === 'call-it')).toEqual(
          [],
        );
      }
    }),
    { seed: 80801, numRuns: 100 },
  );
});

it('fails on illegal states, regressing counters, excessive turns and replay mismatch', () => {
  const state = initialState('fixture');
  for (const invalid of [
    { ...state, progress: 101 },
    { ...state, minute: 0.5 },
    { ...state, present: ['dev', 'sam'] as const },
    { ...state, present: ['priya', 'priya'] as const },
    { ...state, turn: 51, nominatedCuisine: 'thai' },
    { ...state, bookingEnd: 61 },
    { ...state, phase: 'ended' as const, ending: 'decision' as const },
  ])
    expect(() => assertState(invalid)).toThrow();
  expect(() => assertState(state, { ...state, minute: 1 })).toThrow();
  expect(() => assertReplay(state, { ...state, seed: 'other' })).toThrow();
});

it('uses all-run medians and reports balance misses without failing invariants', () => {
  expect(median([9, 1, 3])).toBe(3);
  expect(median([9, 1, 3, 5])).toBe(4);
  expect(() => median([])).toThrow();
  const summary = summarize('greedy', [verifiedMeeting('fixture', 'greedy')]);
  expect(summary.runs).toBe(1);
  expect(summary.winBandMet).toBe(false);
  expect(summary.reached100).toBe(summary.wins);
});

it('rejects policy violations in the per-run invariant gate', () => {
  const greedy = verifiedMeeting('policy-contract', 'greedy');
  const random = verifiedMeeting('policy-contract', 'random');
  expect(() =>
    assertPolicy(
      {
        ...greedy,
        decisions: [
          {
            turn: 0,
            eventId: 'fixture',
            responseId: 'fixture',
            quality: 0,
            qualityFraction: { numerator: '0', denominator: '1' },
          },
        ],
      },
      'greedy',
    ),
  ).toThrow('best expected utility');
  expect(() =>
    assertPolicy({ ...random, ending: 'called-early' }, 'random'),
  ).toThrow('called it early');
  expect(() =>
    assertPolicy(
      {
        ...random,
        log: [
          ...random.log,
          { type: 'call-it', turn: random.turn, minute: random.minute },
        ],
      },
      'random',
    ),
  ).toThrow('Call it');
});
