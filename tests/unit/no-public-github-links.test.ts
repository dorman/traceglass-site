import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { installCatalog } from '@/lib/install-catalog';
import {
  getDefaultMarketingPageContent,
  scrubPublicGitHubLinks,
} from '@/lib/marketing-page-content';
import { existingMarketingPages } from '@/lib/marketing-page-registry';
import { navItems } from '@/lib/nav';

const GITHUB_DORMAN = /github\.com\/dorman\/traceglass/i;

describe('public site has no dorman/traceglass GitHub links', () => {
  it('keeps marketing snapshots, nav, and install catalog free of engine-repo GitHub URLs', () => {
    const publicSurfaces = [
      ...existingMarketingPages.map((page) => page.content),
      ...(['home', 'install', 'release', 'signatures', 'waitlist'] as const).map((key) =>
        getDefaultMarketingPageContent(key),
      ),
      navItems,
      installCatalog,
    ];

    for (const surface of publicSurfaces) {
      expect(JSON.stringify(surface)).not.toMatch(GITHUB_DORMAN);
    }
    expect(navItems.some((item) => /github\.com/i.test(item.href))).toBe(false);
    expect(
      navItems.some((item) => /open on github|star on github|view source/i.test(item.label)),
    ).toBe(false);
  });

  it('scrubs legacy GitHub CTAs into the shared waitlist action', () => {
    const scrubbed = scrubPublicGitHubLinks({
      version: 1,
      sections: [
        {
          id: 'hero',
          kind: 'hero',
          data: {
            links: [
              {
                label: 'Open on GitHub',
                href: 'https://github.com/dorman/traceglass',
              },
            ],
          },
          assets: [],
        },
      ],
      assets: [],
    });

    expect(scrubbed.changed).toBe(true);
    expect(JSON.stringify(scrubbed.content)).not.toMatch(GITHUB_DORMAN);
    expect(JSON.stringify(scrubbed.content)).toContain('#join-waitlist');
    expect(JSON.stringify(scrubbed.content)).toContain('Join the waitlist');
  });

  it('keeps the WASM demo HTML free of dorman/traceglass GitHub links', () => {
    for (const relative of ['web-demo/index.html', 'public/demo/index.html'] as const) {
      const html = readFileSync(join(process.cwd(), relative), 'utf8');
      expect(html).not.toMatch(GITHUB_DORMAN);
      expect(html).toContain('Join the waitlist');
      expect(html).toContain('href="/waitlist"');
    }
  });
});
