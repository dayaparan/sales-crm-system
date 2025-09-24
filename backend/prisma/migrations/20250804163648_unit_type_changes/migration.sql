/*
  Warnings:

  - You are about to drop the column `permissions` on the `roles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "roles" DROP COLUMN "permissions",
ADD COLUMN     "permission" TEXT[] DEFAULT ARRAY[]::TEXT[];
