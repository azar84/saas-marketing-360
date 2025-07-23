-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_home_page_hero" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tagline" TEXT,
    "headline" TEXT NOT NULL,
    "subheading" TEXT,
    "ctaPrimaryId" INTEGER,
    "ctaSecondaryId" INTEGER,
    "ctaPrimaryText" TEXT,
    "ctaPrimaryUrl" TEXT,
    "ctaSecondaryText" TEXT,
    "ctaSecondaryUrl" TEXT,
    "mediaUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "home_page_hero_ctaPrimaryId_fkey" FOREIGN KEY ("ctaPrimaryId") REFERENCES "ctas" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "home_page_hero_ctaSecondaryId_fkey" FOREIGN KEY ("ctaSecondaryId") REFERENCES "ctas" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_home_page_hero" ("createdAt", "ctaPrimaryText", "ctaPrimaryUrl", "ctaSecondaryText", "ctaSecondaryUrl", "headline", "id", "isActive", "mediaUrl", "subheading", "tagline", "updatedAt") SELECT "createdAt", "ctaPrimaryText", "ctaPrimaryUrl", "ctaSecondaryText", "ctaSecondaryUrl", "headline", "id", "isActive", "mediaUrl", "subheading", "tagline", "updatedAt" FROM "home_page_hero";
DROP TABLE "home_page_hero";
ALTER TABLE "new_home_page_hero" RENAME TO "home_page_hero";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
