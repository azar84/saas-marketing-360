-- CreateTable
CREATE TABLE "naics_classifications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sectorCode" TEXT,
    "sectorTitle" TEXT,
    "subsectorCode" TEXT,
    "subsectorTitle" TEXT,
    "industryGroupCode" TEXT,
    "industryGroupTitle" TEXT,
    "industryCode" TEXT,
    "industryTitle" TEXT,
    "nationalIndustryCode" TEXT,
    "nationalIndustryTitle" TEXT,
    "title" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "naics_aliases" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "aliasCode" TEXT NOT NULL,
    "mapsTo" TEXT NOT NULL,
    "note" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "naics_changes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code2017" TEXT NOT NULL,
    "title2017" TEXT NOT NULL,
    "code2022" TEXT NOT NULL,
    "title2022" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'official_concordance',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "company_naics_classifications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" INTEGER NOT NULL,
    "naicsClassificationId" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "confidence" REAL DEFAULT 1.0,
    "source" TEXT,
    "verifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "company_naics_classifications_naicsClassificationId_fkey" FOREIGN KEY ("naicsClassificationId") REFERENCES "naics_classifications" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "naics_classifications_sectorCode_idx" ON "naics_classifications"("sectorCode");

-- CreateIndex
CREATE INDEX "naics_classifications_subsectorCode_idx" ON "naics_classifications"("subsectorCode");

-- CreateIndex
CREATE INDEX "naics_classifications_industryGroupCode_idx" ON "naics_classifications"("industryGroupCode");

-- CreateIndex
CREATE INDEX "naics_classifications_industryCode_idx" ON "naics_classifications"("industryCode");

-- CreateIndex
CREATE INDEX "naics_classifications_nationalIndustryCode_idx" ON "naics_classifications"("nationalIndustryCode");

-- CreateIndex
CREATE UNIQUE INDEX "naics_classifications_nationalIndustryCode_key" ON "naics_classifications"("nationalIndustryCode");

-- CreateIndex
CREATE UNIQUE INDEX "naics_aliases_aliasCode_key" ON "naics_aliases"("aliasCode");

-- CreateIndex
CREATE INDEX "naics_changes_code2017_idx" ON "naics_changes"("code2017");

-- CreateIndex
CREATE INDEX "naics_changes_code2022_idx" ON "naics_changes"("code2022");

-- CreateIndex
CREATE INDEX "company_naics_classifications_companyId_idx" ON "company_naics_classifications"("companyId");

-- CreateIndex
CREATE INDEX "company_naics_classifications_isPrimary_idx" ON "company_naics_classifications"("isPrimary");

-- CreateIndex
CREATE UNIQUE INDEX "company_naics_classifications_companyId_naicsClassificationId_key" ON "company_naics_classifications"("companyId", "naicsClassificationId");
