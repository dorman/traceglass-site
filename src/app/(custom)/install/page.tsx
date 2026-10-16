// @polsia:user-owned — metadata shell for the public TraceGlass install page.

import type { Metadata } from 'next';
import { ExistingPageSurface } from '@/components/custom/marketing/existing-page-surface';

export const metadata: Metadata = {
  title: 'Install TraceGlass — coming soon',
  description:
    'TraceGlass installers are not published yet. Join the waitlist for early access to local-first CI log triage.',
  alternates: { canonical: '/install' },
};

export default function InstallPage() {
  return <ExistingPageSurface sourceKey="install" />;
}
