import type { MeetingState } from '../engine/types';

export const shellCopy = {
  title: "This Could've Been an Email",
  objective:
    "Reach a go/no-go decision on Friday's launch before the hour is up.",
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
