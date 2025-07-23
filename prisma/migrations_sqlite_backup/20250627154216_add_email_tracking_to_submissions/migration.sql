-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_form_submissions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "formId" INTEGER NOT NULL,
    "formData" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isSpam" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "emailStatus" TEXT NOT NULL DEFAULT 'not_configured',
    "emailMessageId" TEXT,
    "emailRecipients" TEXT,
    "emailSubject" TEXT,
    "emailSentAt" DATETIME,
    "emailError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "form_submissions_formId_fkey" FOREIGN KEY ("formId") REFERENCES "forms" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_form_submissions" ("createdAt", "formData", "formId", "id", "ipAddress", "isRead", "isSpam", "notes", "referrer", "updatedAt", "userAgent") SELECT "createdAt", "formData", "formId", "id", "ipAddress", "isRead", "isSpam", "notes", "referrer", "updatedAt", "userAgent" FROM "form_submissions";
DROP TABLE "form_submissions";
ALTER TABLE "new_form_submissions" RENAME TO "form_submissions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
