-- CreateTable
CREATE TABLE "business_directory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "website" TEXT NOT NULL,
    "companyName" TEXT,
    "city" TEXT,
    "stateProvince" TEXT,
    "phoneNumber" TEXT,
    "email" TEXT,
    "employeesCount" INTEGER,
    "contactPersonId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "business_directory_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES "contact_persons" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "contact_persons" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "title" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "business_directory_city_idx" ON "business_directory"("city");

-- CreateIndex
CREATE INDEX "business_directory_stateProvince_idx" ON "business_directory"("stateProvince");

-- CreateIndex
CREATE INDEX "business_directory_isActive_idx" ON "business_directory"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "business_directory_website_key" ON "business_directory"("website");

-- CreateIndex
CREATE INDEX "contact_persons_firstName_lastName_idx" ON "contact_persons"("firstName", "lastName");

-- CreateIndex
CREATE INDEX "contact_persons_isActive_idx" ON "contact_persons"("isActive");
