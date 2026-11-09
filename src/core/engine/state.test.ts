import { expect, it } from 'vitest';
import { initialState, callIt } from './state';
import { EngineError } from './errors';
import { deepFreeze, pending, fixtureResponse } from './fixtures/transitions';

it('creates independent serializable snapshots with the locked starting meeting', () => {
  const a = initialState('any seed 📧'),
    b = initialState('any seed 📧');
  expect(a).toEqual(b);
  expect(a).not.toBe(b);
  expect(a.present).not.toBe(b.present);
  expect(a).toMatchObject({
    seed: 'any seed 📧',
    turn: 0,
    minute: 0,
    bookingEnd: 60,
    progress: 0,
    personMinutes: 0,
    present: ['priya', 'dev', 'sam', 'morgan', 'gary', 'jordan'],
    peakHeadcount: 6,
    current: null,
    phase: 'running',
    ending: null,
    nominatedCuisine: null,
    agreedCuisine: null,
    resolvedCallbackCount: 0,
    shownCommentaryIds: [],
    lastCommentaryTurn: null,
  });
  expect(JSON.parse(JSON.stringify(a))).toEqual(a);
});
it('rejects repeated Call it after ending with a typed error', () => {
  const ended = deepFreeze(callIt(initialState('seed')));
  expect(() => callIt(ended)).toThrow(new EngineError('ended'));
});

it('retains the delivered pending event when called, while forbidding further actions', () => {
  const state = deepFreeze(pending([fixtureResponse]));
  const ended = callIt(state);
  expect(ended.current).toBe(state.current);
  expect(ended.phase).toBe('ended');
});
