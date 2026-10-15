import { describe, expect, it } from 'vitest';
import { brandVisual, siteDescription, siteName } from '@/lib/brand';
import { installCatalog } from '@/lib/install-catalog';
import { getDefaultMarketingPageContent } from '@/lib/marketing-page-content';
import { existingMarketingPages } from '@/lib/marketing-page-registry';
import { navItems } from '@/lib/nav';
import { signalTheme } from '@/lib/signal-theme';

const technicalKeys = new Set([
  'command',
  'docsUrl',
  'downloadUrl',
  'href',
  'installerName',
  'prompt',
  'ref',
  'signingKeyId',
]);

function collectPublicText(value: unknown, key = ''): string[] {
  if (typeof value === 'string') return technicalKeys.has(key) ? [] : [value];
  if (Array.isArray(value)) return value.flatMap((item) => collectPublicText(item));
  if (typeof value !== 'object' || value === null) return [];
  return Object.entries(value).flatMap(([entryKey, entryValue]) =>
    collectPublicText(entryValue, entryKey),
  );
}

describe('TraceGlass branding', () => {
  it('keeps Signal teal for browser and PWA chrome', () => {
    expect(brandVisual.themeColor).toBe(signalTheme.accent);
  });

  it('uses the exact product name in brand and public labels', () => {
    const visibleCopy = collectPublicText([
      siteName,
      siteDescription,
      navItems.map(({ label }) => label),
      existingMarketingPages.map(({ title, body, seoDescription, content }) => ({
        title,
        body,
        seoDescription,
        content,
      })),
    ]).join(' ');

    expect(siteName).toBe('TraceGlass');
    expect(visibleCopy).toContain('TraceGlass');
    expect(visibleCopy).not.toMatch(/\b(loglens|logsift)\b/i);
    expect(visibleCopy.toLowerCase()).not.toContain('grammarly');
  });

  it('keeps the home focused on log review and removes retired pricing claims', () => {
    const home = getDefaultMarketingPageContent('home');
    const sections = home.sections.map((section) => section.id);
    const homeCopy = JSON.stringify(home).toLowerCase();

    expect(sections).toEqual(['hero', 'features', 'use-cases', 'workflow', 'privacy', 'faq']);
    expect(home.sections[0]?.data.heading).toBe('Local-first log triage.');
    expect(homeCopy).not.toContain('pricing');
    expect(homeCopy).not.toContain('$12');
    expect(homeCopy).not.toContain('read the signal. ignore the noise.');
    expect(existingMarketingPages.find((page) => page.sourceKey === 'home')?.title).toBe(
      'TraceGlass',
    );
    expect(getDefaultMarketingPageContent('billing').sections).toEqual([]);
    expect(navItems.some((item) => item.href === '/#pricing' || item.href === '/billing')).toBe(
      false,
    );
    expect(homeCopy).toContain('local watchlist');
    expect(homeCopy).toContain('curated built-in signatures');
    expect(homeCopy).toContain('no network');
    expect(homeCopy).toContain('user-controlled');
    expect(homeCopy).toContain('l2 (second-line) support specialists');
    expect(homeCopy).toContain('support specialists who already know');
    expect(homeCopy).toContain('questions support specialists ask');
    expect(homeCopy).not.toContain('built for the developer');
    expect(homeCopy).not.toContain('questions a developer asks');
    expect(siteDescription.toLowerCase()).toContain('support specialists');
    expect(brandVisual.og.tagline.toLowerCase()).toContain('support specialists');
  });

  it('states the target launch date without claiming the installer is published', () => {
    const waitlist = getDefaultMarketingPageContent('waitlist');
    const waitlistCopy = JSON.stringify(waitlist);
    const installCopy = JSON.stringify(getDefaultMarketingPageContent('install'));
    const registryWaitlist = existingMarketingPages.find((page) => page.sourceKey === 'waitlist');

    expect(waitlistCopy).toContain('Get one email when TraceGlass launches.');
    expect(waitlistCopy).toContain('mid-November');
    expect(waitlistCopy).toContain('not early access');
    expect(waitlistCopy).not.toMatch(/\$\s*\d/);
    expect(waitlistCopy).not.toMatch(/subscribe via stripe|subscribe to pro|subscribe now/i);
    expect(waitlistCopy.toLowerCase()).not.toContain('grammarly');
    expect(registryWaitlist?.body).toContain('launch waitlist');
    expect(registryWaitlist?.seoDescription).toContain('mid-November');
    expect(navItems.some((item) => item.href === '/pricing')).toBe(false);
    expect(navItems.some((item) => /github\.com/i.test(item.href))).toBe(false);
    expect(installCopy).toContain('Join the waitlist');
    expect(installCopy).not.toMatch(/github\.com\/dorman/i);
    expect(installCatalog.releases.releaseStatus).toBe('unpublished');
    expect(
      installCatalog.releases.platforms.every(
        (platform) => platform.availability === 'unavailable',
      ),
    ).toBe(true);
  });
});
