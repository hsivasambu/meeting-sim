import { useSyncExternalStore } from 'react';
import { cuisines } from '../../../core/content/lunch/cuisines';
import type { OutcomeResponse } from '../../../core/engine/index';

export type LunchChoice = Pick<
  OutcomeResponse,
  'id' | 'label' | 'description'
> &
  (
    | { readonly enabled: true }
    | { readonly enabled: false; readonly reasonKey: string }
  );

export function cuisineName(id: string): string {
  const cuisine = cuisines.find((entry) => entry.id === id);
  if (cuisine === undefined) throw new Error(`Unknown lunch cuisine: ${id}`);
  return cuisine.name;
}

export function formatLunchLine(
  template: string,
  facts: Readonly<Record<string, string | number>>,
): string {
  return template.replace(/\{(\w+)\}/g, (placeholder, key: string) =>
    Object.hasOwn(facts, key) ? String(facts[key]) : placeholder,
  );
}

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

function readReducedMotion() {
  return window.matchMedia(reducedMotionQuery).matches;
}

function subscribeReducedMotion(listener: () => void) {
  const media = window.matchMedia(reducedMotionQuery);
  media.addEventListener('change', listener);
  return () => media.removeEventListener('change', listener);
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, readReducedMotion);
}
