-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_faq_sections" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "subheading" TEXT,
    "heroTitle" TEXT NOT NULL,
    "heroSubtitle" TEXT,
    "searchPlaceholder" TEXT NOT NULL DEFAULT 'Enter your keyword here',
    "showHero" BOOLEAN NOT NULL DEFAULT true,
    "showCategories" BOOLEAN NOT NULL DEFAULT true,
    "backgroundColor" TEXT NOT NULL DEFAULT '#f8fafc',
    "heroBackgroundColor" TEXT NOT NULL DEFAULT '#6366f1',
    "heroHeight" TEXT NOT NULL DEFAULT '80vh',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_faq_sections" ("backgroundColor", "createdAt", "heading", "heroBackgroundColor", "heroSubtitle", "heroTitle", "id", "isActive", "name", "searchPlaceholder", "showCategories", "showHero", "subheading", "updatedAt") SELECT "backgroundColor", "createdAt", "heading", "heroBackgroundColor", "heroSubtitle", "heroTitle", "id", "isActive", "name", "searchPlaceholder", "showCategories", "showHero", "subheading", "updatedAt" FROM "faq_sections";
DROP TABLE "faq_sections";
ALTER TABLE "new_faq_sections" RENAME TO "faq_sections";
CREATE UNIQUE INDEX "faq_sections_name_key" ON "faq_sections"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
