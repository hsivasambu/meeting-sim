import type { LunchFrame } from '../../../src/ui/screens/lunch/MeetingScreen';
import type { LunchResult } from '../../../src/ui/screens/lunch/ResultsScreen';

export interface FixtureTurn {
  readonly frame: LunchFrame;
  readonly called: LunchResult;
  readonly outcomes: readonly FixtureOutcome[];
}

export interface FixtureOutcome {
  readonly responseId: string;
  readonly frame: LunchFrame;
  readonly next: FixtureTurn | LunchResult | null;
}
