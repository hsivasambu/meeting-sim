// Approved docs/content-table.md — lunch-l02b-reviewed-2; L05 injection only until L08.
import type { MeetingEvent, OutcomeResponse } from '../../../engine/types';
export const event = {
  id: 'spice-question',
  kind: 'substantive',
  rarity: 'uncommon',
  weight: 1,
  negative: true,
  speaker: 'sam',
  line: "I'd consider {cuisine}, but I'd like a mild option. Can we check rather than assume?",
  responses: [
    {
      id: 'hear',
      label: 'Check mild options',
      description:
        'Read the options properly. A reliable answer takes time and respects the preference.',
      technique: 'hear',
      outcomes: [
        {
          id: 'checked',
          weight: 1,
          effect: {
            minutes: 7,
            progress: 20,
          },
          line: 'We find mild options. Sam asks for the menu to stay open while everyone catches up.',
        },
      ],
    },
    {
      id: 'timebox',
      label: 'Try a quick menu check',
      description:
        'Scan for a mild option. A clear answer helps; an unclear note may set us back and drag on.',
      technique: 'timebox',
      outcomes: [
        {
          id: 'clear',
          weight: 2,
          effect: {
            minutes: 3,
            progress: 22,
          },
          line: 'The quick check finds a clear mild option. Sam can stop negotiating with adjectives.',
        },
        {
          id: 'unclear',
          weight: 1,
          effect: {
            minutes: 6,
            progress: -4,
          },
          line: 'The menu note is unclear. Sam is less convinced, and we spend longer reading it.',
        },
      ],
    },
    {
      id: 'park',
      label: 'Check spice later',
      description:
        'Move on now and return to the mild option question. The preference still needs attention.',
      technique: 'park',
      outcomes: [
        {
          id: 'deferred',
          weight: 1,
          effect: {
            minutes: 1,
            progress: 0,
            callback: {
              eventId: 'spice-return',
              afterTurns: 2,
            },
          },
          line: 'Sam notes the mild option question. Calling it later has not answered it.',
        },
      ],
    },
  ],
} satisfies MeetingEvent<OutcomeResponse>;
