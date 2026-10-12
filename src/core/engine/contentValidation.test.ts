import { describe, expect, it } from 'vitest';
import { validateContent } from './contentValidation';
import type {
  ContentValidationOptions,
  ValidationCatalog,
} from './contentValidation';
import type {
  AttendeeId,
  Condition,
  ContentPack,
  MeetingEvent,
  Response,
} from './types';
import { fixturePack } from './fixtures/packs';
import { goldenPack, mixedGoldenPack } from './fixtures/goldens';
import { deepFreeze } from './fixtures/transitions';
import { validationPack } from './fixtures/validation';
import { ATTENDEE_IDS } from './constants';
import { initialState } from './state';
import { getDrawCandidatesWith } from './draw';

const catalog: ValidationCatalog = {
  eventFiles: [
    ...validationPack.events,
    ...validationPack.callbacks,
    validationPack.filler,
  ].map((event) => ({ id: event.id, stem: event.id })),
  attendees: ATTENDEE_IDS.map((id) => ({ id, role: 'Fixture role' })),
  titles: [{ id: 'fixture-title', name: 'Fixture collectible' }],
  disabledReasons: { 'expert-absent': 'The expert has left.' },
  moments: ['Fixture moment.'],
  epilogues: ['Fixture epilogue.'],
};
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Missing validation fixture');
  return value;
}
const base = required(validationPack.events[0]);
const response = required(base.responses[0]);
function change(event: Partial<MeetingEvent>): ContentPack {
  return {
    ...validationPack,
    events: [{ ...base, ...event }, ...validationPack.events.slice(1)],
  };
}
function choice(value: Partial<Response>): ContentPack {
  return change({ responses: [{ ...response, ...value }] });
}
function rules(
  pack: ContentPack,
  options: ContentValidationOptions = {},
): readonly string[] {
  return validateContent(pack, options).map((issue) => issue.rule);
}

describe('content validation gate', () => {
  it('keeps roster enumeration exhaustive and rejects unknown condition keys', () => {
    const exhaustive: Exclude<
      AttendeeId,
      (typeof ATTENDEE_IDS)[number]
    > extends never
      ? true
      : never = true;
    expect(exhaustive).toBe(true);
    expect(rules(change({ when: { minRisk: 1 } as Condition }))).toContain(
      'condition-key',
    );
  });
  it('validates all shared frozen engine packs structurally without changing them', () => {
    for (const pack of [fixturePack, goldenPack, mixedGoldenPack]) {
      deepFreeze(pack);
      const before = JSON.stringify(pack);
      expect(validateContent(pack, { profile: 'synthetic' })).toEqual([]);
      expect(JSON.stringify(pack)).toBe(before);
    }
    expect(rules(goldenPack)).toContain('effect-range');
    expect(rules(goldenPack)).toContain('response-count');
    expect(rules(goldenPack)).toContain('mvp-relationships');
  });
  it('accepts an authored-limit pack and its complete catalog', () => {
    expect(validateContent(deepFreeze(validationPack), { catalog })).toEqual(
      [],
    );
    expect(
      validateContent(validationPack, { profile: 'synthetic', catalog }),
    ).toEqual([]);
  });
  it.each([
    ['duplicate family', change({ id: 'support-training' }), 'unique-ids'],
    ['empty id', change({ id: ' ' }), 'unique-ids'],
    [
      'duplicate response',
      change({ responses: [response, response] }),
      'unique-ids',
    ],
    ['empty responses', change({ responses: [] }), 'response-count'],
    [
      'too many responses',
      change({
        responses: Array.from({ length: 4 }, (_, index) => ({
          ...response,
          id: String(index),
        })),
      }),
      'response-count',
    ],
    ['long label', choice({ label: '😀'.repeat(25) }), 'text'],
    ['long response line', choice({ line: '😀'.repeat(91) }), 'text'],
    ['long event line', change({ line: 'x'.repeat(91) }), 'text'],
    ['blank line', change({ line: ' ' }), 'text'],
    ['bad weight', change({ weight: 0 }), 'weight'],
    ['fractional weight', change({ weight: 1.5 }), 'weight'],
    ['nan weight', change({ weight: NaN }), 'weight'],
    [
      'negative minutes',
      choice({ effect: { ...response.effect, minutes: -1 } }),
      'effect-range',
    ],
    [
      'long minutes',
      choice({ effect: { ...response.effect, minutes: 11 } }),
      'effect-range',
    ],
    [
      'large progress',
      choice({ effect: { ...response.effect, progress: 26 } }),
      'effect-range',
    ],
    [
      'low progress',
      choice({ effect: { ...response.effect, progress: -11 } }),
      'effect-range',
    ],
    [
      'large risks',
      choice({ effect: { ...response.effect, risks: 2 } }),
      'effect-range',
    ],
    [
      'low risks',
      choice({ effect: { ...response.effect, risks: -2 } }),
      'effect-range',
    ],
    [
      'fractional effect',
      choice({ effect: { ...response.effect, minutes: 0.5 } }),
      'integer-effect',
    ],
    [
      'infinite effect',
      choice({ effect: { ...response.effect, progress: Infinity } }),
      'integer-effect',
    ],
    [
      'nonemail zero',
      choice({ effect: { ...response.effect, minutes: 0 } }),
      'zero-minutes',
    ],
    [
      'unauthorized join',
      choice({ effect: { ...response.effect, joins: ['sam'] } }),
      'joins',
    ],
    [
      'unauthorized booking',
      choice({ effect: { ...response.effect, bookingEnd: 60 } }),
      'booking-effect',
    ],
    [
      'wrong target',
      choice({
        effect: { minutes: 1, callback: { eventId: 'missing', afterTurns: 2 } },
      }),
      'callback-effect',
    ],
    ['wrong technique', choice({ technique: 'hear' }), 'callback-effect'],
    [
      'missing scheduler',
      choice({ effect: { minutes: 1 } }),
      'callback-scheduler',
    ],
    [
      'missing disabled reason',
      choice({ requires: { present: ['sam'] } }),
      'disabled-reason',
    ],
    [
      'no fallback',
      choice({
        requires: { present: ['sam'] },
        disabledReasonKey: 'expert-absent',
      }),
      'always-enabled',
    ],
    ['speaker absent', change({ speaker: 'sam' }), 'speaker-presence'],
    [
      'owner choice missing callback scheduler',
      choice({ technique: 'owner', effect: { minutes: 2, progress: 10 } }),
      'callback-scheduler',
    ],
    [
      'substantive gated on expert',
      change({ when: { present: ['sam'] } }),
      'substantive-absence',
    ],
    ['invalid risk condition', change({ when: { minRisks: 6 } }), 'condition'],
    [
      'inverted minute condition',
      change({ when: { minMinute: 10, maxMinute: 5 } }),
      'condition',
    ],
    [
      'contradictory presence',
      change({ when: { present: ['sam'], absent: ['sam'] } }),
      'condition',
    ],
    [
      'duplicate presence',
      change({ when: { present: ['sam', 'sam'] } }),
      'unique-ids',
    ],
  ])('rejects %s', (_name, pack, rule) => {
    expect(rules(pack)).toContain(rule);
  });
  it('counts Unicode code points and accepts inclusive effect/copy boundaries', () => {
    const pack = choice({
      label: '😀'.repeat(24),
      line: '😀'.repeat(90),
      effect: { ...response.effect, minutes: 10, progress: 25, risks: 1 },
    });
    expect(validateContent(pack)).toEqual([]);
    expect(
      validateContent(
        choice({
          effect: { ...response.effect, minutes: 1, progress: -10, risks: -1 },
        }),
      ),
    ).toEqual([]);
    expect(
      validateContent(
        choice({
          technique: 'email',
          effect: { ...response.effect, minutes: 0 },
        }),
      ),
    ).toEqual([]);
    expect(
      validateContent(
        choice({
          requires: { present: ['priya'] },
          disabledReasonKey: 'expert-absent',
        }),
        { catalog },
      ),
    ).toEqual([]);
  });
  it('rejects malformed runtime references and forbidden fields', () => {
    expect(rules(change({ speaker: 'unknown' as 'sam' }))).toContain(
      'attendee-reference',
    );
    expect(
      rules(
        choice({
          effect: { ...response.effect, leaves: ['sam'] } as Response['effect'],
        }),
      ),
    ).toContain('forbidden-effect');
    expect(rules(choice({ effectCases: [] } as Partial<Response>))).toContain(
      'forbidden-effect',
    );
    expect(
      rules(
        choice({
          effect: {
            ...response.effect,
            callback: {
              eventId: 'circle-back-return',
              afterTurns: 3,
            } as unknown as NonNullable<Response['effect']['callback']>,
          },
        }),
      ),
    ).toContain('callback-effect');
    expect(
      rules(
        change({
          when: {
            absent: ['unknown' as 'sam'],
            minMinute: NaN,
            minRisks: 2,
            maxRisks: 1,
          },
        }),
      ),
    ).toContain('condition');
  });
  it('checks arrival and booking paths, including every variant', () => {
    expect(
      rules({
        ...validationPack,
        events: validationPack.events.map((event) =>
          event.id === 'legal' ? { ...event, kind: 'noise' } : event,
        ),
      }),
    ).toContain('arrival-kind');
    const events = validationPack.events.map((event) =>
      event.id === 'legal'
        ? {
            ...event,
            responses: [
              {
                ...response,
                effect: { minutes: 1, joins: ['legal', 'legal'] as const },
              },
            ],
          }
        : event,
    );
    expect(rules({ ...validationPack, events })).toContain('joins');
    expect(
      rules({
        ...validationPack,
        events: validationPack.events.map((event) =>
          event.id === 'room-booked'
            ? { ...event, responses: [{ ...response, effect: { minutes: 1 } }] }
            : event,
        ),
      }),
    ).toContain('booking-effect');
    expect(
      rules(
        change({
          variants: [
            {
              when: { minRisks: 1 },
              speaker: 'room',
              line: 'Variant.',
              responses: [
                { ...response, effect: { minutes: 1, joins: ['vp'] } },
              ],
            },
          ],
        }),
      ),
    ).toContain('joins');
    expect(
      rules({
        ...validationPack,
        eventRules: {
          ...validationPack.eventRules,
          arrivalAttendees: { legal: 'sam' },
        },
      }),
    ).toContain('arrival-metadata');
    expect(
      rules({
        ...validationPack,
        eventRules: {
          ...validationPack.eventRules,
          bookingEventIds: ['missing'],
        },
      }),
    ).toContain('booking-metadata');
  });
  it('checks unique callback parentage, target shape and chains', () => {
    expect(
      rules({
        ...validationPack,
        eventRules: {
          ...validationPack.eventRules,
          callbackTargets: { missing: 'missing-return' },
        },
      }),
    ).toContain('callback-reference');
    expect(
      rules({
        ...validationPack,
        eventRules: {
          ...validationPack.eventRules,
          callbackTargets: {
            ...validationPack.eventRules.callbackTargets,
            extra: 'circle-back-return',
          },
        },
      }),
    ).toContain('unique-ids');
    for (const patch of [
      { rarity: 'rare' as const },
      { negative: true },
      { when: {} },
      { kind: 'noise' as const },
    ])
      expect(
        rules({
          ...validationPack,
          callbacks: validationPack.callbacks.map((event) => ({
            ...event,
            ...patch,
          })),
        }),
      ).toContain('callback-shape');
    expect(
      rules({
        ...validationPack,
        callbacks: validationPack.callbacks.map((event) => ({
          ...event,
          responses: [response],
        })),
      }),
    ).toContain('callback-effect');
    expect(
      rules({
        ...validationPack,
        callbacks: validationPack.callbacks.map((event) => ({
          ...event,
          responses: [
            { ...response, technique: 'email', effect: { minutes: 0 } },
          ],
        })),
      }),
    ).toContain('zero-minutes');
  });
  it('validates filler and first-two guarantees', () => {
    expect(
      rules({
        ...validationPack,
        filler: { ...validationPack.filler, responses: [response] },
      }),
    ).toContain('filler');
    expect(
      rules({
        ...validationPack,
        events: validationPack.events.map((event) => ({
          ...event,
          kind: 'noise',
        })),
      }),
    ).toContain('first-two-substantive');
  });
  it('constructs absence and overlapping first-match witnesses using the actual draw API', () => {
    const pack = change({
      speaker: 'sam',
      variants: [
        {
          when: { absent: ['sam'], minRisks: 1 },
          speaker: 'priya',
          line: 'Absent with risks.',
          responses: [response],
        },
        {
          when: { absent: ['sam'] },
          speaker: 'priya',
          line: 'Absent without risks.',
          responses: [response],
        },
      ],
    });
    expect(validateContent(pack)).toEqual([]);
    for (const [present, risks, expected] of [
      [['priya', 'sam'], 0, 'Fixture issue.'],
      [['priya', 'dev'], 0, 'Absent without risks.'],
      [['priya', 'dev'], 1, 'Absent with risks.'],
    ] as const) {
      const event = getDrawCandidatesWith(pack, {
        ...initialState('variant'),
        present,
        risks,
      }).find((candidate) => candidate.event.id === base.id)?.event;
      expect(event?.line).toBe(expected);
    }
    expect(
      rules(
        change({
          variants: [
            {
              when: { minMinute: 60 },
              speaker: 'room',
              line: 'Unreachable.',
              responses: [response],
            },
          ],
        }),
      ),
    ).toContain('presentation-reachability');
    expect(
      rules(
        change({
          variants: [
            {
              when: {},
              speaker: 'room',
              line: 'First.',
              responses: [response],
            },
            {
              when: {},
              speaker: 'room',
              line: 'Shadowed.',
              responses: [response],
            },
          ],
        }),
      ),
    ).toContain('presentation-reachability');
  });
  it('checks expert requirements and reachable schedulers after absence', () => {
    const fallback = { ...response, id: 'fallback' };
    const expert: Response = {
      id: 'expert',
      label: 'Expert work',
      technique: 'owner',
      line: 'Expert done.',
      effect: { minutes: 2, progress: 12 },
    };
    const pack = change({
      speaker: 'sam',
      responses: [expert, fallback],
      variants: [
        {
          when: { absent: ['sam'] },
          speaker: 'priya',
          line: 'Absent.',
          responses: [fallback],
        },
      ],
    });
    expect(rules(pack)).toContain('expert-requirement');
    const safe = change({
      ...pack.events[0],
      responses: [
        {
          ...expert,
          requires: { present: ['sam'] },
          disabledReasonKey: 'expert-absent',
        },
        fallback,
      ],
    });
    expect(validateContent(safe, { catalog })).toEqual([]);
    const disabled = choice({
      requires: { present: ['sam'] },
      disabledReasonKey: 'expert-absent',
    });
    expect(rules(disabled)).toContain('reachable-scheduler');
    expect(rules(disabled)).toContain('enabled-response');
  });
  it('validates file/attendee/title namespaces and all supplied authored copy', () => {
    const cases: readonly [ValidationCatalog, string][] = [
      [{ eventFiles: [] }, 'file-coverage'],
      [{ eventFiles: [{ id: base.id, stem: 'wrong' }] }, 'file-id'],
      [
        {
          attendees: [
            { id: 'priya', role: 'x'.repeat(49) },
            { id: 'priya', role: 'role' },
          ],
        },
        'unique-ids',
      ],
      [{ attendees: [] }, 'attendee-coverage'],
      [
        {
          titles: [
            { id: 'same', name: 'x'.repeat(29) },
            { id: 'same', name: 'title' },
          ],
        },
        'text',
      ],
      [{ disabledReasons: { reason: 'x'.repeat(91) } }, 'text'],
      [{ moments: ['x'.repeat(91)], epilogues: ['x'.repeat(91)] }, 'text'],
    ];
    for (const [badCatalog, rule] of cases)
      expect(rules(validationPack, { catalog: badCatalog })).toContain(rule);
    expect(
      rules(
        choice({
          requires: { present: ['priya'] },
          disabledReasonKey: 'missing',
        }),
        { catalog },
      ),
    ).toContain('disabled-reason-reference');
  });
});
