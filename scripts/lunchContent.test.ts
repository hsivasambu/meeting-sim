import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  lunchCatalog as authoredCatalog,
  lunchContentPack as authoredPack,
} from '../src/core/content/lunch';
import { validateLunchContent } from '../src/core/engine/contentValidationLunch';
import { getDrawCandidatesWith } from '../src/core/engine/draw';
import {
  getResponseOutcomesWithRules,
  resolveWithRules,
} from '../src/core/engine/resolve';
import { initialLunchState, callIt } from '../src/core/engine/state';
import { previewWithRules } from '../src/core/engine/preview';
import { score } from '../src/core/engine/score';
import { earnedLunchTitles } from '../src/core/engine/titleRules';
import { W_COST, UTILITY_COST_PM } from '../src/core/engine/constants';
import { deepFreeze } from '../src/core/engine/fixtures/transitions';
import type {
  Condition,
  LunchState,
  OutcomeResponse,
  PresentedEvent,
  LunchContentPack,
  LunchCatalog,
  LunchUtilityRules,
} from '../src/core/engine/types';

const pack: LunchContentPack = authoredPack;
const lunchCatalog: LunchCatalog = authoredCatalog;
interface Row {
  section: string;
  line: number;
  cells: Record<string, string>;
}
const source = readFileSync(
  new URL('../docs/content-table.md', import.meta.url),
  'utf8',
);
const rows: Row[] = [];
let section = '';
let header: string[] | undefined;
for (const [index, line] of source.split(/\r?\n/).entries()) {
  if (line.startsWith('#')) {
    section = line.replace(/^#+ /, '');
    header = undefined;
  }
  if (!line.startsWith('|')) {
    header = undefined;
    continue;
  }
  const cells = line
    .split('|')
    .slice(1, -1)
    .map((c) => c.trim());
  if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
  if (header === undefined) header = cells;
  else
    rows.push({
      section,
      line: index + 1,
      cells: Object.fromEntries(header.map((key, i) => [key, cells[i] ?? ''])),
    });
}
function cell(row: Row, key: string): string {
  const value = row.cells[key];
  if (value === undefined) throw new Error(`Missing ${key} at ${row.line}`);
  return value;
}
function condition(value: string): Condition | undefined {
  if (value === '—') return undefined;
  const object: Record<string, unknown> = {};
  for (const clause of value.split(';')) {
    const [key, raw] = clause.split(':').map((s) => s.trim());
    if (key === undefined || raw === undefined) throw new Error(value);
    object[key] = key === 'present' || key === 'absent' ? [raw] : Number(raw);
  }
  // Equality audit consumes serialized data; no unchecked cast enters the engine.
  return object;
}
const all = [...pack.events, ...pack.callbacks, pack.filler];
const rules: LunchUtilityRules = {
  profile: 'lunch',
  costWeight: W_COST,
  costUnit: UTILITY_COST_PM,
  eventRules: pack.eventRules,
  cuisines: pack.cuisines,
};
function presentation(
  state: LunchState,
  id: string,
): PresentedEvent<OutcomeResponse> {
  const event = getDrawCandidatesWith(
    pack,
    deepFreeze({ ...state, current: null }),
  ).find((c) => c.event.id === id)?.event;
  if (event === undefined)
    throw new Error(`Ineligible ${id} at ${state.turn}/${state.minute}`);
  const responses = event.responses.filter(
    (r): r is OutcomeResponse => 'outcomes' in r,
  );
  expect(responses).toHaveLength(event.responses.length);
  return { ...event, responses };
}
function pending(state: LunchState, id: string): LunchState {
  const current = presentation(state, id);
  return {
    ...state,
    current,
    scheduled: state.scheduled.filter((s) => s.eventId !== current.id),
    substantiveDrawCount:
      state.substantiveDrawCount + (current.kind === 'substantive' ? 1 : 0),
    previousDrawWasUncommonNegative:
      current.rarity === 'uncommon' && current.negative,
    seenEventIds: [...new Set([...state.seenEventIds, id])],
  };
}
function step(
  state: LunchState,
  id: string,
  response: string,
  outcome?: string,
): LunchState {
  const before = deepFreeze(pending(state, id));
  if (outcome === undefined) return resolveWithRules(before, response, rules);
  const next = getResponseOutcomesWithRules(before, response, rules).find(
    (b) => b.outcomeId === outcome,
  )?.state;
  if (next === undefined) throw new Error('Missing branch');
  return next;
}
const nominated = step(
  initialLunchState('content-witness'),
  'nominate-cuisine',
  'thai',
);
const baseline: LunchState = {
  ...nominated,
  turn: 2,
  substantiveDrawCount: 2,
  seenEventIds: ['nominate-cuisine', 'portion-plan'],
};

it('validates the approved injected pack and complete catalogs', () => {
  expect(validateLunchContent(pack, lunchCatalog)).toEqual([]);
  expect([pack.events.length, pack.callbacks.length, all.length]).toEqual([
    17, 3, 21,
  ]);
  expect(
    readdirSync(new URL('../src/core/content/lunch/events/', import.meta.url))
      .map((f) => f.replace('.ts', ''))
      .sort(),
  ).toEqual(all.map((e) => e.id).sort());
});

// Every reviewed mechanical and copy cell is compared, not a snapshot blessing.
describe('reviewed rows', () => {
  for (const row of rows.filter((r) => 'Family when' in r.cells))
    it(`family row ${row.line}`, () => {
      const e = all.find((e) => e.id === cell(row, 'ID'));
      expect(e).toBeDefined();
      expect(e).toMatchObject({
        id: cell(row, 'ID'),
        kind: cell(row, 'Kind'),
        rarity: cell(row, 'Rarity'),
        weight: Number(cell(row, 'Weight')),
        negative: cell(row, 'Negative') === 'true',
      });
      expect(e?.when).toEqual(condition(cell(row, 'Family when')));
    });
  for (const row of rows.filter((r) => 'Presentation' in r.cells))
    it(`presentation row ${row.line}`, () => {
      const e = all.find((e) => e.id === row.section);
      const p = cell(row, 'Presentation') === 'base' ? e : e?.variants?.[0];
      expect(p?.speaker).toBe(cell(row, 'Speaker'));
      expect(p?.line).toBe(cell(row, 'Opening line'));
      if (cell(row, 'Presentation') !== 'base')
        expect(p?.when).toEqual(condition(cell(row, 'Variant when')));
      expect(cell(row, 'Response set')).toBe(row.section);
    });
  for (const row of rows.filter((r) => 'Outcome line' in r.cells))
    it(`outcome row ${row.line}: ${row.section}/${cell(row, 'Response')}/${cell(row, 'Outcome')}`, () => {
      const e = all.find((e) => e.id === row.section);
      const r = e?.responses.find((r) => r.id === cell(row, 'Response'));
      const o = r?.outcomes.find((o) => o.id === cell(row, 'Outcome'));
      expect(r).toMatchObject({
        label: cell(row, 'Label'),
        description: cell(row, 'Description'),
        technique: cell(row, 'Technique'),
      });
      expect(r?.requires).toEqual(condition(cell(row, 'Requires')));
      expect(r?.disabledReasonKey).toBe(
        cell(row, 'Reason key') === '—' ? undefined : cell(row, 'Reason key'),
      );
      const effect = {
        minutes: Number(cell(row, 'Min')),
        progress: Number(cell(row, 'P')),
        ...(cell(row, 'Join') === '—' ? {} : { joins: [cell(row, 'Join')] }),
        ...(cell(row, 'CB') === '—'
          ? {}
          : { callback: { eventId: cell(row, 'CB'), afterTurns: 2 } }),
        ...(cell(row, 'End') === '—'
          ? {}
          : { bookingEnd: Number(cell(row, 'End')) }),
        ...(cell(row, 'Nom') === '—'
          ? {}
          : { nominateCuisine: cell(row, 'Nom') }),
      };
      expect(o).toEqual({
        id: cell(row, 'Outcome'),
        weight: Number(cell(row, 'Weight')),
        effect,
        line: cell(row, 'Outcome line'),
      });
      for (const v of e?.variants ?? [])
        expect(v.responses).toEqual(e?.responses);
    });
});

it('audits every catalog and relationship row in order, without extra entries', () => {
  const data = (name: string) =>
    rows.filter((r) => r.section === name).map((r) => r.cells);
  expect(pack.cuisines.map((c) => ({ ID: c.id, Name: c.name }))).toEqual(
    data('Cuisine catalog'),
  );
  expect(
    lunchCatalog.attendees.map((a) => ({
      ID: a.id,
      Name: a.name,
      Role: a.role,
      'Starts present': a.startsPresent ? 'yes' : 'no',
      'Voice / comic friction': a.voice,
    })),
  ).toEqual(data('Attendees and voice guide'));
  expect(
    lunchCatalog.titles.map((t) => ({
      Slot: String(t.slot),
      ID: t.id,
      Name: t.name,
      'Exact predicate': t.predicate,
      'Flavour line': t.flavour,
    })),
  ).toEqual(data('Title catalog'));
  expect(
    lunchCatalog.commentary.map((c) => ({
      ID: c.id,
      Priority: String(c.priority),
      Predicate: c.predicate,
      Line: c.line,
    })),
  ).toEqual(data('Fourth-wall commentary'));
  expect(
    Object.entries(lunchCatalog.disabledReasons).map(([Key, Copy]) => ({
      Key,
      Copy,
    })),
  ).toEqual(data('Disabled reasons'));
  expect(
    Object.entries(lunchCatalog.interfaceCopy).map(([Key, Copy]) => ({
      Key,
      Copy,
    })),
  ).toEqual(data('Interface, results and share copy'));
  expect(
    Object.entries(lunchCatalog.epilogues).map(([Key, Line]) => ({
      Key,
      Ending: Key,
      Line,
    })),
  ).toEqual(data('Epilogues and factual moments').filter((r) => 'Ending' in r));
  expect(
    Object.entries(lunchCatalog.parkTopics).map(([key, Topic]) => ({
      'Event / park response': key,
      Topic,
    })),
  ).toEqual(data('Epilogues and factual moments').filter((r) => 'Topic' in r));
  expect(
    Object.entries(lunchCatalog.moments).map(([Key, Line]) => ({ Key, Line })),
  ).toEqual(
    data('Epilogues and factual moments')
      .filter((r) => 'Use' in r)
      .map((r) => ({ Key: r['Key'], Line: r['Line'] })),
  );
  expect(
    pack.eventRules.arrivalPermissions.map((p) => [
      p.eventId,
      p.responseId,
      p.attendeeId,
    ]),
  ).toEqual(
    rows
      .filter((r) => 'Attendee ID' in r.cells)
      .map((r) => [
        cell(r, 'Event ID'),
        cell(r, 'Response ID'),
        cell(r, 'Attendee ID'),
      ]),
  );
  expect(Object.entries(pack.eventRules.callbackTargets)).toEqual(
    rows
      .filter((r) => 'Parent' in r.cells)
      .map((r) => [cell(r, 'Parent'), cell(r, 'Target')]),
  );
  for (const e of all)
    expect(e.responses.map((r) => r.id)).toEqual([
      ...new Set(
        rows
          .filter((row) => row.section === e.id && 'Outcome line' in row.cells)
          .map((row) => cell(row, 'Response')),
      ),
    ]);
  expect(
    all.flatMap((e) => e.responses.flatMap((r) => r.outcomes)),
  ).toHaveLength(rows.filter((r) => 'Outcome line' in r.cells).length);
});

for (const e of all)
  it(`constructed presentation, requirements and every outcome: ${e.id}`, () => {
    const states: readonly LunchState[] =
      e.id === 'nominate-cuisine'
        ? [initialLunchState('witness')]
        : [
            baseline,
            { ...baseline, present: [...baseline.present, 'legal'] },
            { ...baseline, present: [...baseline.present, 'vp'] },
            { ...baseline, present: [...baseline.present, 'legal', 'vp'] },
          ];
    const reached = new Set<string>();
    for (const s of states) {
      const state: LunchState = {
        ...s,
        minute: 15,
        scheduled:
          e.kind === 'callback' ? [{ eventId: e.id, dueTurn: s.turn }] : [],
        seenEventIds:
          e.kind === 'callback'
            ? [
                ...s.seenEventIds,
                ...Object.entries(pack.eventRules.callbackTargets)
                  .filter(([, target]) => target === e.id)
                  .map(([parent]) => parent),
              ]
            : e === pack.filler
              ? pack.events.map((e) => e.id)
              : s.seenEventIds.filter((id) => id !== e.id),
      };
      if (!getDrawCandidatesWith(pack, state).some((c) => c.event.id === e.id))
        continue;
      const before = deepFreeze(pending(state, e.id));
      const p = before.current;
      if (p === null) throw new Error('Missing presentation');
      reached.add(p.line);
      for (const r of p.responses) {
        const preview = previewWithRules(before, r, rules);
        if (!preview.enabled) {
          expect(lunchCatalog.disabledReasons).toHaveProperty(
            preview.reasonKey,
          );
          expect(() => resolveWithRules(before, r.id, rules)).toThrow();
          continue;
        }
        const branches = getResponseOutcomesWithRules(before, r.id, rules);
        expect(branches.map((b) => b.outcomeId).sort()).toEqual(
          r.outcomes.map((o) => o.id).sort(),
        );
        for (const b of branches) {
          expect(b.state.turn).toBe(before.turn + 1);
          expect(b.state.personMinutes).toBe(
            before.personMinutes +
              (b.state.minute - before.minute) * before.present.length,
          );
          expect(b.state.nominatedCuisine).toBe(
            e.id === 'nominate-cuisine'
              ? r.outcomes[0]?.effect.nominateCuisine
              : before.nominatedCuisine,
          );
          expect(
            b.state.log.filter((entry) => entry.type === 'resolve').at(-1),
          ).toMatchObject({ outcomeId: b.outcomeId });
        }
        expect(resolveWithRules(before, r.id, rules)).toEqual(
          resolveWithRules(before, r.id, rules),
        );
        expect(
          branches.some(
            (b) =>
              JSON.stringify(b.state) ===
              JSON.stringify(resolveWithRules(before, r.id, rules)),
          ),
        ).toBe(true);
      }
    }
    expect(reached).toEqual(
      new Set([e.line, ...(e.variants ?? []).map((v) => v.line)]),
    );
  });

for (const name of [
  'Success with a callback, no rare gifts',
  'Failure with an arrival and shortened booking',
  'Invitations, higher subsequent cost and a second presentation',
])
  it(`engine walkthrough: ${name}`, () => {
    let state = initialLunchState(name);
    for (const row of rows.filter(
      (r) => r.section === name && 'H billed' in r.cells,
    )) {
      expect(state.present.length).toBe(Number(cell(row, 'H billed')));
      state = step(
        state,
        cell(row, 'Family'),
        cell(row, 'Response'),
        cell(row, 'Outcome'),
      );
      expect([state.progress, state.minute, state.personMinutes]).toEqual(
        ['P after', 'T after', 'pm total'].map((k) => Number(cell(row, k))),
      );
    }
    expect(state.ending).toBe(
      name.startsWith('Failure') ? 'time-expired' : 'decision',
    );
    expect(state.agreedCuisine).toBe(
      name.startsWith('Failure') ? null : state.nominatedCuisine,
    );
    const titles = earnedLunchTitles(state, score(state));
    expect(titles).toEqual(
      expect.arrayContaining(
        name.startsWith('Failure')
          ? ['calendar-criminal']
          : name.startsWith('Invitations')
            ? ['lunch-agreed', 'reply-all-royalty']
            : ['lunch-agreed', 'table-for-six', 'second-helping'],
      ),
    );
  });
for (const row of rows.filter((r) => r.section === 'Every callback due at n+2'))
  it(`callback mini-route ${row.line}`, () => {
    let state = initialLunchState('callback');
    for (const address of cell(row, 'Ordered resolutions').split('; ')) {
      const [event, response] = address.split('/');
      if (event === undefined || response === undefined)
        throw new Error(address);
      state = step(state, event, response);
    }
    expect([state.progress, state.minute, state.personMinutes]).toEqual(
      ['Final P', 'T', 'pm'].map((k) => Number(cell(row, k))),
    );
    expect(state.resolvedCallbackCount).toBe(1);
  });
it('nomination equality, cancel and early ending retain cuisine truth', () => {
  for (const c of pack.cuisines) {
    const state = step(initialLunchState(c.id), 'nominate-cuisine', c.id);
    expect([
      state.progress,
      state.minute,
      state.personMinutes,
      state.present.length,
    ]).toEqual([8, 2, 12, 6]);
    expect(state.decisions[0]?.qualityFraction).toBeNull();
    expect(callIt(state).agreedCuisine).toBeNull();
  }
  expect(callIt(initialLunchState('cancel')).ending).toBe('cancelled');
});

it('enforces invitation before/after arrivals and the inclusive Pat doorway boundary', () => {
  for (const [id, who, door, reason] of [
    ['menu-needs', 'legal', 'alex-arrives', 'alex-present'],
    ['quick-agreement', 'vp', 'pat-arrives', 'pat-present'],
  ] as const) {
    const absent = pending(baseline, id);
    const response = absent.current?.responses.find((r) => r.id === 'invite');
    if (response === undefined) throw new Error(id);
    expect(previewWithRules(absent, response, rules).enabled).toBe(true);
    const arrived = step({ ...baseline, minute: 15 }, door, 'timebox');
    expect(
      getDrawCandidatesWith(pack, arrived).some((c) => c.event.id === door),
    ).toBe(false);
    const after = pending(arrived, id);
    expect(previewWithRules(after, response, rules)).toMatchObject({
      enabled: false,
      reasonKey: reason,
    });
    for (const b of getResponseOutcomesWithRules(absent, 'invite', rules)) {
      expect(b.state.present.filter((id) => id === who)).toHaveLength(1);
      expect(
        getDrawCandidatesWith(pack, b.state).some((c) => c.event.id === door),
      ).toBe(false);
    }
  }
  expect(
    getDrawCandidatesWith(pack, { ...baseline, minute: 14 }).some(
      (c) => c.event.id === 'pat-arrives',
    ),
  ).toBe(false);
  expect(
    getDrawCandidatesWith(pack, { ...baseline, minute: 15 }).some(
      (c) => c.event.id === 'pat-arrives',
    ),
  ).toBe(true);
});

it('constructs all twelve title slots from the approved routes and counters', () => {
  function route(actions: readonly string[]): LunchState {
    let s = initialLunchState('title');
    for (const action of actions) {
      const [e, r] = action.split('/');
      if (e === undefined || r === undefined) throw new Error(action);
      s = step(s, e, r);
    }
    return s;
  }
  const high = route([
    'nominate-cuisine/thai',
    'menu-needs/hear',
    'menu-read/ack',
    'small-concession/ack',
    'portion-plan/owner',
    'spice-question/hear',
  ]);
  expect(score(high).total).toBe(960);
  expect(earnedLunchTitles(high, score(high))).toEqual(
    expect.arrayContaining(['inbox-zero', 'efficient-facilitator']),
  );
  const parked = route([
    'nominate-cuisine/thai',
    'portion-plan/email',
    'projector/park',
    'lunch-committee/park',
    'soup-debate/park',
    'menu-needs/park',
    'soup-return/refocus',
    'menu-return/timebox',
  ]);
  expect([
    parked.progress,
    parked.minute,
    parked.personMinutes,
    parked.parkedCount,
  ]).toEqual([29, 12, 72, 4]);
  expect(earnedLunchTitles(callIt(parked), score(callIt(parked)))).toContain(
    'parking-lot-attendant',
  );
  const early = callIt(route(['nominate-cuisine/thai', 'menu-needs/hear']));
  expect(earnedLunchTitles(early, score(early))).toEqual(
    expect.arrayContaining(['played-it-right', 'take-this-offline']),
  );
  const cancel = callIt(initialLunchState('cancel'));
  expect(earnedLunchTitles(cancel, score(cancel))).toContain(
    'could-have-been-an-email',
  );
  const slow = route([
    'nominate-cuisine/italian',
    'menu-needs/hear',
    'projector/park',
    'lunch-history/hear',
    'introductions/hear',
    'portion-plan/owner',
    'spice-question/hear',
    'soup-debate/park',
    'chair-arrangement/refocus',
    'soup-return/refocus',
    'lunch-window/timebox',
    'quick-agreement/hear',
  ]);
  expect([slow.minute, slow.personMinutes]).toEqual([50, 300]);
  expect(earnedLunchTitles(slow, score(slow))).toContain('death-by-diligence');
});

it.each([
  [
    'duplicate event',
    (p: LunchContentPack): LunchContentPack => ({
      ...p,
      events: [...p.events, ...p.events],
    }),
  ],
  [
    'missing nomination',
    (p: LunchContentPack): LunchContentPack => ({
      ...p,
      eventRules: { ...p.eventRules, nominationEventId: 'missing' },
    }),
  ],
  [
    'missing callback',
    (p: LunchContentPack): LunchContentPack => ({ ...p, callbacks: [] }),
  ],
  [
    'missing arrival',
    (p: LunchContentPack): LunchContentPack => ({
      ...p,
      eventRules: { ...p.eventRules, arrivalAttendees: { missing: 'vp' } },
    }),
  ],
  [
    'missing booking',
    (p: LunchContentPack): LunchContentPack => ({
      ...p,
      eventRules: { ...p.eventRules, bookingEventIds: ['missing'] },
    }),
  ],
  [
    'unused permission',
    (p: LunchContentPack): LunchContentPack => ({
      ...p,
      eventRules: {
        ...p.eventRules,
        arrivalPermissions: [
          ...p.eventRules.arrivalPermissions,
          { eventId: 'missing', responseId: 'missing', attendeeId: 'vp' },
        ],
      },
    }),
  ],
  [
    'invalid filler',
    (p: LunchContentPack): LunchContentPack => ({
      ...p,
      filler: { ...p.filler, when: { minMinute: 99 }, kind: 'tangent' },
    }),
  ],
  [
    'cuisine count',
    (p: LunchContentPack): LunchContentPack => ({ ...p, cuisines: [] }),
  ],
] as const)('rejects %s', (_name, change) => {
  expect(
    validateLunchContent(change(pack), lunchCatalog).length,
  ).toBeGreaterThan(0);
});

it.each([
  [
    'invalid weight',
    (r: OutcomeResponse): OutcomeResponse => ({
      ...r,
      outcomes: r.outcomes.map((o) => ({ ...o, weight: 0 })),
    }),
  ],
  [
    'ticket overflow',
    (r: OutcomeResponse): OutcomeResponse => ({
      ...r,
      outcomes: r.outcomes.map((o) => ({ ...o, weight: 65537 })),
    }),
  ],
  [
    'duplicate branch',
    (r: OutcomeResponse): OutcomeResponse => ({
      ...r,
      outcomes: [...r.outcomes, ...r.outcomes, ...r.outcomes],
    }),
  ],
  [
    'invalid effect',
    (r: OutcomeResponse): OutcomeResponse => ({
      ...r,
      outcomes: r.outcomes.map((o) => ({
        ...o,
        effect: { minutes: 0, progress: 26, risks: 1 },
      })),
    }),
  ],
  [
    'invalid cuisine',
    (r: OutcomeResponse): OutcomeResponse => ({
      ...r,
      outcomes: r.outcomes.map((o) => ({
        ...o,
        effect: { ...o.effect, nominateCuisine: 'unknown' },
      })),
    }),
  ],
  [
    'invalid booking',
    (r: OutcomeResponse): OutcomeResponse => ({
      ...r,
      outcomes: r.outcomes.map((o) => ({
        ...o,
        effect: { ...o.effect, bookingEnd: 45 },
      })),
    }),
  ],
  [
    'invalid join',
    (r: OutcomeResponse): OutcomeResponse => ({
      ...r,
      outcomes: r.outcomes.map((o) => ({
        ...o,
        effect: { ...o.effect, joins: ['vp', 'vp'] },
      })),
    }),
  ],
  [
    'invalid callback',
    (r: OutcomeResponse): OutcomeResponse => ({
      ...r,
      outcomes: r.outcomes.map((o) => ({
        ...o,
        effect: {
          ...o.effect,
          callback: { eventId: 'missing', afterTurns: 2 },
        },
      })),
    }),
  ],
  [
    'invalid condition',
    (r: OutcomeResponse): OutcomeResponse => ({
      ...r,
      requires: {
        minMinute: 5,
        maxMinute: 1,
        minRisks: 1,
        present: ['legal'],
        absent: ['legal'],
      },
    }),
  ],
  [
    'unused reason',
    (r: OutcomeResponse): OutcomeResponse => ({
      ...r,
      disabledReasonKey: 'missing',
    }),
  ],
  [
    'missing reason',
    (r: OutcomeResponse): OutcomeResponse => ({
      ...r,
      requires: { present: ['legal'] },
    }),
  ],
  [
    'numeric preview',
    (r: OutcomeResponse): OutcomeResponse => ({
      ...r,
      label: 'Gain 10 progress',
    }),
  ],
  [
    'blank copy',
    (r: OutcomeResponse): OutcomeResponse => ({ ...r, description: '' }),
  ],
  [
    'no deterministic fallback',
    (r: OutcomeResponse): OutcomeResponse => ({
      ...r,
      outcomes: [
        ...r.outcomes,
        { id: 'other', weight: 1, effect: { minutes: 1 }, line: 'Fixture.' },
      ],
    }),
  ],
] as const)('rejects response %s', (_name, change) => {
  const changed: LunchContentPack = {
    ...pack,
    events: pack.events.map((e) =>
      e.id === 'portion-plan'
        ? { ...e, responses: e.responses.map(change) }
        : e,
    ),
  };
  expect(validateLunchContent(changed, lunchCatalog).length).toBeGreaterThan(0);
});

it.each([
  [
    'unknown placeholder',
    (c: LunchCatalog) => ({
      ...c,
      interfaceCopy: { ...c.interfaceCopy, objective: '{unknown}' },
    }),
  ],
  [
    'oversize substitution',
    (c: LunchCatalog) => ({
      ...c,
      parkTopics: { ...c.parkTopics, 'menu-needs / park': 'x'.repeat(100) },
    }),
  ],
  [
    'success cuisine',
    (c: LunchCatalog) => ({
      ...c,
      interfaceCopy: { ...c.interfaceCopy, 'success-result': 'Agreed' },
    }),
  ],
  [
    'false failure',
    (c: LunchCatalog) => ({
      ...c,
      epilogues: { ...c.epilogues, cancelled: '{agreedCuisine}' },
    }),
  ],
  [
    'duplicate title',
    (c: LunchCatalog) => ({ ...c, titles: [...c.titles, ...c.titles] }),
  ],
  ['bad roster', (c: LunchCatalog) => ({ ...c, attendees: [] })],
  [
    'unused reason',
    (c: LunchCatalog) => ({
      ...c,
      disabledReasons: { ...c.disabledReasons, unused: 'Unused.' },
    }),
  ],
  [
    'bad commentary',
    (c: LunchCatalog) => ({
      ...c,
      commentary: c.commentary.map((m) => ({
        ...m,
        id: 'lunch-agreed',
        priority: 0,
      })),
    }),
  ],
] as const)('rejects catalog %s', (_name, change) => {
  expect(
    validateLunchContent(pack, change(lunchCatalog)).length,
  ).toBeGreaterThan(0);
});

it.each([
  ['menu-needs', 'invite', '124', '25', '77', '150'],
  ['quick-agreement', 'refocus', '147', '25', '0', '1'],
  ['spice-question', 'timebox', '128', '15', '73', '96'],
])(
  'preserves approved expected utility and pre-roll q for %s/%s',
  (event, response, n, d, qn, qd) => {
    const start =
      event === 'spice-question'
        ? step(nominated, 'portion-plan', 'email')
        : nominated;
    const before = pending({ ...start, substantiveDrawCount: 2 }, event);
    const r = before.current?.responses.find((r) => r.id === response);
    if (r === undefined) throw new Error(event);
    const preview = previewWithRules(before, r, rules);
    if (!preview.enabled) throw new Error('Disabled witness');
    expect(BigInt(preview.expectedUtilityFraction.numerator) * BigInt(d)).toBe(
      BigInt(n) * BigInt(preview.expectedUtilityFraction.denominator),
    );
    for (const b of getResponseOutcomesWithRules(before, response, rules)) {
      const q = b.state.decisions.at(-1)?.qualityFraction;
      if (q === null || q === undefined) throw new Error('Unscored witness');
      expect(BigInt(q.numerator) * BigInt(qd)).toBe(
        BigInt(qn) * BigInt(q.denominator),
      );
    }
  },
);

it('covers approved deadline, completing join, clamping and filler witnesses', () => {
  for (const [progress, ending] of [
    [82, 'decision'],
    [81, 'time-expired'],
  ] as const) {
    const next = step(
      {
        ...baseline,
        seenEventIds: ['nominate-cuisine', 'menu-needs'],
        progress,
        minute: 59,
      },
      'portion-plan',
      'owner',
    );
    expect([
      next.progress,
      next.minute,
      next.personMinutes,
      next.ending,
    ]).toEqual([progress + 18, 63, 36, ending]);
  }
  const joined = step(
    { ...baseline, progress: 92, minute: 59 },
    'alex-arrives',
    'timebox',
  );
  expect(joined).toMatchObject({
    ending: 'decision',
    agreedCuisine: 'thai',
    present: [...baseline.present, 'legal'],
  });
  for (const minute of [44, 46])
    expect(
      step({ ...baseline, minute }, 'room-booked', 'timebox'),
    ).toMatchObject({
      minute: minute + 1,
      bookingEnd: 45,
      ending: 'time-expired',
    });
  for (const progress of [0, 95]) {
    const before = pending({ ...baseline, progress }, 'quick-agreement');
    const branches = getResponseOutcomesWithRules(before, 'refocus', rules);
    expect(
      branches.find((b) => b.outcomeId === 'objections')?.state.progress,
    ).toBe(Math.max(0, progress - 6));
    expect(
      branches.find((b) => b.outcomeId === 'momentum')?.state.progress,
    ).toBe(Math.min(100, progress + 23));
  }
  let exhausted: LunchState = {
    ...baseline,
    seenEventIds: pack.events.map((e) => e.id),
  };
  let turns = 0;
  while (exhausted.phase === 'running') {
    exhausted = step(exhausted, 'filler', 'ack');
    turns += 1;
  }
  expect(turns).toBeLessThanOrEqual(30);
  expect(exhausted.ending).toBe('time-expired');
  for (const [parent, target] of Object.entries(
    pack.eventRules.callbackTargets,
  )) {
    const parked = step(
      { ...baseline, seenEventIds: ['nominate-cuisine', 'portion-plan'] },
      parent,
      'park',
    );
    expect(parked.scheduled).toEqual([
      { eventId: target, dueTurn: baseline.turn + 2 },
    ]);
    const ended = callIt(parked);
    expect(getDrawCandidatesWith(pack, ended)).toEqual([]);
  }
});

it('keeps authored lunch replays immutable and bounded across constructed seeds', () => {
  for (let seed = 0; seed < 100; seed += 1) {
    const replay = () => {
      let s = initialLunchState(String(seed));
      let count = 0;
      while (s.phase === 'running') {
        const candidates = getDrawCandidatesWith(pack, s);
        const chosen = candidates[(seed + count) % candidates.length];
        if (chosen === undefined) throw new Error('Empty pool');
        const before = pending(s, chosen.event.id);
        const r = before.current?.responses.find(
          (r) => previewWithRules(before, r, rules).enabled,
        );
        if (r === undefined) throw new Error('No response');
        s = resolveWithRules(deepFreeze(before), r.id, rules);
        count += 1;
        expect(count).toBeLessThanOrEqual(50);
      }
      return s;
    };
    const state = replay();
    expect(replay()).toEqual(state);
    expect(state.present.length).toBeGreaterThanOrEqual(6);
    expect(state.agreedCuisine !== null).toBe(state.ending === 'decision');
  }
});

it('rejects shadowed variants, absent speakers, blocked responses and malformed nomination', () => {
  const base = pack.events.find((e) => e.id === 'portion-plan');
  if (base === undefined) throw new Error('Missing family');
  const changes = [
    { ...base, speaker: 'legal' as const },
    {
      ...base,
      responses: base.responses.map((r) => ({
        ...r,
        requires: { present: ['legal' as const] },
        disabledReasonKey: 'alex-absent',
      })),
    },
    {
      ...base,
      variants: [
        {
          when: {},
          speaker: base.speaker,
          line: base.line,
          responses: base.responses,
        },
        {
          when: {},
          speaker: base.speaker,
          line: base.line,
          responses: base.responses,
        },
      ],
    },
    { ...base, weight: 0 },
  ];
  for (const changed of changes)
    expect(
      validateLunchContent(
        {
          ...pack,
          events: pack.events.map((e) => (e.id === base.id ? changed : e)),
        },
        lunchCatalog,
      ),
    ).not.toEqual([]);
  const nomination = pack.events.find(
    (e) => e.id === pack.eventRules.nominationEventId,
  );
  if (nomination === undefined) throw new Error('Missing nomination');
  expect(
    validateLunchContent(
      {
        ...pack,
        events: pack.events.map((e) =>
          e === nomination ? { ...e, responses: e.responses.slice(1) } : e,
        ),
      },
      lunchCatalog,
    ),
  ).not.toEqual([]);
});
