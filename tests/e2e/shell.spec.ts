import { test, expect } from './fixtures';
import { shellCopy } from '../../src/core/content/copy';

test('built shell explains the Friday objective', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.ok()).toBe(true);
  await expect(
    page.getByRole('heading', { name: shellCopy.title }),
  ).toBeVisible();
  await expect(
    page.getByText(shellCopy.objective, { exact: true }),
  ).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('shell has no horizontal overflow at 320 pixels with reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: shellCopy.title }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
});
