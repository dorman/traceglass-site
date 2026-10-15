// @polsia:user-owned — /about and /contact marketing pages.
import { expect, test } from '@playwright/test';
import { baseURL } from './support/auth-fixture';

function route(path: string) {
  return new URL(path, baseURL).toString();
}

test('about and contact pages render, validate, and stay accessible', async ({ page }) => {
  test.setTimeout(90_000);

  for (const width of [1280, 390] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route('/about'));
    await expect(
      page.getByRole('heading', { name: 'Local-first log triage for L2 support.' }),
    ).toBeVisible();
    await expect(page.getByText('0 log bytes uploaded')).toBeVisible();
    await expect(page.getByText('Copyright (c) 2026 TraceGlass')).toBeVisible();
    await expect(page.locator('a[href*="github.com/dorman"]')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText(/grammarly|early access/i);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBe(true);

    await page.goto(route('/contact'));
    await expect(page.getByRole('heading', { name: 'Get in touch.' })).toBeVisible();
    await expect(
      page.getByText("Please don't paste logs or sensitive data into this form."),
    ).toBeVisible();
    await expect(page.getByText(/Security report/i).first()).toBeVisible();
    await expect(page.locator('a[href*="github.com/dorman"]')).toHaveCount(0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBe(true);
  }

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(route('/about'));
  await page.getByRole('button', { name: 'Join the waitlist' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole('heading', { name: 'Get one email when TraceGlass launches' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);

  // Footer links on both routes.
  await page.goto(route('/about'));
  const footer = page.getByRole('contentinfo').or(page.locator('footer'));
  await expect(footer.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
  await expect(footer.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact');

  // Contact form client validation (no network).
  await page.goto(route('/contact'));
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText('Email is required.')).toBeVisible();
  await expect(page.getByText('Please choose a topic.')).toBeVisible();
  await expect(page.getByText('Message is required.')).toBeVisible();
  await expect(page.getByText('Please confirm you want us to receive this message.')).toBeVisible();

  // Labels / a11y basics.
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Message')).toBeVisible();
  await expect(page.getByLabel(/Name/)).toBeVisible();

  // Success path with mocked API.
  await page.route('**/api/contact', async (routeHandle) => {
    await routeHandle.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.getByLabel('Email').fill('friend@example.test');
  await page.getByLabel('Topic').click();
  await page.getByRole('option', { name: 'Support' }).click();
  await page.getByLabel('Message').fill('Need a hand with the waitlist dialog.');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Send message' }).click();

  const success = page.getByRole('status').or(page.locator('output'));
  await expect(success).toContainText('Message sent.');
  await expect(page.getByText(/Thanks — we received your note/i)).toBeVisible();
  // Inline confirmation only — no toast stack.
  await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);
});
