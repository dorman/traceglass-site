// @polsia:user-owned — public About page for TraceGlass.
import type { Metadata } from 'next';
import { AboutContent } from '@/components/custom/about-content';

const title = 'About TraceGlass';
const description =
  'TraceGlass is local-first CI log triage for developers and on-call engineers. Open failed GitHub Actions logs offline.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/about' },
  openGraph: {
    title,
    description,
    url: '/about',
  },
  twitter: {
    title,
    description,
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
