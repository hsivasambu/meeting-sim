// Approved docs/content-table.md — lunch-l02b-reviewed-2; L05 injection only until L08.
import type { MeetingEvent, OutcomeResponse } from '../../../engine/types';
export const event = {
  id: 'lunch-window',
  kind: 'substantive',
  rarity: 'common',
  weight: 1,
  negative: false,
  speaker: 'priya',
  line: 'Can we leave time to eat {cuisine}? I would rather not spend the break explaining it.',
  responses: [
    {
      id: 'hear',
      label: "Check everyone's break",
      description:
        'Hear the timing constraints. Takes longer, but gives people a workable lunch plan.',
      technique: 'hear',
      outcomes: [
        {
          id: 'checked',
          weight: 1,
          effect: {
            minutes: 6,
            progress: 18,
          },
          line: 'We find a workable lunch window. Priya asks everyone to leave it as lunch.',
        },
      ],
    },
    {
      id: 'pat',
      label: 'Ask Pat to protect lunch',
      description:
        'Ask the senior colleague to protect the break. Quick help, if Pat is already here.',
      technique: 'owner',
      requires: {
        present: ['vp'],
      },
      disabledReasonKey: 'pat-absent',
      outcomes: [
        {
          id: 'protected',
          weight: 1,
          effect: {
            minutes: 3,
            progress: 16,
          },
          line: 'Pat protects the lunch break from other meetings. This meeting remains an exception.',
        },
      ],
    },
    {
      id: 'timebox',
      label: 'Keep lunch simple',
      description:
        'Limit timing talk to the main constraint. Quicker, with less detail settled.',
      technique: 'timebox',
      outcomes: [
        {
          id: 'bounded',
          weight: 1,
          effect: {
            minutes: 3,
            progress: 11,
          },
          line: 'We cover the main timing constraint. The rest will have to fit around eating.',
        },
      ],
    },
  ],
  variants: [
    {
      when: {
        present: ['vp'],
      },
      speaker: 'priya',
      line: 'Pat, can you protect the lunch break? Including from invitations marked optional.',
      responses: [
        {
          id: 'hear',
          label: "Check everyone's break",
          description:
            'Hear the timing constraints. Takes longer, but gives people a workable lunch plan.',
          technique: 'hear',
          outcomes: [
            {
              id: 'checked',
              weight: 1,
              effect: {
                minutes: 6,
                progress: 18,
              },
              line: 'We find a workable lunch window. Priya asks everyone to leave it as lunch.',
            },
          ],
        },
        {
          id: 'pat',
          label: 'Ask Pat to protect lunch',
          description:
            'Ask the senior colleague to protect the break. Quick help, if Pat is already here.',
          technique: 'owner',
          requires: {
            present: ['vp'],
          },
          disabledReasonKey: 'pat-absent',
          outcomes: [
            {
              id: 'protected',
              weight: 1,
              effect: {
                minutes: 3,
                progress: 16,
              },
              line: 'Pat protects the lunch break from other meetings. This meeting remains an exception.',
            },
          ],
        },
        {
          id: 'timebox',
          label: 'Keep lunch simple',
          description:
            'Limit timing talk to the main constraint. Quicker, with less detail settled.',
          technique: 'timebox',
          outcomes: [
            {
              id: 'bounded',
              weight: 1,
              effect: {
                minutes: 3,
                progress: 11,
              },
              line: 'We cover the main timing constraint. The rest will have to fit around eating.',
            },
          ],
        },
      ],
    },
  ],
} satisfies MeetingEvent<OutcomeResponse>;
