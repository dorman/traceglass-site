// @polsia:user-owned — public published marketing page API.
import 'server-only';

import { MarketingPageStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { PublicPage } from '@/lib/contracts/pages';
import { isDatabaseConfigured } from '@/lib/env';
import { normalizeMarketingPageContent } from '@/lib/marketing-page-content';
import {
  type ExistingMarketingPage,
  findExistingMarketingPage,
} from '@/lib/marketing-page-registry';

type RouteContext = { params: Promise<{ slug: string }> };

export const dynamic = 'force-dynamic';

/** In-repo defaults so marketing pages render without Postgres. */
function publicPageFromTemplate(template: ExistingMarketingPage) {
  return PublicPage.parse({
    id: template.id,
    title: template.title,
    slug: template.slug,
    body: template.body,
    seoDescription: template.seoDescription,
    content: template.content,
    // Stable published timestamp for static registry content.
    publishedAt: '2026-01-01T00:00:00.000Z',
    sourceKey: template.sourceKey,
    sourcePath: template.sourcePath,
    templateKey: template.templateKey,
  });
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const template = findExistingMarketingPage(slug);

  if (isDatabaseConfigured()) {
    try {
      const { prisma } = await import('@/lib/db');
      const aliases = template
        ? [template.sourceKey, template.sourcePath, template.slug, ...template.legacySlugs]
        : [slug];
      const page = await prisma.marketingPage.findFirst({
        where: {
          status: MarketingPageStatus.PUBLISHED,
          OR: [
            { slug },
            ...aliases.map((alias) => ({ sourceKey: alias })),
            ...aliases.map((alias) => ({ sourcePath: alias })),
          ],
        },
      });
      if (page?.publishedAt) {
        return NextResponse.json(
          PublicPage.parse({
            id: page.id,
            title: page.title,
            slug: page.slug,
            body: page.body,
            seoDescription: page.seoDescription,
            content: normalizeMarketingPageContent({
              title: page.title,
              body: page.body,
              seoDescription: page.seoDescription,
              templateKey: page.templateKey,
              sourceKey: page.sourceKey,
              content: page.content,
            }),
            publishedAt: page.publishedAt.toISOString(),
            sourceKey: page.sourceKey,
            sourcePath: page.sourcePath,
            templateKey: page.templateKey,
          }),
        );
      }
    } catch {
      // Fall through to the in-repo registry when Postgres is unreachable.
    }
  }

  if (template) {
    return NextResponse.json(publicPageFromTemplate(template));
  }

  return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}
