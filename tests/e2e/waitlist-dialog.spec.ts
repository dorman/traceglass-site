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
    await expect(
      page.getByRole('link', { name: /view on github|open on github|star on github/i }),
    ).toHaveCount(0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBe(true);
  }

  await page.setViewportSize({ width: 1280, height: 850 });
  await page.goto(route('/'));
  await expect(page.getByText('log bytes uploaded', { exact: true })).toBeVisible();
  // Hero primary CTA is an inline waitlist form (not a dialog trigger).
  await expect(page.getByRole('button', { name: 'Join the waitlist' }).first()).toBeVisible();
  await expect(page.locator('a[href*="github.com/dorman"]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Try in browser' })).toHaveCount(0);

  // On home, Notify me scrolls to and focuses the hero email field.
  const notify = page.getByRole('button', { name: 'Notify me', exact: true });
  await notify.click();
  await expect
    .poll(async () =>
      page.evaluate(() => document.activeElement?.id === 'waitlist-email-hero'),
    )
    .toBe(true);
  await expect(page.getByRole('dialog')).toHaveCount(0);

  // Dialog journey uses a page without the hero email field.
  await page.goto(route('/about'));
  await page.getByRole('button', { name: 'Join the waitlist' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole('heading', { name: 'Get one email when TraceGlass launches' }),
  ).toBeVisible();
  await expect(dialog).toContainText('WAITLIST');
  await expect(dialog).toContainText(/when it publicly launches/i);
  await expect(dialog).toContainText('Your logs are never uploaded.');
  await expect(dialog).not.toContainText(/early access/i);
  await expect(dialog).not.toContainText(/mid-november/i);
  await expect(dialog).not.toContainText(/grammarly/i);

  // Consent must be unchecked on every open (pre-checked is not real consent).
  const consent = dialog.getByRole('checkbox');
  await expect(consent).not.toBeChecked();
  // Submit stays visually enabled (full teal) even before consent is ticked.
  await expect(dialog.getByRole('button', { name: 'Join the waitlist' })).toHaveClass(
    /bg-\[color:var\(--signal-accent\)\]/,
  );

  // Focus should land inside the dialog.
  await expect
    .poll(async () =>
      page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]'))),
    )
    .toBe(true);

  // Unchecked consent: clicking submit shows an inline error without POSTing.
  let posted = false;
  page.on('request', (request) => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/waitlist') {
      posted = true;
    }
  });
  await dialog.getByLabel('Email address').fill('consent-check@example.test');
  await dialog.getByRole('button', { name: 'Join the waitlist' }).click();
  await expect(dialog.getByText('Please tick the box to join the waitlist.')).toBeVisible();
  expect(posted).toBe(false);

  // Checking consent, then closing and reopening, must reset consent to unchecked.
  await consent.check();
  await expect(consent).toBeChecked();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  // Focus returns to the trigger that opened the dialog.
  await expect
    .poll(async () =>
      page.evaluate(() => document.activeElement?.textContent?.includes('Join the waitlist') ?? false),
    )
    .toBe(true);

  await page.getByRole('button', { name: 'Join the waitlist' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('checkbox')).not.toBeChecked();

  // Backdrop / outside click closes the dialog.
  await page.mouse.click(12, 12);
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page.getByRole('button', { name: 'Join the waitlist' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('checkbox')).not.toBeChecked();

  const guestEmail = `dialog-${randomUUID()}@example.test`;
  await page.getByRole('dialog').getByLabel('Email address').fill(guestEmail);
  await page.getByRole('dialog').getByRole('checkbox').check();

  // Submit button uses Signal teal primary colors while enabled.
  const submit = page.getByRole('dialog').getByRole('button', { name: 'Join the waitlist' });
  await expect(submit).toHaveClass(/bg-\[color:var\(--signal-accent\)\]/);
  await expect(submit).toHaveClass(/text-\[#0B0F14\]/);

  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      new URL(response.url()).pathname === '/api/waitlist',
  );
  await submit.click();
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
    const success = page.getByRole('dialog').locator('output');
    await expect(success.getByText("You're on the list.", { exact: true })).toBeVisible();
    await expect(success).toContainText(
      "We'll send one email when TraceGlass is publicly available. We only keep your email for that note.",
    );
    await expect(success).not.toContainText(/You're on the launch list/i);
    // No success toast — inline state is enough.
    await expect(page.getByText("You're on the list.", { exact: true })).toHaveCount(1);
  } else {
    // Local runs without Notion → 503; repeated suite runs may hit the in-memory rate limit → 429.
    expect([503, 429]).toContain(response.status());
    await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible();
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

test('demo Try your own log CTA deep-links into the shared waitlist dialog', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 850 });
  await page.goto(route('/demo/'));
  const cta = page.locator('.after-demo').getByRole('link', { name: 'Join the waitlist' });
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute('href', '/#join-waitlist');
  await expect(page.getByRole('link', { name: /github/i })).toHaveCount(0);

  await cta.click();
  await page.waitForURL(/\/#join-waitlist|\/$/);
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('dialog')).toContainText('Your logs are never uploaded.');
});
