import { probeCopy, probeSettings } from '../../core/content/probeCopy';

export async function renderProbeImage() {
  const fonts = 'fonts' in document;
  if (fonts) await document.fonts.ready;
  const canvas = document.createElement('canvas');
  canvas.width = probeSettings.width;
  canvas.height = probeSettings.height;
  const context = canvas.getContext('2d');
  if (!context || typeof canvas.toBlob !== 'function')
    throw new Error('Canvas export unavailable');
  context.fillStyle = probeSettings.background;
  context.fillRect(
    probeSettings.origin,
    probeSettings.origin,
    canvas.width,
    canvas.height,
  );
  context.fillStyle = probeSettings.foreground;
  context.font = probeSettings.titleFont;
  context.fillText(
    probeCopy.cardTitle,
    probeSettings.titleX,
    probeSettings.titleY,
  );
  context.font = probeSettings.bodyFont;
  context.fillText(
    probeCopy.cardBody,
    probeSettings.bodyX,
    probeSettings.bodyY,
  );
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error('Canvas export returned no image'));
    }, 'image/png');
  });
  const url = URL.createObjectURL(blob);
  const image = new Image();
  const decode = typeof image.decode === 'function';
  try {
    if (decode) {
      image.src = url;
      await image.decode();
    } else {
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Image load failed'));
        image.src = url;
      });
    }
    return {
      file: new File([blob], probeSettings.filename, { type: 'image/png' }),
      url,
      fonts,
      decode,
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}
