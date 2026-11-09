import {
  COMMENTARY_COST_PM,
  COMMENTARY_INTERVAL,
  COMMENTARY_LIMIT,
  COMMENTARY_NEAR_PROGRESS,
  COMMENTARY_POSTPONED,
  COMMENTARY_STALLED_MINUTE,
  COMMENTARY_STALLED_PROGRESS,
  MAX_HEADCOUNT,
  ONE,
} from './constants';
import type { LunchCommentary, MeetingState } from './types';

function eligible(id: LunchCommentary['id'], state: MeetingState): boolean {
  switch (id) {
    case 'agreement-commentary':
      return state.ending === 'decision' && state.agreedCuisine !== null;
    case 'nearly-there':
      return (
        state.phase === 'running' && state.progress >= COMMENTARY_NEAR_PROGRESS
      );
    case 'full-room':
      return state.present.length === MAX_HEADCOUNT;
    case 'topic-returned':
      return state.resolvedCallbackCount >= ONE;
    case 'expensive-discussion':
      return state.personMinutes >= COMMENTARY_COST_PM;
    case 'postponed-again':
      return state.parkedCount >= COMMENTARY_POSTPONED;
    case 'still-considering':
      return (
        state.phase === 'running' &&
        state.progress <= COMMENTARY_STALLED_PROGRESS &&
        state.minute >= COMMENTARY_STALLED_MINUTE
      );
  }
}

/** ADR 0008. Evaluate after applying the branch and advancing the turn. */
export function selectCommentary(
  state: MeetingState,
  catalog: readonly LunchCommentary[],
): LunchCommentary['id'] | undefined {
  if (
    state.turn < COMMENTARY_INTERVAL ||
    state.shownCommentaryIds.length >= COMMENTARY_LIMIT ||
    (state.lastCommentaryTurn !== null &&
      state.turn - state.lastCommentaryTurn < COMMENTARY_INTERVAL)
  )
    return undefined;
  let selected: LunchCommentary | undefined;
  for (const entry of catalog) {
    if (
      (selected === undefined || entry.priority < selected.priority) &&
      !state.shownCommentaryIds.includes(entry.id) &&
      eligible(entry.id, state)
    )
      selected = entry;
  }
  return selected?.id;
}
