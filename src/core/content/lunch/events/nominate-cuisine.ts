// Approved docs/content-table.md — lunch-l02b-reviewed-2; L05 injection only until L08.
import type { MeetingEvent, OutcomeResponse } from '../../../engine/types';
export const event = {
  id: 'nominate-cuisine',
  kind: 'substantive',
  rarity: 'common',
  weight: 1,
  negative: false,
  speaker: 'priya',
  line: 'Six adults. One lunch. Which cuisine should we try to agree on?',
  responses: [
    {
      id: 'italian',
      label: 'Suggest Italian',
      description:
        'Start with Italian. We still need to hear what everyone can eat.',
      technique: 'refocus',
      outcomes: [
        {
          id: 'nominated',
          weight: 1,
          effect: {
            minutes: 2,
            progress: 8,
            nominateCuisine: 'italian',
          },
          line: 'Italian is on the board. Priya leaves space underneath for objections.',
        },
      ],
    },
    {
      id: 'mexican',
      label: 'Suggest Mexican',
      description:
        'Put Mexican forward. Expect opinions before anyone gets lunch.',
      technique: 'refocus',
      outcomes: [
        {
          id: 'nominated',
          weight: 1,
          effect: {
            minutes: 2,
            progress: 8,
            nominateCuisine: 'mexican',
          },
          line: 'Mexican goes on the board under Suggestion. Priya is careful about the heading.',
        },
      ],
    },
    {
      id: 'thai',
      label: 'Suggest Thai',
      description:
        'Suggest Thai. Choosing a cuisine is the start; getting agreement is the work.',
      technique: 'refocus',
      outcomes: [
        {
          id: 'nominated',
          weight: 1,
          effect: {
            minutes: 2,
            progress: 8,
            nominateCuisine: 'thai',
          },
          line: 'Thai is nominated. Priya puts the marker down before this becomes a branding exercise.',
        },
      ],
    },
  ],
} satisfies MeetingEvent<OutcomeResponse>;
