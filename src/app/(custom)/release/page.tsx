// @polsia:user-owned — metadata shell for the public release notes page.
import type { Metadata } from 'next';
import { ExistingPageSurface } from '@/components/custom/marketing/existing-page-surface';

export const metadata: Metadata = {
  title: 'Release status — TraceGlass',
  description:
    'TraceGlass is preparing for a public launch around mid-November 2026. Join the waitlist for one email when installers are available.',
  alternates: { canonical: '/release' },
};

export default function ReleasePage() {
  return <ExistingPageSurface sourceKey="release" />;
}
