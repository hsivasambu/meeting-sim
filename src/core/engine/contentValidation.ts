import {
  alwaysEnabled,
  validatePresentations,
  validateCatalog,
} from './contentValidationHelpers';
import { needsExpertRequirement } from './contentValidationExpert';
import {
  ATTENDEE_IDS,
  CALLBACK_DELAY,
  CONDITION_KEYS,
  FILLER_MINUTES,
  FIRST_SUBSTANTIVE_DRAWS,
  INITIAL_BOOKING_END,
  LABEL_CODE_POINTS,
  LINE_CODE_POINTS,
  MAX_CONTENT_PROGRESS,
  MAX_CONTENT_RISKS,
  MAX_RESPONSES,
  MAX_RESPONSE_MINUTES,
  MIN_CONTENT_PROGRESS,
  MIN_CONTENT_RISKS,
  MVP_EVENT_RULES,
  ONE,
  REDUCED_BOOKING_END,
  RISKS_MAX,
  ZERO,
} from './constants';

import type { Condition, ContentPack } from './types';

import type {
  ContentIssue,
  ContentValidationOptions,
} from './contentValidationTypes';
export type {
  ValidationCatalog,
  ContentValidationOptions,
  ContentIssue,
} from './contentValidationTypes';

/** Implements Design Doc v2 → Event schema and roster and Events and responses: content safety. */
export function validateContent(
  pack: ContentPack,
  options: ContentValidationOptions = {},
): readonly ContentIssue[] {
  const issues: ContentIssue[] = [];
  const add = (path: string, rule: string): void => {
    issues.push({ path, rule });
  };
  const playable = options.profile !== 'synthetic';
  const catalog = options.catalog;
  const all = [...pack.events, ...pack.callbacks, pack.filler];
  const attendees: readonly string[] = ATTENDEE_IDS;
  const text = (value: string, limit: number, path: string): void => {
    if (!value.trim() || (playable && [...value].length > limit))
      add(path, 'text');
  };
  const unique = (ids: readonly string[], path: string): void => {
    if (new Set(ids).size !== ids.length || ids.some((id) => !id.trim()))
      add(path, 'unique-ids');
  };
  const reference = (id: string, path: string): void => {
    if (!attendees.includes(id)) add(path, 'attendee-reference');
  };
  const condition = (value: Condition | undefined, path: string): void => {
    if (value === undefined) return;
    for (const [key, bound] of Object.entries(value)) {
      if (!CONDITION_KEYS.some((known) => known === key))
        add(path, 'condition-key');
      if (key === 'present' || key === 'absent') continue;
      if (
        typeof bound !== 'number' ||
        !Number.isSafeInteger(bound) ||
        bound < ZERO ||
        (key.includes('Risks') && bound > RISKS_MAX)
      )
        add(path, 'condition');
    }
    for (const ids of [value.present ?? [], value.absent ?? []]) {
      unique(ids, path);
      ids.forEach((id) => reference(id, path));
    }
    if (
      (value.present ?? []).some((id) => value.absent?.includes(id)) ||
      (value.minMinute ?? ZERO) > (value.maxMinute ?? INITIAL_BOOKING_END) ||
      (value.minRisks ?? ZERO) > (value.maxRisks ?? RISKS_MAX)
    )
      add(path, 'condition');
  };
  unique(
    all.map((event) => event.id),
    'events',
  );
  unique(Object.values(pack.eventRules.arrivalAttendees), 'arrivalAttendees');
  unique(Object.values(pack.eventRules.callbackTargets), 'callbackTargets');
  unique(pack.eventRules.bookingEventIds, 'bookingEventIds');
  for (const [id, who] of Object.entries(pack.eventRules.arrivalAttendees)) {
    reference(who, id);
    if (
      !pack.events.some((event) => event.id === id) ||
      (who !== 'vp' && who !== 'legal')
    )
      add(id, 'arrival-metadata');
  }
  for (const [parent, target] of Object.entries(
    pack.eventRules.callbackTargets,
  )) {
    if (
      !pack.events.some((event) => event.id === parent) ||
      !pack.callbacks.some((event) => event.id === target)
    )
      add(parent, 'callback-reference');
  }
  for (const id of pack.eventRules.bookingEventIds)
    if (!pack.events.some((event) => event.id === id))
      add(id, 'booking-metadata');
  if (playable) {
    const expectedCallbacks = MVP_EVENT_RULES.callbackTargets;
    if (
      Object.keys(pack.eventRules.callbackTargets).length !==
        Object.keys(expectedCallbacks).length ||
      Object.entries(expectedCallbacks).some(
        ([id, target]) => pack.eventRules.callbackTargets[id] !== target,
      )
    )
      add('callbackTargets', 'mvp-relationships');
    if (
      Object.keys(pack.eventRules.arrivalAttendees).length !==
        Object.keys(MVP_EVENT_RULES.arrivalAttendees).length ||
      Object.entries(MVP_EVENT_RULES.arrivalAttendees).some(
        ([id, who]) => pack.eventRules.arrivalAttendees[id] !== who,
      ) ||
      pack.eventRules.bookingEventIds.length !==
        MVP_EVENT_RULES.bookingEventIds.length ||
      MVP_EVENT_RULES.bookingEventIds.some(
        (id, index) => pack.eventRules.bookingEventIds[index] !== id,
      )
    )
      add('eventRules', 'mvp-relationships');
  }

  for (const event of all) {
    const path = event.id;
    const arrival = Object.hasOwn(pack.eventRules.arrivalAttendees, event.id)
      ? pack.eventRules.arrivalAttendees[event.id]
      : undefined;
    const target = Object.hasOwn(pack.eventRules.callbackTargets, event.id)
      ? pack.eventRules.callbackTargets[event.id]
      : undefined;
    const callback = pack.callbacks.includes(event);
    if (arrival !== undefined && event.kind !== 'escalation')
      add(path, 'arrival-kind');
    condition(event.when, path);
    if (
      event.weight !== undefined &&
      (!Number.isSafeInteger(event.weight) || event.weight <= ZERO)
    )
      add(path, 'weight');
    if (
      callback !== (event.kind === 'callback') ||
      (callback &&
        (event.rarity !== 'common' ||
          event.negative === true ||
          event.when !== undefined))
    )
      add(path, 'callback-shape');
    if (
      callback &&
      !Object.values(pack.eventRules.callbackTargets).includes(event.id)
    )
      add(path, 'callback-reference');
    const presentations = [event, ...(event.variants ?? [])];
    for (const [index, presentation] of presentations.entries()) {
      const location = `${path}.presentations[${index}]`;
      if ('when' in presentation && index > ZERO)
        condition(presentation.when, location);
      if (presentation.speaker !== 'room')
        reference(presentation.speaker, location);
      text(presentation.line, LINE_CODE_POINTS, location);
      unique(
        presentation.responses.map((response) => response.id),
        location,
      );
      if (
        presentation.responses.length === ZERO ||
        (playable && presentation.responses.length > MAX_RESPONSES)
      )
        add(location, 'response-count');
      if (!presentation.responses.some(alwaysEnabled))
        add(location, 'always-enabled');
      if (
        target !== undefined &&
        !presentation.responses.some(
          (response) => response.effect.callback?.eventId === target,
        )
      )
        add(location, 'callback-scheduler');
      for (const response of presentation.responses) {
        const responsePath = `${location}.${response.id}`;
        text(response.label, LABEL_CODE_POINTS, responsePath);
        text(response.line, LINE_CODE_POINTS, responsePath);
        condition(response.requires, responsePath);
        if (response.requires !== undefined) {
          if (!response.disabledReasonKey?.trim())
            add(responsePath, 'disabled-reason');
          else if (
            catalog?.disabledReasons !== undefined &&
            !Object.hasOwn(catalog.disabledReasons, response.disabledReasonKey)
          )
            add(responsePath, 'disabled-reason-reference');
        }
        const effect = response.effect;
        if (
          Object.hasOwn(effect, 'leaves') ||
          Object.hasOwn(response, 'effectCases')
        )
          add(responsePath, 'forbidden-effect');
        for (const number of [
          effect.minutes,
          effect.progress ?? ZERO,
          effect.risks ?? ZERO,
        ])
          if (!Number.isSafeInteger(number))
            add(responsePath, 'integer-effect');
        if (
          effect.minutes < ZERO ||
          (playable && effect.minutes > MAX_RESPONSE_MINUTES) ||
          (playable &&
            ((effect.progress ?? ZERO) < MIN_CONTENT_PROGRESS ||
              (effect.progress ?? ZERO) > MAX_CONTENT_PROGRESS ||
              (effect.risks ?? ZERO) < MIN_CONTENT_RISKS ||
              (effect.risks ?? ZERO) > MAX_CONTENT_RISKS))
        )
          add(responsePath, 'effect-range');
        if (
          effect.minutes === ZERO &&
          (response.technique !== 'email' || callback)
        )
          add(responsePath, 'zero-minutes');
        const joins = effect.joins ?? [];
        joins.forEach((id) => reference(id, responsePath));
        if (
          arrival === undefined
            ? joins.length > ZERO
            : joins.length !== ONE || joins[ZERO] !== arrival
        )
          add(responsePath, 'joins');
        const booking = pack.eventRules.bookingEventIds.includes(event.id);
        if (
          booking !== (effect.bookingEnd !== undefined) ||
          (effect.bookingEnd !== undefined &&
            effect.bookingEnd !== INITIAL_BOOKING_END &&
            effect.bookingEnd !== REDUCED_BOOKING_END)
        )
          add(responsePath, 'booking-effect');
        if (
          effect.callback !== undefined &&
          (callback ||
            event === pack.filler ||
            target !== effect.callback.eventId ||
            effect.callback.afterTurns !== CALLBACK_DELAY ||
            (response.technique !== 'park' && response.technique !== 'email'))
        )
          add(responsePath, 'callback-effect');
        if (
          playable &&
          arrival === undefined &&
          index === ZERO &&
          needsExpertRequirement(event, response)
        )
          add(responsePath, 'expert-requirement');
      }
    }
    validatePresentations(event, arrival, target, add);
  }
  if (
    pack.events.filter(
      (event) =>
        event.kind === 'substantive' &&
        event.rarity === 'common' &&
        Object.keys(event.when ?? {}).length === ZERO &&
        !Object.hasOwn(pack.eventRules.arrivalAttendees, event.id),
    ).length < FIRST_SUBSTANTIVE_DRAWS
  )
    add('events', 'first-two-substantive');
  const filler = pack.filler;
  if (
    filler.kind !== 'noise' ||
    filler.rarity !== 'common' ||
    filler.negative === true ||
    filler.when !== undefined ||
    filler.variants !== undefined ||
    filler.responses.length !== ONE ||
    filler.responses.some(
      (response) =>
        response.technique !== 'ack' ||
        response.requires !== undefined ||
        response.effect.minutes !== FILLER_MINUTES ||
        (response.effect.progress ?? ZERO) !== ZERO ||
        (response.effect.risks ?? ZERO) !== ZERO ||
        response.effect.callback !== undefined,
    )
  )
    add(filler.id, 'filler');
  validateCatalog(catalog, all, text, unique, reference, add);
  return issues;
}
