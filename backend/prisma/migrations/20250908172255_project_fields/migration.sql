/*
  Warnings:

  - The `price` column on the `projects` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `size` column on the `projects` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `unit` column on the `projects` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "projects" DROP COLUMN "price",
ADD COLUMN     "price" INTEGER,
DROP COLUMN "size",
ADD COLUMN     "size" INTEGER,
DROP COLUMN "unit",
ADD COLUMN     "unit" INTEGER;
