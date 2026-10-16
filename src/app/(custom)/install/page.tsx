// @polsia:user-owned — metadata shell for the public TraceGlass install page.

import type { Metadata } from 'next';
import { ExistingPageSurface } from '@/components/custom/marketing/existing-page-surface';

export const metadata: Metadata = {
  title: 'Install TraceGlass — coming soon',
  description:
    'TraceGlass installers are not published yet. Join the waitlist to hear when local-first CI log triage is ready.',
  alternates: { canonical: '/install' },
};

export default function InstallPage() {
  return <ExistingPageSurface sourceKey="install" />;
}
