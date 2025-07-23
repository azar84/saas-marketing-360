-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_site_settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "smtpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "smtpHost" TEXT,
    "smtpPort" INTEGER DEFAULT 587,
    "smtpSecure" BOOLEAN NOT NULL DEFAULT true,
    "smtpUsername" TEXT,
    "smtpPassword" TEXT,
    "smtpFromEmail" TEXT,
    "smtpFromName" TEXT,
    "smtpReplyTo" TEXT,
    "emailSignature" TEXT,
    "emailFooterText" TEXT,
    "emailBrandingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "adminNotificationEmail" TEXT,
    "emailLoggingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailRateLimitPerHour" INTEGER DEFAULT 100,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_site_settings" ("createdAt", "faviconUrl", "id", "logoUrl", "updatedAt") SELECT "createdAt", "faviconUrl", "id", "logoUrl", "updatedAt" FROM "site_settings";
DROP TABLE "site_settings";
ALTER TABLE "new_site_settings" RENAME TO "site_settings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
