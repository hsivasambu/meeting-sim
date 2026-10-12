import { DECISION_OWNER, EXPERT_ATTENDEE_IDS, ZERO } from './constants';
import type { MeetingEvent, Response } from './types';

function sameData(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) || Array.isArray(right))
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value: unknown, index: number) =>
        sameData(value, right[index]),
      )
    );
  if (
    left === null ||
    right === null ||
    typeof left !== 'object' ||
    typeof right !== 'object'
  )
    return false;
  const entries = Object.entries(right);
  return (
    Object.keys(left).length === entries.length &&
    Object.entries(left).every(([key, value]) =>
      entries.some(
        ([otherKey, other]) => key === otherKey && sameData(value, other),
      ),
    )
  );
}

/** Implements Design Doc v2 → Event schema and roster: expert work removed by an absence variant. */
export function needsExpertRequirement(
  event: MeetingEvent,
  response: Response,
): boolean {
  if (
    !EXPERT_ATTENDEE_IDS.some((id) => id === event.speaker) ||
    event.kind === 'gift' ||
    (response.technique !== 'hear' && response.technique !== 'owner') ||
    (response.effect.progress ?? ZERO) <= ZERO
  )
    return false;
  const absent =
    event.variants?.filter((variant) =>
      variant.when.absent?.some((id) => id === event.speaker),
    ) ?? [];
  return (
    absent.length > ZERO &&
    !absent.some((variant) =>
      variant.responses.some((other) => sameData(response, other)),
    ) &&
    !response.requires?.present?.some((id) => id !== DECISION_OWNER)
  );
}
