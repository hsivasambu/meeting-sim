import { describe, expect, it, vi } from 'vitest';
import { legacyTitles } from '../core/content/legacyTitles';
import { createLunchTitlePersistence } from './persistence';

const v1Key = 'tcbae:v1:titles';
const v2Key = 'tcbae:v2:titles';

function storageWith(legacy: string | null, current: string | null) {
  const values = new Map([
    [v1Key, legacy],
    [v2Key, current],
  ]);
  const getItem = vi.fn((key: string) => values.get(key) ?? null);
  const setItem = vi.fn((key: string, value: string) => {
    values.set(key, value);
  });
  return { values, getItem, setItem };
}

function blocked(): never {
  throw new Error('storage blocked');
}

describe('lunch title persistence (ADR 0008)', () => {
  it('recognizes every ID issued by the launch catalog', () => {
    const launchIds = [
      'inbox-zero',
      'efficient-facilitator',
      'ship-it-and-pray',
      'death-by-diligence',
      'skeleton-crew',
      'reply-all-royalty',
      'parking-lot-attendant',
      'gary-free-zone',
      'played-it-right',
      'take-this-offline',
      'calendar-criminal',
      'could-have-been-an-email',
    ];
    const legacy = JSON.stringify(launchIds);
    const storage = storageWith(legacy, null);
    const snapshot = createLunchTitlePersistence(() => storage);

    expect(legacyTitles.map(({ id }) => id)).toEqual(launchIds);
    expect(snapshot.legacyTitles).toEqual(launchIds);
    expect(snapshot.currentTitles).toEqual([]);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.values.get(v1Key)).toBe(legacy);
  });

  it('archives old-only storage without granting any current titles across starts', () => {
    const legacy =
      ' [ "ship-it-and-pray", "inbox-zero", "未知", "inbox-zero" ]\r\n';
    const storage = storageWith(legacy, null);

    for (const start of [1, 2]) {
      const snapshot = createLunchTitlePersistence(() => storage);
      expect(snapshot.legacyTitles, `start ${start}`).toEqual([
        'ship-it-and-pray',
        'inbox-zero',
      ]);
      expect(snapshot.currentTitles).toEqual([]);
    }
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.values.get(v1Key)).toBe(legacy);
    expect(storage.values.get(v2Key)).toBeNull();
  });

  it('loads new-only storage without creating a legacy collection', () => {
    const current = '["lunch-agreed","second-helping","inbox-zero"]';
    const storage = storageWith(null, current);
    const snapshot = createLunchTitlePersistence(() => storage);

    expect(snapshot.legacyTitles).toEqual([]);
    expect(snapshot.currentTitles).toEqual([
      'lunch-agreed',
      'second-helping',
      'inbox-zero',
    ]);
    snapshot.writeCurrentTitles(snapshot.currentTitles);
    expect(storage.setItem).toHaveBeenCalledExactlyOnceWith(v2Key, current);
    expect(storage.values.get(v1Key)).toBeNull();
  });

  it('filters mixed collections independently and preserves the exact legacy value on write and restart', () => {
    const legacy =
      ' [ "gary-free-zone", "table-for-six", "unknown-旧", 4, null, {}, "inbox-zero", "gary-free-zone" ]\r\n';
    const current =
      '["inbox-zero","ship-it-and-pray","lunch-agreed","unknown",false,[],"lunch-agreed"]';
    const storage = storageWith(legacy, current);
    const snapshot = createLunchTitlePersistence(() => storage);

    expect(storage.getItem.mock.calls).toEqual([[v1Key], [v2Key]]);
    expect(snapshot.legacyTitles).toEqual(['gary-free-zone', 'inbox-zero']);
    expect(snapshot.currentTitles).toEqual(['inbox-zero', 'lunch-agreed']);
    expect(storage.setItem).not.toHaveBeenCalled();

    snapshot.writeCurrentTitles([
      ...snapshot.currentTitles,
      'table-for-six',
      'lunch-agreed',
    ]);
    expect(storage.setItem).toHaveBeenCalledExactlyOnceWith(
      v2Key,
      '["inbox-zero","lunch-agreed","table-for-six"]',
    );
    const restarted = createLunchTitlePersistence(() => storage);
    expect(restarted.legacyTitles).toEqual(snapshot.legacyTitles);
    expect(restarted.currentTitles).toEqual([
      'inbox-zero',
      'lunch-agreed',
      'table-for-six',
    ]);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.values.get(v1Key)).toBe(legacy);
  });

  it.each([null, '{', 'null', '{}', '42', '"inbox-zero"'])(
    'allows replacing readable missing or malformed v2 (%s) while preserving v1',
    (raw) => {
      const storage = storageWith(raw, raw);
      const snapshot = createLunchTitlePersistence(() => storage);
      expect(snapshot.legacyTitles).toEqual([]);
      expect(snapshot.currentTitles).toEqual([]);

      snapshot.writeCurrentTitles(['lunch-agreed']);
      expect(storage.setItem).toHaveBeenCalledExactlyOnceWith(
        v2Key,
        '["lunch-agreed"]',
      );
      expect(storage.values.get(v1Key)).toBe(raw);
    },
  );

  it('keeps v2 readable and writable when the v1 read throws', () => {
    const legacy = '["skeleton-crew"]';
    const storage = storageWith(legacy, '["second-helping"]');
    storage.getItem.mockImplementationOnce(blocked);
    const snapshot = createLunchTitlePersistence(() => storage);

    expect(snapshot.legacyTitles).toEqual([]);
    expect(snapshot.currentTitles).toEqual(['second-helping']);
    snapshot.writeCurrentTitles([...snapshot.currentTitles, 'lunch-agreed']);
    expect(storage.setItem).toHaveBeenCalledExactlyOnceWith(
      v2Key,
      '["second-helping","lunch-agreed"]',
    );
    expect(storage.values.get(v1Key)).toBe(legacy);
  });

  it('keeps v1 readable and suppresses v2 writes for the instance after a v2 read failure', () => {
    const legacy = '["skeleton-crew"]';
    const current = '["second-helping"]';
    const storage = storageWith(legacy, current);
    storage.getItem.mockReturnValueOnce(legacy).mockImplementationOnce(blocked);
    const snapshot = createLunchTitlePersistence(() => storage);

    expect(snapshot.legacyTitles).toEqual(['skeleton-crew']);
    expect(snapshot.currentTitles).toEqual([]);
    snapshot.writeCurrentTitles(['lunch-agreed']);

    const restarted = createLunchTitlePersistence(() => storage);
    expect(restarted.currentTitles).toEqual(['second-helping']);
    snapshot.writeCurrentTitles(['table-for-six']);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.values.get(v2Key)).toBe(current);

    restarted.writeCurrentTitles([...restarted.currentTitles, 'lunch-agreed']);
    expect(storage.setItem).toHaveBeenCalledExactlyOnceWith(
      v2Key,
      '["second-helping","lunch-agreed"]',
    );
    expect(storage.values.get(v1Key)).toBe(legacy);
  });

  it('acquires storage independently for each read and suppresses writes if v2 acquisition fails', () => {
    const storage = storageWith('["skeleton-crew"]', '["second-helping"]');
    const failLegacy = vi.fn(() => storage).mockImplementationOnce(blocked);
    const first = createLunchTitlePersistence(failLegacy);
    expect(first.legacyTitles).toEqual([]);
    expect(first.currentTitles).toEqual(['second-helping']);
    first.writeCurrentTitles(first.currentTitles);
    expect(storage.setItem).toHaveBeenCalledExactlyOnceWith(
      v2Key,
      '["second-helping"]',
    );

    const failCurrent = vi.fn(() => storage);
    failCurrent.mockReturnValueOnce(storage).mockImplementationOnce(blocked);
    const second = createLunchTitlePersistence(failCurrent);
    expect(second.legacyTitles).toEqual(['skeleton-crew']);
    expect(second.currentTitles).toEqual([]);
    second.writeCurrentTitles(['lunch-agreed']);
    expect(failCurrent).toHaveBeenCalledTimes(2);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
  });

  it('returns empty collections when storage is blocked and skips write acquisition', () => {
    const provider = vi.fn(blocked);
    const snapshot = createLunchTitlePersistence(provider);

    expect(snapshot.legacyTitles).toEqual([]);
    expect(snapshot.currentTitles).toEqual([]);
    expect(() => snapshot.writeCurrentTitles(['lunch-agreed'])).not.toThrow();
    expect(provider).toHaveBeenCalledTimes(2);
  });

  it('tolerates write acquisition and setItem failures and accepts a later save', () => {
    const legacy = '["skeleton-crew"]';
    const current = '["second-helping"]';
    const storage = storageWith(legacy, current);
    const provider = vi.fn(() => storage);
    const snapshot = createLunchTitlePersistence(provider);
    const unlocked = [...snapshot.currentTitles, 'lunch-agreed'] as const;

    provider.mockImplementationOnce(blocked);
    expect(() => snapshot.writeCurrentTitles(unlocked)).not.toThrow();
    expect(storage.setItem).not.toHaveBeenCalled();
    storage.setItem.mockImplementationOnce(blocked);
    expect(() => snapshot.writeCurrentTitles(unlocked)).not.toThrow();
    expect(storage.values.get(v2Key)).toBe(current);
    expect(snapshot.currentTitles).toEqual(['second-helping']);

    snapshot.writeCurrentTitles(unlocked);
    expect(storage.values.get(v2Key)).toBe('["second-helping","lunch-agreed"]');
    expect(storage.values.get(v1Key)).toBe(legacy);
  });
});
