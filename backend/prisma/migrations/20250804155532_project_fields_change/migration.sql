/*
  Warnings:

  - Made the column `name` on table `projects` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "operational_date" TIMESTAMP(3),
ADD COLUMN     "possession_year" INTEGER,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "total_acres" DOUBLE PRECISION,
ADD COLUMN     "total_units" INTEGER,
ALTER COLUMN "name" SET NOT NULL;
