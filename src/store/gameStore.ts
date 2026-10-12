import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import {
  initialState,
  drawEvent,
  resolve,
  release,
  callIt,
  previewResponse,
  score,
  earnedTitles,
} from '../core/engine/index';
import type {
  AttendeeId,
  MeetingState,
  ScoreBreakdown,
  TitleId,
} from '../core/engine/index';
import { storeConfig } from '../core/content/storeConfig';
import { readTitleSnapshot, writeTitles } from './persistence';
import type { StorageProvider } from './persistence';

export type AssetStatus = 'loading' | 'ready' | 'failed';

export interface GameStoreState {
  readonly screen: 'title' | 'meeting' | 'results';
  readonly beat: 'speaking' | 'choosing' | 'outcome';
  readonly game: MeetingState | null;
  readonly unlockedTitles: readonly TitleId[];
  readonly assetsReady: boolean;
  readonly assetStatus: AssetStatus;
  readonly breakdown: ScoreBreakdown | null;
  setAssetStatus(status: AssetStatus): void;
  start(): void;
  finishTyping(): void;
  choose(responseId: string): void;
  continue(): void;
  release(who: AttendeeId): void;
  callIt(): void;
  restart(): void;
}

/** Technical spec → RNG: one entropy call, eight bytes, sixteen hex characters. */
function createSeed(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(storeConfig.seedBytes));
  return Array.from(bytes, (byte) =>
    byte.toString(storeConfig.hexRadix).padStart(storeConfig.hexByteWidth, '0'),
  ).join('');
}

/** D17: only start/continue draw; presentation timing remains outside the store. */
export function createGameStore(
  options: {
    readonly storage?: StorageProvider;
  } = {},
) {
  const persisted = readTitleSnapshot(options.storage);
  return createStore<GameStoreState>()((set, get) => {
    function results(game: MeetingState): void {
      const breakdown = score(game);
      const unlockedTitles = [
        ...new Set([...get().unlockedTitles, ...earnedTitles(game, breakdown)]),
      ];
      if (persisted.readable) writeTitles(unlockedTitles, options.storage);
      set({ game, breakdown, unlockedTitles, screen: 'results' });
    }
    function interactive(): MeetingState | null {
      const state = get();
      return state.screen === 'meeting' && state.beat !== 'outcome'
        ? state.game
        : null;
    }
    return {
      screen: 'title',
      beat: 'speaking',
      game: null,
      unlockedTitles: persisted.titles,
      assetsReady: false,
      assetStatus: 'loading',
      breakdown: null,
      setAssetStatus(status) {
        if (get().screen !== 'title') return;
        set({ assetStatus: status, assetsReady: status === 'ready' });
      },
      start() {
        if (get().screen !== 'title' || !get().assetsReady) return;
        const game = drawEvent(initialState(createSeed()));
        set({ game, screen: 'meeting', beat: 'speaking', breakdown: null });
      },
      finishTyping() {
        if (get().screen === 'meeting' && get().beat === 'speaking')
          set({ beat: 'choosing' });
      },
      choose(responseId) {
        const { game, screen, beat } = get();
        if (screen !== 'meeting' || beat !== 'choosing' || game === null)
          return;
        const response = game.current?.responses.find(
          (item) => item.id === responseId,
        );
        if (response === undefined || !previewResponse(game, response).enabled)
          return;
        set({ game: resolve(game, responseId), beat: 'outcome' });
      },
      continue() {
        const { game, screen, beat } = get();
        if (screen !== 'meeting' || beat !== 'outcome' || game === null) return;
        if (game.phase === 'ended') results(game);
        else set({ game: drawEvent(game), beat: 'speaking' });
      },
      release(who) {
        const game = interactive();
        if (game === null) return;
        const next = release(game, who);
        if (next.present !== game.present) set({ game: next });
      },
      callIt() {
        const game = interactive();
        if (game !== null) results(callIt(game));
      },
      restart() {
        // Also callable by the error boundary in any screen.
        set({ screen: 'title', beat: 'speaking', game: null, breakdown: null });
      },
    };
  });
}

export const gameStore = createGameStore();
export function useGameStore<T>(selector: (state: GameStoreState) => T): T {
  return useStore(gameStore, selector);
}
