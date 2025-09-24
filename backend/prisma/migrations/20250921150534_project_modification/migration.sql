/*
  Warnings:

  - You are about to drop the column `branch_id` on the `projects` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_branch_id_fkey";

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "branch_id";
