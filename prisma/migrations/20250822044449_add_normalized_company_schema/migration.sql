-- CreateTable
CREATE TABLE "public"."companies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "baseUrl" TEXT,
    "description" TEXT,
    "slug" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."company_addresses" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'HQ',
    "fullAddress" TEXT,
    "streetAddress" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "stateProvince" TEXT,
    "country" TEXT,
    "zipPostalCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."company_contacts" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT,
    "value" TEXT NOT NULL,
    "contactPage" TEXT,
    "description" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."company_socials" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT,
    "handle" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_socials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."company_technologies" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "category" TEXT,
    "name" TEXT NOT NULL,
    "version" TEXT,
    "firstDetected" TIMESTAMP(3),
    "lastDetected" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_technologies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."company_services" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."company_staff" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "title" TEXT,
    "department" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "linkedinUrl" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."company_industry_relations" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "industryId" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_industry_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."company_financials" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "fundingStatus" TEXT,
    "revenueModel" TEXT,
    "profitability" TEXT,
    "fundingRounds" JSONB,
    "investors" JSONB,
    "boardMembers" JSONB,
    "advisors" JSONB,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_financials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."company_hiring" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "isHiring" BOOLEAN NOT NULL DEFAULT false,
    "openPositions" JSONB,
    "hiringFocus" JSONB,
    "benefits" JSONB,
    "companyCulture" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_hiring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."company_intelligence" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "businessModel" TEXT,
    "growthStage" TEXT,
    "marketPosition" TEXT,
    "partnerships" JSONB,
    "certifications" JSONB,
    "confidenceScore" DOUBLE PRECISION,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_intelligence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."company_enrichments" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "mode" TEXT,
    "pagesScraped" INTEGER NOT NULL DEFAULT 0,
    "totalPagesFound" INTEGER NOT NULL DEFAULT 0,
    "rawData" JSONB,
    "scrapedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_enrichments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_website_key" ON "public"."companies"("website");

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "public"."companies"("slug");

-- CreateIndex
CREATE INDEX "companies_name_idx" ON "public"."companies"("name");

-- CreateIndex
CREATE INDEX "companies_website_idx" ON "public"."companies"("website");

-- CreateIndex
CREATE INDEX "companies_isActive_idx" ON "public"."companies"("isActive");

-- CreateIndex
CREATE INDEX "companies_createdAt_idx" ON "public"."companies"("createdAt");

-- CreateIndex
CREATE INDEX "company_addresses_companyId_idx" ON "public"."company_addresses"("companyId");

-- CreateIndex
CREATE INDEX "company_addresses_type_idx" ON "public"."company_addresses"("type");

-- CreateIndex
CREATE INDEX "company_addresses_city_idx" ON "public"."company_addresses"("city");

-- CreateIndex
CREATE INDEX "company_addresses_country_idx" ON "public"."company_addresses"("country");

-- CreateIndex
CREATE INDEX "company_contacts_companyId_idx" ON "public"."company_contacts"("companyId");

-- CreateIndex
CREATE INDEX "company_contacts_type_idx" ON "public"."company_contacts"("type");

-- CreateIndex
CREATE INDEX "company_contacts_isPrimary_idx" ON "public"."company_contacts"("isPrimary");

-- CreateIndex
CREATE INDEX "company_socials_companyId_idx" ON "public"."company_socials"("companyId");

-- CreateIndex
CREATE INDEX "company_socials_platform_idx" ON "public"."company_socials"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "company_socials_companyId_platform_key" ON "public"."company_socials"("companyId", "platform");

-- CreateIndex
CREATE INDEX "company_technologies_companyId_idx" ON "public"."company_technologies"("companyId");

-- CreateIndex
CREATE INDEX "company_technologies_category_idx" ON "public"."company_technologies"("category");

-- CreateIndex
CREATE INDEX "company_technologies_name_idx" ON "public"."company_technologies"("name");

-- CreateIndex
CREATE INDEX "company_services_companyId_idx" ON "public"."company_services"("companyId");

-- CreateIndex
CREATE INDEX "company_services_category_idx" ON "public"."company_services"("category");

-- CreateIndex
CREATE INDEX "company_staff_companyId_idx" ON "public"."company_staff"("companyId");

-- CreateIndex
CREATE INDEX "company_staff_email_idx" ON "public"."company_staff"("email");

-- CreateIndex
CREATE INDEX "company_staff_isPrimary_idx" ON "public"."company_staff"("isPrimary");

-- CreateIndex
CREATE INDEX "company_industry_relations_companyId_idx" ON "public"."company_industry_relations"("companyId");

-- CreateIndex
CREATE INDEX "company_industry_relations_industryId_idx" ON "public"."company_industry_relations"("industryId");

-- CreateIndex
CREATE UNIQUE INDEX "company_industry_relations_companyId_industryId_key" ON "public"."company_industry_relations"("companyId", "industryId");

-- CreateIndex
CREATE UNIQUE INDEX "company_financials_companyId_key" ON "public"."company_financials"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "company_hiring_companyId_key" ON "public"."company_hiring"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "company_intelligence_companyId_key" ON "public"."company_intelligence"("companyId");

-- CreateIndex
CREATE INDEX "company_enrichments_companyId_idx" ON "public"."company_enrichments"("companyId");

-- CreateIndex
CREATE INDEX "company_enrichments_source_idx" ON "public"."company_enrichments"("source");

-- CreateIndex
CREATE INDEX "company_enrichments_processedAt_idx" ON "public"."company_enrichments"("processedAt");

-- AddForeignKey
ALTER TABLE "public"."company_addresses" ADD CONSTRAINT "company_addresses_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_contacts" ADD CONSTRAINT "company_contacts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_socials" ADD CONSTRAINT "company_socials_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_technologies" ADD CONSTRAINT "company_technologies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_services" ADD CONSTRAINT "company_services_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_staff" ADD CONSTRAINT "company_staff_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_industry_relations" ADD CONSTRAINT "company_industry_relations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_industry_relations" ADD CONSTRAINT "company_industry_relations_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "public"."industries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_financials" ADD CONSTRAINT "company_financials_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_hiring" ADD CONSTRAINT "company_hiring_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_intelligence" ADD CONSTRAINT "company_intelligence_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_enrichments" ADD CONSTRAINT "company_enrichments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
