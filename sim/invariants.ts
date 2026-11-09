import { deepStrictEqual, ok } from 'node:assert/strict';
import { ENGINE_LIMITS, score } from '../src/core/engine/index';
import type { MeetingState } from '../src/core/engine/index';
import { MAX_RESOLVED_TURNS } from './settings';
import type { Policy } from './settings';

// Assertions observe engine results; the harness never repairs or clamps a state.
export function assertState(
  state: MeetingState,
  previous?: MeetingState,
): void {
  for (const value of [
    state.turn,
    state.minute,
    state.personMinutes,
    state.progress,
    state.bookingEnd,
    state.peakHeadcount,
  ])
    ok(
      Number.isSafeInteger(value) && value >= 0,
      'Noninteger/negative counter',
    );
  ok(state.progress <= ENGINE_LIMITS.progressMax, 'Progress bounds');
  ok(
    state.present.length >= ENGINE_LIMITS.minHeadcount &&
      state.present.length <= ENGINE_LIMITS.maxHeadcount,
    'Headcount bounds',
  );
  ok(
    new Set(state.present).size === state.present.length,
    'Duplicate attendee',
  );
  ok(
    new Set(state.seenEventIds).size === state.seenEventIds.length,
    'Repeated family',
  );
  ok(
    state.peakHeadcount >= state.present.length &&
      state.peakHeadcount <= ENGINE_LIMITS.maxHeadcount,
  );
  ok(state.turn === 0 || state.nominatedCuisine !== null, 'Nomination missing');
  ok(
    (state.ending === 'decision') === (state.agreedCuisine !== null),
    'Agreement/ending mismatch',
  );
  ok(
    state.agreedCuisine === null ||
      state.agreedCuisine === state.nominatedCuisine,
    'Agreement changed cuisine',
  );
  ok(
    state.bookingEnd === ENGINE_LIMITS.reducedBookingEnd ||
      state.bookingEnd === ENGINE_LIMITS.initialBookingEnd,
    'Invalid booking',
  );
  ok(state.turn <= MAX_RESOLVED_TURNS, 'Run exceeded natural turn bound');
  ok(
    state.phase === 'ended'
      ? state.ending !== null && state.current === null
      : state.ending === null,
  );
  if (previous) {
    ok(
      state.minute >= previous.minute &&
        state.personMinutes >= previous.personMinutes,
      'Time/cost decreased',
    );
    ok(state.turn >= previous.turn, 'Turn decreased');
    ok(state.seed === previous.seed, 'Seed changed');
    ok(
      previous.present.every((id) => state.present.includes(id)),
      'Attendance decreased',
    );
    ok(
      previous.nominatedCuisine === null ||
        state.nominatedCuisine === previous.nominatedCuisine,
      'Nomination changed',
    );
  }
  if (state.phase === 'ended') {
    ok(
      state.ending === 'decision'
        ? state.progress === ENGINE_LIMITS.progressMax
        : state.progress < ENGINE_LIMITS.progressMax,
    );
    if (state.ending === 'time-expired') ok(state.minute >= state.bookingEnd);
    const result = score(state);
    ok(
      Number.isInteger(result.total) &&
        result.total >= 0 &&
        result.total <= ENGINE_LIMITS.scoreMax,
      'Score bounds',
    );
    ok(result.total === result.outcome + result.efficiency + result.decisions);
  }
}

export function assertPolicy(state: MeetingState, policy: Policy): void {
  ok(
    state.ending === 'decision' || state.ending === 'time-expired',
    'Policy called it early',
  );
  if (
    policy === 'greedy' &&
    state.decisions.some(({ qualityFraction }) => qualityFraction !== null)
  )
    ok(
      score(state).decisions === 300,
      'Greedy missed the best expected utility',
    );
  ok(
    state.log.every((entry) => entry.type !== 'call-it'),
    'Unexpected Call it action',
  );
}

export function assertReplay(first: MeetingState, replay: MeetingState): void {
  deepStrictEqual(replay, first, 'Nondeterministic simulation replay');
}
