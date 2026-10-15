import { expect, it, vi } from 'vitest';
import fc from 'fast-check';
import { previewWithRules } from './preview';
import { getResponseOutcomesWithRules, resolveWithRules } from './resolve';
import { previewResponse, getResponseOutcomes, resolve } from './index';
import { responseOutcomes } from './outcomes';
import * as rng from './rng';
import { compareFractions } from './utilityFraction';
import {
  deepFreeze,
  pending,
  fixtureResponse,
  fixtureUtilityRules,
} from './fixtures/transitions';
import {
  lottery,
  steady,
  outcomeRules,
  outcomePending,
} from './fixtures/outcomes';
import type { ExactFraction, OutcomeResponse } from './types';

const exact = (value: ExactFraction) => ({
  numerator: BigInt(value.numerator),
  denominator: BigInt(value.denominator),
});
it.each([
  {
    seed: 'branch-0',
    outcomeId: 'bad',
    progress: 85,
    minute: 66,
    ending: 'time-expired',
  },
  {
    seed: 'branch-2',
    outcomeId: 'good',
    progress: 100,
    minute: 61,
    ending: 'decision',
  },
])(
  'pins seeded branch replay $outcomeId',
  ({ seed, outcomeId, progress, minute, ending }) => {
    const state = deepFreeze(
      outcomePending(undefined, { seed, progress: 95, minute: 59 }),
    );
    const actual = resolveWithRules(state, 'choose', outcomeRules);
    expect(actual).toMatchObject({
      progress,
      minute,
      ending,
      turn: 1,
      parkedCount: 1,
      current: null,
    });
    expect(actual.log[0]).toMatchObject({ type: 'resolve', outcomeId });
    expect(actual.decisions[0]?.quality).toBe(0);
    expect(
      JSON.stringify(resolveWithRules(state, 'choose', outcomeRules)),
    ).toBe(JSON.stringify(actual));
  },
);
it('distinguishes exact expected utilities even when their numeric approximations tie', () => {
  const fractional = {
    ...lottery,
    outcomes: [
      {
        ...steady.outcomes[0],
        id: 'a',
        weight: 65535,
        effect: { minutes: 1, progress: 1 },
      },
      {
        ...steady.outcomes[0],
        id: 'b',
        weight: 1,
        effect: { minutes: 2, progress: 1 },
      },
    ],
  };
  const best = {
    ...steady,
    outcomes: [{ ...steady.outcomes[0], effect: { minutes: 1, progress: 1 } }],
  };
  const state = outcomePending([fractional, best]);
  const rules = { ...outcomeRules, costWeight: 1e-16 };
  const a = previewWithRules(state, fractional, rules);
  const b = previewWithRules(state, best, rules);
  if (!a.enabled || !b.enabled) throw new Error('Disabled fixture');
  expect(a.utility).toBe(b.utility);
  expect(
    compareFractions(
      exact(a.expectedUtilityFraction),
      exact(b.expectedUtilityFraction),
    ),
  ).toBe(-1);
  expect(resolveWithRules(state, 'choose', rules).decisions[0]?.quality).toBe(
    0,
  );
  expect(resolveWithRules(state, 'steady', rules).decisions[0]?.quality).toBe(
    1,
  );
});
it('clamps branches before expectation and reports exact serializable fractions', () => {
  const state = deepFreeze(outcomePending([lottery, steady], { progress: 95 }));
  const before = JSON.stringify(state);
  const preview = previewWithRules(state, lottery, outcomeRules);
  if (!preview.enabled) throw new Error('Disabled fixture');
  expect(
    preview.outcomes.map((branch) => [
      branch.outcomeId,
      branch.progressDelta,
      branch.personMinutesDelta,
    ]),
  ).toEqual([
    ['bad', -10, 42],
    ['good', 5, 12],
  ]);
  expect(preview.progressDelta).toBe(0);
  expect(preview.minutesDelta).toBeCloseTo(11 / 3);
  expect(preview.personMinutesDelta).toBe(22);
  expect(
    compareFractions(exact(preview.expectedUtilityFraction), {
      numerator: -22n,
      denominator: 5n,
    }),
  ).toBe(0);
  expect(preview).not.toHaveProperty('effect');
  expect(preview).not.toHaveProperty('risksDelta');
  expect(JSON.parse(JSON.stringify(preview))).toEqual(preview);
  expect(JSON.stringify(state)).toBe(before);
});
it('enumerates both complete immutable successors without sampling and matches actual seeded resolution', () => {
  const state = deepFreeze(
    outcomePending([lottery, steady], { progress: 95, minute: 59 }),
  );
  const sample = vi.spyOn(rng, 'sampleOutcome');
  const responseStream = vi.spyOn(rng, 'responseRng');
  const before = JSON.stringify(state);
  previewWithRules(state, lottery, outcomeRules);
  const successors = getResponseOutcomesWithRules(
    state,
    'choose',
    outcomeRules,
  );
  expect(sample).not.toHaveBeenCalled();
  expect(responseStream).not.toHaveBeenCalled();
  expect(
    successors.map((branch) => [branch.outcomeId, branch.state.ending]),
  ).toEqual([
    ['bad', 'time-expired'],
    ['good', 'decision'],
  ]);
  expect(
    successors.every(
      (branch) =>
        branch.state.parkedCount === 1 &&
        branch.state.current === null &&
        branch.state.turn === 1,
    ),
  ).toBe(true);
  expect(successors[0]?.state.decisions).toEqual(
    successors[1]?.state.decisions,
  );
  const actual = resolveWithRules(state, 'choose', outcomeRules);
  expect(
    successors.some(
      (branch) => JSON.stringify(branch.state) === JSON.stringify(actual),
    ),
  ).toBe(true);
  expect(sample).toHaveBeenCalledTimes(1);
  expect(JSON.stringify(resolveWithRules(state, 'choose', outcomeRules))).toBe(
    JSON.stringify(actual),
  );
  expect(JSON.stringify(state)).toBe(before);
  sample.mockRestore();
  responseStream.mockRestore();
});
it('preserves legacy resolve bytes and deterministic numeric preview equivalence', () => {
  const legacy = pending([fixtureResponse]);
  const successors = getResponseOutcomesWithRules(
    legacy,
    fixtureResponse.id,
    fixtureUtilityRules,
  );
  expect(successors[0]?.state).toEqual(
    resolveWithRules(legacy, fixtureResponse.id, fixtureUtilityRules),
  );
  expect(successors[0]?.state.log[0]).not.toHaveProperty('outcomeId');
  const deterministic: OutcomeResponse = {
    id: fixtureResponse.id,
    label: fixtureResponse.label,
    technique: fixtureResponse.technique,
    description: 'Fixture equivalent response.',
    outcomes: [
      {
        id: 'done',
        weight: 13,
        effect: fixtureResponse.effect,
        line: fixtureResponse.line,
      },
    ],
  };
  const modern = outcomePending([deterministic]);
  const a = previewWithRules(legacy, fixtureResponse, fixtureUtilityRules);
  const b = previewWithRules(modern, deterministic, fixtureUtilityRules);
  expect(
    a.enabled &&
      b.enabled && [
        a.progressDelta,
        a.minutesDelta,
        a.personMinutesDelta,
        a.utility,
      ],
  ).toEqual(
    b.enabled && [
      b.progressDelta,
      b.minutesDelta,
      b.personMinutesDelta,
      b.utility,
    ],
  );
  expect(
    resolveWithRules(modern, deterministic.id, fixtureUtilityRules).progress,
  ).toBe(
    resolveWithRules(legacy, fixtureResponse.id, fixtureUtilityRules).progress,
  );
});
it('exposes successor enumeration and outcome previews through the public allowlist', () => {
  const state = outcomePending();
  const branches = getResponseOutcomes(state, 'choose');
  const preview = previewResponse(state, lottery);
  expect(preview.enabled && preview.outcomes.length).toBe(2);
  expect(
    branches.some(
      (branch) =>
        JSON.stringify(branch.state) ===
        JSON.stringify(resolve(state, 'choose')),
    ),
  ).toBe(true);
});
it('keeps disabled alternatives out of exact pre-roll quality and scores ties as null', () => {
  const disabled = {
    ...steady,
    id: 'disabled',
    requires: { present: ['legal'] as const },
    disabledReasonKey: 'fixture-needs-legal',
  };
  const state = outcomePending([lottery, disabled]);
  expect(previewWithRules(state, disabled, outcomeRules)).toEqual({
    enabled: false,
    responseId: 'disabled',
    reasonKey: 'fixture-needs-legal',
  });
  expect(
    getResponseOutcomesWithRules(state, 'choose', outcomeRules).every(
      (branch) => branch.state.decisions[0]?.quality === null,
    ),
  ).toBe(true);
  const tied = { ...steady, id: 'tied' };
  expect(
    resolveWithRules(outcomePending([steady, tied]), 'steady', outcomeRules)
      .decisions[0]?.quality,
  ).toBeNull();
  const bad = {
    ...steady,
    id: 'worst',
    outcomes: [
      { ...steady.outcomes[0], effect: { minutes: 5, progress: -10 } },
    ],
  };
  const best = {
    ...steady,
    id: 'best',
    outcomes: [{ ...steady.outcomes[0], effect: { minutes: 1, progress: 20 } }],
  };
  const middle = getResponseOutcomesWithRules(
    outcomePending([bad, lottery, best], { progress: 20 }),
    'choose',
    outcomeRules,
  );
  expect(middle[0]?.state.decisions[0]?.quality).toBeGreaterThan(0);
  expect(middle[0]?.state.decisions[0]?.quality).toBeLessThan(1);
  const fraction = middle[0]?.state.decisions[0]?.qualityFraction;
  if (fraction === undefined || fraction === null)
    throw new Error('Missing quality');
  expect(
    compareFractions(exact(fraction), { numerator: 18n, denominator: 29n }),
  ).toBe(0);
  expect(middle[0]?.state.decisions).toEqual(middle[1]?.state.decisions);
});
it('uses complete branch effects for joins, billing, booking, queues and ending precedence', () => {
  const response = {
    ...lottery,
    outcomes: lottery.outcomes.map((branch) => ({
      ...branch,
      effect: {
        ...branch.effect,
        joins: ['legal'] as const,
        bookingEnd: 45 as const,
        callback: { eventId: 'later', afterTurns: 2 as const },
      },
    })),
  };
  const state = outcomePending([response], { minute: 44, progress: 95 });
  const rules = {
    ...outcomeRules,
    eventRules: {
      arrivalAttendees: { 'fixture-event': 'legal' as const },
      bookingEventIds: ['fixture-event'],
      callbackTargets: { 'fixture-event': 'later' },
    },
  };
  const branches = getResponseOutcomesWithRules(state, 'choose', rules);
  expect(branches.map((branch) => branch.state.personMinutes)).toEqual([
    42, 12,
  ]);
  for (const branch of branches) {
    expect(branch.state.present).toHaveLength(7);
    expect(branch.state.peakHeadcount).toBe(7);
    expect(branch.state.scheduled).toEqual([{ eventId: 'later', dueTurn: 2 }]);
    expect(branch.state.log[1]).toMatchObject({ type: 'join', who: 'legal' });
  }
  expect(branches.map((branch) => branch.state.ending)).toEqual([
    'time-expired',
    'decision',
  ]);
});
it.each([
  { ...lottery, outcomes: [] },
  { ...lottery, outcomes: [...lottery.outcomes, steady.outcomes[0]] },
  { ...lottery, outcomes: [lottery.outcomes[0], lottery.outcomes[0]] },
  { ...lottery, outcomes: [{ ...lottery.outcomes[0], id: 'Non-ASCII-é' }] },
  { ...lottery, outcomes: [{ ...lottery.outcomes[0], weight: 0 }] },
  { ...lottery, outcomes: [{ ...lottery.outcomes[0], weight: 1.5 }] },
  {
    ...lottery,
    outcomes: [{ ...lottery.outcomes[0], weight: Number.MAX_SAFE_INTEGER + 1 }],
  },
  { ...lottery, outcomes: [{ ...lottery.outcomes[0], weight: 65537 }] },
  {
    ...lottery,
    outcomes: lottery.outcomes.map((branch) => ({ ...branch, weight: 40000 })),
  },
  { ...lottery, description: '' },
  { ...lottery, description: 'a'.repeat(91) },
  { ...lottery, outcomes: [{ ...lottery.outcomes[0], line: '' }] },
  { ...lottery, outcomes: [{ ...lottery.outcomes[0], line: 'a'.repeat(91) }] },
  { ...lottery, outcomes: [{ ...lottery.outcomes[0], requires: {} }] },
])('rejects malformed outcome schemas before sampling %#', (response) => {
  expect(() => responseOutcomes(response)).toThrow('invalid-response');
});
it('rejects shared effects, invalid effects and actions before creating a response stream', () => {
  const stream = vi.spyOn(rng, 'responseRng');
  expect(() =>
    responseOutcomes({ ...lottery, effect: { minutes: 1 }, line: 'shared' }),
  ).toThrow('invalid-response');
  for (const effect of [
    { minutes: 0 },
    { minutes: 11 },
    { minutes: 1.5 },
    { minutes: 1, progress: 26 },
    { minutes: 1, progress: -11 },
    { minutes: 1, risks: NaN },
    { minutes: 1, joins: ['legal'] as const },
    { minutes: 1, callback: { eventId: 'unknown', afterTurns: 2 as const } },
  ]) {
    const response = {
      ...lottery,
      outcomes: [{ ...lottery.outcomes[0], effect }],
    };
    expect(() =>
      resolveWithRules(outcomePending([response]), 'choose', outcomeRules),
    ).toThrow();
  }
  expect(() =>
    resolveWithRules(outcomePending(), 'missing', outcomeRules),
  ).toThrow('unknown-response');
  expect(() =>
    resolveWithRules(
      outcomePending([], { phase: 'ended' }),
      'choose',
      outcomeRules,
    ),
  ).toThrow('ended');
  expect(() =>
    getResponseOutcomesWithRules(
      { ...outcomePending(), current: null },
      'choose',
      outcomeRules,
    ),
  ).toThrow('missing-event');
  expect(() =>
    getResponseOutcomesWithRules(
      outcomePending([lottery, lottery]),
      'choose',
      outcomeRules,
    ),
  ).toThrow('unknown-response');
  const disabled = {
    ...lottery,
    requires: { present: ['legal'] as const },
    disabledReasonKey: 'fixture-disabled',
  };
  expect(() =>
    resolveWithRules(outcomePending([disabled]), 'choose', outcomeRules),
  ).toThrow('disabled-response');
  expect(() =>
    previewWithRules(
      outcomePending(),
      { ...disabled, disabledReasonKey: '' },
      outcomeRules,
    ),
  ).toThrow('invalid-response');
  expect(stream).not.toHaveBeenCalled();
  stream.mockRestore();
});
it('replays JSON states, clamps independently and never mutates arbitrary frozen inputs', () => {
  fc.assert(
    fc.property(
      fc.string(),
      fc.integer({ min: 0, max: 100 }),
      fc.integer({ min: 0, max: 60 }),
      (seed, progress, minute) => {
        const state = deepFreeze(
          outcomePending([lottery, steady], { seed, progress, minute }),
        );
        const before = JSON.stringify(state);
        const branches = getResponseOutcomesWithRules(
          state,
          'choose',
          outcomeRules,
        );
        const actual = resolveWithRules(state, 'choose', outcomeRules);
        const replay: typeof state = JSON.parse(before);
        expect(
          JSON.stringify(resolveWithRules(replay, 'choose', outcomeRules)),
        ).toBe(JSON.stringify(actual));
        expect(
          branches.some(
            (branch) => JSON.stringify(branch.state) === JSON.stringify(actual),
          ),
        ).toBe(true);
        expect(
          branches.every(
            (branch) =>
              branch.state.progress >= 0 &&
              branch.state.progress <= 100 &&
              branch.state.minute >= minute &&
              branch.state.personMinutes >= state.personMinutes,
          ),
        ).toBe(true);
        expect(JSON.stringify(state)).toBe(before);
      },
    ),
    { seed: 30304, numRuns: 100 },
  );
});
