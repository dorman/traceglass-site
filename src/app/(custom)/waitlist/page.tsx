// @polsia:user-owned — metadata shell for the public TraceGlass launch waitlist page.
import type { Metadata } from 'next';
import { ExistingPageSurface } from '@/components/custom/marketing/existing-page-surface';

const title = 'TraceGlass launch waitlist';
const description =
  "Join the TraceGlass waitlist to hear when it's ready. Local-first CI log triage for developers and on-call engineers.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/waitlist' },
  openGraph: {
    title,
    description,
    url: '/waitlist',
  },
  twitter: {
    title,
    description,
  },
};

export default function WaitlistPage() {
  return <ExistingPageSurface sourceKey="waitlist" />;
}
