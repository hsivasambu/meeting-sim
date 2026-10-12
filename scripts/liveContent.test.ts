import { readFileSync, readdirSync } from 'node:fs';
import { expect, it } from 'vitest';
import { contentPack } from '../src/core/content/index';
import { attendees } from '../src/core/content/attendees';
import { titles } from '../src/core/content/titles';
import {
  disabledReasons,
  epilogues,
  resultsCopy,
} from '../src/core/content/copy';
import { validateContent } from '../src/core/engine/contentValidation';
import { drawEventWith, getDrawCandidatesWith } from '../src/core/engine/draw';
import {
  initialState,
  drawEvent,
  getDrawCandidates,
  release,
  resolve,
  previewResponse,
  callIt,
  score,
  earnedTitles,
} from '../src/core/engine/index';
import { qualityRecords, scoreState } from '../src/core/engine/fixtures/scores';
import type {
  MeetingEvent,
  MeetingState,
  PresentedEvent,
} from '../src/core/engine/types';

const allEvents: readonly MeetingEvent[] = [
  ...contentPack.events,
  ...contentPack.callbacks,
  contentPack.filler,
];
const source = readFileSync(
  new URL('../docs/content-table.md', import.meta.url),
  'utf8',
);
function rows(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .filter((line) => line.startsWith('|'))
    .map((line) =>
      line
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim()),
    )
    .filter((row) => !row[0]?.startsWith('-'));
}
function condition(text: string | undefined) {
  if (text === '—' || text === undefined) return undefined;
  const [key, value] = text.split(':').map((part) => part.trim());
  if (key === undefined || value === undefined)
    throw new Error('Malformed source condition');
  return {
    [key]: key === 'present' || key === 'absent' ? [value] : Number(value),
  };
}

it('validates the complete playable pack with catalogs derived from real files', () => {
  const stems = readdirSync(
    new URL('../src/core/content/events/', import.meta.url),
  ).map((file) => file.replace(/\.ts$/, ''));
  expect(stems.sort()).toEqual(allEvents.map((event) => event.id).sort());
  expect(
    validateContent(contentPack, {
      catalog: {
        eventFiles: stems.map((stem) => ({ id: stem, stem })),
        attendees,
        titles,
        disabledReasons,
        epilogues: epilogues.map((entry) => entry.line),
        moments: [
          resultsCopy.cancelledMoment,
          resultsCopy.decisionMoment,
          resultsCopy.otherMoment,
        ],
      },
    }),
  ).toEqual([]);
  expect(contentPack.events).toHaveLength(17);
  expect(contentPack.callbacks).toHaveLength(3);
  expect(attendees).toHaveLength(8);
  expect(titles).toHaveLength(12);
  const usedReasons = allEvents
    .flatMap((event) => [event, ...(event.variants ?? [])])
    .flatMap((presentation) => presentation.responses)
    .flatMap((response) =>
      'disabledReasonKey' in response ? [response.disabledReasonKey] : [],
    );
  expect([...new Set(usedReasons)].sort()).toEqual(
    Object.keys(disabledReasons).sort(),
  );
  expect(JSON.parse(JSON.stringify(contentPack))).toEqual(contentPack);
});

it('transcribes every family, ordered presentation and complete response row exactly', () => {
  const familyRows = rows(source.split('## Presentations')[0] ?? '').filter(
    (row) => row.length === 6 && row[0] !== 'ID',
  );
  expect(familyRows.map((row) => row[0])).toEqual(
    contentPack.events.map((event) => event.id),
  );
  for (const row of familyRows) {
    const event = contentPack.events.find((entry) => entry.id === row[0]);
    expect(event).toMatchObject({
      id: row[0],
      kind: row[1],
      rarity: row[2],
      weight: Number(row[3]),
      negative: row[4] === 'true',
    });
    expect(event && 'when' in event ? event.when : undefined).toEqual(
      condition(row[5]),
    );
  }
  const scheduledRows = rows(source.split('## Presentations')[0] ?? '').filter(
    (row) => row.length === 7 && row[0] !== 'Scheduled/fallback ID',
  );
  expect(scheduledRows.map((row) => row[0])).toEqual(
    [...contentPack.callbacks, contentPack.filler].map((event) => event.id),
  );
  for (const row of scheduledRows) {
    const event = allEvents.find((entry) => entry.id === row[0]);
    expect(event).toMatchObject({
      id: row[0],
      kind: row[1],
      rarity: row[2],
      weight: Number(row[3]),
      negative: row[4] === 'true',
    });
    expect(event?.when).toEqual(condition(row[5]));
    if (row[0] !== 'filler') {
      expect(
        Object.entries(contentPack.eventRules.callbackTargets),
      ).toContainEqual([row[6], row[0]]);
    }
  }
  for (const event of allEvents) {
    const section =
      source.split(`### ${event.id}\r\n`)[1] ??
      source.split(`### ${event.id}\n`)[1];
    if (section === undefined) throw new Error(`Missing source ${event.id}`);
    const table = rows(section.split(/^### |^## /m)[0] ?? '');
    const presentations = table.filter(
      (row) => row[0] === 'base' || row[0]?.startsWith('variant'),
    );
    const actual = [event, ...(event.variants ?? [])];
    expect(actual).toHaveLength(presentations.length);
    presentations.forEach((row, index) => {
      const presentation = actual[index];
      if (presentation === undefined) throw new Error('Missing presentation');
      expect(presentation.speaker).toBe(row[2]);
      expect(presentation.line).toBe(row[3]);
      if (index > 0)
        expect('when' in presentation ? presentation.when : undefined).toEqual(
          condition(row[1]),
        );
      const responseRows = table.filter(
        (entry) => entry.length === 13 && entry[0] === row[4],
      );
      expect(presentation.responses).toEqual(
        responseRows.map((entry) => ({
          id: entry[1],
          label: entry[2],
          technique: entry[3],
          ...(entry[4] === '—'
            ? {}
            : { requires: condition(entry[4]), disabledReasonKey: entry[5] }),
          effect: {
            minutes: Number(entry[6]),
            progress: Number(entry[7]),
            risks: Number(entry[8]),
            ...(entry[9] === '—'
              ? {}
              : { callback: { eventId: entry[9], afterTurns: 2 } }),
            ...(entry[10] === '—' ? {} : { joins: [entry[10]] }),
            ...(entry[11] === '—' ? {} : { bookingEnd: Number(entry[11]) }),
          },
          line: entry[12],
        })),
      );
    });
  }
});

it('transcribes disabled reasons, epilogues, roster and titles from their approved sources', () => {
  expect(disabledReasons).toEqual(
    Object.fromEntries(
      rows(
        source.split('## Disabled reasons')[1]?.split('## Epilogues')[0] ?? '',
      ).slice(1),
    ),
  );
  expect(
    epilogues.map(({ key, ending, riskCondition, line }) => ({
      key,
      ending,
      riskCondition,
      line,
    })),
  ).toEqual(
    rows(source.split('## Epilogues')[1]?.split('## Results heading')[0] ?? '')
      .slice(1)
      .map(([key, ending, riskCondition, line]) => ({
        key,
        ending,
        riskCondition,
        line,
      })),
  );
  const design = readFileSync(
    new URL('../docs/design-doc-v2.md', import.meta.url),
    'utf8',
  );
  expect(
    attendees.map((entry) => [entry.name, entry.role, entry.topic]),
  ).toEqual(
    rows(
      design.split('**Attendees (fictional)**')[1]?.split('All “Yes”')[0] ?? '',
    )
      .slice(1)
      .map((row) => row.slice(0, 3)),
  );
  expect(titles.map((entry) => entry.name)).toEqual(
    rows(design.split('**Titles (stored')[1]?.split('Title 9 is')[0] ?? '')
      .slice(1)
      .map((row) => row[1]),
  );
  expect(titles.map((entry) => entry.id)).toEqual([
    'inbox-zero',
    'efficient-facilitator',
    'ship-it-and-pray',
    'death-by-diligence',
    'skeleton-crew',
    'reply-all-royalty',
    'parking-lot-attendant',
    'gary-free-zone',
    'played-it-right',
    'take-this-offline',
    'calendar-criminal',
    'could-have-been-an-email',
  ]);
  expect(resultsCopy).toEqual({
    fallbackHeading: 'Decision Made',
    cancelledMoment: 'No meeting moments. Just an email.',
    decisionMoment: 'The meeting ended with a decision.',
    otherMoment: 'The decision will need another meeting.',
  });
});

function candidate(state: MeetingState, id: string): PresentedEvent {
  const event = getDrawCandidates(state).find(
    (entry) => entry.event.id === id,
  )?.event;
  if (event === undefined) throw new Error(`Ineligible event ${id}`);
  return event;
}
// Constructed candidate choices are the approved table's hand walkthrough, not seed claims.
function choose(
  state: MeetingState,
  id: string,
  response: string,
): MeetingState {
  candidate(state, id);
  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const pending = drawEvent({
      ...state,
      seed: `constructed-${id}-${attempt}`,
    });
    if (pending.current?.id === id) return resolve(pending, response);
  }
  throw new Error(`No constructed draw for ${id}`);
}
function openState(): MeetingState {
  return {
    ...initialState('content-validation'),
    substantiveDrawCount: 2,
    turn: 2,
  };
}

it('binds public draw/candidate wrappers to the live pack, preserving pending and ended behavior', () => {
  const state = initialState('live-api');
  expect(getDrawCandidates(state)).toEqual(
    getDrawCandidatesWith(contentPack, state),
  );
  expect(drawEvent(state)).toEqual(drawEventWith(contentPack, state));
  const pending = drawEvent(state);
  expect(drawEvent(pending)).toEqual(pending);
  expect(getDrawCandidates(pending)).toEqual([
    { event: pending.current, probability: 1 },
  ]);
  const ended = callIt(pending);
  expect(getDrawCandidates(ended)).toEqual([]);
  expect(() => drawEvent(ended)).toThrow();
});

it('selects every authored variant through the public candidate API', () => {
  for (const event of allEvents) {
    if (event.variants === undefined) continue;
    for (const variant of event.variants) {
      let state = openState();
      if ('absent' in variant.when)
        for (const id of variant.when.absent) state = release(state, id);
      if ('minRisks' in variant.when)
        state = { ...state, risks: variant.when.minRisks };
      if (event.kind === 'callback')
        state = {
          ...state,
          seenEventIds: Object.entries(contentPack.eventRules.callbackTargets)
            .filter(([, target]) => target === event.id)
            .map(([parent]) => parent),
          scheduled: [{ eventId: event.id, dueTurn: state.turn }],
        };
      expect(candidate(state, event.id)).toMatchObject({
        speaker: variant.speaker,
        line: variant.line,
        responses: variant.responses,
      });
    }
  }
});

it('keeps delivered presentations while release disables expert and arrival-dependent choices', () => {
  for (const [eventId, who, responseId, reasonKey] of [
    ['support-training', 'sam', 'owner', 'sam-absent'],
    ['failing-tests', 'dev', 'owner', 'dev-absent'],
    ['press-date', 'morgan', 'owner', 'morgan-absent'],
    ['press-date', 'legal', 'legal', 'legal-absent'],
    ['room-booked', 'vp', 'vp', 'vp-absent'],
  ] as const) {
    const state = {
      ...openState(),
      present: [...initialState('roster').present, 'legal', 'vp'],
    } satisfies MeetingState;
    const pending = { ...state, current: candidate(state, eventId) };
    const response = pending.current.responses.find(
      (entry) => entry.id === responseId,
    );
    if (response === undefined) throw new Error('Missing expert response');
    expect(previewResponse(pending, response).enabled).toBe(true);
    const after = release(pending, who);
    expect(after.current).toEqual(pending.current);
    expect(previewResponse(after, response)).toEqual({
      enabled: false,
      responseId,
      reasonKey,
    });
    expect(() => resolve(after, responseId)).toThrow();
  }
});

it('reproduces the approved ten-turn clean decision and full billing', () => {
  let state = release(release(initialState('walkthrough'), 'gary'), 'jordan');
  for (const [eventId, responseId] of [
    ['where-we-stand', 'hear'],
    ['support-training', 'owner'],
    ['hdmi', 'park'],
    ['failing-tests', 'owner'],
    ['legal', 'timebox'],
    ['press-date', 'owner'],
    ['p1-bug', 'hear'],
    ['circle-back', 'timebox'],
    ['vp-joins', 'timebox'],
    ['tv-no-signal', 'timebox'],
  ]) {
    if (eventId === undefined || responseId === undefined)
      throw new Error('Invalid walkthrough');
    state = choose(state, eventId, responseId);
    if (eventId === 'legal') state = release(state, 'legal');
    if (eventId === 'vp-joins') state = release(state, 'vp');
  }
  expect(state).toMatchObject({
    phase: 'ended',
    ending: 'decision',
    turn: 10,
    progress: 100,
    risks: 0,
    minute: 38,
    personMinutes: 152,
  });
});

it.each([
  ['circle-back', 'circle-back-return', 'morgan'],
  ['support-training', 'support-follow-up', 'sam'],
  ['p1-bug', 'p1-follow-up', 'dev'],
] as const)(
  'schedules %s after one intervening draw and selects its absent expert callback',
  (parent, target, expert) => {
    let state = choose(openState(), parent, 'park');
    expect(state.scheduled).toEqual([{ eventId: target, dueTurn: 4 }]);
    expect(
      getDrawCandidates(state).some((entry) => entry.event.kind === 'callback'),
    ).toBe(false);
    state = choose(state, 'where-we-stand', 'refocus');
    state = release(state, expert);
    const pending = drawEvent(state);
    expect(pending.current).toMatchObject({ id: target, speaker: 'priya' });
    expect(getDrawCandidates(state)).toEqual([
      { event: pending.current, probability: 1 },
    ]);
    expect(resolve(pending, 'timebox').scheduled).toEqual([]);
  },
);

it('reproduces the approved support callback absence route and suppresses it on early ending', () => {
  let state = release(
    release(initialState('support-walkthrough'), 'gary'),
    'jordan',
  );
  state = choose(state, 'support-training', 'park');
  expect(state.scheduled).toEqual([
    { eventId: 'support-follow-up', dueTurn: 2 },
  ]);
  const endedBeforeDue = callIt(state);
  expect(endedBeforeDue).toMatchObject({ ending: 'called-early', turn: 1 });
  expect(endedBeforeDue.scheduled).toEqual(state.scheduled);
  expect(getDrawCandidates(endedBeforeDue)).toEqual([]);
  expect(() => drawEvent(endedBeforeDue)).toThrow();
  expect(
    endedBeforeDue.log.some(
      (entry) => entry.type === 'draw' && entry.eventId === 'support-follow-up',
    ),
  ).toBe(false);
  state = choose(state, 'where-we-stand', 'refocus');
  state = release(state, 'sam');
  const pending = drawEvent(state);
  expect(pending.current).toMatchObject({
    id: 'support-follow-up',
    speaker: 'priya',
  });
  const next = resolve(pending, 'hear');
  expect(next).toMatchObject({
    progress: 16,
    risks: 0,
    minute: 12,
    personMinutes: 39,
  });
  expect(next.personMinutes - state.personMinutes).toBe(27);
  expect(next.scheduled).toEqual([]);
});

it('transcribes numeric epilogue tiers without runtime parsing or gaps across legal risks', () => {
  const expected = [
    ['decision-clean', 0, 0],
    ['decision-loose-ends', 1, 2],
    ['decision-risky', 3, 5],
  ];
  const decisions = epilogues.filter((entry) => entry.ending === 'decision');
  expect(
    decisions.map((entry) => [entry.key, entry.minRisks, entry.maxRisks]),
  ).toEqual(expected);
  for (let risks = 0; risks <= 5; risks += 1) {
    const matching = decisions.filter(
      (entry) => risks >= entry.minRisks && risks <= entry.maxRisks,
    );
    expect(matching).toHaveLength(1);
    expect(matching[0]?.key).toBe(
      risks === 0
        ? 'decision-clean'
        : risks <= 2
          ? 'decision-loose-ends'
          : 'decision-risky',
    );
  }
});

it.each([
  [44, 'hear', false, 49, 60, 'running'],
  [44, 'timebox', false, 45, 45, 'ended'],
  [46, 'timebox', false, 47, 45, 'ended'],
  [44, 'vp', true, 45, 60, 'running'],
] as const)(
  'preserves the approved room booking boundary at minute %i using %s',
  (minute, response, vp, expectedMinute, bookingEnd, phase) => {
    const state = {
      ...openState(),
      minute,
      present: vp
        ? [...initialState('booking').present, 'vp']
        : initialState('booking').present,
    } satisfies MeetingState;
    const next = choose(state, 'room-booked', response);
    expect(next).toMatchObject({
      minute: expectedMinute,
      bookingEnd,
      phase,
      personMinutes: (expectedMinute - minute) * state.present.length,
    });
  },
);

it('exhausted content falls back to explicit two-minute acknowledgements until timeout', () => {
  let state: MeetingState = {
    ...openState(),
    seenEventIds: allEvents.map((event) => event.id),
  };
  while (state.phase === 'running') {
    const pending = drawEvent(state);
    expect(pending.current?.id).toBe('filler');
    expect(pending.current?.responses[0]?.effect.minutes).toBe(2);
    state = resolve(pending, 'ack');
  }
  expect(state).toMatchObject({
    ending: 'time-expired',
    minute: 60,
    progress: 0,
  });
});

it.each([
  ['legal', 'legal', 'press-date', 'legal', 'legal-absent', 4],
  ['vp-joins', 'vp', 'room-booked', 'vp', 'vp-absent', 3],
] as const)(
  'admits %s with old-headcount billing, enables its later choice and prevents reentry',
  (arrival, attendee, laterEvent, responseId, reasonKey, minutes) => {
    const before = { ...openState(), minute: 15 };
    const response = candidate(before, laterEvent).responses.find(
      (entry) => entry.id === responseId,
    );
    if (response === undefined)
      throw new Error('Missing arrival-dependent response');
    expect(previewResponse(before, response)).toEqual({
      enabled: false,
      responseId,
      reasonKey,
    });
    const joined = choose(before, arrival, 'timebox');
    expect(joined.present).toEqual([...before.present, attendee]);
    expect(joined.personMinutes).toBe(minutes * before.present.length);
    expect(
      previewResponse(
        { ...joined, current: candidate(before, laterEvent) },
        response,
      ).enabled,
    ).toBe(true);
    const released = release(joined, attendee);
    expect(previewResponse(released, response)).toEqual({
      enabled: false,
      responseId,
      reasonKey,
    });
    // Isolate the no-reentry guard from the once-seen guard.
    expect(
      getDrawCandidates({ ...released, seenEventIds: [] }).some(
        (entry) => entry.event.id === arrival,
      ),
    ).toBe(false);
  },
);

it('connects every collectible catalog ID to an existing constructed title witness', () => {
  const witnesses = {
    'inbox-zero': { personMinutes: 90, decisions: qualityRecords([1]) },
    'efficient-facilitator': {
      personMinutes: 90,
      decisions: qualityRecords([1]),
    },
    'ship-it-and-pray': { risks: 3 },
    'death-by-diligence': { personMinutes: 270 },
    'skeleton-crew': { present: ['priya', 'sam'] },
    'reply-all-royalty': { peakHeadcount: 8 },
    'parking-lot-attendant': { parkedCount: 4 },
    'gary-free-zone': { releasedAttendeeIds: ['gary'] },
    'played-it-right': {
      ending: 'time-expired',
      decisions: qualityRecords([1]),
    },
    'take-this-offline': { ending: 'called-early' },
    'calendar-criminal': { ending: 'time-expired' },
    'could-have-been-an-email': { ending: 'cancelled' },
  } as const satisfies Record<
    (typeof titles)[number]['id'],
    Partial<MeetingState>
  >;
  expect(titles.map((entry) => entry.id).sort()).toEqual(
    Object.keys(witnesses).sort(),
  );
  for (const title of titles) {
    const state = scoreState(witnesses[title.id]);
    expect(earnedTitles(state, score(state))).toContain(title.id);
  }
});
