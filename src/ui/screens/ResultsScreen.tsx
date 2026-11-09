import { useEffect, useRef } from 'react';
import { attendees } from '../../core/content/attendees';
import {
  interfaceCopy as copy,
  epilogues,
  lunchUiConfig,
  moments,
  parkTopics,
} from '../../core/content/copy';
import { titles } from '../../core/content/titles';
import { ENGINE_LIMITS, formatCost } from '../../core/engine/index';
import type {
  LogEntry,
  TitleId,
  ScoreBreakdown,
} from '../../core/engine/index';
import { cuisineName, formatLunchLine } from './presentation';

export type LunchResult = {
  readonly minute: number;
  readonly personMinutes: number;
  readonly peakHeadcount: number;
  readonly breakdown: ScoreBreakdown;
  readonly log: readonly LogEntry[];
  /** First earned title in engine display priority. */
  readonly titleId: TitleId | null;
} & (
  | { readonly ending: 'decision'; readonly agreedCuisine: string }
  | {
      readonly ending: 'called-early' | 'time-expired' | 'cancelled';
      readonly nominatedCuisine: string | null;
    }
);

const fallbackMoments = {
  decision: moments['decision-fallback'],
  'called-early': moments['early-fallback'],
  'time-expired': moments['expiry-fallback'],
  cancelled: moments['cancel-fallback'],
};

function meetingMoment(result: LunchResult, agreedCuisine: string | undefined) {
  for (const entry of result.log) {
    if (entry.type !== 'resolve') continue;
    const topicKey = `${entry.eventId} / ${entry.responseId}`;
    const topic = Object.entries(parkTopics).find(
      ([key]) => key === topicKey,
    )?.[1];
    if (topic !== undefined)
      return formatLunchLine(moments['first-postponed'], {
        minute: entry.minute,
        topic,
      });
  }
  const arrival = result.log.find((entry) => entry.type === 'join');
  if (arrival !== undefined) {
    const attendee = attendees.find((person) => person.id === arrival.who);
    if (attendee !== undefined)
      return formatLunchLine(moments['first-arrival'], {
        attendee: attendee.name,
        minute: arrival.minute,
      });
  }
  const fallback = fallbackMoments[result.ending];
  return agreedCuisine === undefined
    ? fallback
    : formatLunchLine(fallback, { agreedCuisine });
}

export function LunchResultsScreen({
  result,
  restart,
}: {
  readonly result: LunchResult;
  readonly restart: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  const agreedCuisine =
    result.ending === 'decision'
      ? cuisineName(result.agreedCuisine)
      : undefined;
  const facts = agreedCuisine === undefined ? {} : { agreedCuisine };
  const title = titles.find(({ id }) => id === result.titleId);
  const cuisineResult =
    result.ending === 'decision'
      ? formatLunchLine(copy['success-result'], facts)
      : copy['failure-result'];
  const fallback =
    result.ending === 'decision'
      ? formatLunchLine(copy['fallback-decision-heading'], facts)
      : copy['fallback-failure-heading'];
  const { breakdown } = result;

  return (
    <section className="panel">
      <h1 ref={heading} tabIndex={-1}>
        {copy.results}
      </h1>
      <div>
        <h2>{title?.name ?? fallback}</h2>
        {title && (
          <>
            <h3 className="lunch-objective">{cuisineResult}</h3>
            <p>{formatLunchLine(title.flavour, facts)}</p>
          </>
        )}
      </div>
      {result.ending === 'decision' ? (
        <p>{formatLunchLine(copy['success-summary'], facts)}</p>
      ) : (
        <div>
          <p>{copy[`ended-${result.ending}`]}</p>
          <p>
            {result.nominatedCuisine === null
              ? copy['failure-no-nomination']
              : formatLunchLine(copy['failure-nomination'], {
                  cuisine: cuisineName(result.nominatedCuisine),
                })}
          </p>
        </div>
      )}
      <p>{formatLunchLine(epilogues[result.ending], facts)}</p>
      <dl className="stats">
        <div>
          <dt>{copy.score}</dt>
          <dd>
            {breakdown.total}/{ENGINE_LIMITS.scoreMax}
          </dd>
        </div>
        <div>
          <dt>{copy['outcome-component']}</dt>
          <dd>{breakdown.outcome}</dd>
        </div>
        <div>
          <dt>{copy['efficiency-component']}</dt>
          <dd>{breakdown.efficiency}</dd>
        </div>
        <div>
          <dt>{copy['decisions-component']}</dt>
          <dd>{breakdown.decisions}</dd>
        </div>
        <div>
          <dt>{copy.minutes}</dt>
          <dd>{result.minute}</dd>
        </div>
        <div>
          <dt>{copy.cost}</dt>
          <dd>{formatCost(result.personMinutes)}</dd>
        </div>
        <div>
          <dt>{copy['peak-headcount']}</dt>
          <dd>{result.peakHeadcount}</dd>
        </div>
      </dl>
      <p>{copy['choices-explanation']}</p>
      <p>{copy['actual-explanation']}</p>
      <div>
        <h2>{copy.moment}</h2>
        <p>{meetingMoment(result, agreedCuisine)}</p>
      </div>
      <button
        onClick={(event) => {
          if (event.detail <= lunchUiConfig.singleClickCount) restart();
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && event.repeat) event.preventDefault();
        }}
      >
        {copy.replay}
      </button>
    </section>
  );
}
