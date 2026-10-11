// cyrb53 (2018 bryc), public domain; original algorithm, not cyrb53a.
// https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js
import {
  ZERO,
  ONE,
  HASH_INITIAL_LOW,
  HASH_INITIAL_HIGH,
  HASH_MIX_LOW,
  HASH_MIX_HIGH,
  HASH_FINAL_LOW,
  HASH_FINAL_HIGH,
  HASH_SHIFT_LOW,
  HASH_SHIFT_HIGH,
  HASH_HIGH_MASK,
  UINT32_RANGE,
  PRNG_INCREMENT,
  PRNG_SHIFT_FIRST,
  PRNG_SHIFT_SECOND,
  PRNG_SHIFT_FINAL,
  PRNG_OR_FIRST,
  PRNG_OR_SECOND,
} from './constants';

/** Implements Design Doc v2 → Events and responses → Randomness and seeds. */
export function cyrb53(seed: string): number {
  let low = HASH_INITIAL_LOW;
  let high = HASH_INITIAL_HIGH;
  // Index code units rather than iterating code points: UTF-16 is part of the contract.
  for (let index = ZERO; index < seed.length; index += ONE) {
    const unit = seed.charCodeAt(index);
    low = Math.imul(low ^ unit, HASH_MIX_LOW);
    high = Math.imul(high ^ unit, HASH_MIX_HIGH);
  }
  low =
    Math.imul(low ^ (low >>> HASH_SHIFT_LOW), HASH_FINAL_LOW) ^
    Math.imul(high ^ (high >>> HASH_SHIFT_HIGH), HASH_FINAL_HIGH);
  high =
    Math.imul(high ^ (high >>> HASH_SHIFT_LOW), HASH_FINAL_LOW) ^
    Math.imul(low ^ (low >>> HASH_SHIFT_HIGH), HASH_FINAL_HIGH);
  return UINT32_RANGE * (high & HASH_HIGH_MASK) + (low >>> ZERO);
}
/** Implements Design Doc v2 → Events and responses → Randomness and seeds. */
export function hashSeed(seed: string): number {
  return cyrb53(seed) >>> ZERO;
}
// mulberry32 by Tommy Ettinger; explicit wrapping preserves long-lived streams.
// https://github.com/bryc/code/blob/master/jshash/PRNGs.md#mulberry32
/** Implements Design Doc v2 → Events and responses → Randomness and seeds. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> ZERO;
  return () => {
    state = (state + PRNG_INCREMENT) >>> ZERO;
    let mixed = Math.imul(
      state ^ (state >>> PRNG_SHIFT_FIRST),
      state | PRNG_OR_FIRST,
    );
    mixed ^=
      mixed +
      Math.imul(mixed ^ (mixed >>> PRNG_SHIFT_SECOND), mixed | PRNG_OR_SECOND);
    return ((mixed ^ (mixed >>> PRNG_SHIFT_FINAL)) >>> ZERO) / UINT32_RANGE;
  };
}
/** Implements Design Doc v2 → Events and responses → Randomness and seeds. */
export function drawRng(seed: string, turn: number): () => number {
  return mulberry32(hashSeed(seed + ':draw:' + turn));
}
