-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "branch_id" TEXT;

-- AlterTable
ALTER TABLE "sales_models" ADD COLUMN     "branch_id" TEXT;

-- AlterTable
ALTER TABLE "unit_types" ADD COLUMN     "branch_id" TEXT;

-- AddForeignKey
ALTER TABLE "sales_models" ADD CONSTRAINT "sales_models_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_types" ADD CONSTRAINT "unit_types_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
