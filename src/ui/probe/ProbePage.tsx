import { useEffect, useReducer, useState } from 'react';
import { probeCopy, probeSettings } from '../../core/content/probeCopy';
import { copyText, shareFile, shareSupport, shareText } from './capabilities';
import type { ProbeResult } from './capabilities';
import { renderProbeImage } from './renderProbeImage';

type PreparedImage = Awaited<ReturnType<typeof renderProbeImage>>;
const buttonClass =
  'min-h-11 rounded border px-4 py-3 disabled:opacity-50 focus-visible:outline-2';

export function ProbePage() {
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [imageError, setImageError] = useState(false);
  const [reload, retry] = useReducer((current: boolean) => !current, false);
  const [textResult, setTextResult] = useState<ProbeResult>('idle');
  const [fileResult, setFileResult] = useState<ProbeResult>('idle');
  const [clipboardResult, setClipboardResult] = useState<ProbeResult>('idle');
  useEffect(() => {
    let disposed = false;
    let objectUrl: string | undefined;
    void renderProbeImage()
      .then((ready) => {
        objectUrl = ready.url;
        if (disposed) URL.revokeObjectURL(ready.url);
        else {
          setImage(ready);
          setImageError(false);
        }
      })
      .catch(() => {
        if (!disposed) setImageError(true);
      });
    return () => {
      disposed = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [reload]);
  const support = shareSupport(image?.file ?? null);
  const report = JSON.stringify(
    {
      ...support,
      fontLoadingReady: image?.fonts ?? null,
      imageDecode: image?.decode ?? null,
      imageReady: image !== null,
      textShare: textResult,
      fileShare: fileResult,
      clipboardWrite: clipboardResult,
    },
    null,
    probeSettings.reportIndent,
  );
  return (
    <main className="mx-auto max-w-2xl space-y-6 p-4">
      <h1 className="text-2xl font-bold">{probeCopy.heading}</h1>
      <p>{probeCopy.purpose}</p>
      <p>{probeCopy.instructions}</p>
      <p>{probeCopy.warning}</p>
      <div className="flex flex-wrap gap-3">
        <button
          className={buttonClass}
          disabled={!support.text}
          onClick={() => {
            void shareText(probeCopy.sample).then(setTextResult);
          }}
        >
          {probeCopy.textShare}
        </button>
        <button
          className={buttonClass}
          disabled={!support.files}
          onClick={() => {
            if (image) void shareFile(image.file).then(setFileResult);
          }}
        >
          {probeCopy.fileShare}
        </button>
        <button
          className={buttonClass}
          disabled={!support.clipboard}
          onClick={() => {
            void copyText(probeCopy.sample).then(setClipboardResult);
          }}
        >
          {probeCopy.clipboard}
        </button>
      </div>
      <dl aria-live="polite" className="space-y-2">
        <div>
          <dt>{probeCopy.textShare}</dt>
          <dd>{probeCopy[textResult]}</dd>
        </div>
        <div>
          <dt>{probeCopy.fileShare}</dt>
          <dd>{probeCopy[fileResult]}</dd>
        </div>
        <div>
          <dt>{probeCopy.clipboard}</dt>
          <dd>{probeCopy[clipboardResult]}</dd>
        </div>
      </dl>
      {image ? (
        <div className="space-y-3">
          <img
            src={image.url}
            alt={probeCopy.imageAlt}
            width={probeSettings.width}
            height={probeSettings.height}
            className="h-auto w-full"
          />
          <a
            className={buttonClass}
            href={image.url}
            download={probeSettings.filename}
          >
            {probeCopy.download}
          </a>
        </div>
      ) : imageError ? (
        <div className="space-y-3">
          <p role="status">{probeCopy.imageFailure}</p>
          <button className={buttonClass} onClick={retry}>
            {probeCopy.retry}
          </button>
        </div>
      ) : (
        <p role="status">{probeCopy.preparing}</p>
      )}
      <label className="block space-y-2">
        <span>{probeCopy.fallback}</span>
        <textarea
          readOnly
          value={probeCopy.sample}
          className="min-h-24 w-full rounded border p-3"
        />
      </label>
      <label className="block space-y-2">
        <span>{probeCopy.report}</span>
        <textarea
          readOnly
          value={report}
          className="min-h-80 w-full rounded border p-3"
        />
      </label>
    </main>
  );
}
