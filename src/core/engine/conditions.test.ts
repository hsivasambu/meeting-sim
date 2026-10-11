import { expect, it } from 'vitest';
import fc from 'fast-check';
import { matchesCondition } from './conditions';
import { fixturePack, fixtureState } from './fixtures/packs';
import type { Condition, MeetingState } from './types';

const state: MeetingState = Object.freeze({
  ...fixtureState,
  minute: 12,
  risks: 2,
  present: Object.freeze(['priya', 'sam'] as const),
  log: Object.freeze([]),
});
it('accepts omitted, empty and exactly inclusive conjunctive conditions', () => {
  expect(matchesCondition(state)).toBe(true);
  expect(matchesCondition(state, {})).toBe(true);
  expect(
    matchesCondition(state, {
      minMinute: 12,
      maxMinute: 12,
      minRisks: 2,
      maxRisks: 2,
      present: ['priya', 'sam'],
      absent: ['gary', 'dev'],
    }),
  ).toBe(true);
  expect(matchesCondition(state, { present: [], absent: [] })).toBe(true);
});
it.each([
  { minMinute: 13 },
  { maxMinute: 11 },
  { minRisks: 3 },
  { maxRisks: 1 },
  { present: ['sam', 'gary'] },
  { absent: ['gary', 'sam'] },
  { minMinute: 13, maxMinute: 11 },
  { present: ['sam'], absent: ['sam'] },
] satisfies readonly Condition[])(
  'rejects a failed conjunct %j',
  (condition) => {
    expect(matchesCondition(state, condition)).toBe(false);
  },
);
it('treats zero bounds as present, without deriving conditions from log or decisions', () => {
  expect(matchesCondition(fixtureState, { maxMinute: 0, maxRisks: 0 })).toBe(
    true,
  );
  expect(matchesCondition(state, { maxMinute: 0 })).toBe(false);
  expect(matchesCondition({ ...fixtureState, risks: 1 }, { maxRisks: 0 })).toBe(
    false,
  );
  const narrated: MeetingState = {
    ...state,
    log: [{ type: 'release', who: 'sam', turn: 0, minute: 0 }],
    decisions: [{ turn: 0, eventId: 'fake', responseId: 'fake', quality: 0 }],
  };
  expect(matchesCondition(narrated, { present: ['sam'] })).toBe(true);
});
it('rechecks required expert presence after release while fixture presentation stays unchanged', () => {
  const base = fixturePack.events[0];
  const response = base.responses[0];
  expect(matchesCondition(state, response.requires)).toBe(true);
  expect(
    matchesCondition({ ...state, present: ['priya'] }, response.requires),
  ).toBe(false);
  expect(
    matchesCondition({ ...state, present: ['priya'] }, base.variants[0].when),
  ).toBe(true);
  expect(base.speaker).toBe('sam');
});
it('agrees with inclusive intervals for arbitrary states and bounds', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 100 }),
      fc.integer({ min: 0, max: 5 }),
      fc.integer({ min: 0, max: 100 }),
      fc.integer({ min: 0, max: 100 }),
      fc.integer({ min: 0, max: 5 }),
      fc.integer({ min: 0, max: 5 }),
      (minute, risks, minMinute, maxMinute, minRisks, maxRisks) => {
        expect(
          matchesCondition(
            { ...state, minute, risks },
            { minMinute, maxMinute, minRisks, maxRisks },
          ),
        ).toBe(
          minute >= minMinute &&
            minute <= maxMinute &&
            risks >= minRisks &&
            risks <= maxRisks,
        );
      },
    ),
    { seed: 31005, numRuns: 200 },
  );
});
