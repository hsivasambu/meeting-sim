import { expect, it } from 'vitest';
import { needsExpertRequirement } from './contentValidationExpert';
import type { MeetingEvent, Response } from './types';

it('compares unchanged shared responses independently of object key order', () => {
  const response: Response = {
    id: 'hear',
    label: 'Hear',
    technique: 'hear',
    requires: { present: ['priya'] },
    disabledReasonKey: 'reason',
    effect: { minutes: 2, progress: 1 },
    line: 'Shared tangent.',
  };
  const shared: Response = {
    line: response.line,
    effect: { progress: 1, minutes: 2 },
    requires: { present: ['priya'] },
    disabledReasonKey: 'reason',
    technique: 'hear',
    label: 'Hear',
    id: 'hear',
  };
  const event: MeetingEvent = {
    id: 'shared',
    kind: 'tangent',
    rarity: 'common',
    speaker: 'morgan',
    line: 'Tangent.',
    responses: [response],
    variants: [
      {
        when: { absent: ['morgan'] },
        speaker: 'priya',
        line: 'Absent tangent.',
        responses: [shared],
      },
    ],
  };
  expect(needsExpertRequirement(event, response)).toBe(false);
  const changed = {
    ...event,
    variants: event.variants?.map((variant) => ({
      ...variant,
      responses: [{ ...shared, requires: { present: ['dev'] as const } }],
    })),
  };
  expect(
    needsExpertRequirement(
      { ...event, variants: changed.variants ?? [] },
      response,
    ),
  ).toBe(true);
  expect(
    needsExpertRequirement(
      {
        ...event,
        variants: [
          {
            when: { absent: ['morgan'] },
            speaker: 'priya',
            line: 'Absent.',
            responses: [],
          },
        ],
      },
      response,
    ),
  ).toBe(true);
});
