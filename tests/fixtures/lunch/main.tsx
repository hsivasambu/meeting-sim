import { useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LunchTitleScreen } from '../../../src/ui/screens/lunch/TitleScreen';
import { LunchMeetingScreen } from '../../../src/ui/screens/lunch/MeetingScreen';
import { LunchResultsScreen } from '../../../src/ui/screens/lunch/ResultsScreen';
import type { LunchResult } from '../../../src/ui/screens/lunch/ResultsScreen';
import type { FixtureOutcome, FixtureTurn } from './types';
import '../../../src/index.css';

type View =
  | { readonly screen: 'title' }
  | {
      readonly screen: 'meeting';
      readonly beat: 'speaking' | 'choosing';
      readonly turn: FixtureTurn;
    }
  | {
      readonly screen: 'meeting';
      readonly beat: 'outcome';
      readonly outcome: FixtureOutcome;
    }
  | { readonly screen: 'results'; readonly result: LunchResult };

// This driver plays back precomputed presentation data supplied by Playwright.
function Fixture({ initial }: { readonly initial: FixtureTurn }) {
  const [view, setView] = useState<View>({ screen: 'title' });
  const start = () =>
    setView((current) =>
      current.screen === 'title'
        ? { screen: 'meeting', beat: 'speaking', turn: initial }
        : current,
    );
  const finishTyping = useCallback(() => {
    setView((current) =>
      current.screen === 'meeting' && current.beat === 'speaking'
        ? { ...current, beat: 'choosing' }
        : current,
    );
  }, []);
  const choose = (id: string) =>
    setView((current) => {
      if (current.screen !== 'meeting' || current.beat !== 'choosing')
        return current;
      const outcome = current.turn.outcomes.find(
        (entry) => entry.responseId === id,
      );
      return outcome === undefined
        ? current
        : { screen: 'meeting', beat: 'outcome', outcome };
    });
  const continueMeeting = () =>
    setView((current) => {
      if (current.screen !== 'meeting' || current.beat !== 'outcome')
        return current;
      const next = current.outcome.next;
      if (next === null) throw new Error('Fixture has no further draw');
      return 'frame' in next
        ? { screen: 'meeting', beat: 'speaking', turn: next }
        : { screen: 'results', result: next };
    });
  const callIt = () =>
    setView((current) =>
      current.screen === 'meeting' && current.beat !== 'outcome'
        ? { screen: 'results', result: current.turn.called }
        : current,
    );
  return (
    <main>
      {view.screen === 'title' && (
        <LunchTitleScreen assetStatus="ready" start={start} retry={start} />
      )}
      {view.screen === 'meeting' && (
        <LunchMeetingScreen
          frame={view.beat === 'outcome' ? view.outcome.frame : view.turn.frame}
          beat={view.beat}
          finishTyping={finishTyping}
          choose={choose}
          continueMeeting={continueMeeting}
          callIt={callIt}
        />
      )}
      {view.screen === 'results' && (
        <LunchResultsScreen
          result={view.result}
          restart={() => setView({ screen: 'title' })}
        />
      )}
    </main>
  );
}

const response = await fetch('./data.json');
if (!response.ok) throw new Error('Lunch fixture data unavailable');
const initial: FixtureTurn = await response.json();
const root = document.getElementById('root');
if (root === null) throw new Error('Fixture mount unavailable');
createRoot(root).render(<Fixture initial={initial} />);
