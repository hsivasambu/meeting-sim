import {
  ATTENDEE_IDS,
  INITIAL_ATTENDEES,
  LINE_CODE_POINTS,
  LABEL_CODE_POINTS,
  ROLE_CODE_POINTS,
  TITLE_CODE_POINTS,
  ZERO,
  ONE,
  MAX_HEADCOUNT,
  OUTCOME_MAX,
  EFFICIENCY_MAX,
  DECISIONS_MAX,
  LUNCH_COPY_MINUTE_BOUND,
  LUNCH_COPY_PM_BOUND,
} from './constants';
import { formatCost } from './score';
import type { LunchCatalog, LunchContentPack } from './types';

/** Validate every catalog substitution, including all cuisines, people and park topics. */
export function validateLunchCatalog(
  pack: LunchContentPack,
  catalog: LunchCatalog,
  add: (path: string, rule: string) => void,
): void {
  const unique = (values: readonly string[], path: string): void => {
    if (new Set(values).size !== values.length || values.some((v) => !v.trim()))
      add(path, 'catalog-ids');
  };
  unique(
    catalog.attendees.map((a) => a.id),
    'attendees',
  );
  unique(
    catalog.titles.map((t) => t.id),
    'titles',
  );
  unique(
    catalog.titles.map((t) => String(t.slot)),
    'title-slots',
  );
  unique(
    catalog.commentary.map((c) => c.id),
    'commentary',
  );
  unique(
    catalog.commentary.map((c) => String(c.priority)),
    'commentary-priority',
  );
  if (
    catalog.attendees.length !== ATTENDEE_IDS.length ||
    ATTENDEE_IDS.some((id) => !catalog.attendees.some((a) => a.id === id))
  )
    add('attendees', 'roster');
  for (const a of catalog.attendees)
    if (
      a.startsPresent !== INITIAL_ATTENDEES.some((id) => id === a.id) ||
      !a.name.trim() ||
      !a.role.trim() ||
      [...a.role].length > ROLE_CODE_POINTS ||
      !a.voice.trim()
    )
      add(a.id, 'attendee-catalog');
  const substitutions: Readonly<Record<string, readonly string[]>> = {
    cuisine: pack.cuisines.map((c) => c.name),
    agreedCuisine: pack.cuisines.map((c) => c.name),
    attendee: catalog.attendees.map((a) => a.name),
    topic: Object.values(catalog.parkTopics),
    minute: [String(LUNCH_COPY_MINUTE_BOUND)],
    headcount: [String(MAX_HEADCOUNT)],
    score: [String(OUTCOME_MAX + EFFICIENCY_MAX + DECISIONS_MAX)],
    unlocked: [String(catalog.titles.length)],
    title: catalog.titles.map((t) => t.name),
    cost: [formatCost(LUNCH_COPY_PM_BOUND)],
    seed: ['0123456789abcdef'],
    revision: [catalog.revision],
    roster: [catalog.attendees.map((a) => a.name).join(', ')],
  };
  const text = (
    value: string,
    limit: number,
    path: string,
    allowed: readonly string[] = [],
  ): void => {
    let rendered = [value];
    for (const token of new Set(
      [...value.matchAll(/\{(\w+)\}/g)].map((m) => m[ONE] ?? ''),
    )) {
      const choices = substitutions[token];
      if (choices === undefined || choices.length === ZERO) {
        add(path, 'placeholder');
        continue;
      }
      if (!allowed.includes(token)) add(path, 'placeholder-scope');
      rendered = rendered.flatMap((v) =>
        choices.map((choice) => v.replaceAll(`{${token}}`, choice)),
      );
    }
    if (
      rendered.some((v) => !v.trim() || [...v].length > limit || /[{}]/.test(v))
    )
      add(path, 'substituted-text');
  };
  for (const c of pack.cuisines) text(c.name, LINE_CODE_POINTS, c.id);
  for (const t of catalog.titles) {
    text(t.name, TITLE_CODE_POINTS, t.id);
    text(
      t.flavour,
      LINE_CODE_POINTS,
      t.id,
      [
        'efficient-facilitator',
        'lunch-agreed',
        'death-by-diligence',
        'table-for-six',
        'second-helping',
      ].includes(t.id)
        ? ['agreedCuisine']
        : [],
    );
    if (
      !Number.isSafeInteger(t.slot) ||
      t.slot < ONE ||
      t.slot > catalog.titles.length ||
      !t.predicate.trim()
    )
      add(t.id, 'title-slot');
  }
  for (const c of catalog.commentary) {
    text(
      c.line,
      LINE_CODE_POINTS,
      c.id,
      c.id === 'agreement-commentary' ? ['agreedCuisine'] : [],
    );
    if (
      !Number.isSafeInteger(c.priority) ||
      c.priority < ONE ||
      !c.predicate.trim() ||
      catalog.titles.some((t) => t.id === c.id)
    )
      add(c.id, 'commentary');
  }
  // Tokens belong to authored surfaces, not to a global formatting namespace.
  const interfaceTokens: Readonly<Record<string, readonly string[]>> = {
    'room-accessible': ['roster'],
    considering: ['cuisine'],
    'success-result': ['agreedCuisine'],
    'success-summary': ['agreedCuisine'],
    'ended-decision': ['agreedCuisine'],
    'fallback-decision-heading': ['agreedCuisine'],
    'share-success': ['agreedCuisine'],
    'failure-nomination': ['cuisine'],
    'share-nomination': ['cuisine'],
    'collection-count': ['unlocked'],
    'newly-earned': ['title'],
    'share-score': ['score'],
    'share-time': ['minute'],
    'share-cost': ['cost'],
    'share-peak': ['headcount'],
    'share-seed': ['seed'],
    'share-revision': ['revision'],
  };
  for (const [key, value] of Object.entries(catalog.disabledReasons))
    text(value, LINE_CODE_POINTS, key);
  for (const [key, value] of Object.entries(catalog.interfaceCopy))
    text(value, LINE_CODE_POINTS, key, interfaceTokens[key] ?? []);
  for (const [key, value] of Object.entries(catalog.epilogues))
    text(
      value,
      LINE_CODE_POINTS,
      key,
      key === 'decision' ? ['agreedCuisine'] : [],
    );
  for (const [key, value] of Object.entries(catalog.moments))
    text(
      value,
      LINE_CODE_POINTS,
      key,
      key === 'first-postponed'
        ? ['minute', 'topic']
        : key === 'first-arrival'
          ? ['attendee', 'minute']
          : key === 'decision-fallback'
            ? ['agreedCuisine']
            : [],
    );
  for (const event of [...pack.events, ...pack.callbacks, pack.filler])
    for (const p of [event, ...(event.variants ?? [])]) {
      const allowed =
        event.id === pack.eventRules.nominationEventId ? [] : ['cuisine'];
      text(p.line, LINE_CODE_POINTS, event.id, allowed);
      for (const r of p.responses) {
        text(r.label, LABEL_CODE_POINTS, `${event.id}/${r.id}`, allowed);
        text(r.description, LINE_CODE_POINTS, `${event.id}/${r.id}`, allowed);
        for (const o of r.outcomes)
          text(o.line, LINE_CODE_POINTS, `${event.id}/${r.id}/${o.id}`, [
            'cuisine',
          ]);
      }
    }
  const parks = [...pack.events, ...pack.callbacks, pack.filler].flatMap((e) =>
    e.responses
      .filter((r) => r.technique === 'park')
      .map((r) => `${e.id} / ${r.id}`),
  );
  if (
    Object.keys(catalog.parkTopics).length !== parks.length ||
    parks.some((key) => !catalog.parkTopics[key]?.trim())
  )
    add('parkTopics', 'park-topics');
  for (const ending of [
    'decision',
    'called-early',
    'time-expired',
    'cancelled',
  ]) {
    const line = catalog.epilogues[ending];
    if (
      line === undefined ||
      line.includes('{agreedCuisine}') !== (ending === 'decision')
    )
      add(ending, 'epilogue');
  }
  for (const key of [
    'success-result',
    'success-summary',
    'ended-decision',
    'fallback-decision-heading',
    'share-success',
  ])
    if (!catalog.interfaceCopy[key]?.includes('{agreedCuisine}'))
      add(key, 'success-cuisine');
  for (const key of [
    'failure-result',
    'failure-nomination',
    'share-nomination',
    'share-early',
    'share-expired',
    'share-cancelled',
  ])
    if (
      catalog.interfaceCopy[key] === undefined ||
      catalog.interfaceCopy[key]?.includes('{agreedCuisine}')
    )
      add(key, 'failure-cuisine');
}
