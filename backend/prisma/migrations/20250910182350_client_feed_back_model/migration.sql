-- CreateTable
CREATE TABLE "client_feedbacks" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "professionalism" INTEGER NOT NULL,
    "communication" INTEGER NOT NULL,
    "market_knowledge" INTEGER NOT NULL,
    "comments" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "client_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "client_feedbacks_lead_id_idx" ON "client_feedbacks"("lead_id");

-- AddForeignKey
ALTER TABLE "client_feedbacks" ADD CONSTRAINT "client_feedbacks_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
