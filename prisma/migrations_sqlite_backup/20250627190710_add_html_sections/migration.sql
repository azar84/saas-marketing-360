-- CreateTable
CREATE TABLE "html_sections" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "htmlContent" TEXT NOT NULL,
    "cssContent" TEXT,
    "jsContent" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "page_html_sections" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pageId" INTEGER NOT NULL,
    "htmlSectionId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "page_html_sections_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "page_html_sections_htmlSectionId_fkey" FOREIGN KEY ("htmlSectionId") REFERENCES "html_sections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_page_sections" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pageId" INTEGER NOT NULL,
    "sectionType" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "content" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "heroSectionId" INTEGER,
    "featureGroupId" INTEGER,
    "mediaSectionId" INTEGER,
    "pricingSectionId" INTEGER,
    "faqSectionId" INTEGER,
    "faqCategoryId" INTEGER,
    "contactSectionId" INTEGER,
    "formId" INTEGER,
    "htmlSectionId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "page_sections_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "page_sections_heroSectionId_fkey" FOREIGN KEY ("heroSectionId") REFERENCES "hero_sections" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "page_sections_featureGroupId_fkey" FOREIGN KEY ("featureGroupId") REFERENCES "feature_groups" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "page_sections_mediaSectionId_fkey" FOREIGN KEY ("mediaSectionId") REFERENCES "media_sections" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "page_sections_pricingSectionId_fkey" FOREIGN KEY ("pricingSectionId") REFERENCES "pricing_sections" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "page_sections_faqSectionId_fkey" FOREIGN KEY ("faqSectionId") REFERENCES "faq_sections" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "page_sections_faqCategoryId_fkey" FOREIGN KEY ("faqCategoryId") REFERENCES "faq_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "page_sections_contactSectionId_fkey" FOREIGN KEY ("contactSectionId") REFERENCES "contact_sections" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "page_sections_formId_fkey" FOREIGN KEY ("formId") REFERENCES "forms" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "page_sections_htmlSectionId_fkey" FOREIGN KEY ("htmlSectionId") REFERENCES "html_sections" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_page_sections" ("contactSectionId", "content", "createdAt", "faqCategoryId", "faqSectionId", "featureGroupId", "formId", "heroSectionId", "id", "isVisible", "mediaSectionId", "pageId", "pricingSectionId", "sectionType", "sortOrder", "subtitle", "title", "updatedAt") SELECT "contactSectionId", "content", "createdAt", "faqCategoryId", "faqSectionId", "featureGroupId", "formId", "heroSectionId", "id", "isVisible", "mediaSectionId", "pageId", "pricingSectionId", "sectionType", "sortOrder", "subtitle", "title", "updatedAt" FROM "page_sections";
DROP TABLE "page_sections";
ALTER TABLE "new_page_sections" RENAME TO "page_sections";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "page_html_sections_pageId_htmlSectionId_key" ON "page_html_sections"("pageId", "htmlSectionId");
