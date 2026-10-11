import { expect, it } from 'vitest';
import fc from 'fast-check';
import { fixturePack } from './fixtures/packs';
import { selectWeightedEvent } from './weighted';
import type { MeetingEvent, Rarity } from './types';

// Fixture weights are injected: changing live tuning never rewrites engine rule tests.
const fixtureWeights = {
  common: 65,
  uncommon: 28,
  rare: 7,
} as const satisfies Record<Rarity, number>;
function choose(
  events: readonly MeetingEvent[],
  rng: () => number,
): MeetingEvent {
  return selectWeightedEvent(events, rng, fixtureWeights);
}
const example = fixturePack.filler;
const pool: readonly MeetingEvent[] = Object.freeze([
  Object.freeze({ ...example, id: 'z', rarity: 'rare', weight: 1 }),
  Object.freeze({ ...example, id: 'a', rarity: 'common' }),
  Object.freeze({ ...example, id: 'B', rarity: 'uncommon', weight: 2 }),
]);
// ASCII B, a, z: 56, 65, 7 tickets, total 128. Strict cumulative > ticket.
it.each([
  [0, 'B'],
  [55, 'B'],
  [56, 'a'],
  [120, 'a'],
  [121, 'z'],
  [127, 'z'],
])('selects ticket %i at exact rarity × weight boundaries', (ticket, id) => {
  let calls = 0;
  expect(
    choose(pool, () => {
      calls += 1;
      return Number(ticket) / 128;
    }).id,
  ).toBe(id);
  expect(calls).toBe(1);
});
it('does not reorder or mutate the caller pool', () => {
  expect(choose(pool, () => 0).id).toBe('B');
  expect(pool.map((event) => event.id)).toEqual(['z', 'a', 'B']);
  expect(choose([...pool].reverse(), () => 0).id).toBe('B');
});
it('covers every integer ticket and is independent of input order', () => {
  const counts = { B: 0, a: 0, z: 0 };
  for (let ticket = 0; ticket < 128; ticket += 1) {
    const id = choose(pool, () => ticket / 128).id;
    if (id === 'B') counts.B += 1;
    else if (id === 'a') counts.a += 1;
    else if (id === 'z') counts.z += 1;
    else throw new Error('Unexpected candidate');
  }
  expect(counts).toEqual({ B: 56, a: 65, z: 7 });
});
it('matches exact ticket counts for synthetic positive weights', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 8 }),
      fc.integer({ min: 1, max: 8 }),
      (leftWeight, rightWeight) => {
        const left = { ...example, id: 'a', weight: leftWeight };
        const right = { ...example, id: 'b', weight: rightWeight };
        const total = 65 * (leftWeight + rightWeight);
        let leftCount = 0;
        for (let ticket = 0; ticket < total; ticket += 1) {
          if (choose([right, left], () => (ticket + 0.5) / total).id === 'a')
            leftCount += 1;
        }
        expect(leftCount).toBe(65 * leftWeight);
      },
    ),
    { seed: 31004, numRuns: 30 },
  );
});
it.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER])(
  'rejects unsafe/non-positive weight %s before consuming randomness',
  (weight) => {
    expect(() =>
      choose([{ ...example, weight }], () => {
        throw new Error('Must not draw');
      }),
    ).toThrow(RangeError);
  },
);
it('rejects an empty pool before consuming randomness', () => {
  expect(() =>
    choose([], () => {
      throw new Error('Must not draw');
    }),
  ).toThrow(RangeError);
});
it.each([-0.1, 1, Infinity, NaN])(
  'rejects an invalid RNG sample %s',
  (value) => {
    expect(() => choose(pool, () => value)).toThrow(RangeError);
  },
);
it('handles one candidate and equal IDs without depending on sort stability', () => {
  expect(choose([example], () => 0.999)).toBe(example);
  expect(choose([example, example], () => 0)).toBe(example);
});

it('obeys floor(rng × W) even when a decimal ratio rounds below an integer', () => {
  const fractionalPool = pool.map((event) =>
    event.id === 'z' ? { ...event, weight: 3 } : event,
  );
  expect(Math.floor((56 / 142) * 142)).toBe(55);
  expect(choose(fractionalPool, () => 56 / 142).id).toBe('B');
});
