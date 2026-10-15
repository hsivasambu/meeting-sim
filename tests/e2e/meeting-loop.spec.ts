import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';
import {
  meetingCopy,
  shellCopy,
  disabledReasons,
  releaseReasons,
} from '../../src/core/content/copy';
import { attendees } from '../../src/core/content/attendees';
import {
  initialState,
  drawEvent,
  previewResponse,
  resolve,
  formatCost,
  score,
} from '../../src/core/engine/index';

async function openMeeting(
  page: Page,
  mode: 'keyboard' | 'pointer' = 'pointer',
) {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.addInitScript(() => {
    Object.defineProperty(window.crypto, 'getRandomValues', {
      value: (bytes: Uint8Array) => {
        bytes.fill(0);
        return bytes;
      },
    });
  });
  await page.goto('/');
  await expect(
    page.getByText(shellCopy.objective, { exact: true }),
  ).toBeVisible();
  const start = page.getByRole('button', {
    name: meetingCopy.start,
    exact: true,
  });
  if (mode === 'keyboard') {
    await expect(start).toBeFocused();
    await page.keyboard.press('Enter');
  } else await start.click();
  await expect(
    page.getByRole('heading', { name: meetingCopy.meeting }),
  ).toBeVisible();
}

async function fits(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
  for (const button of await page.getByRole('button').all()) {
    const bounds = await button.boundingBox();
    expect(bounds?.width).toBeGreaterThanOrEqual(44);
    expect(bounds?.height).toBeGreaterThanOrEqual(44);
  }
}

for (const mode of ['keyboard', 'pointer'] as const) {
  test(`320px ${mode} meeting resolves to results and replays`, async ({
    page,
  }, testInfo) => {
    await openMeeting(page, mode);
    let game = drawEvent(initialState('0000000000000000'));
    let turns = 0;
    while (game.phase === 'running') {
      expect(turns).toBeLessThan(50);
      const current = game.current;
      if (current === null) throw new Error('Expected a pending event');
      await expect(page.locator('.dialogue [aria-live]')).toHaveText(
        current.line,
      );
      await expect(
        page.getByRole('button', {
          name: meetingCopy.showChoices,
          exact: true,
        }),
      ).toBeFocused();
      // Number keys do nothing during speaking; held Enter cannot cross beats.
      await page.keyboard.press('1');
      if (mode === 'keyboard') {
        await page.keyboard.down('Enter');
        await page.keyboard.down('Enter');
        await page.keyboard.up('Enter');
      } else {
        const reveal = page.getByRole('button', {
          name: meetingCopy.showChoices,
          exact: true,
        });
        if (testInfo.project.use.hasTouch) await reveal.tap();
        else await reveal.click();
      }
      const response = current.responses.find(
        (item) => previewResponse(game, item).enabled,
      );
      if (response === undefined)
        throw new Error('Expected an enabled response');
      const choice = page.getByRole('button', {
        name: `${current.responses.indexOf(response) + 1}. ${response.label}`,
        exact: true,
      });
      await expect(choice).toBeFocused();
      await fits(page);
      const preview = previewResponse(game, response);
      if (!preview.enabled) throw new Error('Expected preview');
      await expect(page.locator(`#preview-${response.id}`)).toHaveText(
        `${preview.minutesDelta} min · ${preview.progressDelta} progress · ${preview.risksDelta} risks · ${formatCost(preview.personMinutesDelta)}`,
      );
      if (mode === 'keyboard')
        await page.keyboard.press(
          String(current.responses.indexOf(response) + 1),
        );
      else if (testInfo.project.use.hasTouch) await choice.tap();
      else await choice.click();
      game = resolve(game, response.id);
      const outcome = [...game.log]
        .reverse()
        .find((entry) => entry.type === 'resolve');
      if (outcome?.type !== 'resolve') throw new Error('Expected outcome');
      await expect(page.locator('.dialogue [aria-live]')).toHaveText(
        outcome.line,
      );
      const next = page.getByRole('button', {
        name: meetingCopy.continue,
        exact: true,
      });
      await expect(next).toBeFocused();
      await expect(
        page.getByRole('button', { name: meetingCopy.callIt, exact: true }),
      ).toBeDisabled();
      // Outcome waits for acknowledgement and ignores choices.
      await page.keyboard.press('1');
      await expect(next).toBeVisible();
      if (mode === 'keyboard') await page.keyboard.press('Enter');
      else if (testInfo.project.use.hasTouch) await next.tap();
      else await next.click();
      if (game.phase === 'running') game = drawEvent(game);
      turns += 1;
    }
    if (game.ending === null) throw new Error('Expected ending');
    await expect(
      page.getByRole('heading', { name: meetingCopy.results, exact: true }),
    ).toBeFocused();
    await expect(
      page.getByRole('heading', {
        name: meetingCopy.endings[game.ending],
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByText(`Score: ${score(game).total}/1000`, { exact: true }),
    ).toBeVisible();
    await fits(page);
    const replay = page.getByRole('button', { name: meetingCopy.replay });
    if (mode === 'keyboard') {
      await page.keyboard.press('Tab');
      await expect(replay).toBeFocused();
      await page.keyboard.press('Enter');
    } else await replay.click();
    await expect(
      page.getByRole('heading', { name: shellCopy.title }),
    ).toBeVisible();
    const start = page.getByRole('button', {
      name: meetingCopy.start,
      exact: true,
    });
    if (mode === 'keyboard') {
      await expect(start).toBeFocused();
      await page.keyboard.press('Enter');
    } else await start.click();
    await expect(
      page.locator('dl').getByText('0', { exact: true }).first(),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /^Gary/ })).toBeVisible();
  });
}

test('release confirms, protects owner/minimum and refreshes expert options without changing dialogue', async ({
  page,
}) => {
  await openMeeting(page);
  await page.getByRole('button', { name: /^Priya/ }).click();
  await expect(page.getByRole('status')).toHaveText(
    releaseReasons['release-owner'],
  );
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: /^Priya/ })).toBeFocused();
  const game = drawEvent(initialState('0000000000000000'));
  const current = game.current;
  if (current === null) throw new Error('Expected event');
  await page
    .getByRole('button', { name: meetingCopy.showChoices, exact: true })
    .focus();
  await page.keyboard.press('Enter');
  for (const person of attendees.filter((item) =>
    ['gary', 'jordan', 'dev', 'sam'].includes(item.id),
  )) {
    const portrait = page.getByRole('button', {
      name: new RegExp(`^${person.name}`),
    });
    await portrait.click();
    await page
      .getByRole('button', { name: meetingCopy.cancel, exact: true })
      .click();
    await expect(portrait).toBeFocused();
    await portrait.click();
    await page
      .getByRole('button', { name: meetingCopy.confirmRelease, exact: true })
      .click();
    await expect(portrait).toHaveCount(0);
    await expect(page.locator('.dialogue [aria-live]')).toHaveText(
      current.line,
    );
  }
  for (const response of current.responses.filter((item) =>
    item.requires?.present?.some((id) => ['sam', 'dev'].includes(id)),
  )) {
    await expect(
      page.getByRole('button', { name: new RegExp(response.label) }),
    ).toBeDisabled();
    const reason = Object.entries(disabledReasons).find(
      ([key]) => key === response.disabledReasonKey,
    )?.[1];
    if (reason === undefined) throw new Error('Expected authored reason');
    await expect(page.locator(`#preview-${response.id}`)).toHaveText(reason);
    await page.keyboard.press(String(current.responses.indexOf(response) + 1));
    await expect(
      page.getByRole('button', { name: meetingCopy.continue, exact: true }),
    ).toHaveCount(0);
  }
  await page.getByRole('button', { name: /^Morgan/ }).click();
  await expect(page.getByRole('status')).toHaveText(
    releaseReasons['release-minimum'],
  );
  await page
    .getByRole('button', { name: meetingCopy.cancel, exact: true })
    .click();
  await fits(page);
  await page
    .getByRole('button', { name: meetingCopy.callIt, exact: true })
    .click();
  await expect(
    page.getByRole('heading', {
      name: meetingCopy.endings.cancelled,
      exact: true,
    }),
  ).toBeVisible();
});

test('Call it after one resolution reaches called-early results', async ({
  page,
}) => {
  await openMeeting(page);
  await page.keyboard.press('Enter');
  await page.keyboard.press('1');
  await page.keyboard.press('Enter');
  await page
    .getByRole('button', { name: meetingCopy.callIt, exact: true })
    .click();
  await expect(
    page.getByRole('heading', {
      name: meetingCopy.endings['called-early'],
      exact: true,
    }),
  ).toBeVisible();
});
