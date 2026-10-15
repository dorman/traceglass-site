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
    await expect(page.getByRole('heading', { name: 'Local-first log triage.' })).toBeVisible();
    await expect(page.getByText('L2 (second-line) support specialists')).toBeVisible();
    await expect(
      page.getByText('Your logs are processed on your machine and never uploaded.').first(),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'When it launches' })).toBeVisible();
    await expect(page.getByText('Copyright (c) 2026 TraceGlass')).toBeVisible();
    await expect(page.locator('footer')).toContainText('© 2026 TraceGlass');
    await expect(page.locator('a[href*="github.com/dorman"]')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText(/grammarly|early access|trust line/i);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBe(true);

    await page.goto(route('/contact'));
    await expect(page.getByRole('heading', { name: 'Get in touch.' })).toBeVisible();
    await expect(
      page.getByText("Please don't paste logs or sensitive data into this form."),
    ).toBeVisible();
    await expect(
      page.getByText("We'll only use your email to reply to this message."),
    ).toBeVisible();
    await expect(page.getByRole('checkbox')).toHaveCount(0);
    await expect(page.getByText(/Security reports: please use this form/i)).toBeVisible();
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

  // Footer links resolve.
  await page.goto(route('/about'));
  const footer = page.locator('footer');
  await expect(footer.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
  await expect(footer.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact');
  await expect(footer.getByRole('link', { name: 'Release notes' })).toHaveAttribute(
    'href',
    '/release',
  );
  await expect(footer.getByRole('link', { name: 'Signatures' })).toHaveAttribute(
    'href',
    '/signatures',
  );

  // Contact form client validation (no network).
  await page.goto(route('/contact'));
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText('Email is required.')).toBeVisible();
  await expect(page.getByText('Please choose a topic.')).toBeVisible();
  await expect(page.getByText('Message is required.')).toBeVisible();

  await page.getByRole('textbox', { name: 'Email' }).fill('not-an-email');
  await page.getByRole('combobox', { name: 'Topic' }).click();
  await page.getByRole('option', { name: 'Support' }).click();
  await page.getByRole('textbox', { name: 'Message' }).fill('Hello');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText('Please enter a valid email address.')).toBeVisible();

  // Labels / a11y basics.
  await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Message' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: /Name/ })).toBeVisible();

  // Network / 503 error state.
  await page.route('**/api/contact', async (routeHandle) => {
    await routeHandle.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({
        errors: {
          form: 'Contact is temporarily unavailable. Please try again later.',
        },
      }),
    });
  });
  await page.getByRole('textbox', { name: 'Email' }).fill('friend@example.test');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(
    page.getByText('Contact is temporarily unavailable. Please try again later.'),
  ).toBeVisible();

  // Success path with mocked API.
  await page.unroute('**/api/contact');
  await page.route('**/api/contact', async (routeHandle) => {
    await routeHandle.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.locator('output')).toContainText('Message sent.');
  await expect(page.getByText(/Thanks — we received your note/i)).toBeVisible();
  await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);
});

test('header and footer links resolve to real pages', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(route('/'));

  const paths = ['/about', '/contact', '/waitlist', '/release', '/signatures', '/install', '/demo'];
  for (const path of paths) {
    const response = await page.request.get(route(path));
    expect(response.status(), `${path} should not 404`).toBeLessThan(400);
  }

  // Footer link navigation smoke.
  for (const label of ['Release notes', 'Signatures', 'About', 'Contact', 'Install'] as const) {
    await page.goto(route('/about'));
    await page.locator('footer').getByRole('link', { name: label }).click();
    await expect(page).not.toHaveURL(/404/);
    expect(page.url()).not.toMatch(/\/_not-found/);
  }
});
