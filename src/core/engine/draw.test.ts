import { describe, expect, it, vi } from 'vitest';
import fc from 'fast-check';
import { drawEventWith, getDrawCandidatesWith } from './draw';
import { fixturePack, fixtureState } from './fixtures/packs';
import { deepFreeze } from './fixtures/transitions';
import { callIt, initialState, release } from './state';
import { resolveWithRules } from './resolve';
import { drawRng } from './rng';
import * as drawStream from './rng';
import { selectWeightedEvent } from './weighted';
import { EngineError } from './errors';
import type { ContentPack, MeetingEvent, MeetingState } from './types';

const weights = { common: 5, uncommon: 3, rare: 2 } as const;
const rules = {
  costWeight: 2,
  riskWeight: 3,
  costUnit: 4,
  eventRules: fixturePack.eventRules,
};
const later: MeetingState = {
  ...fixtureState,
  turn: 2,
  substantiveDrawCount: 2,
};
const ack = fixturePack.filler.responses;
function event(id: string, extra: Partial<MeetingEvent> = {}): MeetingEvent {
  return {
    id,
    kind: 'noise',
    rarity: 'common',
    speaker: 'room',
    line: 'Synthetic draw.',
    responses: ack,
    ...extra,
  };
}
function pack(events: readonly MeetingEvent[]): ContentPack {
  return { ...fixturePack, events };
}

describe('draw eligibility and presentation', () => {
  it('uses no RNG for candidate lookup, pending draws, callbacks or filler', () => {
    const spy = vi.spyOn(drawStream, 'drawRng');
    try {
      getDrawCandidatesWith(fixturePack, fixtureState, weights);
      const drawn = drawEventWith(fixturePack, fixtureState, weights);
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockClear();
      getDrawCandidatesWith(fixturePack, drawn, weights);
      drawEventWith(fixturePack, drawn, weights);
      drawEventWith(pack([]), later, weights);
      const due = {
        ...later,
        seenEventIds: ['support-training'],
        scheduled: [{ eventId: 'support-follow-up', dueTurn: 2 }],
      };
      getDrawCandidatesWith(fixturePack, due, weights);
      drawEventWith(fixturePack, due, weights);
      expect(spy).not.toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });
  it('forces two unseen substantive families before other kinds; counter is authoritative', () => {
    let state = initialState('first-two');
    for (let n = 0; n < 2; n++) {
      expect(
        getDrawCandidatesWith(fixturePack, state, weights).every(
          (c) => c.event.kind === 'substantive',
        ),
      ).toBe(true);
      state = drawEventWith(fixturePack, deepFreeze(state), weights);
      expect(state.substantiveDrawCount).toBe(n + 1);
      state = resolveWithRules(
        state,
        state.current?.responses[0]?.id ?? 'missing',
        rules,
      );
    }
    expect(
      getDrawCandidatesWith(fixturePack, { ...state, log: [] }, weights).map(
        (c) => c.event.id,
      ),
    ).toEqual(['fixture-gamma']);
  });
  it('throws a typed content error rather than filler for an impossible opening', () => {
    for (const state of [
      fixtureState,
      {
        ...fixtureState,
        substantiveDrawCount: 1,
        seenEventIds: ['support-training', 'fixture-beta'],
      },
    ]) {
      expect(() => drawEventWith(pack([]), state, weights)).toThrow(
        new EngineError('invalid-pool'),
      );
      expect(() => getDrawCandidatesWith(pack([]), state, weights)).toThrow(
        new EngineError('invalid-pool'),
      );
    }
  });
  it('filters conditions inclusively, unseen families, callback kinds and uncommon negatives', () => {
    const content = pack([
      event('seen'),
      event('eligible', {
        when: {
          minMinute: 15,
          maxMinute: 15,
          minRisks: 2,
          maxRisks: 2,
          present: ['sam'],
          absent: ['vp'],
        },
      }),
      event('too-late', { when: { minMinute: 16 } }),
      event('missing', { when: { present: ['vp'] } }),
      event('bad', { rarity: 'uncommon', negative: true }),
      event('good', { rarity: 'uncommon' }),
      event('common-negative', { negative: true }),
      event('rare-negative', { rarity: 'rare', negative: true }),
      event('scheduled-only', { kind: 'callback' }),
    ]);
    const state = {
      ...later,
      minute: 15,
      risks: 2,
      seenEventIds: ['seen'],
      previousDrawWasUncommonNegative: true,
    };
    expect(
      getDrawCandidatesWith(content, state, weights).map((c) => c.event.id),
    ).toEqual(['common-negative', 'eligible', 'good', 'rare-negative']);
    expect(
      getDrawCandidatesWith(
        content,
        { ...state, previousDrawWasUncommonNegative: false },
        weights,
      ).some((c) => c.event.id === 'bad'),
    ).toBe(true);
  });
  it('uses ASCII weighted distribution and the exact per-turn stream regardless of pack order', () => {
    const events = [
      event('z', { rarity: 'rare', weight: 3 }),
      event('A'),
      event('a', { rarity: 'uncommon', weight: 2 }),
    ];
    const content = pack(events);
    expect(
      getDrawCandidatesWith(content, deepFreeze(later), weights).map((c) => [
        c.event.id,
        c.probability,
      ]),
    ).toEqual([
      ['A', 5 / 17],
      ['a', 6 / 17],
      ['z', 6 / 17],
    ]);
    fc.assert(
      fc.property(fc.string(), fc.nat({ max: 100 }), (seed, turn) => {
        const state = { ...later, seed, turn };
        const expected = selectWeightedEvent(
          events,
          drawRng(seed, turn),
          weights,
        );
        expect(drawEventWith(content, state, weights).current?.id).toBe(
          expected.id,
        );
        expect(
          drawEventWith(pack([...events].reverse()), state, weights),
        ).toEqual(drawEventWith(content, state, weights));
      }),
      { numRuns: 100 },
    );
  });
  it('selects the first matching variant and preserves family metadata only', () => {
    const content = pack([
      event('variants', {
        kind: 'substantive',
        rarity: 'rare',
        negative: true,
        weight: 4,
        variants: [
          {
            when: { absent: ['sam'] },
            speaker: 'priya',
            line: 'First absence.',
            responses: ack,
          },
          { when: {}, speaker: 'room', line: 'Later match.', responses: ack },
        ],
      }),
    ]);
    const state = release(initialState('variants'), 'sam');
    expect(drawEventWith(content, deepFreeze(state), weights).current).toEqual({
      id: 'variants',
      kind: 'substantive',
      rarity: 'rare',
      negative: true,
      speaker: 'priya',
      line: 'First absence.',
      responses: ack,
    });
  });
  it('marks heard speakers on draw and keeps pending presentation fixed through release', () => {
    const content = pack([
      event('gary-event', {
        speaker: 'gary',
        variants: [
          {
            when: { absent: ['gary'] },
            speaker: 'priya',
            line: 'Absent.',
            responses: ack,
          },
        ],
      }),
    ]);
    const state = drawEventWith(content, later, weights);
    expect(state.spokenAttendeeIds).toEqual(['gary']);
    const released = deepFreeze(release(state, 'gary'));
    const again = drawEventWith(content, released, weights);
    expect(again).toEqual(released);
    expect(again).not.toBe(released);
    expect(getDrawCandidatesWith(content, released, weights)).toEqual([
      { event: released.current, probability: 1 },
    ]);
    expect(again.current?.speaker).toBe('gary');
  });
  it('does not duplicate seen/heard counters; room is not an attendee; filler repeats', () => {
    const content = pack([]);
    let state: MeetingState = { ...later, spokenAttendeeIds: ['priya'] };
    for (let n = 0; n < 3; n++) {
      const drawn = drawEventWith(content, deepFreeze(state), weights);
      expect(drawn.current?.id).toBe('filler');
      expect(drawn.seenEventIds).toEqual([]);
      expect(drawn.spokenAttendeeIds).toEqual(['priya']);
      expect(drawn.previousDrawWasUncommonNegative).toBe(false);
      expect(
        getDrawCandidatesWith(content, state, weights)[0]?.probability,
      ).toBe(1);
      state = resolveWithRules(drawn, 'ack', rules);
    }
    const drawn = drawEventWith(
      pack([event('repeat-speaker', { speaker: 'priya' })]),
      state,
      weights,
    );
    expect(drawn.spokenAttendeeIds).toEqual(['priya']);
  });
  it('rejects ended draws; ended candidates are empty even with pending narrative', () => {
    const ended = deepFreeze(
      callIt(drawEventWith(fixturePack, fixtureState, weights)),
    );
    expect(getDrawCandidatesWith(fixturePack, ended, weights)).toEqual([]);
    expect(() => drawEventWith(fixturePack, ended, weights)).toThrow(
      new EngineError('ended'),
    );
  });
});

describe('callback scheduler', () => {
  it('schedules n+2 before advancement, delivers after one intervening event, and removes only the due entry', () => {
    const content = pack([
      fixturePack.events[0],
      event('intervening', { kind: 'substantive' }),
    ]);
    const first = drawEventWith(
      content,
      { ...fixtureState, seenEventIds: ['intervening'] },
      weights,
    );
    const scheduled = resolveWithRules(first, 'park', rules);
    expect(scheduled.scheduled).toEqual([
      { eventId: 'support-follow-up', dueTurn: 2 },
    ]);
    const intervening = drawEventWith(
      content,
      { ...scheduled, seenEventIds: ['support-training'] },
      weights,
    );
    expect(intervening.current?.id).toBe('intervening');
    const due = resolveWithRules(intervening, 'ack', rules);
    expect(
      getDrawCandidatesWith(content, due, weights).map((c) => [
        c.event.id,
        c.probability,
      ]),
    ).toEqual([['support-follow-up', 1]]);
    const callback = drawEventWith(content, deepFreeze(due), weights);
    expect(callback.current?.kind).toBe('callback');
    expect(callback.scheduled).toEqual([]);
    expect(callback.seenEventIds).toContain('support-follow-up');
    expect(callback.previousDrawWasUncommonNegative).toBe(false);
    expect(callback.turn).toBe(2);
  });
  it('forces callbacks ahead of random filtering, selects absence variants and preserves future entries', () => {
    const second = event('second-return', { kind: 'callback' });
    const content: ContentPack = {
      ...fixturePack,
      eventRules: {
        ...fixturePack.eventRules,
        callbackTargets: {
          ...fixturePack.eventRules.callbackTargets,
          'second-parent': 'second-return',
        },
      },
      events: [...fixturePack.events, event('second-parent')],
      callbacks: [
        {
          ...fixturePack.callbacks[0],
          speaker: 'sam',
          variants: [
            {
              when: { absent: ['sam'] },
              speaker: 'priya',
              line: 'Callback without Sam.',
              responses: ack,
            },
          ],
        },
        second,
      ],
    };
    const state = {
      ...release(later, 'sam'),
      seenEventIds: ['support-training', 'second-parent'],
      previousDrawWasUncommonNegative: true,
      scheduled: [
        { eventId: 'support-follow-up', dueTurn: 2 },
        { eventId: 'second-return', dueTurn: 3 },
      ],
    };
    const drawn = drawEventWith(content, deepFreeze(state), weights);
    expect(drawn.current?.line).toBe('Callback without Sam.');
    expect(drawn.scheduled).toEqual([{ eventId: 'second-return', dueTurn: 3 }]);
    expect(drawn.substantiveDrawCount).toBe(2);
    expect(getDrawCandidatesWith(content, callIt(drawn), weights)).toEqual([]);
  });
  it.each([
    [
      { eventId: 'support-follow-up', dueTurn: 2 },
      { eventId: 'support-follow-up', dueTurn: 3 },
    ],
    [
      { eventId: 'support-follow-up', dueTurn: 2 },
      { eventId: 'unknown', dueTurn: 2 },
    ],
    [{ eventId: 'unknown', dueTurn: 4 }],
    [{ eventId: 'support-follow-up', dueTurn: 1 }],
    [{ eventId: 'support-follow-up', dueTurn: 2.5 }],
    [{ eventId: 'support-follow-up', dueTurn: 5 }],
    [{ eventId: 'support-follow-up', dueTurn: 40 }],
    [{ eventId: 'support-follow-up', dueTurn: 1000000 }],
  ])(
    'rejects invalid schedules without delaying or discarding them: %j',
    (...scheduled) => {
      const state = deepFreeze({
        ...later,
        seenEventIds: ['support-training'],
        scheduled,
      });
      expect(() => drawEventWith(fixturePack, state, weights)).toThrow(
        new EngineError('invalid-schedule'),
      );
      expect(() => getDrawCandidatesWith(fixturePack, state, weights)).toThrow(
        new EngineError('invalid-schedule'),
      );
    },
  );
  it('rejects already-seen targets and malformed callback definitions', () => {
    const state = {
      ...later,
      seenEventIds: ['support-training'],
      scheduled: [{ eventId: 'support-follow-up', dueTurn: 2 }],
    };
    expect(() =>
      drawEventWith(
        fixturePack,
        { ...state, seenEventIds: ['support-follow-up'] },
        weights,
      ),
    ).toThrow(new EngineError('invalid-schedule'));
    for (const callbacks of [
      [],
      [fixturePack.callbacks[0], fixturePack.callbacks[0]],
      [{ ...fixturePack.callbacks[0], when: {} }],
      [{ ...fixturePack.callbacks[0], kind: 'noise' as const }],
      [{ ...fixturePack.callbacks[0], rarity: 'rare' as const }],
      [{ ...fixturePack.callbacks[0], negative: true }],
    ]) {
      expect(() =>
        getDrawCandidatesWith({ ...fixturePack, callbacks }, state, weights),
      ).toThrow(new EngineError('invalid-schedule'));
    }
  });
  it('rejects orphan, ambiguous and nonexistent callback parents using counters, not logs', () => {
    const state = deepFreeze({
      ...later,
      scheduled: [{ eventId: 'support-follow-up', dueTurn: 3 }],
    });
    const orphan = {
      ...state,
      log: [
        {
          type: 'draw' as const,
          turn: 0,
          minute: 0,
          eventId: 'support-training',
          speaker: 'sam' as const,
        },
      ],
    };
    expect(() => drawEventWith(fixturePack, orphan, weights)).toThrow(
      new EngineError('invalid-schedule'),
    );
    expect(() => getDrawCandidatesWith(fixturePack, orphan, weights)).toThrow(
      new EngineError('invalid-schedule'),
    );
    const seen = { ...state, seenEventIds: ['support-training'] };
    for (const content of [
      { ...fixturePack, events: [] },
      {
        ...fixturePack,
        eventRules: { ...fixturePack.eventRules, callbackTargets: {} },
      },
      {
        ...fixturePack,
        eventRules: {
          ...fixturePack.eventRules,
          callbackTargets: {
            'support-training': 'support-follow-up',
            'fixture-beta': 'support-follow-up',
          },
        },
      },
    ]) {
      expect(() => drawEventWith(content, seen, weights)).toThrow(
        new EngineError('invalid-schedule'),
      );
      expect(() => getDrawCandidatesWith(content, seen, weights)).toThrow(
        new EngineError('invalid-schedule'),
      );
    }
  });
});
