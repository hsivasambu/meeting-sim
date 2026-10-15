import {
  ATTENDEE_IDS,
  CALLBACK_DELAY,
  FILLER_MINUTES,
  INITIAL_ATTENDEES,
  INITIAL_BOOKING_END,
  LABEL_CODE_POINTS,
  LINE_CODE_POINTS,
  MAX_CONTENT_PROGRESS,
  MAX_OUTCOME_WEIGHT,
  MAX_RESPONSES,
  MAX_RESPONSE_OUTCOMES,
  MAX_RESPONSE_MINUTES,
  MIN_CONTENT_PROGRESS,
  ONE,
  REDUCED_BOOKING_END,
  ZERO,
} from './constants';
import { matchesCondition } from './conditions';
import { initialLunchState } from './state';
import { validateNomination } from './lunchValidation';
import { validateLunchCatalog } from './contentValidationLunchCatalog';
import type { ContentIssue } from './contentValidationTypes';
import type {
  AttendeeId,
  Condition,
  LunchCatalog,
  LunchContentPack,
} from './types';

/** Approved lunch structural/authored checks. No live import or activation. */
export function validateLunchContent(
  pack: LunchContentPack,
  catalog: LunchCatalog,
): readonly ContentIssue[] {
  const issues: ContentIssue[] = [];
  const add = (path: string, rule: string): void => {
    issues.push({ path, rule });
  };
  const unique = (ids: readonly string[], path: string): void => {
    if (
      new Set(ids).size !== ids.length ||
      ids.some((id) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))
    )
      add(path, 'unique-ids');
  };
  const text = (value: string, limit: number, path: string): void => {
    if (!value.trim() || (!value.includes('{') && [...value].length > limit))
      add(path, 'text');
  };
  const condition = (value: Condition | undefined, path: string): void => {
    if (value === undefined) return;
    if (
      Object.keys(value).some(
        (key) => !['present', 'absent', 'minMinute', 'maxMinute'].includes(key),
      )
    )
      add(path, 'condition-key');
    for (const ids of [value.present ?? [], value.absent ?? []]) {
      unique(ids, path);
      if (ids.some((id) => !ATTENDEE_IDS.includes(id)))
        add(path, 'attendee-reference');
    }
    if (
      (value.present ?? []).some((id) => value.absent?.includes(id)) ||
      [value.minMinute, value.maxMinute].some(
        (n) => n !== undefined && (!Number.isSafeInteger(n) || n < ZERO),
      ) ||
      (value.minMinute ?? ZERO) > (value.maxMinute ?? INITIAL_BOOKING_END)
    )
      add(path, 'condition');
  };
  const all = [...pack.events, ...pack.callbacks, pack.filler];
  unique(
    all.map((e) => e.id),
    'events',
  );
  unique(
    pack.cuisines.map((c) => c.id),
    'cuisines',
  );
  if (pack.cuisines.length !== MAX_RESPONSES) add('cuisines', 'cuisine-count');
  const rules = pack.eventRules;
  const nomination = pack.events.find((e) => e.id === rules.nominationEventId);
  if (
    nomination === undefined ||
    nomination.when !== undefined ||
    nomination.variants !== undefined ||
    nomination.kind !== 'substantive' ||
    nomination.rarity !== 'common'
  )
    add('nomination', 'nomination-shape');
  if (nomination !== undefined) {
    try {
      validateNomination({
        ...nomination,
        negative: nomination.negative ?? false,
      });
    } catch {
      add(nomination.id, 'nomination-equality');
    }
  }
  if (
    pack.events.filter(
      (e) =>
        e.id !== rules.nominationEventId &&
        e.kind === 'substantive' &&
        e.rarity === 'common' &&
        e.when === undefined,
    ).length < CALLBACK_DELAY
  )
    add('events', 'first-two-pool');
  unique(Object.values(rules.callbackTargets), 'callbackTargets');
  unique(Object.values(rules.arrivalAttendees), 'arrivalAttendees');
  unique(rules.bookingEventIds, 'bookingEventIds');
  const usedPermissions = new Set<string>();
  const usedCallbacks = new Set<string>();
  const usedReasons = new Set<string>();
  const rosters: readonly (readonly AttendeeId[])[] = [
    INITIAL_ATTENDEES,
    [...INITIAL_ATTENDEES, 'legal'] as const,
    [...INITIAL_ATTENDEES, 'vp'] as const,
    [...INITIAL_ATTENDEES, 'legal', 'vp'] as const,
  ];
  for (const event of all) {
    const callback = pack.callbacks.includes(event);
    const door = rules.arrivalAttendees[event.id];
    condition(event.when, event.id);
    if (
      ![
        'noise',
        'tangent',
        'substantive',
        'escalation',
        'gift',
        'callback',
      ].includes(event.kind) ||
      !['common', 'uncommon', 'rare'].includes(event.rarity)
    )
      add(event.id, 'event-kind');
    if (
      !Number.isSafeInteger(event.weight ?? ONE) ||
      (event.weight ?? ONE) < ONE
    )
      add(event.id, 'weight');
    if (
      callback !== (event.kind === 'callback') ||
      (callback &&
        (event.rarity !== 'common' ||
          event.negative === true ||
          event.when !== undefined ||
          !Object.values(rules.callbackTargets).includes(event.id)))
    )
      add(event.id, 'callback-shape');
    if (
      door !== undefined &&
      (event.kind !== 'escalation' || !event.when?.absent?.includes(door))
    )
      add(event.id, 'arrival-guard');
    const presentations = [event, ...(event.variants ?? [])];
    const reached = new Set<object>();
    for (const [index, presentation] of presentations.entries()) {
      const path = `${event.id}.presentation.${index}`;
      if (index > ZERO) condition(presentation.when, path);
      text(presentation.line, LINE_CODE_POINTS, path);
      unique(
        presentation.responses.map((r) => r.id),
        path,
      );
      if (
        presentation.responses.length < ONE ||
        presentation.responses.length > MAX_RESPONSES
      )
        add(path, 'response-count');
      for (const response of presentation.responses) {
        const rp = `${path}.${response.id}`;
        text(response.label, LABEL_CODE_POINTS, rp);
        text(response.description, LINE_CODE_POINTS, rp);
        if (
          /\d|\b(percent|probability|utility)\b/i.test(
            response.label + response.description,
          )
        )
          add(rp, 'numeric-preview');
        if (
          ![
            'hear',
            'timebox',
            'park',
            'owner',
            'email',
            'refocus',
            'ack',
          ].includes(response.technique) ||
          'effect' in response ||
          'line' in response
        )
          add(rp, 'response-shape');
        condition(response.requires, rp);
        if (response.requires !== undefined) {
          if (
            response.disabledReasonKey === undefined ||
            catalog.disabledReasons[response.disabledReasonKey] === undefined
          )
            add(rp, 'disabled-reason');
          else usedReasons.add(response.disabledReasonKey);
        } else if (response.disabledReasonKey !== undefined)
          add(rp, 'disabled-reason');
        unique(
          response.outcomes.map((o) => o.id),
          rp,
        );
        const total = response.outcomes.reduce(
          (sum, o) => sum + o.weight,
          ZERO,
        );
        if (
          response.outcomes.length < ONE ||
          response.outcomes.length > MAX_RESPONSE_OUTCOMES ||
          !Number.isSafeInteger(total) ||
          total > MAX_OUTCOME_WEIGHT
        )
          add(rp, 'outcomes');
        for (const outcome of response.outcomes) {
          const op = `${rp}.${outcome.id}`;
          const effect = outcome.effect;
          text(outcome.line, LINE_CODE_POINTS, op);
          if (
            !Number.isSafeInteger(outcome.weight) ||
            outcome.weight < ONE ||
            Object.keys(outcome).some(
              (key) => !['id', 'weight', 'effect', 'line'].includes(key),
            )
          )
            add(op, 'outcome-shape');
          if (
            Object.keys(effect).some(
              (key) =>
                ![
                  'minutes',
                  'progress',
                  'joins',
                  'bookingEnd',
                  'callback',
                  'nominateCuisine',
                ].includes(key),
            ) ||
            !Number.isSafeInteger(effect.minutes) ||
            effect.minutes < ONE ||
            effect.minutes > MAX_RESPONSE_MINUTES ||
            !Number.isSafeInteger(effect.progress ?? ZERO) ||
            (effect.progress ?? ZERO) < MIN_CONTENT_PROGRESS ||
            (effect.progress ?? ZERO) > MAX_CONTENT_PROGRESS
          )
            add(op, 'effect');
          if (
            (effect.nominateCuisine !== undefined) !==
              (event.id === rules.nominationEventId) ||
            (effect.nominateCuisine !== undefined &&
              !pack.cuisines.some((c) => c.id === effect.nominateCuisine))
          )
            add(op, 'cuisine-reference');
          if (
            (effect.bookingEnd !== undefined) !==
              rules.bookingEventIds.includes(event.id) ||
            (effect.bookingEnd !== undefined &&
              effect.bookingEnd !== INITIAL_BOOKING_END &&
              effect.bookingEnd !== REDUCED_BOOKING_END)
          )
            add(op, 'booking');
          const permissions = rules.arrivalPermissions.filter(
            (p) => p.eventId === event.id && p.responseId === response.id,
          );
          const joins = effect.joins ?? [];
          if (
            new Set(joins).size !== joins.length ||
            permissions.length !== joins.length ||
            joins.some(
              (id) =>
                !['legal', 'vp'].includes(id) ||
                !permissions.some((p) => p.attendeeId === id) ||
                (door === undefined &&
                  !response.requires?.absent?.includes(id)),
            ) ||
            (door !== undefined &&
              (joins.length !== ONE || joins[ZERO] !== door))
          )
            add(op, 'arrival-permission');
          for (const p of permissions)
            usedPermissions.add(`${p.eventId}/${p.responseId}/${p.attendeeId}`);
          if (effect.callback !== undefined) {
            if (
              callback ||
              response.requires !== undefined ||
              response.technique !== 'park' ||
              effect.callback.afterTurns !== CALLBACK_DELAY ||
              rules.callbackTargets[event.id] !== effect.callback.eventId
            )
              add(op, 'callback');
            usedCallbacks.add(`${event.id}/${effect.callback.eventId}`);
          }
          if (
            event === pack.filler &&
            (response.technique !== 'ack' ||
              effect.minutes !== FILLER_MINUTES ||
              (effect.progress ?? ZERO) !== ZERO ||
              Object.keys(effect).some(
                (key) => !['minutes', 'progress'].includes(key),
              ))
          )
            add(op, 'filler');
        }
      }
      if (
        presentation.responses.some((r) => r.outcomes.length > ONE) &&
        !presentation.responses.some(
          (r) => r.outcomes.length === ONE && r.requires === undefined,
        )
      )
        add(path, 'deterministic-alternative');
    }
    // Enumerate all permanent rosters and inclusive minute boundaries, honoring first-match order.
    for (const present of rosters)
      for (let minute = ZERO; minute < INITIAL_BOOKING_END; minute += ONE) {
        const state = { ...initialLunchState('validation'), present, minute };
        if (!matchesCondition(state, event.when)) continue;
        const selected =
          event.variants?.find((v) => matchesCondition(state, v.when)) ?? event;
        reached.add(selected);
        if (
          selected.speaker !== 'room' &&
          !present.includes(selected.speaker) &&
          selected.speaker !== door
        )
          add(event.id, 'speaker-presence');
        if (
          !selected.responses.some((r) => matchesCondition(state, r.requires))
        )
          add(event.id, 'enabled-fallback');
      }
    if (presentations.some((p) => !reached.has(p)))
      add(event.id, 'unreachable-presentation');
  }
  for (const p of rules.arrivalPermissions)
    if (!usedPermissions.delete(`${p.eventId}/${p.responseId}/${p.attendeeId}`))
      add(p.eventId, 'arrival-metadata');
  for (const [parent, target] of Object.entries(rules.callbackTargets))
    if (
      !pack.events.some((e) => e.id === parent) ||
      !pack.callbacks.some((e) => e.id === target) ||
      !usedCallbacks.has(`${parent}/${target}`)
    )
      add(parent, 'callback-reference');
  for (const id of [
    ...Object.keys(rules.arrivalAttendees),
    ...rules.bookingEventIds,
  ])
    if (!pack.events.some((e) => e.id === id)) add(id, 'event-reference');
  for (const key of Object.keys(catalog.disabledReasons))
    if (!usedReasons.has(key)) add(key, 'unused-reason');
  if (
    pack.filler.responses.length !== ONE ||
    pack.filler.when !== undefined ||
    pack.filler.variants !== undefined ||
    pack.filler.kind !== 'noise' ||
    pack.filler.rarity !== 'common' ||
    pack.filler.negative === true
  )
    add('filler', 'filler-shape');
  validateLunchCatalog(pack, catalog, add);
  return issues;
}
