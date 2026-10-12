import { ENGINE_LIMITS, score } from '../src/core/engine/index';
import type { MeetingState } from '../src/core/engine/index';
import { GREEDY_TURN_BAND, WIN_BANDS } from './settings';
import type { Policy } from './settings';

export function median(values: readonly number[]): number {
  if (!values.length) throw new Error('Empty median');
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const upper = sorted[middle];
  const lower = sorted[sorted.length % 2 ? middle : middle - 1];
  if (upper === undefined || lower === undefined)
    throw new Error('Missing median');
  return (lower + upper) / 2;
}

export function summarize(policy: Policy, states: readonly MeetingState[]) {
  if (!states.length) throw new Error('Empty simulation');
  const wins = states.filter((state) => state.ending === 'decision').length;
  const reached100 = states.filter(
    (state) => state.progress === ENGINE_LIMITS.progressMax,
  ).length;
  const winRate = (wins / states.length) * 100;
  const medianTurns = median(states.map((state) => state.turn));
  const band = WIN_BANDS[policy];
  const bookings = states.flatMap((state) =>
    state.log.filter(
      (entry) => entry.type === 'resolve' && entry.eventId === 'room-booked',
    ),
  );
  return {
    policy,
    runs: states.length,
    wins,
    winRate,
    winBand: band,
    winBandMet: winRate >= band[0] && winRate <= band[1],
    reached100,
    reachRate: (reached100 / states.length) * 100,
    medianScore: median(states.map((state) => score(state).total)),
    medianTurns,
    greedyTurnBandMet:
      policy === 'greedy'
        ? medianTurns >= GREEDY_TURN_BAND[0] &&
          medianTurns <= GREEDY_TURN_BAND[1]
        : null,
    reservationResponses: Object.fromEntries(
      ['hear', 'timebox', 'vp'].map((id) => [
        id,
        bookings.filter(
          (entry) => entry.type === 'resolve' && entry.responseId === id,
        ).length,
      ]),
    ),
  };
}
