import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { LunchResultsScreen } from './ResultsScreen';
import type { LunchResult } from './ResultsScreen';

// Every legal terminal state earns a title. Keep the defensive heading covered
// at the presentation boundary without putting a fixture driver in the app.
const summary = {
  titleId: null,
  log: [],
  minute: 60,
  personMinutes: 360,
  peakHeadcount: 6,
  breakdown: { outcome: 0, efficiency: 0, decisions: 0, total: 0 },
};

it.each([
  [{ ...summary, ending: 'decision', agreedCuisine: 'thai' }, 'Agreed: Thai'],
  [
    { ...summary, ending: 'time-expired', nominatedCuisine: 'thai' },
    'No agreement',
  ],
] satisfies readonly [LunchResult, string][])(
  'renders the authored fallback heading for %s',
  (result, heading) => {
    const html = renderToStaticMarkup(
      <LunchResultsScreen result={result} restart={() => undefined} />,
    );
    expect(html).toContain(`<h2>${heading}</h2>`);
  },
);
