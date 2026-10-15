// @polsia:user-owned — metadata shell for the public TraceGlass install page.

import type { Metadata } from 'next';
import { ExistingPageSurface } from '@/components/custom/marketing/existing-page-surface';

export const metadata: Metadata = {
  title: 'Install TraceGlass — coming soon',
  description:
    'TraceGlass installers arrive at the public launch around mid-November 2026. Join the waitlist for one email when they are available.',
  alternates: { canonical: '/install' },
};

export default function InstallPage() {
  return <ExistingPageSurface sourceKey="install" />;
}
