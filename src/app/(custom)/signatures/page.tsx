// @polsia:user-owned — metadata shell for the public signature library preview.

import type { Metadata } from 'next';
import { ExistingPageSurface } from '@/components/custom/marketing/existing-page-surface';

export const metadata: Metadata = {
  title: 'Product direction — TraceGlass',
  description:
    'TraceGlass is focused on local-first CI log triage for GitHub Actions. Join the waitlist for early access.',
  alternates: { canonical: '/signatures' },
};

export default function SignaturesPage() {
  return <ExistingPageSurface sourceKey="signatures" />;
}
