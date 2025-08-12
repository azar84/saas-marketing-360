-- DropForeignKey
ALTER TABLE "public"."business_directory" DROP CONSTRAINT "business_directory_contactPersonId_fkey";

-- AlterTable
ALTER TABLE "public"."business_directory" ADD COLUMN     "address" TEXT,
ADD COLUMN     "categories" TEXT[],
ADD COLUMN     "confidence" DOUBLE PRECISION,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "extractedAt" TIMESTAMP(3),
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'manual',
ADD COLUMN     "state" TEXT;

-- AlterTable
ALTER TABLE "public"."contact_persons" ADD COLUMN     "businessId" INTEGER,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "public"."_BusinessDirectoryToContactPerson" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_BusinessDirectoryToContactPerson_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BusinessDirectoryToContactPerson_B_index" ON "public"."_BusinessDirectoryToContactPerson"("B");

-- AddForeignKey
ALTER TABLE "public"."contact_persons" ADD CONSTRAINT "contact_persons_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."business_directory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_BusinessDirectoryToContactPerson" ADD CONSTRAINT "_BusinessDirectoryToContactPerson_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."business_directory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_BusinessDirectoryToContactPerson" ADD CONSTRAINT "_BusinessDirectoryToContactPerson_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."contact_persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
