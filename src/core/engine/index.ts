// Task 04 adds state actions and preview/resolve; draw and scoring land in 05–06.
// This is the sole public surface and, when task 07 supplies it, the live-pack importer.
export type {
  AttendeeId,
  Rarity,
  EventKind,
  Technique,
  Condition,
  Effect,
  Response,
  EventVariant,
  MeetingEvent,
  PresentedEvent,
  DecisionRecord,
  LogEntry,
  ResponsePreview,
  DrawCandidate,
  ScoreBreakdown,
  TitleId,
  ContentPack,
  MeetingState,
} from './types';

import { UTILITY_RULES } from './constants';
import { previewWithRules } from './preview';
import { resolveWithRules } from './resolve';
import type { MeetingState, Response, ResponsePreview } from './types';
export { initialState, release, callIt } from './state';
export type { EngineError, EngineErrorCode } from './errors';
/** Implements Design Doc v2 → Events and responses → How a response is shown. */
export function previewResponse(
  state: MeetingState,
  response: Response,
): ResponsePreview {
  return previewWithRules(state, response, UTILITY_RULES);
}
/** Implements Design Doc v2 → Game state model → Resolution and attendance boundaries. */
export function resolve(state: MeetingState, responseId: string): MeetingState {
  return resolveWithRules(state, responseId, UTILITY_RULES);
}
