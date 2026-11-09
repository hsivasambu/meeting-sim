import { expect, it } from 'vitest';
import { selectCommentary } from './commentary';
import {
  lunchPending,
  lunchRules,
  lunchState,
  lottery,
} from './fixtures/lunch';
import { deepFreeze } from './fixtures/transitions';
import { getResponseOutcomesWithRules, resolveWithRules } from './resolve';
import type { LunchCommentary, MeetingState } from './types';

const catalog = (
  [
    'agreement-commentary',
    'nearly-there',
    'full-room',
    'topic-returned',
    'expensive-discussion',
    'postponed-again',
    'still-considering',
  ] as const
).map((id, priority): LunchCommentary => ({
  id,
  priority: priority + 1,
  line: 'Fixture line.',
  predicate: 'Fixture annotation.',
}));

it.each([
  ['nearly-there', { progress: 79 }, { progress: 80 }],
  [
    'topic-returned',
    { resolvedCallbackCount: 0 },
    { resolvedCallbackCount: 1 },
  ],
  ['expensive-discussion', { personMinutes: 179 }, { personMinutes: 180 }],
  ['postponed-again', { parkedCount: 1 }, { parkedCount: 2 }],
  [
    'still-considering',
    { minute: 14, progress: 30 },
    { minute: 15, progress: 30 },
  ],
  [
    'still-considering',
    { minute: 15, progress: 31 },
    { minute: 15, progress: 30 },
  ],
] satisfies readonly [string, Partial<MeetingState>, Partial<MeetingState>][])(
  'uses the inclusive eligibility boundary for %s',
  (id, below, boundary) => {
    const rule = catalog.filter((entry) => entry.id === id);
    expect(
      selectCommentary(lunchState({ turn: 3, ...below }), rule),
    ).toBeUndefined();
    expect(selectCommentary(lunchState({ turn: 3, ...boundary }), rule)).toBe(
      id,
    );
  },
);

it('uses post-resolution phase, full attendance, priority and cadence independently of catalog order', () => {
  const state = lunchState({ turn: 3, progress: 80, personMinutes: 180 });
  const room = {
    ...state,
    present: [...state.present, 'legal', 'vp'] as const,
  };
  const shuffled = [...catalog].reverse();
  expect(selectCommentary({ ...room, turn: 2 }, shuffled)).toBeUndefined();
  expect(selectCommentary(room, shuffled)).toBe('nearly-there');
  expect(
    selectCommentary(
      { ...room, phase: 'ended', ending: 'time-expired' },
      shuffled,
    ),
  ).toBe('full-room');
  const shown = {
    ...room,
    shownCommentaryIds: ['nearly-there'],
    lastCommentaryTurn: 3,
  };
  expect(selectCommentary({ ...shown, turn: 5 }, shuffled)).toBeUndefined();
  expect(selectCommentary({ ...shown, turn: 6 }, shuffled)).toBe('full-room');
  expect(
    selectCommentary(
      {
        ...shown,
        turn: 9,
        shownCommentaryIds: ['nearly-there', 'full-room', 'topic-returned'],
      },
      shuffled,
    ),
  ).toBeUndefined();
  expect(selectCommentary(lunchState({ turn: 3 }), shuffled)).toBeUndefined();
});

it('selects on each realized branch without changing q, outcomes, or RNG', () => {
  const state = deepFreeze(
    lunchPending([lottery], { progress: 95, minute: 57 }),
  );
  const rules = { ...lunchRules, commentary: catalog };
  const branches = getResponseOutcomesWithRules(state, 'lottery', rules);
  expect(
    branches.map(({ state }) => [
      state.ending,
      state.shownCommentaryIds,
      state.lastCommentaryTurn,
    ]),
  ).toEqual([
    ['time-expired', [], null],
    ['decision', ['agreement-commentary'], 3],
  ]);
  expect(branches[1]?.state.log.at(-1)).toMatchObject({
    type: 'resolve',
    outcomeId: 'good',
    commentaryId: 'agreement-commentary',
  });
  const plain = resolveWithRules(state, 'lottery', lunchRules);
  const annotated = resolveWithRules(state, 'lottery', rules);
  expect(branches.map((branch) => branch.state)).toContainEqual(annotated);
  expect(annotated.decisions).toEqual(plain.decisions);
  const resolution = plain.log.at(-1);
  if (resolution?.type !== 'resolve')
    throw new Error('Missing fixture resolution');
  expect(annotated.log.at(-1)).toMatchObject({
    outcomeId: resolution.outcomeId,
  });
  expect(state.shownCommentaryIds).toEqual([]);
});
