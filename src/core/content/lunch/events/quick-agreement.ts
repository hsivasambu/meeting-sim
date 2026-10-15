// Approved docs/content-table.md — lunch-l02b-reviewed-2; L05 injection only until L08.
import type { MeetingEvent, OutcomeResponse } from '../../../engine/types';
export const event = {
  id: 'quick-agreement',
  kind: 'substantive',
  rarity: 'common',
  weight: 1,
  negative: false,
  speaker: 'morgan',
  line: 'It sounds like we are leaning toward {cuisine}. Shall I call that broad support?',
  responses: [
    {
      id: 'refocus',
      label: 'Try a quick agreement',
      description:
        'Ask for a quick yes. It may build momentum, or reopen objections and take longer.',
      technique: 'refocus',
      outcomes: [
        {
          id: 'momentum',
          weight: 3,
          effect: {
            minutes: 3,
            progress: 23,
          },
          line: 'Several heads nod toward {cuisine}. Morgan starts a summary before the nods have finished.',
        },
        {
          id: 'objections',
          weight: 2,
          effect: {
            minutes: 7,
            progress: -6,
          },
          line: "The quick ask reopens objections. Morgan's summary was more confident than the room.",
        },
      ],
    },
    {
      id: 'hear',
      label: 'Hear each concern',
      description:
        'Give everyone a turn on the suggestion. Slower, but concerns get a proper hearing.',
      technique: 'hear',
      outcomes: [
        {
          id: 'heard',
          weight: 1,
          effect: {
            minutes: 7,
            progress: 20,
          },
          line: 'Morgan hears each concern, then adds a carefully placed almost to the summary.',
        },
      ],
    },
    {
      id: 'invite',
      label: 'Bring Pat up to speed',
      description:
        'Invite Pat to hear the suggestion. Useful support, with another adult staying afterward.',
      technique: 'owner',
      requires: {
        absent: ['vp'],
      },
      disabledReasonKey: 'pat-present',
      outcomes: [
        {
          id: 'briefed',
          weight: 1,
          effect: {
            minutes: 4,
            progress: 12,
            joins: ['vp'],
          },
          line: 'Pat joins and hears the {cuisine} suggestion. The recap now has senior attendance.',
        },
      ],
    },
  ],
} satisfies MeetingEvent<OutcomeResponse>;
