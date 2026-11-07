import { useId } from 'react';
import { attendees } from '../../../core/content/lunch/attendees';
import { interfaceCopy as copy } from '../../../core/content/lunch/copy';
import type { AttendeeId } from '../../../core/engine/index';

export function LunchRoster({
  present,
}: {
  readonly present: readonly AttendeeId[];
}) {
  const heading = useId();
  return (
    <section aria-labelledby={heading}>
      <h2 id={heading}>{copy.roster}</h2>
      <ul className="roster lunch-roster" role="list">
        {attendees
          .filter((person) => present.includes(person.id))
          .map((person) => (
            <li key={person.id}>
              <strong>{person.name}</strong>
              <span>{person.role}</span>
            </li>
          ))}
      </ul>
    </section>
  );
}
