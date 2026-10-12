import { matchesCondition } from './conditions';
import {
  ATTENDEE_IDS,
  DECISION_OWNER,
  INITIAL_BOOKING_END,
  LINE_CODE_POINTS,
  MIN_HEADCOUNT,
  ONE,
  RISKS_MAX,
  ROLE_CODE_POINTS,
  TITLE_CODE_POINTS,
  ZERO,
} from './constants';
import { initialState } from './state';
import type { ValidationCatalog } from './contentValidationTypes';
import type {
  AttendeeId,
  Condition,
  EventVariant,
  MeetingEvent,
  MeetingState,
  Response,
} from './types';
type Presentation = Pick<EventVariant, 'speaker' | 'line' | 'responses'>;
/** Implements Design Doc v2 → Events and responses: a fallback survives releases. */
export function alwaysEnabled(response: Response): boolean {
  const condition = response.requires;
  return (
    condition === undefined ||
    (condition.minMinute === undefined &&
      condition.maxMinute === undefined &&
      condition.minRisks === undefined &&
      condition.maxRisks === undefined &&
      (condition.absent?.length ?? ZERO) === ZERO &&
      (condition.present ?? []).every((id) => id === DECISION_OWNER))
  );
}

// Rosters include all release combinations and both arrivals; compute them once.
function rosters(): readonly (readonly AttendeeId[])[] {
  let sets: readonly (readonly AttendeeId[])[] = [[DECISION_OWNER]];
  for (const id of ATTENDEE_IDS.filter((entry) => entry !== DECISION_OWNER))
    sets = [...sets, ...sets.map((set) => [...set, id])];
  return sets.filter((set) => set.length >= MIN_HEADCOUNT);
}
const legalRosters = rosters();

// Inclusive conjunctions change truth only at a minimum or just after a maximum.
function boundaries(
  conditions: readonly Condition[],
  minKey: 'minMinute' | 'minRisks',
  maxKey: 'maxMinute' | 'maxRisks',
  limit: number,
): readonly number[] {
  const values = new Set([ZERO]);
  for (const condition of conditions) {
    const min = condition[minKey];
    const max = condition[maxKey];
    for (const value of [min, max === undefined ? undefined : max + ONE])
      if (
        value !== undefined &&
        Number.isSafeInteger(value) &&
        value >= ZERO &&
        value < limit
      )
        values.add(value);
  }
  return [...values].sort((left, right) => left - right);
}

/** Implements Design Doc v2 → Event schema and roster: first-match variant witnesses. */
export function validatePresentations(
  event: MeetingEvent,
  arrival: AttendeeId | undefined,
  target: string | undefined,
  add: (path: string, rule: string) => void,
): void {
  const variants = event.variants ?? [];
  const reached = new Set<Presentation>();
  const problems = new Set<string>();
  const baseline = initialState('content-validation');
  const conditions = [
    event.when,
    ...variants.map((variant) => variant.when),
    ...[event, ...variants].flatMap((presentation) =>
      presentation.responses.map((response) => response.requires),
    ),
  ].filter((condition): condition is Condition => condition !== undefined);
  const minutes = boundaries(
    conditions,
    'minMinute',
    'maxMinute',
    INITIAL_BOOKING_END,
  );
  const riskLevels = boundaries(
    conditions,
    'minRisks',
    'maxRisks',
    RISKS_MAX + ONE,
  );
  for (const present of legalRosters) {
    if (arrival !== undefined && present.includes(arrival)) continue;
    for (const minute of minutes) {
      for (const risks of riskLevels) {
        const state: MeetingState = { ...baseline, minute, risks, present };
        if (!matchesCondition(state, event.when)) continue;
        const selected =
          variants.find((variant) => matchesCondition(state, variant.when)) ??
          event;
        reached.add(selected);
        if (
          selected.speaker !== 'room' &&
          selected.speaker !== arrival &&
          !present.includes(selected.speaker)
        )
          problems.add('speaker-presence');
        if (
          !selected.responses.some((response) =>
            matchesCondition(state, response.requires),
          )
        )
          problems.add('enabled-response');
        if (
          target !== undefined &&
          !selected.responses.some(
            (response) =>
              response.effect.callback?.eventId === target &&
              matchesCondition(state, response.requires),
          )
        )
          problems.add('reachable-scheduler');
      }
    }
  }
  for (const rule of problems) add(event.id, rule);
  if (reached.size === ZERO) add(event.id, 'event-reachability');
  for (const [index, presentation] of variants.entries())
    if (!reached.has(presentation))
      add(
        `${event.id}.presentations[${index + ONE}]`,
        'presentation-reachability',
      );
  if (
    event.kind === 'substantive' &&
    event.when?.present?.some((id) => id !== DECISION_OWNER)
  )
    add(event.id, 'substantive-absence');
}

/** Implements Design Doc v2 → Event schema and roster and Results card: authored catalog limits. */
export function validateCatalog(
  catalog: ValidationCatalog | undefined,
  events: readonly MeetingEvent[],
  text: (value: string, limit: number, path: string) => void,
  unique: (ids: readonly string[], path: string) => void,
  reference: (id: string, path: string) => void,
  add: (path: string, rule: string) => void,
): void {
  if (catalog === undefined) return;
  if (catalog.eventFiles !== undefined) {
    unique(
      catalog.eventFiles.map((file) => file.id),
      'eventFiles',
    );
    if (
      catalog.eventFiles.length !== events.length ||
      events.some(
        (event) => !catalog.eventFiles?.some((file) => file.id === event.id),
      )
    )
      add('eventFiles', 'file-coverage');
    for (const file of catalog.eventFiles)
      if (
        file.id !== file.stem ||
        !events.some((event) => event.id === file.id)
      )
        add(file.id, 'file-id');
  }
  if (catalog.attendees !== undefined) {
    unique(
      catalog.attendees.map((attendee) => attendee.id),
      'attendees',
    );
    for (const attendee of catalog.attendees) {
      reference(attendee.id, 'attendees');
      text(attendee.role, ROLE_CODE_POINTS, attendee.id);
    }
    if (
      ATTENDEE_IDS.some(
        (id) => !catalog.attendees?.some((attendee) => attendee.id === id),
      )
    )
      add('attendees', 'attendee-coverage');
  }
  if (catalog.titles !== undefined) {
    unique(
      catalog.titles.map((title) => title.id),
      'titles',
    );
    for (const title of catalog.titles)
      text(title.name, TITLE_CODE_POINTS, title.id);
  }
  for (const [key, value] of Object.entries(catalog.disabledReasons ?? {}))
    text(value, LINE_CODE_POINTS, key);
  for (const line of [...(catalog.moments ?? []), ...(catalog.epilogues ?? [])])
    text(line, LINE_CODE_POINTS, 'results-copy');
}
