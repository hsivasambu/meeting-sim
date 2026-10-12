import { meetingCopy } from '../../core/content/copy';
import { formatCost } from '../../core/engine/index';
import type { MeetingState } from '../../core/engine/index';

export function MeetingStats({ game }: { readonly game: MeetingState }) {
  return (
    <dl className="stats">
      <div>
        <dt>{meetingCopy.progress}</dt>
        <dd>{game.progress}</dd>
      </div>
      <div>
        <dt>{meetingCopy.minutes}</dt>
        <dd>{game.minute}</dd>
      </div>
      <div>
        <dt>{meetingCopy.booking}</dt>
        <dd>{game.bookingEnd}</dd>
      </div>
      <div>
        <dt>{meetingCopy.cost}</dt>
        <dd>{formatCost(game.personMinutes)}</dd>
      </div>
      <div>
        <dt>{meetingCopy.risks}</dt>
        <dd>{game.risks}</dd>
      </div>
      <div>
        <dt>{meetingCopy.headcount}</dt>
        <dd>{game.present.length}</dd>
      </div>
    </dl>
  );
}
