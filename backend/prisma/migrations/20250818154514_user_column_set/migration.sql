/*
  Warnings:

  - You are about to drop the column `created_by_id` on the `branches` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "branches" DROP CONSTRAINT "branches_created_by_id_fkey";

-- DropIndex
DROP INDEX "branches_created_by_id_idx";

-- AlterTable
ALTER TABLE "branches" DROP COLUMN "created_by_id",
ADD COLUMN     "user_id" TEXT;

-- CreateIndex
CREATE INDEX "branches_user_id_idx" ON "branches"("user_id");

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
