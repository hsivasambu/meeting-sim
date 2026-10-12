import { useEffect, useRef } from 'react';
import { attendees } from '../../core/content/attendees';
import {
  disabledReasons,
  meetingCopy,
  meetingUiConfig,
} from '../../core/content/copy';
import { formatCost, previewResponse } from '../../core/engine/index';
import { useGameStore } from '../../store/gameStore';
import { MeetingStats } from './MeetingStats';
import { Roster } from './Roster';

export function MeetingScreen() {
  const game = useGameStore((state) => state.game);
  const beat = useGameStore((state) => state.beat);
  const finishTyping = useGameStore((state) => state.finishTyping);
  const choose = useGameStore((state) => state.choose);
  const continueMeeting = useGameStore((state) => state.continue);
  const callIt = useGameStore((state) => state.callIt);
  const controls = useRef<HTMLDivElement>(null);
  const current = game?.current;
  useEffect(() => {
    controls.current
      ?.querySelector<HTMLButtonElement>('button:enabled')
      ?.focus();
  }, [beat, current]);
  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if (event.repeat) {
        if (
          event.key === 'Enter' ||
          meetingUiConfig.choiceKeys.some((key) => key === event.key)
        )
          event.preventDefault();
        return;
      }
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (
        event.target instanceof Element &&
        event.target.closest(
          'input, textarea, select, [contenteditable], .release',
        )
      )
        return;
      if (event.key === 'Enter' && beat !== 'choosing') {
        if (
          event.target instanceof Element &&
          event.target.closest('button') &&
          !controls.current?.contains(event.target)
        )
          return;
        event.preventDefault();
        if (beat === 'speaking') finishTyping();
        else continueMeeting();
      } else if (beat === 'choosing') {
        const index = meetingUiConfig.choiceKeys.findIndex(
          (key) => key === event.key,
        );
        const response = current?.responses[index];
        if (response !== undefined) {
          event.preventDefault();
          choose(response.id);
        }
      }
    }
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [beat, current, finishTyping, choose, continueMeeting]);
  if (game === null) return null;
  const outcome = [...game.log]
    .reverse()
    .find((entry) => entry.type === 'resolve');
  const line =
    beat === 'outcome' && outcome?.type === 'resolve'
      ? outcome.line
      : current?.line;
  const speakerId =
    current?.speaker ??
    [...game.log].reverse().find((entry) => entry.type === 'draw')?.speaker;
  const speaker =
    speakerId === 'room'
      ? meetingCopy.room
      : attendees.find((person) => person.id === speakerId)?.name;
  return (
    <section className="panel">
      <h1>{meetingCopy.meeting}</h1>
      <MeetingStats game={game} />
      <Roster key={beat} game={game} interactive={beat !== 'outcome'} />
      <section className="dialogue" aria-label={speaker}>
        <h2>{speaker}</h2>
        <p aria-hidden="true">{line}</p>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {line}
        </p>
      </section>
      <div className="choices" ref={controls}>
        {beat === 'speaking' && (
          <button onClick={finishTyping}>{meetingCopy.showChoices}</button>
        )}
        {beat === 'choosing' &&
          current?.responses.map((response, index) => {
            const preview = previewResponse(game, response);
            const reason = !preview.enabled
              ? Object.entries(disabledReasons).find(
                  ([key]) => key === preview.reasonKey,
                )?.[1]
              : undefined;
            return (
              <div key={response.id}>
                <button
                  disabled={!preview.enabled}
                  aria-describedby={`preview-${response.id}`}
                  onClick={() => choose(response.id)}
                >
                  {meetingUiConfig.choiceNumbers[index]}. {response.label}
                </button>
                <p id={`preview-${response.id}`}>
                  {preview.enabled ? (
                    <>
                      {preview.minutesDelta} {meetingCopy.previewMinutes} ·{' '}
                      {preview.progressDelta} {meetingCopy.previewProgress} ·{' '}
                      {preview.risksDelta} {meetingCopy.previewRisks} ·{' '}
                      {formatCost(preview.personMinutesDelta)}
                    </>
                  ) : (
                    reason
                  )}
                </p>
              </div>
            );
          })}
        {beat === 'outcome' && (
          <button onClick={continueMeeting}>{meetingCopy.continue}</button>
        )}
      </div>
      <button disabled={beat === 'outcome'} onClick={callIt}>
        {meetingCopy.callIt}
      </button>
      <p className="hint">{meetingCopy.keyboard}</p>
    </section>
  );
}
