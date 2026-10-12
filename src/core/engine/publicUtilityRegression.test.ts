import { expect, it } from 'vitest';
import { initialState, previewResponse, resolve, release } from './index';
import { pending, fixtureResponse } from './fixtures/transitions';
import type { Response } from './types';
// Explicitly requested current public-profile regression; no tuning targets are asserted.
it.each([6, 2])(
  'leaves the reported current-profile tie unscored at headcount %i',
  (headcount) => {
    let state = initialState('review-case');
    if (headcount === 2)
      for (const who of ['sam', 'morgan', 'gary', 'jordan'] as const)
        state = release(state, who);
    const a: Response = {
      ...fixtureResponse,
      id: 'a',
      effect: { minutes: 1, progress: 0 },
    };
    const b: Response = {
      ...fixtureResponse,
      id: 'b',
      effect: { minutes: 6, progress: headcount },
    };
    state = pending([a, b], state);
    const left = previewResponse(state, a),
      right = previewResponse(state, b);
    if (!left.enabled || !right.enabled)
      throw new Error('Unexpected disabled fixture');
    expect(left.utility).toBe(right.utility);
    for (const id of ['a', 'b'])
      expect(resolve(state, id).decisions[0]?.quality).toBeNull();
  },
);
