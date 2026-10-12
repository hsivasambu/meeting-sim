import {
  drawEvent,
  initialState,
  release,
  resolve,
} from '../src/core/engine/index';
import type { MeetingState } from '../src/core/engine/index';
import { assertPolicy, assertReplay, assertState } from './invariants';
import { choose } from './policies';
import type { Policy } from './settings';

function checked(previous: MeetingState, next: MeetingState): MeetingState {
  assertState(next, previous);
  return next;
}

function freeze(value: unknown): void {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value))
    return;
  for (const child of Object.values(value)) freeze(child);
  Object.freeze(value);
}

export function runMeeting(seed: string, policy: Policy): MeetingState {
  let state = initialState(seed);
  assertState(state);
  if (policy === 'greedy') {
    for (const who of ['gary', 'jordan'] as const) {
      freeze(state);
      state = checked(state, release(state, who));
    }
  }
  while (state.phase === 'running') {
    freeze(state);
    state = checked(state, drawEvent(state));
    freeze(state);
    const response = choose(state, policy);
    state = checked(state, resolve(state, response.id));
  }
  assertPolicy(state, policy);
  return state;
}

export function verifiedMeeting(seed: string, policy: Policy): MeetingState {
  try {
    const result = runMeeting(seed, policy);
    assertReplay(result, runMeeting(seed, policy));
    return result;
  } catch (cause) {
    throw new Error(
      `Simulation failed: seed=${JSON.stringify(seed)} policy=${policy}. ` +
        'Replay with runMeeting(seed, policy).',
      { cause },
    );
  }
}
