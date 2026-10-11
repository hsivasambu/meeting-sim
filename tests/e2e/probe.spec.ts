import { readFile } from 'node:fs/promises';
import { test, expect } from './fixtures';
import { probeCopy } from '../../src/core/content/probeCopy';

test('probe exports a visible PNG, supports download and fits 320 pixels', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/probe.html');
  await expect(
    page.getByRole('heading', { name: probeCopy.heading }),
  ).toBeVisible();
  const image = page.getByRole('img', { name: probeCopy.imageAlt });
  await expect(image).toBeVisible();
  await expect
    .poll(() =>
      image.evaluate((element) =>
        element instanceof HTMLImageElement ? element.naturalWidth : 0,
      ),
    )
    .toBe(1200);
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('link', { name: probeCopy.download }).click();
  const download = await downloadEvent;
  expect(await download.failure()).toBeNull();
  const path = await download.path();
  if (!path) throw new Error('Download produced no file');
  expect((await readFile(path)).subarray(0, 8).toString('hex')).toBe(
    '89504e470d0a1a0a',
  );
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
});

test('blocked clipboard retains selectable text and an accurate failure report', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new DOMException('blocked', 'NotAllowedError');
        },
      },
    });
  });
  await page.goto('/probe.html');
  await page.getByRole('button', { name: probeCopy.clipboard }).click();
  await expect(page.getByLabel(probeCopy.report)).toHaveValue(
    /"clipboardWrite": "failed"/,
  );
  await expect(page.getByLabel(probeCopy.fallback)).toHaveValue(
    probeCopy.sample,
  );
});

test('share-sheet cancellation stays a cancellation', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async () => {
        throw new DOMException('cancelled', 'AbortError');
      },
    });
  });
  await page.goto('/probe.html');
  await page.getByRole('button', { name: probeCopy.textShare }).click();
  await expect(page.getByLabel(probeCopy.report)).toHaveValue(
    /"textShare": "cancelled"/,
  );
});

test('missing optional APIs retain the image and fallback text', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });
  });
  await page.goto('/probe.html');
  await expect(
    page.getByRole('img', { name: probeCopy.imageAlt }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: probeCopy.fileShare }),
  ).toBeDisabled();
  await expect(
    page.getByRole('button', { name: probeCopy.textShare }),
  ).toBeDisabled();
  await expect(
    page.getByRole('button', { name: probeCopy.clipboard }),
  ).toBeDisabled();
  await expect(page.getByLabel(probeCopy.fallback)).toHaveValue(
    probeCopy.sample,
  );
});
