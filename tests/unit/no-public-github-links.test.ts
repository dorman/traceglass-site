import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { installCatalog } from '@/lib/install-catalog';
import {
  getDefaultMarketingPageContent,
  scrubDeveloperAudienceCopy,
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

  it('keeps about and contact page sources free of engine-repo GitHub URLs', () => {
    for (const relative of [
      'src/app/(custom)/about/page.tsx',
      'src/app/(custom)/contact/page.tsx',
      'src/components/custom/about-content.tsx',
      'src/components/custom/contact-form.tsx',
    ] as const) {
      const source = readFileSync(join(process.cwd(), relative), 'utf8');
      expect(source).not.toMatch(GITHUB_DORMAN);
      expect(source).not.toMatch(/github\.com\/dorman/i);
    }
  });

  it('scrubs legacy developer-audience headings to support specialists', () => {
    const scrubbed = scrubDeveloperAudienceCopy({
      version: 1,
      sections: [
        {
          id: 'features',
          kind: 'features',
          data: {
            heading: "Built for the developer who already knows what they're looking for.",
          },
          assets: [],
        },
        {
          id: 'faq',
          kind: 'faq',
          data: {
            heading: 'Questions a developer asks before installing a CLI.',
          },
          assets: [],
        },
      ],
      assets: [],
    });

    expect(scrubbed.changed).toBe(true);
    expect(JSON.stringify(scrubbed.content)).toContain(
      "Built for support specialists who already know what they're looking for.",
    );
    expect(JSON.stringify(scrubbed.content)).toContain(
      'Questions support specialists ask before installing a CLI.',
    );
    expect(JSON.stringify(scrubbed.content)).not.toContain('the developer who');
    expect(JSON.stringify(scrubbed.content)).not.toContain('Questions a developer');
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
      expect(html).toContain('href="/#join-waitlist"');
      expect(html).not.toMatch(/View on GitHub|Open on GitHub|Star on GitHub/i);
    }
  });
});
