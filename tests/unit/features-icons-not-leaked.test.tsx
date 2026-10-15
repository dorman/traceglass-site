import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { MarketingPageRenderer } from '@/components/custom/marketing/marketing-page-renderer';
import { getDefaultMarketingPageContent } from '@/lib/marketing-page-content';

vi.mock('@/components/custom/brand-mark', () => ({
  BrandMark: () => createElement('span', { 'data-testid': 'brand-mark' }),
}));

vi.mock('@/components/custom/marketing/sample-log-demo', () => ({
  SampleLogDemo: () => createElement('div', { 'data-testid': 'sample-log' }),
}));

const LEAKED_ICON_IDS = [
  'terminal',
  'list-checks',
  'palette',
  'shield-alert',
  'package',
  'lock',
] as const;

describe('Features cards do not leak icon ids as visitor copy', () => {
  it('renders Lucide glyphs instead of icon id badge text for default home features', () => {
    const content = getDefaultMarketingPageContent('home');
    const features = content.sections.find((section) => section.id === 'features');
    expect(features).toBeTruthy();
    const iconIds = (features?.data.items as { icon?: string }[] | undefined)?.map(
      (item) => item.icon,
    );
    expect(iconIds).toEqual([...LEAKED_ICON_IDS]);

    const html = renderToStaticMarkup(
      createElement(MarketingPageRenderer, {
        page: {
          title: 'TraceGlass',
          seoDescription: 'test',
          sourceKey: 'home',
          content,
        },
      }),
    );

    for (const id of LEAKED_ICON_IDS) {
      // Must not appear as a text node inside a badge/chip (">terminal<" etc.).
      expect(html).not.toMatch(new RegExp(`>[\\s]*${id}[\\s]*<`, 'i'));
    }
    // Icons are SVG, not the id string.
    expect(html).toMatch(/lucide-terminal/);
    expect(html).toMatch(/lucide-list-checks/);
    expect(html).toMatch(/lucide-palette/);
  });
});
