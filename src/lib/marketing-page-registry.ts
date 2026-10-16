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
    body: 'TraceGlass is local-first CI log triage for developers and on-call engineers. Open a failed GitHub Actions log offline, jump to the first error candidate, fold setup noise, and compare with your last green run.',
    seoDescription:
      'Local-first CI log triage for developers and on-call engineers. Open failed GitHub Actions logs offline — first error candidate, last-green compare.',
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
    body: "TraceGlass installers are not published yet. Join the waitlist to hear when it's ready.",
    seoDescription:
      "TraceGlass installers are coming soon. Join the waitlist to hear when local-first CI log triage is ready.",
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
    body: "TraceGlass is preparing local-first GitHub Actions log triage. Join the waitlist to hear when it's ready.",
    seoDescription:
      "TraceGlass release status: join the waitlist to hear when local-first CI log triage is ready.",
    content: getDefaultMarketingPageContent('release'),
  },
  {
    id: 'marketing-signatures',
    sourceKey: 'signatures',
    sourcePath: '/signatures',
    templateKey: 'signatures',
    slug: 'signatures',
    legacySlugs: [],
    title: 'Product direction',
    body: "TraceGlass is focused on local-first CI log triage for GitHub Actions. Join the waitlist to hear when it's ready.",
    seoDescription:
      "TraceGlass product direction: local-first GitHub Actions log triage. Join the waitlist to hear when it's ready.",
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
    body: "Join the TraceGlass waitlist to hear when local-first CI log triage is ready.",
    seoDescription:
      "Join the TraceGlass waitlist to hear when it's ready. Local-first CI log triage for developers and on-call engineers.",
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
