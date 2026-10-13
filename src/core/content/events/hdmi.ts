import type { MeetingEvent } from '../../engine/types';

// Approved docs/content-table-launch.md → hdmi.
export const hdmi = {
  id: 'hdmi',
  kind: 'noise',
  rarity: 'common',
  weight: 1,
  negative: false,
  speaker: 'dev',
  line: 'Does anyone have a USB-C to HDMI adapter?',
  responses: [
    {
      id: 'hear',
      label: 'Find the adapter',
      technique: 'hear',
      requires: {
        present: ['dev'],
      },
      disabledReasonKey: 'dev-absent',
      effect: {
        minutes: 6,
        progress: 2,
        risks: 0,
      },
      line: 'Dev finds four adapters. None have the same ends.',
    },
    {
      id: 'timebox',
      label: 'Give it one minute',
      technique: 'timebox',
      effect: {
        minutes: 1,
        progress: 0,
        risks: 0,
      },
      line: 'One minute later, the laptop becomes the presentation screen.',
    },
    {
      id: 'park',
      label: 'Skip the slides',
      technique: 'park',
      effect: {
        minutes: 1,
        progress: 0,
        risks: 0,
      },
      line: 'The decision survives without a gradient background.',
    },
  ],
  variants: [
    {
      when: {
        absent: ['dev'],
      },
      speaker: 'priya',
      line: 'Dev left. Does anyone know which cable makes the slides appear?',
      responses: [
        {
          id: 'timebox',
          label: 'Give it one minute',
          technique: 'timebox',
          effect: {
            minutes: 2,
            progress: 0,
            risks: 0,
          },
          line: 'The cable remains a mystery. We gather around the laptop.',
        },
        {
          id: 'park',
          label: 'Skip the slides',
          technique: 'park',
          effect: {
            minutes: 1,
            progress: 0,
            risks: 0,
          },
          line: 'The decision survives without a gradient background.',
        },
      ],
    },
  ],
} as const satisfies MeetingEvent;
