/*
  Warnings:

  - You are about to drop the column `breakDown` on the `projects` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "projects" DROP COLUMN "breakDown",
ADD COLUMN     "break_down" TEXT;

-- CreateTable
CREATE TABLE "lead_closings" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "sale_price" DOUBLE PRECISION NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL,
    "closing_date" TIMESTAMP(3),
    "docs" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "lead_closings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lead_closings_lead_id_idx" ON "lead_closings"("lead_id");

-- CreateIndex
CREATE INDEX "lead_closings_project_id_idx" ON "lead_closings"("project_id");

-- AddForeignKey
ALTER TABLE "lead_closings" ADD CONSTRAINT "lead_closings_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_closings" ADD CONSTRAINT "lead_closings_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
