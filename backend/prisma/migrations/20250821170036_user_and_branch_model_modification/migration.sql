/*
  Warnings:

  - You are about to drop the column `manager_id` on the `branches` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `branches` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "branches" DROP CONSTRAINT "branches_manager_id_fkey";

-- DropForeignKey
ALTER TABLE "branches" DROP CONSTRAINT "branches_user_id_fkey";

-- DropIndex
DROP INDEX "branches_manager_id_idx";

-- DropIndex
DROP INDEX "branches_user_id_idx";

-- AlterTable
ALTER TABLE "branches" DROP COLUMN "manager_id",
DROP COLUMN "user_id",
ADD COLUMN     "created_by_id" TEXT;

-- CreateTable
CREATE TABLE "branch_managers" (
    "branch_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "branch_managers_pkey" PRIMARY KEY ("branch_id","user_id")
);

-- CreateTable
CREATE TABLE "_BranchManagers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BranchManagers_AB_unique" ON "_BranchManagers"("A", "B");

-- CreateIndex
CREATE INDEX "_BranchManagers_B_index" ON "_BranchManagers"("B");

-- CreateIndex
CREATE INDEX "branches_created_by_id_idx" ON "branches"("created_by_id");

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_managers" ADD CONSTRAINT "branch_managers_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_managers" ADD CONSTRAINT "branch_managers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BranchManagers" ADD CONSTRAINT "_BranchManagers_A_fkey" FOREIGN KEY ("A") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BranchManagers" ADD CONSTRAINT "_BranchManagers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
