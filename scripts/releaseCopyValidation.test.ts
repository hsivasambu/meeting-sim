import { expect, it } from 'vitest';
import { initialState, previewRelease } from '../src/core/engine/index';
import { disabledReasons, releaseReasons } from '../src/core/content/copy';

it('public release previews resolve authored copy without changing response reason audits', () => {
  const base = initialState('release-copy-fixture');
  const scenarios = [
    { state: base, who: 'priya' },
    { state: base, who: 'legal' },
    { state: { ...base, present: ['priya', 'sam'] }, who: 'sam' },
  ] as const;
  const keys = [];
  for (const { state, who } of scenarios) {
    const preview = previewRelease(state, who);
    if (preview.enabled) throw new Error('Expected a blocked release');
    keys.push(preview.reasonKey);
    expect(releaseReasons[preview.reasonKey].trim().length).toBeGreaterThan(0);
    expect(disabledReasons).not.toHaveProperty(preview.reasonKey);
  }
  expect(keys.sort()).toEqual(Object.keys(releaseReasons).sort());
  expect(previewRelease(base, 'gary')).toEqual({ enabled: true });
});
