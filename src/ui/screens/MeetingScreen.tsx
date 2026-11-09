import { useEffect, useId, useRef, useState } from 'react';
import { attendees } from '../../core/content/attendees';
import { commentary } from '../../core/content/commentary';
import {
  disabledReasons,
  interfaceCopy as copy,
  lunchUiConfig,
} from '../../core/content/copy';
import type { AttendeeId } from '../../core/engine/index';
import { LunchMeetingStats } from './MeetingStats';
import type { LunchHud } from './MeetingStats';
import { LunchRoster } from './Roster';
import { cuisineName, formatLunchLine, useReducedMotion } from './presentation';
import type { LunchChoice } from './presentation';

export type LunchBeat = 'speaking' | 'choosing' | 'outcome';

/**
 * Give each draw and resolution a unique id. Keep a draw's id across speaking and choosing.
 * Pass the raw template from current.line on a draw or the latest resolve log line
 * on an outcome. Keep the presented event's speaker for its outcome.
 * Keep choices in current.responses order so keys 1–3 map to the right buttons.
 * Supply agreedCuisine only after agreement and take commentaryId from the engine's
 * resolve entry.
 */
export interface LunchFrame {
  readonly id: string;
  readonly hud: LunchHud;
  readonly present: readonly AttendeeId[];
  readonly speaker: AttendeeId | 'room';
  readonly line: string;
  readonly choices: readonly LunchChoice[];
  readonly commentaryId?: string;
  readonly agreedCuisine?: string;
}

function SpokenLine({
  line,
  typing,
  finishTyping,
}: {
  readonly line: string;
  readonly typing: boolean;
  readonly finishTyping: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState('');
  useEffect(() => {
    if (!typing) return;
    if (reducedMotion) {
      finishTyping();
      return;
    }
    const characters = Array.from(line);
    const start = performance.now();
    let frame = requestAnimationFrame(tick);
    function tick(now: number) {
      const count = Math.floor(
        ((now - start) * lunchUiConfig.charactersPerSecond) /
          lunchUiConfig.millisecondsPerSecond,
      );
      if (count >= characters.length) {
        finishTyping();
        return;
      }
      setVisible(characters.slice(lunchUiConfig.lineStart, count).join(''));
      frame = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(frame);
  }, [line, typing, reducedMotion, finishTyping]);
  return <p aria-hidden="true">{typing && !reducedMotion ? visible : line}</p>;
}

export function LunchMeetingScreen({
  frame,
  beat,
  finishTyping,
  choose,
  continueMeeting,
  callIt,
}: {
  readonly frame: LunchFrame;
  readonly beat: LunchBeat;
  readonly finishTyping: () => void;
  readonly choose: (responseId: string) => void;
  readonly continueMeeting: () => void;
  readonly callIt: () => void;
}) {
  const controls = useRef<HTMLDivElement>(null);
  const callItButton = useRef<HTMLButtonElement>(null);
  const id = useId();
  const speaker =
    attendees.find((person) => person.id === frame.speaker)?.name ??
    copy['room-speaker'];
  const facts = {
    ...(frame.hud.nominatedCuisine === null
      ? {}
      : { cuisine: cuisineName(frame.hud.nominatedCuisine) }),
    ...(frame.agreedCuisine === undefined
      ? {}
      : { agreedCuisine: cuisineName(frame.agreedCuisine) }),
  };
  const line = formatLunchLine(frame.line, facts);
  const commentaryTemplate = commentary.find(
    (entry) => entry.id === frame.commentaryId,
  )?.line;
  const secondary =
    beat === 'outcome' && commentaryTemplate !== undefined
      ? formatLunchLine(commentaryTemplate, facts)
      : '';
  const [announcement, setAnnouncement] = useState<{
    id: string;
    line: string;
    secondary: string;
  } | null>(null);

  useEffect(() => {
    // Keep the live region mounted before adding the full line and update once per frame.
    const animation = requestAnimationFrame(() =>
      setAnnouncement({ id: frame.id, line, secondary }),
    );
    return () => cancelAnimationFrame(animation);
  }, [frame.id, line, secondary]);

  useEffect(() => {
    const first =
      controls.current?.querySelector<HTMLButtonElement>('button:enabled');
    (first ?? callItButton.current)?.focus();
  }, [beat, frame.id]);

  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      )
        return;
      const target = event.target instanceof Element ? event.target : null;
      if (
        target?.closest('input, textarea, select, [contenteditable], a[href]')
      )
        return;
      const choiceKey = lunchUiConfig.choiceKeys.find(
        (key) => key === event.key,
      );
      if (event.repeat && (event.key === 'Enter' || choiceKey !== undefined)) {
        event.preventDefault();
        return;
      }
      if (event.key === 'Enter' && beat !== 'choosing') {
        const button = target?.closest('button');
        if (button && !controls.current?.contains(button)) return;
        event.preventDefault();
        if (beat === 'speaking') finishTyping();
        else continueMeeting();
      } else if (beat === 'choosing' && choiceKey !== undefined) {
        const choice =
          frame.choices[lunchUiConfig.choiceKeys.indexOf(choiceKey)];
        if (choice?.enabled) {
          event.preventDefault();
          choose(choice.id);
        }
      }
    }
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [beat, frame.choices, finishTyping, choose, continueMeeting]);

  return (
    <section className="panel">
      <h1>{copy.meeting}</h1>
      <LunchMeetingStats hud={frame.hud} />
      <LunchRoster present={frame.present} />
      <section className="dialogue" aria-label={speaker}>
        <h2>{speaker}</h2>
        <SpokenLine
          key={frame.id}
          line={line}
          typing={beat === 'speaking'}
          finishTyping={finishTyping}
        />
        {secondary && (
          <p className="hint" aria-hidden="true">
            {secondary}
          </p>
        )}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement && (
            <div key={announcement.id}>
              <p>{announcement.line}</p>
              {announcement.secondary && <p>{announcement.secondary}</p>}
            </div>
          )}
        </div>
      </section>
      <div className="choices" ref={controls}>
        {beat === 'speaking' && (
          <button
            key="speaking"
            onClick={(event) => {
              if (event.detail <= lunchUiConfig.singleClickCount)
                finishTyping();
            }}
          >
            {copy['show-choices']}
          </button>
        )}
        {beat === 'choosing' &&
          frame.choices.map((choice, index) => {
            const key = lunchUiConfig.choiceKeys[index];
            const description = `${id}-response-${choice.id}`;
            const reason = !choice.enabled
              ? Object.entries(disabledReasons).find(
                  ([reasonKey]) => reasonKey === choice.reasonKey,
                )?.[1]
              : undefined;
            return (
              <button
                key={choice.id}
                className="lunch-choice"
                disabled={!choice.enabled}
                aria-keyshortcuts={choice.enabled ? key : undefined}
                aria-labelledby={`${description}-label`}
                aria-describedby={description}
                onClick={(event) => {
                  if (
                    choice.enabled &&
                    event.detail <= lunchUiConfig.singleClickCount
                  )
                    choose(choice.id);
                }}
              >
                <span aria-hidden="true">{key}. </span>
                <strong id={`${description}-label`}>
                  {formatLunchLine(choice.label, facts)}
                </strong>
                <span id={description} className="lunch-choice-detail">
                  <span>{formatLunchLine(choice.description, facts)}</span>
                  {reason && <span>{formatLunchLine(reason, facts)}</span>}
                </span>
              </button>
            );
          })}
        {beat === 'outcome' && (
          <button
            key="outcome"
            onClick={(event) => {
              if (event.detail <= lunchUiConfig.singleClickCount)
                continueMeeting();
            }}
          >
            {copy.continue}
          </button>
        )}
      </div>
      <button
        ref={callItButton}
        aria-describedby={`${id}-call-it`}
        disabled={beat === 'outcome'}
        onClick={(event) => {
          if (event.detail <= lunchUiConfig.singleClickCount) callIt();
        }}
      >
        {copy['call-it']}
      </button>
      <p className="hint" id={`${id}-call-it`}>
        {copy['call-it-description']}
      </p>
      <p className="hint">{copy.keyboard}</p>
    </section>
  );
}
