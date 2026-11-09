import { expect, it } from 'vitest';
import { previewWithRules } from './preview';
import { resolveWithRules } from './resolve';
import { lunchChoice, lunchRules, lunchState } from './fixtures/lunch';
import { deepFreeze, pending } from './fixtures/transitions';
import type { Effect, MeetingState } from './types';

const park = lunchChoice(
  'park',
  {
    minutes: 2,
    callback: { eventId: 'fixture-return-a', afterTurns: 2 },
  },
  'park',
);

it.each([
  { scheduled: [{ eventId: 'fixture-return-a', dueTurn: 5 }] },
  { scheduled: [{ eventId: 'another-return', dueTurn: 4 }] },
  { seenEventIds: ['fixture-return-a'] },
] satisfies Partial<MeetingState>[])(
  'rejects repeated targets and due-turn collisions atomically',
  (patch) => {
    const state = deepFreeze(
      pending([park], { turn: 2, ...patch }, { id: 'fixture-parent-a' }),
    );
    const before = JSON.stringify(state);
    expect(() => previewWithRules(state, park, lunchRules)).toThrow(
      'invalid-schedule',
    );
    expect(() => resolveWithRules(state, park.id, lunchRules)).toThrow(
      'invalid-schedule',
    );
    expect(JSON.stringify(state)).toBe(before);
  },
);

it('requires pending context for every event-dependent effect', () => {
  const state = lunchState();
  expect(
    previewWithRules(state, lunchChoice('plain', { minutes: 1 }), lunchRules)
      .enabled,
  ).toBe(true);
  for (const effect of [
    { minutes: 1, joins: ['vp'] },
    { minutes: 1, bookingEnd: 45 },
    { minutes: 1, callback: { eventId: 'fixture-return-a', afterTurns: 2 } },
    { minutes: 1, nominateCuisine: 'fixture-a' },
  ] satisfies Effect[]) {
    expect(() =>
      previewWithRules(state, lunchChoice('test', effect), lunchRules),
    ).toThrow('missing-event');
  }
});

it('rejects a missing or invalid booking and unsafe accumulated time or cost', () => {
  const plain = lunchChoice('plain', { minutes: 2 });
  const booking = pending([plain], {}, { id: 'fixture-booking' });
  expect(() => resolveWithRules(booking, plain.id, lunchRules)).toThrow(
    'invalid-effect',
  );
  const invalid = lunchChoice('invalid', {
    minutes: 1,
    bookingEnd: 46,
  } as unknown as Effect);
  expect(() => previewWithRules(booking, invalid, lunchRules)).toThrow(
    'invalid-effect',
  );
  for (const patch of [
    { minute: Number.MAX_SAFE_INTEGER },
    { personMinutes: Number.MAX_SAFE_INTEGER },
  ]) {
    expect(() =>
      previewWithRules(pending([plain], patch), plain, lunchRules),
    ).toThrow('invalid-effect');
  }
});
