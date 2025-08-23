-- CreateTable
CREATE TABLE "public"."company_urls" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "path" TEXT,
    "title" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'discovered',
    "statusCode" INTEGER,
    "contentType" TEXT,
    "contentLength" INTEGER,
    "lastScraped" TIMESTAMP(3),
    "scrapedCount" INTEGER NOT NULL DEFAULT 0,
    "isInternal" BOOLEAN NOT NULL DEFAULT true,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_urls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "company_urls_companyId_idx" ON "public"."company_urls"("companyId");

-- CreateIndex
CREATE INDEX "company_urls_status_idx" ON "public"."company_urls"("status");

-- CreateIndex
CREATE INDEX "company_urls_isInternal_idx" ON "public"."company_urls"("isInternal");

-- CreateIndex
CREATE INDEX "company_urls_depth_idx" ON "public"."company_urls"("depth");

-- CreateIndex
CREATE INDEX "company_urls_discoveredAt_idx" ON "public"."company_urls"("discoveredAt");

-- CreateIndex
CREATE UNIQUE INDEX "company_urls_companyId_url_key" ON "public"."company_urls"("companyId", "url");

-- AddForeignKey
ALTER TABLE "public"."company_urls" ADD CONSTRAINT "company_urls_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
