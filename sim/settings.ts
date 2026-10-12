// Harness configuration and diagnostic acceptance targets, not engine tuning.
export const DEFAULT_RUNS = 2000;
export const SEED_PREFIX = 'v3:';
// At most 17 unique base families + 3 callbacks + ceil(60 / 2) filler turns = 50.
// Ignoring time spent in unique events is conservative even for zero-minute emails.
export const MAX_RESOLVED_TURNS =
  contentPack.events.length +
  contentPack.callbacks.length +
  Math.ceil(ENGINE_LIMITS.initialBookingEnd / ENGINE_LIMITS.fillerMinutes);
export const WIN_BANDS = { greedy: [70, 85], random: [20, 35] } as const;
export const GREEDY_TURN_BAND = [9, 12] as const;
export const POLICIES = ['greedy', 'random'] as const;
export type Policy = (typeof POLICIES)[number];
import { ENGINE_LIMITS } from '../src/core/engine/index';
import { contentPack } from '../src/core/content/index';
