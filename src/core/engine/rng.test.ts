import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { cyrb53, drawRng, hashSeed, mulberry32 } from './rng';

// Fixed outputs from the original published algorithms, independently evaluated.
const vectors = [
  {
    seed: '',
    hash: 3338908027751811,
    low: 451841411,
    words: [1401669487, 3824724393, 3842120734, 3224703548],
  },
  {
    seed: 'hello',
    hash: 4625896200565286,
    low: 1674408486,
    words: [35928003, 3994868390, 1067316244, 3958757644],
  },
  {
    seed: 'fixture-seed',
    hash: 7939969414244944,
    low: 813083216,
    words: [2154176065, 4058004044, 3367530701, 1081748342],
  },
  {
    seed: '\u{1f4e7}',
    hash: 1230563200216996,
    low: 3530305444,
    words: [141359354, 1574449305, 1880762549, 555201989],
  },
  {
    seed: 'e\u0301',
    hash: 904239693807603,
    low: 3049111539,
    words: [974175744, 1492841213, 2900171883, 2112977640],
  },
  {
    seed: '\ud800',
    hash: 8925071026939333,
    low: 136832453,
    words: [4071507508, 1062611887, 3552672833, 2766888712],
  },
];
describe('locked RNG algorithms', () => {
  it.each(vectors)(
    'hashes UTF-16 seed $seed with hash seed zero and truncates to 32 bits',
    ({ seed, hash, low, words }) => {
      expect(cyrb53(seed)).toBe(hash);
      expect(hashSeed(seed)).toBe(low);
      const rng = mulberry32(low);
      expect(Array.from({ length: 4 }, () => rng() * 4294967296)).toEqual(
        words,
      );
    },
  );
  it.each([
    [0, [1144304738, 1416247, 958946056, 627933444]],
    [1, [2693262067, 11749833, 2265367787, 4213581821]],
    [4294967295, [3850105811, 813802916, 3073704848, 4054706436]],
  ] as const)(
    'locks mulberry32 numeric seed %i including overflow',
    (seed, words) => {
      const rng = mulberry32(seed);
      expect(Array.from({ length: 4 }, () => rng() * 4294967296)).toEqual(
        words,
      );
    },
  );
  it('uses the exact turn seed and keeps streams independent', () => {
    const earlier = drawRng('meeting', 0);
    expect(Array.from({ length: 4 }, () => earlier() * 4294967296)).toEqual([
      2749506690, 2459429100, 421823567, 3300341505,
    ]);
    for (let index = 0; index < 10000; index += 1) earlier();
    const later = drawRng('meeting', 1);
    expect(Array.from({ length: 4 }, () => later() * 4294967296)).toEqual([
      1775603592, 703154376, 4067270103, 1739461497,
    ]);
    expect(drawRng('meeting', 1)()).toBe(drawRng('meeting', 1)());
  });
  it('is reproducible and bounded for arbitrary UTF-16 strings and turns', () => {
    const seed = fc
      .array(fc.integer({ min: 0, max: 65535 }), { maxLength: 80 })
      .map((units) => String.fromCharCode(...units));
    fc.assert(
      fc.property(seed, fc.nat(100000), (text, turn) => {
        const first = drawRng(text, turn);
        const replay = drawRng(text, turn);
        expect(Number.isSafeInteger(cyrb53(text))).toBe(true);
        for (let index = 0; index < 40; index += 1) {
          const value = first();
          expect(value).toBe(replay());
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThan(1);
        }
      }),
      { seed: 31003, numRuns: 100 },
    );
  });
});
