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
  EngineResponse,
  OutcomeResponse,
  ResponseOutcome,
  ExactFraction,
  OutcomePreview,
  OutcomeResponsePreview,
  ResponseSuccessor,
  EventVariant,
  MeetingEvent,
  PresentedEvent,
  DecisionRecord,
  LogEntry,
  ResponsePreview,
  DrawCandidate,
  ReleasePreview,
  ScoreBreakdown,
  TitleId,
  ContentPack,
  EventRules,
  MeetingState,
} from './types';

import { UTILITY_RULES } from './constants';
import { previewWithRules } from './preview';
import { resolveWithRules, getResponseOutcomesWithRules } from './resolve';
import type {
  DrawCandidate,
  MeetingState,
  Response,
  ResponsePreview,
  EngineResponse,
  OutcomeResponse,
  OutcomeResponsePreview,
  ResponseSuccessor,
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
export { initialState, release, previewRelease, callIt } from './state';
export type { EngineError, EngineErrorCode } from './errors';
/** Implements Design Doc v2 → Events and responses → How a response is shown. */
export function previewResponse(
  state: MeetingState<EngineResponse>,
  response: Response,
): ResponsePreview;
export function previewResponse(
  state: MeetingState<EngineResponse>,
  response: OutcomeResponse,
): OutcomeResponsePreview;
export function previewResponse(
  state: MeetingState<EngineResponse>,
  response: EngineResponse,
): ResponsePreview | OutcomeResponsePreview;
export function previewResponse(
  state: MeetingState<EngineResponse>,
  response: EngineResponse,
): ResponsePreview | OutcomeResponsePreview {
  return previewWithRules(state, response, {
    ...UTILITY_RULES,
    eventRules: engineRules,
  });
}
/** Implements Design Doc v2 → Game state model → Resolution and attendance boundaries. */
export function resolve<R extends EngineResponse>(
  state: MeetingState<R>,
  responseId: string,
): MeetingState<R> {
  return resolveWithRules(state, responseId, {
    ...UTILITY_RULES,
    eventRules: engineRules,
  });
}
/** ADR 0006: read-only branch successors for simulation inspection. */
export function getResponseOutcomes<R extends EngineResponse>(
  state: MeetingState<R>,
  responseId: string,
): readonly ResponseSuccessor<R>[] {
  return getResponseOutcomesWithRules(state, responseId, {
    ...UTILITY_RULES,
    eventRules: engineRules,
  });
}
export { score, displayCost, formatCost } from './score';
export { earnedTitles } from './titleRules';
export { ENGINE_LIMITS } from './constants';
