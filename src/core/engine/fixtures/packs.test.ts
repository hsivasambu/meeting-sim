import { expect, it } from 'vitest';
import { fixturePack, fixtureState } from './packs';
import { matchesCondition } from '../conditions';
import type { Response } from '../types';

it('keeps a legal callback response in the base and every absent-support presentation', () => {
  const parent = fixturePack.events[0];
  expect(parent.id).toBe('support-training');
  const presentations: readonly (readonly Response[])[] = [
    parent.responses,
    ...parent.variants.map((variant) => variant.responses),
  ];
  for (const responses of presentations) {
    const schedulers = responses.filter(
      (response) =>
        (response.technique === 'park' || response.technique === 'email') &&
        response.effect.callback?.eventId === 'support-follow-up',
    );
    expect(schedulers.length).toBeGreaterThan(0);
    for (const response of schedulers) {
      expect(response.effect.callback?.afterTurns).toBe(2);
      expect(
        matchesCondition(
          { ...fixtureState, present: ['priya'] },
          response.requires,
        ),
      ).toBe(true);
      expect(
        fixturePack.callbacks.some(
          (event) => event.id === response.effect.callback?.eventId,
        ),
      ).toBe(true);
    }
  }
});
