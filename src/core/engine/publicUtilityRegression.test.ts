import { expect, it } from 'vitest';
import { initialState, previewResponse, resolve } from './index';
import { pending } from './fixtures/transitions';
import { lunchChoice } from './fixtures/lunch';
// Explicitly requested current public-profile regression; no tuning targets are asserted.
it.each([6, 8])(
  'leaves the reported current-profile tie unscored at headcount %i',
  (headcount) => {
    const initial = initialState('review-case');
    const present =
      headcount === 6
        ? initial.present
        : ([...initial.present, 'legal', 'vp'] as const);
    const a = lunchChoice('a', { minutes: 1, progress: 0 });
    const b = lunchChoice('b', { minutes: 6, progress: headcount });
    const state = pending([a, b], {
      ...initial,
      present,
      nominatedCuisine: 'thai',
    });
    const left = previewResponse(state, a),
      right = previewResponse(state, b);
    if (!left.enabled || !right.enabled)
      throw new Error('Unexpected disabled fixture');
    expect(left.utility).toBe(right.utility);
    for (const id of ['a', 'b'])
      expect(resolve(state, id).decisions[0]?.quality).toBeNull();
  },
);
