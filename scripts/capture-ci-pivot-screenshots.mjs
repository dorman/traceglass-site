/**
 * Capture marketing viewport screenshots for the CI-pivot draft PR.
 * Run against a local next server on :3000 (production `next start` preferred).
 */
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const OUT = '/opt/cursor/artifacts';
mkdirSync(OUT, { recursive: true });

const base = process.env.BASE_URL ?? 'http://127.0.0.1:3000';

async function shot(page, name) {
  const path = `${OUT}/${name}.png`;
  await page.screenshot({ path, fullPage: false });
  console.log('saved', path);
}

async function sectionShot(page, selector, name) {
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await el.screenshot({ path: `${OUT}/${name}.png` });
  console.log('saved', `${OUT}/${name}.png`);
}

async function captureViewport(browser, width, suffix) {
  const context = await browser.newContext({
    viewport: { width, height: width === 390 ? 844 : 900 },
    colorScheme: 'dark',
  });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });

  await shot(page, `hero_${suffix}`);
  await sectionShot(page, '#features', `features_${suffix}`);
  await sectionShot(page, '#privacy', `privacy_${suffix}`);
  await sectionShot(page, '#faq', `faq_${suffix}`);
  await page.locator('footer').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await shot(page, `footer_${suffix}`);

  // Inline waitlist empty (hero form)
  await page.goto(base, { waitUntil: 'networkidle' });
  const heroForm = page.locator('[data-hero-copy] form').first();
  await heroForm.scrollIntoViewIfNeeded();
  await heroForm.screenshot({ path: `${OUT}/waitlist_inline_empty_${suffix}.png` });
  console.log('saved', `${OUT}/waitlist_inline_empty_${suffix}.png`);

  // Unticked consent — submit enabled; clear message; no API call
  await heroForm.getByLabel('Email address').fill('consent@example.test');
  await heroForm.getByRole('checkbox').uncheck();
  await heroForm.getByRole('button', { name: 'Join the waitlist' }).click();
  await page.getByText('Please tick the box to join the waitlist.').waitFor();
  await heroForm.screenshot({ path: `${OUT}/waitlist_unticked_consent_${suffix}.png` });
  console.log('saved', `${OUT}/waitlist_unticked_consent_${suffix}.png`);

  // Invalid email (API field error)
  await heroForm.getByRole('checkbox').check();
  await page.route('**/api/waitlist', async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ errors: { email: 'Please enter a valid email address.' } }),
    });
  });
  await heroForm.getByRole('button', { name: 'Join the waitlist' }).click();
  await page.getByText('Please enter a valid email address.').waitFor();
  await heroForm.screenshot({ path: `${OUT}/waitlist_inline_invalid_${suffix}.png` });
  console.log('saved', `${OUT}/waitlist_inline_invalid_${suffix}.png`);
  await page.unroute('**/api/waitlist');

  // Inline form error under the button (503 without field errors)
  await page.reload({ waitUntil: 'networkidle' });
  const heroForm2 = page.locator('[data-hero-copy] form').first();
  await heroForm2.getByLabel('Email address').fill('ok@example.test');
  await heroForm2.getByRole('checkbox').check();
  await page.route('**/api/waitlist', async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'unavailable' }),
    });
  });
  await heroForm2.getByRole('button', { name: 'Join the waitlist' }).click();
  await page
    .getByText('Something went wrong. Please try again in a moment.')
    .waitFor({ timeout: 5000 });
  await heroForm2.screenshot({
    path: `${OUT}/waitlist_inline_error_${suffix}.png`,
  });
  console.log('saved', `${OUT}/waitlist_inline_error_${suffix}.png`);
  await page.unroute('**/api/waitlist');

  // Success
  await page.reload({ waitUntil: 'networkidle' });
  const heroForm3 = page.locator('[data-hero-copy] form').first();
  await heroForm3.getByLabel('Email address').fill('success@example.test');
  await heroForm3.getByRole('checkbox').check();
  await page.route('**/api/waitlist', async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });
  await heroForm3.getByRole('button', { name: 'Join the waitlist' }).click();
  await page.getByText("You're on the list.").waitFor();
  await page.locator('[data-hero-copy] output').screenshot({
    path: `${OUT}/waitlist_inline_success_${suffix}.png`,
  });
  console.log('saved', `${OUT}/waitlist_inline_success_${suffix}.png`);
  await page.unroute('**/api/waitlist');

  // Dialog (page without hero email — Notify me / Join opens dialog)
  await page.goto(`${base}/about`, { waitUntil: 'networkidle' });
  await shot(page, `about_${suffix}`);
  await page.getByRole('button', { name: 'Join the waitlist' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();
  await dialog.screenshot({ path: `${OUT}/waitlist_dialog_${suffix}.png` });
  console.log('saved', `${OUT}/waitlist_dialog_${suffix}.png`);
  await page.keyboard.press('Escape');

  await page.goto(`${base}/contact`, { waitUntil: 'networkidle' });
  await shot(page, `contact_${suffix}`);

  await context.close();
}

const browser = await chromium.launch();
await captureViewport(browser, 1280, 'desktop_1280');
await captureViewport(browser, 390, 'mobile_390');
await browser.close();
console.log('done');
