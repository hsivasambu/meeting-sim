import { ZERO, INITIAL_BOOKING_END, INITIAL_ATTENDEES } from './constants';
import { assertRunning } from './errors';
import { validateMeetingState } from './lunchValidation';
import type { MeetingState } from './types';
/** Implements Design Doc v2 → Game state model: the fixed starting meeting. */
export function initialState(seed: string): MeetingState {
  return {
    seed,
    turn: ZERO,
    minute: ZERO,
    bookingEnd: INITIAL_BOOKING_END,
    progress: ZERO,
    personMinutes: ZERO,
    present: [...INITIAL_ATTENDEES],
    peakHeadcount: INITIAL_ATTENDEES.length,
    seenEventIds: [],
    spokenAttendeeIds: [],
    parkedCount: ZERO,
    substantiveDrawCount: ZERO,
    previousDrawWasUncommonNegative: false,
    scheduled: [],
    current: null,
    decisions: [],
    log: [],
    phase: 'running',
    ending: null,
    nominatedCuisine: null,
    agreedCuisine: null,
    resolvedCallbackCount: ZERO,
    shownCommentaryIds: [],
    lastCommentaryTurn: null,
  };
}
/** Implements Design Doc v2 → Endings, titles and the results card → Endings. */
export function callIt(state: MeetingState): MeetingState {
  assertRunning(state);
  validateMeetingState(state);
  return {
    ...state,
    phase: 'ended',
    ending: state.turn === ZERO ? 'cancelled' : 'called-early',
    log: [
      ...state.log,
      { type: 'call-it', turn: state.turn, minute: state.minute },
    ],
  };
}
