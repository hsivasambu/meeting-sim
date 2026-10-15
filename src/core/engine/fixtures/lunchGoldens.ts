import { drawEventWith } from '../draw';
import { resolveWithRules } from '../resolve';
import { previewWithRules } from '../preview';
import { score } from '../score';
import { earnedLunchTitles } from '../titleRules';
import { initialLunchState, callIt } from '../state';
import {
  lunchPack,
  lunchRules,
  lunchPending,
  lunchChoice,
  lottery,
} from './lunch';
import type { LunchState } from '../types';

// Frozen synthetic routes, independent of live content and its unapproved draft.
export const lunchGoldenRoutes = [
  { id: 'cancelled', seed: 'lunch-cancel', mode: 'cancel' },
  { id: 'agreement', seed: 'lunch-agree', mode: 'advance' },
  { id: 'timeout', seed: 'lunch-timeout', mode: 'wait' },
  { id: 'callback-early', seed: 'lunch-callback', mode: 'callback' },
  { id: 'invitation-agreement', seed: 'lunch-invite', mode: 'invite' },
  { id: 'rolled-setback', seed: 'lunch-roll-0', mode: 'roll' },
  { id: 'rolled-agreement', seed: 'lunch-roll-1', mode: 'roll' },
] as const;
export type LunchGoldenRoute = (typeof lunchGoldenRoutes)[number];

export function runLunchGolden(route: LunchGoldenRoute) {
  const actions: string[] = [];
  let state: LunchState =
    route.mode === 'roll'
      ? lunchPending(
          [
            lottery,
            lunchChoice('low', { minutes: 10, progress: -10 }),
            lunchChoice('high', { minutes: 1, progress: 10 }),
          ],
          { seed: route.seed, progress: 95, minute: 59 },
        )
      : initialLunchState(route.seed);
  while (state.phase === 'running') {
    if (
      route.mode === 'cancel' ||
      (route.mode === 'callback' && state.resolvedCallbackCount > 0)
    ) {
      state = callIt(drawEventWith(lunchPack, state));
      actions.push('call-it');
      break;
    }
    if (route.mode !== 'roll') state = drawEventWith(lunchPack, state);
    const options =
      state.current?.responses.filter(
        (option) => previewWithRules(state, option, lunchRules).enabled,
      ) ?? [];
    const preferences =
      route.mode === 'roll'
        ? ['lottery']
        : route.mode === 'wait'
          ? ['wait', 'short', 'ack', 'fixture-b']
          : route.mode === 'callback'
            ? ['park', 'wait', 'ack', 'fixture-c']
            : route.mode === 'invite'
              ? ['invite', 'advance', 'long', 'ack', 'fixture-b']
              : ['advance', 'long', 'ack', 'fixture-a'];
    const response =
      preferences
        .map((id) => options.find((option) => option.id === id))
        .find((option) => option !== undefined) ?? options[0];
    if (response === undefined) throw new Error('Invalid golden route');
    actions.push((state.current?.id ?? '') + ':' + response.id);
    state = resolveWithRules(state, response.id, lunchRules);
  }
  const breakdown = score(state);
  return {
    actions,
    state,
    score: breakdown,
    titles: earnedLunchTitles(state, breakdown),
  };
}
