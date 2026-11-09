import { describe, expect, it } from 'vitest';
import { initialState } from '../src/core/engine/index';
import type { Effect, MeetingState, Response } from '../src/core/engine/index';
import { choose, greedy, randomIndex } from './policies';

function response(id: string, effect: Effect): Response {
  return {
    id,
    label: 'Fixture',
    technique: 'hear',
    description: 'Fixture tradeoff.',
    outcomes: [{ id: 'done', weight: 1, effect, line: 'Fixture outcome.' }],
  };
}

function pending(
  responses: readonly Response[],
  overrides: Partial<MeetingState> = {},
  id = 'fixture',
): MeetingState {
  return {
    ...initialState('fixture'),
    nominatedCuisine: 'thai',
    ...overrides,
    current: {
      id,
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
  it('maximizes expected utility, then lower expected minutes, then ASCII ID', () => {
    const a = response('a', { minutes: 1 });
    const slow = response('slow', { minutes: 6, progress: 6 });
    expect(greedy(pending([slow, { ...a, id: 'z' }, a])).id).toBe('a');
    const lottery = {
      ...slow,
      outcomes: [
        {
          id: 'good',
          weight: 1,
          effect: { minutes: 1, progress: 25 },
          line: 'Advance.',
        },
        {
          id: 'bad',
          weight: 9,
          effect: { minutes: 6, progress: -10 },
          line: 'Setback.',
        },
      ],
    };
    expect(greedy(pending([lottery, a], { progress: 20 })).id).toBe('a');
  });

  it('uses branch clamping and checks enabled choices in authored order', () => {
    const high = response('high', { minutes: 2, progress: 25 });
    const cheap = response('cheap', { minutes: 1, progress: 1 });
    expect(greedy(pending([high, cheap], { progress: 99 })).id).toBe('cheap');
    const disabled = {
      ...high,
      requires: { present: ['vp'] as const },
      disabledReasonKey: 'pat-absent',
    };
    expect(choose(pending([disabled, cheap]), 'random')).toBe(cheap);
  });

  it('preserves the reservation tie even with Pat present', () => {
    const present = [...initialState('fixture').present, 'vp'] as const;
    const responses = [
      {
        ...response('vp', { minutes: 1, bookingEnd: 60 }),
        requires: { present: ['vp'] as const },
        disabledReasonKey: 'pat-absent',
      },
      response('timebox', { minutes: 1, bookingEnd: 45 }),
      response('hear', { minutes: 5, bookingEnd: 60 }),
    ];
    expect(greedy(pending(responses, { present }, 'room-booked')).id).toBe(
      'timebox',
    );
    expect(
      new Set(
        Array.from(
          { length: 100 },
          (_, index) =>
            choose(
              pending(
                responses,
                { present, seed: `fixture:${index}` },
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
