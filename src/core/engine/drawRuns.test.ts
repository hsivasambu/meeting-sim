import { expect, it } from 'vitest';
import fc from 'fast-check';
import { drawEventWith, getDrawCandidatesWith } from './draw';
import { deepFreeze } from './fixtures/transitions';
import { initialState, release, callIt } from './state';
import { resolveWithRules } from './resolve';
import { score } from './score';
import { fixturePack } from './fixtures/packs';
import { previewWithRules } from './preview';
import { matchesCondition } from './conditions';
import { validateContent } from './contentValidation';
import type {
  ContentPack,
  MeetingEvent,
  MeetingState,
  Response,
} from './types';

const weights = { common: 5, uncommon: 3, rare: 2 } as const;
const targets = ['return-00', 'return-01', 'return-02'];
const callbackTargets: Readonly<Record<string, string>> = {
  'issue-00': 'return-00',
  'issue-01': 'return-01',
  'issue-02': 'return-02',
};
const events: readonly MeetingEvent[] = Array.from(
  { length: 17 },
  (_, index) => {
    const id = 'issue-' + String(index).padStart(2, '0');
    const target = callbackTargets[id];
    const email: Response = {
      id: 'email',
      label: 'Fixture zero-minute path',
      technique: 'email',
      effect:
        target === undefined
          ? { minutes: 0 }
          : { minutes: 0, callback: { eventId: target, afterTurns: 2 } },
      line: 'Fixture deferred.',
    };
    return {
      id,
      kind: index < 2 ? 'substantive' : 'noise',
      rarity: index < 2 ? 'common' : index % 3 === 0 ? 'uncommon' : 'rare',
      negative: index >= 2 && index % 3 === 0,
      speaker: 'room',
      line: 'Fixture issue.',
      responses: [
        email,
        {
          id: 'forward',
          label: 'Fixture progress',
          technique: 'timebox',
          effect: { minutes: 3, progress: 12, risks: 1 },
          line: 'Fixture forward.',
        },
        {
          id: 'back',
          label: 'Fixture setback',
          technique: 'hear',
          effect: { minutes: 1, progress: -10, risks: -1 },
          line: 'Fixture back.',
        },
      ],
    };
  },
);
const callbacks: readonly MeetingEvent[] = targets.map((id) => ({
  id,
  kind: 'callback',
  rarity: 'common',
  speaker: 'sam',
  line: 'Fixture callback with expert.',
  responses: [
    {
      id: 'ack',
      label: 'Fixture callback acknowledgement',
      technique: 'ack',
      effect: { minutes: 1 },
      line: 'Fixture delivered.',
    },
  ],
  variants: [
    {
      when: { absent: ['sam'] },
      speaker: 'priya',
      line: 'Fixture callback without expert.',
      responses: [
        {
          id: 'ack',
          label: 'Fixture absent acknowledgement',
          technique: 'ack',
          effect: { minutes: 1 },
          line: 'Fixture absent delivered.',
        },
      ],
    },
  ],
}));
const content: ContentPack = deepFreeze({
  eventRules: { arrivalAttendees: {}, bookingEventIds: [], callbackTargets },
  events,
  callbacks,
  filler: fixturePack.filler,
});
const rules = {
  costWeight: 2,
  riskWeight: 3,
  costUnit: 4,
  eventRules: content.eventRules,
};

// Unrestricted opening families remain available; later families exercise conjunctions.
const scenarioContent: ContentPack = deepFreeze({
  ...content,
  events: content.events.map((event, index) => ({
    ...event,
    speaker: 'sam',
    when:
      index === 3
        ? { present: ['gary'] }
        : index === 4
          ? { absent: ['sam'] }
          : index === 5
            ? { minMinute: 3 }
            : index === 6
              ? { minRisks: 1, maxRisks: 3 }
              : index === 7
                ? { maxMinute: 20 }
                : {},
    responses: event.responses.map((response) =>
      response.id === 'forward'
        ? {
            ...response,
            requires: { present: ['sam'] },
            disabledReasonKey: 'fixture-needs-sam',
          }
        : response,
    ),
    variants: [
      {
        when: { absent: ['sam'] },
        speaker: 'priya',
        line: 'Fixture issue without Sam.',
        responses: event.responses.map((response) =>
          response.id === 'forward'
            ? { ...response, effect: { ...response.effect, progress: 6 } }
            : response,
        ),
      },
    ],
  })),
});

function run(
  seed: string,
  picks: readonly number[],
  zeroOnly: boolean,
): MeetingState {
  let state = initialState(seed);
  const pack = zeroOnly ? content : scenarioContent;
  for (let step = 0; step < 50 && state.phase === 'running'; step++) {
    const pick = picks[step % Math.max(picks.length, 1)] ?? 0;
    if (pick % 5 === 0) state = release(deepFreeze(state), 'sam');
    if (pick % 7 === 0) state = release(deepFreeze(state), 'gary');
    const before = deepFreeze(state);
    const due = before.scheduled.find((entry) => entry.dueTurn === before.turn);
    const candidates = getDrawCandidatesWith(pack, before, weights);
    const drawn = drawEventWith(pack, before, weights);
    const event = drawn.current;
    if (event === null) throw new Error('Draw must present an event');
    expect(
      candidates.some((candidate) => candidate.event.id === event.id),
    ).toBe(true);
    expect(
      candidates.reduce((sum, candidate) => sum + candidate.probability, 0),
    ).toBeCloseTo(1, 12);
    expect(drawEventWith(pack, deepFreeze(drawn), weights)).toEqual(drawn);
    for (const candidate of zeroOnly ? [] : candidates) {
      const family = pack.events.find(
        (entry) => entry.id === candidate.event.id,
      );
      if (family !== undefined)
        expect(matchesCondition(before, family.when)).toBe(true);
      expect(
        candidate.event.speaker === 'room' ||
          before.present.includes(candidate.event.speaker),
      ).toBe(true);
    }
    if (due !== undefined) expect(event.id).toBe(due.eventId);
    else if (before.substantiveDrawCount < 2)
      expect(event.kind).toBe('substantive');
    expect(
      before.previousDrawWasUncommonNegative &&
        event.rarity === 'uncommon' &&
        event.negative,
    ).toBe(false);
    if (event.id !== 'filler')
      expect(before.seenEventIds).not.toContain(event.id);
    let pending = drawn;
    if (!zeroOnly && pick % 3 === 1)
      pending = release(deepFreeze(pending), 'sam');
    if (!zeroOnly && pick % 4 === 1)
      pending = release(deepFreeze(pending), 'gary');
    expect(pending.current).toBe(event);
    if (pending !== drawn) {
      // The unchanged pending state was already checked above; recheck after every release.
      expect(drawEventWith(pack, deepFreeze(pending), weights)).toEqual(
        pending,
      );
      expect(getDrawCandidatesWith(pack, pending, weights)).toEqual([
        { event, probability: 1 },
      ]);
    }
    if (!zeroOnly && pick % 11 === 3) {
      state = callIt(deepFreeze(pending));
      expect(state.turn).toBe(before.turn);
      expect(state.minute).toBe(before.minute);
      expect(state.ending).toBe(
        before.turn === 0 ? 'cancelled' : 'called-early',
      );
      break;
    }
    const enabled = event.responses.filter(
      (response) => previewWithRules(pending, response, rules).enabled,
    );
    const response = enabled[zeroOnly ? 0 : pick % enabled.length];
    if (response === undefined) throw new Error('Missing fixture response');
    state = resolveWithRules(deepFreeze(pending), response.id, rules);
    expect(state.minute - before.minute).toBe(response.effect.minutes);
    expect(state.personMinutes - before.personMinutes).toBe(
      pending.present.length * response.effect.minutes,
    );
    expect(state.progress).toBeGreaterThanOrEqual(0);
    expect(state.progress).toBeLessThanOrEqual(100);
    expect(state.risks).toBeGreaterThanOrEqual(0);
    expect(state.risks).toBeLessThanOrEqual(5);
    expect(state.personMinutes).toBeGreaterThanOrEqual(before.personMinutes);
    expect(Number.isInteger(state.personMinutes)).toBe(true);
    expect(state.turn).toBe(before.turn + 1);
  }
  expect(state.phase).toBe('ended');
  expect(state.turn).toBeLessThanOrEqual(50);
  expect(getDrawCandidatesWith(pack, deepFreeze(state), weights)).toEqual([]);
  const result = score(state);
  expect(Number.isInteger(result.total)).toBe(true);
  expect(result.total).toBeGreaterThanOrEqual(0);
  expect(result.total).toBeLessThanOrEqual(1000);
  return state;
}

it('validates the complete synthetic run packs under the content gate', () => {
  for (const pack of [content, scenarioContent])
    expect(validateContent(pack, { profile: 'synthetic' })).toEqual([]);
});

it('replays generated seeds, choices and releases with fairness, integer billing, bounded state and termination', () => {
  fc.assert(
    fc.property(
      fc.string(),
      fc.array(fc.nat({ max: 1000 }), { minLength: 1, maxLength: 50 }),
      (seed, picks) => {
        const first = run(seed, picks, false);
        expect(JSON.parse(JSON.stringify(run(seed, picks, false)))).toEqual(
          JSON.parse(JSON.stringify(first)),
        );
      },
    ),
    { numRuns: 100, seed: 606 },
  );
});

it('exhausts 17 zero-minute base families and all three callbacks, then repeats +2-minute filler to timeout', () => {
  fc.assert(
    fc.property(fc.string(), (seed) => {
      const state = run(seed, [0], true);
      expect(state.ending).toBe('time-expired');
      expect(
        state.seenEventIds.filter((id) => id.startsWith('issue-')),
      ).toHaveLength(17);
      expect(
        state.seenEventIds.filter((id) => id.startsWith('return-')),
      ).toHaveLength(3);
      expect(state.scheduled).toEqual([]);
      const delivered = state.log.filter(
        (entry) => entry.type === 'draw' && entry.eventId.startsWith('return-'),
      );
      expect(delivered).toHaveLength(3);
      for (const entry of delivered)
        if (entry.type === 'draw') expect(entry.speaker).toBe('priya');
      expect(state.minute).toBe(61);
      expect(state.turn).toBe(49);
    }),
    { numRuns: 100, seed: 607 },
  );
});

it('does not deliver callbacks after either a decision or a deadline ending', () => {
  const parent = events[0];
  if (parent === undefined) throw new Error('Missing parent fixture');
  const email = parent.responses[0];
  if (email === undefined) throw new Error('Missing email fixture');
  for (const effect of [{ minutes: 1, progress: 100 }, { minutes: 10 }]) {
    const modified: ContentPack = {
      ...content,
      events: [
        {
          ...parent,
          responses: [
            {
              ...email,
              effect: {
                ...effect,
                callback: { eventId: 'return-00', afterTurns: 2 },
              },
            },
          ],
        },
      ],
    };
    const state = drawEventWith(
      modified,
      { ...initialState('early-ending'), minute: 55 },
      weights,
    );
    const ended = resolveWithRules(state, 'email', rules);
    expect(ended.phase).toBe('ended');
    expect(ended.scheduled).toEqual([{ eventId: 'return-00', dueTurn: 2 }]);
    expect(getDrawCandidatesWith(modified, deepFreeze(ended), weights)).toEqual(
      [],
    );
  }
  const state = drawEventWith(content, initialState('call-early'), weights);
  const scheduled = resolveWithRules(state, 'email', rules);
  expect(getDrawCandidatesWith(content, callIt(scheduled), weights)).toEqual(
    [],
  );
});
