import { legacyTitleIds } from '../core/content/legacyTitleIds';
import { titles as lunchTitles } from '../core/content/lunch/titles';
import { storeConfig } from '../core/content/storeConfig';
import { titles as launchTitles } from '../core/content/titles';
import type {
  LegacyTitleId,
  LunchTitleId,
  TitleId,
} from '../core/engine/index';

export interface TitleStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export type StorageProvider = () => TitleStorage;
const browserStorage: StorageProvider = () => globalThis.localStorage;

export interface LunchTitlePersistence {
  readonly legacyTitles: readonly LegacyTitleId[];
  readonly currentTitles: readonly LunchTitleId[];
  /** Replaces v2. The caller combines existing unlocks with newly earned titles. */
  writeCurrentTitles(unlocked: readonly LunchTitleId[]): void;
}

/** Technical spec → Persistence: corrupt or blocked storage never prevents play. */
export function readTitles(
  storage: StorageProvider = browserStorage,
): TitleId[] {
  return readTitleSnapshot(storage).titles;
}

function parseTitles<Id extends string>(
  raw: string | null,
  catalog: readonly Id[],
): Id[] {
  try {
    if (raw === null) return [];
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    const known = value.filter((entry: unknown): entry is Id =>
      catalog.some((id) => id === entry),
    );
    return [...new Set(known)];
  } catch {
    return [];
  }
}

function readCollection<Id extends string>(
  key: string,
  catalog: readonly Id[],
  storage: StorageProvider,
): {
  readonly titles: Id[];
  readonly readable: boolean;
} {
  try {
    return {
      titles: parseTitles(storage().getItem(key), catalog),
      readable: true,
    };
  } catch {
    return { titles: [], readable: false };
  }
}

function writeCollection(
  key: string,
  unlocked: readonly string[],
  storage: StorageProvider,
): void {
  try {
    storage().setItem(key, JSON.stringify([...new Set(unlocked)]));
  } catch {
    // Unlocks remain available in memory for this session.
  }
}

/** A failed read must not authorize overwriting an unseen existing collection. */
export function readTitleSnapshot(storage: StorageProvider = browserStorage): {
  readonly titles: TitleId[];
  readonly readable: boolean;
} {
  return readCollection(
    storeConfig.titlesKey,
    launchTitles.map((title) => title.id),
    storage,
  );
}

export function writeTitles(
  unlocked: readonly TitleId[],
  storage: StorageProvider = browserStorage,
): void {
  writeCollection(storeConfig.titlesKey, unlocked, storage);
}

/** ADR 0008: initialize once per lunch store instance and archive launch titles. */
export function createLunchTitlePersistence(
  storage: StorageProvider = browserStorage,
): LunchTitlePersistence {
  // A storage acquisition failure for one key must not skip the other read.
  const legacy = readCollection(storeConfig.titlesKey, legacyTitleIds, storage);
  const current = readCollection(
    storeConfig.lunchTitlesKey,
    lunchTitles.map((title) => title.id),
    storage,
  );

  return {
    legacyTitles: legacy.titles,
    currentTitles: current.titles,
    writeCurrentTitles(unlocked: readonly LunchTitleId[]): void {
      if (current.readable) {
        writeCollection(storeConfig.lunchTitlesKey, unlocked, storage);
      }
    },
  };
}
