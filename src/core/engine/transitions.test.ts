import { expect, it } from 'vitest';
import fc from 'fast-check';
import { initialState, release, callIt } from './state';
import { resolveWithRules } from './resolve';
import { previewWithRules } from './preview';
import {
  deepFreeze,
  pending,
  fixtureResponse,
  fixtureUtilityRules,
} from './fixtures/transitions';
import type { Response } from './types';

it('preserves clamping, integer cost, nondecreasing clocks and frozen inputs across valid choices and releases', () => {
  const choices = fc.array(
    fc.record({
      minutes: fc.integer({ min: 0, max: 10 }),
      progress: fc.integer({ min: -20, max: 30 }),
      risks: fc.integer({ min: -5, max: 5 }),
      release: fc.boolean(),
    }),
    { minLength: 1, maxLength: 35 },
  );
  fc.assert(
    fc.property(fc.string(), choices, (seed, steps) => {
      const play = () => {
        let state = initialState(seed);
        for (const step of steps) {
          if (state.phase === 'ended') break;
          state = deepFreeze(state);
          const before = JSON.stringify(state);
          if (step.release) {
            const released = release(state, 'gary');
            expect(released.minute).toBe(state.minute);
            expect(released.personMinutes).toBe(state.personMinutes);
            state = released;
          }
          const response: Response = {
            ...fixtureResponse,
            technique: step.minutes === 0 ? 'email' : 'ack',
            effect: {
              minutes: step.minutes,
              progress: step.progress,
              risks: step.risks,
            },
          };
          const current = deepFreeze(pending([response], state));
          const snapshot = JSON.stringify(current);
          const preview = previewWithRules(
            current,
            response,
            fixtureUtilityRules,
          );
          const next = resolveWithRules(
            current,
            response.id,
            fixtureUtilityRules,
          );
          expect(JSON.stringify(current)).toBe(snapshot);
          expect(next.progress).toBeGreaterThanOrEqual(0);
          expect(next.progress).toBeLessThanOrEqual(100);
          expect(next.risks).toBeGreaterThanOrEqual(0);
          expect(next.risks).toBeLessThanOrEqual(5);
          expect(next.minute).toBeGreaterThanOrEqual(state.minute);
          expect(next.personMinutes).toBeGreaterThanOrEqual(
            state.personMinutes,
          );
          expect(Number.isInteger(next.personMinutes)).toBe(true);
          expect(new Set(next.present).size).toBe(next.present.length);
          expect(next.present.length).toBeGreaterThanOrEqual(2);
          expect(next.present.length).toBeLessThanOrEqual(8);
          if (!preview.enabled)
            throw new Error('Generated response unexpectedly disabled');
          expect(next.progress - current.progress).toBe(preview.progressDelta);
          expect(next.risks - current.risks).toBe(preview.risksDelta);
          expect(next.personMinutes - current.personMinutes).toBe(
            preview.personMinutesDelta,
          );
          if (!step.release) expect(JSON.stringify(state)).toBe(before);
          state = next;
        }
        return JSON.stringify(
          state.phase === 'running' ? callIt(state) : state,
        );
      };
      expect(play()).toBe(play());
    }),
    { seed: 41004, numRuns: 150 },
  );
});

it('replays varied multi-choice actions, releases, joins, bookings and callbacks with bounded quality', () => {
  const actions = fc.array(
    fc.record({
      kind: fc.constantFrom('ordinary', 'arrival', 'booking', 'callback'),
      minutes: fc.integer({ min: 0, max: 9 }),
      progress: fc.integer({ min: -10, max: 24 }),
      risks: fc.integer({ min: -1, max: 1 }),
      who: fc.constantFrom(
        'priya',
        'dev',
        'sam',
        'morgan',
        'gary',
        'jordan',
        'legal',
        'vp',
      ),
      release: fc.boolean(),
      second: fc.boolean(),
      decimal: fc.boolean(),
      shortBooking: fc.boolean(),
    }),
    { minLength: 1, maxLength: 35 },
  );
  fc.assert(
    fc.property(fc.string(), actions, (seed, steps) => {
      const play = () => {
        let state = initialState(seed);
        for (const step of steps) {
          if (state.phase === 'ended') break;
          const released = deepFreeze(state);
          if (step.release) state = release(released, step.who);
          let eventId = 'fixture-event';
          let kind: 'substantive' | 'escalation' = 'substantive';
          let extra: Partial<Response['effect']> = {};
          let technique: Response['technique'] =
            step.minutes === 0 ? 'email' : 'ack';
          if (step.kind === 'arrival') {
            const who = (['legal', 'vp'] as const).find(
              (id) =>
                !state.present.includes(id) &&
                !state.releasedAttendeeIds.includes(id),
            );
            if (who !== undefined) {
              eventId = who === 'legal' ? 'legal' : 'vp-joins';
              kind = 'escalation';
              extra = { joins: [who] };
            }
          } else if (step.kind === 'booking') {
            eventId = 'room-booked';
            extra = { bookingEnd: step.shortBooking ? 45 : 60 };
          } else if (step.kind === 'callback' && state.scheduled.length === 0) {
            eventId = 'support-training';
            technique = step.minutes === 0 ? 'email' : 'park';
            extra = {
              callback: { eventId: 'support-follow-up', afterTurns: 2 },
            };
          }
          const first: Response = {
            ...fixtureResponse,
            id: 'first',
            technique,
            effect: {
              minutes: step.minutes,
              progress: step.progress,
              risks: step.risks,
              ...extra,
            },
          };
          const second: Response = {
            ...fixtureResponse,
            id: 'second',
            technique: technique === 'email' ? 'email' : technique,
            effect: {
              minutes: step.minutes,
              progress: step.progress + 1,
              risks: step.risks,
              ...extra,
            },
          };
          const response = step.second ? second : first;
          const current = deepFreeze(
            pending([first, second], state, { id: eventId, kind }),
          );
          const before = JSON.stringify(current);
          const rules = step.decimal
            ? {
                ...fixtureUtilityRules,
                costWeight: 1.2,
                riskWeight: 12,
                costUnit: 6,
              }
            : fixtureUtilityRules;
          const preview = previewWithRules(current, response, rules);
          const next = resolveWithRules(current, response.id, rules);
          expect(JSON.stringify(current)).toBe(before);
          if (!preview.enabled) throw new Error('Unexpected disabled response');
          expect(next.minute - current.minute).toBe(preview.minutesDelta);
          expect(next.personMinutes - current.personMinutes).toBe(
            preview.personMinutesDelta,
          );
          expect(next.progress - current.progress).toBe(preview.progressDelta);
          expect(next.risks - current.risks).toBe(preview.risksDelta);
          expect(next.progress).toBeGreaterThanOrEqual(0);
          expect(next.progress).toBeLessThanOrEqual(100);
          expect(next.risks).toBeGreaterThanOrEqual(0);
          expect(next.risks).toBeLessThanOrEqual(5);
          expect(next.minute).toBeGreaterThanOrEqual(current.minute);
          expect(next.personMinutes).toBeGreaterThanOrEqual(
            current.personMinutes,
          );
          expect(Number.isInteger(next.personMinutes)).toBe(true);
          expect(new Set(next.present).size).toBe(next.present.length);
          expect(next.present).toContain('priya');
          expect(next.present.length).toBeGreaterThanOrEqual(2);
          expect(next.present.length).toBeLessThanOrEqual(8);
          for (const decision of next.decisions)
            if (decision.quality !== null) {
              expect(decision.quality).toBeGreaterThanOrEqual(0);
              expect(decision.quality).toBeLessThanOrEqual(1);
            }
          state = next;
        }
        return JSON.stringify(
          state.phase === 'running' ? callIt(state) : state,
        );
      };
      expect(play()).toBe(play());
    }),
    { seed: 44042, numRuns: 150 },
  );
});
