/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `industries` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `industries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."cities" ADD COLUMN     "countryCode" TEXT,
ADD COLUMN     "featureClass" TEXT,
ADD COLUMN     "featureCode" TEXT,
ADD COLUMN     "stateCode" TEXT;

-- AlterTable
ALTER TABLE "public"."industries" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "description" TEXT;

-- CreateIndex
CREATE INDEX "cities_featureClass_idx" ON "public"."cities"("featureClass");

-- CreateIndex
CREATE INDEX "cities_featureCode_idx" ON "public"."cities"("featureCode");

-- CreateIndex
CREATE INDEX "cities_countryCode_idx" ON "public"."cities"("countryCode");

-- CreateIndex
CREATE UNIQUE INDEX "industries_code_key" ON "public"."industries"("code");
