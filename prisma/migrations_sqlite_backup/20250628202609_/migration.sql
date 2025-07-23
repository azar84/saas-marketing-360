/*
  Warnings:

  - You are about to drop the column `featuresLayout` on the `media_sections` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_media_sections" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "layoutType" TEXT NOT NULL DEFAULT 'media_right',
    "badgeText" TEXT,
    "badgeColor" TEXT NOT NULL DEFAULT '#5243E9',
    "headline" TEXT NOT NULL,
    "subheading" TEXT,
    "alignment" TEXT NOT NULL DEFAULT 'left',
    "mediaType" TEXT NOT NULL DEFAULT 'image',
    "mediaUrl" TEXT,
    "mediaAlt" TEXT,
    "mediaSize" TEXT NOT NULL DEFAULT 'md',
    "mediaPosition" TEXT NOT NULL DEFAULT 'right',
    "showBadge" BOOLEAN NOT NULL DEFAULT true,
    "showCtaButton" BOOLEAN NOT NULL DEFAULT false,
    "ctaText" TEXT,
    "ctaUrl" TEXT,
    "ctaStyle" TEXT NOT NULL DEFAULT 'primary',
    "enableScrollAnimations" BOOLEAN NOT NULL DEFAULT false,
    "animationType" TEXT NOT NULL DEFAULT 'none',
    "backgroundStyle" TEXT NOT NULL DEFAULT 'solid',
    "backgroundColor" TEXT NOT NULL DEFAULT '#F6F8FC',
    "textColor" TEXT NOT NULL DEFAULT '#0F1A2A',
    "paddingTop" INTEGER NOT NULL DEFAULT 80,
    "paddingBottom" INTEGER NOT NULL DEFAULT 80,
    "containerMaxWidth" TEXT NOT NULL DEFAULT '2xl',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_media_sections" ("alignment", "animationType", "backgroundColor", "backgroundStyle", "badgeColor", "badgeText", "containerMaxWidth", "createdAt", "ctaStyle", "ctaText", "ctaUrl", "enableScrollAnimations", "headline", "id", "isActive", "layoutType", "mediaAlt", "mediaPosition", "mediaSize", "mediaType", "mediaUrl", "paddingBottom", "paddingTop", "position", "showBadge", "showCtaButton", "subheading", "textColor", "updatedAt") SELECT "alignment", "animationType", "backgroundColor", "backgroundStyle", "badgeColor", "badgeText", "containerMaxWidth", "createdAt", "ctaStyle", "ctaText", "ctaUrl", "enableScrollAnimations", "headline", "id", "isActive", "layoutType", "mediaAlt", "mediaPosition", "mediaSize", "mediaType", "mediaUrl", "paddingBottom", "paddingTop", "position", "showBadge", "showCtaButton", "subheading", "textColor", "updatedAt" FROM "media_sections";
DROP TABLE "media_sections";
ALTER TABLE "new_media_sections" RENAME TO "media_sections";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
