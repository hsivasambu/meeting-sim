import { describe, expect, it } from 'vitest';
import { initialState, release } from '../src/core/engine/index';
import type { MeetingState, Response } from '../src/core/engine/index';
import { choose, greedy, randomIndex } from './policies';

const base: Response = {
  id: 'a',
  label: 'Fixture',
  technique: 'hear',
  effect: { minutes: 1 },
  line: 'Fixture',
};
function pending(
  responses: readonly Response[],
  state = initialState('fixture'),
  eventId = 'fixture',
): MeetingState {
  return {
    ...state,
    current: {
      id: eventId,
      kind: 'noise',
      rarity: 'common',
      negative: false,
      speaker: 'room',
      line: 'Fixture',
      responses,
    },
  };
}

describe('policy semantics on fixtures', () => {
  it('maximizes preview utility, then lower minutes, then ASCII ID', () => {
    expect(
      greedy(
        pending([
          { ...base, id: 'slow', effect: { minutes: 6, progress: 6 } },
          { ...base, id: 'z', effect: { minutes: 1 } },
          { ...base, id: 'a', effect: { minutes: 1 } },
        ]),
      ).id,
    ).toBe('a');
    expect(
      greedy(
        pending([
          base,
          { ...base, id: 'better', effect: { minutes: 2, progress: 10 } },
        ]),
      ).id,
    ).toBe('better');
  });
  it('uses clamped utility and rechecks expert availability', () => {
    const state = { ...initialState('fixture'), progress: 99, risks: 0 };
    const expert: Response = {
      ...base,
      id: 'expert',
      effect: { minutes: 1, progress: 25 },
      requires: { present: ['sam'] },
      disabledReasonKey: 'sam-absent',
    };
    const cheap: Response = {
      ...base,
      id: 'cheap',
      technique: 'email',
      effect: { minutes: 0, progress: 1 },
    };
    expect(greedy(pending([expert, cheap], state)).id).toBe('cheap');
    expect(
      choose(pending([expert, base], release(state, 'sam')), 'random').id,
    ).toBe('a');
  });
  it('preserves the reservation tie even with the VP present', () => {
    const state = {
      ...initialState('fixture'),
      present: ['priya', 'dev', 'vp'] as const,
    };
    const responses: Response[] = [
      {
        ...base,
        id: 'vp',
        effect: { minutes: 1, bookingEnd: 60 },
        requires: { present: ['vp'] },
        disabledReasonKey: 'vp-absent',
      },
      { ...base, id: 'timebox', effect: { minutes: 1, bookingEnd: 45 } },
      { ...base, id: 'hear', effect: { minutes: 5, bookingEnd: 60 } },
    ];
    expect(greedy(pending(responses, state, 'room-booked')).id).toBe('timebox');
    expect(
      new Set(
        Array.from(
          { length: 100 },
          (_, index) =>
            choose(
              pending(
                responses,
                { ...state, seed: `fixture:${index}` },
                'room-booked',
              ),
              'random',
            ).id,
        ),
      ),
    ).toEqual(new Set(['hear', 'timebox', 'vp']));
  });
  it('has reproducible separate per-turn Random streams and rejects empty pools', () => {
    const first = randomIndex('fixture', 0, 3);
    expect([
      first,
      randomIndex('fixture', 1, 3),
      randomIndex('fixture', 2, 3),
    ]).toEqual([1, 2, 1]);
    expect(randomIndex('fixture', 0, 2147483649)).toBe(2092931182);
    // Turn 1 rejects the first ticket (3370162250) and accepts the second.
    expect(randomIndex('fixture', 1, 2147483649)).toBe(198999524);
    randomIndex('fixture', 19, 3);
    expect(randomIndex('fixture', 0, 3)).toBe(first);
    expect(randomIndex('fixture', 1, 1)).toBe(0);
    expect(() => randomIndex('fixture', 0, 0)).toThrow();
    expect(() => greedy(pending([]))).toThrow('No enabled response');
  });
});
