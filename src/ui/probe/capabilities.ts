export type ProbeResult =
  'idle' | 'success' | 'unsupported' | 'cancelled' | 'failed';

export function shareSupport(file: File | null) {
  let files: boolean;
  try {
    files =
      file !== null &&
      typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [file] });
  } catch {
    files = false;
  }
  return {
    secureContext: window.isSecureContext,
    text: typeof navigator.share === 'function',
    files,
    clipboard: typeof navigator.clipboard?.writeText === 'function',
  };
}

export function failureResult(error: unknown): ProbeResult {
  return error instanceof Error && error.name === 'AbortError'
    ? 'cancelled'
    : 'failed';
}

export async function shareText(text: string): Promise<ProbeResult> {
  if (typeof navigator.share !== 'function') return 'unsupported';
  try {
    await navigator.share({ text });
    return 'success';
  } catch (error) {
    return failureResult(error);
  }
}

export async function shareFile(file: File): Promise<ProbeResult> {
  if (!shareSupport(file).files) return 'unsupported';
  try {
    await navigator.share({ files: [file] });
    return 'success';
  } catch (error) {
    return failureResult(error);
  }
}

export async function copyText(text: string): Promise<ProbeResult> {
  if (typeof navigator.clipboard?.writeText !== 'function')
    return 'unsupported';
  try {
    await navigator.clipboard.writeText(text);
    return 'success';
  } catch (error) {
    return failureResult(error);
  }
}
