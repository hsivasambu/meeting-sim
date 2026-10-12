import { titles } from '../core/content/titles';
import { storeConfig } from '../core/content/storeConfig';
import type { TitleId } from '../core/engine/index';

export interface TitleStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export type StorageProvider = () => TitleStorage;
const browserStorage: StorageProvider = () => globalThis.localStorage;

function isTitleId(value: unknown): value is TitleId {
  return titles.some((title) => title.id === value);
}

/** Technical spec → Persistence: corrupt or blocked storage never prevents play. */
export function readTitles(
  storage: StorageProvider = browserStorage,
): TitleId[] {
  return readTitleSnapshot(storage).titles;
}

function parseTitles(raw: string | null): TitleId[] {
  try {
    if (raw === null) return [];
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter(isTitleId))];
  } catch {
    return [];
  }
}

/** A failed read must not authorize overwriting an unseen existing collection. */
export function readTitleSnapshot(storage: StorageProvider = browserStorage): {
  readonly titles: TitleId[];
  readonly readable: boolean;
} {
  try {
    return {
      titles: parseTitles(storage().getItem(storeConfig.titlesKey)),
      readable: true,
    };
  } catch {
    return { titles: [], readable: false };
  }
}

export function writeTitles(
  unlocked: readonly TitleId[],
  storage: StorageProvider = browserStorage,
): void {
  try {
    storage().setItem(
      storeConfig.titlesKey,
      JSON.stringify([...new Set(unlocked)]),
    );
  } catch {
    // Unlocks remain available in memory for this session.
  }
}
