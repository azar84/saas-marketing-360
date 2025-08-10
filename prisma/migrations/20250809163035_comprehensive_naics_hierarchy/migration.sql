/*
  Warnings:

  - You are about to drop the column `industryCode` on the `naics_classifications` table. All the data in the column will be lost.
  - You are about to drop the column `industryGroupCode` on the `naics_classifications` table. All the data in the column will be lost.
  - You are about to drop the column `industryGroupTitle` on the `naics_classifications` table. All the data in the column will be lost.
  - You are about to drop the column `industryTitle` on the `naics_classifications` table. All the data in the column will be lost.
  - You are about to drop the column `nationalIndustryCode` on the `naics_classifications` table. All the data in the column will be lost.
  - You are about to drop the column `nationalIndustryTitle` on the `naics_classifications` table. All the data in the column will be lost.
  - You are about to drop the column `sectorCode` on the `naics_classifications` table. All the data in the column will be lost.
  - You are about to drop the column `sectorTitle` on the `naics_classifications` table. All the data in the column will be lost.
  - You are about to drop the column `subsectorCode` on the `naics_classifications` table. All the data in the column will be lost.
  - You are about to drop the column `subsectorTitle` on the `naics_classifications` table. All the data in the column will be lost.
  - Added the required column `code` to the `naics_classifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `naics_classifications` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_naics_classifications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "parentCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "naics_classifications_parentCode_fkey" FOREIGN KEY ("parentCode") REFERENCES "naics_classifications" ("code") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_naics_classifications" ("createdAt", "id", "isActive", "title", "updatedAt") SELECT "createdAt", "id", "isActive", "title", "updatedAt" FROM "naics_classifications";
DROP TABLE "naics_classifications";
ALTER TABLE "new_naics_classifications" RENAME TO "naics_classifications";
CREATE UNIQUE INDEX "naics_classifications_code_key" ON "naics_classifications"("code");
CREATE INDEX "naics_classifications_code_idx" ON "naics_classifications"("code");
CREATE INDEX "naics_classifications_level_idx" ON "naics_classifications"("level");
CREATE INDEX "naics_classifications_parentCode_idx" ON "naics_classifications"("parentCode");
CREATE INDEX "naics_classifications_title_idx" ON "naics_classifications"("title");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
