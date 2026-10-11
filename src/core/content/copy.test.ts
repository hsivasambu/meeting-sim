import { expect, it } from 'vitest';
import { shellCopy } from './copy';
import { probeCopy, probeSettings } from './probeCopy';

it('keeps the existing shell and probe copy complete, nonempty and serializable', () => {
  for (const copy of [shellCopy, probeCopy]) {
    expect(JSON.parse(JSON.stringify(copy))).toEqual(copy);
    for (const text of Object.values(copy))
      expect(text.trim().length).toBeGreaterThan(0);
  }
  expect(probeCopy.imageAlt.trim().length).toBeGreaterThan(0);
  expect(JSON.parse(JSON.stringify(probeSettings))).toEqual(probeSettings);
});
