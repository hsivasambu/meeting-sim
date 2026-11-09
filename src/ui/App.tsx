import { useEffect } from 'react';
import { previewResponse } from '../core/engine/index';
import type { MeetingState } from '../core/engine/index';
import { useGameStore } from '../store/gameStore';
import { LunchTitleScreen } from './screens/TitleScreen';
import { LunchMeetingScreen } from './screens/MeetingScreen';
import type { LunchBeat, LunchFrame } from './screens/MeetingScreen';
import { LunchResultsScreen } from './screens/ResultsScreen';
import type { LunchResult } from './screens/ResultsScreen';
import type { LunchChoice } from './screens/presentation';

function meetingFrame(game: MeetingState, beat: LunchBeat): LunchFrame {
  if (beat === 'outcome') {
    const recent = [...game.log].reverse();
    const resolution = recent.find((entry) => entry.type === 'resolve');
    const draw = recent.find((entry) => entry.type === 'draw');
    if (resolution === undefined || draw === undefined)
      throw new Error('Missing meeting outcome');
    return {
      id: `${resolution.turn}-resolve`,
      hud: game,
      present: game.present,
      speaker: draw.speaker,
      line: resolution.line,
      choices: [],
      ...(resolution.commentaryId === undefined
        ? {}
        : { commentaryId: resolution.commentaryId }),
      ...(game.agreedCuisine === null
        ? {}
        : { agreedCuisine: game.agreedCuisine }),
    };
  }

  const event = game.current;
  if (event === null) throw new Error('Missing meeting presentation');
  const choices = event.responses.map((response): LunchChoice => {
    const { id, label, description } = response;
    const choice = { id, label, description };
    const preview = previewResponse(game, response);
    return preview.enabled
      ? { ...choice, enabled: true }
      : { ...choice, enabled: false, reasonKey: preview.reasonKey };
  });
  return {
    id: `${game.turn}-draw`,
    hud: game,
    present: game.present,
    speaker: event.speaker,
    line: event.line,
    choices,
  };
}

export function App() {
  const state = useGameStore((snapshot) => snapshot);
  const {
    screen,
    assetStatus,
    setAssetStatus,
    game,
    beat,
    breakdown,
    titleId,
  } = state;
  useEffect(() => {
    // The text-only room has no required assets.
    setAssetStatus('ready');
  }, [setAssetStatus]);

  if (screen === 'title') {
    return (
      <main>
        <LunchTitleScreen
          assetStatus={assetStatus}
          start={state.start}
          retry={() => setAssetStatus('ready')}
          archive={state.legacyUnlockedTitles}
          unlocked={state.unlockedTitles}
        />
      </main>
    );
  }
  if (game === null) throw new Error('Missing meeting state');
  if (screen === 'meeting') {
    return (
      <main>
        <LunchMeetingScreen
          frame={meetingFrame(game, beat)}
          beat={beat}
          finishTyping={state.finishTyping}
          choose={state.choose}
          continueMeeting={state.continue}
          callIt={state.callIt}
        />
      </main>
    );
  }
  if (breakdown === null || game.ending === null)
    throw new Error('Missing meeting result');
  const summary = { ...game, breakdown, titleId };
  let result: LunchResult;
  if (game.ending === 'decision') {
    if (game.agreedCuisine === null) throw new Error('Missing agreed cuisine');
    result = {
      ...summary,
      ending: game.ending,
      agreedCuisine: game.agreedCuisine,
    };
  } else {
    result = { ...summary, ending: game.ending };
  }
  return (
    <main>
      <LunchResultsScreen result={result} restart={state.restart} />
    </main>
  );
}
