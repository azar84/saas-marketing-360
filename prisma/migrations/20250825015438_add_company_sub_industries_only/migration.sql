/*
  Warnings:

  - You are about to drop the `company_sub_industries` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."company_sub_industries" DROP CONSTRAINT "company_sub_industries_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."company_sub_industries" DROP CONSTRAINT "company_sub_industries_subIndustryId_fkey";

-- DropTable
DROP TABLE "public"."company_sub_industries";
