// @polsia:user-owned — metadata shell for the public release notes page.
import type { Metadata } from 'next';
import { ExistingPageSurface } from '@/components/custom/marketing/existing-page-surface';

export const metadata: Metadata = {
  title: 'Release status — TraceGlass',
  description:
    'TraceGlass release status: join the waitlist for early access to local-first CI log triage.',
  alternates: { canonical: '/release' },
};

export default function ReleasePage() {
  return <ExistingPageSurface sourceKey="release" />;
}
