-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_forms" (
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
    "ctaBackgroundColor" TEXT,
    "ctaTextColor" TEXT,
    "ctaBorderColor" TEXT,
    "ctaHoverBackgroundColor" TEXT,
    "ctaHoverTextColor" TEXT,
    "redirectUrl" TEXT,
    "emailNotification" BOOLEAN NOT NULL DEFAULT false,
    "emailRecipients" TEXT,
    "webhookUrl" TEXT,
    "enableCaptcha" BOOLEAN NOT NULL DEFAULT true,
    "captchaType" TEXT NOT NULL DEFAULT 'math',
    "captchaDifficulty" TEXT NOT NULL DEFAULT 'medium',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_forms" ("captchaDifficulty", "captchaType", "createdAt", "ctaIcon", "ctaLoadingText", "ctaSize", "ctaStyle", "ctaText", "ctaWidth", "enableCaptcha", "errorMessage", "id", "isActive", "name", "subheading", "successMessage", "title", "updatedAt") SELECT "captchaDifficulty", "captchaType", "createdAt", "ctaIcon", "ctaLoadingText", "ctaSize", "ctaStyle", "ctaText", "ctaWidth", "enableCaptcha", "errorMessage", "id", "isActive", "name", "subheading", "successMessage", "title", "updatedAt" FROM "forms";
DROP TABLE "forms";
ALTER TABLE "new_forms" RENAME TO "forms";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
