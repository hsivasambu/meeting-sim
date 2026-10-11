import { DEFAULT_EVENT_WEIGHT, ONE, ZERO } from './constants';
import type { MeetingEvent, Rarity } from './types';

// Eligible, unique-ID pool supplied by draw.ts (task 06). No selection/fairness rules here.
export function selectWeightedEvent(
  events: readonly MeetingEvent[],
  rng: () => number,
  rarityWeights: Readonly<Record<Rarity, number>>,
): MeetingEvent {
  const candidates = events
    .map((event) => {
      const weight = event.weight ?? DEFAULT_EVENT_WEIGHT;
      if (!Number.isSafeInteger(weight) || weight < ONE)
        throw new RangeError('Invalid event weight');
      return { event, weight: rarityWeights[event.rarity] * weight };
    })
    .sort((a, b) =>
      a.event.id < b.event.id ? -ONE : a.event.id > b.event.id ? ONE : ZERO,
    );
  const total = candidates.reduce(
    (sum, candidate) => sum + candidate.weight,
    ZERO,
  );
  if (total === ZERO || !Number.isSafeInteger(total))
    throw new RangeError('Invalid total weight');
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
