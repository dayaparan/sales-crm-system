/*
  Warnings:

  - Added the required column `ownership_type` to the `sales_models` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usage_rights` to the `sales_models` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OwnershipType" AS ENUM ('FULL', 'FRACTIONAL', 'LEASE', 'TIMESHARE');

-- CreateEnum
CREATE TYPE "UsageRights" AS ENUM ('EXCLUSIVE', 'SHARED', 'LIMITED');

-- AlterTable
ALTER TABLE "sales_models" ADD COLUMN     "buyback_terms" TEXT,
ADD COLUMN     "guaranteed_roi_percent" DOUBLE PRECISION,
ADD COLUMN     "min_investment_lakhs" DOUBLE PRECISION,
ADD COLUMN     "ownership_type" "OwnershipType" NOT NULL,
ADD COLUMN     "profit_share_percent" DOUBLE PRECISION,
ADD COLUMN     "usage_rights" "UsageRights" NOT NULL;

-- CreateIndex
CREATE INDEX "sales_models_ownership_type_idx" ON "sales_models"("ownership_type");
