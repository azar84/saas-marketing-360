/*
  Warnings:

  - You are about to drop the column `category` on the `faqs` table. All the data in the column will be lost.
  - You are about to drop the column `heading` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `subheading` on the `plans` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "faq_categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT NOT NULL DEFAULT '#5243E9',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "contact_sections" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "subheading" TEXT,
    "successMessage" TEXT NOT NULL DEFAULT 'Thank you for your message! We''ll get back to you soon.',
    "errorMessage" TEXT NOT NULL DEFAULT 'Sorry, there was an error sending your message. Please try again.',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "contact_fields" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contactSectionId" INTEGER NOT NULL,
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
    CONSTRAINT "contact_fields_contactSectionId_fkey" FOREIGN KEY ("contactSectionId") REFERENCES "contact_sections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "contact_email_settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contactSectionId" INTEGER NOT NULL,
    "smtpHost" TEXT NOT NULL,
    "smtpPort" INTEGER NOT NULL DEFAULT 587,
    "smtpUsername" TEXT NOT NULL,
    "smtpPassword" TEXT NOT NULL,
    "smtpSecure" BOOLEAN NOT NULL DEFAULT true,
    "fromEmail" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "toEmail" TEXT NOT NULL,
    "ccEmail" TEXT,
    "bccEmail" TEXT,
    "replyToEmail" TEXT,
    "emailSubject" TEXT NOT NULL DEFAULT 'New Contact Form Submission',
    "emailTemplate" TEXT,
    "autoRespond" BOOLEAN NOT NULL DEFAULT false,
    "autoRespondSubject" TEXT,
    "autoRespondTemplate" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "contact_email_settings_contactSectionId_fkey" FOREIGN KEY ("contactSectionId") REFERENCES "contact_sections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "contact_submissions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contactSectionId" INTEGER NOT NULL,
    "formData" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isSpam" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "contact_submissions_contactSectionId_fkey" FOREIGN KEY ("contactSectionId") REFERENCES "contact_sections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_faqs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoryId" INTEGER,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "faqs_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "faq_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_faqs" ("answer", "createdAt", "id", "isActive", "question", "sortOrder", "updatedAt") SELECT "answer", "createdAt", "id", "isActive", "question", "sortOrder", "updatedAt" FROM "faqs";
DROP TABLE "faqs";
ALTER TABLE "new_faqs" RENAME TO "faqs";
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
    "faqCategoryId" INTEGER,
    "contactSectionId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "page_sections_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "page_sections_heroSectionId_fkey" FOREIGN KEY ("heroSectionId") REFERENCES "hero_sections" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "page_sections_featureGroupId_fkey" FOREIGN KEY ("featureGroupId") REFERENCES "feature_groups" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "page_sections_mediaSectionId_fkey" FOREIGN KEY ("mediaSectionId") REFERENCES "media_sections" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "page_sections_pricingSectionId_fkey" FOREIGN KEY ("pricingSectionId") REFERENCES "pricing_sections" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "page_sections_faqCategoryId_fkey" FOREIGN KEY ("faqCategoryId") REFERENCES "faq_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "page_sections_contactSectionId_fkey" FOREIGN KEY ("contactSectionId") REFERENCES "contact_sections" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_page_sections" ("content", "createdAt", "featureGroupId", "heroSectionId", "id", "isVisible", "mediaSectionId", "pageId", "pricingSectionId", "sectionType", "sortOrder", "subtitle", "title", "updatedAt") SELECT "content", "createdAt", "featureGroupId", "heroSectionId", "id", "isVisible", "mediaSectionId", "pageId", "pricingSectionId", "sectionType", "sortOrder", "subtitle", "title", "updatedAt" FROM "page_sections";
DROP TABLE "page_sections";
ALTER TABLE "new_page_sections" RENAME TO "page_sections";
CREATE TABLE "new_plans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_plans" ("createdAt", "description", "id", "isActive", "isPopular", "name", "position", "updatedAt") SELECT "createdAt", "description", "id", "isActive", "isPopular", "name", "position", "updatedAt" FROM "plans";
DROP TABLE "plans";
ALTER TABLE "new_plans" RENAME TO "plans";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "contact_email_settings_contactSectionId_key" ON "contact_email_settings"("contactSectionId");
