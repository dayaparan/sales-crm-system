-- CreateTable
CREATE TABLE "lead_timelines" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" TEXT,

    CONSTRAINT "lead_timelines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lead_timelines_lead_id_idx" ON "lead_timelines"("lead_id");

-- CreateIndex
CREATE INDEX "lead_timelines_created_by_id_idx" ON "lead_timelines"("created_by_id");

-- AddForeignKey
ALTER TABLE "lead_timelines" ADD CONSTRAINT "lead_timelines_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_timelines" ADD CONSTRAINT "lead_timelines_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
