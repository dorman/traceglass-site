// @polsia:user-owned — public About page for TraceGlass.
import type { Metadata } from 'next';
import { AboutContent } from '@/components/custom/about-content';

const title = 'About TraceGlass';
const description =
  'TraceGlass is a local-first log triage tool for support specialists. A Rust engine ranks signals on your machine — your logs are never uploaded. Public launch around mid-November 2026.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/about' },
  openGraph: {
    title,
    description,
    url: '/about',
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
