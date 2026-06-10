-- AlterTable
ALTER TABLE "tickets_emitidos" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';

-- CreateIndex
CREATE INDEX "tickets_emitidos_status_idx" ON "tickets_emitidos"("status");
