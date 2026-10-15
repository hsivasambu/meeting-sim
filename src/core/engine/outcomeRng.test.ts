import { expect, it, vi } from 'vitest';
import fc from 'fast-check';
import { responseRng, hashSeed, sampleOutcome, drawRng } from './rng';
import { lottery, steady } from './fixtures/outcomes';

// Keyed vectors cross-check the existing independently pinned hash/PRNG algorithms.
it.each([
  {
    seed: 'fixture',
    hash: 267973828,
    tickets: [1142984481, 950390641, 173398464, 2869888429],
  },
  {
    seed: '🍜:response-v1:0',
    hash: 1575337808,
    tickets: [49452562, 238567992, 1843369580, 2463996110],
  },
  {
    seed: 'a"b:c',
    hash: 3487327828,
    tickets: [874555166, 2885314648, 259429484, 1102756375],
  },
])('pins response stream for $seed', ({ seed, hash, tickets }) => {
  expect(
    hashSeed(
      JSON.stringify([seed, 'response-v1', 7, 'fixture-event', 'choose']),
    ),
  ).toBe(hash);
  const rng = responseRng(seed, 7, 'fixture-event', 'choose');
  expect(
    Array.from({ length: 4 }, () => Math.floor(rng() * 4294967296)),
  ).toEqual(tickets);
});
it.each([
  [0, 'bad'],
  [1, 'good'],
  [2, 'good'],
  [4294967294, 'good'],
] as const)('selects sorted cumulative boundary ticket %i', (ticket, id) => {
  expect(sampleOutcome(lottery.outcomes, () => ticket / 4294967296).id).toBe(
    id,
  );
  expect(
    sampleOutcome([...lottery.outcomes].reverse(), () => ticket / 4294967296)
      .id,
  ).toBe(id);
});
it('rejects ticket at L before modulo and consumes no deterministic ticket', () => {
  const rng = vi
    .fn()
    .mockReturnValueOnce(4294967295 / 4294967296)
    .mockReturnValueOnce(0);
  expect(sampleOutcome(lottery.outcomes, rng).id).toBe('bad');
  expect(rng).toHaveBeenCalledTimes(2);
  const unused = vi.fn(() => 0);
  expect(sampleOutcome(steady.outcomes, unused).id).toBe('steady');
  expect(unused).not.toHaveBeenCalled();
  expect(() => sampleOutcome([], unused)).toThrow('invalid-response');
});
it('rejects real keyed stream tickets in a fixed maximum-weight fixture', () => {
  const outcomes = [
    { ...steady.outcomes[0], id: 'a', weight: 40000 },
    { ...steady.outcomes[0], id: 'b', weight: 25175 },
  ];
  // W=65175, L=4294902150. First ticket 4294932833 rejects; second 691950412 accepts.
  // Modulo without rejection chooses a; the accepted ticket chooses b.
  const rng = vi.fn(responseRng('reject-262791', 0, 'fixture-event', 'choose'));
  expect(sampleOutcome(outcomes, rng).id).toBe('b');
  expect(rng).toHaveBeenCalledTimes(2);
});
it('disambiguates delimiter seeds/IDs and isolates draw streams', () => {
  expect(responseRng('a:0:b', 1, 'c', 'd')()).not.toBe(
    responseRng('a', 0, 'b:1:c', 'd')(),
  );
  const before = drawRng('fixture', 7)();
  const rng = responseRng('fixture', 7, 'fixture-event', 'choose');
  for (let index = 0; index < 100; index += 1) rng();
  expect(drawRng('fixture', 7)()).toBe(before);
});
it('replays arbitrary UTF-16 response keys and maps every integer weight ticket', () => {
  fc.assert(
    fc.property(
      fc.array(fc.integer({ min: 0, max: 65535 }), { maxLength: 40 }),
      fc.integer({ min: 1, max: 100 }),
      fc.integer({ min: 1, max: 100 }),
      (units, a, b) => {
        const seed = String.fromCharCode(...units);
        expect(responseRng(seed, 3, 'fixture', 'choice')()).toBe(
          responseRng(seed, 3, 'fixture', 'choice')(),
        );
        const outcomes = [
          { ...steady.outcomes[0], id: 'a', weight: a },
          { ...steady.outcomes[0], id: 'b', weight: b },
        ];
        const selected = Array.from(
          { length: a + b },
          (_, ticket) => sampleOutcome(outcomes, () => ticket / 4294967296).id,
        );
        expect(selected.filter((id) => id === 'a')).toHaveLength(a);
        expect(selected.filter((id) => id === 'b')).toHaveLength(b);
      },
    ),
    { seed: 30303, numRuns: 100 },
  );
});
