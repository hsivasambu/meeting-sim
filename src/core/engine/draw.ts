import { matchesCondition } from './conditions';
import {
  FIRST_SUBSTANTIVE_DRAWS,
  ONE,
  RARITY_WEIGHTS,
  ZERO,
} from './constants';
import { assertRunning, EngineError } from './errors';
import { drawRng } from './rng';
import type {
  ContentPack,
  DrawCandidate,
  MeetingEvent,
  MeetingState,
  PresentedEvent,
  Rarity,
} from './types';
import { selectWeightedEvent, weightedEvents } from './weighted';

function uncommonNegative(event: MeetingEvent | PresentedEvent): boolean {
  return event.rarity === 'uncommon' && event.negative === true;
}

function presentEvent(
  state: MeetingState,
  event: MeetingEvent,
): PresentedEvent {
  const variant = event.variants?.find((entry) =>
    matchesCondition(state, entry.when),
  );
  return {
    id: event.id,
    kind: event.kind,
    rarity: event.rarity,
    negative: event.negative ?? false,
    speaker: variant?.speaker ?? event.speaker,
    line: variant?.line ?? event.line,
    responses: variant?.responses ?? event.responses,
  };
}

function dueCallback(
  content: ContentPack,
  state: MeetingState,
): MeetingEvent | undefined {
  const ids = new Set<string>();
  const turns = new Set<number>();
  for (const entry of state.scheduled) {
    if (
      ids.has(entry.eventId) ||
      turns.has(entry.dueTurn) ||
      state.seenEventIds.includes(entry.eventId) ||
      !Number.isSafeInteger(entry.dueTurn) ||
      entry.dueTurn < state.turn ||
      entry.dueTurn > state.turn + ONE
    )
      throw new EngineError('invalid-schedule');
    ids.add(entry.eventId);
    turns.add(entry.dueTurn);
    const parents = Object.entries(content.eventRules.callbackTargets).filter(
      ([, targetId]) => targetId === entry.eventId,
    );
    const parent = parents[ZERO]?.[ZERO];
    if (
      parents.length !== ONE ||
      parent === undefined ||
      !state.seenEventIds.includes(parent) ||
      !content.events.some((event) => event.id === parent)
    )
      throw new EngineError('invalid-schedule');
    const targets = content.callbacks.filter(
      (event) => event.id === entry.eventId,
    );
    const target = targets[ZERO];
    if (
      targets.length !== ONE ||
      target === undefined ||
      target.kind !== 'callback' ||
      target.rarity !== 'common' ||
      target.when !== undefined ||
      target.negative === true
    )
      throw new EngineError('invalid-schedule');
  }
  const due = state.scheduled.find((entry) => entry.dueTurn === state.turn);
  return content.callbacks.find((event) => event.id === due?.eventId);
}

function poolFor(
  content: ContentPack,
  state: MeetingState,
):
  | { readonly forced: MeetingEvent }
  | { readonly events: readonly MeetingEvent[] } {
  const callback = dueCallback(content, state);
  if (callback !== undefined) return { forced: callback };
  const firstTwo = state.substantiveDrawCount < FIRST_SUBSTANTIVE_DRAWS;
  const eligible = content.events.filter(
    (event) =>
      event.kind !== 'callback' &&
      !state.seenEventIds.includes(event.id) &&
      matchesCondition(state, event.when) &&
      (!firstTwo || event.kind === 'substantive') &&
      (!state.previousDrawWasUncommonNegative || !uncommonNegative(event)),
  );
  if (eligible.length > ZERO) return { events: eligible };
  if (firstTwo) throw new EngineError('invalid-pool');
  return { forced: content.filler };
}

/** Implements Design Doc v2 → Draw rules and the read-only candidate distribution (D14). */
export function getDrawCandidatesWith(
  content: ContentPack,
  state: MeetingState,
  rarityWeights: Readonly<Record<Rarity, number>> = RARITY_WEIGHTS,
): readonly DrawCandidate[] {
  if (state.phase === 'ended') return [];
  if (state.current !== null)
    return [{ event: state.current, probability: ONE }];
  const pool = poolFor(content, state);
  if ('forced' in pool)
    return [{ event: presentEvent(state, pool.forced), probability: ONE }];
  const { candidates, total } = weightedEvents(pool.events, rarityWeights);
  return candidates.map(({ event, weight }) => ({
    event: presentEvent(state, event),
    probability: weight / total,
  }));
}

/** Implements Design Doc v2 → Draw rules: scheduled priority, fairness and draw-time counters. */
export function drawEventWith(
  content: ContentPack,
  state: MeetingState,
  rarityWeights: Readonly<Record<Rarity, number>> = RARITY_WEIGHTS,
): MeetingState {
  assertRunning(state);
  if (state.current !== null) return { ...state };
  const pool = poolFor(content, state);
  const selected =
    'forced' in pool
      ? pool.forced
      : selectWeightedEvent(
          pool.events,
          drawRng(state.seed, state.turn),
          rarityWeights,
        );
  const event = presentEvent(state, selected);
  return {
    ...state,
    current: event,
    seenEventIds:
      selected === content.filler || state.seenEventIds.includes(event.id)
        ? [...state.seenEventIds]
        : [...state.seenEventIds, event.id],
    spokenAttendeeIds:
      event.speaker === 'room' ||
      state.spokenAttendeeIds.includes(event.speaker)
        ? [...state.spokenAttendeeIds]
        : [...state.spokenAttendeeIds, event.speaker],
    substantiveDrawCount:
      state.substantiveDrawCount + (event.kind === 'substantive' ? ONE : ZERO),
    previousDrawWasUncommonNegative: uncommonNegative(event),
    scheduled: state.scheduled.filter((entry) => entry.dueTurn !== state.turn),
    log: [
      ...state.log,
      {
        type: 'draw',
        turn: state.turn,
        minute: state.minute,
        eventId: event.id,
        speaker: event.speaker,
      },
    ],
  };
}
