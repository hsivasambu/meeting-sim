import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  copyText,
  failureResult,
  shareFile,
  shareSupport,
  shareText,
} from './capabilities';

afterEach(() => vi.unstubAllGlobals());
const file = new File(['PNG fixture'], 'fixture.png', { type: 'image/png' });

describe('capability probes', () => {
  it('reports missing optional APIs without throwing', async () => {
    vi.stubGlobal('navigator', {});
    vi.stubGlobal('window', { isSecureContext: false });
    expect(shareSupport(file)).toEqual({
      secureContext: false,
      text: false,
      files: false,
      clipboard: false,
    });
    expect(await shareText('fixture')).toBe('unsupported');
    expect(await shareFile(file)).toBe('unsupported');
    expect(await copyText('fixture')).toBe('unsupported');
  });
  it('does not confuse canShare support with an actual share success', async () => {
    const share = vi
      .fn()
      .mockRejectedValue(new DOMException('blocked', 'NotAllowedError'));
    vi.stubGlobal('navigator', { share, canShare: () => true });
    vi.stubGlobal('window', { isSecureContext: true });
    expect(shareSupport(file).files).toBe(true);
    expect(await shareFile(file)).toBe('failed');
    expect(share).toHaveBeenCalledWith({ files: [file] });
  });
  it('handles a throwing canShare and avoids attempting unsupported file sharing', async () => {
    const share = vi.fn();
    vi.stubGlobal('navigator', {
      share,
      canShare: () => {
        throw new Error('blocked');
      },
    });
    vi.stubGlobal('window', { isSecureContext: true });
    expect(await shareFile(file)).toBe('unsupported');
    expect(share).not.toHaveBeenCalled();
  });
  it('records success only after the native operation resolves', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { share, clipboard: { writeText } });
    expect(await shareText('fixture')).toBe('success');
    expect(await copyText('fixture')).toBe('success');
    expect(share).toHaveBeenCalledWith({ text: 'fixture' });
    expect(writeText).toHaveBeenCalledWith('fixture');
  });
  it('treats share-sheet cancellation separately from failures', async () => {
    vi.stubGlobal('navigator', {
      share: vi
        .fn()
        .mockRejectedValue(new DOMException('cancelled', 'AbortError')),
    });
    expect(await shareText('fixture')).toBe('cancelled');
    expect(failureResult('unknown failure')).toBe('failed');
  });
  it('returns a usable failure status when clipboard permission is denied', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('blocked')) },
    });
    expect(await copyText('fixture')).toBe('failed');
  });
});
