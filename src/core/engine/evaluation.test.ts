import { expect, it } from 'vitest';
import { applyEffect } from './applyEffect';
import { value } from './value';
import { previewWithRules } from './preview';
import { EngineError } from './errors';
import { fixtureState } from './fixtures/packs';
import {
  deepFreeze,
  fixtureResponse,
  fixtureUtilityRules,
} from './fixtures/transitions';
import type { Effect, Response } from './types';

it('uses effective clamped deltas and full pre-join person-minutes without side effects', () => {
  const state = deepFreeze({
    ...fixtureState,
    progress: 95,
    risks: 0,
    minute: 59,
  });
  const response: Response = {
    ...fixtureResponse,
    effect: { minutes: 10, progress: 20, risks: -4, joins: ['legal'] },
  };
  const before = JSON.stringify(state);
  const result = applyEffect(state, response.effect);
  const preview = previewWithRules(state, response, fixtureUtilityRules);
  expect(result).toMatchObject({
    progressDelta: 5,
    risksDelta: 0,
    minutesDelta: 10,
    personMinutesDelta: 60,
  });
  expect(result.state).toMatchObject({
    progress: 100,
    risks: 0,
    minute: 69,
    personMinutes: 60,
    peakHeadcount: 7,
  });
  expect(preview).toMatchObject({
    enabled: true,
    progressDelta: 5,
    risksDelta: 0,
    personMinutesDelta: 60,
    utility: -25,
  });
  expect(value(state, response, fixtureUtilityRules)).toBe(-25);
  expect(JSON.stringify(state)).toBe(before);
  expect(result.state.log).toEqual(state.log);
  expect(result.state.turn).toBe(0);
  expect(result.state.scheduled).toEqual([]);
  expect(result.state.phase).toBe('running');
});
it('clamps negative progress and high risk in the single shared effect helper', () => {
  const state = deepFreeze({ ...fixtureState, progress: 2, risks: 4 });
  expect(
    applyEffect(state, { minutes: 0, progress: -20, risks: 3 }),
  ).toMatchObject({ progressDelta: -2, risksDelta: 1 });
});
it('returns a disabled preview and throws on disabled internal valuation', () => {
  const response: Response = {
    ...fixtureResponse,
    requires: { present: ['legal'] },
  };
  expect(previewWithRules(fixtureState, response, fixtureUtilityRules)).toEqual(
    { enabled: false, responseId: 'choose', reasonKey: 'requirements-not-met' },
  );
  expect(() => value(fixtureState, response, fixtureUtilityRules)).toThrow(
    'disabled-response',
  );
});
it.each([
  { minutes: -1 },
  { minutes: 11 },
  { minutes: 0.5 },
  { minutes: NaN },
  { minutes: 1, progress: Infinity },
  { minutes: 1, risks: 0.5 },
])('rejects malformed effect %j without mutation', (effect) => {
  expect(() => applyEffect(deepFreeze(fixtureState), effect)).toThrow(
    EngineError,
  );
});
it.each([
  {
    present: ['priya', 'legal'] as const,
    joins: ['legal'] as const,
    releasedAttendeeIds: [],
  },
  {
    present: ['priya'] as const,
    joins: ['vp', 'vp'] as const,
    releasedAttendeeIds: [],
  },
  {
    present: ['priya'] as const,
    joins: ['gary'] as const,
    releasedAttendeeIds: [],
  },
  {
    present: ['priya'] as const,
    joins: ['legal'] as const,
    releasedAttendeeIds: ['legal'] as const,
  },
  {
    present: [
      'priya',
      'dev',
      'sam',
      'morgan',
      'gary',
      'jordan',
      'legal',
      'vp',
    ] as const,
    joins: ['legal'] as const,
    releasedAttendeeIds: [],
  },
])(
  'rejects duplicate, unapproved, released or over-capacity joins',
  ({ present, joins, releasedAttendeeIds }) => {
    expect(() =>
      applyEffect(
        { ...fixtureState, present, releasedAttendeeIds },
        { minutes: 1, joins },
      ),
    ).toThrow('invalid-join');
  },
);
it('rejects invalid booking and unsafe accumulated time/cost', () => {
  expect(() =>
    applyEffect(fixtureState, {
      minutes: 1,
      bookingEnd: 99,
    } as unknown as Effect),
  ).toThrow('invalid-effect');
  expect(() =>
    applyEffect(
      { ...fixtureState, minute: Number.MAX_SAFE_INTEGER },
      { minutes: 1 },
    ),
  ).toThrow('invalid-effect');
  expect(() =>
    applyEffect(
      { ...fixtureState, personMinutes: Number.MAX_SAFE_INTEGER },
      { minutes: 1 },
    ),
  ).toThrow('invalid-effect');
});
