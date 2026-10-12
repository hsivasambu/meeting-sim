import { createHash } from 'node:crypto';
import { previewResponse } from '../src/core/engine/index';
import type { MeetingState, Response } from '../src/core/engine/index';
import type { Policy } from './settings';

export function enabledResponses(state: MeetingState): readonly Response[] {
  const responses = state.current?.responses.filter(
    (response) => previewResponse(state, response).enabled,
  );
  if (!responses?.length) throw new Error('No enabled response');
  return responses;
}

export function greedy(state: MeetingState): Response {
  const candidates = enabledResponses(state).map((response) => {
    const preview = previewResponse(state, response);
    if (!preview.enabled) throw new Error('Disabled candidate');
    return { response, preview };
  });
  candidates.sort(
    (a, b) =>
      b.preview.utility - a.preview.utility ||
      a.preview.minutesDelta - b.preview.minutesDelta ||
      (a.response.id < b.response.id
        ? -1
        : a.response.id > b.response.id
          ? 1
          : 0),
  );
  const best = candidates[0];
  if (!best) throw new Error('Empty Greedy pool');
  return best.response;
}

// The policy stream uses no engine RNG or future draw. Rejection avoids modulo bias.
export function randomIndex(seed: string, turn: number, count: number): number {
  if (!Number.isSafeInteger(count) || count <= 0 || count > 2 ** 32)
    throw new Error('Invalid Random pool size');
  const range = 2 ** 32;
  const limit = range - (range % count);
  for (let counter = 0; ; counter += 1) {
    const ticket = createHash('sha256')
      .update(`${seed}:policy:random:${turn}`)
      .update(`:${counter}`)
      .digest()
      .readUInt32BE(0);
    if (ticket < limit) return ticket % count;
  }
}

export function choose(state: MeetingState, policy: Policy): Response {
  if (policy === 'greedy') return greedy(state);
  const responses = enabledResponses(state);
  const response =
    responses[randomIndex(state.seed, state.turn, responses.length)];
  if (!response) throw new Error('Random selected outside pool');
  return response;
}
