import { expect, it } from 'vitest';
import { previewWithRules } from './preview';
import { resolveWithRules } from './resolve';
import { previewResponse, resolve } from './index';
import {
  deepFreeze,
  pending,
  fixtureResponse,
  fixtureUtilityRules,
} from './fixtures/transitions';
import type { Response } from './types';

it.each([
  { ...fixtureResponse, technique: 'ack' as const, effect: { minutes: 0 } },
  { ...fixtureResponse, effect: { minutes: 1, bookingEnd: 45 as const } },
  { ...fixtureResponse, effect: { minutes: 1, joins: ['legal'] as const } },
  {
    ...fixtureResponse,
    technique: 'park' as const,
    effect: {
      minutes: 1,
      callback: { eventId: 'support-follow-up', afterTurns: 2 as const },
    },
  },
])(
  'rejects the same malformed context in public preview and resolve',
  (response) => {
    const state = deepFreeze(pending([response]));
    expect(() => previewResponse(state, response)).toThrow();
    expect(() => resolve(state, response.id)).toThrow();
  },
);
it('uses authored Sam/Dev reasons instead of deriving player copy in the engine', () => {
  const sam: Response = {
    ...fixtureResponse,
    id: 'sam',
    requires: { present: ['sam'] },
    disabledReasonKey: 'needs-sam',
  };
  const dev: Response = {
    ...fixtureResponse,
    id: 'dev',
    requires: { present: ['dev'] },
    disabledReasonKey: 'needs-dev',
  };
  const state = deepFreeze(pending([sam, dev], { present: ['priya'] }));
  expect(previewResponse(state, sam)).toEqual({
    enabled: false,
    responseId: 'sam',
    reasonKey: 'needs-sam',
  });
  expect(previewResponse(state, dev)).toEqual({
    enabled: false,
    responseId: 'dev',
    reasonKey: 'needs-dev',
  });
});
it('rejects missing/empty content reasons for conditional responses', () => {
  const { disabledReasonKey, ...base } = fixtureResponse;
  expect(disabledReasonKey).toBeDefined();
  for (const response of [
    { ...base, requires: { present: ['legal'] as const } },
    { ...base, requires: { present: ['sam'] as const }, disabledReasonKey: '' },
  ]) {
    expect(() => previewResponse(pending([response]), response)).toThrow(
      'invalid-response',
    );
  }
});
it('injects renamed fixture arrival, callback and booking IDs without engine changes', () => {
  const rules = {
    ...fixtureUtilityRules,
    eventRules: {
      arrivalAttendees: { 'fixture-arrival': 'legal' as const },
      callbackTargets: { 'fixture-parent': 'fixture-return' },
      bookingEventIds: ['fixture-booking'],
    },
  };
  const join: Response = {
    ...fixtureResponse,
    effect: { minutes: 1, joins: ['legal'] },
  };
  const joinState = deepFreeze(pending([join], {}, { id: 'fixture-arrival' }));
  expect(previewWithRules(joinState, join, rules).enabled).toBe(true);
  expect(resolveWithRules(joinState, join.id, rules).present).toContain(
    'legal',
  );
  const callback: Response = {
    ...fixtureResponse,
    technique: 'park',
    effect: {
      minutes: 1,
      callback: { eventId: 'fixture-return', afterTurns: 2 },
    },
  };
  expect(
    resolveWithRules(
      pending([callback], {}, { id: 'fixture-parent' }),
      callback.id,
      rules,
    ).scheduled,
  ).toEqual([{ eventId: 'fixture-return', dueTurn: 2 }]);
  const booked: Response = {
    ...fixtureResponse,
    effect: { minutes: 1, bookingEnd: 45 },
  };
  expect(
    resolveWithRules(
      pending([booked], {}, { id: 'fixture-booking' }),
      booked.id,
      rules,
    ).bookingEnd,
  ).toBe(45);
});
it('requires pending context for event-dependent preview effects', () => {
  const response: Response = {
    ...fixtureResponse,
    effect: { minutes: 1, joins: ['legal'] },
  };
  const state = pending([response]);
  expect(() => previewResponse({ ...state, current: null }, response)).toThrow(
    'missing-event',
  );
});
