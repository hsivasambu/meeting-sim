import { expect, it } from 'vitest';
import { matchesCondition } from './conditions';
import { validatePresentations } from './contentValidationHelpers';
import { fixtureState } from './fixtures/packs';
import type { AttendeeId, Condition, MeetingEvent, Response } from './types';
import { ATTENDEE_IDS } from './constants';

const fallback: Response = {
  id: 'fallback',
  label: 'Fallback',
  technique: 'ack',
  effect: { minutes: 1 },
  line: 'Fallback.',
};
const scheduler: Response = {
  id: 'schedule',
  label: 'Schedule',
  technique: 'park',
  effect: { minutes: 1, callback: { eventId: 'return', afterTurns: 2 } },
  line: 'Scheduled.',
};
let rosters: readonly (readonly AttendeeId[])[] = [[]];
for (const id of ATTENDEE_IDS)
  rosters = [...rosters, ...rosters.map((set) => [...set, id])];
const legal = rosters.filter((set) => set.includes('priya') && set.length >= 2);

function exhaustive(event: MeetingEvent): readonly string[] {
  const issues = new Set<string>();
  const reached = new Set<unknown>();
  for (const present of legal)
    for (let minute = 0; minute < 60; minute++)
      for (let risks = 0; risks <= 5; risks++) {
        const state = { ...fixtureState, present, minute, risks };
        if (!matchesCondition(state, event.when)) continue;
        const selected =
          event.variants?.find((variant) =>
            matchesCondition(state, variant.when),
          ) ?? event;
        reached.add(selected);
        if (selected.speaker !== 'room' && !present.includes(selected.speaker))
          issues.add(event.id + ':speaker-presence');
        if (
          !selected.responses.some((response) =>
            matchesCondition(state, response.requires),
          )
        )
          issues.add(event.id + ':enabled-response');
        if (
          !selected.responses.some(
            (response) =>
              response.effect.callback?.eventId === 'return' &&
              matchesCondition(state, response.requires),
          )
        )
          issues.add(event.id + ':reachable-scheduler');
      }
  if (reached.size === 0) issues.add(event.id + ':event-reachability');
  event.variants?.forEach((variant, index) => {
    if (!reached.has(variant))
      issues.add(
        `${event.id}.presentations[${index + 1}]:presentation-reachability`,
      );
  });
  return [...issues].sort();
}

it('proves boundary representatives agree with every roster, minute and risk state', () => {
  const conditions: readonly Condition[] = [
    {},
    { minMinute: 0, maxMinute: 0 },
    { minMinute: 59 },
    { minMinute: 60 },
    { maxMinute: 20 },
    { minMinute: 20, maxMinute: 20 },
    { minRisks: 0, maxRisks: 0 },
    { minRisks: 5 },
    { minRisks: 6 },
    { minMinute: 10, maxMinute: 9 },
    { minRisks: 2, maxRisks: 1 },
    {
      present: ['sam'],
      minMinute: 12,
      maxMinute: 45,
      minRisks: 1,
      maxRisks: 4,
    },
  ];
  for (const condition of conditions) {
    const event: MeetingEvent = {
      id: 'boundaries',
      kind: 'noise',
      rarity: 'common',
      speaker: 'sam',
      line: 'Base.',
      when: condition,
      responses: [
        { ...scheduler, requires: condition, disabledReasonKey: 'disabled' },
      ],
      variants: [
        {
          when: { ...condition, absent: ['sam'] },
          speaker: 'priya',
          line: 'First.',
          responses: [
            fallback,
            {
              ...scheduler,
              requires: {
                minMinute: 11,
                maxMinute: 40,
                minRisks: 2,
                maxRisks: 3,
              },
              disabledReasonKey: 'disabled',
            },
          ],
        },
        {
          when: { minMinute: 21, maxMinute: 50, maxRisks: 2 },
          speaker: 'sam',
          line: 'Second.',
          responses: [scheduler],
        },
      ],
    };
    const actual: string[] = [];
    validatePresentations(event, undefined, 'return', (path, rule) =>
      actual.push(path + ':' + rule),
    );
    expect(actual.sort()).toEqual(exhaustive(event));
  }
});
