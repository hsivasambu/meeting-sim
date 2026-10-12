import type { MeetingState } from './types';
export type EngineErrorCode =
  | 'ended'
  | 'not-ended'
  | 'missing-event'
  | 'unknown-response'
  | 'disabled-response'
  | 'invalid-response'
  | 'invalid-rules'
  | 'invalid-effect'
  | 'invalid-join'
  | 'invalid-schedule';
/** Programmer errors from Design Doc v2 → Event schema and roster → Engine API. */
export class EngineError extends Error {
  constructor(readonly code: EngineErrorCode) {
    super(code);
    this.name = 'EngineError';
  }
}
/** Implements Design Doc v2 → Core loop: actions require a running meeting. */
export function assertRunning(state: MeetingState): void {
  if (state.phase !== 'running') throw new EngineError('ended');
}

/** Implements Design Doc v2 → Results card: results require a completed meeting. */
export function assertEnded(state: MeetingState): void {
  if (state.phase !== 'ended' || state.ending === null)
    throw new EngineError('not-ended');
}
