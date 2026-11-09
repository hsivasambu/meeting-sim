import { useEffect, useRef } from 'react';
import { legacyTitles } from '../../core/content/legacyTitles';
import { titles } from '../../core/content/titles';
import type { LegacyTitleId, TitleId } from '../../core/engine/index';
import { formatLunchLine } from './presentation';
import { interfaceCopy as copy } from '../../core/content/copy';

export function LunchTitleScreen({
  assetStatus,
  start,
  retry,
  archive,
  unlocked,
}: {
  readonly assetStatus: 'loading' | 'ready' | 'failed';
  readonly start: () => void;
  readonly retry: () => void;
  readonly archive: readonly LegacyTitleId[];
  readonly unlocked: readonly TitleId[];
}) {
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (assetStatus !== 'loading') button.current?.focus();
  }, [assetStatus]);

  return (
    <section className="panel">
      <h1>{copy['product-title']}</h1>
      <p className="lunch-objective">{copy.objective}</p>
      <p>{copy.premise}</p>
      <div>
        <p>{copy['instructions-action']}</p>
        <p>{copy['instructions-cost']}</p>
        <p>{copy['instructions-chance']}</p>
      </div>
      <p role="status">{assetStatus === 'failed' ? copy['load-failed'] : ''}</p>
      <button
        ref={button}
        disabled={assetStatus === 'loading'}
        onClick={assetStatus === 'failed' ? retry : start}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && event.repeat) event.preventDefault();
        }}
      >
        {assetStatus === 'loading'
          ? copy.loading
          : assetStatus === 'failed'
            ? copy.retry
            : copy.start}
      </button>
      <section aria-label={copy['current-collection']}>
        <h2>{copy['current-collection']}</h2>
        <p>
          {formatLunchLine(copy['collection-count'], {
            unlocked: unlocked.length,
          })}
        </p>
        <ul>
          {titles.map(({ id, name }) => (
            <li key={id}>
              {name}
              {!unlocked.includes(id) && <> · {copy['locked-title']}</>}
            </li>
          ))}
        </ul>
      </section>
      {archive.length ? (
        <section aria-label={copy['legacy-collection']}>
          <h2>{copy['legacy-collection']}</h2>
          <p>{copy['legacy-explanation']}</p>
          <ul>
            {legacyTitles
              .filter(({ id }) => archive.includes(id))
              .map(({ id, name }) => (
                <li key={id}>{name}</li>
              ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
}
