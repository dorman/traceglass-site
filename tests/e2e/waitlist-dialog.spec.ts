// @polsia:user-owned — shared waitlist dialog regression journey.
import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { baseURL } from './support/auth-fixture';

function route(path: string) {
  return new URL(path, baseURL).toString();
}

test('public pages hide GitHub engine links and share one waitlist dialog', async ({ page }) => {
  test.setTimeout(90_000);

  for (const path of ['/', '/install', '/release', '/signatures', '/waitlist', '/demo/'] as const) {
    await page.setViewportSize({ width: 390, height: 850 });
    await page.goto(route(path));
    await expect(page.locator('a[href*="github.com/dorman"]')).toHaveCount(0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBe(true);
  }

  await page.setViewportSize({ width: 1280, height: 850 });
  await page.goto(route('/'));
  await expect(page.getByRole('button', { name: 'Join the waitlist' }).first()).toBeVisible();
  await expect(page.locator('a[href*="github.com/dorman"]')).toHaveCount(0);

  await page.getByRole('button', { name: 'Join the waitlist' }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('local-first log triage');
  await expect(dialog).toContainText('not early access');
  await expect(dialog).not.toContainText(/grammarly/i);

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);

  await page.getByRole('button', { name: 'Notify me' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  const guestEmail = `dialog-${randomUUID()}@example.test`;
  await page.getByRole('dialog').getByLabel('Email address').fill(guestEmail);
  await page.getByRole('dialog').getByRole('checkbox').check();
  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      new URL(response.url()).pathname === '/api/waitlist',
  );
  await page.getByRole('dialog').getByRole('button', { name: 'Join the waitlist' }).click();
  const response = await responsePromise;
  const requestBody = response.request().postDataJSON() as {
    email?: string;
    consent?: boolean;
    company?: string;
    headlineVariant?: string;
  };
  expect(requestBody.email).toBe(guestEmail);
  expect(requestBody.consent).toBe(true);
  expect(requestBody.company ?? '').toBe('');
  expect(['A', 'B']).toContain(requestBody.headlineVariant);

  if (response.status() === 201) {
    await expect(
      page.getByRole('dialog').locator('output').getByText("You're on the list.", { exact: true }),
    ).toBeVisible();
  } else {
    expect(response.status()).toBe(503);
    await expect(
      page
        .getByRole('dialog')
        .getByText('Waitlist signup is temporarily unavailable. Please try again later.'),
    ).toBeVisible();
  }

  await page.setViewportSize({ width: 390, height: 850 });
  await page.goto(route('/install'));
  await expect(page.locator('body')).toContainText(/coming soon/i);
  await expect(page.locator('a[href*="github.com/dorman"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Join the waitlist' }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  ).toBe(true);
});
