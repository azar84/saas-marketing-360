-- CreateTable
CREATE TABLE "public"."sub_industries" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "industryId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_industries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sub_industries_name_industryId_key" ON "public"."sub_industries"("name", "industryId");

-- CreateIndex
CREATE INDEX "sub_industries_industryId_idx" ON "public"."sub_industries"("industryId");

-- CreateIndex
CREATE INDEX "sub_industries_isActive_idx" ON "public"."sub_industries"("isActive");

-- AddForeignKey
ALTER TABLE "public"."sub_industries" ADD CONSTRAINT "sub_industries_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "public"."industries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
