import { DEFAULT_EVENT_WEIGHT, ONE, ZERO } from './constants';
import type { MeetingEvent, Rarity, EngineResponse } from './types';

function validateRarityWeights(
  weights: Readonly<Record<Rarity, number>>,
): void {
  for (const rarity of ['common', 'uncommon', 'rare'] as const) {
    if (!Number.isSafeInteger(weights[rarity]) || weights[rarity] < ONE)
      throw new RangeError('Invalid rarity weight');
  }
}

/** Implements Design Doc v2 → Events and responses → Draw rules: unique-ID integer-weight selection. */
export function weightedEvents<R extends EngineResponse>(
  events: readonly MeetingEvent<R>[],
  rarityWeights: Readonly<Record<Rarity, number>>,
) {
  validateRarityWeights(rarityWeights);
  const ids = new Set<string>();
  const candidates = events
    .map((event) => {
      if (ids.has(event.id)) throw new RangeError('Duplicate event ID');
      ids.add(event.id);
      const weight = event.weight ?? DEFAULT_EVENT_WEIGHT;
      if (!Number.isSafeInteger(weight) || weight < ONE)
        throw new RangeError('Invalid event weight');
      return { event, weight: rarityWeights[event.rarity] * weight };
    })
    .sort((a, b) => (a.event.id < b.event.id ? -ONE : ONE));
  const total = candidates.reduce(
    (sum, candidate) => sum + candidate.weight,
    ZERO,
  );
  if (total === ZERO || !Number.isSafeInteger(total))
    throw new RangeError('Invalid total weight');
  return { candidates, total };
}

/** Implements the exact one-ticket weighted selection shared with draw distributions. */
export function selectWeightedEvent<R extends EngineResponse>(
  events: readonly MeetingEvent<R>[],
  rng: () => number,
  rarityWeights: Readonly<Record<Rarity, number>>,
): MeetingEvent<R> {
  const { candidates, total } = weightedEvents(events, rarityWeights);
  const random = rng();
  if (!Number.isFinite(random) || random < ZERO || random >= ONE)
    throw new RangeError('RNG outside [0, 1)');
  const ticket = Math.floor(random * total);
  let cumulative = ZERO;
  for (const candidate of candidates) {
    cumulative += candidate.weight;
    if (cumulative > ticket) return candidate.event;
  }
  throw new RangeError('Unreachable weighted ticket');
}
