import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { drawEvent, earnedTitles, score } from '../core/engine/index';
import type { MeetingState, PresentedEvent } from '../core/engine/index';
import type * as EngineApi from '../core/engine/index';
import { createGameStore } from './gameStore';

// Synthetic presentation; real public transitions/preview/score/title functions.
// Store tests exercise orchestration without depending on live content tuning.
vi.mock('../core/engine/index', async (importOriginal) => {
  const actual = await importOriginal<typeof EngineApi>();
  return {
    ...actual,
    drawEvent: vi.fn((state: MeetingState) => ({
      ...state,
      current: presentation,
    })),
  };
});
const presentation = {
  id: 'fixture-store',
  kind: 'substantive',
  rarity: 'common',
  negative: false,
  speaker: 'sam',
  line: 'Fixture dialogue.',
  responses: [
    {
      id: 'expert',
      label: 'Fixture expert',
      technique: 'owner',
      requires: { present: ['sam'] },
      disabledReasonKey: 'sam-absent',
      effect: { minutes: 2, progress: 20 },
      line: 'Fixture expert outcome.',
    },
    {
      id: 'ack',
      label: 'Fixture acknowledge',
      technique: 'ack',
      effect: { minutes: 2 },
      line: 'Fixture outcome.',
    },
  ],
} as const satisfies PresentedEvent;

function readyStore() {
  const setItem = vi.fn();
  const store = createGameStore({
    assetsReady: true,
    storage: () => ({ getItem: () => '["inbox-zero"]', setItem }),
  });
  return { store, setItem };
}
function currentGame(store: ReturnType<typeof createGameStore>): MeetingState {
  const game = store.getState().game;
  if (game === null) throw new Error('Expected a meeting');
  return game;
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.restoreAllMocks());

describe('D17 store action table', () => {
  it('starts only on title with assets ready and makes one 16-hex seed', () => {
    const entropy = vi.spyOn(crypto, 'getRandomValues');
    const store = createGameStore();
    store.getState().start();
    expect(store.getState().game).toBeNull();
    expect(entropy).not.toHaveBeenCalled();
    store.setState({ assetsReady: true });
    store.getState().start();
    expect(entropy).toHaveBeenCalledTimes(1);
    expect(entropy.mock.calls[0]?.[0]).toBeInstanceOf(Uint8Array);
    expect(entropy.mock.calls[0]?.[0]?.byteLength).toBe(8);
    expect(currentGame(store).seed).toMatch(/^[0-9a-f]{16}$/u);
    expect(store.getState()).toMatchObject({
      screen: 'meeting',
      beat: 'speaking',
    });
    const snapshot = store.getState();
    store.getState().start();
    expect(store.getState()).toBe(snapshot);
    expect(drawEvent).toHaveBeenCalledTimes(1);
    expect(entropy).toHaveBeenCalledTimes(1);
  });
  it('ignores actions outside their screen and beat; guards rapid choice/continue input', () => {
    const { store } = readyStore();
    const title = store.getState();
    title.choose('ack');
    title.continue();
    title.release('sam');
    title.callIt();
    title.finishTyping();
    expect(store.getState()).toBe(title);
    title.start();
    const speaking = store.getState();
    speaking.choose('ack');
    speaking.continue();
    expect(store.getState()).toBe(speaking);
    speaking.finishTyping();
    const choosing = store.getState();
    choosing.finishTyping();
    choosing.continue();
    choosing.choose('unknown');
    expect(store.getState()).toBe(choosing);
    choosing.choose('ack');
    choosing.choose('ack');
    expect(store.getState().beat).toBe('outcome');
    expect(currentGame(store).turn).toBe(1);
    expect(currentGame(store).log.at(-1)).toMatchObject({
      type: 'resolve',
      line: 'Fixture outcome.',
    });
    const outcome = store.getState();
    outcome.release('sam');
    outcome.callIt();
    outcome.finishTyping();
    outcome.start();
    expect(store.getState()).toBe(outcome);
    outcome.continue();
    outcome.continue();
    expect(store.getState().beat).toBe('speaking');
    expect(drawEvent).toHaveBeenCalledTimes(2);
    expect(currentGame(store).turn).toBe(1);
  });
  it.each(['speaking', 'choosing'] as const)(
    'release in %s keeps delivered text, blocks expert, and refuses owner/minimum/absent',
    (beat) => {
      const { store } = readyStore();
      store.getState().start();
      if (beat === 'choosing') store.getState().finishTyping();
      const delivered = currentGame(store).current;
      const original = store.getState();
      original.release('priya');
      original.release('legal');
      expect(store.getState()).toBe(original);
      original.release('sam');
      expect(currentGame(store).current).toBe(delivered);
      expect(store.getState().beat).toBe(beat);
      store.getState().finishTyping();
      const beforeDisabled = store.getState();
      beforeDisabled.choose('expert');
      expect(store.getState()).toBe(beforeDisabled);
      for (const id of ['dev', 'morgan', 'gary'] as const)
        store.getState().release(id);
      const minimum = store.getState();
      minimum.release('jordan');
      minimum.release('sam');
      expect(store.getState()).toBe(minimum);
      expect(currentGame(store).present).toEqual(['priya', 'jordan']);
    },
  );
  it.each(['speaking', 'choosing'] as const)(
    'Call it in %s goes directly to results and retains every unlock on replay',
    (beat) => {
      const { store, setItem } = readyStore();
      store.getState().start();
      if (beat === 'choosing') store.getState().finishTyping();
      store.getState().callIt();
      const ended = currentGame(store);
      const breakdown = score(ended);
      expect(ended.ending).toBe('cancelled');
      expect(store.getState()).toMatchObject({ screen: 'results', breakdown });
      const expected = [
        ...new Set(['inbox-zero', ...earnedTitles(ended, breakdown)]),
      ];
      expect(store.getState().unlockedTitles).toEqual(expected);
      expect(setItem).toHaveBeenCalledExactlyOnceWith(
        'tcbae:v1:titles',
        JSON.stringify(expected),
      );
      const results = store.getState();
      results.callIt();
      results.choose('ack');
      results.release('sam');
      results.continue();
      results.start();
      results.finishTyping();
      expect(store.getState()).toBe(results);
      results.restart();
      expect(store.getState()).toMatchObject({
        screen: 'title',
        game: null,
        breakdown: null,
        assetsReady: true,
        unlockedTitles: expected,
      });
      store.getState().start();
      expect(currentGame(store).turn).toBe(0);
      expect(currentGame(store).log).toEqual([]);
    },
  );
  it('Call it after an outcome has been continued uses the early ending', () => {
    const { store } = readyStore();
    store.getState().start();
    store.getState().finishTyping();
    store.getState().choose('ack');
    store.getState().continue();
    store.getState().callIt();
    expect(currentGame(store).ending).toBe('called-early');
  });
  it.each(['decision', 'time-expired'] as const)(
    'waits for acknowledgement of the final %s outcome',
    (ending) => {
      const { store, setItem } = readyStore();
      store.getState().start();
      const game = currentGame(store);
      store.setState({
        game: {
          ...game,
          progress: ending === 'decision' ? 90 : 0,
          minute: ending === 'time-expired' ? 59 : 0,
        },
      });
      store.getState().finishTyping();
      store.getState().choose('expert');
      expect(currentGame(store).ending).toBe(ending);
      expect(store.getState()).toMatchObject({
        screen: 'meeting',
        beat: 'outcome',
        breakdown: null,
      });
      expect(setItem).not.toHaveBeenCalled();
      store.getState().continue();
      expect(store.getState().screen).toBe('results');
      expect(store.getState().breakdown).toEqual(score(currentGame(store)));
      expect(drawEvent).toHaveBeenCalledTimes(1);
      expect(setItem).toHaveBeenCalledTimes(1);
    },
  );
  it('single-response events still require finishTyping, choose and continue', () => {
    const { store } = readyStore();
    store.getState().start();
    store.setState({
      game: {
        ...currentGame(store),
        current: { ...presentation, responses: [presentation.responses[1]] },
      },
    });
    expect(currentGame(store).turn).toBe(0);
    store.getState().finishTyping();
    expect(currentGame(store).turn).toBe(0);
    store.getState().choose('ack');
    expect(store.getState().beat).toBe('outcome');
    expect(drawEvent).toHaveBeenCalledTimes(1);
    store.getState().continue();
    expect(drawEvent).toHaveBeenCalledTimes(2);
  });
  it('blocked storage permits play/results, retaining session unlocks and error recovery', () => {
    const store = createGameStore({
      assetsReady: true,
      storage: () => {
        throw new Error('blocked');
      },
    });
    expect(store.getState().unlockedTitles).toEqual([]);
    store.getState().start();
    store.getState().callIt();
    const unlocks = store.getState().unlockedTitles;
    expect(unlocks.length).toBeGreaterThan(0);
    store.getState().restart();
    store.getState().start();
    store.getState().restart();
    expect(store.getState()).toMatchObject({
      screen: 'title',
      game: null,
      breakdown: null,
      unlockedTitles: unlocks,
    });
  });
});
