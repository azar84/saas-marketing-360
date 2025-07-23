-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_header_nav_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "headerConfigId" INTEGER NOT NULL,
    "pageId" INTEGER,
    "label" TEXT NOT NULL,
    "customText" TEXT,
    "customUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "header_nav_items_headerConfigId_fkey" FOREIGN KEY ("headerConfigId") REFERENCES "header_config" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "header_nav_items_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_header_nav_items" ("createdAt", "headerConfigId", "id", "isVisible", "label", "pageId", "sortOrder", "updatedAt") SELECT "createdAt", "headerConfigId", "id", "isVisible", "label", "pageId", "sortOrder", "updatedAt" FROM "header_nav_items";
DROP TABLE "header_nav_items";
ALTER TABLE "new_header_nav_items" RENAME TO "header_nav_items";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
