-- CreateTable
CREATE TABLE "forms" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subheading" TEXT,
    "successMessage" TEXT NOT NULL DEFAULT 'Thank you! Your message has been sent successfully.',
    "errorMessage" TEXT NOT NULL DEFAULT 'Sorry, there was an error. Please try again.',
    "ctaText" TEXT NOT NULL DEFAULT 'Send Message',
    "ctaIcon" TEXT,
    "ctaStyle" TEXT NOT NULL DEFAULT 'primary',
    "ctaSize" TEXT NOT NULL DEFAULT 'large',
    "ctaWidth" TEXT NOT NULL DEFAULT 'auto',
    "ctaLoadingText" TEXT NOT NULL DEFAULT 'Sending...',
    "enableCaptcha" BOOLEAN NOT NULL DEFAULT true,
    "captchaType" TEXT NOT NULL DEFAULT 'math',
    "captchaDifficulty" TEXT NOT NULL DEFAULT 'medium',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "form_fields" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "formId" INTEGER NOT NULL,
    "fieldType" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "placeholder" TEXT,
    "helpText" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "fieldOptions" TEXT,
    "fieldWidth" TEXT NOT NULL DEFAULT 'full',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "form_fields_formId_fkey" FOREIGN KEY ("formId") REFERENCES "forms" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "form_submissions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "formId" INTEGER NOT NULL,
    "formData" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isSpam" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "form_submissions_formId_fkey" FOREIGN KEY ("formId") REFERENCES "forms" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    CONSTRAINT "page_sections_formId_fkey" FOREIGN KEY ("formId") REFERENCES "forms" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_page_sections" ("contactSectionId", "content", "createdAt", "faqCategoryId", "faqSectionId", "featureGroupId", "heroSectionId", "id", "isVisible", "mediaSectionId", "pageId", "pricingSectionId", "sectionType", "sortOrder", "subtitle", "title", "updatedAt") SELECT "contactSectionId", "content", "createdAt", "faqCategoryId", "faqSectionId", "featureGroupId", "heroSectionId", "id", "isVisible", "mediaSectionId", "pageId", "pricingSectionId", "sectionType", "sortOrder", "subtitle", "title", "updatedAt" FROM "page_sections";
DROP TABLE "page_sections";
ALTER TABLE "new_page_sections" RENAME TO "page_sections";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
