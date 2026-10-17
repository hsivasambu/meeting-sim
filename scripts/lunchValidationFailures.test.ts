import { expect, it } from 'vitest';
import {
  lunchContentPack,
  lunchCatalog as authoredCatalog,
} from '../src/core/content/lunch';
import { validateLunchContent } from '../src/core/engine/contentValidationLunch';
import type {
  LunchContentPack,
  LunchCatalog,
  MeetingEvent,
  OutcomeResponse,
  ResponseOutcome,
} from '../src/core/engine/types';

const pack: LunchContentPack = lunchContentPack;
const catalog: LunchCatalog = authoredCatalog;
// Deliberately malformed runtime inputs without unchecked casts or changing originals.
function corrupt<T extends object>(
  value: T,
  key: string,
  replacement: unknown,
): T {
  return Object.defineProperty({ ...value }, key, {
    value: replacement,
    enumerable: true,
  });
}
function event(
  id: string,
  change: (e: MeetingEvent<OutcomeResponse>) => MeetingEvent<OutcomeResponse>,
): LunchContentPack {
  return {
    ...pack,
    events: pack.events.map((e) => (e.id === id ? change(e) : e)),
    callbacks: pack.callbacks.map((e) => (e.id === id ? change(e) : e)),
    filler: pack.filler.id === id ? change(pack.filler) : pack.filler,
  };
}
function response(
  change: (r: OutcomeResponse) => OutcomeResponse,
): LunchContentPack {
  return event('portion-plan', (e) => ({
    ...e,
    responses: e.responses.map((r, i) => (i === 0 ? change(r) : r)),
  }));
}
function outcome(
  change: (o: ResponseOutcome) => ResponseOutcome,
): LunchContentPack {
  return response((r) => ({
    ...r,
    outcomes: r.outcomes.map((o, i) => (i === 0 ? change(o) : o)),
  }));
}
const rp = 'portion-plan.presentation.0.owner';
const op = rp + '.individual';
interface Failure {
  rule: string;
  path: string;
  name?: string;
  pack?: () => LunchContentPack;
  catalog?: () => LunchCatalog;
}
const failures: readonly Failure[] = [
  {
    rule: 'unique-ids',
    path: 'events',
    pack: () => ({
      ...pack,
      events: [...pack.events, pack.events[0] ?? pack.filler],
    }),
  },
  {
    rule: 'cuisine-count',
    path: 'cuisines',
    pack: () => ({ ...pack, cuisines: pack.cuisines.slice(1) }),
  },
  {
    rule: 'nomination-shape',
    path: 'nomination',
    pack: () => event('nominate-cuisine', (e) => ({ ...e, rarity: 'rare' })),
  },
  {
    rule: 'nomination-equality',
    path: 'nominate-cuisine',
    pack: () =>
      event('nominate-cuisine', (e) => ({
        ...e,
        responses: e.responses.slice(1),
      })),
  },
  {
    rule: 'first-two-pool',
    path: 'events',
    pack: () => ({
      ...pack,
      events: pack.events.filter(
        (e) =>
          e.id === pack.eventRules.nominationEventId ||
          e.kind !== 'substantive' ||
          e.rarity !== 'common',
      ),
    }),
  },
  {
    rule: 'event-kind',
    path: 'portion-plan',
    pack: () => event('portion-plan', (e) => corrupt(e, 'kind', 'invalid')),
  },
  {
    rule: 'weight',
    path: 'portion-plan',
    pack: () => event('portion-plan', (e) => ({ ...e, weight: 0 })),
  },
  {
    rule: 'callback-shape',
    path: 'menu-return',
    pack: () => event('menu-return', (e) => ({ ...e, rarity: 'rare' })),
  },
  {
    rule: 'arrival-guard',
    path: 'alex-arrives',
    pack: () => event('alex-arrives', (e) => corrupt(e, 'when', undefined)),
  },
  {
    rule: 'response-count',
    path: 'portion-plan.presentation.0',
    pack: () => event('portion-plan', (e) => ({ ...e, responses: [] })),
  },
  {
    rule: 'text',
    path: rp,
    pack: () => response((r) => ({ ...r, description: '' })),
  },
  {
    rule: 'response-shape',
    path: rp,
    pack: () => response((r) => corrupt(r, 'effect', { minutes: 1 })),
  },
  {
    rule: 'numeric-preview',
    path: rp,
    pack: () => response((r) => ({ ...r, label: 'Gain 10 progress' })),
  },
  {
    rule: 'condition-key',
    path: rp,
    pack: () => response((r) => ({ ...r, requires: { minRisks: 1 } })),
  },
  {
    rule: 'condition',
    path: rp,
    pack: () => response((r) => ({ ...r, requires: { minMinute: -1 } })),
  },
  {
    rule: 'attendee-reference',
    path: rp,
    pack: () =>
      response((r) => ({
        ...r,
        requires: corrupt({}, 'present', ['unknown']),
      })),
  },
  {
    rule: 'disabled-reason',
    path: rp,
    pack: () => response((r) => ({ ...r, requires: { present: ['legal'] } })),
  },
  {
    rule: 'outcomes',
    path: rp,
    pack: () => response((r) => ({ ...r, outcomes: [] })),
  },
  {
    rule: 'outcome-shape',
    path: op,
    pack: () => outcome((o) => ({ ...o, weight: 0 })),
  },
  {
    rule: 'effect',
    path: op,
    name: 'duration',
    pack: () => outcome((o) => ({ ...o, effect: { ...o.effect, minutes: 0 } })),
  },
  {
    rule: 'effect',
    path: op,
    name: 'progress',
    pack: () =>
      outcome((o) => ({ ...o, effect: { ...o.effect, progress: 26 } })),
  },
  {
    rule: 'effect',
    path: op,
    name: 'legacy field',
    pack: () => outcome((o) => ({ ...o, effect: { ...o.effect, risks: 1 } })),
  },
  {
    rule: 'cuisine-reference',
    path: op,
    pack: () =>
      outcome((o) => ({
        ...o,
        effect: { ...o.effect, nominateCuisine: 'thai' },
      })),
  },
  {
    rule: 'booking',
    path: op,
    pack: () =>
      outcome((o) => ({ ...o, effect: { ...o.effect, bookingEnd: 45 } })),
  },
  {
    rule: 'arrival-permission',
    path: op,
    pack: () =>
      outcome((o) => ({ ...o, effect: { ...o.effect, joins: ['legal'] } })),
  },
  {
    rule: 'callback',
    path: op,
    pack: () =>
      outcome((o) => ({
        ...o,
        effect: {
          ...o.effect,
          callback: { eventId: 'menu-return', afterTurns: 2 },
        },
      })),
  },
  {
    rule: 'filler',
    path: 'filler.presentation.0.ack.waited',
    pack: () =>
      event('filler', (e) => ({
        ...e,
        responses: e.responses.map((r) => ({
          ...r,
          outcomes: r.outcomes.map((o) => ({
            ...o,
            effect: { ...o.effect, progress: 1 },
          })),
        })),
      })),
  },
  {
    rule: 'filler-shape',
    path: 'filler',
    pack: () => event('filler', (e) => ({ ...e, kind: 'tangent' })),
  },
  {
    rule: 'deterministic-alternative',
    path: 'portion-plan.presentation.0',
    pack: () =>
      event('portion-plan', (e) => ({
        ...e,
        responses: e.responses.map((r) => ({
          ...r,
          outcomes: [
            ...r.outcomes,
            {
              id: 'other',
              weight: 1,
              effect: { minutes: 1 },
              line: 'Fixture.',
            },
          ],
        })),
      })),
  },
  {
    rule: 'speaker-presence',
    path: 'portion-plan',
    pack: () => event('portion-plan', (e) => ({ ...e, speaker: 'legal' })),
  },
  {
    rule: 'enabled-fallback',
    path: 'portion-plan',
    pack: () =>
      event('portion-plan', (e) => ({
        ...e,
        responses: e.responses.map((r) => ({
          ...r,
          requires: { present: ['legal'] },
          disabledReasonKey: 'alex-absent',
        })),
      })),
  },
  {
    rule: 'unreachable-presentation',
    path: 'portion-plan',
    pack: () =>
      event('portion-plan', (e) => ({
        ...e,
        variants: [
          {
            when: {},
            speaker: e.speaker,
            line: e.line,
            responses: e.responses,
          },
        ],
      })),
  },
  {
    rule: 'arrival-metadata',
    path: 'missing',
    pack: () => ({
      ...pack,
      eventRules: {
        ...pack.eventRules,
        arrivalPermissions: [
          ...pack.eventRules.arrivalPermissions,
          { eventId: 'missing', responseId: 'invite', attendeeId: 'legal' },
        ],
      },
    }),
  },
  {
    rule: 'callback-reference',
    path: 'menu-needs',
    pack: () => ({
      ...pack,
      eventRules: {
        ...pack.eventRules,
        callbackTargets: {
          ...pack.eventRules.callbackTargets,
          'menu-needs': 'missing',
        },
      },
    }),
  },
  {
    rule: 'event-reference',
    path: 'missing',
    pack: () => ({
      ...pack,
      eventRules: {
        ...pack.eventRules,
        bookingEventIds: [...pack.eventRules.bookingEventIds, 'missing'],
      },
    }),
  },
  {
    rule: 'unused-reason',
    path: 'unused',
    catalog: () => ({
      ...catalog,
      disabledReasons: { ...catalog.disabledReasons, unused: 'Unused.' },
    }),
  },
  {
    rule: 'catalog-ids',
    path: 'titles',
    catalog: () => ({
      ...catalog,
      titles: [
        ...catalog.titles,
        catalog.titles[0] ?? {
          slot: 1,
          id: 'inbox-zero',
          name: 'Fixture',
          predicate: 'Fixture',
          flavour: 'Fixture',
        },
      ],
    }),
  },
  {
    rule: 'roster',
    path: 'attendees',
    catalog: () => ({ ...catalog, attendees: catalog.attendees.slice(1) }),
  },
  {
    rule: 'attendee-catalog',
    path: 'priya',
    catalog: () => ({
      ...catalog,
      attendees: catalog.attendees.map((a) =>
        a.id === 'priya' ? { ...a, startsPresent: false } : a,
      ),
    }),
  },
  {
    rule: 'placeholder',
    path: 'objective',
    catalog: () => ({
      ...catalog,
      interfaceCopy: { ...catalog.interfaceCopy, objective: '{unknown}' },
    }),
  },
  {
    rule: 'substituted-text',
    path: 'objective',
    catalog: () => ({
      ...catalog,
      interfaceCopy: { ...catalog.interfaceCopy, objective: 'x'.repeat(91) },
    }),
  },
  {
    rule: 'title-slot',
    path: 'inbox-zero',
    catalog: () => ({
      ...catalog,
      titles: catalog.titles.map((t) =>
        t.id === 'inbox-zero' ? { ...t, slot: 0 } : t,
      ),
    }),
  },
  {
    rule: 'commentary',
    path: 'nearly-there',
    catalog: () => ({
      ...catalog,
      commentary: catalog.commentary.map((c) =>
        c.id === 'nearly-there' ? { ...c, priority: 0 } : c,
      ),
    }),
  },
  {
    rule: 'park-topics',
    path: 'parkTopics',
    catalog: () => ({
      ...catalog,
      parkTopics: { ...catalog.parkTopics, 'menu-needs / park': '' },
    }),
  },
  {
    rule: 'epilogue',
    path: 'decision',
    catalog: () => ({
      ...catalog,
      epilogues: { ...catalog.epilogues, decision: 'No cuisine.' },
    }),
  },
  {
    rule: 'success-cuisine',
    path: 'success-result',
    catalog: () => ({
      ...catalog,
      interfaceCopy: { ...catalog.interfaceCopy, 'success-result': 'Agreed' },
    }),
  },
  {
    rule: 'failure-cuisine',
    path: 'failure-result',
    catalog: () => ({
      ...catalog,
      interfaceCopy: {
        ...catalog.interfaceCopy,
        'failure-result': '{agreedCuisine}',
      },
    }),
  },
];
for (const failure of failures)
  it(`rule ${failure.rule}: ${failure.path} ${failure.name ?? ''}`, () => {
    expect(
      validateLunchContent(
        failure.pack?.() ?? pack,
        failure.catalog?.() ?? catalog,
      ),
    ).toContainEqual({ path: failure.path, rule: failure.rule });
  });

const scopes: readonly Failure[] = [
  {
    rule: 'placeholder-scope',
    path: 'portion-plan',
    pack: () =>
      event('portion-plan', (e) => ({
        ...e,
        line: 'We agreed on {agreedCuisine} already.',
      })),
  },
  {
    rule: 'placeholder-scope',
    path: 'nominate-cuisine',
    pack: () =>
      event('nominate-cuisine', (e) => ({
        ...e,
        line: 'Shall we keep {cuisine}?',
      })),
  },
  {
    rule: 'placeholder-scope',
    path: 'calendar-criminal',
    catalog: () => ({
      ...catalog,
      titles: catalog.titles.map((t) =>
        t.id === 'calendar-criminal'
          ? { ...t, flavour: 'You agreed on {agreedCuisine}.' }
          : t,
      ),
    }),
  },
  {
    rule: 'placeholder-scope',
    path: 'nearly-there',
    catalog: () => ({
      ...catalog,
      commentary: catalog.commentary.map((c) =>
        c.id === 'nearly-there'
          ? { ...c, line: '{agreedCuisine} is nearly agreed.' }
          : c,
      ),
    }),
  },
  {
    rule: 'placeholder-scope',
    path: 'early-fallback',
    catalog: () => ({
      ...catalog,
      moments: {
        ...catalog.moments,
        'early-fallback': 'We agreed on {agreedCuisine}.',
      },
    }),
  },
  {
    rule: 'placeholder-scope',
    path: 'share-score',
    catalog: () => ({
      ...catalog,
      interfaceCopy: { ...catalog.interfaceCopy, 'share-score': '{minute}' },
    }),
  },
  {
    rule: 'numeric-preview',
    path: rp,
    name: 'score token',
    pack: () =>
      response((r) => ({
        ...r,
        description: 'Worth {score} points if you pick this one now.',
      })),
  },
  {
    rule: 'numeric-preview',
    path: rp,
    name: 'minute token',
    pack: () => response((r) => ({ ...r, label: 'Takes {minute} min' })),
  },
  {
    rule: 'numeric-preview',
    path: rp,
    name: 'odds',
    pack: () =>
      response((r) => ({
        ...r,
        description: 'Good odds, roughly half the time, of a quick win.',
      })),
  },
];
for (const f of scopes)
  it(`scope ${f.path} ${f.name ?? ''}`, () => {
    expect(
      validateLunchContent(f.pack?.() ?? pack, f.catalog?.() ?? catalog),
    ).toContainEqual({ path: f.path, rule: f.rule });
  });

it('rejects odds at the start of a description independently of the label', () => {
  expect(
    validateLunchContent(
      response((r) => ({ ...r, description: 'Odds favour this choice.' })),
      catalog,
    ),
  ).toContainEqual({ path: rp, rule: 'numeric-preview' });
});
