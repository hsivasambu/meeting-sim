import { contentPack, engineRules } from '../content/index';
import { drawEventWith, getDrawCandidatesWith } from './draw';
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
  EventRules,
  MeetingState,
} from './types';

import { UTILITY_RULES } from './constants';
import { previewWithRules } from './preview';
import { resolveWithRules } from './resolve';
import type {
  DrawCandidate,
  MeetingState,
  Response,
  ResponsePreview,
} from './types';
/** Implements Design Doc v2 → Events and responses: the live draw distribution. */
export function getDrawCandidates(
  state: MeetingState,
): readonly DrawCandidate[] {
  return getDrawCandidatesWith(contentPack, state);
}
/** Implements Design Doc v2 → Game state model: draw the approved live presentation. */
export function drawEvent(state: MeetingState): MeetingState {
  return drawEventWith(contentPack, state);
}
export { initialState, release, callIt } from './state';
export type { EngineError, EngineErrorCode } from './errors';
/** Implements Design Doc v2 → Events and responses → How a response is shown. */
export function previewResponse(
  state: MeetingState,
  response: Response,
): ResponsePreview {
  return previewWithRules(state, response, {
    ...UTILITY_RULES,
    eventRules: engineRules,
  });
}
/** Implements Design Doc v2 → Game state model → Resolution and attendance boundaries. */
export function resolve(state: MeetingState, responseId: string): MeetingState {
  return resolveWithRules(state, responseId, {
    ...UTILITY_RULES,
    eventRules: engineRules,
  });
}
export { score, displayCost, formatCost } from './score';
export { earnedTitles } from './titleRules';
export { ENGINE_LIMITS } from './constants';
