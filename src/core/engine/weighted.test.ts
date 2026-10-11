import { expect, it, vi } from 'vitest';
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
it('handles a single candidate', () => {
  expect(choose([example], () => 0.999)).toBe(example);
});

it('obeys floor(rng × W) even when a decimal ratio rounds below an integer', () => {
  const fractionalPool = pool.map((event) =>
    event.id === 'z' ? { ...event, weight: 3 } : event,
  );
  expect(Math.floor((56 / 142) * 142)).toBe(55);
  expect(choose(fractionalPool, () => 56 / 142).id).toBe('B');
});

it.each(['common', 'uncommon', 'rare'] as const)(
  'rejects invalid %s rarity weights, including unused rarities, before drawing',
  (rarity) => {
    for (const invalid of [
      0,
      -1,
      0.5,
      1.5,
      NaN,
      Infinity,
      Number.MAX_SAFE_INTEGER + 1,
    ]) {
      const rng = vi.fn(() => 0);
      const weights = { ...fixtureWeights, [rarity]: invalid };
      expect(() => selectWeightedEvent([example], rng, weights)).toThrow(
        'Invalid rarity weight',
      );
      expect(rng).not.toHaveBeenCalled();
    }
  },
);
it('rejects fractional rarity products even when the total would be an integer', () => {
  const rng = vi.fn(() => 0);
  expect(() =>
    selectWeightedEvent(
      [
        { ...example, id: 'a' },
        { ...example, id: 'b' },
      ],
      rng,
      { ...fixtureWeights, common: 0.5 },
    ),
  ).toThrow('Invalid rarity weight');
  expect(rng).not.toHaveBeenCalled();
});
it.each([
  [example, example],
  [example, { ...example, weight: 2 }],
  [example, { ...example, id: 'different' }, example],
])('rejects duplicate IDs before drawing', (...events) => {
  const rng = vi.fn(() => 0);
  expect(() => choose(events, rng)).toThrow('Duplicate event ID');
  expect(rng).not.toHaveBeenCalled();
});
it('accepts positive safe-integer rarity weights and rejects unsafe products', () => {
  const rng = vi.fn(() => 0);
  expect(
    selectWeightedEvent([example], rng, { common: 1, uncommon: 1, rare: 1 }),
  ).toBe(example);
  expect(rng).toHaveBeenCalledTimes(1);
  rng.mockClear();
  expect(() =>
    selectWeightedEvent([{ ...example, weight: 2 }], rng, {
      common: Number.MAX_SAFE_INTEGER,
      uncommon: 1,
      rare: 1,
    }),
  ).toThrow('Invalid total weight');
  expect(rng).not.toHaveBeenCalled();
});
