import { expect, it } from 'vitest';
import { initialState, release, callIt } from './state';
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
    risks: 0,
    personMinutes: 0,
    present: ['priya', 'dev', 'sam', 'morgan', 'gary', 'jordan'],
    releasedAttendeeIds: [],
    peakHeadcount: 6,
    current: null,
    phase: 'running',
    ending: null,
  });
  expect(JSON.parse(JSON.stringify(a))).toEqual(a);
});
it.each(['priya', 'legal'] as const)(
  'refuses owner or absent %s with a fresh equivalent snapshot',
  (who) => {
    const state = deepFreeze(initialState('seed'));
    const next = release(state, who);
    expect(next).toEqual(state);
    expect(next).not.toBe(state);
  },
);
it('refuses every release at the two-person minimum', () => {
  const state = deepFreeze({
    ...initialState('seed'),
    present: ['priya', 'sam'] as const,
  });
  expect(release(state, 'sam')).toEqual(state);
});
it('records a release without time/cost, keeps pending presentation and authoritative counters', () => {
  const state = deepFreeze(
    pending([fixtureResponse], {
      minute: 9,
      turn: 2,
      spokenAttendeeIds: ['sam'],
      peakHeadcount: 8,
    }),
  );
  const before = JSON.stringify(state);
  const next = release(state, 'sam');
  expect(next.present).not.toContain('sam');
  expect(next.releasedAttendeeIds).toEqual(['sam']);
  expect(next.current).toEqual(state.current);
  expect(next).toMatchObject({
    minute: 9,
    turn: 2,
    personMinutes: 0,
    peakHeadcount: 8,
    spokenAttendeeIds: ['sam'],
  });
  expect(next.log.at(-1)).toEqual({
    type: 'release',
    who: 'sam',
    turn: 2,
    minute: 9,
  });
  expect(JSON.stringify(state)).toBe(before);
  expect(release(next, 'sam')).toEqual(next);
});
it.each([
  [0, 'cancelled'],
  [1, 'called-early'],
])(
  'calls it at resolved turn %s using counters rather than logs',
  (turn, ending) => {
    const state = deepFreeze({
      ...initialState('seed'),
      turn: Number(turn),
      log: [
        {
          type: 'resolve' as const,
          turn: 0,
          minute: 5,
          eventId: 'fake',
          responseId: 'fake',
          technique: 'ack' as const,
          line: 'Fixture fake.',
        },
      ],
    });
    const next = callIt(state);
    expect(next.ending).toBe(ending);
    expect(next.phase).toBe('ended');
    expect(next.log.at(-1)?.type).toBe('call-it');
    expect(next.minute).toBe(state.minute);
  },
);
it('rejects actions after ending with typed errors', () => {
  const ended = deepFreeze(callIt(initialState('seed')));
  for (const action of [() => callIt(ended), () => release(ended, 'gary')]) {
    expect(action).toThrow(EngineError);
    expect(action).toThrow('ended');
  }
});

it('retains the delivered pending event when called, while forbidding further actions', () => {
  const state = deepFreeze(pending([fixtureResponse]));
  const ended = callIt(state);
  expect(ended.current).toBe(state.current);
  expect(ended.phase).toBe('ended');
  expect(() => release(ended, 'sam')).toThrow('ended');
});
