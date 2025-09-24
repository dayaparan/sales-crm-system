/*
  Warnings:

  - The `status` column on the `leads` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `priority` column on the `leads` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `purpose` column on the `leads` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `permission` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `users` table. All the data in the column will be lost.
  - The `account_type` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `name` on table `branches` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `lead_source` on the `leads` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `preferred_channel` on the `leads` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `timeframe` on the `leads` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `budget_range` on the `leads` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `occupation` on the `leads` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `name` on table `payment_plans` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `roles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `sales_models` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `territories` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `unit_types` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_user_id_fkey";

-- AlterTable
ALTER TABLE "branches" ALTER COLUMN "name" SET NOT NULL;

-- AlterTable
ALTER TABLE "leads" DROP COLUMN "lead_source",
ADD COLUMN     "lead_source" "LeadSource" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
DROP COLUMN "priority",
ADD COLUMN     "priority" "LeadPriority" NOT NULL DEFAULT 'COLD',
DROP COLUMN "preferred_channel",
ADD COLUMN     "preferred_channel" "PreferredChannel" NOT NULL,
DROP COLUMN "timeframe",
ADD COLUMN     "timeframe" "Timeframe" NOT NULL,
DROP COLUMN "budget_range",
ADD COLUMN     "budget_range" "BudgetRange" NOT NULL,
DROP COLUMN "purpose",
ADD COLUMN     "purpose" "Purpose"[] DEFAULT ARRAY[]::"Purpose"[],
DROP COLUMN "occupation",
ADD COLUMN     "occupation" "Occupation" NOT NULL;

-- AlterTable
ALTER TABLE "payment_plans" ALTER COLUMN "name" SET NOT NULL;

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "permission",
ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "name" SET NOT NULL;

-- AlterTable
ALTER TABLE "sales_models" ALTER COLUMN "name" SET NOT NULL;

-- AlterTable
ALTER TABLE "territories" ALTER COLUMN "name" SET NOT NULL;

-- AlterTable
ALTER TABLE "unit_types" ADD COLUMN     "available_units" INTEGER,
ADD COLUMN     "base_price_lakhs" DOUBLE PRECISION,
ADD COLUMN     "fine_acres_eligible" BOOLEAN,
ADD COLUMN     "project_id" TEXT,
ADD COLUMN     "property_type_eligible" TEXT,
ADD COLUMN     "size_sqft" DOUBLE PRECISION,
ADD COLUMN     "total_units" INTEGER,
ALTER COLUMN "name" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "user_id",
DROP COLUMN "account_type",
ADD COLUMN     "account_type" "AccountType" NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE INDEX "api_logs_timestamp_idx" ON "api_logs"("timestamp");

-- CreateIndex
CREATE INDEX "api_logs_status_code_idx" ON "api_logs"("status_code");

-- CreateIndex
CREATE INDEX "branches_user_id_idx" ON "branches"("user_id");

-- CreateIndex
CREATE INDEX "branches_status_idx" ON "branches"("status");

-- CreateIndex
CREATE INDEX "leads_user_id_idx" ON "leads"("user_id");

-- CreateIndex
CREATE INDEX "leads_branch_id_idx" ON "leads"("branch_id");

-- CreateIndex
CREATE INDEX "leads_territory_id_idx" ON "leads"("territory_id");

-- CreateIndex
CREATE INDEX "leads_project_id_idx" ON "leads"("project_id");

-- CreateIndex
CREATE INDEX "leads_unit_type_id_idx" ON "leads"("unit_type_id");

-- CreateIndex
CREATE INDEX "leads_sales_model_id_idx" ON "leads"("sales_model_id");

-- CreateIndex
CREATE INDEX "leads_payment_plan_id_idx" ON "leads"("payment_plan_id");

-- CreateIndex
CREATE INDEX "leads_assigned_to_id_idx" ON "leads"("assigned_to_id");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "payment_plans_user_id_idx" ON "payment_plans"("user_id");

-- CreateIndex
CREATE INDEX "payment_plans_status_idx" ON "payment_plans"("status");

-- CreateIndex
CREATE INDEX "projects_user_id_idx" ON "projects"("user_id");

-- CreateIndex
CREATE INDEX "projects_city_idx" ON "projects"("city");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "roles_user_id_idx" ON "roles"("user_id");

-- CreateIndex
CREATE INDEX "roles_status_idx" ON "roles"("status");

-- CreateIndex
CREATE INDEX "sales_models_user_id_idx" ON "sales_models"("user_id");

-- CreateIndex
CREATE INDEX "sales_models_status_idx" ON "sales_models"("status");

-- CreateIndex
CREATE INDEX "territories_user_id_idx" ON "territories"("user_id");

-- CreateIndex
CREATE INDEX "territories_branch_id_idx" ON "territories"("branch_id");

-- CreateIndex
CREATE INDEX "territories_status_idx" ON "territories"("status");

-- CreateIndex
CREATE INDEX "unit_types_user_id_idx" ON "unit_types"("user_id");

-- CreateIndex
CREATE INDEX "unit_types_project_id_idx" ON "unit_types"("project_id");

-- CreateIndex
CREATE INDEX "unit_types_status_idx" ON "unit_types"("status");

-- CreateIndex
CREATE INDEX "users_role_id_idx" ON "users"("role_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- AddForeignKey
ALTER TABLE "unit_types" ADD CONSTRAINT "unit_types_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
