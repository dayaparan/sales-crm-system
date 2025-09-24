/*
  Warnings:

  - You are about to drop the column `account_type` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `role_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `address` to the `branches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `branches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `branches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `branches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `branches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `branches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `branches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timezone` to the `branches` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'AGENT');

-- DropForeignKey
ALTER TABLE "roles" DROP CONSTRAINT "roles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_fkey";

-- DropIndex
DROP INDEX "users_role_id_idx";

-- AlterTable
ALTER TABLE "branches" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "timezone" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "account_type",
DROP COLUMN "role_id",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'ADMIN';

-- DropTable
DROP TABLE "roles";
