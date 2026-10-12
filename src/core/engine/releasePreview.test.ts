import { describe, expect, it } from 'vitest';
import { initialState, release, previewRelease, callIt } from './state';
import { deepFreeze } from './fixtures/transitions';
import type { AttendeeId } from './types';

describe('ADR 0004 release preview shares transition eligibility', () => {
  it.each([
    ['priya', 'release-owner'],
    ['legal', 'release-absent'],
  ] as const)('refuses %s without mutating frozen input', (who, reasonKey) => {
    const state = deepFreeze(initialState('fixture-release'));
    expect(previewRelease(state, who)).toEqual({ enabled: false, reasonKey });
    expect(release(state, who)).toEqual(state);
    expect(release(state, who)).not.toBe(state);
  });
  it('refuses the final other attendee; owner and absent take precedence', () => {
    const state = deepFreeze({
      ...initialState('fixture-release'),
      present: ['priya', 'sam'] as const,
    });
    expect(previewRelease(state, 'sam')).toEqual({
      enabled: false,
      reasonKey: 'release-minimum',
    });
    expect(previewRelease(state, 'priya')).toEqual({
      enabled: false,
      reasonKey: 'release-owner',
    });
    expect(previewRelease(state, 'legal')).toEqual({
      enabled: false,
      reasonKey: 'release-absent',
    });
    expect(release(state, 'sam')).toEqual(state);
  });
  it('agrees with release for all roster subsets containing the owner', () => {
    const others: readonly AttendeeId[] = [
      'dev',
      'sam',
      'morgan',
      'gary',
      'jordan',
      'legal',
      'vp',
    ];
    for (let mask = 1; mask < 2 ** others.length; mask++) {
      const present = [
        'priya' as const,
        ...others.filter((_who, index) => (mask & (1 << index)) !== 0),
      ];
      const state = deepFreeze({ ...initialState('fixture-release'), present });
      for (const who of ['priya' as const, ...others]) {
        const preview = previewRelease(state, who);
        const next = release(state, who);
        if (preview.enabled) {
          expect(next.present).toEqual(present.filter((id) => id !== who));
          expect(next.releasedAttendeeIds).toEqual([who]);
          expect(next.minute).toBe(state.minute);
          expect(next.personMinutes).toBe(state.personMinutes);
        } else {
          expect(next).toEqual(state);
        }
      }
    }
  });
  it('rejects ended states with the same existing error', () => {
    const state = deepFreeze(callIt(initialState('fixture-release')));
    expect(() => previewRelease(state, 'gary')).toThrow('ended');
    expect(() => release(state, 'gary')).toThrow('ended');
  });
});
