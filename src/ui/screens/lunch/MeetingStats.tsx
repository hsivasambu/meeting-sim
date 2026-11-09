import { useEffect, useId, useRef, useState } from 'react';
import {
  interfaceCopy as copy,
  lunchUiConfig,
} from '../../../core/content/lunch/copy';
import { formatCost } from '../../../core/engine/index';
import { cuisineName, formatLunchLine, useReducedMotion } from './presentation';

export interface LunchHud {
  readonly progress: number;
  readonly minute: number;
  readonly bookingEnd: number;
  readonly personMinutes: number;
  readonly nominatedCuisine: string | null;
}

function CostCounter({ personMinutes }: { readonly personMinutes: number }) {
  const reduceMotion = useReducedMotion();
  const displayed = useRef(personMinutes);
  const [counter, setCounter] = useState(personMinutes);
  useEffect(() => {
    if (reduceMotion) {
      displayed.current = personMinutes;
      return;
    }
    const from = displayed.current;
    const start = performance.now();
    let frame = requestAnimationFrame(tick);
    function tick(now: number) {
      const elapsed = now - start;
      const duration = lunchUiConfig.meterDurationMs;
      const portion = Math.min(elapsed, duration) / duration;
      displayed.current = from + Math.round((personMinutes - from) * portion);
      setCounter(displayed.current);
      if (elapsed < duration) frame = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(frame);
  }, [personMinutes, reduceMotion]);

  return (
    <>
      <span aria-hidden="true">
        {formatCost(reduceMotion ? personMinutes : counter)}
      </span>
      <span className="sr-only">{formatCost(personMinutes)}</span>
    </>
  );
}

export function LunchMeetingStats({ hud }: { readonly hud: LunchHud }) {
  const costExplanation = useId();
  return (
    <>
      <p className="lunch-objective">
        {hud.nominatedCuisine === null
          ? copy['considering-empty']
          : formatLunchLine(copy.considering, {
              cuisine: cuisineName(hud.nominatedCuisine),
            })}
      </p>
      <dl className="stats lunch-stats">
        <div>
          <dt>{copy.progress}</dt>
          <dd>
            {hud.progress}%
            <span className="lunch-meter" aria-hidden="true">
              <span
                style={{
                  width: `${hud.progress}%`,
                  transitionDuration: `${lunchUiConfig.meterDurationMs}ms`,
                }}
              />
            </span>
          </dd>
        </div>
        <div>
          <dt>{copy.minutes}</dt>
          <dd>{hud.minute}</dd>
          <dt>{copy.booking}</dt>
          <dd>{hud.bookingEnd}</dd>
        </div>
        <div>
          <dt>{copy.cost}</dt>
          <dd aria-describedby={costExplanation}>
            <CostCounter personMinutes={hud.personMinutes} />
          </dd>
        </div>
      </dl>
      <p id={costExplanation} className="hint">
        {copy['cost-explanation']}
      </p>
    </>
  );
}
