/*
  Warnings:

  - You are about to drop the column `user_id` on the `branches` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "branches" DROP CONSTRAINT "branches_user_id_fkey";

-- DropIndex
DROP INDEX "branches_user_id_idx";

-- AlterTable
ALTER TABLE "branches" DROP COLUMN "user_id",
ADD COLUMN     "created_by_id" TEXT;

-- CreateIndex
CREATE INDEX "branches_created_by_id_idx" ON "branches"("created_by_id");

-- CreateIndex
CREATE INDEX "branches_manager_id_idx" ON "branches"("manager_id");

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
