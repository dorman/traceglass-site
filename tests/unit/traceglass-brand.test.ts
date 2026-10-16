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

  it('keeps the home focused on CI log triage and removes retired claims', () => {
    const home = getDefaultMarketingPageContent('home');
    const sections = home.sections.map((section) => section.id);
    const homeCopy = JSON.stringify(home).toLowerCase();

    expect(sections).toEqual(['hero', 'features', 'privacy', 'faq', 'waitlist-cta']);
    expect(home.sections[0]?.data.heading).toBe('Start at the first error candidate.');
    expect(home.sections.find((section) => section.id === 'features')?.data.heading).toBe(
      'Built for whoever gets the red build.',
    );
    expect(homeCopy).not.toContain('already knows what they');
    expect(homeCopy).not.toContain('pricing');
    expect(homeCopy).not.toContain('$12');
    expect(existingMarketingPages.find((page) => page.sourceKey === 'home')?.title).toBe(
      'TraceGlass',
    );
    expect(homeCopy).toContain('first error candidate');
    expect(homeCopy).toContain('github actions');
    expect(homeCopy).toContain("hear when it's ready");
    expect(homeCopy).not.toContain('early access');
    expect(homeCopy).not.toContain('mid-november');
    expect(homeCopy).not.toContain('support specialists');
    expect(homeCopy).not.toContain('try in browser');
    expect(homeCopy).not.toContain('splunk');
    expect(homeCopy).not.toContain('signature catalog');
    expect(homeCopy).not.toContain('no analytics');
    expect(siteDescription.toLowerCase()).toContain('ci log triage');
    expect(brandVisual.og.tagline.toLowerCase()).toContain('ci log triage');
    expect(navItems.some((item) => item.href === '/demo')).toBe(false);
    expect(navItems.some((item) => item.label === 'Try in browser')).toBe(false);
    expect(navItems.filter((item) => item.group === 'footer').map((item) => item.label)).toEqual([
      'About',
      'Contact',
      'Waitlist',
      'Privacy',
    ]);
  });

  it('states waitlist without claiming installers are published', () => {
    const waitlist = getDefaultMarketingPageContent('waitlist');
    const waitlistCopy = JSON.stringify(waitlist);
    const installCopy = JSON.stringify(getDefaultMarketingPageContent('install'));
    const registryWaitlist = existingMarketingPages.find((page) => page.sourceKey === 'waitlist');

    expect(waitlistCopy).toContain("Join the waitlist to hear when it's ready.");
    expect(waitlistCopy.toLowerCase()).not.toContain('early access');
    expect(waitlistCopy.toLowerCase()).not.toContain('mid-november');
    expect(waitlistCopy).not.toMatch(/\$\s*\d/);
    expect(registryWaitlist?.seoDescription.toLowerCase()).toContain('hear when');
    expect(navItems.some((item) => /github\.com/i.test(item.href))).toBe(false);
    expect(installCopy).toContain('Join the waitlist');
    expect(installCopy.toLowerCase()).not.toContain('try the browser demo');
    expect(installCatalog.releases.releaseStatus).toBe('unpublished');
  });
});
