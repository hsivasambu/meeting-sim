import type { Condition, MeetingState } from './types';

// Conditions are conjunctions; all numeric bounds are inclusive.
/** Implements Design Doc v2 → Event schema and roster → Data model. */
export function matchesCondition(
  state: MeetingState,
  condition?: Condition,
): boolean {
  if (condition === undefined) return true;
  return (
    (condition.minMinute === undefined ||
      state.minute >= condition.minMinute) &&
    (condition.maxMinute === undefined ||
      state.minute <= condition.maxMinute) &&
    (condition.minRisks === undefined || state.risks >= condition.minRisks) &&
    (condition.maxRisks === undefined || state.risks <= condition.maxRisks) &&
    (condition.present === undefined ||
      condition.present.every((id) => state.present.includes(id))) &&
    (condition.absent === undefined ||
      condition.absent.every((id) => !state.present.includes(id)))
  );
}
