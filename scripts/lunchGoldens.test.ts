import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import {
  lunchGoldenRoutes,
  runLunchGolden,
} from '../src/core/engine/fixtures/lunchGoldens';

it.each(lunchGoldenRoutes)(
  'replays frozen lunch golden $id byte for byte',
  (route) => {
    const expected: unknown = JSON.parse(
      readFileSync('tests/golden/lunch/' + route.id + '.json', 'utf8'),
    );
    const actual = runLunchGolden(route);
    expect(actual).toEqual(expected);
    expect(JSON.stringify(runLunchGolden(route))).toBe(JSON.stringify(actual));
  },
);
