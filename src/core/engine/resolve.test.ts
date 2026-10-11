import { expect, it } from 'vitest';
import { resolveWithRules } from './resolve';
import { previewWithRules } from './preview';
import { release, callIt, initialState } from './state';
import { resolve, previewResponse } from './index';
import { EngineError } from './errors';
import {
  deepFreeze,
  pending,
  fixtureResponse,
  fixtureUtilityRules,
} from './fixtures/transitions';
import type { Response, Effect } from './types';
const run = (state: ReturnType<typeof pending>, id = 'choose') =>
  resolveWithRules(state, id, fixtureUtilityRules);

it('matches preview deltas, records full-duration outcomes and gives decision priority over expiry', () => {
  const response = {
    ...fixtureResponse,
    effect: { minutes: 10, progress: 20, risks: 2 },
  };
  const state = deepFreeze(
    pending([response], { progress: 95, minute: 59, risks: 4 }),
  );
  const before = JSON.stringify(state);
  const preview = previewWithRules(state, response, fixtureUtilityRules);
  const next = run(state);
  expect(next).toMatchObject({
    progress: 100,
    risks: 5,
    minute: 69,
    personMinutes: 60,
    turn: 1,
    current: null,
    phase: 'ended',
    ending: 'decision',
  });
  if (!preview.enabled) throw new Error('Fixture unexpectedly disabled');
  expect(next.progress - state.progress).toBe(preview.progressDelta);
  expect(next.risks - state.risks).toBe(preview.risksDelta);
  expect(next.personMinutes - state.personMinutes).toBe(
    preview.personMinutesDelta,
  );
  expect(next.decisions[0]?.quality).toBeNull();
  expect(next.log[0]).toMatchObject({
    type: 'resolve',
    turn: 0,
    minute: 69,
    line: 'Fixture result.',
  });
  expect(JSON.stringify(state)).toBe(before);
});
it('applies a shortened deadline even when it is already past', () => {
  const response = {
    ...fixtureResponse,
    effect: { minutes: 1, bookingEnd: 45 as const },
  };
  const next = run(pending([response], { minute: 50 }, { id: 'room-booked' }));
  expect(next).toMatchObject({
    minute: 51,
    bookingEnd: 45,
    phase: 'ended',
    ending: 'time-expired',
  });
});
it('supports zero-minute email and keeps park count independent of clamped risks', () => {
  const email: Response = {
    ...fixtureResponse,
    technique: 'email',
    effect: { minutes: 0, risks: 1 },
  };
  expect(run(pending([email]))).toMatchObject({
    minute: 0,
    personMinutes: 0,
    turn: 1,
    risks: 1,
    ending: null,
  });
  const park: Response = {
    ...fixtureResponse,
    technique: 'park',
    effect: { minutes: 2, risks: 1 },
  };
  expect(run(pending([park], { risks: 5, parkedCount: 2 }))).toMatchObject({
    risks: 5,
    parkedCount: 3,
  });
});
it('values only enabled responses immediately before resolution and preserves prior quality', () => {
  const good: Response = {
    ...fixtureResponse,
    id: 'good',
    requires: { present: ['sam'] },
    effect: { minutes: 1, progress: 10 },
  };
  const low: Response = {
    ...fixtureResponse,
    id: 'low',
    effect: { minutes: 1, progress: 0 },
  };
  const mid: Response = {
    ...fixtureResponse,
    id: 'mid',
    effect: { minutes: 1, progress: 5 },
  };
  const state = deepFreeze(pending([good, low, mid]));
  expect(run(state, 'mid').decisions[0]?.quality).toBe(0.5);
  const released = release(state, 'sam');
  expect(run(released, 'mid').decisions[0]?.quality).toBe(1);
  expect(() => run(released, 'good')).toThrow('disabled-response');
  const equal = pending([low, { ...low, id: 'equal' }]);
  expect(run(equal, 'equal').decisions[0]?.quality).toBeNull();
  const prior = run(state, 'good');
  const later = run(pending([low], { ...prior, current: null }), 'low');
  expect(later.decisions[0]).toEqual(prior.decisions[0]);
});
it('joins only the designated arrival, billed at the old headcount, and never rejoins released people', () => {
  for (const [id, who] of [
    ['legal', 'legal'],
    ['vp-joins', 'vp'],
  ] as const) {
    const response = {
      ...fixtureResponse,
      effect: { minutes: 3, joins: [who] },
    };
    const state = pending([response], {}, { id, kind: 'escalation' });
    const next = run(deepFreeze(state));
    expect(next.present).toContain(who);
    expect(next.personMinutes).toBe(18);
    expect(next.peakHeadcount).toBe(7);
    expect(next.log.at(-1)).toEqual({ type: 'join', turn: 0, minute: 3, who });
    expect(() => run(pending([response], release(next, who), { id }))).toThrow(
      'invalid-join',
    );
  }
});
it('schedules at pre-increment turn n+2 and leaves preview free of scheduling', () => {
  const response: Response = {
    ...fixtureResponse,
    technique: 'park',
    effect: {
      minutes: 2,
      callback: { eventId: 'support-follow-up', afterTurns: 2 },
    },
  };
  const state = deepFreeze(
    pending([response], { turn: 4 }, { id: 'support-training' }),
  );
  previewWithRules(state, response, fixtureUtilityRules);
  expect(state.scheduled).toEqual([]);
  const next = run(state);
  expect(next.scheduled).toEqual([
    { eventId: 'support-follow-up', dueTurn: 6 },
  ]);
  expect(next.turn).toBe(5);
});
it.each([
  { scheduled: [{ eventId: 'support-follow-up', dueTurn: 8 }] },
  { scheduled: [{ eventId: 'other', dueTurn: 2 }] },
  { seenEventIds: ['support-follow-up'] },
])(
  'rejects repeated targets and callback due-turn collisions atomically',
  (patch) => {
    const response: Response = {
      ...fixtureResponse,
      technique: 'park',
      effect: {
        minutes: 2,
        callback: { eventId: 'support-follow-up', afterTurns: 2 },
      },
    };
    const state = deepFreeze(
      pending([response], patch, { id: 'support-training' }),
    );
    const before = JSON.stringify(state);
    expect(() => run(state)).toThrow('invalid-schedule');
    expect(JSON.stringify(state)).toBe(before);
  },
);
it.each([
  {
    id: 'wrong-parent',
    kind: 'substantive' as const,
    technique: 'park' as const,
    target: 'support-follow-up',
    delay: 2,
  },
  {
    id: 'support-training',
    kind: 'callback' as const,
    technique: 'park' as const,
    target: 'support-follow-up',
    delay: 2,
  },
  {
    id: 'support-training',
    kind: 'substantive' as const,
    technique: 'owner' as const,
    target: 'support-follow-up',
    delay: 2,
  },
  {
    id: 'support-training',
    kind: 'substantive' as const,
    technique: 'park' as const,
    target: 'wrong',
    delay: 2,
  },
  {
    id: 'support-training',
    kind: 'substantive' as const,
    technique: 'park' as const,
    target: 'support-follow-up',
    delay: 3,
  },
])(
  'rejects illegal callback contexts %j',
  ({ id, kind, technique, target, delay }) => {
    const effect = {
      minutes: 2,
      callback: { eventId: target, afterTurns: delay },
    } as Effect;
    expect(() =>
      run(
        pending([{ ...fixtureResponse, technique, effect }], {}, { id, kind }),
      ),
    ).toThrow('invalid-schedule');
  },
);
it('rejects missing/unknown/duplicate response IDs and actions after ending', () => {
  expect(() => run(initialState('seed'))).toThrow('missing-event');
  expect(() => run(pending([fixtureResponse]), 'missing')).toThrow(
    'unknown-response',
  );
  expect(() => run(pending([fixtureResponse, fixtureResponse]))).toThrow(
    'unknown-response',
  );
  expect(() => run(callIt(pending([fixtureResponse])))).toThrow(EngineError);
});
it('rejects wrong arrival/booking/zero-minute contexts', () => {
  expect(() =>
    run(
      pending([
        { ...fixtureResponse, effect: { minutes: 1, joins: ['legal'] } },
      ]),
    ),
  ).toThrow('invalid-join');
  expect(() => run(pending([fixtureResponse], {}, { id: 'legal' }))).toThrow(
    'invalid-join',
  );
  expect(() =>
    run(
      pending([{ ...fixtureResponse, effect: { minutes: 1, bookingEnd: 45 } }]),
    ),
  ).toThrow('invalid-effect');
  expect(() =>
    run(pending([{ ...fixtureResponse, effect: { minutes: 0 } }])),
  ).toThrow('invalid-effect');
});
it('provides the locked public signatures without exposing tuning or live content', () => {
  const state = deepFreeze(pending([fixtureResponse]));
  expect(previewResponse(state, fixtureResponse).enabled).toBe(true);
  expect(resolve(state, 'choose')).toMatchObject({
    progress: 20,
    minute: 3,
    turn: 1,
  });
});
