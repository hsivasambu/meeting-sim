import {
  INITIAL_ATTENDEES,
  MAX_HEADCOUNT,
  MAX_RESPONSES,
  ONE,
  PROGRESS_MAX,
  ZERO,
} from './constants';
import { EngineError } from './errors';
import type {
  EngineState,
  LunchState,
  LunchUtilityRules,
  PresentedEvent,
  EngineResponse,
  Response,
} from './types';

/** ADR 0005 invariants, shared by draw, preview, resolution and results. */
export function validateLunchState(state: LunchState): void {
  if (
    'risks' in state ||
    'releasedAttendeeIds' in state ||
    !Number.isSafeInteger(state.progress) ||
    state.progress < ZERO ||
    state.progress > PROGRESS_MAX ||
    !Number.isSafeInteger(state.turn) ||
    state.turn < ZERO ||
    state.present.length < INITIAL_ATTENDEES.length ||
    state.present.length > MAX_HEADCOUNT ||
    new Set(state.present).size !== state.present.length ||
    INITIAL_ATTENDEES.some((id) => !state.present.includes(id)) ||
    state.present.some(
      (id) => ![...INITIAL_ATTENDEES, 'vp', 'legal'].includes(id),
    ) ||
    (state.turn > ZERO && state.nominatedCuisine === null) ||
    (state.progress === PROGRESS_MAX && state.nominatedCuisine === null) ||
    (state.ending === 'decision') !== (state.agreedCuisine !== null) ||
    (state.agreedCuisine !== null &&
      (state.agreedCuisine !== state.nominatedCuisine ||
        state.progress !== PROGRESS_MAX)) ||
    (state.progress === PROGRESS_MAX && state.ending !== 'decision')
  )
    throw new EngineError('invalid-state');
}

/** Permission checks apply independently to every complete outcome branch. */
export function validateLunchResponse(
  state: EngineState,
  response: Response,
  rules: LunchUtilityRules,
): void {
  if (!('nominatedCuisine' in state)) throw new EngineError('invalid-state');
  validateLunchState(state);
  if (
    state.nominatedCuisine !== null &&
    !rules.cuisines.some((cuisine) => cuisine.id === state.nominatedCuisine)
  )
    throw new EngineError('invalid-state');
  const effect = response.effect;
  if (
    'risks' in effect ||
    'removes' in effect ||
    (response.requires !== undefined &&
      ('minRisks' in response.requires || 'maxRisks' in response.requires))
  )
    throw new EngineError('invalid-effect');
  const event = state.current;
  if (effect.callback !== undefined && response.requires !== undefined)
    throw new EngineError('invalid-schedule');
  if (event === null) {
    if (effect.nominateCuisine !== undefined)
      throw new EngineError('missing-event');
    return;
  }
  const nomination = event.id === rules.eventRules.nominationEventId;
  if (nomination) {
    if (
      state.turn !== ZERO ||
      state.nominatedCuisine !== null ||
      effect.nominateCuisine === undefined ||
      !rules.cuisines.some(
        (cuisine) => cuisine.id === effect.nominateCuisine,
      ) ||
      state.progress + (effect.progress ?? ZERO) >= PROGRESS_MAX
    )
      throw new EngineError('invalid-effect');
  } else if (
    state.nominatedCuisine === null ||
    effect.nominateCuisine !== undefined
  ) {
    throw new EngineError('invalid-effect');
  }
  const joins = effect.joins ?? [];
  const permissions = rules.eventRules.arrivalPermissions.filter(
    (permission) =>
      permission.eventId === event.id && permission.responseId === response.id,
  );
  const spontaneous = rules.eventRules.arrivalAttendees[event.id];
  if (
    permissions.length !== joins.length ||
    joins.some(
      (id) =>
        !permissions.some((permission) => permission.attendeeId === id) ||
        (spontaneous === undefined &&
          !response.requires?.absent?.includes(id)) ||
        (id !== 'vp' && id !== 'legal'),
    ) ||
    (spontaneous !== undefined &&
      (joins.length !== ONE || joins[ZERO] !== spontaneous))
  )
    throw new EngineError('invalid-join');
}

/** Nomination is three equal deterministic alternatives; never a hidden lottery. */
export function validateNomination(
  event: PresentedEvent<EngineResponse>,
): void {
  const choices = event.responses.map((response) => {
    if (!('outcomes' in response) || response.outcomes.length !== ONE)
      throw new EngineError('invalid-response');
    const effect = response.outcomes[ZERO]?.effect;
    if (
      effect === undefined ||
      effect.nominateCuisine === undefined ||
      effect.joins !== undefined ||
      effect.callback !== undefined ||
      effect.bookingEnd !== undefined
    )
      throw new EngineError('invalid-effect');
    return effect;
  });
  const first = choices[ZERO];
  if (
    choices.length !== MAX_RESPONSES ||
    first === undefined ||
    new Set(choices.map((effect) => effect.nominateCuisine)).size !==
      choices.length ||
    choices.some(
      (effect) =>
        effect.minutes !== first.minutes ||
        (effect.progress ?? ZERO) !== (first.progress ?? ZERO),
    )
  )
    throw new EngineError('invalid-response');
}
