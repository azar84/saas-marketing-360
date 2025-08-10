-- AlterTable
ALTER TABLE "business_directory" ADD COLUMN "country" TEXT;

-- CreateTable
CREATE TABLE "business_industries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "businessId" INTEGER NOT NULL,
    "industryId" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "business_industries_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_directory" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "business_industries_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "industries" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "business_industries_businessId_idx" ON "business_industries"("businessId");

-- CreateIndex
CREATE INDEX "business_industries_industryId_idx" ON "business_industries"("industryId");

-- CreateIndex
CREATE UNIQUE INDEX "business_industries_businessId_industryId_key" ON "business_industries"("businessId", "industryId");

-- CreateIndex
CREATE INDEX "business_directory_country_idx" ON "business_directory"("country");
