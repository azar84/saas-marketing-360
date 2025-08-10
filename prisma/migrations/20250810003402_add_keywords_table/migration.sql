-- CreateTable
CREATE TABLE "keywords" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "searchTerm" TEXT NOT NULL,
    "industryId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "keywords_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "industries" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "keywords_industryId_idx" ON "keywords"("industryId");

-- CreateIndex
CREATE INDEX "keywords_searchTerm_idx" ON "keywords"("searchTerm");

-- CreateIndex
CREATE INDEX "keywords_isActive_idx" ON "keywords"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "keywords_searchTerm_industryId_key" ON "keywords"("searchTerm", "industryId");
