-- CreateTable
CREATE TABLE "faq_section_categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "faqSectionId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "faq_section_categories_faqSectionId_fkey" FOREIGN KEY ("faqSectionId") REFERENCES "faq_sections" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "faq_section_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "faq_categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "faq_section_categories_faqSectionId_categoryId_key" ON "faq_section_categories"("faqSectionId", "categoryId");
