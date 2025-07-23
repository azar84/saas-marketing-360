/*
  Warnings:

  - You are about to drop the column `description` on the `media_section_features` table. All the data in the column will be lost.
  - You are about to drop the column `iconUrl` on the `media_section_features` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `media_section_features` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `media_section_features` table. All the data in the column will be lost.
  - Added the required column `label` to the `media_section_features` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "plan_pricing" ADD COLUMN "ctaUrl" TEXT;

-- AlterTable
ALTER TABLE "plans" ADD COLUMN "ctaText" TEXT DEFAULT 'Get Started';

-- AlterTable
ALTER TABLE "pricing_sections" ADD COLUMN "comparisonTableBackgroundColor" TEXT DEFAULT '#F9FAFB';
ALTER TABLE "pricing_sections" ADD COLUMN "pricingCardsBackgroundColor" TEXT DEFAULT '#FFFFFF';

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_media_section_features" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mediaSectionId" INTEGER NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'MessageSquare',
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#5243E9',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "media_section_features_mediaSectionId_fkey" FOREIGN KEY ("mediaSectionId") REFERENCES "media_sections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_media_section_features" ("createdAt", "id", "mediaSectionId", "updatedAt") SELECT "createdAt", "id", "mediaSectionId", "updatedAt" FROM "media_section_features";
DROP TABLE "media_section_features";
ALTER TABLE "new_media_section_features" RENAME TO "media_section_features";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
