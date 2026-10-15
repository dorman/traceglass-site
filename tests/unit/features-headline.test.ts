import { describe, expect, it } from 'vitest';
import {
  FEATURES_HEADING,
  getDefaultMarketingPageContent,
  normalizeMarketingPageContent,
  PREVIOUS_FEATURES_HEADING,
  rewriteFeaturesHeadline,
} from '@/lib/marketing-page-content';

describe('Features headline', () => {
  it('defaults to the approved visitor headline', () => {
    const features = getDefaultMarketingPageContent('home').sections.find(
      (section) => section.id === 'features',
    );
    expect(features?.data.heading).toBe(FEATURES_HEADING);
    expect(features?.data.body).toContain('No upload and no remote processing');
  });

  it('rewrites retired CMS Features headings without changing the body', () => {
    const home = getDefaultMarketingPageContent('home');
    const bodyBefore = home.sections.find((s) => s.id === 'features')?.data.body;
    for (const previous of [
      PREVIOUS_FEATURES_HEADING,
      "Built for support specialists who already know what they're looking for.",
    ]) {
      const withOld = {
        ...home,
        sections: home.sections.map((section) =>
          section.id === 'features'
            ? {
                ...section,
                data: { ...section.data, heading: previous },
              }
            : section,
        ),
      };
      const { content, changed } = rewriteFeaturesHeadline(withOld);
      expect(changed).toBe(true);
      const features = (content as typeof home).sections.find((s) => s.id === 'features');
      expect(features?.data.heading).toBe(FEATURES_HEADING);
      expect(features?.data.body).toBe(bodyBefore);
    }
  });

  it('normalizes DB-shaped content that still carries the retired headline', () => {
    const home = getDefaultMarketingPageContent('home');
    const normalized = normalizeMarketingPageContent({
      title: 'TraceGlass',
      body: '',
      sourceKey: 'home',
      content: {
        ...home,
        sections: home.sections.map((section) =>
          section.id === 'features'
            ? {
                ...section,
                data: { ...section.data, heading: PREVIOUS_FEATURES_HEADING },
              }
            : section,
        ),
      },
    });
    expect(normalized.sections.find((s) => s.id === 'features')?.data.heading).toBe(
      FEATURES_HEADING,
    );
  });
});
