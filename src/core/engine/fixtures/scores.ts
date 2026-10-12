import type {
  DecisionRecord,
  MeetingState,
  ScoreBreakdown,
  TitleId,
} from '../types';
import { fixtureState } from './packs';
import { decimalFraction } from '../utilityFraction';

/** Supports Design Doc v2 → Scoring: synthetic persisted decision qualities. */
export function qualityRecords(
  qualities: readonly (number | null)[],
): DecisionRecord[] {
  return qualities.map((quality, turn) => ({
    turn,
    eventId: 'fixture-score',
    responseId: 'fixture-choice',
    quality,
    qualityFraction:
      quality === null
        ? null
        : {
            numerator: decimalFraction(quality).numerator.toString(),
            denominator: decimalFraction(quality).denominator.toString(),
          },
  }));
}

/** Supports Design Doc v2 → Worked examples with canonical integer person-minutes. */
export function scoreState(
  overrides: Partial<MeetingState> = {},
): MeetingState {
  return {
    ...fixtureState,
    phase: 'ended',
    ending: 'decision',
    progress: 100,
    personMinutes: 180,
    decisions: qualityRecords([0.5]),
    ...overrides,
  };
}

interface ScoreExample {
  readonly name: string;
  readonly state: MeetingState;
  readonly expected: ScoreBreakdown;
  readonly title: TitleId;
}
export const scoreExamples = [
  {
    name: 'Sharp and careful',
    state: scoreState({ personMinutes: 132, decisions: qualityRecords([0.9]) }),
    expected: { outcome: 400, efficiency: 253, decisions: 270, total: 923 },
    title: 'efficient-facilitator',
  },
  {
    name: 'Slow and thorough',
    state: scoreState({
      personMinutes: 324,
      decisions: qualityRecords([0.85]),
    }),
    expected: { outcome: 400, efficiency: 40, decisions: 255, total: 695 },
    title: 'death-by-diligence',
  },
  {
    name: 'Fast and reckless',
    state: scoreState({
      risks: 3,
      personMinutes: 108,
      decisions: qualityRecords([0.6]),
    }),
    expected: { outcome: 220, efficiency: 280, decisions: 180, total: 680 },
    title: 'ship-it-and-pray',
  },
  {
    name: 'Good play, rough draw',
    state: scoreState({
      ending: 'time-expired',
      progress: 84,
      personMinutes: 360,
      decisions: qualityRecords([0.9]),
    }),
    expected: { outcome: 151, efficiency: 0, decisions: 270, total: 421 },
    title: 'played-it-right',
  },
  {
    name: 'Poor play, time expired',
    state: scoreState({
      ending: 'time-expired',
      progress: 62,
      personMinutes: 360,
      decisions: qualityRecords([0.35]),
    }),
    expected: { outcome: 112, efficiency: 0, decisions: 105, total: 217 },
    title: 'calendar-criminal',
  },
  {
    name: 'Cancelled at minute 0',
    state: scoreState({
      ending: 'cancelled',
      progress: 0,
      personMinutes: 0,
      decisions: [],
    }),
    expected: { outcome: 0, efficiency: 0, decisions: 0, total: 0 },
    title: 'could-have-been-an-email',
  },
] as const satisfies readonly ScoreExample[];
