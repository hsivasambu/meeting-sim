import { useGameStore } from '../store/gameStore';
import { TitleScreen } from './screens/TitleScreen';
import { MeetingScreen } from './screens/MeetingScreen';
import { ResultsScreen } from './screens/ResultsScreen';

export function App() {
  const screen = useGameStore((state) => state.screen);
  return (
    <main>
      {screen === 'title' && <TitleScreen />}
      {screen === 'meeting' && <MeetingScreen />}
      {screen === 'results' && <ResultsScreen />}
    </main>
  );
}
