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
    state.risks,
    state.bookingEnd,
    state.peakHeadcount,
  ])
    ok(
      Number.isSafeInteger(value) && value >= 0,
      'Noninteger/negative counter',
    );
  ok(
    state.progress <= ENGINE_LIMITS.progressMax &&
      state.risks <= ENGINE_LIMITS.risksMax,
    'Progress/risk bounds',
  );
  ok(
    state.present.length >= ENGINE_LIMITS.minHeadcount &&
      state.present.length <= ENGINE_LIMITS.maxHeadcount,
    'Headcount bounds',
  );
  ok(
    state.present.includes(ENGINE_LIMITS.decisionOwner),
    'Decision owner absent',
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
  ok(
    state.releasedAttendeeIds.every((id) => !state.present.includes(id)),
    'Rejoined',
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
  const releases = policy === 'greedy' ? ['gary', 'jordan'] : [];
  deepStrictEqual(
    state.releasedAttendeeIds,
    releases,
    'Unexpected policy releases',
  );
  ok(
    state.ending === 'decision' || state.ending === 'time-expired',
    'Policy called it early',
  );
  const firstDraw = state.log.findIndex((entry) => entry.type === 'draw');
  const prefix = state.log.slice(0, firstDraw);
  deepStrictEqual(
    prefix.map((entry) => (entry.type === 'release' ? entry.who : entry.type)),
    releases,
    'Policy releases must precede first draw',
  );
  ok(
    state.log.every((entry) => entry.type !== 'call-it'),
    'Unexpected Call it action',
  );
}

export function assertReplay(first: MeetingState, replay: MeetingState): void {
  deepStrictEqual(replay, first, 'Nondeterministic simulation replay');
}
