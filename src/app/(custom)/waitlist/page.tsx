// @polsia:user-owned — metadata shell for the public TraceGlass launch waitlist page.
import type { Metadata } from 'next';
import { ExistingPageSurface } from '@/components/custom/marketing/existing-page-surface';

export const metadata: Metadata = {
  title: 'TraceGlass launch waitlist',
  description:
    'Join the TraceGlass waitlist for early access. Local-first CI log triage for developers and on-call engineers.',
  alternates: { canonical: '/waitlist' },
  openGraph: {
    title: 'TraceGlass launch waitlist',
    description:
      'Join the TraceGlass waitlist for early access. Local-first CI log triage for developers and on-call engineers.',
    url: '/waitlist',
  },
};

export default function WaitlistPage() {
  return <ExistingPageSurface sourceKey="waitlist" />;
}
