-- CreateTable
CREATE TABLE "company_sub_industries" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "subIndustryId" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_sub_industries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_sub_industries_companyId_subIndustryId_key" ON "company_sub_industries"("companyId", "subIndustryId");

-- CreateIndex
CREATE INDEX "company_sub_industries_companyId_idx" ON "company_sub_industries"("companyId");

-- CreateIndex
CREATE INDEX "company_sub_industries_subIndustryId_idx" ON "company_sub_industries"("subIndustryId");

-- AddForeignKey
ALTER TABLE "company_sub_industries" ADD CONSTRAINT "company_sub_industries_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_sub_industries" ADD CONSTRAINT "company_sub_industries_subIndustryId_fkey" FOREIGN KEY ("subIndustryId") REFERENCES "sub_industries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
