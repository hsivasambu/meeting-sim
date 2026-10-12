import { useEffect, useRef, useState } from 'react';
import { attendees } from '../../core/content/attendees';
import { meetingCopy, releaseReasons } from '../../core/content/copy';
import { previewRelease } from '../../core/engine/index';
import type { AttendeeId, MeetingState } from '../../core/engine/index';
import { useGameStore } from '../../store/gameStore';

export function Roster({
  game,
  interactive,
}: {
  readonly game: MeetingState;
  readonly interactive: boolean;
}) {
  const [selected, setSelected] = useState<AttendeeId | null>(null);
  const release = useGameStore((state) => state.release);
  const cancel = useRef<HTMLButtonElement>(null);
  const roster = useRef<HTMLDivElement>(null);
  const preview =
    selected === null || !interactive ? null : previewRelease(game, selected);
  useEffect(() => {
    if (selected !== null) cancel.current?.focus();
  }, [selected]);
  function close() {
    roster.current
      ?.querySelector<HTMLButtonElement>(`[data-attendee="${selected}"]`)
      ?.focus();
    setSelected(null);
  }
  return (
    <section aria-label={meetingCopy.roster}>
      <h2>{meetingCopy.roster}</h2>
      <div className="roster" ref={roster}>
        {attendees
          .filter((person) => game.present.includes(person.id))
          .map((person) => (
            <button
              key={person.id}
              data-attendee={person.id}
              disabled={!interactive}
              aria-expanded={selected === person.id}
              onClick={() => setSelected(person.id)}
            >
              <strong>{person.name}</strong>
              <span>{person.role}</span>
            </button>
          ))}
      </div>
      {selected !== null && preview !== null && (
        <div
          className="release"
          role="group"
          aria-label={attendees.find((person) => person.id === selected)?.name}
          onKeyDown={(event) => {
            if (event.key === 'Escape') close();
          }}
        >
          {preview.enabled ? (
            <button
              onClick={() => {
                release(selected);
                setSelected(null);
                roster.current
                  ?.querySelector<HTMLButtonElement>('button:enabled')
                  ?.focus();
              }}
            >
              {meetingCopy.confirmRelease}
            </button>
          ) : (
            <p role="status">{releaseReasons[preview.reasonKey]}</p>
          )}
          <button ref={cancel} onClick={close}>
            {meetingCopy.cancel}
          </button>
        </div>
      )}
    </section>
  );
}
