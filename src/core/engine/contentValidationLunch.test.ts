import { expect, it } from 'vitest';
import { validateLunchContent } from './contentValidationLunch';
import { lunchPack } from './fixtures/lunch';
import { deepFreeze } from './fixtures/transitions';

it('checks structural invariants on the complete frozen fixture pack without a player catalog', () => {
  const before = JSON.stringify(lunchPack);
  expect(validateLunchContent(deepFreeze(lunchPack))).toEqual([]);
  expect(JSON.stringify(lunchPack)).toBe(before);
  expect(validateLunchContent({ ...lunchPack, events: [] })).toContainEqual({
    path: 'events',
    rule: 'first-two-pool',
  });
});
