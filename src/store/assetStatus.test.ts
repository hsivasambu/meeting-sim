import { describe, expect, it, vi } from 'vitest';
import { createGameStore, gameStore } from './gameStore';

describe('approved Title-only asset loading contract', () => {
  it('reports failure and retries without starting a meeting or consuming entropy', () => {
    const entropy = vi.spyOn(crypto, 'getRandomValues');
    try {
      const store = createGameStore();
      expect(store.getState()).toMatchObject({
        assetStatus: 'loading',
        assetsReady: false,
        screen: 'title',
        game: null,
      });
      store.getState().start();
      store.getState().setAssetStatus('failed');
      store.getState().start();
      expect(store.getState()).toMatchObject({
        assetStatus: 'failed',
        assetsReady: false,
        game: null,
      });
      store.getState().setAssetStatus('loading');
      expect(store.getState().assetsReady).toBe(false);
      store.getState().setAssetStatus('ready');
      expect(store.getState()).toMatchObject({
        assetStatus: 'ready',
        assetsReady: true,
        screen: 'title',
        game: null,
      });
      expect(entropy).not.toHaveBeenCalled();
      store.getState().setAssetStatus('loading');
      expect(store.getState().assetsReady).toBe(false);
      store.getState().start();
      expect(store.getState().game).toBeNull();
      store.getState().setAssetStatus('ready');
      store.getState().start();
      expect(entropy).toHaveBeenCalledTimes(1);
      const speaking = store.getState();
      speaking.setAssetStatus('failed');
      expect(store.getState()).toBe(speaking);
      speaking.callIt();
      const results = store.getState();
      results.setAssetStatus('loading');
      expect(store.getState()).toBe(results);
      results.restart();
      expect(store.getState()).toMatchObject({
        assetStatus: 'ready',
        assetsReady: true,
        game: null,
        breakdown: null,
      });
    } finally {
      entropy.mockRestore();
    }
  });
  it('allows text-only readiness through the production singleton action', () => {
    gameStore.getState().restart();
    gameStore.getState().setAssetStatus('loading');
    gameStore.getState().setAssetStatus('ready');
    gameStore.getState().start();
    expect(gameStore.getState().screen).toBe('meeting');
    gameStore.getState().restart();
    gameStore.getState().setAssetStatus('loading');
  });
});
