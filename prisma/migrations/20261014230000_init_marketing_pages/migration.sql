-- Marketing pages + site design (app-owned; required for seeded home content).

CREATE TYPE "MarketingPageStatus" AS ENUM ('DRAFT', 'PUBLISHED');

CREATE TABLE "MarketingPage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "seoDescription" TEXT NOT NULL,
    "content" JSONB,
    "status" "MarketingPageStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "sourceKey" TEXT,
    "sourcePath" TEXT,
    "templateKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingPage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketingPageDraft" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "seoDescription" TEXT NOT NULL,
    "content" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingPageDraft_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SiteDesign" (
    "id" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteDesign_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MarketingPage_slug_key" ON "MarketingPage"("slug");
CREATE INDEX "MarketingPage_sourceKey_idx" ON "MarketingPage"("sourceKey");
CREATE UNIQUE INDEX "MarketingPageDraft_pageId_key" ON "MarketingPageDraft"("pageId");

ALTER TABLE "MarketingPageDraft" ADD CONSTRAINT "MarketingPageDraft_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "MarketingPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
