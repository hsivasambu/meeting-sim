import type * as Constants from './constants';
import { expect, it, vi } from 'vitest';
import fc from 'fast-check';
import { utilityFraction, fractionNumber } from './utilityFraction';
import { initialState, previewResponse, resolve } from './index';
import { resolveWithRules } from './resolve';
import { deepFreeze, pending, fixtureResponse } from './fixtures/transitions';
import type { AttendeeId, Response } from './types';
// Reproduce the public API bug with fixed fixture coefficients, independent of live tuning.
vi.mock('./constants', async (importOriginal) => ({
  ...(await importOriginal<typeof Constants>()),
  UTILITY_RULES: { costWeight: 1.2, riskWeight: 12, costUnit: 6 },
}));
it.each(['short', 'long'])(
  'leaves the reported decimal tie unscored when choosing %s',
  (id) => {
    const short: Response = {
      ...fixtureResponse,
      id: 'short',
      effect: { minutes: 1, progress: 0 },
    };
    const long: Response = {
      ...fixtureResponse,
      id: 'long',
      effect: { minutes: 6, progress: 6 },
    };
    const state = deepFreeze(
      pending([short, long], initialState('decimal-case')),
    );
    const a = previewResponse(state, short),
      b = previewResponse(state, long);
    if (!a.enabled || !b.enabled)
      throw new Error('Fixture unexpectedly disabled');
    expect(a.utility).toBe(-1.2);
    expect(b.utility).toBe(a.utility);
    const next = resolve(state, id);
    expect(next.decisions[0]?.quality).toBeNull();
    expect(() => JSON.stringify(next)).not.toThrow();
    expect(() => JSON.stringify(a)).not.toThrow();
  },
);
it('keeps generated multi-response decimal ties unscored across all legal headcounts', () => {
  const people: readonly AttendeeId[] = [
    'priya',
    'dev',
    'sam',
    'morgan',
    'gary',
    'jordan',
    'legal',
    'vp',
  ];
  fc.assert(
    fc.property(
      fc.integer({ min: 2, max: 8 }),
      fc.integer({ min: 1, max: 5 }),
      (headcount, minutes) => {
        const short: Response = {
          ...fixtureResponse,
          id: 'short',
          effect: { minutes, progress: 0 },
        };
        const long: Response = {
          ...fixtureResponse,
          id: 'long',
          effect: { minutes: minutes + 5, progress: headcount },
        };
        const state = deepFreeze(
          pending([short, long], { present: people.slice(0, headcount) }),
        );
        for (const response of [short, long])
          expect(resolve(state, response.id).decisions[0]?.quality).toBeNull();
      },
    ),
    { seed: 44041, numRuns: 100 },
  );
});
it('does not erase genuinely different utilities even below a broad epsilon', () => {
  const a = { ...fixtureResponse, id: 'a', effect: { minutes: 1 } },
    b = { ...fixtureResponse, id: 'b', effect: { minutes: 2 } };
  const state = pending([a, b]);
  const rules = { costWeight: 1e-12, riskWeight: 0, costUnit: 6 };
  expect(resolveWithRules(state, 'a', rules).decisions[0]?.quality).toBe(1);
  expect(resolveWithRules(state, 'b', rules).decisions[0]?.quality).toBe(0);
});
it('handles decimal, exponent, negative and zero representations', () => {
  expect(
    utilityFraction(0, 6, 0, { costWeight: 1.2, riskWeight: 12, costUnit: 6 }),
  ).toEqual(
    utilityFraction(6, 36, 0, { costWeight: 1.2, riskWeight: 12, costUnit: 6 }),
  );
  const tiny = utilityFraction(0, 1, 0, {
    costWeight: 1e-7,
    riskWeight: 0,
    costUnit: 1,
  });
  expect(fractionNumber(tiny.numerator, tiny.denominator)).toBe(-1e-7);
  const large = utilityFraction(0, 1, 0, {
    costWeight: 1e21,
    riskWeight: 0,
    costUnit: 1,
  });
  expect(fractionNumber(large.numerator, large.denominator)).toBe(-1e21);
  expect(fractionNumber(0n, 1n)).toBe(0);
  expect(fractionNumber(1n, 2n)).toBe(0.5);
});
it.each([NaN, Infinity, -Infinity])(
  'rejects non-finite utility coefficients %s',
  (value) => {
    expect(() =>
      utilityFraction(1, 6, 1, {
        costWeight: value,
        riskWeight: 12,
        costUnit: 6,
      }),
    ).toThrow('invalid-rules');
  },
);
it('rejects fractional state deltas and nonpositive units', () => {
  for (const values of [
    [0.5, 6, 0],
    [1, 0.5, 0],
    [1, 6, 0.5],
  ] as const)
    expect(() =>
      utilityFraction(values[0], values[1], values[2], {
        costWeight: 1.2,
        riskWeight: 12,
        costUnit: 6,
      }),
    ).toThrow('invalid-rules');
  expect(() =>
    utilityFraction(1, 6, 0, { costWeight: 1.2, riskWeight: 12, costUnit: 0 }),
  ).toThrow('invalid-rules');
});
