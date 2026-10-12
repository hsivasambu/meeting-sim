import { describe, expect, it, vi } from 'vitest';
import { readTitles, readTitleSnapshot, writeTitles } from './persistence';

describe('failure-safe title persistence', () => {
  it('distinguishes failed reads from readable missing or corrupt values', () => {
    expect(
      readTitleSnapshot(() => {
        throw new Error('blocked');
      }),
    ).toEqual({ titles: [], readable: false });
    for (const raw of [null, '{', 'null', '{}']) {
      expect(
        readTitleSnapshot(() => ({ getItem: () => raw, setItem: vi.fn() })),
      ).toEqual({ titles: [], readable: true });
    }
  });
  it.each([null, '{', '{}', 'null', '42', '"inbox-zero"'])(
    'handles %s',
    (raw) => {
      expect(
        readTitles(() => ({ getItem: () => raw, setItem: vi.fn() })),
      ).toEqual([]);
    },
  );
  it('validates ids and deduplicates without trusting parsed JSON', () => {
    const getItem = vi.fn(
      () => '["inbox-zero","unknown",null,4,{},"inbox-zero","gary-free-zone"]',
    );
    expect(readTitles(() => ({ getItem, setItem: vi.fn() }))).toEqual([
      'inbox-zero',
      'gary-free-zone',
    ]);
    expect(getItem).toHaveBeenCalledWith('tcbae:v1:titles');
  });
  it('writes only the versioned title array', () => {
    const setItem = vi.fn();
    writeTitles(['inbox-zero', 'inbox-zero', 'gary-free-zone'], () => ({
      getItem: () => null,
      setItem,
    }));
    expect(setItem).toHaveBeenCalledExactlyOnceWith(
      'tcbae:v1:titles',
      '["inbox-zero","gary-free-zone"]',
    );
  });
  it('catches property access, read, and write failures', () => {
    const blocked = () => {
      throw new Error('blocked');
    };
    expect(readTitles(blocked)).toEqual([]);
    expect(() => writeTitles(['inbox-zero'], blocked)).not.toThrow();
    const storage = () => ({ getItem: blocked, setItem: blocked });
    expect(readTitles(storage)).toEqual([]);
    expect(() => writeTitles(['inbox-zero'], storage)).not.toThrow();
  });
});
