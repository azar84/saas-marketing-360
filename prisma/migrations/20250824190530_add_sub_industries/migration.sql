-- DropForeignKey
ALTER TABLE "public"."_BusinessDirectoryToContactPerson" DROP CONSTRAINT "_BusinessDirectoryToContactPerson_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_BusinessDirectoryToContactPerson" DROP CONSTRAINT "_BusinessDirectoryToContactPerson_B_fkey";

-- AddForeignKey
ALTER TABLE "public"."_BusinessDirectoryToContactPerson" ADD CONSTRAINT "_BusinessDirectoryToContactPerson_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."contact_persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_BusinessDirectoryToContactPerson" ADD CONSTRAINT "_BusinessDirectoryToContactPerson_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."business_directory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
