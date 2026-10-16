// @polsia:user-owned — public TraceGlass marketing page regression journey.
import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { PageContent, PublicPage } from '../../src/lib/contracts/pages';
import { baseURL } from './support/auth-fixture';

function route(path: string) {
  return new URL(path, baseURL).toString();
}

async function publicPageResponse(page: import('@playwright/test').Page, slug: string) {
  return page.waitForResponse((response) => {
    try {
      return new URL(response.url()).pathname === `/api/pages/${slug}`;
    } catch {
      return false;
    }
  });
}

test('public pages no longer publish the retired paid offer', async ({ page }) => {
  test.setTimeout(60_000);

  for (const width of [1280, 375]) {
    await page.setViewportSize({ width, height: 850 });
    const responsePromise = publicPageResponse(page, 'home');
    await page.goto(route('/'));
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    const home = PublicPage.parse(await response.json());

    expect(home.title).toBe('TraceGlass');
    expect(home.content.sections.map((section) => section.id)).toEqual([
      'hero',
      'features',
      'use-cases',
      'workflow',
      'privacy',
      'faq',
    ]);
    await expect(
      page.getByRole('heading', { name: 'Start at the first error candidate.' }),
    ).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Read the signal. Ignore the noise.');
    await expect(page.locator('body')).not.toContainText('$12');
    await expect(page.locator('body')).not.toContainText('Subscribe via Stripe');
    await expect(page.locator('a[href="/#pricing"]')).toHaveCount(0);
    await expect(page.locator('a[href="/billing"]')).toHaveCount(0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);

    if (width < 768) {
      // Mobile: hero copy + Install CTA must appear above the terminal.
      const heroOrder = await page.evaluate(() => {
        const copy = document.querySelector('[data-hero-copy]');
        const terminal =
          document.querySelector('[data-hero-terminal]') || document.querySelector('.signal-tui');
        const heading = document.querySelector('h1');
        if (!copy || !terminal || !heading) return { ok: false, reason: 'missing nodes' };
        const copyTop = copy.getBoundingClientRect().top;
        const termTop = terminal.getBoundingClientRect().top;
        const headingTop = heading.getBoundingClientRect().top;
        return {
          ok: headingTop < termTop && copyTop < termTop,
          copyTop,
          termTop,
          headingTop,
        };
      });
      expect(
        heroOrder.ok,
        `hero must precede terminal on mobile: ${JSON.stringify(heroOrder)}`,
      ).toBe(true);
    }
  }

  await page.setViewportSize({ width: 1280, height: 850 });
  const releaseResponsePromise = publicPageResponse(page, 'release');
  await page.goto(route('/release'));
  const releaseResponse = await releaseResponsePromise;
  expect(releaseResponse.status()).toBe(200);
  const release = PublicPage.parse(await releaseResponse.json());
  expect(release.content.sections.map((section) => section.id)).not.toContain('release-cta');
  expect(
    release.content.sections.some(
      (section) =>
        section.id === 'pricing' ||
        section.kind === 'pricing' ||
        section.id === 'billing-card' ||
        section.kind === 'billing-card',
    ),
  ).toBe(false);
  await expect(page.getByRole('button', { name: 'Notify me' })).toBeVisible();
  await expect(page.locator('a[href*="github.com/dorman"]')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText('$12');
  await expect(page.locator('body')).not.toContainText('Subscribe via Stripe');
  for (const width of [1280, 375]) {
    await page.setViewportSize({ width, height: 850 });
    // Notify me stays in the top bar at every breakpoint (not only the mobile sheet).
    await expect(page.getByRole('button', { name: 'Notify me' })).toBeVisible();
    await expect(page.locator('a[href*="github.com/dorman"]')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText(/\$\s*\d/);
    await expect(page.locator('body')).not.toContainText('Subscribe via Stripe');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }

  for (const width of [1280, 375]) {
    await page.setViewportSize({ width, height: 850 });
    const waitlistResponsePromise = publicPageResponse(page, 'waitlist');
    await page.goto(route('/waitlist'));
    const waitlistResponse = await waitlistResponsePromise;
    expect(waitlistResponse.status()).toBe(200);
    const waitlist = PublicPage.parse(await waitlistResponse.json());

    expect(JSON.stringify(waitlist)).toContain("Join the waitlist to hear when it's ready.");
    expect(JSON.stringify(waitlist).toLowerCase()).not.toContain('early access');
    expect(JSON.stringify(waitlist)).not.toMatch(/\$\s*\d/);
    expect(JSON.stringify(waitlist)).not.toMatch(/github\.com\/dorman/i);
    await expect(page.locator('body')).toContainText("Join the waitlist to hear when it's ready.");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /waitlist/i);
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Notify me when available' })).toBeVisible();
    await expect(page.locator('a[href*="github.com/dorman"]')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText(/\$\s*\d/);
    await expect(page.locator('body')).not.toContainText('Subscribe via Stripe');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }

  const billingPageResponse = await page.request.get(route('/billing'));
  const pricingPageResponse = await page.request.get(route('/pricing'));
  const billingApiResponse = await page.request.get(route('/api/pages/billing'));
  expect(billingPageResponse.status()).toBe(404);
  expect(pricingPageResponse.status()).toBe(404);
  expect(billingApiResponse.status()).toBe(404);
  const billingAliasResponse = await page.request.get(route('/pages/billing'));
  expect(billingAliasResponse.status()).toBe(200);
  await page.goto(route('/pages/billing'));
  await expect(page.getByText('Page not found', { exact: true })).toBeVisible();
  await expect(page.locator('main')).toContainText('This page is unpublished or does not exist.');

  await page.goto(route('/billing/checkout/cancelled'));
  // Checkout cancel keeps a progressive-enhancement link to the standalone waitlist page.
  await expect(page.getByRole('link', { name: 'Notify me' })).toHaveAttribute('href', '/waitlist');
  await expect(page.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/');

  // Optional DB assertions — skipped on marketing-only deploys without Postgres.
  if (process.env.DATABASE_URL?.trim()) {
    const prisma = new PrismaClient();
    try {
      const home = await prisma.marketingPage.findFirst({
        where: { OR: [{ sourceKey: 'home' }, { sourcePath: '/' }] },
        select: { title: true, content: true },
      });
      const release = await prisma.marketingPage.findFirst({
        where: { OR: [{ sourceKey: 'release' }, { sourcePath: '/release' }] },
        select: { content: true },
      });
      const billingRows = await prisma.marketingPage.findMany({
        where: { OR: [{ slug: 'billing' }, { sourceKey: 'billing' }, { sourcePath: '/billing' }] },
        select: { status: true, publishedAt: true },
      });

      expect(home?.title).toBe('TraceGlass');
      expect(
        PageContent.parse(home?.content).sections.some(
          (section) =>
            section.id === 'pricing' ||
            section.kind === 'pricing' ||
            section.id === 'billing-card' ||
            section.kind === 'billing-card',
        ),
      ).toBe(false);
      expect(
        PageContent.parse(release?.content).sections.map((section) => section.id),
      ).not.toContain('release-cta');
      expect(
        PageContent.parse(release?.content).sections.some(
          (section) =>
            section.id === 'pricing' ||
            section.kind === 'pricing' ||
            section.id === 'billing-card' ||
            section.kind === 'billing-card',
        ),
      ).toBe(false);
      expect(billingRows.every((row) => row.status === 'DRAFT' && row.publishedAt === null)).toBe(
        true,
      );
    } finally {
      await prisma.$disconnect();
    }
  }
});

test('Notify Me validates and surfaces waitlist API field errors without Postgres', async ({
  page,
}) => {
  // Persistence/duplicate/Notion coverage lives in tests/unit/waitlist-route.test.ts.
  // This journey only checks the form ↔ API error/success contract against a live server.
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 375, height: 850 });
  await page.goto(route('/waitlist'));

  await page.getByLabel('Email address').fill('not-an-email');
  await page.getByRole('checkbox').check();
  let responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      new URL(response.url()).pathname === '/api/waitlist',
  );
  await page.getByRole('button', { name: 'Notify me when available' }).click();
  expect((await responsePromise).status()).toBe(400);
  await expect(page.getByText('Please enter a valid email address.')).toBeVisible();

  const guestEmail = `notify-${randomUUID()}@example.test`;
  await page.getByLabel('Email address').fill(guestEmail);
  await page.getByRole('checkbox').uncheck();
  // Submit stays enabled (full teal); unticked consent shows an inline message and does not call the API.
  await expect(page.getByRole('button', { name: 'Notify me when available' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Notify me when available' })).not.toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await page.getByRole('button', { name: 'Notify me when available' }).click();
  await expect(page.getByText('Please tick the box to join the waitlist.')).toBeVisible();

  await page.getByRole('checkbox').check();
  responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      new URL(response.url()).pathname === '/api/waitlist',
  );
  await page.getByRole('button', { name: 'Notify me when available' }).click();
  const response = await responsePromise;
  // With Notion configured → 201 success UI; without → 503 field error (still no Postgres).
  if (response.status() === 201) {
    const success = page.locator('output');
    await expect(success.getByText("You're on the list.", { exact: true })).toBeVisible();
    await expect(success).toContainText(
      "We'll send one email when TraceGlass is publicly available. We only keep your email for that note.",
    );
    await expect(page.getByText("You're on the list.", { exact: true })).toHaveCount(1);
  } else {
    expect(response.status()).toBe(503);
    await expect(
      page.getByText('Waitlist signup is temporarily unavailable. Please try again later.'),
    ).toBeVisible();
  }
});
