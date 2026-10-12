import { afterEach, describe, expect, it, vi } from 'vitest';
import { createGameStore } from './gameStore';

afterEach(() => vi.restoreAllMocks());

describe('store replay and persistence recovery', () => {
  it('generates a fresh, zero-padded seed exactly once on each start', () => {
    const entropy = vi
      .spyOn(crypto, 'getRandomValues')
      .mockReturnValueOnce(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]))
      .mockReturnValueOnce(new Uint8Array([8, 9, 10, 11, 12, 13, 14, 15]));
    const store = createGameStore();
    store.getState().setAssetStatus('ready');
    store.getState().start();
    expect(store.getState().game?.seed).toBe('0001020304050607');
    store.getState().start();
    expect(entropy).toHaveBeenCalledTimes(1);
    store.getState().callIt();
    store.getState().restart();
    store.getState().start();
    expect(store.getState().game?.seed).toBe('08090a0b0c0d0e0f');
    expect(entropy).toHaveBeenCalledTimes(2);
  });
  it('does not overwrite stored unlocks after a failed initial read, even if writes work', () => {
    let stored = '["inbox-zero"]';
    const setItem = vi.fn((_key: string, value: string) => {
      stored = value;
    });
    const store = createGameStore({
      storage: () => ({
        getItem: () => {
          throw new Error('transient read failure');
        },
        setItem,
      }),
    });
    store.getState().setAssetStatus('ready');
    store.getState().start();
    store.getState().callIt();
    expect(store.getState().screen).toBe('results');
    const unlocks = store.getState().unlockedTitles;
    expect(unlocks.length).toBeGreaterThan(0);
    expect(setItem).not.toHaveBeenCalled();
    expect(stored).toBe('["inbox-zero"]');
    store.getState().restart();
    store.getState().start();
    store.getState().callIt();
    expect(store.getState().unlockedTitles).toEqual(unlocks);
    expect(setItem).not.toHaveBeenCalled();
  });
  it('replaces corrupt readable storage and persists every unlock across a new store', () => {
    let stored = '{';
    const storage = () => ({
      getItem: () => stored,
      setItem: (_key: string, value: string) => {
        stored = value;
      },
    });
    const store = createGameStore({ storage });
    store.getState().setAssetStatus('ready');
    store.getState().start();
    store.getState().callIt();
    expect(createGameStore({ storage }).getState().unlockedTitles).toEqual(
      store.getState().unlockedTitles,
    );
  });
});
