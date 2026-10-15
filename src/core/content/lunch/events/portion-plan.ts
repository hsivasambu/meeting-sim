// Approved docs/content-table.md — lunch-l02b-reviewed-2; L05 injection only until L08.
import type { MeetingEvent, OutcomeResponse } from '../../../engine/types';
export const event = {
  id: 'portion-plan',
  kind: 'substantive',
  rarity: 'common',
  weight: 1,
  negative: false,
  speaker: 'jordan',
  line: 'Could we each choose our own meal within {cuisine}? I have made a seating chart anyway.',
  responses: [
    {
      id: 'owner',
      label: 'Let people pick meals',
      description:
        'Keep {cuisine} on the table and sort out how people choose their own dishes.',
      technique: 'owner',
      outcomes: [
        {
          id: 'individual',
          weight: 1,
          effect: {
            minutes: 4,
            progress: 18,
          },
          line: 'Personal meal choices stay personal. Jordan files the seating chart under personal loss.',
        },
      ],
    },
    {
      id: 'hear',
      label: 'Hear the sharing plan',
      description:
        'Discuss sharing versus separate meals. Thorough, but everyone will have an example.',
      technique: 'hear',
      outcomes: [
        {
          id: 'discussed',
          weight: 1,
          effect: {
            minutes: 7,
            progress: 20,
          },
          line: 'We settle how to choose dishes. Jordan accepts that separate meals still count as lunch.',
        },
      ],
    },
    {
      id: 'email',
      label: 'Send the suggestion',
      description:
        'Email the suggestion and move on. Quick clarity, with meal details still to discuss.',
      technique: 'email',
      outcomes: [
        {
          id: 'sent',
          weight: 1,
          effect: {
            minutes: 2,
            progress: 7,
          },
          line: 'The {cuisine} suggestion is emailed. Everyone nearby checks a separate inbox.',
        },
      ],
    },
  ],
} satisfies MeetingEvent<OutcomeResponse>;
