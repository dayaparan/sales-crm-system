-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "anniversary" TIMESTAMP(3),
ADD COLUMN     "dob" TIMESTAMP(3),
ADD COLUMN     "investmentModel" TIMESTAMP(3),
ADD COLUMN     "referred_by" TEXT;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_referred_by_fkey" FOREIGN KEY ("referred_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
