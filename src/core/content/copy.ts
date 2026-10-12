import type { MeetingState, ReleasePreview } from '../engine/types';

export const releaseReasons = {
  'release-owner': 'Priya must stay to own the launch decision.',
  'release-absent': 'This attendee has already left the room.',
  'release-minimum': 'One other attendee must stay with Priya.',
} as const satisfies Record<
  Extract<ReleasePreview, { enabled: false }>['reasonKey'],
  string
>;

export const shellCopy = {
  title: "This Could've Been an Email",
  objective:
    "Reach a go/no-go decision on Friday's launch before the hour is up.",
} as const;

export const meetingCopy = {
  start: 'Start',
  loading: 'Booking the room…',
  retry: 'Retry',
  meeting: 'The Friday Launch Meeting',
  instructions:
    'Time moves only when you answer. Reach 100 progress before the booking ends. Release attendees to lower costs; keeping experts preserves their options.',
  keyboard: 'Enter: show choices or continue. 1–3: choose a response.',
  showChoices: 'Show choices',
  continue: 'Continue',
  callIt: 'Call it',
  roster: 'In the room',
  confirmRelease: 'Thanks, you can drop off.',
  cancel: 'Cancel',
  progress: 'Progress',
  minutes: 'Minutes used',
  booking: 'Booking ends at minute',
  cost: 'Cost',
  risks: 'Open risks',
  headcount: 'Attendees',
  peakHeadcount: 'Peak attendees',
  room: 'Room',
  results: 'Results',
  score: 'Score',
  replay: 'Play again',
  previewMinutes: 'min',
  previewProgress: 'progress',
  previewRisks: 'risks',
  endings: {
    decision: 'Decision reached',
    'called-early': 'Called early',
    'time-expired': 'Time expired',
    cancelled: 'Cancelled',
  },
} as const satisfies Record<string, string | Readonly<Record<string, string>>>;

export const meetingUiConfig = {
  choiceKeys: ['1', '2', '3'],
  choiceNumbers: [1, 2, 3],
} as const;

export const disabledReasons = {
  'dev-absent': 'Dev has left. Engineering expertise is no longer in the room.',
  'sam-absent': 'Sam has left. Support expertise is no longer in the room.',
  'morgan-absent':
    'Morgan has left. Marketing expertise is no longer in the room.',
  'priya-absent': 'Priya must be present to own the launch decision.',
  'legal-absent': "Legal isn't in the room. Nobody can clear the claims.",
  'vp-absent': "The VP isn't in the room. Nobody here outranks the next team.",
} as const satisfies Record<string, string>;

export const epilogues = [
  {
    key: 'decision-clean',
    ending: 'decision',
    riskCondition: 'R = 0',
    minRisks: 0,
    maxRisks: 0,
    line: "Friday's launch goes smoothly. Nobody remembers the meeting. The highest compliment.",
  },
  {
    key: 'decision-loose-ends',
    ending: 'decision',
    riskCondition: 'R = 1–2',
    minRisks: 1,
    maxRisks: 2,
    line: "Friday's launch goes ahead. A few loose ends become Monday's problem.",
  },
  {
    key: 'decision-risky',
    ending: 'decision',
    riskCondition: 'R = 3–5',
    minRisks: 3,
    maxRisks: 5,
    line: 'Support learned about the launch from social media.',
  },
  {
    key: 'called-early',
    ending: 'called-early',
    riskCondition: 'any',
    line: 'Decision deferred to a follow-up meeting. Invite sent.',
  },
  {
    key: 'time-expired',
    ending: 'time-expired',
    riskCondition: 'any',
    line: 'The next team is standing at the glass door.',
  },
  {
    key: 'cancelled',
    ending: 'cancelled',
    riskCondition: 'any',
    line: "This could've been an email. It is now an email.",
  },
] as const satisfies readonly {
  readonly key: string;
  readonly ending: NonNullable<MeetingState['ending']>;
  readonly riskCondition: string;
  readonly minRisks?: number;
  readonly maxRisks?: number;
  readonly line: string;
}[];

export const resultsCopy = {
  fallbackHeading: 'Decision Made',
  cancelledMoment: 'No meeting moments. Just an email.',
  decisionMoment: 'The meeting ended with a decision.',
  otherMoment: 'The decision will need another meeting.',
} as const satisfies Record<string, string>;
