import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';
import {
  interfaceCopy as copy,
  disabledReasons,
} from '../../src/core/content/lunch/copy';
import { event as nomination } from '../../src/core/content/lunch/events/nominate-cuisine';
import { event as quickAgreement } from '../../src/core/content/lunch/events/quick-agreement';
import {
  branchFixture,
  menuFixture,
  nominationFixture,
} from '../fixtures/lunch/data';
import type { FixtureTurn } from '../fixtures/lunch/types';

const fixtureUrl = 'http://127.0.0.1:4174/tests/fixtures/lunch/';
const thaiNomination = nomination.responses.find(({ id }) => id === 'thai');
const thaiOutcome = thaiNomination?.outcomes[0];
const quickResponse = quickAgreement.responses.find(
  ({ id }) => id === 'refocus',
);
const invitePat = quickAgreement.responses.find(({ id }) => id === 'invite');
if (!thaiNomination || !thaiOutcome || !quickResponse || !invitePat) {
  throw new Error('Lunch fixture response missing from approved content');
}

async function openFixture(
  page: Page,
  data: FixtureTurn,
  reducedMotion = true,
) {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({
    reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
  });
  await page.route(fixtureUrl + 'data.json', (route) =>
    route.fulfill({ json: data }),
  );
  await page.goto(fixtureUrl);
  await expect(page.getByRole('button', { name: copy.start })).toBeFocused();
}

async function fits(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    320,
  );
  for (const button of await page.getByRole('button').all()) {
    const bounds = await button.boundingBox();
    expect(bounds?.width).toBeGreaterThanOrEqual(44);
    expect(bounds?.height).toBeGreaterThanOrEqual(44);
  }
}

function dialogue(page: Page) {
  return page.locator('.dialogue');
}

function liveLine(page: Page) {
  return dialogue(page).locator('[aria-live="polite"]');
}

test('320 px title and nomination with skip, keyboard focus and a single live update per beat', async ({
  page,
}, testInfo) => {
  await openFixture(page, nominationFixture(), false);
  await expect(page.getByText(copy.objective, { exact: true })).toBeVisible();
  await fits(page);
  await testInfo.attach('lunch-title-320', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });

  await page.keyboard.press('Enter');
  const showChoices = page.getByRole('button', { name: copy['show-choices'] });
  await expect(showChoices).toBeFocused();
  await fits(page);
  await expect(liveLine(page)).toHaveAttribute('aria-atomic', 'true');
  await expect(liveLine(page)).toHaveText(nomination.line);
  const announced = await liveLine(page).locator('p').elementHandle();
  await expect(dialogue(page).locator('p[aria-hidden="true"]')).not.toHaveText(
    nomination.line,
  );

  await page.keyboard.press('3');
  await expect(showChoices).toBeFocused();
  await page.keyboard.down('Enter');
  await page.keyboard.down('Enter');
  await page.keyboard.up('Enter');
  const italian = page.getByRole('button', { name: 'Suggest Italian' });
  const thai = page.getByRole('button', { name: 'Suggest Thai' });
  await expect(italian).toBeFocused();
  await expect(thai).toHaveAccessibleDescription(thaiNomination.description);
  await expect(thai).toHaveAttribute('aria-keyshortcuts', '3');
  await expect(dialogue(page).locator('p[aria-hidden="true"]')).toHaveText(
    nomination.line,
  );
  expect(await announced?.evaluate((node) => node.isConnected)).toBe(true);

  const roster = page.getByRole('region', { name: copy.roster });
  await expect(roster.getByRole('listitem')).toHaveCount(6);
  await expect(roster.locator('button, a, [tabindex]')).toHaveCount(0);
  await expect(
    page.getByText(copy['considering-empty'], { exact: true }),
  ).toBeVisible();
  await fits(page);
  await testInfo.attach('lunch-choices-320', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });

  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('button', { name: 'Suggest Mexican' }),
  ).toBeFocused();
  await page.keyboard.down('3');
  await page.keyboard.down('3');
  await page.keyboard.up('3');
  await expect(liveLine(page)).toHaveText(thaiOutcome.line);
  const proceed = page.getByRole('button', {
    name: copy.continue,
    exact: true,
  });
  await expect(proceed).toBeFocused();
  await expect(
    page.getByRole('button', { name: copy['call-it'] }),
  ).toBeDisabled();
  await expect(
    page.getByText('Considering: Thai', { exact: true }),
  ).toBeVisible();
  await fits(page);

  await page.keyboard.down('Enter');
  await page.keyboard.down('Enter');
  await page.keyboard.up('Enter');
  await expect(showChoices).toBeFocused();
  // Let the next line complete without skipping it.
  await expect(showChoices).toHaveCount(0);
  await expect(page.getByRole('button', { name: copy.continue })).toHaveCount(
    0,
  );
});

test('double-clicks cannot activate the next beat’s button', async ({
  page,
}) => {
  const data = nominationFixture();
  const italian = data.outcomes.find(
    ({ responseId }) => responseId === 'italian',
  );
  const next = italian?.next;
  if (italian === undefined || next == null || !('frame' in next)) {
    throw new Error('Expected the Italian nomination followed by a draw');
  }
  await openFixture(page, data, false);
  // Keep the buttons in the same slot so each second click hits the replacement.
  await page.addStyleTag({ content: '.dialogue { min-height: 10rem; }' });
  const repeatTargets = await page.evaluateHandle(() => {
    const targets: string[] = [];
    document.addEventListener(
      'click',
      ({ detail, target }) => {
        if (detail === 2 && target instanceof Element) {
          targets.push(target.closest('button')?.textContent?.trim() ?? '');
        }
      },
      true,
    );
    return targets;
  });
  const gesture = { position: { x: 12, y: 12 }, delay: 80 };
  const showChoices = page.getByRole('button', { name: copy['show-choices'] });
  const suggestItalian = page.getByRole('button', { name: 'Suggest Italian' });
  const proceed = page.getByRole('button', { name: copy.continue });

  await page.getByRole('button', { name: copy.start }).click();
  await showChoices.click();
  await suggestItalian.dblclick(gesture);
  await expect(proceed).toBeVisible();
  await expect(liveLine(page)).toHaveText(italian.frame.line);
  expect(await repeatTargets.jsonValue()).toEqual([copy.continue]);

  await proceed.dblclick(gesture);
  await expect(showChoices).toBeVisible();
  await expect(liveLine(page)).toHaveText(
    next.frame.line.replace('{cuisine}', 'Italian'),
  );
  await expect(suggestItalian).toHaveCount(0);
  expect(await repeatTargets.jsonValue()).toEqual([
    copy.continue,
    copy['show-choices'],
  ]);
});

for (const { seed, cuisine, name, branch } of [
  { seed: 'l07-a', cuisine: 'thai', name: 'Thai', branch: 'momentum' },
  { seed: 'l07-a', cuisine: 'mexican', name: 'Mexican', branch: 'momentum' },
  { seed: 'l07-b', cuisine: 'thai', name: 'Thai', branch: 'objections' },
] as const) {
  test(`320 px ${branch} branch for ${name} with reduced motion`, async ({
    page,
    hasTouch,
  }, testInfo) => {
    const data = branchFixture(seed, cuisine);
    await openFixture(page, data);
    await page.keyboard.press('Enter');
    const response = quickResponse;
    const choice = page.getByRole('button', {
      name: response.label,
      exact: true,
    });
    await expect(choice).toBeFocused();
    await expect(choice).toHaveAccessibleDescription(response.description);
    await expect(choice).toHaveAccessibleName(response.label);
    await expect(dialogue(page).locator('p[aria-hidden="true"]')).toHaveText(
      quickAgreement.line.replace('{cuisine}', name),
    );
    await expect(
      page.getByText(`Considering: ${name}`, { exact: true }),
    ).toBeVisible();
    await expect(page.locator('.lunch-meter span')).toHaveCSS(
      'transition-property',
      'none',
    );
    const invite = invitePat;
    const disabled = page.getByRole('button', {
      name: invite.label,
      exact: true,
    });
    await expect(disabled).toBeDisabled();
    await expect(disabled).toHaveAccessibleDescription(
      `${invite.description} ${disabledReasons['pat-present']}`,
    );
    await page.keyboard.press('3');
    await expect(choice).toBeFocused();
    await expect(page.getByRole('button', { name: copy.continue })).toHaveCount(
      0,
    );
    await expect(page.getByRole('button', { name: /release/i })).toHaveCount(0);
    await expect(page.getByText(/open risks/i)).toHaveCount(0);
    await expect(page.getByText('Pat', { exact: true })).toBeVisible();
    await fits(page);

    if (hasTouch) await choice.tap();
    else await choice.click();
    const outcome = response.outcomes.find((entry) => entry.id === branch);
    if (outcome === undefined)
      throw new Error('Missing expected authored branch');
    const outcomeLine = outcome.line.replace('{cuisine}', name);
    await expect(
      liveLine(page).getByText(outcomeLine, { exact: true }),
    ).toHaveCount(1);
    await expect(
      dialogue(page).locator('p[aria-hidden="true"]').first(),
    ).toHaveText(outcomeLine);
    if (branch === 'momentum') {
      await expect(
        liveLine(page).getByText(
          `${name} is agreed. You may now close the meeting about having lunch.`,
          { exact: true },
        ),
      ).toHaveCount(1);
    }
    await expect(
      page.locator('.lunch-stats dd [aria-hidden="true"]').last(),
    ).toHaveText(branch === 'momentum' ? '$5,850' : '$6,317');
    const proceed = page.getByRole('button', {
      name: copy.continue,
      exact: true,
    });
    await expect(proceed).toBeFocused();
    await fits(page);
    await testInfo.attach(`lunch-${branch}-${cuisine}-outcome-320`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('heading', { name: copy.results }),
    ).toBeFocused();
    if (branch === 'momentum') {
      await expect(
        page.getByRole('heading', { name: 'Lunch Is Settled', exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole('heading', { name: `Agreed: ${name}` }),
      ).toBeVisible();
      await expect(
        page.getByText(
          `Everyone agreed on ${name}. You may put the marker down.`,
          { exact: true },
        ),
      ).toBeVisible();
      await expect(
        page.getByText(`Everyone present agreed on ${name}.`, { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText(
          `Everyone present agrees on ${name}. Please let the next conversation be over lunch.`,
          { exact: true },
        ),
      ).toBeVisible();
    } else {
      await expect(
        page.getByRole('heading', { name: 'Calendar Criminal', exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText(
          'The booking ended before the discussion did. The next team brought witnesses.',
          { exact: true },
        ),
      ).toBeVisible();
      await expect(
        page.getByRole('heading', { name: copy['failure-result'] }),
      ).toBeVisible();
      await expect(
        page.getByText(copy['ended-time-expired'], { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText(`Suggested: ${name}. Not agreed.`, { exact: true }),
      ).toBeVisible();
      await expect(page.getByText(/^Agreed:/)).toHaveCount(0);
    }
    await expect(
      page.getByText(copy['choices-explanation'], { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(copy['peak-headcount'], { exact: true }),
    ).toBeVisible();
    await fits(page);
    await testInfo.attach(`lunch-${branch}-${cuisine}-results-320`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: copy.replay })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: copy.start })).toBeFocused();
  });
}

test('invitation updates the passive roster and Call it uses the first arrival', async ({
  page,
}) => {
  await openFixture(page, menuFixture());
  await page.getByRole('button', { name: copy.start }).click();
  const roster = page.getByRole('region', { name: copy.roster });
  await expect(roster.getByRole('listitem')).toHaveCount(6);
  await page.getByRole('button', { name: 'Ask Alex to join' }).click();
  await expect(roster.getByRole('listitem')).toHaveCount(7);
  await expect(roster.getByText('Alex', { exact: true })).toBeVisible();
  await expect(roster.locator('button, a, [tabindex]')).toHaveCount(0);
  await fits(page);
  await page.getByRole('button', { name: copy.continue }).click();
  const callIt = page.getByRole('button', { name: copy['call-it'] });
  await expect(callIt).toHaveAccessibleDescription(copy['call-it-description']);
  await callIt.focus();
  await page.keyboard.press('Enter');
  await expect(
    page.getByText(copy['ended-called-early'], { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      'Alex joined at minute 6. The discussion now has another participant.',
      { exact: true },
    ),
  ).toBeVisible();
  await fits(page);
});

for (const ending of ['decision', 'time-expired'] as const) {
  test(`result without an earned title uses the ${ending} heading`, async ({
    page,
  }) => {
    const data = branchFixture(
      ending === 'decision' ? 'l07-a' : 'l07-b',
      'thai',
    );
    const outcome = data.outcomes.find(
      ({ responseId }) => responseId === 'refocus',
    );
    const result = outcome?.next;
    if (
      outcome === undefined ||
      result == null ||
      'frame' in result ||
      result.ending !== ending
    ) {
      throw new Error('Expected the requested terminal branch');
    }
    await openFixture(page, {
      ...data,
      outcomes: [{ ...outcome, next: { ...result, titleId: null } }],
    });
    await page.getByRole('button', { name: copy.start }).click();
    await page.getByRole('button', { name: quickResponse.label }).click();
    await page.getByRole('button', { name: copy.continue }).click();
    await expect(
      page.getByRole('heading', {
        name:
          ending === 'decision'
            ? 'Agreed: Thai'
            : copy['fallback-failure-heading'],
        exact: true,
        level: 2,
      }),
    ).toBeVisible();
    await fits(page);
  });
}

test('Call it before nomination shows cancellation and no cuisine', async ({
  page,
}) => {
  await openFixture(page, nominationFixture());
  await page.getByRole('button', { name: copy.start }).click();
  await page.getByRole('button', { name: copy['call-it'] }).click();
  await expect(
    page.getByText(copy['ended-cancelled'], { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(copy['failure-no-nomination'], { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/^Agreed:/)).toHaveCount(0);
  await fits(page);
});
