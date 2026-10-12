import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { validateContent } from '../src/core/engine/contentValidation';
import { ATTENDEE_IDS, MVP_EVENT_RULES } from '../src/core/engine/constants';
import type {
  AttendeeId,
  Condition,
  ContentPack,
  EventKind,
  MeetingEvent,
  Rarity,
  Response,
  Technique,
} from '../src/core/engine/types';

function cell(row: readonly string[], index: number): string {
  const value = row[index];
  if (value === undefined) throw new Error('Missing content-table cell');
  return value.replaceAll('`', '');
}
function member<T extends string>(values: readonly T[], value: string): T {
  const match = values.find((entry) => entry === value);
  if (match === undefined)
    throw new Error('Unknown content-table value: ' + value);
  return match;
}
function rows(text: string): readonly (readonly string[])[] {
  return text
    .split(/\r?\n/)
    .filter((line) => line.startsWith('|') && !line.startsWith('| ---'))
    .map((line) =>
      line
        .split('|')
        .slice(1, -1)
        .map((value) => value.trim()),
    );
}
function condition(value: string): Condition | undefined {
  if (value === '—') return undefined;
  const result: {
    present?: AttendeeId[];
    absent?: AttendeeId[];
    minMinute?: number;
    maxMinute?: number;
    minRisks?: number;
    maxRisks?: number;
  } = {};
  for (const clause of value.split(',')) {
    const [key, raw] = clause
      .trim()
      .split(':')
      .map((part) => part.trim());
    if (raw === undefined) throw new Error('Invalid table condition');
    if (key === 'present' || key === 'absent')
      result[key] = [member(ATTENDEE_IDS, raw)];
    else if (
      key === 'minMinute' ||
      key === 'maxMinute' ||
      key === 'minRisks' ||
      key === 'maxRisks'
    )
      result[key] = Number(raw);
    else throw new Error('Unknown table condition');
  }
  return result;
}
const source = readFileSync(
  new URL('../docs/content-table.md', import.meta.url),
  'utf8',
);
const headings = [...source.matchAll(/^### ([\w-]+)\r?$/gm)];
const familyRows = rows(
  source.split('## Presentations and responses')[0] ?? '',
).filter((row) =>
  [
    'noise',
    'tangent',
    'substantive',
    'escalation',
    'gift',
    'callback',
  ].includes(cell(row, 1)),
);
const events = headings.map((heading, index): MeetingEvent => {
  const id = heading[1];
  if (id === undefined) throw new Error('Missing table event ID');
  const section = source.slice(
    heading.index,
    headings[index + 1]?.index ?? source.indexOf('## Disabled reasons'),
  );
  const data = rows(section);
  const responseRows = data.filter(
    (row) => row.length === 13 && cell(row, 1) !== 'ID',
  );
  function responses(set: string): readonly Response[] {
    return responseRows
      .filter((row) => cell(row, 0) === set)
      .map((row): Response => {
        const requires = condition(cell(row, 4));
        const callback = cell(row, 9);
        const join = cell(row, 10);
        const booking = cell(row, 11);
        return {
          id: cell(row, 1),
          label: cell(row, 2),
          technique: member<Technique>(
            ['hear', 'timebox', 'park', 'owner', 'email', 'refocus', 'ack'],
            cell(row, 3),
          ),
          ...(requires === undefined
            ? {}
            : { requires, disabledReasonKey: cell(row, 5) }),
          effect: {
            minutes: Number(cell(row, 6)),
            progress: Number(cell(row, 7)),
            risks: Number(cell(row, 8)),
            ...(callback === '—'
              ? {}
              : { callback: { eventId: callback, afterTurns: 2 } }),
            ...(join === '—' ? {} : { joins: [member(ATTENDEE_IDS, join)] }),
            ...(booking === '—'
              ? {}
              : {
                  bookingEnd:
                    member(['45', '60'] as const, booking) === '45' ? 45 : 60,
                }),
          },
          line: cell(row, 12),
        };
      });
  }
  const presentations = data.filter(
    (row) =>
      row.length === 5 &&
      (cell(row, 0) === 'base' || cell(row, 0).startsWith('variant')),
  );
  const base = presentations[0];
  const family = familyRows.find((row) => cell(row, 0) === id);
  if (base === undefined || family === undefined)
    throw new Error('Missing family/presentation: ' + id);
  const when = condition(cell(family, 5));
  return {
    id,
    kind: member<EventKind>(
      ['noise', 'tangent', 'substantive', 'escalation', 'gift', 'callback'],
      cell(family, 1),
    ),
    rarity: member<Rarity>(['common', 'uncommon', 'rare'], cell(family, 2)),
    weight: Number(cell(family, 3)),
    negative: cell(family, 4) === 'true',
    ...(when === undefined ? {} : { when }),
    speaker: member([...ATTENDEE_IDS, 'room'] as const, cell(base, 2)),
    line: cell(base, 3),
    responses: responses(cell(base, 4)),
    ...(presentations.length === 1
      ? {}
      : {
          variants: presentations.slice(1).map((row) => {
            const when = condition(cell(row, 1));
            if (when === undefined)
              throw new Error('Variant needs a condition');
            return {
              when,
              speaker: member([...ATTENDEE_IDS, 'room'] as const, cell(row, 2)),
              line: cell(row, 3),
              responses: responses(cell(row, 4)),
            };
          }),
        }),
  };
});
const filler = events.find((event) => event.id === 'filler');
if (filler === undefined) throw new Error('Missing filler');
const pack: ContentPack = {
  eventRules: MVP_EVENT_RULES,
  events: events.filter(
    (event) => event.kind !== 'callback' && event.id !== 'filler',
  ),
  callbacks: events.filter((event) => event.kind === 'callback'),
  filler,
};
const reasonSection =
  source.split('## Disabled reasons')[1]?.split('## Epilogues')[0] ?? '';
const disabledReasons = Object.fromEntries(
  rows(reasonSection)
    .filter((row) => cell(row, 0).endsWith('-absent'))
    .map((row) => [cell(row, 0), cell(row, 1)]),
);

describe('approved content-table compatibility (validation only; no live pack)', () => {
  it('accepts every approved row, including all four expert-rule counterexamples', () => {
    expect(pack.events).toHaveLength(17);
    expect(pack.callbacks).toHaveLength(3);
    expect(
      events.reduce((count, event) => count + (event.variants?.length ?? 0), 0),
    ).toBe(13);
    expect(validateContent(pack, { catalog: { disabledReasons } })).toEqual([]);
  });
  it('still rejects removed requirements on the four expert responses', () => {
    const broken = {
      ...pack,
      events: pack.events.map((event) =>
        ['failing-tests', 'support-training'].includes(event.id)
          ? {
              ...event,
              responses: event.responses.map((response) => {
                const { requires, ...rest } = response;
                return requires === undefined ? response : rest;
              }),
            }
          : event,
      ),
    };
    expect(
      validateContent(broken)
        .filter((issue) => issue.rule === 'expert-requirement')
        .map((issue) => issue.path),
    ).toEqual([
      'support-training.presentations[0].hear',
      'support-training.presentations[0].owner',
      'failing-tests.presentations[0].hear',
      'failing-tests.presentations[0].owner',
    ]);
  });
});
