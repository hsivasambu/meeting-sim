import { contentPack } from '../content/index';
import { UTILITY_RULES } from './constants';
import { drawEventWith, getDrawCandidatesWith } from './draw';
import { previewWithRules } from './preview';
import { getResponseOutcomesWithRules, resolveWithRules } from './resolve';
import type {
  DrawCandidate,
  MeetingState,
  Response,
  ResponsePreview,
  ResponseSuccessor,
} from './types';

const rules = {
  ...UTILITY_RULES,
  eventRules: contentPack.eventRules,
  cuisines: contentPack.cuisines,
  commentary: contentPack.commentary,
};

export function drawEvent(state: MeetingState): MeetingState {
  return drawEventWith(contentPack, state);
}

export function getDrawCandidates(
  state: MeetingState,
): readonly DrawCandidate[] {
  return getDrawCandidatesWith(contentPack, state);
}

export function previewResponse(
  state: MeetingState,
  response: Response,
): ResponsePreview {
  return previewWithRules(state, response, rules);
}

export function resolve(state: MeetingState, responseId: string): MeetingState {
  return resolveWithRules(state, responseId, rules);
}

export function getResponseOutcomes(
  state: MeetingState,
  responseId: string,
): readonly ResponseSuccessor[] {
  return getResponseOutcomesWithRules(state, responseId, rules);
}

export { initialState, callIt } from './state';
export { score, displayCost, formatCost } from './score';
export { earnedTitles } from './titleRules';
export { ENGINE_LIMITS } from './constants';
export type { EngineError, EngineErrorCode } from './errors';
export type {
  AttendeeId,
  Rarity,
  EventKind,
  Technique,
  Condition,
  Effect,
  Response,
  ResponseOutcome,
  ExactFraction,
  OutcomePreview,
  ResponseSuccessor,
  EventVariant,
  MeetingEvent,
  PresentedEvent,
  DecisionRecord,
  LogEntry,
  ResponsePreview,
  DrawCandidate,
  ScoreBreakdown,
  TitleId,
  LegacyTitleId,
  CuisineId,
  ContentPack,
  EventRules,
  MeetingState,
} from './types';
