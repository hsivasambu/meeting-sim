import { expect, it } from 'vitest';
import fc from 'fast-check';
import { initialLunchState, callIt } from './state';
import { drawEventWith, getDrawCandidatesWith } from './draw';
import { resolveWithRules, getResponseOutcomesWithRules } from './resolve';
import { previewWithRules } from './preview';
import { score } from './score';
import { earnedLunchTitles } from './titleRules';
import { EngineError } from './errors';
import {
  lunchPack,
  lunchRules,
  lunchChoice,
  lunchState,
  lunchPending,
  invite,
  lottery,
} from './fixtures/lunch';
import { deepFreeze } from './fixtures/transitions';
import { qualityRecords } from './fixtures/scores';
import type { LunchState } from './types';

it('initializes six permanent adults without launch fields, and cancellation retains the nomination prompt', () => {
  const start = deepFreeze(initialLunchState('任意 seed'));
  expect(start).not.toHaveProperty('risks');
  expect(start).not.toHaveProperty('releasedAttendeeIds');
  expect(start.present).toHaveLength(6);
  const pending = drawEventWith(lunchPack, start);
  expect(pending.current?.id).toBe(lunchPack.eventRules.nominationEventId);
  expect(getDrawCandidatesWith(lunchPack, start)).toEqual([
    { event: pending.current, probability: 1 },
  ]);
  expect(drawEventWith(lunchPack, deepFreeze(pending))).toEqual(pending);
  const ended = callIt(deepFreeze(pending));
  expect(ended).toMatchObject({
    ending: 'cancelled',
    minute: 0,
    current: pending.current,
    agreedCuisine: null,
  });
  expect(score(ended)).toEqual({
    outcome: 0,
    efficiency: 0,
    decisions: 0,
    total: 0,
  });
  expect(getDrawCandidatesWith(lunchPack, ended)).toEqual([]);
  expect(() => drawEventWith(lunchPack, ended)).toThrow(
    new EngineError('ended'),
  );
});

it.each(['fixture-a', 'fixture-b', 'fixture-c'])(
  'nominates %s with identical unscored effects and a common substantive second draw',
  (id) => {
    const pending = drawEventWith(lunchPack, initialLunchState('nominations'));
    const next = resolveWithRules(deepFreeze(pending), id, lunchRules);
    expect(next).toMatchObject({
      turn: 1,
      minute: 1,
      progress: 5,
      nominatedCuisine: id,
      agreedCuisine: null,
      personMinutes: 6,
    });
    expect(next.decisions[0]?.qualityFraction).toBeNull();
    expect(
      getDrawCandidatesWith(lunchPack, next).every(
        (c) => c.event.kind === 'substantive' && c.event.rarity === 'common',
      ),
    ).toBe(true);
    expect(callIt(next)).toMatchObject({
      ending: 'called-early',
      nominatedCuisine: id,
      agreedCuisine: null,
    });
  },
);

it.each([
  {
    progress: 100,
    pm: 132,
    q: 0.9,
    ending: 'decision',
    expected: { outcome: 400, efficiency: 253, decisions: 270, total: 923 },
  },
  {
    progress: 100,
    pm: 324,
    q: 0.85,
    ending: 'decision',
    expected: { outcome: 400, efficiency: 40, decisions: 255, total: 695 },
  },
  {
    progress: 100,
    pm: 108,
    q: 0.6,
    ending: 'decision',
    expected: { outcome: 400, efficiency: 280, decisions: 180, total: 860 },
  },
  {
    progress: 84,
    pm: 360,
    q: 0.9,
    ending: 'called-early',
    expected: { outcome: 151, efficiency: 0, decisions: 270, total: 421 },
  },
  {
    progress: 62,
    pm: 360,
    q: 0.35,
    ending: 'time-expired',
    expected: { outcome: 112, efficiency: 0, decisions: 105, total: 217 },
  },
] as const)(
  'matches approved score example P=$progress pm=$pm q=$q',
  ({ progress, pm, q, ending, expected }) => {
    const state = deepFreeze(
      lunchState({
        progress,
        personMinutes: pm,
        decisions: qualityRecords([q]),
        phase: 'ended',
        ending,
        agreedCuisine: ending === 'decision' ? 'fixture-a' : null,
      }),
    );
    expect(score(state)).toEqual(expected);
    expect(score({ ...state, log: [] })).toEqual(expected);
  },
);

it.each([44, 45, 59, 60, 65])(
  'agreement wins at minute %i even with a joining adult; full pre-join billing',
  (minute) => {
    const option = {
      ...invite,
      outcomes: [
        {
          id: 'done',
          weight: 1,
          effect: { minutes: 2, progress: 10, joins: ['vp'] as const },
          line: 'Fixture agreed.',
        },
      ],
    };
    const state = lunchPending([option], { progress: 95, minute });
    const current = state.current;
    if (current === null) throw new Error('fixture');
    const input = deepFreeze({
      ...state,
      current: { ...current, id: 'fixture-discussion' },
    });
    const next = resolveWithRules(input, 'invite', lunchRules);
    expect(next).toMatchObject({
      ending: 'decision',
      agreedCuisine: 'fixture-a',
      progress: 100,
      personMinutes: 12,
      minute: minute + 2,
    });
    expect(next.present).toHaveLength(7);
    expect(
      getResponseOutcomesWithRules(input, 'invite', lunchRules)[0]?.state,
    ).toEqual(next);
  },
);

it.each([45, 60])(
  'checks expiry equality and overshoot at booking %i',
  (bookingEnd) => {
    for (const minute of [bookingEnd - 1, bookingEnd, bookingEnd + 2]) {
      const state = lunchPending([lunchChoice('wait', { minutes: 1 })], {
        minute,
        bookingEnd,
        progress: 99,
      });
      expect(resolveWithRules(state, 'wait', lunchRules)).toMatchObject({
        ending: 'time-expired',
        agreedCuisine: null,
        progress: 99,
        minute: minute + 1,
      });
    }
  },
);

it('validates cuisine/state boundaries, nomination-only effects, and lunch-only effect schema', () => {
  for (const overrides of [
    { nominatedCuisine: null },
    { progress: 100, nominatedCuisine: null },
    { progress: 100 },
    { agreedCuisine: 'fixture-b' },
    { present: ['priya'] as const },
    { present: [...initialLunchState('').present, 'vp', 'vp'] as const },
  ])
    expect(() => drawEventWith(lunchPack, lunchState(overrides))).toThrow(
      new EngineError('invalid-state'),
    );
  expect(() =>
    score(
      lunchState({
        phase: 'ended',
        ending: 'decision',
        progress: 100,
        agreedCuisine: null,
      }),
    ),
  ).toThrow(new EngineError('invalid-state'));
  for (const effect of [
    { minutes: 1, nominateCuisine: 'fixture-b' },
    { minutes: 1, risks: 1 },
    { minutes: 0 },
    { minutes: 11 },
  ]) {
    const state = lunchPending([lunchChoice('invalid', effect)]);
    expect(() => resolveWithRules(state, 'invalid', lunchRules)).toThrow(
      new EngineError('invalid-effect'),
    );
  }
});

it('invites on every branch, disables duplicate invitations, suppresses spontaneous arrival and fixes variants on draw', () => {
  const state = lunchPending([invite, lunchChoice('wait', { minutes: 1 })]);
  const current = state.current;
  if (current === null) throw new Error('fixture');
  const pending = {
    ...state,
    current: { ...current, id: 'fixture-discussion' },
  };
  const branches = getResponseOutcomesWithRules(
    deepFreeze(pending),
    'invite',
    lunchRules,
  );
  for (const { state: next } of branches) {
    expect(next.present).toHaveLength(7);
    expect(next.personMinutes).toBe((next.minute - state.minute) * 6);
    expect(previewWithRules(next, invite, lunchRules)).toEqual({
      enabled: false,
      responseId: 'invite',
      reasonKey: 'fixture-present',
    });
    expect(
      getDrawCandidatesWith(lunchPack, next).some(
        (c) => c.event.id === 'fixture-vp',
      ),
    ).toBe(false);
    expect(
      getDrawCandidatesWith(lunchPack, next).find(
        (c) => c.event.id === 'fixture-discussion',
      )?.event,
    ).toMatchObject({ speaker: 'vp', line: 'Fixture invited speaker.' });
  }
  expect(() =>
    resolveWithRules(
      { ...pending, present: [...pending.present, 'vp'] },
      'invite',
      lunchRules,
    ),
  ).toThrow(new EngineError('disabled-response'));
  const malformed = { ...invite, requires: {} };
  expect(() =>
    resolveWithRules(
      {
        ...pending,
        current: {
          ...current,
          id: 'fixture-discussion',
          responses: [malformed],
        },
      },
      'invite',
      lunchRules,
    ),
  ).toThrow(new EngineError('invalid-join'));
});

it('rejects per-response permission mismatches and uses future headcount for later costs', () => {
  const illegal = lunchPending([invite]);
  expect(() => resolveWithRules(illegal, 'invite', lunchRules)).toThrow(
    new EngineError('invalid-join'),
  );
  const response = lunchChoice('wait', { minutes: 2 });
  const next = resolveWithRules(
    lunchPending([response], {
      present: [...initialLunchState('').present, 'vp', 'legal'],
    }),
    'wait',
    lunchRules,
  );
  expect(next.personMinutes).toBe(16);
});

it('scores q before rolling and clamps each branch before expectation', () => {
  const state = deepFreeze(
    lunchPending(
      [
        lottery,
        lunchChoice('low', { minutes: 10, progress: -10 }),
        lunchChoice('high', { minutes: 1, progress: 10 }),
      ],
      { progress: 95, minute: 59 },
    ),
  );
  const preview = previewWithRules(state, lottery, lunchRules);
  expect(preview.enabled).toBe(true);
  if (!preview.enabled) throw new Error('fixture');
  expect(preview.progressDelta).toBe(-2.5);
  const branches = getResponseOutcomesWithRules(state, 'lottery', lunchRules);
  expect(branches.map((b) => b.state.ending)).toEqual([
    'time-expired',
    'decision',
  ]);
  expect(branches[0]?.state.decisions).toEqual(branches[1]?.state.decisions);
  // U(low)=-22, U(lottery)=-6.7, U(high)=3.8: q=15.3/25.8=51/86.
  expect(branches[0]?.state.decisions.at(-1)?.quality).toBeCloseTo(51 / 86);
  const q = branches[0]?.state.decisions.at(-1)?.qualityFraction;
  if (q === null || q === undefined) throw new Error('Missing exact q');
  expect(BigInt(q.numerator) * 86n).toBe(BigInt(q.denominator) * 51n);
  expect(preview.outcomes.map((b) => b.progressDelta)).toEqual([-10, 5]);
});

it('keeps outcome discontinuity and exact cost-floor/reference boundaries', () => {
  const success = lunchState({
    phase: 'ended',
    ending: 'decision',
    progress: 100,
    agreedCuisine: 'fixture-a',
    personMinutes: 90,
  });
  expect(score(success)).toEqual({
    outcome: 400,
    efficiency: 300,
    decisions: 0,
    total: 700,
  });
  for (const personMinutes of [0, 89, 90])
    expect(score({ ...success, personMinutes }).efficiency).toBe(300);
  for (const personMinutes of [360, 361, 1000])
    expect(score({ ...success, personMinutes }).efficiency).toBe(0);
  const failure = {
    ...success,
    progress: 99,
    ending: 'time-expired' as const,
    agreedCuisine: null,
  };
  expect(score(failure).outcome).toBe(178);
  expect(score(success).outcome).toBeGreaterThan(score(failure).outcome);
  expect(
    score({ ...success, decisions: qualityRecords([null, null]) }).decisions,
  ).toBe(0);
});

it('rejects unknown cuisines, missing nomination context, and outcome permissions in either branch', () => {
  expect(() =>
    resolveWithRules(
      lunchPending([lunchChoice('wait', { minutes: 1 })], {
        nominatedCuisine: 'unknown',
      }),
      'wait',
      lunchRules,
    ),
  ).toThrow(new EngineError('invalid-state'));
  expect(() =>
    previewWithRules(
      { ...initialLunchState(''), current: null },
      lunchChoice('nominate', { minutes: 1, nominateCuisine: 'fixture-a' }),
      lunchRules,
    ),
  ).toThrow(new EngineError('missing-event'));
  const response = {
    ...invite,
    outcomes: invite.outcomes.map((outcome, index) =>
      index === 0 ? { ...outcome, effect: { minutes: 1 } } : outcome,
    ),
  };
  const pending = lunchPending([response]);
  const current = pending.current;
  if (current === null) throw new Error('fixture');
  expect(() =>
    resolveWithRules(
      { ...pending, current: { ...current, id: 'fixture-discussion' } },
      'invite',
      lunchRules,
    ),
  ).toThrow(new EngineError('invalid-join'));
});

it('rejects malformed nominations and forces the nominated family before any callback', () => {
  const start = initialLunchState('bad-nomination');
  const event = lunchPack.events[0];
  if (event === undefined) throw new Error('fixture');
  for (const responses of [
    event.responses.slice(0, 2),
    [...event.responses.slice(0, 2), event.responses[0]].filter(
      (r) => r !== undefined,
    ),
    event.responses.map((r, i) =>
      i === 0
        ? lunchChoice('different', { minutes: 2, nominateCuisine: 'fixture-a' })
        : r,
    ),
    [lottery, ...event.responses.slice(1)],
  ]) {
    expect(() =>
      drawEventWith({ ...lunchPack, events: [{ ...event, responses }] }, start),
    ).toThrow(new EngineError('invalid-response'));
  }
  expect(() => drawEventWith({ ...lunchPack, events: [] }, start)).toThrow(
    new EngineError('invalid-pool'),
  );
});

it.each(['a', 'b', 'c'])(
  'delivers callback %s at n+2, updates authoritative counters once, and stops after Call it',
  (suffix) => {
    let state = lunchState({
      seenEventIds: lunchPack.events
        .filter((e) => e.id !== 'fixture-parent-' + suffix)
        .map((e) => e.id),
    });
    state = drawEventWith(lunchPack, state);
    state = resolveWithRules(state, 'park', lunchRules);
    expect(state).toMatchObject({
      turn: 3,
      parkedCount: 1,
      scheduled: [{ eventId: 'fixture-return-' + suffix, dueTurn: 4 }],
    });
    state = resolveWithRules(
      drawEventWith(lunchPack, state),
      'ack',
      lunchRules,
    );
    state = drawEventWith(lunchPack, state);
    expect(state.current?.id).toBe('fixture-return-' + suffix);
    const ended = callIt(state);
    expect(getDrawCandidatesWith(lunchPack, ended)).toEqual([]);
    state = resolveWithRules(deepFreeze(state), 'ack', lunchRules);
    expect(state).toMatchObject({
      resolvedCallbackCount: 1,
      parkedCount: 1,
      scheduled: [],
    });
  },
);

it('retains negative adjacency guards and throws on broken first-two pool', () => {
  const state = lunchState({ previousDrawWasUncommonNegative: true });
  expect(
    getDrawCandidatesWith(lunchPack, state).every(
      (c) => !(c.event.rarity === 'uncommon' && c.event.negative),
    ),
  ).toBe(true);
  const one = resolveWithRules(
    drawEventWith(lunchPack, initialLunchState('first')),
    'fixture-a',
    lunchRules,
  );
  expect(() =>
    drawEventWith(
      {
        ...lunchPack,
        events: [lunchPack.events[0]].filter((e) => e !== undefined),
      },
      one,
    ),
  ).toThrow(new EngineError('invalid-pool'));
});

it('retains all lunch title predicates and priorities using counters rather than logs', () => {
  const state = lunchState({
    progress: 100,
    agreedCuisine: 'fixture-a',
    phase: 'ended',
    ending: 'decision',
    personMinutes: 270,
    parkedCount: 4,
    resolvedCallbackCount: 1,
    peakHeadcount: 8,
    log: [],
  });
  expect(
    earnedLunchTitles(state, {
      outcome: 400,
      efficiency: 300,
      decisions: 300,
      total: 1000,
    }),
  ).toEqual([
    'inbox-zero',
    'efficient-facilitator',
    'lunch-agreed',
    'death-by-diligence',
    'table-for-six',
    'reply-all-royalty',
    'parking-lot-attendant',
    'second-helping',
  ]);
  const failure = {
    ...state,
    progress: 99,
    agreedCuisine: null,
    ending: 'time-expired' as const,
    decisions: qualityRecords([0.85]),
  };
  expect(earnedLunchTitles(failure, score(failure)).slice(0, 2)).toEqual([
    'played-it-right',
    'calendar-criminal',
  ]);
  expect(
    earnedLunchTitles(
      { ...state, present: [...state.present, 'vp'], resolvedCallbackCount: 0 },
      score(state),
    ),
  ).not.toContain('table-for-six');
  expect(
    earnedLunchTitles({ ...state, resolvedCallbackCount: 0 }, score(state)),
  ).not.toContain('second-helping');
  expect(
    earnedLunchTitles(
      callIt(initialLunchState('')),
      score(callIt(initialLunchState(''))),
    ),
  ).toEqual(['could-have-been-an-email']);
});

it('properties: immutable replay, permanent attendance, fixed cuisine, integral score and <=50 resolutions', () => {
  fc.assert(
    fc.property(
      fc.string(),
      fc.array(fc.nat(), { minLength: 1, maxLength: 50 }),
      (seed, choices) => {
        const run = (): LunchState => {
          let state = initialLunchState(seed);
          while (state.phase === 'running') {
            const before = deepFreeze(state);
            state = drawEventWith(lunchPack, before);
            const responses =
              state.current?.responses.filter(
                (r) => previewWithRules(state, r, lunchRules).enabled,
              ) ?? [];
            const response =
              responses[
                (choices[state.turn % choices.length] ?? 0) % responses.length
              ];
            if (response === undefined) throw new Error('empty fixture');
            const input = deepFreeze(state);
            state = resolveWithRules(input, response.id, lunchRules);
            expect(state.minute).toBeGreaterThan(before.minute);
            expect(state.personMinutes).toBeGreaterThanOrEqual(
              before.personMinutes,
            );
            expect(state.present).toEqual(
              expect.arrayContaining([...before.present]),
            );
            expect(new Set(state.present).size).toBe(state.present.length);
            expect(state.present.length).toBeGreaterThanOrEqual(6);
            expect(state.present.length).toBeLessThanOrEqual(8);
            expect(state.progress).toBeGreaterThanOrEqual(0);
            expect(state.progress).toBeLessThanOrEqual(100);
            if (before.turn > 0)
              expect(state.nominatedCuisine).toBe(before.nominatedCuisine);
            expect(state.agreedCuisine !== null).toBe(
              state.ending === 'decision',
            );
            expect(state.turn).toBeLessThanOrEqual(50);
          }
          return state;
        };
        const state = run();
        expect(JSON.stringify(run())).toBe(JSON.stringify(state));
        const result = score(state);
        expect(Number.isInteger(result.total)).toBe(true);
        expect(result.total).toBeGreaterThanOrEqual(0);
        expect(result.total).toBeLessThanOrEqual(1000);
      },
    ),
    { numRuns: 100 },
  );
});

it('exhausts 17 unique families and three callbacks, then ends on two-minute filler without a turn cap', () => {
  const eventRules = {
    ...lunchPack.eventRules,
    arrivalPermissions: [],
    arrivalAttendees: {},
  };
  const pack = {
    ...lunchPack,
    eventRules,
    events: lunchPack.events.map((event) => {
      if (event.id === eventRules.nominationEventId) return event;
      const target = eventRules.callbackTargets[event.id];
      return {
        ...event,
        rarity: 'common' as const,
        negative: false,
        when: {},
        variants: [],
        speaker: 'room' as const,
        responses: [
          lunchChoice(
            'ack',
            {
              minutes: 1,
              ...(target === undefined
                ? {}
                : { callback: { eventId: target, afterTurns: 2 as const } }),
              ...(eventRules.bookingEventIds.includes(event.id)
                ? { bookingEnd: 60 as const }
                : {}),
            },
            target === undefined ? 'ack' : 'park',
          ),
        ],
      };
    }),
  };
  const rules = { ...lunchRules, eventRules };
  let state = initialLunchState('exhaust-lunch');
  while (state.phase === 'running') {
    state = drawEventWith(pack, deepFreeze(state));
    const response = state.current?.responses[0];
    if (response === undefined) throw new Error('fixture');
    state = resolveWithRules(deepFreeze(state), response.id, rules);
    expect(state.turn).toBeLessThanOrEqual(50);
  }
  expect(state).toMatchObject({
    turn: 40,
    minute: 60,
    ending: 'time-expired',
    resolvedCallbackCount: 3,
    agreedCuisine: null,
  });
  expect(state.seenEventIds).toHaveLength(20);
  expect(
    state.log.filter(
      (entry) => entry.type === 'draw' && entry.eventId === pack.filler.id,
    ),
  ).toHaveLength(20);
});
