// @polsia:user-owned — public read-only access to the validated site appearance.
import 'server-only';

import { NextResponse } from 'next/server';
import {
  DEFAULT_SITE_DESIGN,
  resolveSiteDesign,
  SITE_DESIGN_SINGLETON_ID,
  SiteDesignResponse,
} from '@/lib/contracts/site-design';
import { isDatabaseConfigured } from '@/lib/env';

export const dynamic = 'force-dynamic';

function defaultDesignResponse() {
  return NextResponse.json(
    SiteDesignResponse.parse({
      design: DEFAULT_SITE_DESIGN,
      updatedAt: null,
    }),
  );
}

export async function GET() {
  if (!isDatabaseConfigured()) {
    return defaultDesignResponse();
  }

  try {
    const { prisma } = await import('@/lib/db');
    const record = await prisma.siteDesign.findUnique({
      where: { id: SITE_DESIGN_SINGLETON_ID },
      select: { settings: true, updatedAt: true },
    });
    return NextResponse.json(
      SiteDesignResponse.parse({
        design: resolveSiteDesign(record?.settings),
        updatedAt: record?.updatedAt.toISOString() ?? null,
      }),
    );
  } catch {
    return defaultDesignResponse();
  }
}
