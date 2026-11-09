import { useEffect, useRef } from 'react';
import { interfaceCopy as copy } from '../../../core/content/lunch/copy';

export function LunchTitleScreen({
  assetStatus,
  start,
  retry,
}: {
  readonly assetStatus: 'loading' | 'ready' | 'failed';
  readonly start: () => void;
  readonly retry: () => void;
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
      >
        {assetStatus === 'loading'
          ? copy.loading
          : assetStatus === 'failed'
            ? copy.retry
            : copy.start}
      </button>
    </section>
  );
}
