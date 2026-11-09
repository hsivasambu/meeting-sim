import { expect, it } from 'vitest';
import fc from 'fast-check';
import { matchesCondition } from './conditions';
import { lunchState } from './fixtures/lunch';

it('combines inclusive minute and attendance conditions without reading narrative', () => {
  const state = lunchState({ minute: 15 });
  expect(matchesCondition(state)).toBe(true);
  expect(matchesCondition(state, {})).toBe(true);
  const condition = {
    minMinute: 15,
    maxMinute: 15,
    present: ['sam', 'priya'],
    absent: ['vp', 'legal'],
  } as const;
  expect(matchesCondition(state, condition)).toBe(true);
  expect(matchesCondition({ ...state, minute: 14 }, condition)).toBe(false);
  expect(matchesCondition({ ...state, minute: 16 }, condition)).toBe(false);
  expect(
    matchesCondition(
      { ...state, present: [...state.present, 'vp'] },
      condition,
    ),
  ).toBe(false);
  expect(matchesCondition(state, { present: ['vp'] })).toBe(false);
  expect(matchesCondition(state, { maxMinute: 0 })).toBe(false);
});

it('agrees with inclusive intervals at arbitrary minutes and bounds', () => {
  fc.assert(
    fc.property(
      fc.nat(60),
      fc.nat(60),
      fc.nat(60),
      (minute, minMinute, maxMinute) => {
        expect(
          matchesCondition(lunchState({ minute }), { minMinute, maxMinute }),
        ).toBe(minMinute <= minute && minute <= maxMinute);
      },
    ),
  );
});
