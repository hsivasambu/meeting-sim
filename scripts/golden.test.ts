import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { drawEventWith } from '../src/core/engine/draw';
import {
  goldenPack,
  goldenWeights,
  goldenUtilityRules,
} from '../src/core/engine/fixtures/goldens';
import { deepFreeze } from '../src/core/engine/fixtures/transitions';
import { callIt, initialState, release } from '../src/core/engine/state';
import { resolveWithRules } from '../src/core/engine/resolve';
import { score } from '../src/core/engine/score';
import type { MeetingState } from '../src/core/engine/types';

function record(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid golden record');
  return Object.fromEntries(Object.entries(value));
}
function replay(state: MeetingState, input: unknown): MeetingState {
  const action = record(input);
  deepFreeze(state);
  switch (action.type) {
    case 'draw':
      return drawEventWith(deepFreeze(goldenPack), state, goldenWeights);
    case 'callIt':
      return callIt(state);
    case 'resolve':
      if (typeof action.responseId !== 'string')
        throw new Error('Invalid golden response');
      return resolveWithRules(state, action.responseId, goldenUtilityRules);
    case 'release':
      // These recorded runs release optional attendees and Sam. Reject unknown action data.
      if (
        action.who !== 'gary' &&
        action.who !== 'jordan' &&
        action.who !== 'sam'
      )
        throw new Error('Invalid golden attendee');
      return release(state, action.who);
    default:
      throw new Error('Invalid golden action');
  }
}

describe('D21 frozen fixture goldens: seed + complete actions → final state and score', () => {
  const directory = new URL('../tests/golden/', import.meta.url);
  for (const filename of readdirSync(directory)
    .filter((name) => name.endsWith('.json'))
    .sort()) {
    it(filename, () => {
      const data = record(
        JSON.parse(readFileSync(new URL(filename, directory), 'utf8')),
      );
      if (typeof data.seed !== 'string' || !Array.isArray(data.actions))
        throw new Error('Invalid golden input');
      let state = initialState(data.seed);
      for (const action of data.actions) state = replay(state, action);
      expect(state.phase).toBe('ended');
      expect(JSON.parse(JSON.stringify(state))).toEqual(data.finalState);
      expect(score(deepFreeze(state))).toEqual(data.score);
    });
  }
});
