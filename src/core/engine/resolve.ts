import {
  fractionNumber,
  compareFractions,
  subtractFractions,
  serializeFraction,
} from './utilityFraction';
import { matchesCondition } from './conditions';
import { ONE, ZERO, PROGRESS_MAX, CALLBACK_DELAY } from './constants';
import { assertRunning, EngineError } from './errors';
import { evaluateOutcomes, expectedUtility } from './outcomes';
import { responseRng, sampleOutcome } from './rng';
import { selectCommentary } from './commentary';
import { validateMeetingState } from './lunchValidation';
import type {
  DecisionRecord,
  MeetingState,
  PresentedEvent,
  UtilityRules,
  Response,
  ResponseOutcome,
} from './types';
function schedule(
  state: MeetingState,
  outcome: ResponseOutcome,
): MeetingState['scheduled'] {
  const callback = outcome.effect.callback;
  return callback === undefined
    ? [...state.scheduled]
    : [
        ...state.scheduled,
        { eventId: callback.eventId, dueTurn: state.turn + CALLBACK_DELAY },
      ];
}
function quality(
  state: MeetingState,
  event: PresentedEvent,
  response: Response,
  rules: UtilityRules,
): Pick<DecisionRecord, 'quality' | 'qualityFraction'> {
  const utilities = event.responses
    .filter((option) => matchesCondition(state, option.requires))
    .map(
      (option) => expectedUtility(evaluateOutcomes(state, option, rules)).exact,
    );
  const first = utilities[ZERO];
  if (first === undefined) throw new EngineError('disabled-response');
  const worst = utilities.reduce(
    (a, b) => (compareFractions(a, b) < ZERO ? a : b),
    first,
  );
  const best = utilities.reduce(
    (a, b) => (compareFractions(a, b) > ZERO ? a : b),
    first,
  );
  if (compareFractions(best, worst) === ZERO)
    return { quality: null, qualityFraction: null };
  const chosen = expectedUtility(
    evaluateOutcomes(state, response, rules),
  ).exact;
  const difference = subtractFractions(chosen, worst);
  const range = subtractFractions(best, worst);
  // Cancel a common denominator directly when possible.
  const exact =
    chosen.denominator === worst.denominator &&
    best.denominator === worst.denominator
      ? {
          numerator: chosen.numerator - worst.numerator,
          denominator: best.numerator - worst.numerator,
        }
      : {
          numerator: difference.numerator * range.denominator,
          denominator: difference.denominator * range.numerator,
        };
  return {
    quality: fractionNumber(exact.numerator, exact.denominator),
    qualityFraction: serializeFraction(exact),
  };
}
function resolutionLog(
  state: MeetingState,
  next: MeetingState,
  event: PresentedEvent,
  response: Response,
  outcome: ResponseOutcome,
  commentaryId: string | undefined,
): MeetingState['log'] {
  const joins = next.present.filter((id) => !state.present.includes(id));
  return [
    ...state.log,
    {
      type: 'resolve',
      turn: state.turn,
      minute: next.minute,
      eventId: event.id,
      responseId: response.id,
      technique: response.technique,
      line: outcome.line,
      outcomeId: outcome.id,
      ...(commentaryId === undefined ? {} : { commentaryId }),
    },
    ...joins.map((who) => ({
      type: 'join' as const,
      turn: state.turn,
      minute: next.minute,
      who,
    })),
  ];
}
function finishResolution(
  state: MeetingState,
  next: MeetingState,
  event: PresentedEvent,
  response: Response,
  outcome: ResponseOutcome,
  decisionQuality: Pick<DecisionRecord, 'quality' | 'qualityFraction'>,
  rules: UtilityRules,
): MeetingState {
  const ending =
    next.progress >= PROGRESS_MAX
      ? 'decision'
      : next.minute >= next.bookingEnd
        ? 'time-expired'
        : null;
  const decision = {
    turn: state.turn,
    eventId: event.id,
    responseId: response.id,
    ...decisionQuality,
  };
  const resolved: MeetingState = {
    ...next,
    agreedCuisine: ending === 'decision' ? next.nominatedCuisine : null,
    resolvedCallbackCount:
      next.resolvedCallbackCount + (event.kind === 'callback' ? ONE : ZERO),
    turn: state.turn + ONE,
    current: null,
    scheduled: schedule(state, outcome),
    parkedCount:
      state.parkedCount + (response.technique === 'park' ? ONE : ZERO),
    phase: ending === null ? 'running' : 'ended',
    ending,
    decisions: [...state.decisions, decision],
  };
  const commentaryId = selectCommentary(resolved, rules.commentary);
  return {
    ...resolved,
    ...(commentaryId === undefined
      ? {}
      : {
          shownCommentaryIds: [...state.shownCommentaryIds, commentaryId],
          lastCommentaryTurn: resolved.turn,
        }),
    log: resolutionLog(state, next, event, response, outcome, commentaryId),
  };
}
/** Implements Design Doc v2 → Game state model → Resolution and attendance boundaries. */
function pendingResponse(state: MeetingState, responseId: string) {
  assertRunning(state);
  validateMeetingState(state);
  const event = state.current;
  if (event === null) throw new EngineError('missing-event');
  const responses = event.responses.filter(
    (response) => response.id === responseId,
  );
  const response = responses[ZERO];
  if (responses.length !== ONE || response === undefined)
    throw new EngineError('unknown-response');
  return { event, response };
}
/** ADR 0006: enumeration applies the same transition without sampling or seed inspection. */
export function getResponseOutcomesWithRules(
  state: MeetingState,
  responseId: string,
  rules: UtilityRules,
) {
  const { event, response } = pendingResponse(state, responseId);
  const branches = evaluateOutcomes(state, response, rules);
  const decisionQuality = quality(state, event, response, rules);
  return branches.map((branch) => ({
    outcomeId: branch.outcome.id,
    probabilityFraction: serializeFraction(branch.probability),
    state: finishResolution(
      state,
      branch.applied.state,
      event,
      response,
      branch.outcome,
      decisionQuality,
      rules,
    ),
  }));
}
/** ADR 0006: validate and score expected choice quality before sampling once. */
export function resolveWithRules(
  state: MeetingState,
  responseId: string,
  rules: UtilityRules,
): MeetingState {
  const { event, response } = pendingResponse(state, responseId);
  const branches = evaluateOutcomes(state, response, rules);
  const decisionQuality = quality(state, event, response, rules);
  const outcome = sampleOutcome(
    branches.map((branch) => branch.outcome),
    responseRng(state.seed, state.turn, event.id, response.id),
  );
  const branch = branches.find((branch) => branch.outcome.id === outcome.id);
  if (branch === undefined) throw new EngineError('invalid-response');
  return finishResolution(
    state,
    branch.applied.state,
    event,
    response,
    outcome,
    decisionQuality,
    rules,
  );
}
