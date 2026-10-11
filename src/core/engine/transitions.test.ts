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
