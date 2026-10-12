import { afterEach, describe, expect, it, vi } from 'vitest';
import { contentPack } from '../src/core/content/index';
import {
  ENGINE_LIMITS,
  previewResponse,
  score,
} from '../src/core/engine/index';
import { createGameStore } from '../src/store/gameStore';

afterEach(() => vi.restoreAllMocks());

// Live-pack validation through store orchestration; no tuned effects or scores asserted.
describe('live content reaches results through the store with real draws', () => {
  it.each([0, 1, 2, 3, 7, 15, 31, 127, 255])(
    'replays entropy fixture %s',
    (ticket) => {
      vi.spyOn(crypto, 'getRandomValues').mockReturnValue(
        new Uint8Array([ticket, 0, 0, 0, 0, 0, 0, 0]),
      );
      function play() {
        const store = createGameStore({
          storage: () => ({ getItem: () => null, setItem: () => undefined }),
        });
        const bound =
          contentPack.events.length +
          contentPack.callbacks.length +
          Math.ceil(
            ENGINE_LIMITS.initialBookingEnd / ENGINE_LIMITS.fillerMinutes,
          );
        store.getState().setAssetStatus('ready');
        store.getState().start();
        for (
          let turn = 0;
          turn < bound && store.getState().screen === 'meeting';
          turn++
        ) {
          const game = store.getState().game;
          if (game === null || game.current === null)
            throw new Error('Expected a presented event');
          const response = game.current.responses.find(
            (item) => previewResponse(game, item).enabled,
          );
          if (response === undefined)
            throw new Error('Expected an enabled response');
          store.getState().finishTyping();
          store.getState().choose(response.id);
          expect(store.getState().beat).toBe('outcome');
          store.getState().continue();
        }
        expect(store.getState().screen).toBe('results');
        const ended = store.getState().game;
        if (ended === null) throw new Error('Expected completed meeting');
        expect(ended.phase).toBe('ended');
        expect(ended.turn).toBeLessThanOrEqual(bound);
        expect(store.getState().breakdown).toEqual(score(ended));
        return ended;
      }
      expect(play()).toEqual(play());
    },
  );
});
