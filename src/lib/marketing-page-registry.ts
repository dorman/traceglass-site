// @polsia:user-owned — stable identity and template baselines for existing routes.

export type ExistingMarketingPage = {
  id: string;
  sourceKey: string;
  sourcePath: string;
  templateKey: string;
  slug: string;
  legacySlugs: string[];
  title: string;
  body: string;
  seoDescription: string;
  content: import('@/lib/contracts/pages').PageContent;
};

import { getDefaultMarketingPageContent } from '@/lib/marketing-page-content';

export const existingMarketingPages: readonly ExistingMarketingPage[] = [
  {
    id: 'marketing-home',
    sourceKey: 'home',
    sourcePath: '/',
    templateKey: 'home',
    slug: 'home',
    legacySlugs: [],
    title: 'TraceGlass',
    body: 'TraceGlass highlights the log lines that matter with a local watchlist and curated built-in signatures, then stays entirely local.',
    seoDescription:
      'A local-first Rust CLI for local keyword and regex highlights, curated built-in signature findings, and CI-ready log review. No AI or network access required.',
    content: getDefaultMarketingPageContent('home'),
  },
  {
    id: 'marketing-install',
    sourceKey: 'install',
    sourcePath: '/install',
    templateKey: 'install',
    slug: 'install',
    legacySlugs: [],
    title: 'Install TraceGlass',
    body: 'TraceGlass installers arrive at the public launch around mid-November 2026. Join the waitlist for one email when they are available.',
    seoDescription:
      'TraceGlass installers are coming soon. Join the waitlist for one email at the public launch around mid-November 2026.',
    content: getDefaultMarketingPageContent('install'),
  },
  {
    id: 'marketing-release',
    sourceKey: 'release',
    sourcePath: '/release',
    templateKey: 'release',
    slug: 'release',
    legacySlugs: [],
    title: 'TraceGlass release status',
    body: 'TraceGlass is preparing for a public launch around mid-November 2026. Join the waitlist for one email when it is available.',
    seoDescription:
      'TraceGlass release status: public launch around mid-November 2026. Join the waitlist for one email when installers ship.',
    content: getDefaultMarketingPageContent('release'),
  },
  {
    id: 'marketing-signatures',
    sourceKey: 'signatures',
    sourcePath: '/signatures',
    templateKey: 'signatures',
    slug: 'signatures',
    legacySlugs: [],
    title: 'Signature library',
    body: 'Preview the open-source signature sets that ship with TraceGlass.',
    seoDescription:
      'Preview the open-source TraceGlass signature library for search errors, Windows events, and antivirus alerts.',
    content: getDefaultMarketingPageContent('signatures'),
  },
  {
    id: 'marketing-waitlist',
    sourceKey: 'waitlist',
    sourcePath: '/waitlist',
    templateKey: 'waitlist',
    slug: 'waitlist',
    legacySlugs: [],
    title: 'TraceGlass launch waitlist',
    body: 'Join the TraceGlass launch waitlist for one email when the local-first log triage tool is publicly available around mid-November 2026.',
    seoDescription:
      'Join the TraceGlass launch waitlist. Local-first log triage for support specialists — one email at public launch around mid-November 2026. Not early access.',
    content: getDefaultMarketingPageContent('waitlist'),
  },
];

export function findExistingMarketingPage(key: string) {
  return existingMarketingPages.find(
    (page) =>
      page.sourceKey === key ||
      page.sourcePath === key ||
      page.slug === key ||
      page.legacySlugs.includes(key),
  );
}
