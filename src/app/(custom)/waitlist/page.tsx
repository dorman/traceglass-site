// @polsia:user-owned — metadata shell for the public TraceGlass launch waitlist page.
import type { Metadata } from 'next';
import { ExistingPageSurface } from '@/components/custom/marketing/existing-page-surface';

export const metadata: Metadata = {
  title: 'TraceGlass launch waitlist',
  description:
    'Join the TraceGlass launch waitlist. Local-first log triage for support specialists — one email at public launch around mid-November 2026. Not early access.',
  alternates: { canonical: '/waitlist' },
  openGraph: {
    title: 'TraceGlass launch waitlist',
    description:
      'Join the TraceGlass launch waitlist. Local-first log triage for support specialists — one email at public launch around mid-November 2026. Not early access.',
    url: '/waitlist',
  },
};

export default function WaitlistPage() {
  return <ExistingPageSurface sourceKey="waitlist" />;
}
