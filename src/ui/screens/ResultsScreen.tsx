import { useEffect, useRef } from 'react';
import { meetingCopy } from '../../core/content/copy';
import { ENGINE_LIMITS } from '../../core/engine/index';
import { useGameStore } from '../../store/gameStore';
import { MeetingStats } from './MeetingStats';

export function ResultsScreen() {
  const game = useGameStore((state) => state.game);
  const breakdown = useGameStore((state) => state.breakdown);
  const restart = useGameStore((state) => state.restart);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  if (game === null || breakdown === null || game.ending === null) return null;
  return (
    <section className="panel">
      <h1 ref={heading} tabIndex={-1}>
        {meetingCopy.results}
      </h1>
      <h2>{meetingCopy.endings[game.ending]}</h2>
      <p>
        {meetingCopy.score}: {breakdown.total}/{ENGINE_LIMITS.scoreMax}
      </p>
      <MeetingStats game={game} />
      <p>
        {meetingCopy.peakHeadcount}: {game.peakHeadcount}
      </p>
      <button onClick={restart}>{meetingCopy.replay}</button>
    </section>
  );
}
