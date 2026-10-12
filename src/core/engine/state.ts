import {
  ZERO,
  INITIAL_BOOKING_END,
  INITIAL_ATTENDEES,
  DECISION_OWNER,
  MIN_HEADCOUNT,
} from './constants';
import { assertRunning } from './errors';
import type { AttendeeId, MeetingState, ReleasePreview } from './types';
/** Implements Design Doc v2 → Game state model: the fixed starting meeting. */
export function initialState(seed: string): MeetingState {
  return {
    seed,
    turn: ZERO,
    minute: ZERO,
    bookingEnd: INITIAL_BOOKING_END,
    progress: ZERO,
    risks: ZERO,
    personMinutes: ZERO,
    present: [...INITIAL_ATTENDEES],
    releasedAttendeeIds: [],
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
  };
}
/** ADR 0004 → read-only release restrictions shared with the state transition. */
export function previewRelease(
  state: MeetingState,
  who: AttendeeId,
): ReleasePreview {
  assertRunning(state);
  if (who === DECISION_OWNER)
    return { enabled: false, reasonKey: 'release-owner' };
  if (!state.present.includes(who))
    return { enabled: false, reasonKey: 'release-absent' };
  if (state.present.length <= MIN_HEADCOUNT)
    return { enabled: false, reasonKey: 'release-minimum' };
  return { enabled: true };
}
/** Implements Design Doc v2 → Core loop → Anytime actions: owner/minimum-safe release. */
export function release(state: MeetingState, who: AttendeeId): MeetingState {
  if (!previewRelease(state, who).enabled) return { ...state };
  return {
    ...state,
    present: state.present.filter((id) => id !== who),
    releasedAttendeeIds: [...state.releasedAttendeeIds, who],
    log: [
      ...state.log,
      { type: 'release', turn: state.turn, minute: state.minute, who },
    ],
  };
}
/** Implements Design Doc v2 → Endings, titles and the results card → Endings. */
export function callIt(state: MeetingState): MeetingState {
  assertRunning(state);
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
