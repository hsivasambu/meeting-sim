import { useEffect, useRef } from 'react';
import { meetingCopy, shellCopy } from '../../core/content/copy';
import { useGameStore } from '../../store/gameStore';

export function TitleScreen() {
  const status = useGameStore((state) => state.assetStatus);
  const setAssetStatus = useGameStore((state) => state.setAssetStatus);
  const start = useGameStore((state) => state.start);
  const startButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    // Task 12a has an empty required asset set (ADR 0004).
    setAssetStatus('ready');
  }, [setAssetStatus]);
  useEffect(() => {
    if (status === 'ready') startButton.current?.focus();
  }, [status]);
  return (
    <section className="panel">
      <h1>{shellCopy.title}</h1>
      <p>{shellCopy.objective}</p>
      <p>{meetingCopy.instructions}</p>
      <button
        ref={startButton}
        disabled={status === 'loading'}
        onClick={status === 'failed' ? () => setAssetStatus('ready') : start}
      >
        {status === 'loading'
          ? meetingCopy.loading
          : status === 'failed'
            ? meetingCopy.retry
            : meetingCopy.start}
      </button>
    </section>
  );
}
