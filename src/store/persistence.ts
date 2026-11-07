import { titles as lunchTitles } from '../core/content/lunch/titles';
import { storeConfig } from '../core/content/storeConfig';
import { titles as launchTitles } from '../core/content/titles';
import type { TitleId } from '../core/engine/index';

export interface TitleStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export type StorageProvider = () => TitleStorage;
const browserStorage: StorageProvider = () => globalThis.localStorage;

type TitleCatalog<Id extends string> = readonly { readonly id: Id }[];
type LunchTitleId = (typeof lunchTitles)[number]['id'];

/** Technical spec → Persistence: corrupt or blocked storage never prevents play. */
export function readTitles(
  storage: StorageProvider = browserStorage,
): TitleId[] {
  return readTitleSnapshot(storage).titles;
}

function parseTitles<Id extends string>(
  raw: string | null,
  catalog: TitleCatalog<Id>,
): Id[] {
  try {
    if (raw === null) return [];
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    const known = value.filter((entry: unknown): entry is Id =>
      catalog.some((title) => title.id === entry),
    );
    return [...new Set(known)];
  } catch {
    return [];
  }
}

function readCollection<Id extends string>(
  key: string,
  catalog: TitleCatalog<Id>,
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
  return readCollection(storeConfig.titlesKey, launchTitles, storage);
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
) {
  const legacy = readCollection(storeConfig.titlesKey, launchTitles, storage);
  const current = readCollection(
    storeConfig.lunchTitlesKey,
    lunchTitles,
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
